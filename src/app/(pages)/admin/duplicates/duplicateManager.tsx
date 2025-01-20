'use client';
import React, { useEffect, useState, useTransition } from 'react';
import { getDuplicates, approveDuplicate, rejectDuplicate } from './actions';
import Image from 'next/image';

type DuplicateProduct = {
  id: string;
  title: string;
  approved: boolean;
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
  const [duplicates, setDuplicates] = useState<DuplicateProduct[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await getDuplicates();
      setDuplicates(data);
    });
  }, []);

  async function handleApprove(productId: string) {
    await approveDuplicate(productId);
    setDuplicates((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, approved: true } : p))
    );
  }

  async function handleReject(productId: string) {
    await rejectDuplicate(productId);
    setDuplicates((prev) => prev.filter((p) => p.id !== productId));
  }

  async function handleMerge(sourceId: string, targetId: string) {
    // Implement merging logic here (e.g., call a merge function on the server)
    console.log(`Merging product ${sourceId} into ${targetId}`);
    // Post-merge logic (e.g., refetch data or update state)
  }

  if (duplicates.length === 0) {
    return <div>No duplicates found.</div>;
  }

  return (
    <div>
      {duplicates.map((product) => (
        <div key={product.id} className="border p-4 mb-4 rounded">
          <h2 className="font-bold text-xl">{product.title}</h2>
          <p className="text-gray-600">Store: {product.shopName}</p>

          <div className="flex mt-4">
            {/* Original product */}
            <div className="flex-1 text-center">
              <h3 className="font-medium">Original</h3>
              <Image
                src={product.image?.src || '/placeholder.jpg'}
                alt={product.title}
                width={150}
                height={150}
                className="mx-auto rounded"
              />
              <p>{product.title}</p>
            </div>

            {/* Duplicates */}
            {product.duplicateProducts.map((dp) => (
              <div key={dp.id} className="flex-1 text-center">
                <h3 className="font-medium">Duplicate</h3>
                <Image
                  src={dp.image?.src || '/placeholder.jpg'}
                  alt={dp.title}
                  width={150}
                  height={150}
                  className="mx-auto rounded"
                />
                <p>{dp.title}</p>
                <p className="text-gray-600">Store: {dp.shopName}</p>
                <div className="mt-2">
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                    onClick={() => handleMerge(dp.id, product.id)}
                  >
                    Merge Into Original
                  </button>
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => handleMerge(product.id, dp.id)}
                  >
                    Merge Into Duplicate
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-x-2">
            {!product.approved && (
              <button
                className="bg-blue-500 text-white px-4 py-1 rounded"
                onClick={() => handleApprove(product.id)}
                disabled={isPending}
              >
                Approve
              </button>
            )}
            <button
              className="bg-red-500 text-white px-4 py-1 rounded"
              onClick={() => handleReject(product.id)}
              disabled={isPending}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
