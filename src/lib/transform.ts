import {
  ParentProductType,
  ChildProductType,
  ChildProductTypePerParent,
} from "./types";

type Product = {
  title: string;
  description: string;
  ogProductType: string;
  tags: string[];
  handle: string;
};

type CategorisedProduct<
  P extends ParentProductType | null = ParentProductType | null
> = {
  parentProductType: P;
  childProductType: P extends ParentProductType
    ? ChildProductTypePerParent[P] | null
    : null;
};

const parentTypeKeywords: Record<ParentProductType, string[]> = {
  Clothing: [
    "apparel",
    "shirt",
    "tees",
    "jumper",
    "jacket",
    "t-shirt",
    "pant",
    "pants",
    "shorts",
    "mens",
    "womens",
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

// TODO: There are some keywords that will need to be two words aka "t shirt", "deck bolts". Functionality adjustment
// Above is done? Need to find product/store to test

// Mapping of child type keywords under each parent product type
const childTypeKeywordsPerParent: {
  [P in ParentProductType]: Record<ChildProductTypePerParent[P], string[]>;
} = {
  Clothing: {
    Jumpers: ["jumper", "hoodie", "sweater", "pullover", "jumpers", "hoodies", "sweaters", "pullovers"],
    Shirts: ["shirt", "button up", "long sleeve", "shirts", "ss shirt", "jersey", "jerseys"],
    "T-Shirts": ["t-shirt", "tee", "t shirt", "t-shirts", "t shirts", "tees"],
    Pants: ["pants", "jeans", "trousers"],
    Shorts: ["shorts", "short"],
    "Women's Tops": [
      "women's top",
      "women's shirt",
      "women's blouse",
      "women's t-shirt",
    ],
    "Women's Bottoms": [
      "women's pants",
      "women's shorts",
      "women's skirt",
      "women's leggings",
    ],
    Hats: ["hat", "cap", "bucket hat", "balaclava", "ski mask", "hats", "snapback", "5 panel", "6 panel", "5-panel", "6-panel", "headwear"],
    Beanies: ["beanie", "beanies", "warf"],
    Socks: ["sock", "socks"],
  },
  Skateboards: {
    Decks: ["deck", "decks"],
    Completes: ["complete", "longboard", "cruiser", "surf skate"],
    Trucks: ["truck", "trucks"],
    Wheels: ["wheel", "wheels"],
    Bearings: ["bearing", "bearings"],
    Tools: ["tool", "tools"],
    Hardware: ["hardware", "bolts", "deck bolts", "riser", "risers"],
    Griptape: ["griptape", "griptapes", "grip tape"]
  },
  "Protective Gear": {
    Pads: ["pad", "pads", "guard", "protective", "safety", "saftey"],
    Helmets: ["helmet", "helmets"],
    Other: ["other"],
  },
  Shoes: {
    Shoes: [
      "shoe",
      "shoes",
      "sneaker",
      "sneakers",
      "footwear",
      "boot",
      "boots",
    ],
  },
  Bags: {
    Backpacks: ["backpack", "backpacks", "bag", "bags"],
    "Tote Bags": ["tote bag", "tote bags", "tote"],
  },
  Accessories: {
    Belts: ["belt", "belts"],
    Watches: ["watch", "watches"],
    Sunglasses: ["sunglass", "sunglasses", "sunnies"],
    Literature: ["literature", "book", "books", "magazine", "poster", "dvd", "vinyl"],
    Wax: ["wax"],
    Keychains: ["keychain", "key chain", "keychains"],
    Wallets: ["wallet", "wallets"],
    Stickers: ["sticker", "stickers"],
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
    Other: ["other", "mug", "mugs", "doormat", "doormats", ],
  },
};

function safeString(value: unknown): string {
  return typeof value === "string" ? value.toLowerCase() : "";
}

// TODO: Achieve this functionality in generic function
function  isMensFootwear(product: Product): boolean {
  const { ogProductType, tags } = product;
  return (
    safeString(ogProductType).includes("shoes") || 
    tags.some((tag) => safeString(tag) === "footwear")    
  );
}

function keywordMatchesField(field: string, keyword: string): boolean {
  const fieldWords = field.split(/[\s\/]+/);
  const keywordParts = keyword.toLowerCase().split(" ");
  if (keywordParts.length === 1) return fieldWords.includes(keywordParts[0]);
  for (let i = 0; i <= fieldWords.length - keywordParts.length; i++) {
    if (keywordParts.every((kp, idx) => fieldWords[i + idx] === kp)) return true;
  }
  return false;
}

function childTypeMatchesField(field: string, keywords: string[]): boolean {
  for (const keyword of keywords) {
    if (keywordMatchesField(field, keyword)) return true;
  }
  return false;
}

function findChildTypeForParent(
  searchFields: string[],
  childKeywords: Record<ChildProductType, string[]>
): ChildProductType | null {
  for (const childType of Object.keys(childKeywords) as ChildProductType[]) {
    for (const field of searchFields) {
      if (childTypeMatchesField(field, childKeywords[childType])) {
        return childType;
      }
    }
  }
  return null;
}

function findChildProductType(
  searchFields: string[]
): { parent: ParentProductType; child: ChildProductType } | null {
  for (const parent of Object.keys(
    childTypeKeywordsPerParent
  ) as ParentProductType[]) {
    const childKeywords = childTypeKeywordsPerParent[parent] as Record<
      ChildProductType,
      string[]
    >;

    const matchedChildType = findChildTypeForParent(searchFields, childKeywords);
    if (matchedChildType) return { parent, child: matchedChildType };
  }
  return null;
}


export function categoriseProduct(product: Product): CategorisedProduct {
  const { title, description, ogProductType, tags, handle } = product;

  const searchFields = [
    safeString(title),
    tags.map(safeString).join(" "),
    safeString(ogProductType),
    safeString(handle.replaceAll('-', ' ')),
    safeString(description),
  ];

  let parentProductType = null;
  let childProductType: ChildProductType | null = null;

  if (isMensFootwear(product)) {
    return { parentProductType: "Shoes", childProductType: "Shoes" };
  }


  let result = null;
  for (const field of searchFields) {
    result = findChildProductType([field]);
    if (result) {
      parentProductType = result.parent;
      childProductType = result.child;
      break;
    }
  }

  return { parentProductType, childProductType } as CategorisedProduct;
}
