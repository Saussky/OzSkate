'use client';
import React, { useEffect, useState } from 'react';
import { FilterOption, ParentType } from '@/lib/types';
import DropdownSelector from '../ui/dropdown';
import SortDropdown from '../ui/sortDropdown';
import Button from '../ui/button';
import MultiSelectDropdown from '../ui/multiSelect';

export const childTypePerParent: Record<ParentType, string[]> = {
  Clothing: [
    'Jumpers',
    'Shirts',
    'T-Shirts',
    'Pants',
    'Shorts',
    "Women's Tops",
    "Women's Bottoms",
    'Hats',
    'Beanies',
    'Socks',
  ],
  Skateboards: [
    'Decks',
    'Completes',
    'Trucks',
    'Wheels',
    'Bearings',
    'Tools',
    'Hardware',
    'Griptape',
  ],
  'Protective Gear': ['Pads', 'Helmets', 'Other'],
  Shoes: ['Mens', 'Youth', 'Womens'],
  Bags: ['Backpacks', 'Tote Bags'],
  Accessories: [
    'Belts',
    'Watches',
    'Sunglasses',
    'Literature',
    'Wax',
    'Keychains',
    'Jewellery',
    'Other',
  ],
};

interface FilterProps {
  onFilterChange: (filters: FilterOption) => void;
  allBrands: string[];
  allShops: string[]; // Available shop options (e.g. ["Shop1", "Shop2", ...])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialFilters: any;
  onSortChange: (sortOption: string) => void;
  sortOption: string;
}

export default function Filter({
  onFilterChange,
  allBrands,
  allShops,
  initialFilters,
  onSortChange,
  sortOption,
}: FilterProps) {
  const [parentType, setParentType] = useState<ParentType | null>(null);
  const [childType, setChildType] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [onSale, setOnSale] = useState(false);
  const [shoeSize, setShoeSize] = useState<number | null>(null);
  const [deckSize, setDeckSize] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [brands, setBrands] = useState<string[]>([]);
  const [selectedShops, setSelectedShops] = useState<string[]>(() =>
    Array.isArray(initialFilters.shops)
      ? initialFilters.shops
      : initialFilters.shops
      ? [initialFilters.shops]
      : []
  );

  useEffect(() => {
    setParentType(initialFilters.parentType || '');
    setChildType(initialFilters.childType || '');
    setMaxPrice(initialFilters.maxPrice || null);
    setOnSale(initialFilters.onSale || false);
    setShoeSize(initialFilters.shoeSize || null);
    setDeckSize(initialFilters.deckSize || null);

    // Ensure initialFilters.shop is an array. If not, convert it.
    setSelectedShops(
      Array.isArray(initialFilters.shops)
        ? initialFilters.shops
        : initialFilters.shops
        ? [initialFilters.shops]
        : []
    );

    setBrands(
      Array.isArray(initialFilters.brands)
        ? initialFilters.brands
        : initialFilters.brands
        ? [initialFilters.brands]
        : []
    );
    setSearchTerm(initialFilters.searchTerm || '');
  }, [initialFilters]);

  const handleApplyFilters = () => {
    onFilterChange({
      parentType,
      childType,
      maxPrice,
      onSale,
      shoeSize,
      deckSize,
      brands,
      shops: selectedShops,
      searchTerm,
    });
  };

  const handleClearFilters = () => {
    setParentType(null);
    setChildType('');
    setMaxPrice(null);
    setOnSale(false);
    setShoeSize(null);
    setDeckSize(null);
    setBrands([]);
    setSelectedShops([]);
    setSearchTerm('');

    onFilterChange({
      parentType: '',
      childType: '',
      maxPrice: '',
      onSale: false,
      shoeSize: null,
      deckSize: null,
      brands: [],
      shops: [],
      searchTerm: '',
    });
  };

  // List of parent types
  const parentTypes = Object.keys(childTypePerParent) as ParentType[];

  // Child types for the selected parent type
  const childTypes =
    parentType && childTypePerParent[parentType]
      ? childTypePerParent[parentType]
      : [];

  // TODO: These are dummy available sizes
  const availableShoeSizes = ['7', '8', '9', '10', '11', '12'];
  const availableDeckSizes = [7.5, 7.75, 8.0, 8.25, 8.5, 8.75, 9.0];

  // TODO: Change icon in button depending on selection
  const sortOptions = [
    { value: 'price-asc', label: 'Price: low to high' },
    { value: 'price-desc', label: 'Price: high to low' },
    { value: 'latest', label: 'Newly Listed' },
  ];

  return (
    <div className="flex flex-col space-y-2 md:flex-row md:flex-wrap md:space-y-0 md:space-x-2 mb-4">
      <div className="w-full md:w-auto">
        <DropdownSelector
          value={parentType || ''}
          label="Category"
          onChange={(val) => {
            setParentType(val as ParentType);
            setChildType('');
            setShoeSize(null);
            setDeckSize(null);
          }}
          options={parentTypes}
        />
      </div>

      <div className="w-full md:w-auto">
        <DropdownSelector
          // className="w-full"
          label="Sub-Category"
          value={childType}
          onChange={setChildType}
          options={childTypes}
          disabled={!parentType}
        />
      </div>

      {parentType === 'Shoes' && (
        <div className="w-full md:w-auto">
          <DropdownSelector
            // className="w-full"
            label="Shoe Size"
            value={shoeSize?.toString() || ''}
            onChange={(val) => setShoeSize(val ? Number(val) : null)}
            options={availableShoeSizes}
          />
        </div>
      )}

      {childType === 'Decks' && (
        <div className="w-full md:w-auto">
          <DropdownSelector
            label="Deck Size"
            // className="w-full"
            value={deckSize?.toString() || ''}
            onChange={(val) => setDeckSize(val ? Number(val) : null)}
            options={availableDeckSizes.map((s) => s.toString())}
          />
        </div>
      )}

      <div className="w-full md:w-auto">
        <MultiSelectDropdown
          value={brands}
          onChange={setBrands}
          options={allBrands}
          label="Brands"
        />
      </div>

      <div className="w-full md:w-auto">
        <MultiSelectDropdown
          value={selectedShops}
          onChange={setSelectedShops}
          options={allShops}
          label="Shops"
        />
      </div>

      <div className="w-full md:w-auto">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="
            w-full
            border border-gray-400 text-black bg-white
            rounded px-3 py-1 text-sm
            focus:outline-none focus:ring-1 focus:ring-blue-500
          "
        />
      </div>

      <div className="w-full md:w-auto">
        <label
          className="
            flex items-center w-full md:w-auto
            px-3 py-1 border border-gray-400 bg-white rounded
            hover:cursor-pointer text-sm
          "
        >
          <input
            type="checkbox"
            checked={onSale}
            onChange={(e) => setOnSale(e.target.checked)}
            className="mr-1"
          />
          On Sale
        </label>
      </div>

      <div className="flex flex-col sm:flex-row w-full md:w-auto space-y-2 sm:space-y-0 sm:space-x-2">
        <Button onClick={handleApplyFilters} variant="smart">
          Apply
        </Button>
        <Button onClick={handleClearFilters} variant="smart">
          Clear
        </Button>
      </div>

      <div className="w-full md:w-auto md:ml-auto">
        <SortDropdown
          options={sortOptions}
          selectedOption={sortOption}
          onChange={onSortChange}
        />
      </div>
    </div>
  );
}
