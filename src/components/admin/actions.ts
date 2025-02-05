"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { fetchShopifyProducts } from "@/lib/helpers";
import { transformProducts, transformProductsForUpdate } from "@/lib/product/transform";

export async function updateAllProducts() { //TODO: Just one shop function
  console.log('begin')
  const shops = await prisma.shop.findMany();

  for (const shop of shops) {
    await processShopUpdates(shop);
    console.log(`Finished updating products for shop: ${shop.name}`);
  }

  console.log("All shops processed in updateProducts.");
}

async function processShopUpdates(shop: any) {
  const baseUrl = `${shop.url}/products.json`;
  const freshProductsRaw = await fetchShopifyProducts(baseUrl);

  if (freshProductsRaw.length === 0) {
    // Optionally handle no products found
    return;
  }

  const localUpdatedAtMap = await getLocalProductsBriefMap(shop.id);

  // Filter fresh products that are new or have a differing updated_at timestamp.
  const freshProductsToTransform = filterUpdatedFreshProducts(freshProductsRaw, localUpdatedAtMap, shop.id);

  if (freshProductsToTransform.length === 0) {
    console.log('No fresh product updates needed.');
    return;
  }

  const transformedProducts = await transformProductsForUpdate(freshProductsToTransform);
  const newProductsMap = buildProductsMap(transformedProducts);

  const localProductsFull = await prisma.product.findMany({
    where: { shopId: shop.id },
    include: { variants: true },
  });

  for (const localProduct of localProductsFull) {
    const newProduct = newProductsMap.get(localProduct.id);
    if (!newProduct) {
      // TODO:  Possibly the product was deleted from Shopify
      continue;
    }
    await updateLocalProduct(localProduct, newProduct);
    await updateVariants(localProduct.variants, newProduct.variants ?? []);
  }
}

async function getLocalProductsBriefMap(shopId: number): Promise<Map<string, Date>> {
  const localProductsBrief = await prisma.product.findMany({
    where: { shopId },
    select: { id: true, updatedAt: true },
  });

  return new Map(localProductsBrief.map((product) => [product.id, product.updatedAt]));
}

function filterUpdatedFreshProducts(
  freshProductsRaw: any[],
  localUpdatedAtMap: Map<string, Date>,
  shopId: number,
): any[] {
  const newProducts: any = [];

  const updatedProducts =  freshProductsRaw.filter((product) => {
    const localUpdatedAt = localUpdatedAtMap.get(product.id.toString());

    if (!localUpdatedAt) {
      // No product id found, signifies new product
      newProducts.push(product)
      console.log('new product', product.title)
    }

    return new Date(product.updated_at).getTime() !== localUpdatedAt?.getTime(); // TODO: Should we check the date is greater than? Could see shops/shopify screwing this up somehow
  });

  insertFreshProducts(newProducts, shopId)

  return updatedProducts
}
async function insertFreshProducts(freshProductsRaw: any[], shopId: number) {
  const transformedProducts = await transformProducts(freshProductsRaw, shopId);

  for (const product of transformedProducts) {
    const { variants, ...productData } = product;

    await prisma.product.upsert({
      where: { id: productData.id },
      update: productData,
      create: productData,
    });

    if (Array.isArray(variants)) {
      for (const variant of variants) {
        await prisma.variant.upsert({
          where: { id: variant.id },
          update: variant,
          create: { 
            ...variant, 
            shoeSize: variant.shoeSize || null, 
            deckSize: variant.deckSize || null 
          }
        });
      }
    }
  }
}



function buildProductsMap(products: any[]) {
  const map = new Map<string, any>();
  for (const p of products) {
    map.set(p.id, p);
  }
  return map;
}

async function updateLocalProduct(localProduct: any, newProduct: any) {
  const productUpdates: Record<string, any> = {};

  if (localProduct.cheapestPrice !== newProduct.cheapestPrice) {
    console.log('updating product price of ', localProduct.title, 'from', localProduct.cheapestPrice, 'to', newProduct.cheapestPrice)
    productUpdates.cheapestPrice = newProduct.cheapestPrice;
  }

  if (Object.keys(productUpdates).length > 0) {
    await prisma.product.update({
      where: { id: localProduct.id },
      data: productUpdates,
    });
  }
}

async function updateVariants(localVariants: any[], newVariants: any[]) {
  const newVariantMap = new Map<string, any>();
  for (const variant of newVariants) {
    newVariantMap.set(variant.id, variant);
  }

  for (const localVariant of localVariants) {
    const newVariant = newVariantMap.get(localVariant.id);
    if (!newVariant) continue;

    const variantUpdates: Record<string, any> = {};

    if (localVariant.price !== newVariant.price) {
      console.log('updating variant price') // TODO: Pass product title here
      variantUpdates.price = newVariant.price;
    }
    if (localVariant.compareAtPrice !== newVariant.compareAtPrice) {
      // TODO: This means its on sale, update the product table flag
      // TODO: happens already in transform, see that TODO
      console.log('updating compare at price of variant ', localVariant.title)
      variantUpdates.compareAtPrice = newVariant.compareAtPrice;
    }

    if (Object.keys(variantUpdates).length > 0) {
      await prisma.variant.update({
        where: { id: localVariant.id },
        data: variantUpdates,
      });
    }
  }
}
