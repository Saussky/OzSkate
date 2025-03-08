'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { checkAllProductsForDuplicates } from '@/lib/actions';
import ProductCard from '@/components/productCard';
import Pagination from '@/components/pagination';
import { ProductWithSuspectedDuplicate } from '@/lib/types';
import Button from '@/components/ui/button';
import {
  getPaginatedSuspectedDuplicates,
  rejectDuplicate,
  mergeProducts,
} from './actions';

export default function ProductDuplicateManager(): JSX.Element {
  // State and transition for the "Find Duplicates" button.
  const [isFinding, startFinding] = useTransition();

  async function handleFindDuplicates() {
    startFinding(async () => {
      await checkAllProductsForDuplicates();
    });
  }

  // State for paginated duplicate data.
  const [duplicates, setDuplicates] = useState<ProductWithSuspectedDuplicate[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const { duplicates: fetchedDuplicates, totalPages } =
        await getPaginatedSuspectedDuplicates(currentPage, 10);
      setDuplicates(fetchedDuplicates);
      setTotalPages(totalPages);
    });
  }, [currentPage, startTransition]);

  async function handleReject(productId: string) {
    await rejectDuplicate(productId);
    setDuplicates((prev) => prev.filter((p) => p.id !== productId));
  }

  async function handleMerge(originalId: string, duplicateId: string) {
    await mergeProducts(originalId, duplicateId);
    setDuplicates((prev) => prev.filter((p) => p.id !== originalId));
  }

  const handlePageChange = (page: number) => setCurrentPage(page);

  return (
    <div className="space-y-8">
      <div className="mb-4">
        <Button onClick={handleFindDuplicates} disabled={isFinding}>
          {isFinding ? 'Finding Duplicates...' : 'Find Duplicates'}
        </Button>
      </div>

      {duplicates.length === 0 ? (
        <div>No duplicates found.</div>
      ) : (
        duplicates.map((duplicate) => {
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
                <div className="w-1/3">
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
                  <Button
                    onClick={() => handleMerge(original.id, duplicate.id)}
                    disabled={isPending}
                  >
                    Original ⬅️ Duplicate
                  </Button>
                  <Button
                    onClick={() => handleMerge(duplicate.id, original.id)}
                    disabled={isPending}
                  >
                    Original → Duplicate
                  </Button>
                  <Button
                    onClick={() => handleReject(duplicate.id)}
                    disabled={isPending}
                    variant="danger"
                  >
                    Not a Duplicate
                  </Button>
                </div>

                <div className="w-1/3">
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
        })
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
