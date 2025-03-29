// import { skateboardShops } from "@/lib/constants";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// async function main() {
//   console.log("Seeding database...");

//   for (const shop of skateboardShops) {
//     await prisma.shop.upsert({
//       where: { name: shop.name },
//       update: {},
//       create: {
//         name: shop.name,
//         url: shop.url,
//         state: shop.state,
//       },
//     });
//     console.log(`Seeded shop: ${shop.name}`);
//   }

//   console.log("Database seeding completed.");
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });
