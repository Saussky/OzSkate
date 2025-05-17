'use client';
import React, { useEffect, useMemo, useState } from 'react';
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
  brands: string[];
  shops: string[]; // Available shop options (e.g. ["Shop1", "Shop2", ...])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialFilters: any;
  onSortChange: (sortOption: string) => void;
  sortOption: string;
}

export default function Filter({
  onFilterChange,
  brands,
  shops,
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
  const [brand, setBrand] = useState<string>('');
  const [selectedShops, setSelectedShops] = useState<string[]>(() =>
    Array.isArray(initialFilters.shops)
      ? initialFilters.shops
      : initialFilters.shops
      ? [initialFilters.shops]
      : []
  );
  console.log('selected shops', selectedShops);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    setParentType(initialFilters.parentType || '');
    setChildType(initialFilters.childType || '');
    setMaxPrice(initialFilters.maxPrice || null);
    setOnSale(initialFilters.onSale || false);
    setShoeSize(initialFilters.shoeSize || null);
    setDeckSize(initialFilters.deckSize || null);
    setBrand(initialFilters.vendor || '');

    // Ensure initialFilters.shop is an array. If not, convert it.
    setSelectedShops(
      Array.isArray(initialFilters.shops)
        ? initialFilters.shops
        : initialFilters.shops
        ? [initialFilters.shops]
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
      vendor: brand,
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
    setBrand('');
    setSelectedShops([]);
    setSearchTerm('');

    onFilterChange({
      parentType: '',
      childType: '',
      maxPrice: '',
      onSale: false,
      shoeSize: null,
      deckSize: null,
      vendor: '',
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

  const shopOptions = useMemo(() => {
    const optionSet = new Map<string, string>();
    shops.forEach((s) => optionSet.set(s, s));
    selectedShops.forEach((s) => optionSet.set(s, s));
    return Array.from(optionSet.values()).map((shop) => ({
      value: shop,
      label: shop,
    }));
  }, [shops, selectedShops]);

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <DropdownSelector
        label="Category"
        value={parentType || ''}
        onChange={(val) => {
          setParentType(val as ParentType);
          // TODO: Do we need to reset more fields?
          setChildType('');
          setShoeSize(null);
          setDeckSize(null);
        }}
        options={parentTypes}
      />

      <DropdownSelector
        label="Sub-Category"
        value={childType}
        onChange={setChildType}
        options={childTypes}
        disabled={!parentType}
      />

      {parentType === 'Shoes' && (
        <DropdownSelector
          label="Shoe Size"
          value={shoeSize?.toString() || ''}
          onChange={(val) => setShoeSize(val ? Number(val) : null)}
          options={availableShoeSizes}
        />
      )}

      {childType === 'Decks' && (
        <DropdownSelector
          label="Deck Size"
          value={deckSize?.toString() || ''}
          onChange={(val) => setDeckSize(val ? Number(val) : null)}
          options={availableDeckSizes.map((size) => size.toString())}
        />
      )}

      <DropdownSelector
        label="Brand"
        value={brand}
        onChange={setBrand}
        options={brands}
      />

      <MultiSelectDropdown
        value={selectedShops}
        onChange={setSelectedShops}
        options={shopOptions}
        label="Shops"
      />

      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="
          border border-gray-400 text-black bg-white
          rounded px-3 py-1 text-sm
          focus:outline-none focus:ring-1 focus:ring-blue-500
        "
        style={{ minWidth: '150px' }}
      />

      <label
        className="
          flex items-center text-sm
          px-3 py-1 border border-gray-400 bg-white rounded
          hover:cursor-pointer
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

      <Button onClick={handleApplyFilters} variant="smart">
        Apply
      </Button>
      <Button onClick={handleClearFilters} variant="smart">
        Clear
      </Button>

      <div className="ml-auto">
        <SortDropdown
          options={sortOptions}
          selectedOption={sortOption}
          onChange={onSortChange}
        />
      </div>
    </div>
  );
}
