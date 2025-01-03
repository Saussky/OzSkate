'use server';
import { getProductCount, getShopCount, getShopNames } from '@/lib/actions';
import AdminComponent from '@/components/admin';
import './globals.css';

export default async function Home() {
  const productCount = await getProductCount();
  const shopCount = await getShopCount();
  const shopNames = await getShopNames();

  return (
    <div>
      <small>Long live this thing</small>
      <AdminComponent
        shopCount={shopCount}
        productCount={productCount}
        shopNames={shopNames}
      />
    </div>
  );
}
