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
        // Get all approved duplicates for each product
        duplicateProducts: {
          where: { approvedDuplicate: true },
          include: {
            shop: true,
            variants: true
          }
        }
      }
    }),

    prisma.product.count({
      where: whereClause
    })
  ]);

  const mergedProducts = products.map((primary) => {
    if (primary.duplicateProducts) {
      console.log('duplicate products', primary.duplicateProducts)
    } 
    // For the storefront, we want to show one product listing with an array of
    // store/price info from itself and from each of its duplicates.

    // Start with the primary product's data
    const storeAndPrices = [
      {
        shopId: primary.shopId,
        shopName: primary.shop.name,
        variants: primary.variants,
        cheapestPrice: primary.cheapestPrice
      }
    ];

    // Add all approved duplicates
    for (const dup of primary.duplicateProducts) {
      storeAndPrices.push({
        shopId: dup.shopId,
        shopName: dup.shop.name,
        variants: dup.variants,
        cheapestPrice: dup.cheapestPrice
      });

      console.log('heres theres duplicates', dup)
    }


    return {
      ...primary,
      // We don't need to keep duplicateProducts as a separate array since we merged them
      duplicateProducts: undefined,
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