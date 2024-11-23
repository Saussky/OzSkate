// pages/storefront/page.tsx
import StoreFront from "@/components/storeFront";
import { fetchProducts } from "@/lib/service";

export default async function StorefrontPage() {
  const initialData = await fetchProducts(1); // Fetch initial data for SSR
  console.log("initial data", initialData);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Storefront</h1>
      <StoreFront initialData={initialData} />
    </div>
  );
}
