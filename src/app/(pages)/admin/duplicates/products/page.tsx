'use server';
import ProductDuplicateManager from '@/components/admin/duplicates/products/productDuplicateManager';
import { validateRequest } from '@/lib/auth';

export default async function ProductDuplicates() {
  const { user } = await validateRequest();

  if (!user?.admin) {
    return <small>Long live this thing</small>;
  }

  return <ProductDuplicateManager />;
}
