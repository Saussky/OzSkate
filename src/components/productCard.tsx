"use client";

import Image from "next/image";

interface SkateShop {
  name: string;
  state: string;
  url: string
}

interface ProductCardProps {
  id: string;
  title: string;
  price: string;
  imageSrc?: string;
  handle: string;
  skateShop: SkateShop;
}

export default function ProductCard({
  id,
  title,
  price,
  imageSrc,
  handle,
  skateShop,
}: ProductCardProps) {
  const fallbackImageSrc = "/placeholder-image.png";
  const productUrl = 'hi' // skateShop.url.replace(/\.json$/, `/${handle}`);
  return (
        <a
      href={productUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
    <div className="border rounded-lg shadow-md p-4" key={id}>
      {/* <p>{skateShop.name}</p> */}
      <Image
        src={imageSrc || fallbackImageSrc}
        alt={title}
        width={300}
        height={300}
        className="rounded"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "/placeholder-image.png";
        }}
      />
      <h2 className="mt-2 text-xl font-bold text-gray-800">{title}</h2>
      <p className="text-gray-600 mt-1">${price}</p>
    </div>
    </a>
  );
}
