"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import fetch from "node-fetch";
import { prisma } from "./prisma";
import { transformProducts } from "./product/transform";
import { checkProductSimilarity } from "./product/merge";

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

