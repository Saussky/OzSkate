'use server';

import MergeProductsButton from '@/components/admin/mergeButton';
import DuplicateManager from './duplicateManager';

export default async function Duplicates() {
  return (
    <div>
      <MergeProductsButton />
      <div>
        <h1> Duplicates </h1>
        <DuplicateManager />
      </div>
    </div>
  );
}
