"use client";

import { useState, useTransition } from "react";
import FilterOptions from "@/components/filterOptions";
import ProductGrid from "@/components/productGrid";
import SortOptions from "@/components/sortOptions";
import { fetchPaginatedProducts } from "@/lib/actions";

export default function StoreFront({ initialData }: { initialData: any }) {
  const [products, setProducts] = useState(initialData.products || []);
  const [currentPage, setCurrentPage] = useState(initialData.currentPage || 1);
  const [totalPages, setTotalPages] = useState(initialData.totalPages || 1);
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState<Record<string, string | number>>({}); // Track active filters

  const loadProducts = (
    page: number,
    newFilters?: Record<string, string | number>
  ) => {
    startTransition(async () => {
      const data = await fetchPaginatedProducts(
        page,
        40,
        newFilters || filters
      ); // Pass filters
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
    });
  };

  const handlePageChange = (page: number) => {
    loadProducts(page);
  };

  const handleFilterChange = (newFilters: Record<string, string | number>) => {
    setFilters(newFilters); // Update the filter state
    loadProducts(1, newFilters); // Fetch filtered products from the first page
  };

  const handleSortChange = (sortOption: string) => {
    console.log("Sort option:", sortOption);
    // Implement backend integration for sorting
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
        // isLoading={isPending}
      />
    </div>
  );
}
