'use server';
import { prisma } from '@/lib/prisma';

export async function getDuplicates() {
  const duplicates = await prisma.product.findMany({
    where: {
      markedAsDuplicate: true,
      approved: false,
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
    id: product.id,
    title: product.title,
    approved: product.approved,
    shopName: product.shop.name,
    image: product.image,
    duplicateProducts: product.duplicateProducts.map((dp) => ({
      id: dp.id,
      title: dp.title,
      shopName: dp.shop.name,
      image: dp.image,
    })),
  }));
}


export async function approveDuplicate(productId: string) {
  await prisma.product.update({
    where: { id: productId },
    data: {
      approved: true, // set to true
    },
  });
}

export async function rejectDuplicate(productId: string) {
  await prisma.$transaction(async (tx) => {
    // 1. Fetch the product along with its duplicates
    const product = await tx.product.findUnique({
      where: { id: productId },
      include: {
        duplicateProducts: true,
      },
    });

    if (!product) return;

    // 2. For each "linked duplicate" product, remove the connection back to this product
    for (const dup of product.duplicateProducts) {
      await tx.product.update({
        where: { id: dup.id },
        data: {
          duplicateProducts: {
            disconnect: [{ id: productId }],
          },
        },
      });
    }

    // 3. Finally, remove all duplicate references from THIS product and reset flags
    await tx.product.update({
      where: { id: productId },
      data: {
        duplicateProducts: {
          set: [], // clears out any references
        },
        markedAsDuplicate: false,
        approved: false,
      },
    });
  });
}

export async function mergeProducts(sourceId: string, targetId: string) {
  // Fetch both products
  const sourceProduct = await prisma.product.findUnique({ where: { id: sourceId } });
  const targetProduct = await prisma.product.findUnique({ where: { id: targetId } });

  if (!sourceProduct || !targetProduct) {
    throw new Error("One or both products not found");
  }

  // Perform merging logic (e.g., update fields, transfer variants, etc.)
  await prisma.$transaction([
    prisma.variant.updateMany({
      where: { productId: sourceId },
      data: { productId: targetId },
    }),
    prisma.product.delete({ where: { id: sourceId } }),
  ]);

  console.log(`Merged product ${sourceId} into ${targetId}`);
}

