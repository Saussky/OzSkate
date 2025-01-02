// TODO: Implement master category taxonomy and redo this

export type ParentProductType =
  | "Clothing"
  | "Skateboards"
  | "Protective Gear"
  | "Shoes"
  | "Bags"
  | "Accessories";

export type ChildProductTypePerParent = {
  Clothing:
    | "Jumpers"
    | "Shirts"
    | "T-Shirts"
    | "Pants"
    | "Shorts"
    | "Women's Tops"
    | "Women's Bottoms"
    | "Hats"
    | "Beanies"
    | "Socks";
  Skateboards:
    | "Decks"
    | "Completes"
    | "Trucks"
    | "Wheels"
    | "Bearings"
    | "Tools"
    | "Hardware"
    | "Griptape";
  "Protective Gear": "Pads" | "Helmets" | "Other";
  Shoes: "Shoes" | "Youth";
  Bags: "Backpacks" | "Tote Bags";
  Accessories:
    | "Belts"
    | "Watches"
    | "Sunglasses"
    | "Literature"
    | "Wax"
    | "Keychains"
    | "Jewellery"
    | "Wallets"
    | "Stickers"
    | "Other";
};

export type ChildProductType =
  ChildProductTypePerParent[keyof ChildProductTypePerParent];

  export type FilterOption = Record<string, string | number | boolean | null>