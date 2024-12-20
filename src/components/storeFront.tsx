"use client";
import { useCallback, useEffect, useState, useTransition } from "react";
import FilterOptions from "@/components/filterOptions";
import ProductGrid from "@/components/productGrid";
import SortOptions from "@/components/sortOptions";
import { fetchPaginatedProducts } from "@/lib/actions";
import { Product } from "@prisma/client";

export default function StoreFront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState<
    Record<string, string | number | boolean>
  >({});
  const [sortOption, setSortOption] = useState<string | undefined>();

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

  const handlePageChange = (page: number) => {
    loadProducts(page);
  };

  const handleFilterChange = (
    newFilters: Record<string, string | number | boolean > //TODO: Add null possibility
  ) => {
    setFilters(newFilters);
  };

  const handleSortChange = (option: string) => {
    setSortOption(option);
  };

  return (
    <div>
      <div className="flex space-x-4 mb-8">
        <FilterOptions onFilterChange={handleFilterChange} />
        <SortOptions onSortChange={handleSortChange} />
      </div>
      <div>
        <ProductGrid
          products={products}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
