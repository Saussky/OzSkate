import { getProductCount, getShopCount } from "@/lib/actions";
import FetchProductsButton from "./fetchProductsButton";
import DeleteAllProductsButton from "./deleteAllProductsButton";

export default async function HomeComponent() {
  const productCount = await getProductCount();
  const shopCount = await getShopCount();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-center text-4xl font-bold text-gray-800 my-12">
        Welcome to OzSkate
      </h1>
      <div className="flex justify-center space-x-8 mb-12">
        <div className="flex-1 max-w-sm p-6 bg-white rounded-lg shadow-lg">
          <p className="text-lg font-semibold text-gray-700">Number of Shops</p>
          <p className="text-3xl font-bold text-blue-500">{shopCount}</p>
        </div>
        <div className="flex-1 max-w-sm p-6 bg-white rounded-lg shadow-lg">
          <p className="text-lg font-semibold text-gray-700">
            Number of Products
          </p>
          <p className="text-3xl font-bold text-blue-500">{productCount}</p>
        </div>
      </div>
      <div className="flex justify-center space-x-4">
        <FetchProductsButton />
        <DeleteAllProductsButton />
      </div>
    </div>
  );
}
