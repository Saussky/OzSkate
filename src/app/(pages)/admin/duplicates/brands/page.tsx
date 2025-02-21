'use server';
import VendorStandardizationPage from './brandsDuplicateManager';

export default async function Duplicates() {
  return (
    <div>
      <div>
        <h1> Duplicate Barnds </h1>
        <VendorStandardizationPage />
      </div>
    </div>
  );
}
