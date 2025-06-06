/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';
import { prisma } from '@/lib/prisma';
import { transformProductsForUpdate, transformProducts } from './transform';
import { fetchShopifyProducts } from './fetch';
import type {
  product as ProductModel,
  variant as VariantModel,
  shop as ShopModel,
  VendorRule as VendorRuleModel,
} from '@prisma/client';

type ProductWithVariants = ProductModel & { variants: VariantModel[] };

type UpdateSummary = {
  added: number;
  priceChanged: number;
};

type ShopBrief = Pick<ShopModel, 'id' | 'name' | 'url'>;

const log = {
  info: (...messages: unknown[]) => console.log('[ProductSync]', ...messages),
  error: (...messages: unknown[]) =>
    console.error('[ProductSync]', ...messages),
};

/**
 * Apply vendor‐name normalization rules to all products in the DB.
 */
export async function applyVendorRules(): Promise<void> {
  const rules: VendorRuleModel[] = await prisma.vendorRule.findMany();

  for (const rule of rules) {
    await prisma.product.updateMany({
      where: {
        vendor: { contains: rule.vendorPattern, mode: 'insensitive' },
      },
      data: { vendor: rule.standardVendor },
    });
  }

  log.info('Vendor rules applied');
}

/**
 * Fetch, upsert, and clean products for every shop.
 *
 * @returns Counts of newly added products and products whose cheapest price changed.
 */
export async function updateAllProducts(): Promise<UpdateSummary> {
  const shops: ShopBrief[] = await prisma.shop.findMany();
  let addedTotal = 0;
  let priceChangedTotal = 0;

  for (const shop of shops) {
    try {
      const { inserted, priceChanged } = await processShopUpdates(shop);
      addedTotal += inserted;
      priceChangedTotal += priceChanged;
      log.info(`Finished processing shop "${shop.name}"`);
    } catch (error) {
      log.error(`Shop "${shop.name}" failed:`, error);
    }
  }

  try {
    await applyVendorRules();
  } catch (error) {
    log.error('Failed to apply vendor rules:', error);
  }

  return { added: addedTotal, priceChanged: priceChangedTotal };
}

/**
 * Recalculate on-sale flags for every product.
 */
export async function refreshSaleStatuses(): Promise<void> {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      onSale: true,
      on_sale_variant_id: true,
      variants: {
        select: {
          id: true,
          available: true,
          price: true,
          compareAtPrice: true,
        },
      },
    },
  });

  for (const productRecord of products) {
    const eligibleVariants = productRecord.variants.filter(
      (variant) =>
        variant.available &&
        variant.compareAtPrice !== null &&
        variant.price < variant.compareAtPrice
    );

    const cheapestSaleVariant = eligibleVariants.sort(
      (a, b) => a.price - b.price
    )[0];

    const isOnSale = Boolean(cheapestSaleVariant);
    const saleVariantId = cheapestSaleVariant?.id ?? null;

    if (
      productRecord.onSale !== isOnSale ||
      productRecord.on_sale_variant_id !== saleVariantId
    ) {
      await prisma.product.update({
        where: { id: productRecord.id },
        data: {
          onSale: isOnSale,
          on_sale_variant_id: saleVariantId,
        },
      });

      log.info(
        `Sale status updated for "${productRecord.title}" → ${isOnSale}`
      );
    }
  }

  log.info('Sale status refresh complete');
}

/* -------------------------------------------------------------------------- */
/*                               INTERNAL HELPERS                             */
/* -------------------------------------------------------------------------- */

/**
 * Process one shop: fetch products from Shopify, insert new ones,
 * update changed ones, remove deleted ones, and sync variants.
 */
async function processShopUpdates(
  shop: ShopBrief
): Promise<{ inserted: number; priceChanged: number }> {
  const shopUrl = `${shop.url}/products.json`;
  const freshRawProducts: any[] = await fetchShopifyProducts(shopUrl);

  const allFreshIds = new Set(freshRawProducts.map((raw) => raw.id.toString()));

  const localUpdatedAtMap = await getLocalProductsBriefMap(shop.id);

  const { updatedProducts: freshToTransform, insertedCount } =
    await filterUpdatedFreshProducts(
      freshRawProducts,
      localUpdatedAtMap,
      shop.id
    );

  if (freshToTransform.length === 0) {
    log.info(`No updates required for shop "${shop.name}"`);
    return { inserted: insertedCount, priceChanged: 0 };
  }

  const transformedProducts = await transformProductsForUpdate(
    freshToTransform
  );
  const freshProductMap = buildProductsMap(transformedProducts);

  const localProducts: ProductWithVariants[] = await prisma.product.findMany({
    where: { shopId: shop.id },
    include: { variants: true },
  });

  let priceChanged = 0;

  for (const localProduct of localProducts) {
    if (!allFreshIds.has(localProduct.id)) {
      await prisma.product.delete({ where: { id: localProduct.id } });
      log.info(`Deleted product "${localProduct.title}" (no longer in feed)`);
      continue;
    }

    const freshProduct = freshProductMap.get(localProduct.id);
    if (!freshProduct) continue;

    if (await updateLocalProduct(localProduct, freshProduct)) {
      priceChanged += 1;
    }

    await updateVariants(
      localProduct,
      localProduct.variants,
      freshProduct.variants ?? []
    );
  }

  return { inserted: insertedCount, priceChanged };
}

