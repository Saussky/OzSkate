/* eslint-disable @typescript-eslint/no-explicit-any */

export const processFeaturedImage = (image: unknown) => {
  if (!image || typeof image !== 'object') return null;
  const { src, width, height } = image as {
    src?: unknown;
    width?: unknown;
    height?: unknown;
  };

  if (
    typeof src === 'string' &&
    typeof width === 'number' &&
    typeof height === 'number'
  ) {
    return { src, width, height };
  }
  return null;
};

function extractShoeSize(
  variantTitle: string,
  variantOption: string
): number | null {
  const combinedString = `${variantTitle} ${variantOption}`.toLowerCase();
  const match = combinedString.match(/(?:us\s*)?(\d+(\.\d+)?)/); // Match sizes with or without 'US'
  return match ? parseFloat(match[1]) : null;
}

function extractDeckSize(
  variantTitle: string,
  variantOption: string
): number | null {
  const combinedString = `${variantTitle} ${variantOption}`.toLowerCase();
  // Match sizes that are integers or floats with up to 3 decimal places
  const match = combinedString.match(/(?:^|\\s)(\\d+(\\.\\d{1,3})?)(?=\\s|$)/);
  return match ? parseFloat(match[1]) : null;
}

export function transformVariants(
  product: any,
  parentType?: string | null,
  childType?: string | null
) {
  return product.variants
    ? product.variants.map((variant: any) => {
        const baseVariant = {
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
        };

        if (parentType === 'Shoes') {
          const shoeSize = extractShoeSize(
            variant.title || '',
            variant.option1 || ''
          );
          return {
            ...baseVariant,
            shoeSize: shoeSize || null,
          };
        }

        if (childType === 'Decks') {
          const deckSize = extractDeckSize(
            variant.title || '',
            variant.option1 || ''
          );
          return {
            ...baseVariant,
            deckSize: deckSize || null,
          };
        }

        return baseVariant;
      })
    : [];
}
