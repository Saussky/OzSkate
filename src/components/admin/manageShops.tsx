'use client';
import { deleteShops, toggleShop } from '@/lib/actions';
import { skateboardShops } from '@/lib/constants';
import { useState, useTransition } from 'react';

type ManageShopsProps = {
  shopNames: string[];
};

export default function ManageShops({ shopNames }: ManageShopsProps) {
  const [shops, setShops] = useState<string[]>(shopNames);
  const [isPending, startTransition] = useTransition();

  const handleToggleShop = (name: string) => {
    startTransition(async () => {
      try {
        const { inDatabase } = await toggleShop(name);
        // Update local state so button immediately reflects the new status
        setShops((prev) =>
          inDatabase ? [...prev, name] : prev.filter((n) => n !== name)
        );
      } catch (error) {
        console.error('Error toggling shop:', error);
      }
    });
  };

  const handleDeleteAllShops = () => {
    startTransition(async () => {
      try {
        await deleteShops();
        setShops([]);
      } catch (error) {
        console.error('Error deleting all shops:', error);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="w-full flex justify-center mt-10 mb-4">
        <div className="flex">
          <h2 className="text-xl font-bold">Manage Shops</h2>
        </div>
        <button
          onClick={handleDeleteAllShops}
          disabled={isPending}
          className={`ml-4 ${
            isPending ? 'bg-gray-400 cursor-not-allowed' : ''
          }`}
        >
          {isPending ? '.' : '🗑️'}
        </button>
      </div>

      {skateboardShops.map((shop) => {
        const isActive = shops.includes(shop.name);
        return (
          <button
            key={shop.name}
            onClick={() => handleToggleShop(shop.name)}
            disabled={isPending}
            className={`px-4 py-2 font-semibold rounded-md ${
              isActive ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
            }`}
          >
            {shop.name}
          </button>
        );
      })}
    </div>
  );
}
