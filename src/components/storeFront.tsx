// components/storeFront.tsx
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    startTransition(async () => {
      const data = await fetchPaginatedProducts(page); // Direct server action call
      setProducts(data.products);
      setTotalPages(data.totalPages);
    });
  };

  const handleFilterChange = (filters: Record<string, any>) => {
    console.log("Filters applied:", filters);
    // Implement backend integration for filters
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
