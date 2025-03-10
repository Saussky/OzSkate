'use server';

import {
  getProductCount,
  getShopCount,
  getShopNames,
} from '@/components/admin/admin/actions';
import AdminComponent from '@/components/admin/admin/admin';
import { validateRequest } from '@/lib/auth';

export default async function Admin() {
  const { user } = await validateRequest();

  // if (!user?.admin) {
  //   return <small>Long live this thing</small>;
  // }

  const productCount = await getProductCount();
  const shopCount = await getShopCount();
  const shopNames = await getShopNames();

  return (
    <div>
      <AdminComponent
        shopCount={shopCount}
        productCount={productCount}
        shopNames={shopNames}
      />
    </div>
  );
}
