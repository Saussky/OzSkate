import ProductCard from "./productCard";

interface ProductGridProps {
  products: any[]; // TODO: Replace `any` with a specific type
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ProductGrid({
  products,
}: ProductGridProps) {
  return (

  );
}
