import { getShopNames } from '@/components/admin/admin/actions';
import { getShopStats } from '@/components/admin/shops/actions';
import ManageShops from '@/components/admin/shops/manageShops';
import { validateRequest } from '@/lib/cookies';

export default async function AdminShops() {
  const { user } = await validateRequest();

  if (!user?.admin) {
    return <small>Long live this thing</small>;
  }

  const [shopNames, stats] = await Promise.all([
    getShopNames(),
    getShopStats(),
  ]);
  const statsByName = Object.fromEntries(stats.map((s) => [s.name, s]));

  return (
    <div className="p-4">
      <ManageShops shopNames={shopNames} shopStats={statsByName} />
    </div>
  );
}
