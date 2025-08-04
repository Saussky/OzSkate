// components/ProductCardSkeleton.tsx
'use client';
import React from 'react';

export default function ProductCardSkeleton() {
  return (
    <div
      className="border rounded-lg shadow-md p-4 h-full w-full bg-white animate-pulse"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '700px' }}
    >
      {/* Shop name */}
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />

      {/* Price-count badge */}
      <div className="absolute top-2 right-2">
        <div className="h-6 w-10 bg-gray-200 rounded" />
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-gray-200 rounded mb-4" />

      {/* Title */}
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />

      {/* Price */}
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />

      {/* Admin menu button */}
      <div className="h-6 w-6 bg-gray-200 rounded ml-auto" />
    </div>
  );
}
