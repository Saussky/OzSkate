'use server';

import FindDuplicatesButton from '@/components/admin/mergeButton';
import DuplicateManager from './duplicateManager';

export default async function Duplicates() {
  return (
    <div>
      <FindDuplicatesButton />
      <div>
        <h1> Duplicates </h1>
        <DuplicateManager />
      </div>
    </div>
  );
}
