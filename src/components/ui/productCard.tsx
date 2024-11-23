"use client";
import Image from "next/image";

interface ProductCardProps {
  id: string;
  title: string;
  price: string;
  imageSrc: string;
}

export default function ProductCard({
  id,
  title,
  price,
  imageSrc,
}: ProductCardProps) {
  return (
    <div className="border rounded-lg shadow-md p-4" key={id}>
      <Image
        src={imageSrc}
        alt={title}
        width={300}
        height={300}
        className="rounded"
      />
      <h2 className="mt-2 text-xl font-bold text-gray-800">{title}</h2>
      <p className="text-gray-600 mt-1">${price}</p>
    </div>
  );
}
