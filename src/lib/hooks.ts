'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { FilterOption } from '@/lib/types';

/**
 * A hook that extracts the initial query params (filters, sortOption, page)
 * from the URL. Also provides a function to update the URL whenever
 * these values change.
 */
export default function useStoreFrontQueryParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract initial values from the URL
  const initialFilters: FilterOption = {
    parentType: searchParams.get('parentType') || '',
    childType: searchParams.get('childType') || '',
    maxPrice: searchParams.get('maxPrice')
      ? Number(searchParams.get('maxPrice'))
      : '',
    onSale: searchParams.get('onSale') === 'true',
    shoeSize: searchParams.get('shoeSize')
      ? Number(searchParams.get('shoeSize'))
      : null,
    deckSize: searchParams.get('deckSize')
      ? Number(searchParams.get('deckSize'))
      : null,
    vendor: searchParams.get('vendor') || '',
    shop: searchParams.get('shop') || '',
    searchTerm: searchParams.get('searchTerm') || '',
  };

  const initialSortOption = searchParams.get('sortOption') || 'latest';
  const initialPage = searchParams.get('page')
    ? Number(searchParams.get('page'))
    : 1;

  // A helper to push updated params to the URL
  const updateQueryParams = useCallback(
    (filters: FilterOption, sortOption: string, currentPage: number) => {
      const query = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          query.set(key, String(value));
        }
      });

      if (sortOption) {
        query.set('sortOption', sortOption);
      }

      query.set('page', String(currentPage));

      router.push(`?${query.toString()}`);
    },
    [router]
  );

  return {
    initialFilters,
    initialSortOption,
    initialPage,
    updateQueryParams,
  };
}
