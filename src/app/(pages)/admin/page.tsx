'use server';
import { getProductCount, getShopCount, getShopNames } from '@/lib/actions';
import AdminComponent from '@/components/admin';
import { validateRequest } from '@/lib/lucia';

export default async function Admin() {
  const { user } = await validateRequest();

  //TODO: Uncomment
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
