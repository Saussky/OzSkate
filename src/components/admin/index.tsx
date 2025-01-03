'use client';
import { useState } from 'react';
import RefreshCountsButton from './refreshCountsButton';
import FetchProductsButton from './fetchProductsButton';
import DeleteAllProductsButton from './deleteAllProductsButton';
import DeleteShopsButton from './deleteShopsButton';
import ManageShops from './manageShops';

interface HomeComponentProps {
  shopCount: number;
  productCount: number;
  shopNames: string[];
}

export default function AdminComponent({
  shopCount,
  productCount,
  shopNames,
}: HomeComponentProps) {
  const [currentShopCount, setCurrentShopCount] = useState(shopCount);
  const [currentProductCount, setCurrentProductCount] = useState(productCount);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-center text-4xl font-bold text-gray-800 my-12">
        OzSkate
      </h1>

      <div className="flex justify-center space-x-8 mb-12">
        <div className="flex-1 max-w-sm p-6 bg-white rounded-lg shadow-lg">
          <p className="text-lg font-semibold text-gray-700">Number of Shops</p>
          <p className="text-3xl font-bold text-blue-500">{currentShopCount}</p>
        </div>
        <div className="flex-1 max-w-sm p-6 bg-white rounded-lg shadow-lg">
          <p className="text-lg font-semibold text-gray-700">
            Number of Products
          </p>
          <p className="text-3xl font-bold text-blue-500">
            {currentProductCount}
          </p>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <FetchProductsButton />
        <DeleteAllProductsButton />
        <DeleteShopsButton />
      </div>
      <div className="flex justify-center mt-6">
        <RefreshCountsButton
          onRefresh={(newShopCount, newProductCount) => {
            setCurrentShopCount(newShopCount);
            setCurrentProductCount(newProductCount);
          }}
        />
      </div>

      <div className="p-4">
        <h2 className="text-xl mb-4">Manage Shops</h2>
        {/* Pass the array of existing shop names to the client component */}
        <ManageShops shopNames={shopNames} />
      </div>
    </div>
  );
}
