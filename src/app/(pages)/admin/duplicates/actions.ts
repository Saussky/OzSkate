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

// TODO: Rename to original and duplicate
export async function mergeProducts(sourceId: string, targetId: string) {
  // Fetch both products
  const sourceProduct = await prisma.product.findUnique({
    where: { id: sourceId },
    include: { duplicateProducts: true, duplicatedBy: true },
  });

  const targetProduct = await prisma.product.findUnique({
    where: { id: targetId },
    include: { duplicateProducts: true, duplicatedBy: true },
  });

  if (targetProduct?.duplicateProducts) {
    throw new Error("Duplicate is a source for other duplicates")
  }

  if (!sourceProduct || !targetProduct) {
    throw new Error("One or both products not found");
  }

  // Update the database to mark duplicates and approve them
  await prisma.$transaction([
    prisma.product.update({
      where: { id: sourceId },
      data: {
        approved: true,
        markedAsDuplicate: false,
        duplicateProducts: {
          connect: [{ id: targetId }], // Add the target to source's duplicateProducts
        },
      },
    }),
    prisma.product.update({
      where: { id: targetId },
      data: {
        approved: true,
        markedAsDuplicate: true,
        duplicatedBy: {
          connect: [{ id: sourceId }], // Add the source to target's duplicatedBy
        },
      },
    }),
  ]);

  console.log(`Marked products ${sourceId} and ${targetId} as duplicates with approval.`);
}


