// Define the ParentProductType
export type ParentProductType =
  | "Clothing"
  | "Skateboards"
  | "Protective Gear"
  | "Shoes"
  | "Bags"
  | "Accessories";

// Define the ChildProductType mapping per ParentProductType
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
  Shoes: "Shoes";
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

// Define a general ChildProductType as a union of all possible child types
export type ChildProductType =
  ChildProductTypePerParent[keyof ChildProductTypePerParent];
