'use client';
import { useState, useTransition } from 'react';
import Button from '../../../components/ui/button';
import { deleteAllProducts, refreshCounts } from './actions';
import { updateAllProducts } from '@/lib/product/update';
import { fetchAllProducts } from '@/lib/product/fetch';

interface AdminComponentProps {
  shopCount: number;
  productCount: number;
}

export default function AdminComponent({
  shopCount,
  productCount,
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

  const handleRefreshCounts = () => {
    startRefresh(async () => {
      const { shopCount, productCount } = await refreshCounts();
      setCurrentShopCount(shopCount);
      setCurrentProductCount(productCount);
    });
  };

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

  const handleUpdateProducts = async () => {
    await updateAllProducts();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Stats Cards */}
      <div className="flex flex-wrap justify-center gap-8 mb-12">
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

      {/* Fetch and Delete Products */}
      <div className="flex flex-col items-center space-y-2">
        <div className="flex space-x-4">
          <Button
            onClick={handleFetchProducts}
            disabled={isFetching}
            variant="smart"
          >
            {isFetching ? 'Fetching Products...' : 'Fetch All Products'}
          </Button>
          <Button
            onClick={handleDeleteProducts}
            disabled={isDeleting}
            variant="smart"
          >
            {isDeleting ? 'Deleting Products...' : 'Delete All Products'}
          </Button>
        </div>
        {fetchMessage && (
          <p className="text-sm text-gray-600">{fetchMessage}</p>
        )}
        {deleteMessage && (
          <p className="text-sm text-gray-600">{deleteMessage}</p>
        )}
      </div>

      {/* Refresh and Update */}
      <div className="flex flex-col items-center space-y-4">
        <Button
          onClick={handleRefreshCounts}
          disabled={isRefreshing}
          variant="smart"
        >
          {isRefreshing ? 'Refreshing...' : '🔄 Refresh Counts'}
        </Button>
        <Button onClick={handleUpdateProducts} variant="smart">
          Update Products
        </Button>
      </div>
    </div>
  );
}
