"use server";
import { getProductCount, getShopCount } from "@/lib/service";
import AdminComponent from "@/components/admin";
import "./globals.css";

export default async function Home() {
  const productCount = await getProductCount();
  const shopCount = await getShopCount();

  return (
    <div>
      <small>Long live this thing</small>
      <AdminComponent shopCount={shopCount} productCount={productCount} />
    </div>
  );
}
