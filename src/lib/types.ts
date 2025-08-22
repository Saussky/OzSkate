import { Prisma } from '@prisma/client';

// TODO: Implement master category taxonomy and redo this

export type ParentType =
  | 'Clothing'
  | 'Skateboards'
  | 'Protective Gear'
  | 'Shoes'
  | 'Bags'
  | 'Accessories';

export type ChildTypePerParent = {
  Clothing:
    | 'Jumpers'
    | 'Shirts'
    | 'T-Shirts'
    | 'Pants'
    | 'Shorts'
    | "Women's Tops"
    | "Women's Bottoms"
    | 'Hats'
    | 'Beanies'
    | 'Socks';
  Skateboards:
    | 'Decks'
    | 'Completes'
    | 'Trucks'
    | 'Wheels'
    | 'Bearings'
    | 'Tools'
    | 'Hardware'
    | 'Griptape';
  'Protective Gear': 'Pads' | 'Helmets' | 'Other';
  Shoes: 'Mens' | 'Youth' | 'Womens' | 'Slides';
  Bags: 'Backpacks' | 'Tote Bags';
  Accessories:
    | 'Belts'
    | 'Watches'
    | 'Sunglasses'
    | 'Literature'
    | 'Wax'
    | 'Keychains'
    | 'Jewellery'
    | 'Wallets'
    | 'Stickers'
    | 'Other';
};

export type ChildType = ChildTypePerParent[keyof ChildTypePerParent];

// export type FilterOption = Record<string, string | string[] | number | boolean | null>
export interface FilterOption {
  parentType?: string;
  childType?: string;
  vendor?: string;
  brands?: string[] | undefined;
  shops?: string[] | undefined; // include only these shops
  notShops?: string[] | undefined; // exclude these shops
  searchTerm?: string;
  maxPrice?: string | number;
  shoeSize?: string | number | null;
  deckSize?: string | number | null;
  onSale?: boolean;
}

export type User = {
  id: string;
  email: string;
  username: string;
  admin: boolean;
};

export type ProductWithSuspectedDuplicate = Prisma.productGetPayload<{
  include: {
    shop: true;
    suspectedDuplicateOf: {
      include: {
        shop: true;
      };
    };
  };
}>;

export type ProductWithShop = Prisma.productGetPayload<{
  include: {
    shop: true;
  };
}>;
