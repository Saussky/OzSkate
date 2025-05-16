/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';
import { prisma } from '@/lib/prisma';
import { checkProductSimilarity } from '@/lib/product/merge';
import { Prisma } from '@prisma/client';

export async function getPaginatedSuspectedDuplicates(
  page: number, 
  pageSize: number
): Promise<{
  total: number;
  items: Prisma.ProductDuplicateGetPayload<{
    include: {
      masterProduct: {
        include: { shop: true }
      },
      duplicateProduct: {
        include: { shop: true }
      }
    }
  }>[];
}> {
  const [total, items] = await prisma.$transaction([
    prisma.productDuplicate.count({
      where: { status: 'suspected' },
    }),
    prisma.productDuplicate.findMany({
      where: { status: 'suspected' },
      include: {
        masterProduct: {
          include: { shop: true },
        },
        duplicateProduct: {
          include: { shop: true },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return { total, items };
}


export async function rejectDuplicate(masterId: string, duplicateId: string): Promise<void> {
  // Update the status to 'rejected' for the matching suspected duplicate entry, if it exists
  await prisma.productDuplicate.updateMany({
    where: {
      OR: [
        { masterProductId: masterId, duplicateProductId: duplicateId },
        { masterProductId: duplicateId, duplicateProductId: masterId }
      ],
      status: 'suspected'
    },
    data: { status: 'rejected' }
  });

  // No need to remove the record; keeping it as 'rejected' ensures this pair won't be flagged again.
}


export async function mergeProducts(masterId: string, duplicateId: string): Promise<void> {
  // Find the duplicate relationship record in either orientation
  const existingRelation = await prisma.productDuplicate.findFirst({
    where: {
      OR: [
        { masterProductId: masterId, duplicateProductId: duplicateId },
        { masterProductId: duplicateId, duplicateProductId: masterId }
      ]
    }
  });

  if (existingRelation) {
    // Update the existing suspected record to confirmed
    await prisma.productDuplicate.update({
      where: { id: existingRelation.id },
      data: { status: 'confirmed' }
    });
  } else {
    // If no record exists (e.g. merging found manually), create a new confirmed duplicate entry
    await prisma.productDuplicate.create({
      data: {
        masterProductId: masterId,
        duplicateProductId: duplicateId,
        status: 'confirmed',
        reasons: {},  // no reasons if it was a manual identification
      }
    });
  }

  // (Optional) Merge product data: e.g., transfer any necessary info from duplicate product to master product.
}

function groupProductsByChildType(products: any[]): Record<string, any[]> {
  const productsByChildType: Record<string, any[]> = {};

  for (const product of products) {
    const childType = product.childType || "Uncategorised";
    if (!productsByChildType[childType]) {
      productsByChildType[childType] = [];
    }
    productsByChildType[childType].push(product);
  }

  console.log("Grouped products by childType.");
  return productsByChildType;
}


function findDuplicatesWithinChildType(products: any[]): {
  product1: any;
  product2: any;
  reasons: string[];
}[] {
  const results: { product1: any; product2: any; reasons: string[] }[] = [];

  for (let i = 0; i < products.length; i++) {
    for (let j = i + 1; j < products.length; j++) {
      const product1 = products[i];
      const product2 = products[j];

      // Only compare products from different stores
      if (product1.id === product2.id) continue;
      if (product1.shopId === product2.shopId) continue;

      const similarityResult = checkProductSimilarity(product1, product2);

      if (similarityResult.isSimilar) {
        results.push({
          product1,
          product2,
          reasons: similarityResult.reasons,
        });
      }
    }
  }

  return results;
}

//TODO: Investigate further
export async function markProductsAsSuspectedDuplicates(
  productAId: string, 
  productBId: string, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _reasons?: Prisma.JsonValue
): Promise<void> {

  let masterId = productAId;
  let duplicateId = productBId;

  // Enforce a consistent ordering for master/duplicate to avoid duplicates in reverse.
  // For example, use the smaller ID as the master product (or apply another rule such as creation date).
  if (productBId < productAId) {
    masterId = productBId;
    duplicateId = productAId;
  }

  // Check if this pair already exists in any status (suspected, confirmed, or rejected)
  const existing = await prisma.productDuplicate.findFirst({
    where: {
      OR: [
        { masterProductId: masterId, duplicateProductId: duplicateId },
        { masterProductId: duplicateId, duplicateProductId: masterId }
      ]
    }
  });
  if (existing) {
    // If a relationship exists, do nothing:
    // - If status is 'rejected', we don't want to flag it again.
    // - If 'suspected' or 'confirmed', it's already handled.
    return;
  }

  // Insert a new suspected duplicate record
  await prisma.productDuplicate.create({
    data: {
      masterProductId: masterId,
      duplicateProductId: duplicateId,
      status: 'suspected',
      // reasons: reasons // store similarity reasons if provided
    }
  });
}

export async function checkAllProductsForDuplicates() {

  const allProducts = await prisma.product.findMany({
    include: {
      shop: true,  
      variants: true 
    },
    where: {
      // e.g. skip any product that’s already confirmed duplicate (optional)
      // approvedDuplicate: false
    },
  });

  const productsByChildType = groupProductsByChildType(allProducts);

  // Check duplicates within each childType
  for (const [childType, products] of Object.entries(productsByChildType)) {
    console.log(`Checking products under childType: ${childType}`);
    const results = findDuplicatesWithinChildType(products);

    if (results.length > 0) {
      console.log(`Found ${results.length} potential duplicates in childType: ${childType}`);

      for (const { product1, product2, reasons } of results) {
        console.log(
          `- Duplicate Pair: "${product1.title}" (Store: ${product1.shop?.name}) <-> "${product2.title}" (Store: ${product2.shop?.name})`
        );

        await markProductsAsSuspectedDuplicates(product1.id, product2.id, {
          reasons,
        });
      }
    } else {
      console.log(`No duplicates found in childType: ${childType}`);
    }
  }

  console.log("Duplicate check completed.");
}
