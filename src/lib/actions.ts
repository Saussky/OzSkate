"use server";
import { prisma } from "@/lib/prisma";
import { buildWhereClause, processShop } from "./helpers";
import { getProductCount, getShopCount } from "./service";

export async function fetchAllProducts() {
  try {
    console.log("Starting product import...");

    const shops = await prisma.skateShop.findMany();

    for (const shop of shops) {
      try {
        await processShop(shop);
      } catch (error) {
        console.error(`Error processing shop ${shop.name}:`, error);
      }
    }

    await updateProducts();

    console.log("Product import completed.");
  } catch (error) {
    console.error("Error fetching all products:", error);
  } finally {
    await prisma.$disconnect();
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
  } finally {
    await prisma.$disconnect();
  }
}

export const fetchPaginatedProducts = async (
  page: number,
  limit: number = 40,
  filters: Record<string, string | number | boolean | undefined> = {},
  sortOptions?: string
) => {
  const offset = (page - 1) * limit;

  // Convert filters into SQL conditions
  // This is a simplified example. You would need to adjust this to match 
  // how `buildWhereClause` works and properly escape variables.
  const whereClauses: string[] = [];
  const params: any[] = [];

  const whereClauseObj = buildWhereClause(filters);
  console.log('where clause obje', whereClauseObj)
  // Example logic: For each key in whereClauseObj, add a condition.
  // A robust solution would handle different operator types. 
  // Here we assume simple equality and numeric comparisons.
  if (whereClauseObj.parentProductType) {
    whereClauses.push(`p.parentProductType = ?`);
    params.push(whereClauseObj.parentProductType);
    console.log('params', params)
  }
  
  if (whereClauseObj.childProductType) {
    whereClauses.push(`p.childProductType = ?`);
    params.push(whereClauseObj.childProductType);
  }

  // Handle variant filters (like shoeSize, deckSize, maxPrice)
  // If variant conditions exist, we need to join or filter variants.
  // For example, if maxPrice is provided:
  // Note: We'll do a LEFT JOIN on variants and filter in the WHERE clause. 
  // For multiple variant conditions combined with AND logic, we might need more complex queries.
  // As an example, if maxPrice is provided:
  if (whereClauseObj.variants?.some) {
    // Extract conditions from variantConditions
    const variantConditions: string[] = [];
    (whereClauseObj.variants.some.AND || []).forEach((condition: any) => {
      if (condition.price?.lte !== undefined) {
        variantConditions.push(`v.price <= ?`);
        params.push(condition.price.lte);
      }
      if (condition.shoeSize !== undefined) {
        variantConditions.push(`v.shoeSize = ?`);
        params.push(condition.shoeSize);
      }
      if (condition.deckSize !== undefined) {
        variantConditions.push(`v.deckSize = ?`);
        params.push(condition.deckSize);
      }
    });

    if (variantConditions.length > 0) {
      whereClauses.push(`(${variantConditions.join(' AND ')})`);
    }
  }

  if (whereClauseObj.onSale !== undefined) {
    whereClauses.push(`p.onSale = ?`);
    params.push(whereClauseObj.onSale ? 1 : 0);
  }

  const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

  // Determine ordering
  let orderSQL = 'ORDER BY p.createdAt DESC';
  if (sortOptions === 'price-asc') {
    orderSQL = 'ORDER BY cheapestPrice ASC';
  } else if (sortOptions === 'price-desc') {
    orderSQL = 'ORDER BY cheapestPrice DESC';
  }

  // We must join with variants to find the MIN price.
  // Also join SkateShop to select its fields.
  // Group by product id to compute cheapestPrice.
  const query = `
    SELECT 
      p.id,
      p.shopId,
      p.title,
      p.handle,
      p.description,
      p.vendor,
      p.productType,
      p.parentProductType,
      p.childProductType,
      p.tags,
      p.image,
      p.createdAt,
      p.updatedAt,
      p.publishedAt,
      p.onSale,
      p.on_sale_variant_id,
      s.name as skateShopName,
      s.state as skateShopState,
      s.url as skateShopUrl,
      MIN(v.price) as cheapestPrice
    FROM Product p
    JOIN SkateShop s ON p.shopId = s.id
    JOIN Variant v ON v.productId = p.id
    ${whereSQL}
    GROUP BY p.id
    ${orderSQL}
    LIMIT ? OFFSET ?
  `;

  // Count total products separately (without LIMIT/OFFSET):
  // We can reuse the where clause and join only Product to count
  const countQuery = `
    SELECT COUNT(DISTINCT p.id) as count
    FROM Product p
    JOIN Variant v ON v.productId = p.id
    ${whereSQL}
  `;

  try {
    const countResult: Array<{ count: number }> = await prisma.$queryRawUnsafe(countQuery, ...params);
    const totalProducts = Number(countResult[0]?.count ?? 0);

    const finalParams = [...params, limit, offset];
    const result = await prisma.$queryRawUnsafe<any[]>(query, ...finalParams);

    // Process products to match the original format
    const products = result.map((row) => ({
      id: row.id,
      shopId: row.shopId,
      title: row.title,
      handle: row.handle,
      description: row.description,
      vendor: row.vendor,
      productType: row.productType,
      parentProductType: row.parentProductType,
      childProductType: row.childProductType,
      tags: row.tags,
      image: row.image ? JSON.parse(row.image) : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      publishedAt: row.publishedAt,
      onSale: !!row.onSale,
      on_sale_variant_id: row.on_sale_variant_id,
      skateShop: {
        name: row.skateShopName,
        state: row.skateShopState,
        url: row.skateShopUrl,
      },
      cheapestPrice: row.cheapestPrice,
    }));

    return {
      products,
      totalProducts,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
    };
  } catch (error) {
    console.error("Error fetching paginated products:", error);
    return {
      products: [],
      totalProducts: 0,
      currentPage: page,
      totalPages: 0,
    };
  }
};


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

