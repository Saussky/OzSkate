import { PrismaClient } from "@prisma/client"; // Import Prisma Client

const prisma = new PrismaClient(); // Initialize Prisma Client

const skateboardShops = [
  // {
  //   name: "335 Skate Supply",
  //   url: "https://www.335skatesupply.com.au/products.json",
  //   state: "NSW",
  // },
  // {
  //   name: "Beyond Skate",
  //   url: "https://www.beyondskate.com.au/products.json",
  //   state: "WA",
  // },
  // {
  //   name: "Concrete Skate Supply",
  //   url: "https://www.concreteskatesupply.com.au/products.json",
  //   state: "NSW-VIC",
  // },
  // {
  //   name: "Evolve Skate Store",
  //   url: "https://evolveskatestore.com/products.json",
  //   state: "VIC",
  // },
  // {
  //   name: "Skateboard.com.au",
  //   url: "https://www.skateboard.com.au/products.json",
  //   state: "VIC",
  // },
  // {
  //   name: "Hemley Skateboarding",
  //   url: "https://hemleyskateboarding.com.au/products.json",
  //   state: "VIC",
  // },
  // {
  //   name: "Jimmy's Skate",
  //   url: "https://jimmysskate.com/products.json",
  //   state: "TAS",
  // },
  // {
  //   name: "Locality Store",
  //   url: "https://localitystore.com.au/products.json",
  //   state: "VIC",
  // },
  // {
  //   name: "Lodown Skate Shop",
  //   url: "https://www.lodown.com.au/products.json",
  //   state: "NSW",
  // },
  // {
  //   name: "Middle Store",
  //   url: "https://middlestore.com.au/products.json",
  //   state: "WA",
  // },
  // {
  //   name: "Momentum Skate Shop",
  //   url: "https://momentumskate.com.au/products.json",
  //   state: "WA",
  // },
  // {
  //   name: "New Traditions Skate Shop",
  //   url: "https://newtraditions.com.au/products.json",
  //   state: "NSW",
  // },
  {
    name: "OCD Skate Shop",
    url: "https://ocdskateshop.com.au/products.json",
    state: "VIC",
  },
  // {
  //   name: "Parliament Skate Shop",
  //   url: "https://www.parliamentskateshop.com/products.json",
  //   state: "QLD",
  // },
  // {
  //   name: "Skate Connection",
  //   url: "https://www.skateconnection.com.au/products.json",
  //   state: "QLD",
  // },
  // {
  //   name: "Soggy Bones",
  //   url: "https://www.soggybones.com/products.json",
  //   state: "WA",
  // },
  // {
  //   name: "Street Machine Skate",
  //   url: "https://streetmachineskate.com/products.json",
  //   state: "VIC",
  // },
  // {
  //   name: "Truckstop Sk8",
  //   url: "https://www.truckstopsk8.com.au/products.json",
  //   state: "NSW",
  // },
  // {
  //   name: "Twelve Board Store",
  //   url: "https://twelveboardstore.com.au/products.json",
  //   state: "VIC",
  // },
  // {
  //   name: "Postal Skateboards",
  //   url: "https://postalskateboards.com.au/products.json",
  //   state: "QLD",
  // },
  {
    name: "50-50 Skate Shop",
    url: "https://50-50.com.au/products.json",
    state: "NSW",
  },
];

async function main() {
  console.log("Seeding database...");

  for (const shop of skateboardShops) {
    // Use upsert to avoid duplicates
    await prisma.skateShop.upsert({
      where: { name: shop.name },
      update: {}, // No update needed
      create: {
        name: shop.name,
        url: shop.url,
        state: shop.state,
      },
    });
    console.log(`Seeded shop: ${shop.name}`);
  }

  console.log("Database seeding completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect(); // Disconnect the Prisma Client
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
