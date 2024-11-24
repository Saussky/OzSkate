/* eslint-disable @typescript-eslint/no-explicit-any */
import fetch from "node-fetch";
import { prisma } from "./prisma";

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

    // Accumulate fetched products
    allProducts = allProducts.concat(products);

    console.log(`Fetched ${products.length} products from page ${page}.`);

    // Increment page for the next iteration
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
): any[] => {
  return allPaginatedProducts.map((product) => {
    let firstImage = null;

    // Ensure `images` is a valid array before extracting the first image's details
    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      const [firstImageCandidate] = product.images;
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
        }; // Assign the first image's src, width, and height
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
      tags: product.tags ? product.tags.join(",") : "", // Convert tags array to comma-separated string
      image: JSON.stringify(firstImage), // Use the first image URL or null if none exists
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
            featuredImage: variant.featured_image
              ? variant.featured_image
              : null,
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
        ? product.options
            .map((option: any) => ({
              id: option.id ? option.id.toString() : null, // Handle undefined `id`
              productId: product.id ? product.id.toString() : null, // Ensure product.id is valid
              name: option.name || "Unnamed Option", // Provide a default name if missing
              position: option.position || 0, // Default to 0 if position is missing
              values: option.values ? option.values.join(",") : "", // Convert values array to comma-separated string
            }))
            .filter((option: any) => option.id !== null) // Filter out options with null ids
        : [],
    };
  });
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

export const buildWhereClause = (
  filters: Record<string, string | number | undefined>
) => {
  const whereClause: Record<string, any> = {};

  if (filters.category) {
    whereClause.productType = {
      contains: filters.category,
      mode: "insensitive",
    };
  }

  if (filters.maxPrice) {
    const maxPrice = Number(filters.maxPrice);
    whereClause.variants = {
      some: {
        price: {
          lte: maxPrice, // Direct numeric comparison
        },
      },
    };
  }

  return whereClause;
};
