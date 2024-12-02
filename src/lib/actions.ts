"use server";
import { prisma } from "@/lib/prisma";
import { buildWhereClause, processShop } from "./helpers";

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

    await updateProducts();

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
  filters: Record<string, string | number | boolean | undefined> = {},
  sortOptions?: string
) => {
  const skip = (page - 1) * limit;

  try {
    const whereClause = buildWhereClause(filters);

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

    const formattedProducts = products.map((product) => {
      const cheapestVariant = product.variants.reduce(
        (cheapest, variant) => {
          const cheapestPrice = cheapest.price ?? Infinity;
          return variant.price < cheapestPrice ? variant : cheapest;
        },
        { price: Infinity }
      );

      return {
        ...product,
        cheapestPrice: cheapestVariant.price,
        image: product.image ? JSON.parse(product.image) : null,
      };
    });

    if (sortOptions === "price-asc") {
      formattedProducts.sort((a, b) => a.cheapestPrice - b.cheapestPrice);
    } else if (sortOptions === "price-desc") {
      formattedProducts.sort((a, b) => b.cheapestPrice - a.cheapestPrice);
    }

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

export const updateProducts = async () => {
  const products = await prisma.product.findMany({
    include: {
      variants: true,
    },
  });

  for (const product of products) {
    const onSaleVariant = product.variants.find(
      (variant) => variant.compareAtPrice !== null
    );

    const onSale = !!onSaleVariant;
    const onSaleVariantId = onSaleVariant ? onSaleVariant.id : null;

    await prisma.product.update({
      where: { id: product.id },
      data: {
        onSale,
        on_sale_variant_id: onSaleVariantId,
      },
    });
  }
};
