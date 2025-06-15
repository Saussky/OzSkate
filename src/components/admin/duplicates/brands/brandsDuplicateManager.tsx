'use client';
import React, { useEffect, useState, useTransition } from 'react';
import {
  getVendorGroups,
  updateVendorGroup,
  addVendorRule,
  getAllVendors,
} from './actions';
import DropdownSelector from '@/components/ui/dropdown';

type VendorGroup = { group: string[] };

export default function BrandsDuplicateManager() {
  const [vendorGroups, setVendorGroups] = useState<VendorGroup[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<
    Record<number, string>
  >({});

  const [allVendors, setAllVendors] = useState<string[]>([]);
  const [patternVendor, setPatternVendor] = useState<string>('');
  const [standardVendor, setStandardVendor] = useState<string>('');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startTransition(async () => {
      try {
        const [groups, vendors] = await Promise.all([
          getVendorGroups(),
          getAllVendors(),
        ]);
        setVendorGroups(groups);
        setAllVendors(vendors);
      } catch {
        setError('Failed to load vendor data.');
      }
    });
  }, []);

  const handleSelectionChange = (groupIndex: number, value: string) =>
    setSelectedVendors((prev) => ({ ...prev, [groupIndex]: value }));

  const handleUpdateGroup = async (group: string[], groupIndex: number) => {
    const choice = selectedVendors[groupIndex];
    if (!choice) return alert('Please select a vendor to standardise.');

    try {
      await updateVendorGroup(group, choice);
      await Promise.all(
        group.filter((v) => v !== choice).map((v) => addVendorRule(v, choice))
      );

      setVendorGroups((prev) => prev.filter((_, idx) => idx !== groupIndex));
      setSelectedVendors((prev) => {
        const copy = { ...prev };
        delete copy[groupIndex];
        return copy;
      });
    } catch {
      alert('Failed to update vendors.');
    }
  };

  const handleAddVendorRule = async () => {
    if (!patternVendor || !standardVendor) {
      alert('Select both vendors first.');
      return;
    }
    if (patternVendor === standardVendor) {
      alert('Pattern and standard vendors must differ.');
      return;
    }

    try {
      await addVendorRule(patternVendor, standardVendor);
      await updateVendorGroup([patternVendor], standardVendor);

      startTransition(async () => {
        const [groups, vendors] = await Promise.all([
          getVendorGroups(),
          getAllVendors(),
        ]);
        setVendorGroups(groups);
        setAllVendors(vendors);
      });

      alert('Vendor rule added and products updated.');
      setPatternVendor('');
      setStandardVendor('');
    } catch {
      alert('Failed to add vendor rule.');
    }
  };

  if (error) return <div>{error}</div>;
  if (vendorGroups.length === 0 && allVendors.length === 0)
    return <div>Loading vendor data...</div>;

  return (
    <div className="space-y-10 p-4">
      <h1 className="text-2xl font-bold">Vendor Management</h1>

      <section className="space-y-4 border border-gray-300 p-4 rounded">
        <h2 className="text-xl font-semibold">Create vendor rule</h2>
        <div className="flex flex-col gap-4 md:flex-row">
          <DropdownSelector
            label="Vendor to convert"
            value={patternVendor}
            onChange={setPatternVendor}
            options={allVendors}
          />
          <DropdownSelector
            label="Standard vendor"
            value={standardVendor}
            onChange={setStandardVendor}
            options={allVendors}
          />
          <button
            type="button"
            onClick={handleAddVendorRule}
            disabled={isPending}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Add rule
          </button>
        </div>
      </section>

      {/* Auto-detected duplicate groups */}
      {vendorGroups.map((groupObj, index) => (
        <section key={index} className="border border-gray-300 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">
            Group {index + 1} (Total Vendors: {groupObj.group.length})
          </h2>

          <ul className="mb-4 list-disc list-inside">
            {groupObj.group.map((vendor) => (
              <li key={vendor}>{vendor}</li>
            ))}
          </ul>

          <div className="mb-4">
            <DropdownSelector
              label="Select standard vendor"
              value={selectedVendors[index] ?? ''}
              onChange={(value) => handleSelectionChange(index, value)}
              options={groupObj.group}
            />
          </div>

          <button
            type="button"
            onClick={() => handleUpdateGroup(groupObj.group, index)}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Standardise group
          </button>
        </section>
      ))}
    </div>
  );
}
