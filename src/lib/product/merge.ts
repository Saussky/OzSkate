import levenshtein from "fast-levenshtein";

type Product = {
  id: string;
  title: string;
  parentType: string | null;
  childType: string | null;
  variants: { sku: string | null }[];
};

type MergeResult = {
  isSimilar: boolean;
  reasons: string[];
};

// Calculate Levenshtein similarity percentage
function titleSimilarity(title1: string, title2: string): number {
  const distance = levenshtein.get(title1.toLowerCase(), title2.toLowerCase());
  const maxLength = Math.max(title1.length, title2.length);
  return 1 - distance / maxLength; // Returns similarity as a percentage
}

// Check for matching SKUs
function hasMatchingSKU(variants1: { sku: string | null }[], variants2: { sku: string | null }[]): boolean {
  const skus1 = new Set(variants1.map((variant) => variant.sku).filter(Boolean));
  const skus2 = new Set(variants2.map((variant) => variant.sku).filter(Boolean));
  return [...skus1].some((sku) => skus2.has(sku));
}

export function checkProductSimilarity(
  product1: Product,
  product2: Product,
  options: { titleSimilarityThreshold: number } = { titleSimilarityThreshold: 0.8 }
): MergeResult {
  const reasons: string[] = [];

  // Check title similarity
  const similarity = titleSimilarity(product1.title, product2.title);
  if (similarity >= options.titleSimilarityThreshold) {
    reasons.push(`Title similarity (${(similarity * 100).toFixed(2)}%)`);
  }

  // Check SKU matches
  if (hasMatchingSKU(product1.variants, product2.variants)) {
    reasons.push("Matching SKUs in variants");
  }


  // Determine if the products are similar
  const isSimilar = reasons.length > 0;

  return { isSimilar, reasons };
}
