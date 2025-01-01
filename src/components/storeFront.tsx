'use client';
import { useCallback, useEffect, useState, useTransition } from 'react';
import FilterOptions from '@/components/filterOptions';
import SortOptions from '@/components/sortOptions';
import { fetchFilteredVendors, fetchPaginatedProducts } from '@/lib/actions';
import Pagination from './pagination';
import ProductCard from './productCard';
import { product, shop, variant } from '@prisma/client';
import { FilterOption } from '@/lib/types';

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

// TODO: Use query params to keep filters through page refresh
export default function StoreFront() {
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<FilterOption>({});
  const [sortOption, setSortOption] = useState<string | undefined>();
  const [brands, setBrands] = useState<string[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPending, startTransition] = useTransition(); // TODO: Implement spinner

  const loadProducts = useCallback(
    (page: number) => {
      startTransition(async () => {
        const data = await fetchPaginatedProducts(
          page,
          40,
          filters,
          sortOption
        );

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
      const filteredVendors = await fetchFilteredVendors(filters);
      setBrands(
        filteredVendors.filter((vendor): vendor is string => vendor !== null)
      );
    };

    loadVendors();
  }, [filters]);

  const handlePageChange = (page: number) => {
    loadProducts(page);
  };

  const handleFilterChange = (
    newFilters: Record<string, string | number | boolean | null>
  ) => {
    setFilters(newFilters);
  };

  const handleSortChange = (option: string) => {
    setSortOption(option);
  };

  return (
    <div>
      <div className="flex flex-col space-y-4 mb-4">
        <FilterOptions onFilterChange={handleFilterChange} brands={brands} />
        <div className="flex justify-between h-10">
          <SortOptions onSortChange={handleSortChange} />
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
            title={product.title}
            price={product.cheapestPrice as unknown as string}
            imageSrc={(product.image as ImageJson)?.src || '/placeholder.jpg'}
            handle={product.handle}
            skateShop={product.shop}
            parentProductType={product.parentProductType}
            childProductType={product.childProductType}
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
