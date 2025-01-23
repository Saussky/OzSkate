'use client';
import { useCallback, useEffect, useState, useTransition } from 'react';
import Filter from '@/components/filter';
import Sort from '@/components/sort';
import {
  getFilteredVendors,
  getPaginatedProducts,
  getShopNames,
} from '@/lib/actions';
import Pagination from './pagination';
import ProductCard from './productCard';
import { product, shop, variant } from '@prisma/client';
import { FilterOption, User } from '@/lib/types';
import { useSearchParams, useRouter } from 'next/navigation';

type ImageJson = {
  src: string;
  width?: number;
  height?: number;
  alt?: string;
};

export interface ExtendedProduct extends product {
  shop: shop;
  variants: variant[];
  image: ImageJson | null;
}

// TODO: Shorten and simplify query params, possibly separate
export default function StoreFront(user: User | null) {
  const searchParams = useSearchParams();
  const router = useRouter();

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
  };
  const initialSortOption = searchParams.get('sortOption') || 'latest';
  const initialPage = searchParams.get('page')
    ? Number(searchParams.get('page'))
    : 1;

  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<FilterOption>(initialFilters);
  const [sortOption, setSortOption] = useState<string>(initialSortOption);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [brands, setBrands] = useState<string[]>([]);
  const [shops, setShops] = useState<string[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPending, startTransition] = useTransition(); // TODO: Implement spinner

  const updateQueryParams = useCallback(() => {
    const query = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        query.set(key, String(value));
      }
    });

    if (sortOption) query.set('sortOption', sortOption);
    query.set('page', String(currentPage));

    router.push(`?${query.toString()}`);
  }, [currentPage, filters, router, sortOption]);

  // TODO: Load products at page level?
  const loadProducts = useCallback(
    (page: number) => {
      startTransition(async () => {
        const data = await getPaginatedProducts(page, 40, filters, sortOption);

        const transformedProducts: ExtendedProduct[] = data.products.map(
          (product) => {
            const image = product.image as ImageJson | null;

            return {
              ...product,
              image,
            };
          }
        );

        setProducts(transformedProducts);
        setTotalPages(data.totalPages);
        setCurrentPage(page);
      });
    },
    [filters, sortOption]
  );

  useEffect(() => {
    loadProducts(1);
  }, [filters, sortOption, loadProducts]);

  useEffect(() => {
    const loadVendors = async () => {
      const filteredVendors = await getFilteredVendors(filters);
      setBrands(
        filteredVendors.filter((vendor): vendor is string => vendor !== null)
      );
    };

    loadVendors();
  }, [filters]);

  useEffect(() => {
    const loadShopNames = async () => {
      const shopNames = await getShopNames();
      setShops(shopNames);
    };

    loadShopNames();
  }, []);

  const handlePageChange = (page: number) => {
    loadProducts(page);
  };

  useEffect(() => {
    updateQueryParams();
  }, [filters, sortOption, currentPage, updateQueryParams]);

  const handleFilterChange = (
    newFilters: Record<string, string | number | boolean | null>
  ) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSortChange = (option: string) => {
    setSortOption(option);
    setCurrentPage(1);
  };

  return (
    <div>
      <div className="flex flex-col space-y-4 mb-4">
        <Filter
          onFilterChange={handleFilterChange}
          brands={brands}
          shops={shops}
          initialFilters={initialFilters}
        />

        <div className="flex justify-between h-10">
          <Sort onSortChange={handleSortChange} sortOption={sortOption} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            admin={user?.admin || false}
            title={product.title}
            price={product.cheapestPrice as unknown as string}
            imageSrc={(product.image as ImageJson)?.src || '/placeholder.jpg'} //TODO: Double fallback
            handle={product.handle}
            shop={product.shop}
            parentType={product.parentType}
            childType={product.childType}
          />
        ))}
      </div>

      <div className="flex justify-between">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
