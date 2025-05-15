// 'use client';
// import { ParentType } from '@/lib/types';
// import Image from 'next/image';
// import { useState } from 'react';
// import { shop } from '@prisma/client';
// import { childTypePerParent } from '../../storefront/filter';
// import ProductEditMenu from '../../storefront/productEditMenu';
// import { setProductTypes } from './actions';

// interface ProductCardProps {
//   id: string;
//   title: string;
//   admin: boolean;
//   price: string;
//   imageSrc?: string;
//   handle: string;
//   shop: shop;
//   parentType?: string | null;
//   childType?: string | null;
//   allStorePrices?: {
//     shopId: number;
//     shopName: string;
//     state: string;
//     cheapestPrice: number | null;
//   }[];
// }

// export default function MobileProductCard({
//   id,
//   title,
//   admin,
//   price,
//   imageSrc,
//   handle,
//   shop,
//   parentType,
//   childType,
//   allStorePrices,
// }: ProductCardProps) {
//   const fallbackImageSrc = '/placeholder.jpg';
//   const productUrl = shop.url + '/products/' + handle;

//   const [menuOpen, setMenuOpen] = useState(false);
//   const [selectedParent, setSelectedParent] = useState<ParentType>(
//     (parentType as ParentType) ?? 'Clothing'
//   );
//   const [selectedChild, setSelectedChild] = useState<string>(() => {
//     const childOptions = childTypePerParent[selectedParent];
//     return childType ?? childOptions[0];
//   });

//   // New state to toggle truncated vs. expanded text
//   const [expanded, setExpanded] = useState(false);

//   function handleMenuToggle(e: React.MouseEvent) {
//     e.preventDefault();
//     setMenuOpen((prev) => !prev);
//   }

//   async function handleUpdateTypes() {
//     await setProductTypes(id, selectedParent, selectedChild);
//     setMenuOpen(false);
//   }

//   return (
//     <a href={productUrl} target="_blank" rel="noopener noreferrer">
//       <div className="border rounded-lg shadow-md p-4 w-full bg-white relative group">
//         <p>{shop.name}</p>

//         {allStorePrices && allStorePrices.length > 1 && (
//           <div className="absolute top-2 right-2 z-20">
//             <div className="relative group">
//               <div className="flex items-center space-x-1 cursor-pointer">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-5 w-5"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M3 9l9-7 9 7v11a2 2 0 01-2 2h-4a2 2 0 01-2-2V12H9v8a2 2 0 01-2 2H3a2 2 0 01-2-2V9z"
//                   />
//                 </svg>
//                 <span className="text-sm font-semibold">
//                   x{allStorePrices.length}
//                 </span>
//               </div>
//               <div className="absolute right-0 mt-1 hidden group-hover:block bg-white border border-gray-300 rounded shadow-md p-2 flex-col gap-1 max-h-32 overflow-y-auto">
//                 {allStorePrices.map((store) => (
//                   <div key={store.shopId} className="text-xs">
//                     <div className="font-medium">{store.shopName}</div>
//                     <div className="text-gray-500">
//                       {store.state} - ${store.cheapestPrice ?? 'N/A'}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="relative w-full h-64 bg-white">
//           <Image
//             src={imageSrc || fallbackImageSrc}
//             alt={title}
//             fill
//             className="object-cover rounded"
//           />
//         </div>

//         <h2
//           className={`
//             mt-2 text-lg font-bold text-gray-800 cursor-pointer
//             ${expanded ? '' : 'line-clamp-3'}
//             overflow-hidden
//           `}
//           onClick={(e) => {
//             // Prevent card navigation so we can handle text toggle
//             e.preventDefault();
//             setExpanded((prev) => !prev);
//           }}
//         >
//           {title}
//         </h2>

//         <div className="flex justify-between items-center">
//           <p className="text-gray-600 mt-1">${price}</p>
//           <div className="relative inline-block mt-2">
//             <button
//               onClick={handleMenuToggle}
//               className="border border-gray-300 px-2 py-1 rounded"
//             >
//               :
//             </button>

//             {admin && (
//               <ProductEditMenu
//                 menuOpen={menuOpen}
//                 selectedParent={selectedParent}
//                 setSelectedParent={setSelectedParent}
//                 selectedChild={selectedChild}
//                 setSelectedChild={setSelectedChild}
//                 handleUpdateTypes={handleUpdateTypes}
//               />
//             )}
//           </div>
//         </div>
//       </div>
//     </a>
//   );
// }
