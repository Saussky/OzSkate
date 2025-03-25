/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';
import { prisma } from "@/lib/prisma";
import { buildOrderByClause, buildWhereClause } from "@/lib/product/filter/buildClause";
import { FilterOption } from "@/lib/types";

export const getPaginatedProducts = async (
  page: number,
  limit: number,
  filters: Record<string, string | number | boolean | null> = {},
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
        // Get confirmed duplicates via join table
        duplicatesAsMaster: {
          where: { status: 'confirmed' },
          include: {
            duplicateProduct: {
              include: {
                shop: true,
                variants: true
              }
            }
          }
        }
      }
    }),

    prisma.product.count({ where: whereClause })
  ]);

  const mergedProducts = products.map((primary) => {
    const storeAndPrices = [
      {
        shopId: primary.shopId,
        shopName: primary.shop.name,
        state: primary.shop.state,
        variants: primary.variants,
        cheapestPrice: primary.cheapestPrice
      }
    ];

    for (const { duplicateProduct } of primary.duplicatesAsMaster) {
      if (!duplicateProduct) continue;



      storeAndPrices.push({
        shopId: duplicateProduct.shopId,
        shopName: duplicateProduct.shop.name,
        state: duplicateProduct.shop.state,
        variants: duplicateProduct.variants,
        cheapestPrice: duplicateProduct.cheapestPrice
      });
    }

    return {
      ...primary,
      // duplicatesAsMaster: undefined, // omit raw duplicates from response
      allStorePrices: storeAndPrices
    };
  });

  return {
    mergedProducts,
    totalProducts,
    currentPage: page,
    totalPages: Math.ceil(totalProducts / limit),
  };
};


export const getFilteredVendors = async (
  filters: FilterOption = {}
) => {
  try {
    const { parentType, childType } = filters;
    const whereClause: Record<string, any> = {};

    if (parentType) whereClause.parentType = parentType;
    if (childType) whereClause.childType = childType;

    const vendors = await prisma.product.findMany({
      where: whereClause,
      select: { vendor: true },
      distinct: ['vendor'],
      orderBy: { vendor: 'asc' }
    });

    return vendors.map((prod) => prod.vendor).filter((vendor) => vendor);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return [];
  }
};