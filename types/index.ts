export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  image?: string;
  price: number;
  variantName?: string;
  quantity: number;
  slug: string;
  categorySlug?: string;
}

export interface ProductWithRelations {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  sku: string | null;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  material: string | null;
  weight: string | null;
  dimensions: string | null;
  modelUrl: string | null;
  has3dModel: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  images: {
    id: string;
    imageUrl: string;
    altText: string | null;
    sortOrder: number;
    isPrimary: boolean;
  }[];
  variants: {
    id: string;
    name: string;
    variantType: string;
    priceModifier: number;
    stockQuantity: number;
    isActive: boolean;
  }[];
}
