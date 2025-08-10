import { ExtendedProduct } from '@/components/storefront/storefront';

type CurrencyValue = number | null | undefined;

export function formatCurrency(amount: CurrencyValue): string {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return 'N/A';
  return `$${amount.toFixed(2)}`;
}

/**
 * Picks the most relevant original (compare-at) price to display when a product is on sale.
 * Priority:
 * 1) Variant referenced by on_sale_variant_id (if discounted)
 * 2) Variant whose price equals cheapestPrice and has a valid compareAtPrice > price
 * 3) Any variant that has compareAtPrice > price
 */
export function getOriginalSalePriceForDisplay(
  product: ExtendedProduct
): number | null {
  if (
    !product.onSale ||
    !Array.isArray(product.variants) ||
    product.variants.length === 0
  ) {
    return null;
  }

  // 1) Prefer the explicitly-marked sale variant
  if (product.on_sale_variant_id) {
    const matchedVariant = product.variants.find(
      (currentVariant) => currentVariant.id === product.on_sale_variant_id
    );
    if (
      matchedVariant &&
      typeof matchedVariant.compareAtPrice === 'number' &&
      matchedVariant.compareAtPrice > matchedVariant.price
    ) {
      return matchedVariant.compareAtPrice;
    }
  }

  // 2) Try the variant that matches the product's cheapestPrice
  if (typeof product.cheapestPrice === 'number') {
    const cheapestVariant = product.variants.find(
      (currentVariant) =>
        currentVariant.price === product.cheapestPrice &&
        typeof currentVariant.compareAtPrice === 'number' &&
        currentVariant.compareAtPrice > currentVariant.price
    );
    if (cheapestVariant?.compareAtPrice) {
      return cheapestVariant.compareAtPrice;
    }
  }

  const anyDiscounted = product.variants.find(
    (currentVariant) =>
      typeof currentVariant.compareAtPrice === 'number' &&
      currentVariant.compareAtPrice > currentVariant.price
  );
  return typeof anyDiscounted?.compareAtPrice === 'number'
    ? anyDiscounted.compareAtPrice
    : null;
}
