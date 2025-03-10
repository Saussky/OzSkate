import { getShopNames } from '@/components/admin/admin/actions';
import ManageShops from '@/components/admin/shops/manageShops';
import { validateRequest } from '@/lib/auth';

export default async function AdminShops() {
  const { user } = await validateRequest();

  if (!user?.admin) {
    return <small>Long live this thing</small>;
  }

  const shopNames = await getShopNames();

  return (
    <div className="p-4">
      <ManageShops shopNames={shopNames} />
    </div>
  );
}
