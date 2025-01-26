'use server';
import { prisma } from '@/lib/prisma';

export async function getDuplicates() {
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

  return duplicates.map((product) => {
    return {
      id: product.id,
      title: product.title,
      handle: product.handle,
      price: product.cheapestPrice,
      parentType: product.parentType,
      childType: product.childType,
      shopName: product.shop.name,
      shopUrl: product.shop.url,
      image: product.image,

      duplicateProducts: product.duplicateProducts.map((dp) => ({
        id: dp.id,
        title: dp.title,
        handle: dp.handle,
        price: dp.cheapestPrice,
        parentType: dp.parentType,
        childType: dp.childType,
        shopName: dp.shop.name,
        shopUrl: dp.shop.url,
        image: dp.image,
      })),
    };
  });
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


