'use client';
import React from 'react';
import { ParentType } from '@/lib/types';
import { childTypePerParent } from './filter';

interface ProductEditMenuProps {
  menuOpen: boolean;
  selectedParent: ParentType;
  setSelectedParent: React.Dispatch<React.SetStateAction<ParentType>>;
  selectedChild: string;
  setSelectedChild: React.Dispatch<React.SetStateAction<string>>;
  handleUpdateTypes: () => Promise<void>;
}

export default function ProductEditMenu({
  menuOpen,
  selectedParent,
  setSelectedParent,
  selectedChild,
  setSelectedChild,
  handleUpdateTypes,
}: ProductEditMenuProps) {
  if (!menuOpen) return null;
  const childOptions = childTypePerParent[selectedParent];

  return (
    <div
      className="absolute right-0 bottom-full mb-2 w-52 bg-white border border-gray-300 shadow-lg rounded z-10"
      style={{ transform: 'translate(0, -2px)' }}
    >
      <div className="py-1">
        <div className="px-4 py-2 text-sm text-gray-700">
          <div className="font-medium mb-1">Parent Type</div>
          <select
            className="block w-full p-1 border border-gray-300 rounded"
            value={selectedParent}
            onChange={(e) => setSelectedParent(e.target.value as ParentType)}
          >
            {(Object.keys(childTypePerParent) as ParentType[]).map((parent) => (
              <option key={parent} value={parent}>
                {parent}
              </option>
            ))}
          </select>
        </div>

        <div className="px-4 py-2 text-sm text-gray-700">
          <div className="font-medium mb-1">Child Type</div>
          <select
            className="block w-full p-1 border border-gray-300 rounded"
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
          >
            {childOptions.map((child) => (
              <option key={child} value={child}>
                {child}
              </option>
            ))}
          </select>
        </div>

        <div className="border-t border-gray-200 my-2"></div>
        <button
          onClick={handleUpdateTypes}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Update
        </button>
      </div>
    </div>
  );
}
