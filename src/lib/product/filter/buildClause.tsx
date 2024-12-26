/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { Prisma } from "@prisma/client";

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

export const buildOrderByClause = async (sortOptions?: string) => {
  const orderBy: Prisma.productOrderByWithRelationInput[] = [];

  if (sortOptions === "price-asc") {
    orderBy.push({ cheapestPrice: "asc" });
  } else if (sortOptions === "price-desc") {
    orderBy.push({ cheapestPrice: "desc" });
  } else {
    orderBy.push({ createdAt: "desc" });
  }

  return orderBy;
}
