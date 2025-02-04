/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { fetchShopifyProducts } from "@/lib/helpers";
import { transformProducts } from "@/lib/product/transform";

export async function updateAllProducts() { //TODO: Just one shop function
  const shops = await prisma.shop.findMany();

  for (const shop of shops) {
    await processShopUpdates(shop);
    console.log(`Finished updating products for shop: ${shop.name}`);
    break; //TODO: only doing one shop, delete
  }

  console.log("All shops processed in updateProducts.");
}

async function processShopUpdates(shop: any) {
  const baseUrl = `${shop.url}/products.json`;
  // const sinceId = shop.since_id || "0";
  const allProducts = await fetchShopifyProducts(baseUrl); //, { since_id: sinceId }

  if (allProducts.length === 0) {
    // throw new Error("no products found");
  }

  const transformedProducts = transformProducts(allProducts, shop.id);
  const newProductsMap = buildProductsMap(transformedProducts);
  const localProducts = await prisma.product.findMany({
    where: { shopId: shop.id },
    include: { variants: true },
  });

  for (const localProduct of localProducts) {
    const newProduct = newProductsMap.get(localProduct.id);
    if (!newProduct) continue;

    await updateLocalProduct(localProduct, newProduct);
    await updateVariants(localProduct.variants, newProduct.variants ?? []);
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
      variantUpdates.price = newVariant.price;
    }
    if (localVariant.compareAtPrice !== newVariant.compareAtPrice) {
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
