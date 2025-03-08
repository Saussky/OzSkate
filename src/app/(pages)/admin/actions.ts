import { prisma } from "@/lib/prisma";

export async function getProductCount() {
  try {
    const count = await prisma.product.count();
    return count;
  } catch (error) {
    console.error("Error getting product count:", error);
    return 0;
  }
}

export async function getShopCount() {
  try {
    const count = await prisma.shop.count();
    return count;
  } catch (error) {
    console.error("Error getting shop count:", error);
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
  return { shopCount, productCount };
}