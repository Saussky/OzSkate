'use client';
import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterOption } from '@/lib/types';

interface StoreFrontQueryParams {
  filters: FilterOption;
  sortOption: string;
  page: number;
}

export default function useStoreFrontQueryParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive all query params from the URL in one go:
  const queryParams = useMemo<StoreFrontQueryParams>(() => {
    const filters: FilterOption = {
      parentType: searchParams.get('parentType') ?? '',
      childType: searchParams.get('childType') ?? '',
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
      vendor: searchParams.get('vendor') ?? '',
      shop: searchParams.get('shop') ?? '',
      searchTerm: searchParams.get('searchTerm') ?? '',
    };

    const sortOption = searchParams.get('sortOption') ?? 'latest';
    const page = Number(searchParams.get('page') ?? 1);

    return {
      filters,
      sortOption,
      page,
    };
  }, [searchParams]);


  const setQueryParams = useCallback(
    (params: StoreFrontQueryParams) => {
      const { filters, sortOption, page } = params;
      const query = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          query.set(key, String(value));
        }
      });

      if (sortOption) {
        query.set('sortOption', sortOption);
      }

      query.set('page', String(page));
      router.push(`?${query.toString()}`);
    },
    [router]
  );

  return {
    queryParams,
    setQueryParams,
  };
}
