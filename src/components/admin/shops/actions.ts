"use server";
import { prisma } from "@/lib/prisma";
import { skateboardShops } from "../../../lib/constants";


export type ShopStats = {
  name: string;
  total: number;
  onSale: number;
  parentTypeCounts: Record<string, number>;
  addedWeek: number;
  addedMonth: number;
  addedYear: number;
};

export async function getShopStats(): Promise<ShopStats[]> {
  try {
    const now = new Date();
    const weekAgo  = new Date(now); weekAgo.setDate(now.getDate() - 7);
    const monthAgo = new Date(now); monthAgo.setMonth(now.getMonth() - 1);
    const yearAgo  = new Date(now); yearAgo.setFullYear(now.getFullYear() - 1);

    const shops = await prisma.shop.findMany({
      include: {
        products: {
          select: { parentType: true, onSale: true, createdAt: true }
        }
      }
    });

    return shops.map(({ name, products }) => {
      const total     = products.length;
      const onSale    = products.filter(p => p.onSale).length;
      const addedWeek = products.filter(p => p.createdAt >= weekAgo).length;
      const addedMonth= products.filter(p => p.createdAt >= monthAgo).length;
      const addedYear = products.filter(p => p.createdAt >= yearAgo).length;

      const parentTypeCounts = products.reduce<Record<string, number>>(
        (acc, { parentType }) => {
          const k = parentType ?? 'Uncategorised';
          acc[k] = (acc[k] ?? 0) + 1;
          return acc;
        },
        {}
      );

      return { name, total, onSale, parentTypeCounts, addedWeek, addedMonth, addedYear };
    });
  } catch (err) {
    console.error('Error fetching shop stats:', err);
    return [];
  }
}

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