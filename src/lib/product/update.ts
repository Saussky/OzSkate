"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { transformProductsForUpdate, transformProducts } from "./transform";
import { fetchShopifyProducts } from "./fetch";
import { product } from "@prisma/client";

export async function applyVendorRules(): Promise<void> {
  const rules = await prisma.vendorRule.findMany();

  for (const rule of rules) {
    await prisma.product.updateMany({
      where: {
        vendor: {
          contains: rule.vendorPattern,
          mode: 'insensitive',
        },
      },
      data: {
        vendor: rule.standardVendor,
      },
    });
  }
}

export async function updateAllProducts(): Promise<{ added: number; priceChanged: number }> {
  let addedCount = 0;
  let priceChangedCount = 0;
  const shops = await prisma.shop.findMany();

 for (const shop of shops) {
    try {
      const result = await processShopUpdates(shop);
      addedCount += result.inserted;
      priceChangedCount += result.priceChanged;
      console.log(`Finished updating products for shop: ${shop.name}`);
    } catch (error) {
      console.error(`Error updating shop ${shop.name}:`, error);
      // TODO: Something with this error
    }
  }

  try {
    await applyVendorRules();
  } catch (error) {
    console.error("Error applying vendor rules:", error);
    // TODO: Again
  }
  
  console.log("All shops processed in updateProducts.");
  return { added: addedCount, priceChanged: priceChangedCount };
}

async function processShopUpdates(shop: any): Promise<{ inserted: number; priceChanged: number }> {
  const baseUrl = `${shop.url}/products.json`;
  const freshProductsRaw = await fetchShopifyProducts(baseUrl);

  if (freshProductsRaw.length === 0) {
    // Optionally handle no products found
    return { inserted: 0, priceChanged: 0 };
  }

  const localUpdatedAtMap = await getLocalProductsBriefMap(shop.id);

  // Get the list of products needing update and count new inserts.
  const { updatedProducts: freshProductsToTransform, insertedCount } =
    await filterUpdatedFreshProducts(freshProductsRaw, localUpdatedAtMap, shop.id);

  if (freshProductsToTransform.length === 0) {
    console.log("No fresh product updates needed.");
    return { inserted: insertedCount, priceChanged: 0 };
  }

  const transformedProducts = await transformProductsForUpdate(freshProductsToTransform);
  const newProductsMap = buildProductsMap(transformedProducts);

  const localProductsFull = await prisma.product.findMany({
    where: { shopId: shop.id },
    include: { variants: true },
  });

  let priceChanged = 0;

  for (const localProduct of localProductsFull) {
    const newProduct = newProductsMap.get(localProduct.id);
    if (!newProduct) {
      // TODO:  Possibly the product was deleted from Shopify
      //TODO: This doesn't catch it, need to find a
      console.log('OI OI \n\n\n OI  OI this item has been deleted... probably  ', localProduct.title, localProduct.shopId)
      continue;
    }

    const didPriceChange: boolean = await updateLocalProduct(localProduct, newProduct);
    if (didPriceChange) {
      priceChanged++;
    }

    const variantsUpdated = await updateVariants({ title: localProduct.title, id: localProduct.id }, localProduct.variants, newProduct.variants ?? []);
    if (variantsUpdated) {
      await markProductOnSale(newProduct);
    }
  }

  return { inserted: insertedCount, priceChanged };
}

// TODO: If multiple variants are on sale? Get the cheapest?
async function markProductOnSale(product: {
  id: string;
  variants: Array<{ id: string; compareAtPrice: number | null }>;
}): Promise<void> {
  const onSaleVariant = product.variants.find((variant) => variant.compareAtPrice !== null);
  const onSale = !!onSaleVariant;
  const onSaleVariantId = onSaleVariant ? onSaleVariant.id : null;

  console.log('marking on sale product: ', product.id)

  await prisma.product.update({
    where: { id: product.id },
    data: {
      onSale,
      on_sale_variant_id: onSaleVariantId,
    },
  });
}

async function getLocalProductsBriefMap(shopId: number): Promise<Map<string, Date>> {
  const localProductsBrief = await prisma.product.findMany({
    where: { shopId },
    select: { id: true, updatedAt: true },
  });

  return new Map(localProductsBrief.map((product) => [product.id, product.updatedAt]));
}

