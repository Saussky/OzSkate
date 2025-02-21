
'use server';
import { prisma } from '@/lib/prisma';
import levenshtein from 'fast-levenshtein';

/**
 * Computes the Levenshtein-based similarity between two strings.
 * Returns a value between 0 (completely different) and 1 (identical).
 */
function titleSimilarity(title1: string, title2: string): number {
  const distance = levenshtein.get(title1.toLowerCase(), title2.toLowerCase());
  const maxLength = Math.max(title1.length, title2.length);
  return 1 - distance / maxLength;
}

/**
 * Retrieves all non-null vendors from the products table,
 * groups similar vendor names together based on a similarity threshold,
 * and returns the groups.
 */
export async function getVendorGroups(): Promise<{ group: string[] }[]> {
  // Get all products that have a vendor
  const products = await prisma.product.findMany({
    select: { vendor: true },
    where: { vendor: { not: null } },
  });

  // Create a set of unique vendor names
  const vendorSet = new Set<string>();
  for (const prod of products) {
    if (prod.vendor) vendorSet.add(prod.vendor);
  }
  const vendors = Array.from(vendorSet);

  // Group vendors using a simple clustering algorithm:
  // for each vendor, compare with the representative of each group.
  const groups: string[][] = [];
  const threshold = 0.8; // 80% similarity

  for (const vendor of vendors) {
    let added = false;
    for (const group of groups) {
      // Use the first vendor in the group as the representative
      const representative = group[0];
      const similarity = titleSimilarity(vendor, representative);
      if (similarity >= threshold) {
        group.push(vendor);
        added = true;
        break;
      }
    }
    if (!added) {
      groups.push([vendor]);
    }
  }

  // Return groups in a consistent shape
  return groups.map((group) => ({ group }));
}

/**
 * Updates all products whose vendor is in the provided vendorGroup
 * (except those already matching the selectedVendor) to have vendor equal to selectedVendor.
 */
export async function updateVendorGroup(vendorGroup: string[], selectedVendor: string): Promise<void> {
  await prisma.product.updateMany({
    where: {
      vendor: {
        in: vendorGroup,
        not: selectedVendor,
      },
    },
    data: {
      vendor: selectedVendor,
    },
  });
}
