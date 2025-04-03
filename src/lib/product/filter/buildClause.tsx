/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { FilterOption } from "@/lib/types";
import { Prisma } from "@prisma/client";

export const buildWhereClause = async (filters: FilterOption = {}) => {
  const whereClause: Record<string, any> = {};

  if (filters.parentType) {
    whereClause.parentType = filters.parentType;
  }

  if (filters.childType) {
    whereClause.childType = filters.childType;
  }

  if (filters.vendor) {
    whereClause.vendor = filters.vendor;
  }

  if (filters.shops) {
    whereClause.shop = {
      name: { in: filters.shops },
    };
  }

  if (filters.searchTerm) {
    whereClause.OR = [
      { title: { contains: filters.searchTerm, mode: "insensitive" } },
      { vendor: { contains: filters.searchTerm, mode: "insensitive" } },
      // { description: { contains: filters.searchTerm, mode: 'insensitive' } },
      // { handle: { contains: filters.searchTerm, mode: 'insensitive' } },
    ];
  }

  const variantConditions: any[] = [];

  // Removes unavailable products
  // Potentially computatitonally expensive, might be simpler to calculate in transfrom similar to cheapestPrice column
  if (variantConditions.length > 0) {
    whereClause.variants = {
      some: {
        available: true,
        AND: variantConditions,
      },
    };
  } else {
    whereClause.variants = {
      some: {
        available: true,
      },
    };
  }

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

  // whereClause.approvedDuplicate = false; // Filter out duplicates
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
};
