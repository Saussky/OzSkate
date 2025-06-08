'use client';
import { useCallback, useEffect, useState, useTransition } from 'react';
import Filter from '@/components/storefront/filter';
import { product, shop, variant } from '@prisma/client';
import { FilterOption, User } from '@/lib/types';
// import useStoreFrontQueryParams, { useIsMobile } from '@/lib/hooks';
import Pagination from '../shared/pagination';
import ProductCard from '../shared/product-card/productCard';
import { getFilteredVendors, getPaginatedProducts } from './actions';
import { getShopNames } from '../admin/admin/actions';
import useStoreFrontQueryParams from '@/lib/hooks';
import { SortOption } from '@/lib/product/filter/buildClause';
// import MobileProductCard from '../shared/product-card/mobileProductCard';

type ImageJson = {
  src: string;
  width?: number;
  height?: number;
  alt?: string;
};

interface StorePriceInfo {
  shopId: number;
  shopName: string;
  state: string;
  cheapestPrice: number | null;
  variants: variant[];
}

export interface ExtendedProduct extends product {
  shop: shop;
  variants?: variant[];
  image: ImageJson | null;
  allStorePrices?: StorePriceInfo[];
}

interface StorefrontProps {
  user: User | null;
}

export default function Storefront({ user }: StorefrontProps) {
  const { queryParams, setQueryParams } = useStoreFrontQueryParams();
  const [filters, setFilters] = useState<FilterOption>(queryParams.filters);
  const [sortOption, setSortOption] = useState<SortOption>(
    queryParams.sortOption as SortOption
  );
  const [currentPage, setCurrentPage] = useState<number>(queryParams.page);

  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [allBrands, setAllBrands] = useState<string[]>([]);
  const [allShops, setAllShops] = useState<string[]>([]);

  // const isMobile = useIsMobile(); // defaults to 640px; can customize

  // TODO: Use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setQueryParams({ filters, sortOption, page: currentPage });
  }, [filters, sortOption, currentPage, setQueryParams]);

  const loadProducts = useCallback(
    (page: number) => {
      startTransition(async () => {
        const data = await getPaginatedProducts(page, 40, filters, sortOption);
        const transformed: ExtendedProduct[] = data.mergedProducts.map((p) => ({
          ...p,
          image: p.image as ImageJson | null, // TODO: Why are we doing this the types are f'ed anyway
        }));
        setProducts(transformed);
        setTotalPages(data.totalPages);
        setCurrentPage(page);
      });
    },
    [filters, sortOption]
  );

  // Always reset to first page when filters or sort changes
  useEffect(() => {
    loadProducts(1);
  }, [filters, sortOption, loadProducts]);

  useEffect(() => {
    const loadVendors = async () => {
      const filteredVendors = await getFilteredVendors(filters);
      setAllBrands(
        filteredVendors.map(({ vendor, count }) => `${vendor} (${count})`)
      );
    };
    loadVendors();
  }, [filters]);

  useEffect(() => {
    const loadShopNames = async () => {
      const shopNames = await getShopNames();
      setAllShops(shopNames);
    };
    loadShopNames();
  }, []);

  const handlePageChange = (page: number) => {
    loadProducts(page);
  };

  const handleFilterChange = (newFilters: FilterOption) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    setCurrentPage(1);
  };

  return (
    <div className="p-6 mt-1 bg-gray-100">
      <div className="flex flex-col space-y-1 mb-2">
        <Filter
          onFilterChange={handleFilterChange}
          allBrands={allBrands}
          allShops={allShops}
          initialFilters={queryParams.filters}
          onSortChange={handleSortChange}
          sortOption={sortOption}
        />

        <div className="flex justify-between h-6 ml-auto">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            admin={user?.admin || false}
            product={product}
          />
        ))}
      </div>

      <div className="flex mt-2 justify-between">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
