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
    | "Mens Jumpers"
    | "Mens Shirts"
    | "Mens T-Shirts"
    | "Mens Pants"
    | "Mens Shorts"
    | "Womens Jumpers"
    | "Womens Shirts"
    | "Womens T-Shirts"
    | "Womens Pants"
    | "Womens Shorts"
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
    | "Hardware";
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
    | "Other";
};

// Define a general ChildProductType as a union of all possible child types
export type ChildProductType =
  ChildProductTypePerParent[keyof ChildProductTypePerParent];
