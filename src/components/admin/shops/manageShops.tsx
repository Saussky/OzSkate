'use client';
import { skateboardShops } from '@/lib/constants';
import { useState, useTransition } from 'react';
import { deleteShops, toggleShop } from './actions';

type ManageShopsProps = {
  shopNames: string[];
};

function groupShopsByState(shops: typeof skateboardShops) {
  return shops.reduce((acc, shop) => {
    acc[shop.state] = acc[shop.state] || [];
    acc[shop.state].push(shop);
    return acc;
  }, {} as Record<string, typeof skateboardShops>);
}

export default function ManageShops({ shopNames }: ManageShopsProps) {
  const [activeShops, setActiveShops] = useState<string[]>(shopNames);
  const [isPending, startTransition] = useTransition();

  const handleToggleShop = (name: string) => {
    startTransition(async () => {
      try {
        const { inDatabase } = await toggleShop(name);
        // Update local state immediately to reflect the new status
        setActiveShops((prev) =>
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
        setActiveShops([]);
      } catch (error) {
        console.error('Error deleting all shops:', error);
      }
    });
  };

  const handleActivateAllShops = () => {
    startTransition(async () => {
      try {
        for (const shop of skateboardShops) {
          if (!activeShops.includes(shop.name)) {
            await toggleShop(shop.name);
          }
        }
        // Update local state so all shops appear active
        setActiveShops(skateboardShops.map((shop) => shop.name));
      } catch (error) {
        console.error('Error activating all shops:', error);
      }
    });
  };

  const shopsByState = groupShopsByState(skateboardShops);

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

        <button
          onClick={handleActivateAllShops}
          disabled={isPending}
          className={`ml-4 ${
            isPending ? 'bg-gray-400 cursor-not-allowed' : ''
          }`}
        >
          {isPending ? '.' : '✅'}
        </button>
      </div>

      <div className="w-2/3 mx-auto">
        {Object.entries(shopsByState).map(([state, shopsInState]) => (
          <div key={state} className="mb-8">
            <h3 className="text-lg font-semibold mb-4">{state}</h3>
            <div className="grid grid-cols-3 gap-4">
              {shopsInState.map((shop) => {
                const isActive = activeShops.includes(shop.name);
                return (
                  <button
                    key={shop.name}
                    onClick={() => handleToggleShop(shop.name)}
                    disabled={isPending}
                    className={`px-4 py-2 font-semibold rounded-md ${
                      isActive
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-700'
                    }`}
                  >
                    {shop.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
