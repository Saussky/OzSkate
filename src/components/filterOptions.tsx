"use client";
import { ParentProductType } from "@/lib/types";
import { useState } from "react";

//TODO: Import all types and constants related to types like this one
export const childProductTypePerParent: Record<ParentProductType, string[]> = {
  Clothing: [
    "Jumpers",
    "Shirts",
    "T-Shirts",
    "Pants",
    "Shorts",
    "Women's Tops",
    "Women's Bottoms",
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
    "Griptape",
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

interface FilterOptionsProps {
  onFilterChange: (filters: Record<string, string | number | boolean | null>) => void;
}

export default function FilterOptions({ onFilterChange }: FilterOptionsProps) {
  const [parentType, setParentType] = useState<ParentProductType | "">("");
  const [childType, setChildType] = useState<string | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [onSale, setOnSale] = useState(false);
  const [shoeSize, setShoeSize] = useState<number | null>(null);
  const [deckSize, setDeckSize] = useState<number | null>(null);
  const [brand, setBrand] = useState<string | "">("");

  const handleApplyFilters = () => {
    onFilterChange({ parentType, childType, maxPrice, onSale, shoeSize, deckSize, vendor: brand });
  };

  const handleClearFilters = () => {
    setParentType("");
    setChildType("");
    setMaxPrice("");
    setOnSale(false);
    setShoeSize(null);
    setDeckSize(null);
    setBrand("");

    onFilterChange({
      parentType: "",
      childType: "",
      maxPrice: "",
      onSale: false,
      shoeSize: null,
      deckSize: null,
      vendor: "",
    });
  };

  // TODO: Fetch these from the server, or from storefront component
  const availableBrands = ["Nike", "Adidas", "New Balance", "Vans", "Converse"];

  const parentProductTypes = Object.keys(
    childProductTypePerParent
  ) as ParentProductType[];

  const childProductTypes =
    parentType && childProductTypePerParent[parentType]
      ? (childProductTypePerParent[parentType] as string[])
      : [];

  // TODO: Implement sizes more robustly
  const availableShoeSizes = ["7", "8", "9", "10", "11", "12"];
  const availableDeckSizes = [7.5, 7.75, 8.0, 8.25, 8.5, 8.75, 9.0];


  return (
    <div className="flex flex-wrap space-x-4">
      <select
        value={parentType}
        onChange={(e) => {
          setParentType(e.target.value as ParentProductType);
          setChildType(""); // Reset childType when parentType changes
          setShoeSize(null);
          setDeckSize(null);
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
        {childProductTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      {/* Conditionally render shoe size dropdown if parent type is Shoes */}
      {parentType === "Shoes" && (
        <select
          value={shoeSize !== null ? shoeSize : ""}
          onChange={(e) => setShoeSize(e.target.value ? Number(e.target.value) : null)}
          className="border rounded p-2"
        >
          <option value="">Select Shoe Size</option>
          {availableShoeSizes.map((size) => (
            <option key={size} value={size}>
              US {size}
            </option>
          ))}
        </select>
      )}

      {/* Conditionally render deck size dropdown if parent type is Skateboards */}
      {childType === "Decks" && (
        <select
          value={deckSize !== null ? deckSize : ""}
          onChange={(e) => setDeckSize(e.target.value ? Number(e.target.value) : null)}
          className="border rounded p-2"
        >
          <option value="">Select Deck Size</option>
          {availableDeckSizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      )}

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

      <select
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
        className="border rounded p-2"
      >
        <option value="">Select Brand</option>
        {availableBrands.map((brand) => (
          <option key={brand} value={brand}>
            {brand}
          </option>
        ))}
      </select>

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
