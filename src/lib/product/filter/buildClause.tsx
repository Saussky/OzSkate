/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';
import { FilterOption } from '@/lib/types';
import { Prisma } from '@prisma/client';

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

  if (filters.shop) {
    whereClause.shop = {
      name: filters.shop,
    };
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

  if (sortOptions === 'price-asc') {
    orderBy.push({ cheapestPrice: 'asc' });
  } else if (sortOptions === 'price-desc') {
    orderBy.push({ cheapestPrice: 'desc' });
  } else {
    orderBy.push({ createdAt: 'desc' });
  }

  return orderBy;
};
