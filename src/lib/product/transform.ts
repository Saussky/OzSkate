/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from "@prisma/client";
import { categoriseProduct } from "./categorise";
import { transformVariants } from "./variants";

export const transformProducts = (
  allPaginatedProducts: any[],
  shopId: number
): Prisma.ProductUncheckedCreateInput[] => {
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

    const { parentProductType, childProductType } =
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
      updatedAt: new Date(product.updated_at),
      vendor: product.vendor,
      productType: product.product_type,
      parentProductType,
      childProductType,
      cheapestPrice,
      tags: product.tags ? product.tags.join(",") : "",
      image: firstImage,
      onSale: false,
      variants: product.variants ? transformVariants(product, parentProductType, childProductType) : [],
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
