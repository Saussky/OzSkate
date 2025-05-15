'use client';
import React, { useCallback, useEffect, useState, useTransition } from 'react';
import Button from '@/components/ui/button';
import {
  getPaginatedSuspectedDuplicates,
  rejectDuplicate,
  mergeProducts,
  checkAllProductsForDuplicates,
} from './actions';
import ProductCard from '@/components/shared/product-card/productCard';
import Pagination from '@/components/shared/pagination';
import { Prisma } from '@prisma/client';
import { ExtendedProduct } from '@/components/storefront/storefront';

type DuplicatePair = Prisma.ProductDuplicateGetPayload<{
  include: {
    masterProduct: { include: { shop: true } };
    duplicateProduct: { include: { shop: true } };
  };
}>;

export default function ProductDuplicateManager(): JSX.Element {
  const [isFinding, startFinding] = useTransition();
  const [duplicates, setDuplicates] = useState<DuplicatePair[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isPending, startTransition] = useTransition();

  async function handleFindDuplicates() {
    startFinding(async () => {
      await checkAllProductsForDuplicates();
      await refreshDuplicates();
    });
  }

  const refreshDuplicates = useCallback(async () => {
    const { items, total } = await getPaginatedSuspectedDuplicates(
      currentPage,
      10
    );
    setDuplicates(items);
    setTotalPages(Math.ceil(total / 10));
  }, [currentPage]);

  useEffect(() => {
    startTransition(() => {
      refreshDuplicates();
    });
  }, [currentPage, refreshDuplicates]);

  async function handleReject(masterId: string, duplicateId: string) {
    await rejectDuplicate(masterId, duplicateId);
    await refreshDuplicates();
  }

  async function handleMerge(masterId: string, duplicateId: string) {
    await mergeProducts(masterId, duplicateId);
    await refreshDuplicates();
  }

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
        duplicates.map((pair) => {
          const { masterProduct, duplicateProduct } = pair;

          return (
            <section
              key={pair.id}
              className="border border-gray-300 rounded p-4"
            >
              <header className="mb-4">
                <h2 className="text-xl font-semibold">
                  Potential Duplicate Pair
                </h2>
              </header>
              <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                <div className="w-1/3">
                  <ProductCard
                    product={masterProduct as ExtendedProduct}
                    admin={false}
                  />
                </div>

                <div className="flex flex-col items-center justify-center space-y-2">
                  <p className="text-sm text-gray-500 mb-2">
                    Choose merge action
                  </p>
                  <Button
                    onClick={() =>
                      handleMerge(masterProduct.id, duplicateProduct.id)
                    }
                    disabled={isPending}
                  >
                    Keep Left Product, Merge Right
                  </Button>
                  <Button
                    onClick={() =>
                      handleMerge(duplicateProduct.id, masterProduct.id)
                    }
                    disabled={isPending}
                  >
                    Keep Right Product, Merge Left
                  </Button>
                  <Button
                    onClick={() =>
                      handleReject(masterProduct.id, duplicateProduct.id)
                    }
                    disabled={isPending}
                  >
                    Not a Match
                  </Button>
                </div>

                <div className="w-1/3">
                  <ProductCard
                    product={duplicateProduct as ExtendedProduct}
                    admin={false}
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
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
