"use server";
import { prisma } from "@/lib/prisma";

//TODO: Remove this file and merge with other server actions
export async function getProductCount() {
  try {
    const count = await prisma.product.count();
    return count;
  } catch (error) {
    console.error("Error getting product count:", error);
    return 0;
  } finally {
    await prisma.$disconnect();
  }
}

export async function getShopCount() {
  try {
    const count = await prisma.shop.count();
    return count;
  } catch (error) {
    console.error("Error getting shop count:", error);
    return 0;
  } finally {
    await prisma.$disconnect();
  }
}
