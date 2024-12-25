"use client";

import { useState } from "react";
import Image from "next/image";

interface SkateShop {
  name: string;
  state: string;
  url: string;
}

interface ProductCardProps {
  id: string;
  title: string;
  price: string;
  imageSrc?: string;
  handle: string;
  skateShop: SkateShop;
}

//TODO: Use image height and width with aspect ratios
export default function ProductCard({
  id,
  title,
  price,
  imageSrc,
  handle,
  skateShop,
}: ProductCardProps) {
  const fallbackImageSrc = "/placeholder.jpg";
  const productUrl = "hi"; // TODO: Replace with the correct logic for generating product URLs.

  return (
    <a
      href={productUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <div className="border rounded-lg shadow-md p-4 h-full" key={id}>
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
        <p className="text-gray-600 mt-1">${price}</p>
      </div>
    </a>
  );
}
