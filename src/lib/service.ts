"use server";
import { prisma } from "@/lib/prisma";

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

export async function fetchProducts(page: number, limit: number = 40) {
  try {
    const skip = (page - 1) * limit;
    const products = await prisma.product.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }, // Example sorting logic
      include: {
        variants: true, // Include related data as needed
        options: true,
      },
    });

    const totalProducts = await prisma.product.count();

    return {
      products,
      totalProducts,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
    };
  } catch (error) {
    console.error("Error fetching paginated products:", error);
    return {
      products: [],
      totalProducts: 0,
      currentPage: page,
      totalPages: 0,
    };
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
