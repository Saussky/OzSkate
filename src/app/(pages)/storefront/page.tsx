// pages/storefront.tsx
"use client";

import { useState, useEffect } from "react";
import FilterOptions from "@/components/filterOptions";
import ProductGrid from "@/components/productGrid";
import SortOptions from "@/components/sortOptions";
import { fetchProducts } from "@/lib/service";

export default function Storefront() {
  const [products, setProducts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadProducts = async () => {
      const { products, totalPages } = await fetchProducts(currentPage);
      setProducts(products);
      setTotalPages(totalPages);
    };

    loadProducts();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Storefront</h1>
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
