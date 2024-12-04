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

// Mapping of child type keywords under each parent product type
const childTypeKeywordsPerParent: {
  [P in ParentProductType]: Record<ChildProductTypePerParent[P], string[]>;
} = {
  Clothing: {
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
    "Mens T-Shirts": [
      "men's t-shirt",
      "mens t-shirt",
      "men's tee",
      "mens tee",
      "tee",
    ],
    "Mens Pants": ["men's pants", "mens pants", "men's denim", "mens denim"],
    "Mens Shorts": ["men's shorts", "mens shorts", "shorts"],
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
  },
  Skateboards: {
    // Skateboards Children
    Decks: ["deck", "decks"],
    Completes: ["complete", "longboard", "cruiser", "surf skate"],
    Trucks: ["truck"],
    Wheels: ["wheel", "wheels"],
    Bearings: ["bearing", "bearings"],
    Tools: ["tool", "tools"],
    Hardware: ["hardware", "bolts"],
  },
  "Protective Gear": {
    // Protective Gear Children
    Pads: ["pad", "pads", "guard", "protective", "safety", "saftey"],
    Helmets: ["helmet"],
    Other: ["other"],
  },
  Shoes: {
    // Shoes Children
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
    // Bags Children
    Backpacks: ["backpack", "backpacks"],
    "Tote Bags": ["tote bag", "tote bags", "tote"],
  },
  Accessories: {
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
    Other: ["other"],
  },
};

function findParentProductType(
  searchFields: string[]
): ParentProductType | null {
  return (
    (Object.keys(parentTypeKeywords) as ParentProductType[]).find(
      (parentType) =>
        searchFields.some((field) =>
          parentTypeKeywords[parentType].some((keyword) =>
            field.includes(keyword.toLowerCase())
          )
        )
    ) || null
  );
}

function findChildProductTypeForParent(
  parentProductType: ParentProductType,
  searchFields: string[]
): ChildProductType | null {
  const childKeywords = childTypeKeywordsPerParent[parentProductType];

  return (
    (Object.keys(childKeywords) as Array<keyof typeof childKeywords>).find(
      (childType) =>
        searchFields.some((field) =>
          (childKeywords[childType] as string[]).some((keyword: string) =>
            field.includes(keyword.toLowerCase())
          )
        )
    ) || null
  );
}

function findChildProductTypeAcrossParents(
  searchFields: string[]
): { parent: ParentProductType; child: ChildProductType } | null {
  for (const parent of Object.keys(
    childTypeKeywordsPerParent
  ) as ParentProductType[]) {
    const childKeywords = childTypeKeywordsPerParent[parent];

    const foundChildType = (
      Object.keys(childKeywords) as Array<keyof typeof childKeywords>
    ).find((childType) =>
      searchFields.some((field) =>
        (childKeywords[childType] as string[]).some((keyword: string) =>
          field.includes(keyword.toLowerCase())
        )
      )
    );

    if (foundChildType) {
      return { parent, child: foundChildType as ChildProductType };
    }
  }
  return null;
}

export function categoriseProduct(product: Product): CategorisedProduct {
  const { title, description, ogProductType, tags } = product;

  const safeString = (value: unknown): string =>
    typeof value === "string" ? value.toLowerCase() : "";

  const searchFields = [
    safeString(ogProductType),
    tags.map(safeString).join(" "),
    safeString(title),
    safeString(description),
  ];

  let parentProductType = findParentProductType(searchFields);
  let childProductType: ChildProductType | null = null;

  if (parentProductType) {
    childProductType = findChildProductTypeForParent(
      parentProductType,
      searchFields
    );
  } else {
    const result = findChildProductTypeAcrossParents(searchFields);
    if (result) {
      parentProductType = result.parent;
      childProductType = result.child;
    }
  }

  if (childProductType === "Shoes") {
    parentProductType = "Shoes";
  }

  return { parentProductType, childProductType } as CategorisedProduct;
}
