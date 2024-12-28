'use client';
import { useCallback, useEffect, useState, useTransition } from 'react';
import FilterOptions from '@/components/filterOptions';
import SortOptions from '@/components/sortOptions';
import { fetchFilteredVendors, fetchPaginatedProducts } from '@/lib/actions';
import Pagination from './pagination';
import ProductCard from './productCard';
import { product } from '@prisma/client';

// TODO: Use query params to keep filters through page refresh
export default function StoreFront() {
  const [products, setProducts] = useState<product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<
    Record<string, string | number | boolean>
  >({});
  const [sortOption, setSortOption] = useState<string | undefined>();
  const [brands, setBrands] = useState<string[]>([]);

  const [isPending, startTransition] = useTransition(); // TODO: Implement spinner

  const loadProducts = useCallback(
    (page: number, newFilters?: Record<string, string | number | boolean>) => {
      startTransition(async () => {
        const data = await fetchPaginatedProducts(
          page,
          40,
          newFilters || filters,
          sortOption
        );
        setProducts(data.products);
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
      setBrands(filteredVendors);
    };

    loadVendors();
  }, [filters]);

  const handlePageChange = (page: number) => {
    loadProducts(page);
  };

  const handleFilterChange = (
    newFilters: Record<string, string | number | boolean> //TODO: Add null possibility
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
        <div className="flex justify-between">
          <SortOptions onSortChange={handleSortChange} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <div className="flex-1">
          <div className="grid grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.cheapestPrice as unknown as string}
                imageSrc={product.image?.src}
                handle={product.handle}
                skateShop={product.shop}
                parentProductType={product.parentProductType}
                childProductType={product.childProductType}
              />
            ))}
          </div>
        </div>
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
