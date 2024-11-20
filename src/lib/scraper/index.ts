"use server";
import { fetchPaginatedProducts, transformProducts } from "../helpers";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../prisma"; // Adjust the import path accordingly

export async function processShop(shop: any) {
  console.log(`Processing shop: ${shop.name}`);

  const baseUrl = shop.url;

  // Get since_id from the shop (use "0" if not set)
  const sinceId = shop.since_id || "0";

  // Fetch products
  const allPaginatedProducts = await fetchPaginatedProducts(baseUrl, sinceId);

  if (allPaginatedProducts.length === 0) {
    console.log(`No new products found for shop: ${shop.name}`);
    return;
  }

  // Transform products
  const transformedProducts = transformProducts(allPaginatedProducts, shop.id);

  // Insert products into the database
  for (const product of transformedProducts) {
    // Destructure variants and options from product
    const { variants, options, ...productData } = product;

    // Upsert the product
    await prisma.product.upsert({
      where: { id: productData.id },
      update: productData,
      create: productData,
    });

    // Upsert variants
    for (const variant of variants) {
      await prisma.variant.upsert({
        where: { id: variant.id },
        update: variant,
        create: variant,
      });
    }

    // Upsert options
    for (const option of options) {
      await prisma.option.upsert({
        where: { id: option.id },
        update: option,
        create: option,
      });
    }
  }

  // Update the since_id with the ID of the last product
  const lastProduct = allPaginatedProducts[allPaginatedProducts.length - 1];
  await prisma.skateShop.update({
    where: { id: shop.id },
    data: { since_id: lastProduct.id.toString() },
  });

  console.log(`Finished processing shop: ${shop.name}`);
}
