'use client';

import { useState, useTransition } from 'react';
import ManageShops from '../../../components/admin/shops/manageShops';
import { fetchAllProducts, deleteAllProducts } from '@/lib/actions';
import Button from '../../../components/ui/button';

import { refreshCounts } from './actions';
import { updateAllProducts } from '@/lib/product/update';

interface AdminComponentProps {
  shopCount: number;
  productCount: number;
  shopNames: string[];
}

// Shared  button component for consistent styling

export default function AdminComponent({
  shopCount,
  productCount,
  shopNames,
}: AdminComponentProps): JSX.Element {
  const [currentShopCount, setCurrentShopCount] = useState<number>(shopCount);
  const [currentProductCount, setCurrentProductCount] =
    useState<number>(productCount);

  // Refresh Counts state and transition
  const [isRefreshing, startRefresh] = useTransition();

  // Fetch Products state, transition, and message
  const [isFetching, startFetch] = useTransition();
  const [fetchMessage, setFetchMessage] = useState<string>('');

  // Delete Products state, transition, and message
  const [isDeleting, startDelete] = useTransition();
  const [deleteMessage, setDeleteMessage] = useState<string>('');

  // Handle refresh counts inline
  const handleRefreshCounts = () => {
    startRefresh(async () => {
      const { shopCount, productCount } = await refreshCounts();
      setCurrentShopCount(shopCount);
      setCurrentProductCount(productCount);
    });
  };

  // Handle fetch products inline
  const handleFetchProducts = () => {
    startFetch(async () => {
      setFetchMessage('Fetching products...');
      try {
        await fetchAllProducts();
        setFetchMessage('Product import completed.');
        setTimeout(() => setFetchMessage(''), 2000);
      } catch (error) {
        console.error('Error:', error);
        setFetchMessage('An error occurred during product import.');
      }
    });
  };

  // Handle delete products inline
  const handleDeleteProducts = () => {
    startDelete(async () => {
      setDeleteMessage('Deleting all products...');
      try {
        await deleteAllProducts();
        setDeleteMessage('All products successfully deleted.');
        setTimeout(() => setDeleteMessage(''), 2000);
      } catch (error) {
        console.error('Error:', error);
        setDeleteMessage('An error occurred while deleting products.');
      }
    });
  };

  // Handle update products inline (no transition required)
  const handleUpdateProducts = async () => {
    await updateAllProducts();
  };

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
        <Button onClick={handleFetchProducts} disabled={isFetching}>
          {isFetching ? 'Fetching Products...' : 'Fetch All Products'}
        </Button>
        {fetchMessage && (
          <p className="mt-2 text-sm text-gray-600">{fetchMessage}</p>
        )}
      </div>
      <div>
        <Button onClick={handleDeleteProducts} disabled={isDeleting}>
          {isDeleting ? 'Deleting Products...' : 'Delete All Products'}
        </Button>
        {deleteMessage && (
          <p className="mt-2 text-sm text-gray-600">{deleteMessage}</p>
        )}
      </div>

      <div className="flex justify-center mt-6">
        <Button onClick={handleRefreshCounts} disabled={isRefreshing}>
          {isRefreshing ? 'Refreshing...' : '🔄 Refresh Counts'}
        </Button>
      </div>

      <div className="flex justify-center mt-6">
        <Button onClick={handleUpdateProducts} disabled={false}>
          Update Products
        </Button>
      </div>

      <div className="p-4">
        <ManageShops shopNames={shopNames} />
      </div>
    </>
  );
}
