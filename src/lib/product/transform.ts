/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from '@prisma/client';
import { categoriseProduct } from './categorise';
import { processFeaturedImage, transformVariants } from './variants';

// TODO: Create master category taxonomy, documented
export const transformProducts = (
  allPaginatedProducts: any[],
  shopId: number
): Prisma.productUncheckedCreateInput[] => {
  return allPaginatedProducts.map((product) => {
    const firstImage = getProductImage(product.images);

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

    const { parentType, childType } = categoriseProduct(parseProduct);

    const cheapestPrice = product.variants
      ? Math.min(
          ...product.variants.map((variant: any) => variant.price || Infinity)
        )
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
      tags: product.tags ? product.tags.join(',') : '',
      image: firstImage || {},
      onSale: false,
      variants: product.variants
        ? transformVariants(product, parentType, childType)
        : [],
    };
  });
};

/**
 * Transforms the raw fresh products into a minimal shape needed for updates.
 * Only extracts the product id, cheapestPrice, and variants (with price and compareAtPrice).
 */
export const transformProductsForUpdate = async (
  allPaginatedProducts: any[]
): Promise<
  {
    id: string;
    cheapestPrice: number | null;
    image: any;
    variants: Array<{
      id: string;
      price: number;
      compareAtPrice: number | null;
    }>;
  }[]
> => {
  return Promise.all(
    allPaginatedProducts.map(async (product) => {
      const variants = product.variants
        ? await transformVariants(
            product,
            product.parentType,
            product.childType
          )
        : [];

      const cheapestPrice =
        variants.length > 0
          ? Math.min(
              ...variants.map((variant: { price: any }) => variant.price)
            )
          : null;

      return {
        id: product.id.toString(),
        image: getProductImage(product.images),
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
export async function transformVariantsForUpdate(variants: any[]): Promise<
  Array<{
    id: string;
    price: number;
    compareAtPrice: number | null;
    available: boolean;
    featuredImage: any;
  }>
> {
  return Promise.all(
    variants.map(async (variant) => ({
      id: variant.id.toString(),
      price: parseFloat(variant.price),
      compareAtPrice: variant.compare_at_price
        ? parseFloat(variant.compare_at_price)
        : null,
      available: variant.available,
      featuredImage: processFeaturedImage(variant.featuredImage), // TODO: Check if the image changed somehow
    }))
  );
}

function getProductImage(productImages: any) {
  if (
    productImages &&
    Array.isArray(productImages) &&
    productImages.length > 0
  ) {
    const firstImageCandidate = productImages[0];
    if (
      firstImageCandidate &&
      typeof firstImageCandidate.src === 'string' &&
      typeof firstImageCandidate.width === 'number' &&
      typeof firstImageCandidate.height === 'number'
    ) {
      return {
        src: firstImageCandidate.src,
        width: firstImageCandidate.width,
        height: firstImageCandidate.height,
      };
    }
  }
}
