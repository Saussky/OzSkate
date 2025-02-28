'use server';
import { prisma } from '@/lib/prisma';
import { ProductWithSuspectedDuplicate } from '@/lib/types';

export async function getPaginatedSuspectedDuplicates(page: number, limit: number) {
  const offset = (page - 1) * limit;

  const [duplicates, total] = await prisma.$transaction([
    prisma.product.findMany({
      where: {
        suspectedDuplicateOfId: {
          not: null,
        },
      },
      include: {
        shop: true,
        suspectedDuplicateOf: {
          include: { shop: true },
        },
      },
      skip: offset,
      take: limit,
    }),
    prisma.product.count({
      where: {
        suspectedDuplicateOfId: {
          not: null,
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
        approvedDuplicate: false,
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

