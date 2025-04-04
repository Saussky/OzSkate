'use client';
import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterOption } from '@/lib/types';

/** You can adjust these defaults as needed. */
const defaultFilters: FilterOption = {
  parentType: '',
  childType: '',
  maxPrice: '',
  onSale: false,
  shoeSize: null,
  deckSize: null,
  vendor: '',
  shop: '',
  searchTerm: '',
};

const defaultSortOption = 'latest';
const defaultPage = 1;

interface StoreFrontQueryParams {
  filters: FilterOption;
  sortOption: string;
  page: number;
}

export default function useStoreFrontQueryParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get query params from URL, falling back to defaults
  const queryParams = useMemo<StoreFrontQueryParams>(() => {
    const filters: FilterOption = {
      parentType: searchParams.get('parentType') ?? defaultFilters.parentType,
      childType: searchParams.get('childType') ?? defaultFilters.childType,
      maxPrice: searchParams.get('maxPrice')
        ? Number(searchParams.get('maxPrice'))
        : defaultFilters.maxPrice,
      onSale: searchParams.get('onSale') === 'true',
      shoeSize: searchParams.get('shoeSize')
        ? Number(searchParams.get('shoeSize'))
        : defaultFilters.shoeSize,
      deckSize: searchParams.get('deckSize')
        ? Number(searchParams.get('deckSize'))
        : defaultFilters.deckSize,
      vendor: searchParams.get('vendor') ?? defaultFilters.vendor,
      shop: searchParams.get('shop') ?? defaultFilters.shop,
      searchTerm: searchParams.get('searchTerm') ?? defaultFilters.searchTerm,
    };

    const sortOption = searchParams.get('sortOption') ?? defaultSortOption;
    const page = Number(searchParams.get('page') ?? defaultPage);

    return {
      filters,
      sortOption,
      page,
    };
  }, [searchParams]);

  /**
   * Set the URL query string, omitting defaults:
   * - If a filter matches the default, do NOT add it.
   * - If sortOption === 'latest', omit it.
   * - If page === 1, omit it.
   */
  const setQueryParams = useCallback(
    (params: StoreFrontQueryParams) => {
      const { filters, sortOption, page } = params;
      const query = new URLSearchParams();

      // Only populate filter params if they differ from defaults
      Object.entries(filters).forEach(([key, value]) => {
        const defaultValue = defaultFilters[key as keyof FilterOption];

        if (
          value !== defaultValue && // different from default
          value !== null && // not null
          value !== '' // not empty string
        ) {
          query.set(key, String(value));
        }

        // Special handling for 'onSale' if you want to omit 'false'
        // e.g. if (key === 'onSale' && value === true) query.set('onSale', 'true');
      });

      if (sortOption !== defaultSortOption) {
        query.set('sortOption', sortOption);
      }
      if (page !== defaultPage) {
        query.set('page', String(page));
      }

      router.push(query.toString() ? `?${query.toString()}` : '?');
    },
    [router]
  );

  return {
    queryParams,
    setQueryParams,
  };
}
