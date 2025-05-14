'use client';
import React from 'react';
import { ProductMenuHeader } from './menuHeader';
import { ProductMeta } from './menu';

interface Props extends ProductMeta {
  onBack: () => void;
  onClose: () => void;
}

const ProductInfoView: React.FC<Props> = ({
  title,
  handle,
  tags,
  createdAt,
  updatedAt,
  variantsCount,
  onBack,
  onClose,
}) => (
  <div className="p-4 w-64">
    <ProductMenuHeader title="Product info" onBack={onBack} onClose={onClose} />
    <ul className="mt-3 text-sm space-y-1">
      <li>
        <strong>Title:</strong> {title}
      </li>
      <li>
        <strong>Handle:</strong> {handle}
      </li>
      <li>
        <strong>Tags:</strong> {tags.join(', ') || '—'}
      </li>
      <li>
        <strong>Created:</strong> {new Date(createdAt).toLocaleString()}
      </li>
      <li>
        <strong>Updated:</strong> {new Date(updatedAt).toLocaleString()}
      </li>
      <li>
        <strong>Variants:</strong> {variantsCount}
      </li>
    </ul>
  </div>
);

export default ProductInfoView;
