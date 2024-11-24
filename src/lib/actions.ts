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
  limit: number = 40,
  filters: Record<string, string | number | undefined> = {}
) => {
  const skip = (page - 1) * limit;

  try {
    const whereClause: Record<string, any> = {};

    // Apply filters dynamically
    if (filters.category) {
      whereClause.productType = {
        contains: filters.category,
      };
    }

    if (filters.maxPrice) {
      const maxPrice = Number(filters.maxPrice);
      whereClause.variants = {
        some: {
          price: {
            lte: maxPrice,
          },
        },
      };
    }
    console.log("Where Clause:", whereClause);

    const products = await prisma.product.findMany({
      skip,
      take: limit,
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        skateShop: {
          select: {
            name: true,
            state: true,
          },
        },
        variants: true,
        options: true,
      },
    });

    const totalProducts = await prisma.product.count({ where: whereClause });

    // Calculate the cheapest price from variants
    const formattedProducts = products.map((product) => {
      const cheapestVariant = product.variants.reduce(
        (cheapest, variant) => {
          const cheapestPrice = cheapest.price ?? Infinity; // Default to a very high number
          return variant.price < cheapestPrice ? variant : cheapest;
        },
        { price: Infinity } // Initial value for reduce
      );

      return {
        ...product,
        cheapestPrice: cheapestVariant.price, // Direct numeric price
        image: product.image ? JSON.parse(product.image) : null,
      };
    });

    // Ensure additional filtering for cheapest price if necessary
    const filteredProducts = formattedProducts.filter((product) => {
      if (filters.maxPrice) {
        return product.cheapestPrice <= Number(filters.maxPrice); // Direct numeric comparison
      }
      return true;
    });

    return {
      products: filteredProducts,
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