/**
 * Return a map of product ID → updatedAt for quick comparison.
 */
async function getLocalProductsBriefMap(
  shopId: number
): Promise<Map<string, Date>> {
  const brief = await prisma.product.findMany({
    where: { shopId },
    select: { id: true, updatedAt: true },
  });

  return new Map(brief.map((p) => [p.id, p.updatedAt]));
}

/**
 * Split fresh products into those that are new and those
 * that need updating.
 */
async function filterUpdatedFreshProducts(
  freshRawProducts: any[],
  localUpdatedAtMap: Map<string, Date>,
  shopId: number
): Promise<{ updatedProducts: any[]; insertedCount: number }> {
  const newProducts: any[] = [];

  const updatedProducts = freshRawProducts.filter((raw) => {
    const localUpdatedAt = localUpdatedAtMap.get(raw.id.toString());

    if (!localUpdatedAt) {
      newProducts.push(raw);
      return true;
    }

    return new Date(raw.updated_at).getTime() !== localUpdatedAt.getTime();
  });

  const insertedCount = await insertFreshProducts(newProducts, shopId);
  return { updatedProducts, insertedCount };
}

/**
 * Insert all products that are entirely new for this shop.
 */
async function insertFreshProducts(
  newRawProducts: any[],
  shopId: number
): Promise<number> {
  const transformed = transformProducts(newRawProducts, shopId);
  let inserted = 0;

  for (const productData of transformed) {
    const { variants, ...coreData } = productData;

    await prisma.product.upsert({
      where: { id: coreData.id },
      update: coreData,
      create: coreData,
    });
    inserted += 1;

    if (Array.isArray(variants)) {
      for (const variantData of variants) {
        await prisma.variant.upsert({
          where: { id: variantData.id },
          update: variantData,
          create: {
            ...variantData,
            shoeSize: variantData.shoeSize ?? null,
            deckSize: variantData.deckSize ?? null,
          },
        });
      }
    }
  }

  if (inserted > 0) {
    log.info(`Inserted ${inserted} new products`);
  }

  return inserted;
}

/**
 * Build a quick lookup of products by ID.
 */
function buildProductsMap(products: any[]): Map<string, any> {
  const map = new Map<string, any>();
  for (const productData of products) {
    map.set(productData.id, productData);
  }
  return map;
}

/**
 * Update a single product's cheapest price if necessary.
 *
 * @returns `true` if the cheapest price changed.
 */
async function updateLocalProduct(
  localProduct: ProductModel,
  freshProduct: any
): Promise<boolean> {
  if (localProduct.cheapestPrice === freshProduct.cheapestPrice) {
    return false;
  }

  await prisma.product.update({
    where: { id: localProduct.id },
    data: { cheapestPrice: freshProduct.cheapestPrice },
  });

  log.info(
    `Price updated for "${localProduct.title}" → ${freshProduct.cheapestPrice}`
  );

  return true;
}

/**
 * Sync variants: delete missing, update changed, insert new,
 * then recalculate the product's cheapest price.
 */
async function updateVariants(
  productRecord: ProductModel,
  localVariants: VariantModel[],
  freshVariants: any[]
): Promise<boolean> {
  let variantsMutated = false;

  const freshMap = new Map<string, (typeof freshVariants)[0]>(
    freshVariants.map((v) => [v.id, v])
  );

  for (const localVariant of localVariants) {
    const freshVariant = freshMap.get(localVariant.id);

    if (!freshVariant) {
      await prisma.variant.delete({ where: { id: localVariant.id } });
      log.info(
        `Deleted variant "${localVariant.title}" (product "${productRecord.title}")`
      );
      variantsMutated = true;
      continue;
    }

    const updates: Partial<VariantModel> = {};

    if (localVariant.available !== freshVariant.available) {
      updates.available = freshVariant.available;
    }
    if (localVariant.price !== freshVariant.price) {
      updates.price = freshVariant.price;
    }
    if (localVariant.compareAtPrice !== freshVariant.compareAtPrice) {
      updates.compareAtPrice = freshVariant.compareAtPrice;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.variant.update({
        where: { id: localVariant.id },
        data: updates,
      });
      variantsMutated = true;
      log.info(
        `Updated variant "${localVariant.title}" (product "${productRecord.title}")`
      );
    }
  }

  // Add any new variants
  for (const freshVariant of freshVariants) {
    if (!localVariants.find((v) => v.id === freshVariant.id)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { productId: _omit, ...data } = freshVariant;

      await prisma.variant.create({
        data: {
          ...data,
          product: { connect: { id: productRecord.id } },
        },
      });
      variantsMutated = true;
      log.info(
        `Added variant "${freshVariant.title}" to product "${productRecord.title}"`
      );
    }
  }

  // Recalculate cheapest price if variants changed
  if (variantsMutated) {
    const { _min } = await prisma.variant.aggregate({
      where: { productId: productRecord.id },
      _min: { price: true },
    });

    const newCheapest = _min.price ?? null;

    if (productRecord.cheapestPrice !== newCheapest) {
      await prisma.product.update({
        where: { id: productRecord.id },
        data: { cheapestPrice: newCheapest },
      });

      log.info(
        `Cheapest price recalculated for "${productRecord.title}" → ${newCheapest}`
      );
    }
  }

  return variantsMutated;
}
