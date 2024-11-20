"use server";

import { prisma } from "@/lib/prisma";
import { processShop } from "@/lib/scraper";

export async function fetchAllProducts() {
  try {
    console.log("Starting product import...");

    const shops = await prisma.skateShop.findMany();

    for (const shop of shops) {
      try {
        await processShop(shop);
      } catch (error) {
        console.error(`Error processing shop ${shop.name}:`, error);
      }
    }

    console.log("Product import completed.");
  } catch (error) {
    console.error("Error fetching all products:", error);
  } finally {
    await prisma.$disconnect();
  }
}

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
    const count = await prisma.skateShop.count();
    return count;
  } catch (error) {
    console.error("Error getting shop count:", error);
    return 0;
  } finally {
    await prisma.$disconnect();
  }
}
