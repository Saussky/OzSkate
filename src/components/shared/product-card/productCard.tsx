'use client';
import { ChildType, ParentType } from '@/lib/types';
import Image, { ImageLoader } from 'next/image';
import { useState } from 'react';
import { childTypePerParent } from '../../storefront/filter';
import { setProductTypes } from './actions';
import ProductEditMenu from './product-menu/menu';
import { ExtendedProduct } from '@/components/storefront/storefront';
import Link from 'next/link';

interface ProductCardProps {
  product: ExtendedProduct;
  admin: boolean;
}

const cdnLoader: ImageLoader = ({ src, width, quality }) =>
  `${src}?w=${width}&q=${quality ?? 70}`;

// TODO: Implement string parent product type types
export default function ProductCard({ admin, product }: ProductCardProps) {
  const {
    id,
    title,
    handle,
    shop,
    image,
    cheapestPrice,
    parentType,
    childType,
    tags,
    createdAt,
    updatedAt,
    variants,
    allStorePrices,
  } = product;

  const normalisedTags: string[] = Array.isArray(tags)
    ? tags
    : typeof tags === 'string' && tags.length > 0
    ? tags.split(',').map((t) => t.trim())
    : [];
  const displaySrc: string = image?.src ?? '/noimg.png';
  const productUrl = shop.url + '/products/' + handle;

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
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  }

  async function handleUpdateTypes() {
    await setProductTypes(id, selectedParent, selectedChild as ChildType);
    setMenuOpen(false);
  }

  return (
    <div
      className="border rounded-lg shadow-md p-4 h-full w-full bg-white relative group"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '700px' }}
    >
      <p>{shop.name}</p>

      {allStorePrices && allStorePrices.length > 1 && (
        <div className="absolute top-2 right-2 z-20">
          <div className="relative group">
            <div className="flex items-center space-x-1 cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9l9-7 9 7v11a2 2 0 01-2 2h-4a2 2 0 01-2-2V12H9v8a2 2 0 01-2 2H3a2 2 0 01-2-2V9z"
                />
              </svg>
              <span className="text-sm font-semibold">
                x{allStorePrices.length}
              </span>
            </div>
            <div className="absolute right-0 mt-1 hidden group-hover:block bg-white border border-gray-300 rounded shadow-md p-2 flex-col gap-1 max-h-32 overflow-y-auto">
              {allStorePrices.map((store) => (
                <div key={store.shopId} className="text-xs">
                  <div className="font-medium">{store.shopName}</div>
                  <div className="text-gray-500">
                    {store.state} - ${store.cheapestPrice ?? 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Link
        href={productUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative aspect-[1/1] bg-white cursor-pointer block"
      >
        <Image
          loader={cdnLoader}
          src={displaySrc}
          alt={title}
          fill
          objectFit="cover"
          className="rounded"
          sizes="(max-width:768px) 50vw, 200px"
        />
      </Link>

      <h2 className="mt-2 text-xl font-bold text-gray-800">{title}</h2>

      <div className="flex justify-between items-center">
        <p className="text-gray-600 mt-1">${cheapestPrice}</p>

        <div className="relative inline-block mt-2">
          {admin && (
            <>
              <button
                onClick={handleMenuToggle}
                className="border border-gray-300 px-2 py-1 rounded cursor-pointer"
              >
                :
              </button>

              <div className="product-edit-menu-container">
                <ProductEditMenu
                  menuOpen={menuOpen}
                  onClose={() => setMenuOpen(false)}
                  id={id}
                  title={title}
                  handle={handle}
                  parentType={parentType}
                  childType={childType}
                  tags={normalisedTags}
                  createdAt={createdAt}
                  updatedAt={updatedAt}
                  variantsCount={variants?.length || 0}
                  selectedParent={selectedParent}
                  setSelectedParent={setSelectedParent}
                  selectedChild={selectedChild}
                  setSelectedChild={setSelectedChild}
                  handleUpdateTypes={handleUpdateTypes}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
