// TODO: Implement master category taxonomy and redo this

export type ParentType =
  | "Clothing"
  | "Skateboards"
  | "Protective Gear"
  | "Shoes"
  | "Bags"
  | "Accessories";

export type ChildTypePerParent = {
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
  Shoes: "Mens" | "Youth" | "Womens";
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

export type ChildType =
  ChildTypePerParent[keyof ChildTypePerParent];

export type FilterOption = Record<string, string | number | boolean | null>

export type User = {
    id: string;
    email: string;
    username: string;
    admin: boolean;
};
