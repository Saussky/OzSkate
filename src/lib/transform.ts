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

// TODO: Implement logic separating t-shirts from shirts
// TODO: Implement griptape as sub-category
// TODO: There are some keywords that will need to be two words aka "t shirt", "deck bolts". Functionality adjustment
// TODO: GO through each search field, figure out priority, it currently overwrites (make explicit and obvious of order_)

// Mapping of child type keywords under each parent product type
const childTypeKeywordsPerParent: {
  [P in ParentProductType]: Record<ChildProductTypePerParent[P], string[]>;
} = {
  Clothing: {
    Jumpers: ["jumper", "hoodie", "sweater", "pullover"],
    Shirts: ["shirt", "button up", "long sleeve"],
    "T-Shirts": ["t-shirt", "tee"],
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
    Hardware: ["hardware", "bolts", "riser", "risers"],
  },
  "Protective Gear": {
    Pads: ["pad", "pads", "guard", "protective", "safety", "saftey"],
    Helmets: ["helmet"],
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

function  isMensFootwear(product: Product): boolean {
  const { ogProductType, tags } = product;
  return (
    safeString(ogProductType).includes("mens") || 
    safeString(ogProductType).includes("shoes") || 
    tags.some((tag) => safeString(tag) === "footwear")    
  );
}

function findParentProductType(
  searchFields: string[]
): ParentProductType | null {
  return (
    (Object.keys(parentTypeKeywords) as ParentProductType[]).find(
      (parentType) =>
        searchFields.some((field) =>
          parentTypeKeywords[parentType].some((keyword) =>
            field.split(/[\s\/]+/).some(word => word === keyword.toLowerCase())
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
            field.split(/[\s\/]+/).some(word => word === keyword.toLowerCase())
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
          field.split(/[\s\/]+/).some(word => word === keyword.toLowerCase())
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

  const searchFields = [
    tags.map(safeString).join(" "),
    safeString(title),
    // safeString(description),
    // safeString(ogProductType),
  ];

  let parentProductType = null // findParentProductType(searchFields);
  let childProductType: ChildProductType | null = null;

  if (isMensFootwear(product)) {
    return { parentProductType: "Shoes", childProductType: "Shoes" };
  }

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

  return { parentProductType, childProductType } as CategorisedProduct;
}
