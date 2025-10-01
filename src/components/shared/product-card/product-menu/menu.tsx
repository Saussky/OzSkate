import React, { useState, useTransition } from 'react';
import { ParentType } from '@/lib/types';
import ProductInfoView from './productInfo';
import ProductTypeEditor from './productType';
import SuspectedDuplicate from './suspectDuplicate';
import Button from '@/components/ui/button';
import { deleteProduct } from '../actions';

type View = 'main' | 'info' | 'types' | 'duplicate' | 'confirmDelete';

export interface ProductMeta {
  id: string;
  title: string;
  handle: string;
  parentType: string | null;
  childType: string | null;
  tags: string[];
  createdAt: Date | string;
  shopifyUpdatedAt: Date | string;
  variantsCount: number;
}

interface ProductEditMenuProps extends ProductMeta {
  menuOpen: boolean;
  onClose: () => void;
  selectedParent: ParentType;
  setSelectedParent: React.Dispatch<React.SetStateAction<ParentType>>;
  selectedChild: string;
  setSelectedChild: React.Dispatch<React.SetStateAction<string>>;
  handleUpdateTypes: () => Promise<void>;
}

export default function ProductEditMenu({
  id,
  title,
  handle,
  tags,
  parentType,
  childType,
  createdAt,
  shopifyUpdatedAt,
  variantsCount,
  menuOpen,
  onClose,
  selectedParent,
  setSelectedParent,
  selectedChild,
  setSelectedChild,
  handleUpdateTypes,
}: ProductEditMenuProps) {
  const [view, setView] = useState<View>('main');
  const [isDeletingProduct, startDeletingProduct] = useTransition();

  if (!menuOpen) {
    return null;
  }

  const commonProps = {
    onBack: () => setView('main'),
    onClose,
  };

  const menuButtonStyling =
    'block w-full text-left px-3 py-2 hover:bg-gray-100 rounded';

  const handleDeleteConfirm = () => {
    startDeletingProduct(async () => {
      await deleteProduct(id);
      onClose();
    });
  };

  return (
    <div
      className="absolute right-0 bottom-full mb-2 bg-white border shadow-lg rounded z-50"
      style={{ width: '260px' }}
    >
      {view === 'main' && (
        <div className="p-2 text-sm">
          <button className={menuButtonStyling} onClick={() => setView('info')}>
            View product info
          </button>

          <button
            className={menuButtonStyling}
            onClick={() => setView('types')}
          >
            Change product types
          </button>

          <button
            className={menuButtonStyling}
            onClick={() => setView('duplicate')}
          >
            Mark as suspected duplicate
          </button>

          <button
            className={menuButtonStyling}
            onClick={() => setView('confirmDelete')}
          >
            Delete product
          </button>
        </div>
      )}

      {view === 'confirmDelete' && (
        <div className="flex flex-row p-2 text-sm">
          <Button
            onClick={handleDeleteConfirm}
            disabled={isDeletingProduct}
            className="w-full"
          >
            {isDeletingProduct ? 'Deleting...' : 'Delete'}
          </Button>

          <Button onClick={commonProps.onBack} className="w-full">
            Cancel
          </Button>
        </div>
      )}

      {view === 'info' && (
        <ProductInfoView
          {...commonProps}
          title={title}
          handle={handle}
          parentType={parentType}
          childType={childType}
          tags={tags}
          createdAt={createdAt}
          shopifyUpdatedAt={shopifyUpdatedAt}
          variantsCount={variantsCount}
          id={id}
        />
      )}

      {view === 'types' && (
        <ProductTypeEditor
          {...commonProps}
          selectedParent={selectedParent}
          setSelectedParent={setSelectedParent}
          selectedChild={selectedChild}
          setSelectedChild={setSelectedChild}
          handleUpdateTypes={handleUpdateTypes}
        />
      )}

      {view === 'duplicate' && <SuspectedDuplicate {...commonProps} />}
    </div>
  );
}
