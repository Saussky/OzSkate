'use client';
import React, { useState } from 'react';
import { ParentType } from '@/lib/types';
import ProductInfoView from './productInfo';
import ProductTypeEditor from './productType';
import SuspectedDuplicate from './suspectDuplicate';

type View = 'main' | 'info' | 'types' | 'duplicate';

export interface ProductMeta {
  id: string;
  title: string;
  handle: string;
  tags: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
  variantsCount: number;
}

interface Props extends ProductMeta {
  menuOpen: boolean;
  onClose: () => void;

  /* props for the “types” editor */
  selectedParent: ParentType;
  setSelectedParent: React.Dispatch<React.SetStateAction<ParentType>>;
  selectedChild: string;
  setSelectedChild: React.Dispatch<React.SetStateAction<string>>;
  handleUpdateTypes: () => Promise<void>;
}

const ProductEditMenu: React.FC<Props> = ({
  /* meta */
  title,
  handle,
  tags,
  createdAt,
  updatedAt,
  variantsCount,

  /* plumbing */
  menuOpen,
  onClose,

  /* type‑editor */
  selectedParent,
  setSelectedParent,
  selectedChild,
  setSelectedChild,
  handleUpdateTypes,
}) => {
  const [view, setView] = useState<View>('main');
  if (!menuOpen) return null;

  const common = {
    onBack: () => setView('main' as View),
    onClose,
  };

  const menuButtonStyling =
    'block w-full text-left px-3 py-2 hover:bg-gray-100 rounded';

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
        </div>
      )}

      {view === 'info' && (
        <ProductInfoView
          {...common}
          title={title}
          handle={handle}
          tags={tags}
          createdAt={createdAt}
          updatedAt={updatedAt}
          variantsCount={variantsCount}
          id={''} /* not needed here but satisfies ProductMeta */
        />
      )}

      {view === 'types' && (
        <ProductTypeEditor
          {...common}
          selectedParent={selectedParent}
          setSelectedParent={setSelectedParent}
          selectedChild={selectedChild}
          setSelectedChild={setSelectedChild}
          handleUpdateTypes={handleUpdateTypes}
        />
      )}

      {view === 'duplicate' && <SuspectedDuplicate {...common} />}
    </div>
  );
};

export default ProductEditMenu;
