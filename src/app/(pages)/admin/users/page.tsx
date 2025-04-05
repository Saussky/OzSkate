import ManageUsers from '@/components/admin/users/manageUsers';
import { validateRequest } from '@/lib/cookies';

export default async function Users() {
  const { user } = await validateRequest();

  if (!user?.admin) {
    return <small>Long live this thing</small>;
  }

  return <ManageUsers />;
}
