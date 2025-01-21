'use client';
import React, { useEffect, useState, useTransition } from 'react';
import { getDuplicates, rejectDuplicate, mergeProducts } from './actions';

// Import your existing ProductCard component
import ProductCard from '@/components/productCard';

type DuplicateProduct = {
  id: string;
  title: string;
  shopName: string;
  image?: { src: string };
  duplicateProducts: {
    id: string;
    title: string;
    shopName: string;
    image?: { src: string };
  }[];
};

export default function DuplicateManager() {
  // The “original” (keeper) is this product, while the “duplicates” are in duplicateProducts
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  // Fetch list of products with `markedAsDuplicate = true` (unapproved)
  useEffect(() => {
    startTransition(async () => {
      const data = await getDuplicates();
      setDuplicates(data);
    });
  }, []);

  // “Reject” means we are discarding the flag that these are duplicates
  async function handleReject(productId: string) {
    await rejectDuplicate(productId);
    // Remove from local state
    setDuplicates((prev) => prev.filter((p) => p.id !== productId));
  }

  /**
   * Merge logic:
   * - sourceId = The “duplicate” we are discarding
   * - targetId = The “original” we keep
   */
  async function handleMerge(sourceId: string, targetId: string) {
    await mergeProducts(sourceId, targetId);

    // Remove the “source” from the local state
    // Because we’re effectively “removing” or “absorbing” that product
    setDuplicates((prev) => prev.filter((p) => p.id !== sourceId));

    console.log(`Merged product ${sourceId} → ${targetId}`);
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
              Not a Duplicate (Reject)
            </button>
          </header>

          {/* Show each duplicate in a row next to the original */}
          {product.duplicateProducts.map((dup) => (
            <div
              key={dup.id}
              className="flex flex-col md:flex-row items-center gap-4 mb-6"
            >
              {/* Original Product Card (the “keeper”) */}
              <ProductCard
                id={product.id}
                title={product.title}
                admin={false} // or pass actual admin if you want
                price={product.price} // or set a real price if you store it
                handle={''} // handle is empty or a placeholder
                shop={{ name: product.shopName, url: '#' } as any} // minimal shop object
                imageSrc={product.image?.src}
                parentType={null}
                childType={null}
              />

              {/* Merge Buttons in the middle */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <p className="text-sm text-gray-500">Merge direction</p>
                {/* Merge the DUPLICATE (dup) into the ORIGINAL (product) */}
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={() => handleMerge(dup.id, product.id)}
                >
                  ← Merge Duplicate → Original
                </button>

                {/* Merge the ORIGINAL (product) into the DUPLICATE (dup) */}
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={() => handleMerge(product.id, dup.id)}
                >
                  Merge Original → Duplicate →
                </button>
              </div>

              {/* Duplicate Product Card */}
              <ProductCard
                id={dup.id}
                title={dup.title}
                admin={false}
                price="--"
                handle={''}
                shop={{ name: dup.shopName, url: '#' } as any}
                imageSrc={dup.image?.src}
                parentType={null}
                childType={null}
              />
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
