export type Option = {
  id: number;
  productId: number;
  name: string;
  position: number;
  values: string[]; // Array of option values
};

export type Variant = {
  id: number;
  productId: number;
  title: string;
  option1?: string;
  option2?: string;
  option3?: string;
  sku: string;
  requiresShipping: boolean;
  taxable: boolean;
  featuredImage?: string;
  available: boolean;
  price: string;
  grams: number;
  compareAtPrice?: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Product = {
  id: number;
  shopId: number;
  title: string;
  handle: string;
  description?: string;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  vendor: string;
  product: string;
  tags: string[]; // Array of tags
  images: string[]; // Array of image URLs
  variants: Variant[]; // Array of related variants
  options: Option[]; // Array of related options
};
