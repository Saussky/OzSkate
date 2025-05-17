'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterOption } from '@/lib/types';

const defaultFilters: FilterOption = {
  parentType: '',
  childType: '',
  maxPrice: '',
  onSale: false,
  shoeSize: null,
  deckSize: null,
  brands: [],
  shops: [],
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
      brands: searchParams.getAll('brands') ?? defaultFilters.brands,
      shops: searchParams.getAll('shops') ?? defaultFilters.shops,
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
        value !== defaultValue &&
        value !== null &&
        !(Array.isArray(value) ? value.length === 0 : value === '')
      ) {
       if (Array.isArray(value)) {
         value.forEach((v) => query.append(key, String(v)));
       } else {
         query.set(key, String(value));
        }
      }
    });
        // TODO: if (key === 'onSale' && value === true) query.set('onSale', 'true');

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


export function useIsMobile(breakpoint = 640) { //TODO: More specific breakpoint, investigate sizes.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Check immediately on mount
    handleResize();

    // Listen for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}
