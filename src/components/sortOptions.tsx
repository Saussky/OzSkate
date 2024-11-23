"use client";

interface SortOptionsProps {
  onSortChange: (sortOption: string) => void;
}

export default function SortOptions({ onSortChange }: SortOptionsProps) {
  return (
    <div className="flex space-x-4">
      <select
        onChange={(e) => onSortChange(e.target.value)}
        className="border rounded p-2"
      >
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="popularity">Popularity</option>
      </select>
    </div>
  );
}
