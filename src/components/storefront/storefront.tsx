'use client';
import { useCallback, useEffect, useState, useTransition } from 'react';
import Filter from '@/components/storefront/filter';
import { product, shop, variant } from '@prisma/client';
import { FilterOption, User } from '@/lib/types';
import useStoreFrontQueryParams from '@/lib/hooks';
import Pagination from '../shared/pagination';
import ProductCard from '../shared/product-card/productCard';
import { getFilteredVendors, getPaginatedProducts } from './actions';
import { getShopNames } from '../admin/admin/actions';

type ImageJson = {
  src: string;
  width?: number;
  height?: number;
  alt?: string;
};

interface StorePriceInfo {
  shopId: number;
  shopName: string;
  cheapestPrice: number | null;
  variants: variant[];
}

export interface ExtendedProduct extends product {
  shop: shop;
  variants: variant[];
  image: ImageJson | null;
  allStorePrices?: StorePriceInfo[];
}

interface StorefrontProps {
  user: User | null;
}

export default function Storefront({ user }: StorefrontProps) {
  const { initialFilters, initialSortOption, initialPage, updateQueryParams } =
    useStoreFrontQueryParams();

  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<FilterOption>(initialFilters);
  const [sortOption, setSortOption] = useState<string>(initialSortOption);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [brands, setBrands] = useState<string[]>([]);
  const [shops, setShops] = useState<string[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPending, startTransition] = useTransition(); // TODO: Implement spinner

  useEffect(() => {
    updateQueryParams(filters, sortOption, currentPage);
  }, [filters, sortOption, currentPage, updateQueryParams]);

  // TODO: Load products at page level?
  const loadProducts = useCallback(
    (page: number) => {
      startTransition(async () => {
        const data = await getPaginatedProducts(page, 40, filters, sortOption);

        const transformedProducts: ExtendedProduct[] = data.mergedProducts.map(
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
    <div className="p-6 mt-1 bg-gray-100">
      <div className="flex flex-col space-y-1 mb-2">
        <Filter
          onFilterChange={handleFilterChange}
          brands={brands}
          shops={shops}
          initialFilters={initialFilters}
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

      <div className="grid grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            admin={user?.admin || false}
            title={product.title}
            price={String(product.cheapestPrice ?? '')}
            imageSrc={product.image?.src || '/placeholder.jpg'} //todo; fallback
            handle={product.handle}
            shop={product.shop}
            parentType={product.parentType}
            childType={product.childType}
            allStorePrices={product.allStorePrices}
          />
        ))}
      </div>

      <div className="flex mt-2">
        <div className="flex justify-between ml-auto">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
