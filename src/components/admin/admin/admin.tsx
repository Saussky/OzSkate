'use client';
import { useState, useTransition } from 'react';
import Button from '../../../components/ui/button';
import { deleteAllProducts, refreshCounts } from './actions';
import { refreshSaleStatuses, updateAllProducts } from '@/lib/product/update';
import { fetchAllProducts } from '@/lib/product/fetch';
import Card from '@/components/ui/card';

interface AdminComponentProps {
  shopCount: number;
  productCount: number;
  onSaleCount: number;
}

interface UpdateResult {
  added: number;
  priceChanged: number;
}

export default function AdminComponent({
  shopCount,
  productCount,
  onSaleCount,
}: AdminComponentProps): JSX.Element {
  const [currentShopCount, setCurrentShopCount] = useState<number>(shopCount);
  const [currentProductCount, setCurrentProductCount] =
    useState<number>(productCount);
  const [currentOnSaleCount, setCurrentOnSaleCount] =
    useState<number>(onSaleCount);

  const [isRefreshing, startRefresh] = useTransition();
  const [isFetching, startFetch] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [isUpdating, startUpdate] = useTransition();
  const [isCheckingSaleStatus, startCheckingSaleStatus] = useTransition();

  const [fetchMessage, setFetchMessage] = useState<string>('');
  const [deleteMessage, setDeleteMessage] = useState<string>('');
  const [updateMessage, setUpdateMessage] = useState<string>('');
  const [updateResult, setUpdateResult] = useState<UpdateResult | null>(null);

  const handleRefreshCounts = () => {
    startRefresh(async () => {
      const { shopCount, productCount, onSaleCount } = await refreshCounts();
      setCurrentShopCount(shopCount);
      setCurrentProductCount(productCount);
      setCurrentOnSaleCount(onSaleCount);
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

  const handleUpdateProducts = () => {
    startUpdate(async () => {
      setUpdateMessage('Updating products...');
      try {
        const result: UpdateResult = await updateAllProducts();
        setUpdateResult(result);
        setUpdateMessage('Product update completed.');
      } catch (error) {
        console.error('Error:', error);
        setUpdateMessage('An error occurred during product update.');
      }
    });
  };

  const handleRefreshSaleStatus = () => {
    startCheckingSaleStatus(async () => {
      try {
        await refreshSaleStatuses();
      } catch (error) {
        console.error('Error:', error);
        setUpdateMessage('An error occurred during updating sale statuses.');
      }
    });
  };
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-wrap justify-center gap-8 mb-12">
        <Card title="Shop Count">{currentShopCount}</Card>
        <Card title="Product Count">{currentProductCount}</Card>
        <Card title="On Sale Count">{currentOnSaleCount}</Card>
      </div>

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

      <div className="flex flex-col items-center space-y-4">
        <Button
          onClick={handleRefreshCounts}
          disabled={isRefreshing}
          variant="smart"
        >
          {isRefreshing ? 'Refreshing...' : '🔄 Refresh Counts'}
        </Button>

        <Button
          onClick={handleUpdateProducts}
          disabled={isUpdating}
          variant="smart"
        >
          {isUpdating ? 'Updating Products...' : 'Update Products'}
        </Button>

        <Button
          onClick={handleRefreshSaleStatus}
          disabled={isUpdating}
          variant="smart"
        >
          {isCheckingSaleStatus
            ? 'Checking sale statuses.'
            : 'Update Sale Status'}
        </Button>

        {updateMessage && (
          <p className="text-sm text-gray-600">{updateMessage}</p>
        )}

        {updateResult && (
          <Card title="Update Summary">
            <div className="text-base font-normal">
              <p>Products Added: {updateResult.added}</p>
              <p>Products with Price Change: {updateResult.priceChanged}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
