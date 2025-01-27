'use client';
import React, { useEffect, useState, useTransition } from 'react';
import {
  getSuspectedDuplicates,
  rejectDuplicate,
  mergeProducts,
} from './actions';
import ProductCard from '@/components/productCard';
import { ProductWithSuspectedDuplicate } from '@/lib/types';

export default function DuplicateManager() {
  const [duplicates, setDuplicates] = useState<ProductWithSuspectedDuplicate[]>(
    []
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await getSuspectedDuplicates();
      setDuplicates(data);
    });
  }, []);

  //TODO: Refactor to simply remove the suspectedDuplicateOf connection for the DUPLICATE product (currently does orginal)
  async function handleReject(productId: string) {
    await rejectDuplicate(productId);
    setDuplicates((prev) => prev.filter((p) => p.id !== productId));
  }

  async function handleMerge(sourceId: string, targetId: string) {
    await mergeProducts(sourceId, targetId);
    setDuplicates((prev) => prev.filter((p) => p.id !== sourceId));
  }

  if (duplicates.length === 0) {
    return <div>No duplicates found.</div>;
  }

  return (
    <div className="space-y-8">
      {duplicates.map((duplicate) => {
        // "original" is the single product in duplicate.suspectedDuplicateOf
        const original = duplicate.suspectedDuplicateOf;

        // If for some reason original is null/undefined, skip or handle differently
        if (!original) {
          return null;
        }

        return (
          <section
            key={duplicate.id}
            className="border border-gray-300 rounded p-4"
          >
            <header className="mb-4">
              <h2 className="text-xl font-semibold">
                Duplicate: {duplicate.title}
              </h2>
            </header>

            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
              {/* Original product card (LEFT) */}
              <div className="w-1/3 h-1/4">
                <ProductCard
                  id={original.id}
                  title={original.title}
                  admin={false}
                  price={String(original.cheapestPrice ?? '')}
                  handle={original.handle}
                  shop={original.shop}
                  imageSrc={original.image?.src}
                  parentType={original.parentType}
                  childType={original.childType}
                />
              </div>

              {/* Middle: merge + reject buttons */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <p className="text-sm text-gray-500 mb-2">Merge direction</p>

                {/* Merge DUPLICATE -> ORIGINAL */}
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={() => handleMerge(duplicate.id, original.id)}
                >
                  Duplicate → Original
                </button>

                {/* Merge ORIGINAL -> DUPLICATE */}
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={() => handleMerge(original.id, duplicate.id)}
                >
                  Original → Duplicate
                </button>

                <button
                  onClick={() => handleReject(duplicate.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded mt-4"
                  disabled={isPending}
                >
                  Not a Duplicate
                </button>
              </div>

              {/* Duplicate product card (RIGHT) */}
              <div className="w-1/3 h-1/4">
                <ProductCard
                  id={duplicate.id}
                  title={duplicate.title}
                  admin={false}
                  price={String(duplicate.cheapestPrice ?? '')}
                  handle={duplicate.handle}
                  shop={duplicate.shop}
                  imageSrc={duplicate.image?.src}
                  parentType={duplicate.parentType}
                  childType={duplicate.childType}
                />
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
