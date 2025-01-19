'use client';
import { checkAllProductsForDuplicates } from '@/lib/actions';
import { useTransition } from 'react';

export default function MergeProductsButton() {
  const [isPending, startTransition] = useTransition();

  async function handleMerge() {
    startTransition(async () => {
      const merge = checkAllProductsForDuplicates();
      console.log('merge', merge);
    });
  }

  return (
    <button
      onClick={handleMerge}
      disabled={isPending}
      className={`py-2 px-4 rounded flex items-center justify-center ${
        isPending ? 'animate-spin' : ''
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
