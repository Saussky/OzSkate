"use client";

import { useState } from "react";

const parentProductTypes = [
  "Clothing",
  "Skateboards",
  "Protective Gear",
  "Shoes",
  "Bags",
  "Accessories",
];

const childProductTypes: Record<string, string[]> = {
  Clothing: [
    "Mens Jumpers",
    "Mens Shirts",
    "Mens T-Shirts",
    "Mens Pants",
    "Mens Shorts",
    "Womens Jumpers",
    "Womens Shirts",
    "Womens T-Shirts",
    "Womens Pants",
    "Womens Shorts",
    "Hats",
    "Beanies",
    "Socks",
  ],
  Skateboards: [
    "Decks",
    "Completes",
    "Trucks",
    "Wheels",
    "Bearings",
    "Tools",
    "Hardware",
  ],
  "Protective Gear": ["Pads", "Helmets", "Other"],
  Shoes: ["Shoes"],
  Bags: ["Backpacks", "Tote Bags"],
  Accessories: [
    "Belts",
    "Watches",
    "Sunglasses",
    "Literature",
    "Wax",
    "Keychains",
    "Jewellery",
    "Other",
  ],
};

// TODO: Import from const file
interface FilterOptionsProps {
  onFilterChange: (filters: Record<string, string | number | boolean>) => void;
}

export default function FilterOptions({ onFilterChange }: FilterOptionsProps) {
  const [parentType, setParentType] = useState<string | "">("");
  const [childType, setChildType] = useState<string | "">("");

  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [onSale, setOnSale] = useState(false);

  const handleApplyFilters = () => {
    onFilterChange({ parentType, childType, maxPrice, onSale });
  };

  const handleClearFilters = () => {
    setParentType("");
    setChildType("");
    setMaxPrice("");
    setOnSale(false);
    onFilterChange({
      parentType: "",
      childType: "",
      maxPrice: "",
      onSale: false,
    });
  };

  return (
    <div className="flex flex-wrap space-x-4">
      <select
        value={parentType}
        onChange={(e) => {
          setParentType(e.target.value);
          setChildType(""); // Reset childType when parentType changes
        }}
        className="border rounded p-2"
      >
        <option value="">Select Parent Type</option>
        {parentProductTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      <select
        value={childType}
        onChange={(e) => setChildType(e.target.value)}
        className="border rounded p-2"
        disabled={!parentType}
      >
        <option value="">Select Child Type</option>
        {parentType &&
          childProductTypes[parentType]?.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
      </select>

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
