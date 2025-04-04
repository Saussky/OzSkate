'use server';
import BrandsDuplicateManager from '@/components/admin/duplicates/brands/brandsDuplicateManager';
import { validateRequest } from '@/lib/cookies';

export default async function BrandDuplicates() {
  const { user } = await validateRequest();

  if (!user?.admin) {
    return <small>Long live this thing</small>;
  }

  return <BrandsDuplicateManager />;
}
