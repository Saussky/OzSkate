'use server';
import { prisma } from "@/lib/prisma";
import { processShop } from "./helpers";
import { buildOrderByClause, buildWhereClause } from "./product/filter/buildClause";
import { FilterOption } from "./types";
import { skateboardShops } from "./constants";
import { auth, validateRequest } from "./lucia";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";

export async function getProductCount() {
  try {
    const count = await prisma.product.count();
    return count;
  } catch (error) {
    console.error("Error getting product count:", error);
    return 0;
  }
}

export async function getShopCount() {
  try {
    const count = await prisma.shop.count();
    return count;
  } catch (error) {
    console.error("Error getting shop count:", error);
    return 0;
  }
}

export async function deleteAllProducts() {
  try {
    // TODO: Cascading deletes would be better
    await prisma.variant.deleteMany();
    await prisma.option.deleteMany();
    await prisma.product.deleteMany();

    console.log("All products, variants, and options have been deleted.");
  } catch (error) {
    console.error("Error deleting all products:", error);
  }
}

export async function deleteShops() {
  try {
    await prisma.variant.deleteMany();
    await prisma.option.deleteMany();
    await prisma.product.deleteMany();
    await prisma.shop.deleteMany();

    console.log("All shops have been deleted.");
  } catch (error) {
    console.error("Error deleting all shops", error);
  }
}

export async function refreshCounts() {
  const productCount = await getProductCount();
  const shopCount = await getShopCount();
  return { shopCount, productCount };
}

export async function fetchAllProducts() {
  try {
    console.log("Starting product import...");

    const shops = await prisma.shop.findMany();

    // for (const shop of shops) {
    //   try {
    //     console.log(`Processing shop: ${shop.name} ${index}/${shops.length}`);
    //     await processShop(shop);
    //   } catch (error) {
    //     console.error(`Error processing shop ${shop.name}:`, error);
    //   }
    // }

    for (let index = 0; index < shops.length; index++) {
      const shop = shops[index];
      try {
        console.log(`Processing shop: ${shop.name} ${index + 1}/${shops.length}`);
        await processShop(shop);
      } catch (error) {
        console.error(`Error processing shop ${shop.name}:`, error);
      }
    }
    
    await updateProducts();
    console.log("Product import completed.");
  } catch (error) {
    console.error("Error fetching all products:", error);
  }
}


export const updateProducts = async () => {
  const products = await prisma.product.findMany({
    include: {
      variants: true,
    },
  });

  for (const product of products) {
    const onSaleVariant = product.variants.find(
      (variant) => variant.compareAtPrice !== null
    );

    const onSale = !!onSaleVariant;
    const onSaleVariantId = onSaleVariant ? onSaleVariant.id : null;

    await prisma.product.update({
      where: { id: product.id },
      data: {
        onSale,
        on_sale_variant_id: onSaleVariantId,
      },
    });
  }
};

export const getShopNames = async () => {
  try {
    const shops = await prisma.shop.findMany({
      select: { name: true },
    });

    return shops.map((shop) => shop.name);
  } catch (error) {
    console.error('Error fetching shop names:', error);
    return [];
  }
};

export const getPaginatedProducts = async (
  page: number,
  limit: number,
  filters: Record<string, string | number | boolean | null> = {},
  sortOptions?: string
) => {
  const offset = (page - 1) * limit;
  const whereClause = await buildWhereClause(filters);
  const orderBy = await buildOrderByClause(sortOptions);

  const [products, totalProducts] = await prisma.$transaction([
    prisma.product.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
      orderBy,
      include: {
        shop: true,
        variants: true,
      },
    }),

    prisma.product.count({
      where: whereClause,
    }),
  ]);

  return {
    products,
    totalProducts,
    currentPage: page,
    totalPages: Math.ceil(totalProducts / limit),
  };
};

export const getFilteredVendors = async (
  filters: FilterOption = {}
) => {
  try {
    const whereClause = await buildWhereClause(filters);

    const vendors = await prisma.product.findMany({
      where: whereClause,
      select: {
        vendor: true,
      },
      distinct: ['vendor'],
    });

    return vendors.map((variant) => variant.vendor).filter((vendor) => vendor); 
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return [];
  }
};

// TODO: There needs to be a way to make sure the product type doesn't get updated when the application performs product updates
export async function setProductTypes(
  productId: string,
  parentType: string, // TODO: Use real types
  childType: string
) {
  try {
    return await prisma.product.update({
      where: { id: productId },
      data: {
        parentType,
        childType,
      },
    });
  } catch (error) {
    console.error("Error updating product types:", error);
    throw error;
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

export async function signOut(): Promise<void> {
  try {
    const { session } = await validateRequest();

    if (session) {
      await auth.invalidateSession(session.id)
    }
  } catch (error) {
    console.error('Error signing out', error);
    throw error
  } finally {
    const sessionCookie = auth.createBlankSessionCookie();
    (await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    
    revalidatePath('/')
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const { user } = await validateRequest();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || !(await bcrypt.compare(currentPassword, dbUser.hashed_password))) {
    throw new Error('Invalid current password');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { hashed_password: hashedPassword },
  });
}