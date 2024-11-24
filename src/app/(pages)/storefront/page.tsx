// pages/storefront/page.tsx
import StoreFront from "@/components/storeFront";

export default async function StorefrontPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Storefront</h1>
      <StoreFront />
    </div>
  );
}
