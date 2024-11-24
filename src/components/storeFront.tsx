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

  const loadProducts = useCallback(
    (page: number, newFilters?: Record<string, string | number>) => {
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
    },
    [filters]
  );

  useEffect(() => {
    loadProducts(1);
  }, [filters, loadProducts]);

  const handlePageChange = (page: number) => {
    loadProducts(page);
  };

  const handleFilterChange = (
    newFilters: Record<string, string | number | boolean>
  ) => {
    setFilters(newFilters);
  };

  const handleSortChange = (sortOption: string) => {
    console.log("Sort option:", sortOption);
    // TODO: Implement
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
