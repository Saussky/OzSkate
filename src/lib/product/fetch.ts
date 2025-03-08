/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { prisma } from "@/lib/prisma";
import { transformProducts } from "./transform";


export async function fetchAllProducts() {
  try {
    console.log("Starting product import...");

    const shops = await prisma.shop.findMany();

    // for (const shop of shops) {
    //   try {
    //     console.log(`Processing shop: ${shop.name} ${index}/${shops.length}`);
    //     await processShop(shop);
    //   } catch (error) {
    //     console.error(`Error processing shop ${shop.name}:`, error);
    //   }
    // }

    for (let index = 0; index < shops.length; index++) {
      const shop = shops[index];
      try {
        console.log(`Processing shop: ${shop.name} ${index + 1}/${shops.length}`);
        await processShop(shop);
      } catch (error) {
        console.error(`Error processing shop ${shop.name}:`, error);
      }
    }
    
    await markProductsOnSale();
    console.log("Product import completed.");
  } catch (error) {
    console.error("Error fetching all products:", error);
  }
}


export async function processShop(shop: any) {
  const baseUrl = shop.url + '/products.json';
  const sinceId = shop.since_id || "0"; 

  const allProducts = await fetchShopifyProducts(baseUrl, sinceId);

  if (allProducts.length === 0) {
    console.log(`No new products found for shop: ${shop.name}`);
    return;
  }

  const transformedProducts = transformProducts(allProducts, shop.id);

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
          create: {...variant, shoeSize: variant.shoeSize || null, deckSize: variant.deckSize || null }
      });
      }
    }
  }
}


export const fetchShopifyProducts = async (
  baseUrl: string,
  headers: Record<string, string> = {}
) => {
  let allProducts: any[] = [];
  const limit = 250;
  let page = 1;

  while (page < 100) {
    const url = `${baseUrl}?limit=${limit}&page=${page}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0",
        Accept: "application/json",
        ...headers,
      },
      method: "GET",
    });

    if (!res.ok) {
      console.error(`Failed to fetch data from ${url}: ${res.statusText}`);
      break;
    }

    const data: any = await res.json();

    const products = data.products;
    if (!products || products.length === 0) {
      console.log("No more products to fetch.");
      break;
    }

    allProducts = allProducts.concat(products);

    console.log(`Fetched ${products.length} products from page ${page}.`);

    page++;

    // If fewer products than the limit were returned, we've reached the end
    if (products.length < limit) {
      break;
    }
  }

  return allProducts;
};

export const markProductsOnSale = async () => {
  const products = await prisma.product.findMany({
    include: {
      variants: true,
    },
  });

  // TODO: What if multiple variants are on sale??
  for (const product of products) {
    const onSaleVariant = product.variants.find(
      (variant) => variant.compareAtPrice !== null
    );

    const onSale = !!onSaleVariant;
    const onSaleVariantId = onSaleVariant ? onSaleVariant.id : null;

    await prisma.product.update({
      where: { id: product.id },
      data: {
        onSale,
        on_sale_variant_id: onSaleVariantId,
      },
    });
  }
};