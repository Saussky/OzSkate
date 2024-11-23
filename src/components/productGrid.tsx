// components/ProductGrid.tsx
import ProductCard from "./ui/productCard";

interface ProductGridProps {
  products: any[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ProductGrid({
  products,
  currentPage,
  totalPages,
  onPageChange,
}: ProductGridProps) {
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            title={product.title}
            price={product.variants?.[0]?.price || "N/A"}
            imageSrc={product.images?.[0] || "/placeholder.png"}
          />
        ))}
      </div>
      <div className="flex justify-between mt-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Previous
        </button>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}