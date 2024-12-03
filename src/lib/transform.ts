import { ParentProductType, ChildProductType } from "./types";

type Product = {
  title: string;
  description: string;
  ogProductType: string;
  tags: string[];
};

type CategorisedProduct = {
  parentProductType: ParentProductType | null;
  childProductType: ChildProductType | null;
};

const parentTypeKeywords: Record<ParentProductType, string[]> = {
  Clothing: [
    "shirt",
    "jumper",
    "jacket",
    "t-shirt",
    "pant",
    "pants",
    "shorts",
    "hat",
    "beanie",
    "sock",
    "hoodie",
    "fleece",
    "crew",
    "pullover",
  ],
  Skateboards: [
    "deck",
    "skateboard",
    "truck",
    "wheel",
    "bearing",
    "tool",
    "hardware",
    "complete",
    "longboard",
    "cruiser",
    "surf skate",
  ],
  "Protective Gear": [
    "pad",
    "helmet",
    "protective",
    "safety",
    "saftey",
    "guard",
  ],
  Shoes: [
    "shoe",
    "shoes",
    "footwear",
    "boot",
    "sneaker",
    "trainer",
    "slip on",
    "slides",
    "sandals",
  ],
  Bags: [
    "backpack",
    "tote",
    "bag",
    "luggage",
    "duffel",
    "bum bag",
    "hip bag",
    "shoulder bag",
  ],
  Accessories: [
    "belt",
    "watch",
    "sunglass",
    "sunnies",
    "literature",
    "book",
    "magazine",
    "poster",
    "dvd",
    "vinyl",
    "wax",
    "keychain",
    "jewellery",
    "ring",
    "necklace",
    "bracelet",
    "earring",
    "patch",
    "pin",
    "wallet",
  ],
};

const childTypeKeywords: Record<ChildProductType, string[]> = {
  // Clothing Children
  "Mens Jumpers": [
    "men's jumper",
    "mens jumper",
    "mens hoodie",
    "men's hoodie",
  ],
  "Mens Shirts": [
    "men's shirt",
    "mens shirt",
    "men's long sleeve",
    "mens long sleeve",
  ],
  "Mens T-Shirts": ["men's t-shirt", "mens t-shirt", "men's tee", "mens tee"],
  "Mens Pants": ["men's pants", "mens pants", "men's denim", "mens denim"],
  "Mens Shorts": ["men's shorts", "mens shorts"],
  "Womens Jumpers": [
    "women's jumper",
    "womens jumper",
    "women's hoodie",
    "womens hoodie",
  ],
  "Womens Shirts": [
    "women's shirt",
    "womens shirt",
    "women's long sleeve",
    "womens long sleeve",
  ],
  "Womens T-Shirts": [
    "women's t-shirt",
    "womens t-shirt",
    "women's tee",
    "womens tee",
  ],
  "Womens Pants": [
    "women's pants",
    "womens pants",
    "women's denim",
    "womens denim",
  ],
  "Womens Shorts": ["women's shorts", "womens shorts"],
  Hats: ["hat", "cap", "bucket hat", "balaclava", "ski mask"],
  Beanies: ["beanie"],
  Socks: ["sock"],
  // Skateboards Children
  Decks: ["deck", "decks"],
  Completes: ["complete", "longboard", "cruiser", "surf skate"],
  Trucks: ["truck"],
  Wheels: ["wheel", "wheels"],
  Bearings: ["bearing", "bearings"],
  Tools: ["tool", "tools"],
  Hardware: ["hardware", "bolts"],
  // Protective Gear Children
  Pads: ["pad", "pads", "guard", "protective", "safety", "saftey"],
  Helmets: ["helmet"],
  Other: ["other"],
  // Shoes Children
  Shoes: ["shoe", "shoes", "sneaker", "sneakers", "footwear", "boot", "boots"],
  // Bags Children
  Backpacks: ["backpack", "backpacks"],
  "Tote Bags": ["tote bag", "tote bags", "tote"],
  // Accessories Children
  Belts: ["belt", "belts"],
  Watches: ["watch", "watches"],
  Sunglasses: ["sunglass", "sunglasses", "sunnies"],
  Literature: ["literature", "book", "magazine", "poster", "dvd", "vinyl"],
  Wax: ["wax"],
  Keychains: ["keychain", "key chain", "keychains"],
  Jewellery: [
    "jewellery",
    "jewelry",
    "ring",
    "necklace",
    "bracelet",
    "earring",
    "patch",
    "pin",
  ],
};

export function categoriseProduct(product: Product): CategorisedProduct {
  const { title, description, ogProductType, tags } = product;

  const combinedText = `${title} ${description} ${ogProductType} ${tags.join(
    " "
  )}`.toLowerCase();

  // Find Parent Product Type
  const parentProductType =
    (Object.keys(parentTypeKeywords) as ParentProductType[]).find(
      (parentType) =>
        parentTypeKeywords[parentType].some((keyword) =>
          combinedText.includes(keyword.toLowerCase())
        )
    ) || null;

  // Find Child Product Type
  const childProductType =
    (Object.keys(childTypeKeywords) as ChildProductType[]).find((childType) =>
      childTypeKeywords[childType].some((keyword) =>
        combinedText.includes(keyword.toLowerCase())
      )
    ) || null;

  return { parentProductType, childProductType };
}

// Example Usage
const exampleProduct: Product = {
  title: "Men's Classic Skate Shoes",
  description: "High-quality shoes perfect for skateboarding.",
  ogProductType: "Footwear",
  tags: ["skate", "footwear", "mens"],
};

const categorised = categoriseProduct(exampleProduct);
console.log(categorised);
// Output: { parentProductType: "Shoes", childProductType: "Shoes" }
