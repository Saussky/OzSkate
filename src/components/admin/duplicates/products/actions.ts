/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';
import { prisma } from '@/lib/prisma';
import { checkProductSimilarity } from '@/lib/product/merge';
import { ProductWithSuspectedDuplicate } from '@/lib/types';

export async function getPaginatedSuspectedDuplicates(page: number, limit: number) {
  const offset = (page - 1) * limit;

  const [duplicates, total] = await prisma.$transaction([
    prisma.product.findMany({
      where: {
        suspectedDuplicateOfId: { not: null },
        approvedDuplicate: false,
        suspectedDuplicateOf: {
          approvedDuplicate: false,
        },
      },
      include: {
        shop: true,
        suspectedDuplicateOf: {
          include: {
            shop: true,
          },
        },
      },
      skip: offset,
      take: limit,
    }),
    prisma.product.count({
      where: {
        suspectedDuplicateOfId: { not: null },
        approvedDuplicate: false,
        suspectedDuplicateOf: {
          approvedDuplicate: false,
        },
      },
    }),
  ]);

  return {
    duplicates: duplicates as ProductWithSuspectedDuplicate[],
    totalPages: Math.ceil(total / limit),
    total,
  };
}

export async function rejectDuplicate(productId: string) {
  await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId },
      include: {
        duplicateProducts: true,
      },
    });

    if (!product) return;

    for (const dup of product.duplicateProducts) {
      await tx.product.update({
        where: { id: dup.id },
        data: {
          duplicateProducts: {
            disconnect: [{ id: productId }],
          },
          suspectedDuplicateOf: undefined,
        },
      });
    }

    await tx.product.update({
      where: { id: productId },
      data: {
        suspectedDuplicateOf: undefined,
        approvedDuplicate: false, //TODO: I don't think this is right
      },
    });
  });
}

export async function mergeProducts(originalId: string, duplicateId: string) {
  const sourceProduct = await prisma.product.findUnique({
    where: { id: originalId },
    include: { duplicateProducts: true },
  });

  // TODO: Find where suspectedDuplicateId is also equal
  const targetProduct = await prisma.product.findUnique({
    where: { id: duplicateId },
    include: { duplicateProducts: true },
  });

  // if (targetProduct?.duplicateProducts) {
  //   throw new Error("Duplicate is a source for other duplicates")
  // }

  if (!sourceProduct || !targetProduct) {
    throw new Error("One or both products not found");
  }

  
  await prisma.$transaction([
    prisma.product.update({
      where: { id: originalId },
      data: {
        duplicateProducts: {
          connect: [{ id: duplicateId }],
        },
      },
    }),
    prisma.product.update({
      where: { id: duplicateId },
      data: {
        approvedDuplicate: true,
      },
    }),
  ]);

  console.log(`Marked products ${originalId} and ${duplicateId} as duplicates with approval.`);
}




async function getAllProducts() {  
  const allProducts = await prisma.product.findMany({
    include: {
      variants: true,
      shop: true,
    },
  });
  
  return allProducts;
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
async function markProductsAsSuspectedDuplicates(p1: any, p2: any) {
  try {
    await prisma.$transaction([
      prisma.product.update({
        where: { id: p1.id },
        data: {
          suspectedDuplicateOf: {
            connect: { id: p2.id },
          },
        },
      }),
    ]);
    console.log(`DB updated: ${p1.title} and ${p2.title} marked as duplicates.`);
  } catch (err) {
    console.error("Error updating products as duplicates:", err);
  }
}

export async function checkAllProductsForDuplicates() {
  const allProducts = await getAllProducts();
  const cleanProducts = allProducts.filter(product => !product.approvedDuplicate)
  const productsByChildType = groupProductsByChildType(cleanProducts);

  // Check duplicates within each childType
  for (const [childType, products] of Object.entries(productsByChildType)) {
    console.log(`Checking products under childType: ${childType}`);

    const results = findDuplicatesWithinChildType(products);

    if (results.length > 0) {
      console.log(
        `Found ${results.length} potential duplicates in childType: ${childType}`
      );

      for (const { product1, product2, reasons } of results) {
        console.log(
          `- Duplicate Pair: "${product1.title}" (Store: ${product1.shop.name}) <-> "${product2.title}" (Store: ${product2.shop.name})`
        );
        console.log(`  Reasons: ${reasons.join(", ")}`);

        await markProductsAsSuspectedDuplicates(product1, product2);
      }
    } else {
      console.log(`No duplicates found in childType: ${childType}`);
    }
  }

  console.log("Duplicate check completed.");
}
