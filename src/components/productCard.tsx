/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { ParentProductType } from '@/lib/types';
import Image from 'next/image';
import { useState } from 'react';
import { childProductTypePerParent } from './filterOptions';
import { setProductTypes } from '@/lib/actions';
import ProductEditMenu from './admin/productEditMenu';
import { shop } from '@prisma/client';

interface ProductCardProps {
  id: string;
  title: string;
  price: string;
  imageSrc?: string;
  handle: string;
  skateShop: shop; // SkateShop;
  parentProductType?: string | null; // ParentProductType | null;
  childProductType?: string | null;
}

export default function ProductCard({
  id,
  title,
  price,
  imageSrc,
  handle,
  skateShop,
  parentProductType,
  childProductType,
}: ProductCardProps) {
  const fallbackImageSrc = '/placeholder.jpg';
  // TODO: Replace with the correct logic for generating product URLs.
  const productUrl = 'hi';

  // Menu open/close state
  const [menuOpen, setMenuOpen] = useState(false);

  // Local states for parent/child types
  const [selectedParent, setSelectedParent] = useState<ParentProductType>(
    parentProductType ?? 'Clothing'
  );
  const [selectedChild, setSelectedChild] = useState<string>(() => {
    const childOptions = childProductTypePerParent[selectedParent];
    return childProductType ?? childOptions[0];
  });

  function handleMenuToggle(e: React.MouseEvent) {
    e.preventDefault();
    setMenuOpen((prev) => !prev);
  }

  async function handleUpdateTypes() {
    // Update DB via a server action
    await setProductTypes(id, selectedParent, selectedChild);
    setMenuOpen(false);
  }

  return (
    <div className="border rounded-lg shadow-md p-4 h-full">
      <p>{skateShop.name}</p>
      <div className="relative aspect-[1/1]">
        <Image
          src={imageSrc || fallbackImageSrc}
          alt={title}
          layout="fill"
          objectFit="cover"
          className="rounded"
        />
      </div>

      <h2 className="mt-2 text-xl font-bold text-gray-800">{title}</h2>
      <div className="flex justify-between items-center">
        <p className="text-gray-600 mt-1">${price}</p>

        <div className="relative inline-block mt-2">
          <button
            onClick={handleMenuToggle}
            className="border border-gray-300 px-2 py-1 rounded"
          >
            :
          </button>

          <ProductEditMenu
            menuOpen={menuOpen}
            selectedParent={selectedParent}
            setSelectedParent={setSelectedParent}
            selectedChild={selectedChild}
            setSelectedChild={setSelectedChild}
            handleUpdateTypes={handleUpdateTypes}
          />
        </div>
      </div>
    </div>
  );
}
