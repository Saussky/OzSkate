'use client';
import React, { useEffect, useState, useTransition } from 'react';
import { getVendorGroups, updateVendorGroup, addVendorRule } from './actions';

type VendorGroup = {
  group: string[];
};

export default function BrandsDuplicateManager() {
  const [vendorGroups, setVendorGroups] = useState<VendorGroup[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<{
    [groupIndex: number]: string;
  }>({});
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startTransition(async () => {
      try {
        const groups: VendorGroup[] = await getVendorGroups();
        setVendorGroups(groups);
      } catch (err) {
        console.error(err);
        setError('Failed to load vendor groups.');
      }
    });
  }, []);

  const handleSelectionChange = (groupIndex: number, selected: string) => {
    setSelectedVendors((prev) => ({ ...prev, [groupIndex]: selected }));
  };

  const handleUpdateGroup = async (group: string[], groupIndex: number) => {
    const selectedVendor = selectedVendors[groupIndex];
    if (!selectedVendor) {
      alert('Please select a vendor to standardise.');
      return;
    }
    try {
      // Update all products in this group to the selected vendor
      await updateVendorGroup(group, selectedVendor);

      // Add a vendor rule for every non-standard vendor in the group
      for (const vendor of group) {
        if (vendor !== selectedVendor) {
          await addVendorRule(vendor, selectedVendor);
        }
      }

      // Remove the standardised group from the list
      setVendorGroups((prev) => prev.filter((_, idx) => idx !== groupIndex));
      setSelectedVendors((prev) => {
        const newSelections = { ...prev };
        delete newSelections[groupIndex];
        return newSelections;
      });
    } catch (err) {
      console.error(err);
      alert('Failed to update vendors.');
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (vendorGroups.length === 0) {
    return <div>Loading vendor groups...</div>; //TODO: Spinner
  }

  return (
    <div className="space-y-8 p-4">
      <h1 className="text-2xl font-bold">Vendor Standardisation</h1>

      {vendorGroups.map((groupObj, index) => (
        <div key={index} className="border border-gray-300 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">
            Group {index + 1} (Total Vendors: {groupObj.group.length})
          </h2>

          <ul className="mb-4">
            {groupObj.group.map((vendor) => (
              <li key={vendor}>{vendor}</li>
            ))}
          </ul>

          <div className="mb-4">
            <label className="block mb-2 font-medium">
              Select standard vendor:
            </label>

            <select
              value={selectedVendors[index] || ''}
              onChange={(e) => handleSelectionChange(index, e.target.value)}
              className="border border-gray-300 p-2 rounded"
            >
              <option value="" disabled>
                Select vendor
              </option>
              {groupObj.group.map((vendor) => (
                <option key={vendor} value={vendor}>
                  {vendor}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => handleUpdateGroup(groupObj.group, index)}
            disabled={isPending}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Standardise Group
          </button>
        </div>
      ))}
    </div>
  );
}
