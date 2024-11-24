/* eslint-disable @typescript-eslint/no-explicit-any */
import fetch from "node-fetch";
import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

export const buildWhereClause = (
  filters: Record<string, string | number | undefined>
) => {
  const whereClause: Record<string, any> = {};

  if (filters.category) {
    whereClause.productType = {
      contains: filters.category,
    };
  }

  if (filters.maxPrice) {
    const maxPrice = Number(filters.maxPrice);
    whereClause.variants = {
      some: {
        price: {
          lte: maxPrice,
        },
      },
    };
  }

  return whereClause;
};

export async function processShop(shop: any) {
  console.log(`Processing shop: ${shop.name}`);

  const baseUrl = shop.url;
  const sinceId = shop.since_id || "0";

  const allPaginatedProducts = await fetchShopifyProducts(baseUrl, sinceId);

  if (allPaginatedProducts.length === 0) {
    console.log(`No new products found for shop: ${shop.name}`);
    return;
  }

  const transformedProducts = transformProducts(allPaginatedProducts, shop.id);

  for (const product of transformedProducts) {
    const { variants, options, ...productData } = product;

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
          create: variant,
        });
      }
    }

    if (Array.isArray(options)) {
      for (const option of options) {
        if (option.id) {
          await prisma.option.upsert({
            where: { id: option.id },
            update: option,
            create: option,
          });
        }
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

  while (page <= 2) {
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

export const transformProducts = (
  allPaginatedProducts: any[],
  shopId: number
): Prisma.ProductUncheckedCreateInput[] => {
  return allPaginatedProducts.map((product) => {
    let firstImage = null;

    // Cut down the image data to essentials
    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      const firstImageCandidate = product.images[0];
      if (
        firstImageCandidate &&
        typeof firstImageCandidate.src === "string" &&
        typeof firstImageCandidate.width === "number" &&
        typeof firstImageCandidate.height === "number"
      ) {
        firstImage = {
          src: firstImageCandidate.src,
          width: firstImageCandidate.width,
          height: firstImageCandidate.height,
        };
      }
    }

    return {
      id: product.id.toString(),
      shopId: shopId,
      title: product.title,
      handle: product.handle,
      description: product.body_html || null,
      publishedAt: new Date(product.published_at),
      createdAt: new Date(product.created_at),
      updatedAt: new Date(product.updated_at),
      vendor: product.vendor,
      productType: product.product_type,
      tags: product.tags ? product.tags.join(",") : "",
      image: JSON.stringify(firstImage),
      variants: product.variants
        ? product.variants.map((variant: any) => ({
            id: variant.id.toString(),
            productId: product.id.toString(),
            title: variant.title,
            option1: variant.option1 || null,
            option2: variant.option2 || null,
            option3: variant.option3 || null,
            sku: variant.sku,
            requiresShipping: variant.requires_shipping,
            taxable: variant.taxable,
            featuredImage: variant.featured_image || null,
            available: variant.available,
            price: Number(variant.price),
            grams: variant.grams,
            compareAtPrice: variant.compare_at_price || null,
            position: variant.position,
            createdAt: new Date(variant.created_at),
            updatedAt: new Date(variant.updated_at),
          }))
        : [],
      options: product.options
        ? product.options.map((option: any) => ({
            id: option.id ? option.id.toString() : null,
            productId: product.id ? product.id.toString() : null,
            name: option.name || "Unnamed Option",
            position: option.position || 0,
            values: option.values ? option.values.join(",") : "",
          }))
        : [],
    };
  });
};
