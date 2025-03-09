'use client';
import { useEffect, useState } from 'react';
import { ParentType } from '@/lib/types';
import DropdownSelector from '../ui/dropdown';

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
  onFilterChange: (
    filters: Record<string, string | number | boolean | null>
  ) => void;
  brands: string[];
  shops: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialFilters: any;
}

export default function Filter({
  onFilterChange,
  brands,
  shops,
  initialFilters,
}: FilterProps) {
  const [parentType, setParentType] = useState<ParentType | null>(null);
  const [childType, setChildType] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [onSale, setOnSale] = useState(false);
  const [shoeSize, setShoeSize] = useState<number | null>(null);
  const [deckSize, setDeckSize] = useState<number | null>(null);
  const [brand, setBrand] = useState<string>('');
  const [shop, setShop] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    setParentType(initialFilters.parentType || '');
    setChildType(initialFilters.childType || '');
    setMaxPrice(initialFilters.maxPrice || null);
    setOnSale(initialFilters.onSale || false);
    setShoeSize(initialFilters.shoeSize || null);
    setDeckSize(initialFilters.deckSize || null);
    setBrand(initialFilters.vendor || '');
    setShop(initialFilters.shop || '');
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
      shop,
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
    setShop('');
    setSearchTerm('');

    onFilterChange({
      parentType: '',
      childType: '',
      maxPrice: '',
      onSale: false,
      shoeSize: null,
      deckSize: null,
      vendor: '',
      shop: '',
      searchTerm: '',
    });
  };

  // Get list of parent types (the keys of childTypePerParent)
  const parentTypes = Object.keys(childTypePerParent) as ParentType[];

  // Child types for the selected parent type
  const childTypes =
    parentType && childTypePerParent[parentType]
      ? childTypePerParent[parentType]
      : [];

  // TODO: Do this properly
  const availableShoeSizes = ['7', '8', '9', '10', '11', '12'];
  const availableDeckSizes = [7.5, 7.75, 8.0, 8.25, 8.5, 8.75, 9.0];

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <DropdownSelector
        label="Parent Type"
        value={parentType || ''}
        onChange={(val) => {
          setParentType(val as ParentType);
          // Reset related filters
          setChildType('');
          setShoeSize(null);
          setDeckSize(null);
        }}
        options={parentTypes}
      />

      <DropdownSelector
        label="Child Type"
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

      <DropdownSelector
        label="Shop"
        value={shop}
        onChange={setShop}
        options={shops}
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

      <button
        onClick={handleApplyFilters}
        className="
          border border-gray-400 text-sm text-black bg-white
          rounded px-3 py-1 hover:cursor-pointer
        "
      >
        Apply
      </button>
      <button
        onClick={handleClearFilters}
        className="
          border border-gray-400 text-sm text-black bg-white
          rounded px-3 py-1 hover:cursor-pointer
        "
      >
        Clear
      </button>
    </div>
  );
}
