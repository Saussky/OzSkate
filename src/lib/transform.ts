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
// TODO: GO through each search field, figure out priority, it currently overwrites (make explicit and obvious of order_)

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
    Hats: ["hat", "cap", "bucket hat", "balaclava", "ski mask"],
    Beanies: ["beanie"],
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
    Backpacks: ["backpack", "backpacks"],
    "Tote Bags": ["tote bag", "tote bags", "tote"],
  },
  Accessories: {
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
    Other: ["other"],
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

// function findChildProductTypeAcrossParents(
//   searchFields: string[]
// ): { parent: ParentProductType; child: ChildProductType } | null {
//   for (const parent of Object.keys(
//     childTypeKeywordsPerParent
//   ) as ParentProductType[]) {
//     const childKeywords = childTypeKeywordsPerParent[parent];

//     const foundChildType = (
//       Object.keys(childKeywords) as Array<keyof typeof childKeywords>
//     ).find((childType) =>
//       searchFields.some((field) =>
//         (childKeywords[childType] as string[]).some((keyword: string) => {
//           const fieldWords = field.split(/[\s\/]+/);
//           const keywordParts = keyword.toLowerCase().split(' ');
//           if (keywordParts.length === 1) {
//             return fieldWords.includes(keywordParts[0]);
//           } else {
//             // Multi-word keyword match (check consecutive words)
//             for (let i = 0; i <= fieldWords.length - keywordParts.length; i++) {
//               if (keywordParts.every((kp, idx) => fieldWords[i + idx] === kp)) {
//                 return true;
//               }
//               return false;
//             }
//          }
//         })
//       )
//     );

//     if (foundChildType) {
//       return { parent, child: foundChildType as ChildProductType };
//     }
//   }
//   return null;
// }

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
  return keywords.some((keyword) => keywordMatchesField(field, keyword));
}

function findChildTypeForParent(
  searchFields: string[],
  childKeywords: Record<ChildProductType, string[]>
): ChildProductType | null {
  for (const childType of Object.keys(childKeywords) as ChildProductType[]) {
    if (searchFields.some((field) => childTypeMatchesField(field, childKeywords[childType]))) {
      return childType;
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

    const foundChildType = findChildTypeForParent(searchFields, childKeywords);
    if (foundChildType) {
      return { parent, child: foundChildType };
    }
  }
  return null;
}


// TODO: Add product handles (remove hyphens in the string and replace with spaces)
export function categoriseProduct(product: Product): CategorisedProduct {
  const { title, description, ogProductType, tags } = product;

  // In reverse order for priority. Description will get over-written by ogProductType and so on
  const searchFields = [
    safeString(description),
    safeString(ogProductType),
    tags.map(safeString).join(" "),
    safeString(title),
  ];

  let parentProductType = null;
  let childProductType: ChildProductType | null = null;

  if (isMensFootwear(product)) {
    return { parentProductType: "Shoes", childProductType: "Shoes" };
  }


  const result = findChildProductType(searchFields);
  if (result) {
    parentProductType = result.parent;
    childProductType = result.child;
  }
  

  return { parentProductType, childProductType } as CategorisedProduct;
}
