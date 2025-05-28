'use client';

import { skateboardShops } from '@/lib/constants';
import { useState, useTransition } from 'react';
import { deleteShops, toggleShop } from './actions';
import type { ShopStats } from './actions';

type ManageShopsProps = {
  shopNames: string[];
  shopStats: Record<string, ShopStats>;
};

function groupShopsByState(shops: typeof skateboardShops) {
  return shops.reduce((acc, shop) => {
    (acc[shop.state] ??= []).push(shop);
    return acc;
  }, {} as Record<string, typeof skateboardShops>);
}

export default function ManageShops({
  shopNames,
  shopStats,
}: ManageShopsProps) {
  const [activeShops, setActiveShops] = useState(shopNames);
  const [isPending, startTransition] = useTransition();
  const shopsByState = groupShopsByState(skateboardShops);

  const handleToggleShop = (name: string) =>
    startTransition(async () => {
      try {
        const { inDatabase } = await toggleShop(name);
        setActiveShops((prev) =>
          inDatabase ? [...prev, name] : prev.filter((n) => n !== name)
        );
      } catch (err) {
        console.error('Error toggling shop:', err);
      }
    });

  const handleDeleteAllShops = () =>
    startTransition(async () => {
      try {
        await deleteShops();
        setActiveShops([]);
      } catch (err) {
        console.error('Error deleting all shops:', err);
      }
    });

  const handleActivateAllShops = () =>
    startTransition(async () => {
      try {
        for (const { name } of skateboardShops) {
          if (!activeShops.includes(name)) await toggleShop(name);
        }
        setActiveShops(skateboardShops.map((s) => s.name));
      } catch (err) {
        console.error('Error activating all shops:', err);
      }
    });

  return (
    <div className="space-y-6 px-6">
      {/* Header */}
      <div className="flex items-center justify-center space-x-4 mt-8">
        <h2 className="text-2xl font-bold">Manage Shops</h2>
        <button
          onClick={handleDeleteAllShops}
          disabled={isPending}
          className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50"
        >
          🗑️
        </button>
        <button
          onClick={handleActivateAllShops}
          disabled={isPending}
          className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200 disabled:opacity-50"
        >
          ✅
        </button>
      </div>

      {/* Shops Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mx-auto w-full max-w-5xl">
        {Object.entries(shopsByState).map(([state, shops]) => (
          <div key={state} className="col-span-full">
            <h3 className="text-xl font-semibold mb-4 border-b pb-1">
              {state}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {shops.map((shop) => {
                const isActive = activeShops.includes(shop.name);
                const s = shopStats[shop.name];

                return (
                  <button
                    key={shop.name}
                    onClick={() => handleToggleShop(shop.name)}
                    disabled={isPending}
                    className={`
                      flex flex-col p-4 rounded-lg shadow transition
                      ${
                        isActive
                          ? 'border-2 border-green-500 bg-white'
                          : 'border border-gray-300 bg-gray-50'
                      }
                      disabled:opacity-50
                    `}
                  >
                    <span className="text-lg font-medium mb-3">
                      {shop.name}
                    </span>

                    {/* Stats Dashboard */}
                    {s && (
                      <div className="flex flex-col space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{s.total}</div>
                            <div className="text-xs text-gray-500">Total</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{s.onSale}</div>
                            <div className="text-xs text-gray-500">On Sale</div>
                          </div>
                        </div>

                        <h4>Items</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-xl font-semibold">
                              {s.addedWeek}
                            </div>
                            <div className="text-xs text-gray-500">
                              This Week
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-semibold">
                              {s.addedMonth}
                            </div>
                            <div className="text-xs text-gray-500">
                              This Month
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-semibold">
                              {s.addedYear}
                            </div>
                            <div className="text-xs text-gray-500">
                              This Year
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-center">
                          <div className="flex flex-wrap gap-2 justify-center items-center">
                            {Object.entries(s.parentTypeCounts).map(
                              ([pt, c]) => (
                                <span
                                  key={pt}
                                  className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs"
                                >
                                  {pt}: <span className="font-medium">{c}</span>
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )}
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
