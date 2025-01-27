'use client';
import React, { useEffect, useState, useTransition } from 'react';
import { getDuplicates, rejectDuplicate, mergeProducts } from './actions';
import ProductCard from '@/components/productCard';
import { ProductWithDuplicates, ProductWithShop } from '@/lib/types';

export default function DuplicateManager() {
  const [duplicates, setDuplicates] = useState<ProductWithDuplicates[]>([]); //TODO Get product type and extend with duplicateProduct possiblity
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await getDuplicates();
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

          {product.duplicateProducts.map((dup: ProductWithShop) => (
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
                  price={String(product.cheapestPrice)}
                  handle={product.handle}
                  shop={product.shop}
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
                  Original ← Duplicate
                </button>

                {/* Merge ORIG -> DUP */}
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={() => handleMerge(product.id, dup.id)}
                >
                  Original → Duplicate
                </button>
              </div>

              {/* Duplicate product card */}
              <div className="w-1/3 h-1/4">
                <ProductCard
                  id={dup.id}
                  title={dup.title}
                  admin={false}
                  price={String(dup.cheapestPrice)}
                  handle={dup.handle}
                  // shop={{ name: dup.shopName, url: dup.shopUrl }}
                  shop={product.shop}
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
