'use client';

interface SortOptionsProps {
  onSortChange: (sortOption: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sortOption: any;
}

export default function SortOptions({
  onSortChange,
  sortOption,
}: SortOptionsProps) {
  return (
    <div className="flex space-x-4">
      <select
        value={sortOption}
        onChange={(e) => onSortChange(e.target.value)}
        className="border rounded p-2"
      >
        <option value="latest">Latest</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
      </select>
    </div>
  );
}
