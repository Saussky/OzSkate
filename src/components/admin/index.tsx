'use client';
import { useState } from 'react';
import RefreshCountsButton from './refreshCountsButton';
import FetchProductsButton from './fetchProductsButton';
import DeleteAllProductsButton from './deleteAllProductsButton';
import ManageShops from './manageShops';
import { updateAllProducts } from './actions';

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

  async function handleUpdateProductsClick() {
    await updateAllProducts();
  }

  return (
    <>
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
      </div>
      <div className="flex justify-center mt-6">
        <RefreshCountsButton
          onRefresh={(newShopCount, newProductCount) => {
            setCurrentShopCount(newShopCount);
            setCurrentProductCount(newProductCount);
          }}
        />
      </div>
      <div className="flex justify-center mt-6">
        <button onClick={handleUpdateProductsClick}>Update Products</button>
      </div>

      <div className="p-4">
        <ManageShops shopNames={shopNames} />
      </div>
    </>
  );
}
