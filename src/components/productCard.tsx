/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { ParentType } from '@/lib/types';
import Image from 'next/image';
import { useState } from 'react';
import { childTypePerParent } from './filterOptions';
import { setProductTypes } from '@/lib/actions';
import ProductEditMenu from './admin/productEditMenu';
import { shop } from '@prisma/client';

interface ProductCardProps {
  id: string;
  title: string;
  price: string;
  imageSrc?: string;
  handle: string;
  shop: shop;
  parentType?: string | null; // ParentType | null;
  childType?: string | null;
}

// TODO: Implement string parent product type types
export default function ProductCard({
  id,
  title,
  price,
  imageSrc,
  handle,
  shop,
  parentType,
  childType,
}: ProductCardProps) {
  const fallbackImageSrc = '/placeholder.jpg';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const productUrl = handle; // TODO: Replace with the correct logic for generating product URLs.
  console.log('product url', productUrl);

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<ParentType>(
    (parentType as ParentType) ?? 'Clothing'
  );
  const [selectedChild, setSelectedChild] = useState<string>(() => {
    const childOptions = childTypePerParent[selectedParent];
    return childType ?? childOptions[0];
  });

  function handleMenuToggle(e: React.MouseEvent) {
    e.preventDefault();
    setMenuOpen((prev) => !prev);
  }

  async function handleUpdateTypes() {
    await setProductTypes(id, selectedParent, selectedChild);
    setMenuOpen(false);
  }

  return (
    <div className="border rounded-lg shadow-md p-4 h-full">
      <p>{shop.name}</p>
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
