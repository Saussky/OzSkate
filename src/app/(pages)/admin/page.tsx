'use server';
import AdminComponent from '@/app/(pages)/admin/admin';
import { validateRequest } from '@/lib/lucia';
import { getProductCount, getShopCount, getShopNames } from './actions';

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
