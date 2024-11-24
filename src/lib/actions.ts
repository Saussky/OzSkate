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

export async function deleteAllProducts() {
  try {
    // TODO: Cascading deletes would be better
    await prisma.variant.deleteMany();
    await prisma.option.deleteMany();
    await prisma.product.deleteMany();

    console.log("All products, variants, and options have been deleted.");
  } catch (error) {
    console.error("Error deleting all products:", error);
  } finally {
    await prisma.$disconnect();
  }
}

export const fetchPaginatedProducts = async (
  page: number,
  limit: number = 40
) => {
  const skip = (page - 1) * limit;

  try {
    const products = await prisma.product.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        skateShop: {
          // Include related shop data
          select: {
            name: true,
            state: true,
          },
        },
        variants: true,
        options: true,
      },
    });

    const totalProducts = await prisma.product.count();

    const formattedProducts = products.map((product) => ({
      ...product,
      image: product.image ? JSON.parse(product.image) : null,
    }));

    return {
      products: formattedProducts,
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
  }
};
