'use client';
import React, { useEffect, useState, useTransition } from 'react';
import { getDuplicates, rejectDuplicate, mergeProducts } from './actions';
import ProductCard from '@/components/productCard';

export default function DuplicateManager() {
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  // Fetch duplicates on mount
  useEffect(() => {
    startTransition(async () => {
      const data = await getDuplicates();
      setDuplicates(data);
    });
  }, []);

  async function handleReject(productId: string) {
    await rejectDuplicate(productId);
    setDuplicates((prev) => prev.filter((p) => p.id !== productId));
  }

  async function handleMerge(sourceId: string, targetId: string) {
    await mergeProducts(sourceId, targetId);
    // Remove source from state
    setDuplicates((prev) => prev.filter((p) => p.id !== sourceId));
  }

  if (duplicates.length === 0) {
    return <div>No duplicates found.</div>;
  }

  return (
    <div className="space-y-8">
      {duplicates.map((product) => (
        <section
          key={product.id}
          className="border border-gray-300 rounded p-4"
        >
          <header className="mb-4">
            <h2 className="text-xl font-semibold">{product.title}</h2>
            <button
              onClick={() => handleReject(product.id)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              disabled={isPending}
            >
              Not a Duplicate (Reject) {/*TODO: REMOVE */}
            </button>
          </header>

          {product.duplicateProducts.map((dup) => (
            <div
              key={dup.id}
              className="flex flex-col md:flex-row items-center gap-4 mb-6"
            >
              {/* Original product card (keeper) */}
              <div className="w-1/3 h-1/4">
                <ProductCard
                  id={product.id}
                  title={product.title}
                  admin={false}
                  price={product.price}
                  handle={product.handle}
                  shop={{ name: product.shopName, url: product.shopUrl }}
                  imageSrc={product.image?.src}
                  parentType={product.parentType}
                  childType={product.childType}
                />
              </div>

              {/* Merge buttons in the middle */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <p className="text-sm text-gray-500">Merge direction</p>

                {/* Merge DUP -> ORIG */}
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={() => handleMerge(dup.id, product.id)}
                >
                  ← Merge Duplicate → Original
                </button>

                {/* Merge ORIG -> DUP */}
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={() => handleMerge(product.id, dup.id)}
                >
                  Merge Original → Duplicate →
                </button>
              </div>

              {/* Duplicate product card */}
              <div className="w-1/3 h-1/4">
                <ProductCard
                  id={dup.id}
                  title={dup.title}
                  admin={false}
                  price={dup.price}
                  handle={dup.handle}
                  // shop={{ name: dup.shopName, url: dup.shopUrl }}
                  shop={{ name: dup.shopName, url: dup.shopUrl } as any}
                  imageSrc={dup.image?.src}
                  parentType={dup.parentType}
                  childType={dup.childType}
                />
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
