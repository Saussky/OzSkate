'use server';
import { prisma } from '@/lib/prisma';

export async function getProductCount() {
  try {
    const count = await prisma.product.count();
    return count;
  } catch (error) {
    console.error('Error getting product count:', error);
    return 0;
  }
}

export async function getShopCount() {
  try {
    const count = await prisma.shop.count();
    return count;
  } catch (error) {
    console.error('Error getting shop count:', error);
    return 0;
  }
}

export async function getOnSaleCount(): Promise<number> {
  try {
    return await prisma.product.count({
      where: { onSale: true },
    });
  } catch (error) {
    console.error('Error getting on-sale product count:', error);
    return 0;
  }
}

export const getShopNames = async () => {
  try {
    const shops = await prisma.shop.findMany({
      select: { name: true },
    });

    return shops.map((shop) => shop.name);
  } catch (error) {
    console.error('Error fetching shop names:', error);
    return [];
  }
};

export async function refreshCounts() {
  const productCount = await getProductCount();
  const shopCount = await getShopCount();
  const onSaleCount = await getOnSaleCount();
  return { shopCount, productCount, onSaleCount };
}

export async function deleteAllProducts() {
  try {
    // TODO: Cascading deletes would be better
    // TODO: Have added cascadin deletes, should be able to test with just product delete
    await prisma.variant.deleteMany();
    await prisma.product.deleteMany();

    console.log('All products, variants, and options have been deleted.');
  } catch (error) {
    console.error('Error deleting all products:', error);
  }
}
