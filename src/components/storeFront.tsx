"use client";

import { useEffect, useState, useTransition } from "react";
import FilterOptions from "@/components/filterOptions";
import ProductGrid from "@/components/productGrid";
import SortOptions from "@/components/sortOptions";
import { fetchPaginatedProducts } from "@/lib/actions";

export default function StoreFront() {
  const [products, setProducts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState<Record<string, string | number>>({});

  // Fetch all products on initial load
  useEffect(() => {
    loadProducts(1, filters);
  }, [filters]);

  const loadProducts = (
    page: number,
    newFilters?: Record<string, string | number>
  ) => {
    startTransition(async () => {
      const data = await fetchPaginatedProducts(
        page,
        40,
        newFilters || filters
      );
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
    });
  };

  const handlePageChange = (page: number) => {
    loadProducts(page);
  };

  const handleFilterChange = (newFilters: Record<string, string | number>) => {
    setFilters(newFilters);
  };

  const handleSortChange = (sortOption: string) => {
    console.log("Sort option:", sortOption);
    // Implement backend integration for sorting if needed
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
