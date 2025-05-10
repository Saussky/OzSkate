'use server';
import { prisma } from '@/lib/prisma';
import levenshtein from 'fast-levenshtein';

/**
 * Remove the words "skateboards" or "skateboarding" from the vendor name.
 */
function sanitiseVendorName(vendor: string): string {
  return vendor.replace(/\b(skateboards?|skateboarding)\b/gi, '').trim();
}

/**
 * Computes the Levenshtein-based similarity between two vendor names.
 * The vendor names are sanitised to ignore "Skateboards" or "Skateboarding".
 * Returns a value between 0 (completely different) and 1 (identical).
 */
function titleSimilarity(title1: string, title2: string): number {
  const sanitisedTitle1 = sanitiseVendorName(title1);
  const sanitisedTitle2 = sanitiseVendorName(title2);
  const distance = levenshtein.get(sanitisedTitle1.toLowerCase(), sanitisedTitle2.toLowerCase());
  const maxLength = Math.max(sanitisedTitle1.length, sanitisedTitle2.length);
  return maxLength === 0 ? 1 : 1 - distance / maxLength;
}

/**
 * Retrieves all non-null vendors from the products table,
 * groups similar vendor names together (ignoring "skateboards/skateboarding")
 * using a similarity threshold of 80%, and returns only groups with duplicates.
 */
export async function getVendorGroups(): Promise<{ group: string[] }[]> {
  // Retrieve all products with a vendor
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
  // For each vendor, compare with the representative of each group.
  const groups: string[][] = [];
  const threshold = 0.8; // 80% similarity

  for (const vendor of vendors) {
    let added = false;
    for (const group of groups) {
      // Use the first vendor in the group as representative
      if (titleSimilarity(vendor, group[0]) >= threshold) {
        group.push(vendor);
        added = true;
        break;
      }
    }
    if (!added) {
      groups.push([vendor]);
    }
  }

  // Only return groups with more than one vendor (i.e. duplicates)
  return groups.filter(group => group.length > 1).map(group => ({ group }));
}

/**
 * Updates all products whose vendor is in the provided vendorGroup (except those already matching selectedVendor)
 * so that their vendor is updated to selectedVendor.
 */
export async function updateVendorGroup(vendorGroup: string[], selectedVendor: string): Promise<void> {
  await prisma.product.updateMany({
    where: {
      vendor: {
        in: vendorGroup,
        not: selectedVendor,
      },
    },
    data: { vendor: selectedVendor },
  });
}

/**
 * Creates a vendor rule so that whenever a vendor name contains vendorPattern,
 * it should be updated to standardVendor in future product updates.
 */
export async function addVendorRule(vendorPattern: string, standardVendor: string): Promise<void> {
  await prisma.vendorRule.create({
    data: {
      vendorPattern,
      standardVendor,
    },
  });
}
