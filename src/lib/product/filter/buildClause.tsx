/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';
import { FilterOption } from '@/lib/types';
import { Prisma } from '@prisma/client';

const stripCount = (label: string): string =>
  label.replace(/\s*\(\d+\)\s*$/, '');

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

  if (filters.brands && (filters.brands as string[]).length > 0) {
    whereClause.vendor = {
      in: (filters.brands as string[]).map(stripCount),
    };
  }

  if (filters.shops && (filters.shops as string[]).length > 0) {
    whereClause.shop = {
      name: { in: filters.shops as string[] },
    };
  }

  if (filters.searchTerm) {
    whereClause.OR = [
      { title: { contains: filters.searchTerm, mode: 'insensitive' } },
      { vendor: { contains: filters.searchTerm, mode: 'insensitive' } },
      // { description: { contains: filters.searchTerm, mode: 'insensitive' } },
      // { handle:      { contains: filters.searchTerm, mode: 'insensitive' } },
    ];
  }

  whereClause.cheapestPrice = { gt: 0 };

  const variantConditions: any[] = [{ price: { gt: 0 } }, { available: true }];

  if (filters.maxPrice) {
    const maxPrice = Number(filters.maxPrice);
    variantConditions.push({ price: { lte: maxPrice } });
  }

  if (filters.shoeSize) {
    variantConditions.push({ shoeSize: filters.shoeSize });
  }

  if (filters.deckSize) {
    variantConditions.push({ deckSize: filters.deckSize });
  }

  whereClause.variants = {
    some: {
      AND: variantConditions,
    },
  };

  if (filters.onSale === true) {
    whereClause.onSale = true;
  }

  // whereClause.approvedDuplicate = false; // Filter out duplicates
  return whereClause;
};

export type SortOption = 'price-asc' | 'price-desc' | 'latest' | 'last-updated';

export const buildOrderByClause = async (
  selectedSortOption?: SortOption
): Promise<Prisma.productOrderByWithRelationInput[]> => {
  const orderBy: Prisma.productOrderByWithRelationInput[] = [];

  switch (selectedSortOption) {
    case 'price-asc':
      orderBy.push({ cheapestPrice: 'asc' });
      break;

    case 'price-desc':
      orderBy.push({ cheapestPrice: 'desc' });
      break;

    case 'last-updated':
      orderBy.push({ updatedAt: 'desc' });
      break;

    case 'latest':
    default:
      orderBy.push({ createdAt: 'desc' });
      break;
  }

  return orderBy;
};
