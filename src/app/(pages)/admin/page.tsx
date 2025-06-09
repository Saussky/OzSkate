'use server';
import {
  getOnSaleCount,
  getProductCount,
  getShopCount,
} from '@/components/admin/admin/actions';
import AdminComponent from '@/components/admin/admin/admin';
import { validateRequest } from '@/lib/cookies';

export default async function Admin() {
  const { user } = await validateRequest();

  if (!user?.admin) {
    return <small>Long live this thing</small>;
  }

  const productCount = await getProductCount();
  const shopCount = await getShopCount();
  const onSaleCount = await getOnSaleCount();

  return (
    <div>
      <AdminComponent
        shopCount={shopCount}
        productCount={productCount}
        onSaleCount={onSaleCount}
      />
    </div>
  );
}
