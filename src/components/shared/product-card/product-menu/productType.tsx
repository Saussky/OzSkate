'use client';
import React from 'react';
import { ParentType } from '@/lib/types';
import { ProductMenuHeader } from './menuHeader';
import { childTypePerParent } from '@/components/storefront/filter';

interface Props {
  selectedParent: ParentType;
  setSelectedParent: React.Dispatch<React.SetStateAction<ParentType>>;
  selectedChild: string;
  setSelectedChild: React.Dispatch<React.SetStateAction<string>>;
  handleUpdateTypes: () => Promise<void>;
  onBack: () => void;
  onClose: () => void;
}

const ProductTypeEditor: React.FC<Props> = ({
  selectedParent,
  setSelectedParent,
  selectedChild,
  setSelectedChild,
  handleUpdateTypes,
  onBack,
  onClose,
}) => {
  const childOptions = childTypePerParent[selectedParent];

  return (
    <div className="p-4 w-64">
      <ProductMenuHeader
        title="Change product types"
        onBack={onBack}
        onClose={onClose}
      />

      <div className="mt-4 space-y-3 text-sm">
        <div>
          <span className="font-medium">Parent type</span>
          <select
            className="block mt-1 w-full border p-1 rounded"
            value={selectedParent}
            onChange={(e) => setSelectedParent(e.target.value as ParentType)}
          >
            {(Object.keys(childTypePerParent) as ParentType[]).map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <span className="font-medium">Child type</span>
          <select
            className="block mt-1 w-full border p-1 rounded"
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
          >
            {childOptions.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleUpdateTypes}
          className="w-full mt-2 bg-blue-600 text-white rounded py-1 hover:bg-blue-700"
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default ProductTypeEditor;
