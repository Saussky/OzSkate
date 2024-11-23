"use client";
import Image from "next/image";

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
  return (
    <div className="border rounded-lg shadow-md p-4" key={id}>
      <p>{skateShop.name}</p>
      {/* <Image
        src={imageSrc}
        alt={title}
        width={300}
        height={300}
        className="rounded"
      /> */}
      <h2 className="mt-2 text-xl font-bold text-gray-800">{title}</h2>
      <p className="text-gray-600 mt-1">${price}</p>
    </div>
  );
}
