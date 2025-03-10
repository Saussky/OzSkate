'use server';
import BrandsDuplicateManager from '@/components/admin/duplicates/brands/brandsDuplicateManager';
import { validateRequest } from '@/lib/auth';

export default async function BrandDuplicates() {
  const { user } = await validateRequest();

  //TODO: Replace with redirect
  if (!user?.admin) {
    return <small>Long live this thing</small>;
  }

  return <BrandsDuplicateManager />;
}
