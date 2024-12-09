/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from "@prisma/client";
import { categoriseProduct } from "./categorise";

const processFeaturedImage = (image: any) => {
  if (
    image &&
    typeof image === "object" &&
    typeof image.src === "string" &&
    typeof image.width === "number" &&
    typeof image.height === "number"
  ) {
    return {
      src: image.src,
      width: image.width,
      height: image.height,
    };
  } else if (image) return null;
};

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
      tags: product.tags ? product.tags.join(",") : "",
      image: JSON.stringify(firstImage), // Store image as JSON string
      onSale: false,
      variants: product.variants
        ? product.variants.map((variant: any) => ({
            id: variant.id.toString(),
            productId: product.id.toString(),
            title: variant.title,
            option1: variant.option1 || null,
            option2: variant.option2 || null,
            option3: variant.option3 || null,
            sku: variant.sku,
            price: parseFloat(variant.price),
            compareAtPrice: variant.compare_at_price
              ? parseFloat(variant.compare_at_price)
              : null,
            position: variant.position,
            taxable: variant.taxable,
            featuredImage: processFeaturedImage(variant.featuredImage),
            available: variant.available,
            createdAt: new Date(variant.created_at),
            updatedAt: new Date(variant.updated_at),
          }))
        : [],
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
