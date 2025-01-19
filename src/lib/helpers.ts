/* eslint-disable @typescript-eslint/no-explicit-any */
import fetch from "node-fetch";
import { prisma } from "./prisma";
import { transformProducts } from "./product/transform";
import { checkProductSimilarity } from "./product/merge";

export async function processShop(shop: any) {
  const baseUrl = shop.url + '/products.json';
  const sinceId = shop.since_id || "0"; 

  const allPaginatedProducts = await fetchShopifyProducts(baseUrl, sinceId);

  if (allPaginatedProducts.length === 0) {
    console.log(`No new products found for shop: ${shop.name}`);
    return;
  }

  const transformedProducts = transformProducts(allPaginatedProducts, shop.id);

  for (const product of transformedProducts) {
    const { variants, options, ...productData } = product;

    await prisma.product.upsert({
      where: { id: productData.id },
      update: productData,
      create: productData,
    });

    if (Array.isArray(variants)) {
      for (const variant of variants) {

        await prisma.variant.upsert({
          where: { id: variant.id },
          update: variant,
          create: {...variant, shoeSize: variant.shoeSize || null, deckSize: variant.deckSize || null }
      });
      }
    }

    if (Array.isArray(options)) {
      for (const option of options) {
        if (option.id) {
          await prisma.option.upsert({
            where: { id: option.id },
            update: option,
            create: option,
          });
        }
      }
    }
  }
}

export const fetchShopifyProducts = async (
  baseUrl: string,
  headers: Record<string, string> = {}
) => {
  let allProducts: any[] = [];
  const limit = 250;
  let page = 1;

  while (page < 100) {
    const url = `${baseUrl}?limit=${limit}&page=${page}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0",
        Accept: "application/json",
        ...headers,
      },
      method: "GET",
    });

    if (!res.ok) {
      console.error(`Failed to fetch data from ${url}: ${res.statusText}`);
      break;
    }

    const data: any = await res.json();

    const products = data.products;
    if (!products || products.length === 0) {
      console.log("No more products to fetch.");
      break;
    }

    allProducts = allProducts.concat(products);

    console.log(`Fetched ${products.length} products from page ${page}.`);

    page++;

    // If fewer products than the limit were returned, we've reached the end
    if (products.length < limit) {
      break;
    }
  }

  return allProducts;
};


//TODO: Implement this when doing update see below for gpt response
// TODO: Use since_last_id instead, it's already setup in the database.
// TODO: This won't work, how would we know if the other products updated? Like had their price changed? We might need to get all the data from all the stores at an interval.


/*
To implement an **update-only functionality**, you'll need to ensure you fetch and process only the products that have been updated since the last sync. Most modern APIs, including Shopify, support mechanisms like `updated_at` timestamps or other filtering parameters for efficient data fetching.

Here's how you can modify your code to perform updates instead of fetching all products:

---

### **Proposed Changes**
1. **Add a `lastUpdated` Field to Shops**
   - Track the `lastUpdated` timestamp for each shop in your database.
   - Use this timestamp to fetch only the products updated since the last sync.

   ```typescript
   const sinceUpdatedAt = shop.lastUpdated || "1970-01-01T00:00:00Z";
   ```

2. **Update `fetchShopifyProducts` to Fetch by `updated_at`**
   Shopify supports the `updated_at_min` query parameter. Modify your URL to include this filter:
   
   ```typescript
   const url = `${baseUrl}?limit=${limit}&page=${page}&updated_at_min=${encodeURIComponent(sinceUpdatedAt)}`;
   ```

3. **Mark the Shop’s `lastUpdated` After Fetching**
   - Once products are processed, update the shop's `lastUpdated` to the current timestamp.
   
   ```typescript
   await prisma.shop.update({
     where: { id: shop.id },
     data: { lastUpdated: new Date() },
   });
   ```

4. **Optimize the `upsert` Logic**
   - Your `upsert` logic already handles updating or creating products. Ensure it also updates fields like `updatedAt` so stale data doesn’t persist.

---

### **Updated Code**

#### **Updated `processShop`**
```typescript
export async function processShop(shop: any) {
  console.log(`Processing shop: ${shop.name}`);

  const baseUrl = shop.url;
  const sinceUpdatedAt = shop.lastUpdated || "1970-01-01T00:00:00Z";

  const updatedProducts = await fetchShopifyProducts(baseUrl, { "updated_at_min": sinceUpdatedAt });

  if (updatedProducts.length === 0) {
    console.log(`No updated products found for shop: ${shop.name}`);
    return;
  }

  const transformedProducts = transformProducts(updatedProducts, shop.id);

  for (const product of transformedProducts) {
    const { variants, options, ...productData } = product;

    await prisma.product.upsert({
      where: { id: productData.id },
      update: productData,
      create: productData,
    });

    if (Array.isArray(variants)) {
      for (const variant of variants) {
        await prisma.variant.upsert({
          where: { id: variant.id },
          update: variant,
          create: variant,
        });
      }
    }

    if (Array.isArray(options)) {
      for (const option of options) {
        if (option.id) {
          await prisma.option.upsert({
            where: { id: option.id },
            update: option,
            create: option,
          });
        }
      }
    }
  }

  // Update the last sync timestamp
  await prisma.shop.update({
    where: { id: shop.id },
    data: { lastUpdated: new Date() },
  });

  console.log(`Finished processing shop: ${shop.name}`);
}
```

#### **Updated `fetchShopifyProducts`**
```typescript
export const fetchShopifyProducts = async (
  baseUrl: string,
  params: Record<string, string> = {}
) => {
  let allProducts: any[] = [];
  const limit = 250;
  let page = 1;

  while (page < 100) {
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
      ...params, // Add additional params like updated_at_min
    }).toString();

    const url = `${baseUrl}?${queryParams}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0",
        Accept: "application/json",
      },
      method: "GET",
    });

    if (!res.ok) {
      console.error(`Failed to fetch data from ${url}: ${res.statusText}`);
      break;
    }

    const data: any = await res.json();

    const products = data.products;
    if (!products || products.length === 0) {
      console.log("No more products to fetch.");
      break;
    }

    allProducts = allProducts.concat(products);

    console.log(`Fetched ${products.length} products from page ${page}.`);

    page++;

    if (products.length < limit) {
      break;
    }
  }

  return allProducts;
};
```

---

### **Key Benefits**
- **Efficiency**: Limits the number of API calls and database operations by only fetching updated products.
- **Scalability**: Reduces load on your server and database, making the architecture more scalable as the product count grows.
- **Maintainability**: Using a `lastUpdated` timestamp makes tracking changes straightforward and simplifies debugging.

Would you like further help integrating this or testing it?
*/