async function filterUpdatedFreshProducts(
  freshProductsRaw: any[],
  localUpdatedAtMap: Map<string, Date>,
  shopId: number
): Promise<{ updatedProducts: any[]; insertedCount: number }> {
  const newProducts: any[] = [];

  // Filter to determine which products have updated_at differences.
  const updatedProducts = freshProductsRaw.filter((product) => {
    const localUpdatedAt = localUpdatedAtMap.get(product.id.toString());

    if (!localUpdatedAt) {
      // No product id found, signifies new product
      newProducts.push(product);
      console.log("new product", product.title);
    }

    return new Date(product.updated_at).getTime() !== localUpdatedAt?.getTime();
  });


  const insertedCount = await insertFreshProducts(newProducts, shopId);
  return { updatedProducts, insertedCount };
}

async function insertFreshProducts(freshProductsRaw: any[], shopId: number): Promise<number> {
  const transformedProducts = transformProducts(freshProductsRaw, shopId);
  let count = 0;

  for (const product of transformedProducts) {
    const { variants, ...productData } = product;

    await prisma.product.upsert({
      where: { id: productData.id },
      update: productData,
      create: productData,
    });
    count++;

    if (Array.isArray(variants)) {
      for (const variant of variants) {
        await prisma.variant.upsert({
          where: { id: variant.id },
          update: variant,
          create: {
            ...variant,
            shoeSize: variant.shoeSize || null,
            deckSize: variant.deckSize || null,
          },
        });
      }
    }
  }
  return count;
}

function buildProductsMap(products: any[]): Map<string, any> {
  const map = new Map<string, any>();
  for (const p of products) {
    map.set(p.id, p);
  }
  return map;
}

async function updateLocalProduct(localProduct: any, newProduct: any): Promise<boolean> {
  const productUpdates: Record<string, any> = {};
  let priceChanged = false;

  if (localProduct.cheapestPrice !== newProduct.cheapestPrice) {
    console.log(
      "updating product price of ",
      localProduct.title,
      "from",
      localProduct.cheapestPrice,
      "to",
      newProduct.cheapestPrice
    );
    productUpdates.cheapestPrice = newProduct.cheapestPrice;
    priceChanged = true;
  }

  if (Object.keys(productUpdates).length > 0) {
    await prisma.product.update({
      where: { id: localProduct.id },
      data: productUpdates,
    });
  }
  return priceChanged;
}

/**
 * Update local variants based on the freshly fetched ones.
 * Also updates availability if it has changed.
 * @returns `true` if any variant was updated (price, compareAtPrice, or availability)
 */
async function updateVariants(product: Partial<product>, localVariants: any[], newVariants: any[]): Promise<boolean> {
  let variantsUpdated = false;

  // Build a quick lookup of the new variants by ID
  const newVariantMap = new Map<string, typeof newVariants[0]>();
  for (const v of newVariants) {
    newVariantMap.set(v.id, v);
  }

  for (const localVariant of localVariants) {
    const newVariant = newVariantMap.get(localVariant.id);
    if (!newVariant) continue; // TODO: Also deleted?

    const variantUpdates: Record<string, any> = {};

    if (localVariant.price !== newVariant.price) {
      console.log(
        'updating variant price for',
        product.id + ' ' + product.title + ' ' + localVariant.title,
        'from',
        localVariant.price,
        'to',
        newVariant.price
      );
      variantUpdates.price = newVariant.price;
      variantsUpdated = true;
    }

    if (localVariant.compareAtPrice !== newVariant.compareAtPrice) {
      console.log(
        'updating compareAtPrice for variant',
        product.id + ' ' + product.title + ' ' + localVariant.title,
        'from',
        localVariant.compareAtPrice,
        'to',
        newVariant.compareAtPrice
      );
      variantUpdates.compareAtPrice = newVariant.compareAtPrice;
      variantsUpdated = true;
    }

    if (localVariant.available !== newVariant.available) {
      console.log(
        'updating availability for variant',
        product.id + ' ' + product.title + ' ' + localVariant.title,
        'from',
        localVariant.available,
        'to',
        newVariant.available
      );
      variantUpdates.available = newVariant.available;
      variantsUpdated = true;
    }

    if (Object.keys(variantUpdates).length > 0) {
      await prisma.variant.update({
        where: { id: localVariant.id },
        data: variantUpdates,
      });
    }
  }

  return variantsUpdated;
}