export async function refreshCounts() {
  const productCount = await getProductCount();
  const shopCount = await getShopCount();
  return { shopCount, productCount };
}


//TODO: IMplement this
/*
export const fetchPaginatedProducts = async (
  page: number,
  limit: number = 40,
  filters: Record<string, string | number | boolean | undefined> = {},
  sortOptions?: string
) => {
  const offset = (page - 1) * limit;

  // Convert filters into SQL conditions
  // This is a simplified example. You would need to adjust this to match 
  // how `buildWhereClause` works and properly escape variables.
  const whereClauses: string[] = [];
  const params: any[] = [];

  const whereClauseObj = buildWhereClause(filters);
  // Example logic: For each key in whereClauseObj, add a condition.
  // A robust solution would handle different operator types. 
  // Here we assume simple equality and numeric comparisons.
  if (whereClauseObj.parentProductType) {
    whereClauses.push(`p.parentProductType = ?`);
    params.push(whereClauseObj.parentProductType);
  }
  
  if (whereClauseObj.childProductType) {
    whereClauses.push(`p.childProductType = ?`);
    params.push(whereClauseObj.childProductType);
  }

  // Handle variant filters (like shoeSize, deckSize, maxPrice)
  // If variant conditions exist, we need to join or filter variants.
  // For example, if maxPrice is provided:
  // Note: We'll do a LEFT JOIN on variants and filter in the WHERE clause. 
  // For multiple variant conditions combined with AND logic, we might need more complex queries.
  // As an example, if maxPrice is provided:
  if (whereClauseObj.variants?.some) {
    // Extract conditions from variantConditions
    const variantConditions: string[] = [];
    (whereClauseObj.variants.some.AND || []).forEach((condition: any) => {
      if (condition.price?.lte !== undefined) {
        variantConditions.push(`v.price <= ?`);
        params.push(condition.price.lte);
      }
      if (condition.shoeSize !== undefined) {
        variantConditions.push(`v.shoeSize = ?`);
        params.push(condition.shoeSize);
      }
      if (condition.deckSize !== undefined) {
        variantConditions.push(`v.deckSize = ?`);
        params.push(condition.deckSize);
      }
    });

    if (variantConditions.length > 0) {
      whereClauses.push(`(${variantConditions.join(' AND ')})`);
    }
  }

  if (whereClauseObj.onSale !== undefined) {
    whereClauses.push(`p.onSale = ?`);
    params.push(whereClauseObj.onSale ? 1 : 0);
  }

  const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

  // Determine ordering
  let orderSQL = 'ORDER BY p.createdAt DESC';
  if (sortOptions === 'price-asc') {
    orderSQL = 'ORDER BY cheapestPrice ASC';
  } else if (sortOptions === 'price-desc') {
    orderSQL = 'ORDER BY cheapestPrice DESC';
  }

  // We must join with variants to find the MIN price.
  // Also join SkateShop to select its fields.
  // Group by product id to compute cheapestPrice.
  const query = `
    SELECT 
      p.id,
      p.shopId,
      p.title,
      p.handle,
      p.description,
      p.vendor,
      p.productType,
      p.parentProductType,
      p.childProductType,
      p.tags,
      p.image,
      p.createdAt,
      p.updatedAt,
      p.publishedAt,
      p.onSale,
      p.on_sale_variant_id,
      s.name as skateShopName,
      s.state as skateShopState,
      s.url as skateShopUrl,
      MIN(v.price) as cheapestPrice
    FROM Product p
    JOIN SkateShop s ON p.shopId = s.id
    JOIN Variant v ON v.productId = p.id
    ${whereSQL}
    GROUP BY p.id
    ${orderSQL}
    LIMIT ? OFFSET ?
  `;

  // Count total products separately (without LIMIT/OFFSET):
  // We can reuse the where clause and join only Product to count
  const countQuery = `
    SELECT COUNT(DISTINCT p.id) as count
    FROM Product p
    JOIN Variant v ON v.productId = p.id
    ${whereSQL}
  `;

  try {
    const countResult: Array<{ count: number }> = await prisma.$queryRawUnsafe(countQuery, ...params);
    const totalProducts = countResult[0]?.count ?? 0;

    const finalParams = [...params, limit, offset];
    const result = await prisma.$queryRawUnsafe<any[]>(query, ...finalParams);

    // Process products to match the original format
    const products = result.map((row) => ({
      id: row.id,
      shopId: row.shopId,
      title: row.title,
      handle: row.handle,
      description: row.description,
      vendor: row.vendor,
      productType: row.productType,
      parentProductType: row.parentProductType,
      childProductType: row.childProductType,
      tags: row.tags,
      image: row.image ? JSON.parse(row.image) : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      publishedAt: row.publishedAt,
      onSale: !!row.onSale,
      on_sale_variant_id: row.on_sale_variant_id,
      skateShop: {
        name: row.skateShopName,
        state: row.skateShopState,
        url: row.skateShopUrl,
      },
      cheapestPrice: row.cheapestPrice,
    }));

    return {
      products,
      totalProducts,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
    };
  } catch (error) {
    console.error("Error fetching paginated products:", error);
    return {
      products: [],
      totalProducts: 0,
      currentPage: page,
      totalPages: 0,
    };
  }
};
*/