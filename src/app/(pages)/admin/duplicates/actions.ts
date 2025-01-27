'use server';
import { prisma } from '@/lib/prisma';
import { ProductWithDuplicates } from '@/lib/types';

export async function getDuplicates(): Promise<ProductWithDuplicates[]> {
 const duplicates = await prisma.product.findMany({
    where: {
      suspectedDuplicateOfId: {
        not: null,
      },
    },
    include: {
      shop: true,
      duplicateProducts: {
        include: {
          shop: true,
        },
      },
    },
  });

  return duplicates.map((product) => ({
    ...product,
    duplicateProducts: product.duplicateProducts.map((dp) => ({
      ...dp,
    })),
  }));
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
        approvedDuplicate: false,
      },
    });
  });
}

// TODO: Rename to original and duplicate
export async function mergeProducts(sourceId: string, targetId: string) {
  // Fetch both products
  const sourceProduct = await prisma.product.findUnique({
    where: { id: sourceId },
    include: { duplicateProducts: true },
  });

  const targetProduct = await prisma.product.findUnique({
    where: { id: targetId },
    include: { duplicateProducts: true },
  });

  // if (targetProduct?.duplicateProducts) {
  //   throw new Error("Duplicate is a source for other duplicates")
  // }

  if (!sourceProduct || !targetProduct) {
    throw new Error("One or both products not found");
  }

  // Update the database to mark duplicates and approve them
  await prisma.$transaction([
    prisma.product.update({
      where: { id: sourceId },
      data: {
        duplicateProducts: {
          connect: [{ id: targetId }], // Add the target to source's duplicateProducts
        },
      },
    }),
    prisma.product.update({
      where: { id: targetId },
      data: {
        approvedDuplicate: true,
      },
    }),
  ]);

  console.log(`Marked products ${sourceId} and ${targetId} as duplicates with approval.`);
}


