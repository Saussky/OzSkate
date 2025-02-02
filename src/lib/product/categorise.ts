/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ParentType,
  ChildType,
  ChildTypePerParent,
} from "../types";

type Product = {
  title: string;
  description: string;
  ogProductType: string;
  tags: string[];
  handle: string;
};

type CategorisedProduct<
  P extends ParentType | null = ParentType | null
> = {
  parentType: P;
  childType: P extends ParentType
    ? ChildTypePerParent[P] | null
    : null;
};

// TODO: Polos, Tank tops need to be categorised

// Mapping of child type keywords under each parent product type
const childTypeKeywordsPerParent: {
  [P in ParentType]: Record<ChildTypePerParent[P], string[]>;
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
    Mens: [
      "shoe",
      "shoes",
      "sneaker",
      "sneakers",
      "footwear",
      "boot",
      "boots",
    ],
    Youth: [],
    Womens: [],
    Slides: ['slide', 'slides']
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

function keywordMatchesField(field: string, keyword: string): boolean {
  const fieldWords = field.split(/[\s/]+/);
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
  childKeywords: Record<ChildType, string[]>
): ChildType | null {
  for (const childType of Object.keys(childKeywords) as ChildType[]) {
    for (const field of searchFields) {
      if (childTypeMatchesField(field, childKeywords[childType])) {
        return childType;
      }
    }
  }
  return null;
}

function findChildType(
  searchFields: string[]
): { parent: ParentType; child: ChildType } | null {
  for (const parent of Object.keys(
    childTypeKeywordsPerParent
  ) as ParentType[]) {
    const childKeywords = childTypeKeywordsPerParent[parent] as Record<
      ChildType,
      string[]
    >;

    let matchedChildType = findChildTypeForParent(searchFields, childKeywords);

    // TODO: Logic isn't picking up kids shoes properly
    if (matchedChildType === "Mens") {
      const isYouth = searchFields.some((field) =>
        childTypeMatchesField(field, ["youth", "kid", "kids", "toddler"])
      );
      const isWomens = searchFields.some((field) =>
        childTypeMatchesField(field, ["women", "womens", "girl", "girls"])
      );

      if (isYouth) {
        matchedChildType = "Youth";
      } else if (isWomens) {
        matchedChildType = "Womens"
      } else {
        matchedChildType = "Mens"
      }
    }

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

  let parentType = null;
  let childType: ChildType | null = null;

  // TODO: ?
  // if (isMensFootwear(product)) {
  //   return { parentType: "Shoes", childType: "Shoes" };
  // }


  //TODO: There may be a requirement to prioritise different search fields down the line
  let result = null;
  for (const field of searchFields) {
    result = findChildType([field]);
    if (result) {
      parentType = result.parent;
      childType = result.child;
      break;
    }
  }

  return { parentType, childType } as CategorisedProduct;
}
