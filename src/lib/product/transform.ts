/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from "@prisma/client";
import { categoriseProduct } from "./categorise";
import { transformVariants } from "./variants";

// TODO: Create master category taxonomy, documented
export const transformProducts = (
  allPaginatedProducts: any[],
  shopId: number
): Prisma.productUncheckedCreateInput[] => {
  return allPaginatedProducts.map((product) => {
    let firstImage = null;

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

    const tagsArray = Array.isArray(product.tags)
      ? product.tags.map((tag: string) => tag.trim())
      : [];

    const parseProduct = {
      description: product.description,
      handle: product.handle,
      title: product.title,
      ogProductType: product.product_type,
      tags: tagsArray,
    };

    const { parentType, childType } =
      categoriseProduct(parseProduct);

    const cheapestPrice = product.variants
      ? Math.min(...product.variants.map((variant: any) => variant.price || Infinity))
      : null;

    return {
      id: product.id.toString(),
      shopId: shopId,
      title: product.title,
      handle: product.handle,
      description: product.body_html || null,
      publishedAt: new Date(product.published_at),
      createdAt: new Date(product.created_at),
      updatedAt: new Date(product.updated_at), // TODO: Use this value when updating product
      vendor: product.vendor,
      productType: product.product_type,
      parentType,
      childType,
      cheapestPrice,
      tags: product.tags ? product.tags.join(",") : "",
      image: firstImage || {},
      onSale: false,
      variants: product.variants ? transformVariants(product, parentType, childType) : [],
      options: product.options
        ? product.options.map((option: any) => ({
            id: option.id ? option.id.toString() : null,
            productId: product.id.toString(),
            name: option.name || "Unnamed Option",
            position: option.position || 0,
            values: option.values ? option.values.join(",") : "",
          }))
        : [],
    };
  });
};



/**
 * Transforms the raw fresh products into a minimal shape needed for updates.
 * Only extracts the product id, cheapestPrice, and variants (with price and compareAtPrice).
 */
export const transformProductsForUpdate = async (
  allPaginatedProducts: any[],
): Promise<{
  id: string;
  cheapestPrice: number | null;
  variants: Array<{ id: string; price: number; compareAtPrice: number | null }>;
}[]> => {
  return Promise.all(
    allPaginatedProducts.map(async (product) => {
      const variants = product.variants ? await transformVariantsForUpdate(product.variants) : [];
      
      const cheapestPrice = variants.length > 0
        ? Math.min(...variants.map(variant => variant.price))
        : null;

      return {
        id: product.id.toString(),
        cheapestPrice,
        variants,
      };
    })
  );
};

/**
 * Transforms raw variant data into a minimal shape for updates.
 * Extracts only the variant id, price, and compareAtPrice.
 */
export async function transformVariantsForUpdate(
  variants: any[]
): Promise<Array<{ id: string; price: number; compareAtPrice: number | null }>> {
  return Promise.all(
    variants.map(async (variant) => ({
      id: variant.id.toString(),
      price: parseFloat(variant.price),
      compareAtPrice: variant.compare_at_price
        ? parseFloat(variant.compare_at_price)
        : null,
    }))
  );
}
