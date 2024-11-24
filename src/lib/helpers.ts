/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
import fetch from "node-fetch";

export const fetchPaginatedProducts = async (
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
            price: variant.price,
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
