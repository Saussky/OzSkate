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
          sortOption // Pass the current sortOption
        );
        setProducts(data.products);
        setTotalPages(data.totalPages);
        setCurrentPage(page);
      });
    },
    [filters, sortOption] // Re-run when filters or sortOption change
  );

  useEffect(() => {
    loadProducts(1); // Load the first page when filters or sortOption change
  }, [filters, sortOption, loadProducts]);

  const handlePageChange = (page: number) => {
    loadProducts(page);
  };

  const handleFilterChange = (
    newFilters: Record<string, string | number | boolean>
  ) => {
    setFilters(newFilters); // Update filters
  };

  const handleSortChange = (option: string) => {
    setSortOption(option); // Update sortOption
  };

  return (
    <div>
      <div className="flex space-x-4 mb-8">
        <FilterOptions onFilterChange={handleFilterChange} />
        <SortOptions onSortChange={handleSortChange} />
      </div>
      <ProductGrid
        products={products}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
