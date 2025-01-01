"use server";
import { prisma } from "@/lib/prisma";
import { processShop } from "./helpers";
import { buildOrderByClause, buildWhereClause } from "./product/filter/buildClause";
import { FilterOption } from "./types";

// TODO: Rename gets and fetches, choose one
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

export async function deleteAllProducts() {
  try {
    // TODO: Cascading deletes would be better
    await prisma.variant.deleteMany();
    await prisma.option.deleteMany();
    await prisma.product.deleteMany();

    console.log("All products, variants, and options have been deleted.");
  } catch (error) {
    console.error("Error deleting all products:", error);
  }
}

export async function refreshCounts() {
  const productCount = await getProductCount();
  const shopCount = await getShopCount();
  return { shopCount, productCount };
}

export async function fetchAllProducts() {
  try {
    console.log("Starting product import...");

    const shops = await prisma.shop.findMany();

    // for (const shop of shops) {
    //   try {
    //     console.log(`Processing shop: ${shop.name} ${index}/${shops.length}`);
    //     await processShop(shop);
    //   } catch (error) {
    //     console.error(`Error processing shop ${shop.name}:`, error);
    //   }
    // }

    for (let index = 0; index < shops.length; index++) {
      const shop = shops[index];
      try {
        console.log(`Processing shop: ${shop.name} ${index + 1}/${shops.length}`);
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

export const fetchPaginatedProducts = async (
  page: number,
  limit: number,
  filters: Record<string, string | number | boolean | null | undefined> = {},
  sortOptions?: string
) => {
  const offset = (page - 1) * limit;
  const whereClause = await buildWhereClause(filters);
  const orderBy = await buildOrderByClause(sortOptions);

  const [products, totalProducts] = await prisma.$transaction([
    prisma.product.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
      orderBy,
      include: {
        shop: true,
        variants: true,
      },
    }),

    prisma.product.count({
      where: whereClause,
    }),
  ]);

  return {
    products,
    totalProducts,
    currentPage: page,
    totalPages: Math.ceil(totalProducts / limit),
  };
};

export const fetchFilteredVendors = async (
  filters: FilterOption = {}
) => {
  try {
    const whereClause = await buildWhereClause(filters);

    const vendors = await prisma.product.findMany({
      where: whereClause,
      select: {
        vendor: true,
      },
      distinct: ['vendor'],
    });

    return vendors.map((variant) => variant.vendor).filter((vendor) => vendor); 
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return [];
  }
};

export async function setProductTypes(
  productId: string,
  parentProductType: string, // TODO: Use real types
  childProductType: string
) {
  try {
    return await prisma.product.update({
      where: { id: productId },
      data: {
        parentProductType,
        childProductType,
      },
    });
  } catch (error) {
    console.error("Error updating product types:", error);
    throw error;
  }
}
