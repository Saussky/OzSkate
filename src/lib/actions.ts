'use server';
import { prisma } from "@/lib/prisma";
import { fetchShopifyProducts, processShop } from "./helpers";
import { buildOrderByClause, buildWhereClause } from "./product/filter/buildClause";
import { FilterOption } from "./types";
import { skateboardShops } from "./constants";
import { auth, validateRequest } from "./lucia";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import { checkProductSimilarity } from "./product/merge";
import { transformProducts } from "./product/transform";

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
    
    await markProductsOnSale();
    console.log("Product import completed.");
  } catch (error) {
    console.error("Error fetching all products:", error);
  }
}

export const updateProducts = async () => {
  const shops = await prisma.shop.findMany();

  for (const shop of shops) {
    const baseUrl = `${shop.url}/products.json`;
    const sinceId = shop.since_id || "0";

    // 1) Fetch all products from the external store
    const allProducts = await fetchShopifyProducts(baseUrl, { since_id: sinceId });

    if (allProducts.length === 0) {
      console.log(`No new products found for shop: ${shop.name}`);
      continue;
    }

    // 2) Transform Shopify raw data into your local structure
    const transformedProducts = transformProducts(allProducts, shop.id);

    // Build a quick lookup for new product data by ID
    const newProductsMap = new Map<string, typeof transformedProducts[number]>();
    for (const p of transformedProducts) {
      newProductsMap.set(p.id, p);
    }

    // 3) Get existing products/variants from your DB for this shop
    const localProducts = await prisma.product.findMany({
      where: { shopId: shop.id },
      include: { variants: true },
    });

    // 4) Compare each local product/variant with the new data
    for (const localProduct of localProducts) {
      const newProduct = newProductsMap.get(localProduct.id);
      if (!newProduct) {
        // If your data model says that a product missing in the new feed
        // might be discontinued or removed, handle it here.
        // For now, just continue.
        continue;
      }

      // Check if cheapestPrice changed (you can add other fields too)
      const productUpdates: Record<string, any> = {};
      if (localProduct.cheapestPrice !== newProduct.cheapestPrice) {
        productUpdates.cheapestPrice = newProduct.cheapestPrice;
      }

      // If you want to compare other fields, do so here:
      // if (localProduct.title !== newProduct.title) productUpdates.title = newProduct.title;
      // ... etc.

      // Update product only if there are changes
      if (Object.keys(productUpdates).length > 0) {
        await prisma.product.update({
          where: { id: localProduct.id },
          data: productUpdates,
        });
      }

      // Now compare variants
      const newVariantMap = new Map<string, typeof newProduct.variants[number]>();
      (newProduct.variants ?? []).forEach((variant) => {
        newVariantMap.set(variant.id, variant);
      });

      for (const localVariant of localProduct.variants) {
        const newVariant = newVariantMap.get(localVariant.id);
        if (!newVariant) {
          // Possibly a variant no longer present in the feed; handle as you wish.
          continue;
        }

        const variantUpdates: Record<string, any> = {};
        // Compare the price fields, availability, etc.
        if (localVariant.price !== newVariant.price) {
          variantUpdates.price = newVariant.price;
        }
        if (localVariant.compareAtPrice !== newVariant.compareAtPrice) {
          variantUpdates.compareAtPrice = newVariant.compareAtPrice;
        }
        // if (localVariant.available !== newVariant.available) {
        //   variantUpdates.available = newVariant.available;
        // }

        if (Object.keys(variantUpdates).length > 0) {
          await prisma.variant.update({
            where: { id: localVariant.id },
            data: variantUpdates,
          });
        }
      }
    }
    console.log(`Finished updating products for shop: ${shop.name}`);
  }
  console.log("All shops processed in updateProducts.");
};


export const markProductsOnSale = async () => {
  const products = await prisma.product.findMany({
    include: {
      variants: true,
    },
  });

  // TODO: What if multiple variants are on sale??
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
    const { user } = await validateRequest();
    if (!user?.admin) return;

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

async function getAllProducts() {  
  const allProducts = await prisma.product.findMany({
    include: {
      variants: true,
      shop: true,
    },
  });
  
  return allProducts;
}


function groupProductsByChildType(products: any[]): Record<string, any[]> {
  const productsByChildType: Record<string, any[]> = {};

  for (const product of products) {
    const childType = product.childType || "Uncategorised";
    if (!productsByChildType[childType]) {
      productsByChildType[childType] = [];
    }
    productsByChildType[childType].push(product);
  }

  console.log("Grouped products by childType.");
  return productsByChildType;
}


function findDuplicatesWithinChildType(products: any[]): {
  product1: any;
  product2: any;
  reasons: string[];
}[] {
  const results: { product1: any; product2: any; reasons: string[] }[] = [];

  for (let i = 0; i < products.length; i++) {
    for (let j = i + 1; j < products.length; j++) {
      const product1 = products[i];
      const product2 = products[j];

      // Only compare products from different stores
      if (product1.id === product2.id) continue;
      if (product1.shopId === product2.shopId) continue;

      const similarityResult = checkProductSimilarity(product1, product2);

      if (similarityResult.isSimilar) {
        results.push({
          product1,
          product2,
          reasons: similarityResult.reasons,
        });
      }
    }
  }

  return results;
}

//TODO: Investigate further
async function markProductsAsSuspectedDuplicates(p1: any, p2: any) {
  try {
    await prisma.$transaction([
      prisma.product.update({
        where: { id: p1.id },
        data: {
          suspectedDuplicateOf: {
            connect: { id: p2.id },
          },
        },
      }),
    ]);
    console.log(`DB updated: ${p1.title} and ${p2.title} marked as duplicates.`);
  } catch (err) {
    console.error("Error updating products as duplicates:", err);
  }
}

export async function checkAllProductsForDuplicates() {
  const allProducts = await getAllProducts();
  const cleanProducts = allProducts.filter(product => !product.approvedDuplicate)
  const productsByChildType = groupProductsByChildType(cleanProducts);

  // Check duplicates within each childType
  for (const [childType, products] of Object.entries(productsByChildType)) {
    console.log(`Checking products under childType: ${childType}`);

    const results = findDuplicatesWithinChildType(products);

    if (results.length > 0) {
      console.log(
        `Found ${results.length} potential duplicates in childType: ${childType}`
      );

      for (const { product1, product2, reasons } of results) {
        console.log(
          `- Duplicate Pair: "${product1.title}" (Store: ${product1.shop.name}) <-> "${product2.title}" (Store: ${product2.shop.name})`
        );
        console.log(`  Reasons: ${reasons.join(", ")}`);

        await markProductsAsSuspectedDuplicates(product1, product2);
      }
    } else {
      console.log(`No duplicates found in childType: ${childType}`);
    }
  }

  console.log("Duplicate check completed.");
}
