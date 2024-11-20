import { getProductCount, getShopCount } from "@/lib/actions";
import FetchProductsButton from "./fetchProductsButton";

export default async function HomeComponent() {
  const productCount = await getProductCount();
  const shopCount = await getShopCount();

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Welcome to OzSkate</h1>
      <p>Number of Shops: {shopCount}</p>
      <p>Number of Products: {productCount}</p>
      <FetchProductsButton />
    </div>
  );
}
