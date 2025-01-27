'use server';

import FindDuplicatesButton from '@/app/(pages)/admin/duplicates/findDuplicatesButton';
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
