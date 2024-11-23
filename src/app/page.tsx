"use server";

import { getProductCount, getShopCount } from "@/lib/servivce";
import HomeComponent from "@/modules/home";
import "./globals.css";

export default async function Home() {
  const productCount = await getProductCount();
  const shopCount = await getShopCount();

  return (
    <div>
      <small>Long live the thing</small>
      <HomeComponent shopCount={shopCount} productCount={productCount} />
    </div>
  );
}
