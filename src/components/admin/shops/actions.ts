"use server";
import { prisma } from "@/lib/prisma";
import { skateboardShops } from "../../../lib/constants";

export async function deleteShops() {
  try {
    await prisma.variant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.shop.deleteMany();

    console.log("All shops have been deleted.");
  } catch (error) {
    console.error("Error deleting all shops", error);
  }
}

export async function toggleShop(name: string): Promise<{ inDatabase: boolean }> {
  const existing = await prisma.shop.findUnique({
    where: { name },
  });

  if (existing) {
    await prisma.shop.delete({ where: { name } });
    return { inDatabase: false };
  }

  const shopData = skateboardShops.find((s) => s.name === name);
  if (!shopData) {
    throw new Error(`Cannot find ${name} in skateboardShops constant`);
  }

  await prisma.shop.create({
    data: shopData,
  });

  return { inDatabase: true };
}