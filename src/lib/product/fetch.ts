/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

//TODO: Actually I think fetchPaginatedProducts belongs in the actions with the rest of them and a new directory for filtering and sorting is more apporpriate
export const buildWhereClause = async (
  filters: Record<string, string | number | boolean | undefined> = {}
) => {
  const whereClause: Record<string, any> = {};

  if (filters.parentType) {
    whereClause.parentProductType = filters.parentType;
  }

  if (filters.childType) {
    whereClause.childProductType = filters.childType;
  }

  const variantConditions: any[] = [];

  if (filters.maxPrice) {
    const maxPrice = Number(filters.maxPrice);
    variantConditions.push({
      price: { lte: maxPrice },
    });
  }

  if (filters.shoeSize) {
    variantConditions.push({
      shoeSize: filters.shoeSize,
    });
  }

  if (filters.deckSize) {
    variantConditions.push({
      deckSize: filters.deckSize,
    });
  }

  if (variantConditions.length > 0) {
    whereClause.variants = {
      some: {
        AND: variantConditions,
      },
    };
  }

  if (filters.onSale === true) {
    whereClause.onSale = true;
  }

  return whereClause;
};


export const fetchPaginatedProducts = async (
  page: number,
  limit: number,
  filters: Record<string, string | number | boolean | undefined> = {},
  sortOptions?: string
) => {
  const offset = (page - 1) * limit;
  const whereClause = await buildWhereClause(filters);

  const orderBy: Prisma.ProductOrderByWithRelationInput[] = [];
  if (sortOptions === "price-asc") {
    orderBy.push({ cheapestPrice: "asc" });
  } else if (sortOptions === "price-desc") {
    orderBy.push({ cheapestPrice: "desc" });
  } else {
    orderBy.push({ createdAt: "desc" });
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    skip: offset,
    take: limit,
    orderBy,
    include: {
      shop: true,
      variants: true,
    },
  });

  const totalProducts = await prisma.product.count({
    where: whereClause,
  });

  return {
    products,
    totalProducts,
    currentPage: page,
    totalPages: Math.ceil(totalProducts / limit),
  };
};
