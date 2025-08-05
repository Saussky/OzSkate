'use client';

import React from 'react';
import { FilterOption } from '@/lib/types';
import { SortOption } from '@/lib/product/filter/buildClause';

type QuickLinkKey = 'recently-on-sale' | 'newest-products' | 'sb-dunks';

const QUICK_LINKS: { label: string; value: QuickLinkKey }[] = [
  { label: 'Recently on Sale', value: 'recently-on-sale' },
  { label: 'Newest Products', value: 'newest-products' },
  { label: 'SB Dunks', value: 'sb-dunks' },
];

interface QuickLinksSelectProps {
  /**
   * Receives the filter fields to update and (optionally) a sort option.
   * The caller is responsible for merging these into state + query params.
   */
  onSelect: (
    filterChanges: Partial<FilterOption>,
    newSort?: SortOption
  ) => void;
}

export default function QuickLinksSelect({ onSelect }: QuickLinksSelectProps) {
  return (
    <select
      defaultValue=""
      className="border border-gray-400 bg-white rounded px-3 py-1 text-sm"
      onChange={(event) => {
        const selected = event.target.value as QuickLinkKey;

        switch (selected) {
          case 'recently-on-sale':
            onSelect({ onSale: true }, 'last-updated');
            break;

          case 'newest-products':
            onSelect({}, 'latest');
            break;

          case 'sb-dunks':
            onSelect({ brands: ['Nike SB'], searchTerm: 'dunk' });
            break;

          default:
            return;
        }

        // reset back to placeholder after the action
        event.currentTarget.selectedIndex = 0;
      }}
    >
      <option value="" disabled>
        Quick Links
      </option>
      {QUICK_LINKS.map(({ label, value }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
