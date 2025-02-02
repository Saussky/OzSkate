'use client';
import React, { useEffect, useState, useTransition } from 'react';
import {
  rejectDuplicate,
  mergeProducts,
  getPaginatedSuspectedDuplicates,
} from './actions';
import ProductCard from '@/components/productCard';
import { ProductWithSuspectedDuplicate } from '@/lib/types';
import Pagination from '@/components/pagination';

export default function DuplicateManager() {
  const [duplicates, setDuplicates] = useState<ProductWithSuspectedDuplicate[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const { duplicates, totalPages } = await getPaginatedSuspectedDuplicates(
        currentPage,
        10
      );
      setDuplicates(duplicates);
      setTotalPages(totalPages);
    });
  }, [currentPage]);

  async function handleReject(productId: string) {
    await rejectDuplicate(productId);
    setDuplicates((prev) => prev.filter((p) => p.id !== productId));
  }

  async function handleMerge(originalId: string, duplicateId: string) {
    await mergeProducts(originalId, duplicateId);
    setDuplicates((prev) => prev.filter((p) => p.id !== originalId));
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (duplicates.length === 0) {
    return <div>No duplicates found.</div>;
  }

  return (
    <div className="space-y-8">
      {duplicates.map((duplicate) => {
        const original = duplicate.suspectedDuplicateOf;
        if (!original) return null;

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

              <div className="flex flex-col items-center justify-center space-y-2">
                <p className="text-sm text-gray-500 mb-2">Merge direction</p>

                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={() => handleMerge(original.id, duplicate.id)}
                  disabled={isPending}
                >
                  Original ⬅️ Duplicate
                </button>

                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={() => handleMerge(duplicate.id, original.id)}
                  disabled={isPending}
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
