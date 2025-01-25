'use client';
import { checkAllProductsForDuplicates } from '@/lib/actions';
import { useTransition } from 'react';

export default function MergeProductsButton() {
  const [isPending, startTransition] = useTransition();

  async function handleMerge() {
    startTransition(async () => {
      checkAllProductsForDuplicates();
    });
  }

  return (
    <button
      onClick={handleMerge}
      disabled={isPending}
      className={`px-6 py-3 text-white font-bold rounded-lg ${
        isPending
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-500 hover:bg-blue-700'
      }`}
    >
      <span
        className={`inline-block text-xl ${isPending ? 'animate-spin' : ''}`}
      >
        Merge Duplicates
      </span>
    </button>
  );
}
