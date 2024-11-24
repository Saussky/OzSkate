"use client";
import Image from "next/image";
import { useState } from "react";

interface SkateShop {
  name: string;
  state: string;
}
interface ProductCardProps {
  id: string;
  title: string;
  price: string;
  imageSrc: string;
  skateShop: SkateShop;
}

export default function ProductCard({
  id,
  title,
  price,
  imageSrc,
  skateShop,
}: ProductCardProps) {
  const [isImageValid, setIsImageValid] = useState(true);

  const isValidURL = (url: string) => {
    console.log("url", url);
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleImageError = () => {
    setIsImageValid(false); // Mark the image as invalid
  };

  return (
    <div className="border rounded-lg shadow-md p-4" key={id}>
      <p>{skateShop.name}</p>
      {isImageValid && isValidURL(imageSrc) ? (
        <Image
          src={imageSrc}
          alt={title}
          width={300}
          height={300}
          className="rounded"
          onError={handleImageError} // Handle image loading errors
        />
      ) : (
        <div className="bg-gray-200 w-[300px] h-[300px] flex items-center justify-center rounded">
          <p className="text-gray-500">Image not available</p>
        </div>
      )}
      <h2 className="mt-2 text-xl font-bold text-gray-800">{title}</h2>
      <p className="text-gray-600 mt-1">${price}</p>
    </div>
  );
}
