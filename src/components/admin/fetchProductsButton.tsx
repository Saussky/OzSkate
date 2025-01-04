'use client';
import { fetchAllProducts } from '@/lib/actions';
import React, { useState, useTransition } from 'react';

export default function FetchProductsButton() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');

  const handleClick = () => {
    startTransition(async () => {
      setMessage('Fetching products...');
      try {
        await fetchAllProducts();
        setMessage('Product import completed.');
        setTimeout(() => {
          setMessage('');
        }, 2000);
      } catch (error) {
        console.error('Error:', error);
        setMessage('An error occurred during product import.');
      }
    });
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`px-6 py-3 text-white font-bold rounded-lg ${
          isPending
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-700'
        }`}
      >
        {isPending ? 'Fetching Products...' : 'Fetch All Products'}
      </button>
      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
    </div>
  );
}
