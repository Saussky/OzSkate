"use client";

import { useState } from "react";

interface FilterOptionsProps {
  onFilterChange: (filters: Record<string, string | number | boolean>) => void;
}

export default function FilterOptions({ onFilterChange }: FilterOptionsProps) {
  const [category, setCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [onSale, setOnSale] = useState(false);

  const handleApplyFilters = () => {
    onFilterChange({ category, maxPrice, onSale });
  };

  const handleClearFilters = () => {
    setCategory("");
    setMaxPrice("");
    setOnSale(false);
    onFilterChange({ category: "", maxPrice: "", onSale: false });
  };

  return (
    <div className="flex flex-wrap space-x-4">
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
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={onSale}
          onChange={(e) => setOnSale(e.target.checked)}
          className="w-4 h-4"
        />
        <span>On Sale</span>
      </label>
      <button
        onClick={handleApplyFilters}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Apply
      </button>
      <button
        onClick={handleClearFilters}
        className="bg-gray-300 text-black px-4 py-2 rounded"
      >
        Clear Filters
      </button>
    </div>
  );
}
