'use client';
import React from 'react';
import { ProductMenuHeader } from './menuHeader';

interface Props {
  onBack: () => void;
  onClose: () => void;
}

const SuspectedDuplicate: React.FC<Props> = ({ onBack, onClose }) => (
  <div className="p-4 w-64">
    <ProductMenuHeader
      title="Mark as duplicate"
      onBack={onBack}
      onClose={onClose}
    />

    <p className="mt-3 text-sm">
      Placeholder – implement the duplicate‑marking flow here.
    </p>
  </div>
);

export default SuspectedDuplicate;
