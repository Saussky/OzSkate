import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const skateboardShops = [
  // {
  //   name: "335 Skate Supply",
  //   url: "https://www.335skatesupply.com.au",
  //   state: "NSW",
  // },
  // {
  //   name: "Beyond Skate",
  //   url: "https://www.beyondskate.com.au",
  //   state: "WA",
  // },
  {
    name: "Concrete Skate Supply",
    url: "https://www.concreteskatesupply.com.au",
    state: "NSW-VIC",
  },
  {
    name: "Evolve Skate Store",
    url: "https://evolveskatestore.com",
    state: "VIC",
  },
  // {
  //   name: "Skateboard.com.au",
  //   url: "https://www.skateboard.com.au",
  //   state: "VIC",
  // },
  // {
  //   name: "Hemley Skateboarding",
  //   url: "https://hemleyskateboarding.com.au",
  //   state: "VIC",
  // },
  // {
  //   name: "Jimmy's Skate",
  //   url: "https://jimmysskate.com",
  //   state: "TAS",
  // },
  // {
  //   name: "Locality Store",
  //   url: "https://localitystore.com.au",
  //   state: "VIC",
  // },
  // {
  //   name: "Lodown Skate Shop",
  //   url: "https://www.lodown.com.au",
  //   state: "NSW",
  // },
  // {
  //   name: "Middle Store",
  //   url: "https://middlestore.com.au",
  //   state: "WA",
  // },
  // {
  //   name: "Momentum Skate Shop",
  //   url: "https://momentumskate.com.au",
  //   state: "WA",
  // },
  // {
  //   name: "New Traditions Skate Shop",
  //   url: "https://newtraditions.com.au",
  //   state: "NSW",
  // },
  // {
  //   name: "OCD Skate Shop",
  //   url: "https://ocdskateshop.com.au",
  //   state: "VIC",
  // },
  // {
  //   name: "Parliament Skate Shop",
  //   url: "https://www.parliamentskateshop.com",
  //   state: "QLD",
  // },
  // {
  //   name: "Skate Connection",
  //   url: "https://www.skateconnection.com.au",
  //   state: "QLD",
  // },
  // {
  //   name: "Soggy Bones",
  //   url: "https://www.soggybones.com",
  //   state: "WA",
  // },
  // {
  //   name: "Street Machine Skate",
  //   url: "https://streetmachineskate.com",
  //   state: "VIC",
  // },
  // {
  //   name: "Truckstop Sk8",
  //   url: "https://www.truckstopsk8.com.au",
  //   state: "NSW",
  // },
  // {
  //   name: "Twelve Board Store",
  //   url: "https://twelveboardstore.com.au",
  //   state: "VIC",
  // },
  // {
  //   name: "Postal Skateboards",
  //   url: "https://postalskateboards.com.au",
  //   state: "QLD",
  // },
  // {
  //   name: "50-50 Skate Shop",
  //   url: "https://50-50.com.au",
  //   state: "NSW",
  // },
];

async function main() {
  console.log("Seeding database...");

  for (const shop of skateboardShops) {
    await prisma.shop.upsert({
      where: { name: shop.name },
      update: {},
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
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
