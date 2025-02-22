'use server';
import BrandsDuplicateManager from './brandsDuplicateManager';

export default async function Duplicates() {
  return (
    <div>
      <BrandsDuplicateManager />
    </div>
  );
}
