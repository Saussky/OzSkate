'use client';
import React, { useEffect, useState, useTransition } from 'react';
import { ProductWithSuspectedDuplicate } from '@/lib/types';
import Button from '@/components/ui/button';
import {
  getPaginatedSuspectedDuplicates,
  rejectDuplicate,
  mergeProducts,
  checkAllProductsForDuplicates,
} from './actions';
import ProductCard from '@/components/shared/product-card/productCard';
import Pagination from '@/components/shared/pagination';

export default function ProductDuplicateManager(): JSX.Element {
  const [isFinding, startFinding] = useTransition();

  async function handleFindDuplicates() {
    startFinding(async () => {
      await checkAllProductsForDuplicates();
    });
  }

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

  async function handleMerge(keepId: string, mergeId: string) {
    await mergeProducts(keepId, mergeId);
    setDuplicates((prev) =>
      prev.filter((p) => p.id !== mergeId && p.id !== keepId)
    );
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
        <div>No potential matches found.</div>
      ) : (
        duplicates.map((duplicate) => {
          const otherProduct = duplicate.suspectedDuplicateOf;
          if (!otherProduct) return null;

          return (
            <section
              key={duplicate.id}
              className="border border-gray-300 rounded p-4"
            >
              <header className="mb-4">
                <h2 className="text-xl font-semibold">
                  Potential Match: {duplicate.title}
                </h2>
              </header>
              <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                <div className="w-1/3">
                  <ProductCard
                    id={otherProduct.id}
                    title={otherProduct.title}
                    admin={false}
                    price={String(otherProduct.cheapestPrice ?? '')}
                    handle={otherProduct.handle}
                    shop={otherProduct.shop}
                    imageSrc={otherProduct.image?.src}
                    parentType={otherProduct.parentType}
                    childType={otherProduct.childType}
                  />
                </div>

                <div className="flex flex-col items-center justify-center space-y-2">
                  <p className="text-sm text-gray-500 mb-2">
                    Choose merge action
                  </p>
                  <Button
                    onClick={() => handleMerge(otherProduct.id, duplicate.id)}
                    disabled={isPending}
                  >
                    Keep Left Product, Merge Right
                  </Button>
                  <Button
                    onClick={() => handleMerge(duplicate.id, otherProduct.id)}
                    disabled={isPending}
                  >
                    Keep Right Product, Merge Left
                  </Button>
                  <Button
                    onClick={() => handleReject(duplicate.id)}
                    disabled={isPending}
                  >
                    Not a Match
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
