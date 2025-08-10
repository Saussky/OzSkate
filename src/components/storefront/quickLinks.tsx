'use client';

import React, { useState } from 'react';
import { FilterOption } from '@/lib/types';
import { SortOption } from '@/lib/product/filter/buildClause';

type QuickLinkKey =
  | '__clear__'
  | 'recently-on-sale'
  | 'newest-products'
  | 'sb-dunks'
  | '';

const QUICK_LINKS: {
  label: string;
  value: Exclude<QuickLinkKey, '__clear__' | ''>;
}[] = [
  { label: 'Recently on Sale', value: 'recently-on-sale' },
  { label: 'Newest Products', value: 'newest-products' },
  { label: 'SB Dunks', value: 'sb-dunks' },
];

interface QuickLinksSelectProps {
  onSelect: (
    filterChanges: Partial<FilterOption>,
    newSort?: SortOption
  ) => void;
}

export default function QuickLinksSelect({ onSelect }: QuickLinksSelectProps) {
  const [selectedQuickLink, setSelectedQuickLink] = useState<QuickLinkKey>('');

  return (
    <select
      aria-label="Quick Links"
      value={selectedQuickLink}
      className="border border-gray-400 bg-white rounded px-3 py-1 text-sm"
      onChange={(event) => {
        const chosen = event.target.value as QuickLinkKey;
        setSelectedQuickLink(chosen);

        switch (chosen) {
          case '__clear__':
            onSelect({}, undefined);
            break;

          case 'recently-on-sale':
            onSelect({ onSale: true }, 'last-updated');
            break;

          case 'newest-products':
            onSelect({}, 'latest');
            break;

          case 'sb-dunks':
            onSelect({ brands: ['Nike SB'], searchTerm: 'dunk' });
            break;
        }
      }}
    >
      <option value="" disabled>
        Quick Filters
      </option>

      <option value="__clear__">Clear Filters</option>

      {QUICK_LINKS.map(({ label, value }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
