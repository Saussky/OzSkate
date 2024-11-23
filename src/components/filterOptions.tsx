"use client";

// components/FilterOptions.tsx
import { useState } from "react";

interface FilterOptionsProps {
  onFilterChange: (filters: Record<string, string | number>) => void;
}

export default function FilterOptions({ onFilterChange }: FilterOptionsProps) {
  const [category, setCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  const handleApplyFilters = () => {
    onFilterChange({ category, maxPrice });
  };

  return (
    <div className="flex space-x-4">
      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="border rounded p-2"
      />
      <input
        type="number"
        placeholder="Max Price"
        value={maxPrice}
        onChange={(e) => setMaxPrice(Number(e.target.value) || "")}
        className="border rounded p-2"
      />
      <button
        onClick={handleApplyFilters}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Apply
      </button>
    </div>
  );
}
