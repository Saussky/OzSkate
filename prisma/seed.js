import prisma from "./src/app/lib/prisma";

const skateboardShops = [
  {
    key: "skateboard.com.au",
    url: "https://www.skateboard.com.au/products.json",
    headers: JSON.stringify({
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Sec-GPC": "1",
      "Alt-Used": "www.skateboard.com.au",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "If-None-Match": '"cacheable:331cf1cd7c2de6cb11b8c0adafaa60ba"',
      Priority: "u=0, i",
    }),
    state: "NSW",
    lastUpdated: null,
  },
  {
    key: "ocdskateshop.com.au",
    url: "https://ocdskateshop.com.au/products.json",
    headers: JSON.stringify({
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Sec-GPC": "1",
      "Alt-Used": "ocdskateshop.com.au",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "If-None-Match": '"cacheable:0d640a6754b33d40a2b698b073a9567c"',
      Priority: "u=0, i",
    }),
    state: "VIC",
    lastUpdated: null,
  },
];

async function seed() {
  console.log("Seeding database...");

  for (const shop of skateboardShops) {
    // Check if the shop already exists
    const existingShop = await prisma.skateShop.findFirst({
      where: { name: shop.key },
    });

    if (!existingShop) {
      // Add the shop if it doesn't already exist
      await prisma.skateShop.create({
        data: {
          name: shop.key,
          headers: shop.headers,
          state: shop.state,
        },
      });
      console.log(`Added shop: ${shop.key}`);
    } else {
      console.log(`Shop already exists: ${shop.key}`);
    }
  }

  console.log("Database seeding completed.");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
