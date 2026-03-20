import { ProductCard } from "./product-card";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  material?: string | null;
  images: { imageUrl: string; isPrimary: boolean }[];
  category?: { slug: string } | null;
}

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
}

export function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-20 text-center">
        <span className="block font-serif text-5xl text-gold-200">&#9670;</span>
        <p className="mt-4 text-sm text-charcoal/40">
          Henüz ürün bulunmuyor.
        </p>
      </div>
    );
  }

  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={`stagger-children grid gap-x-5 gap-y-10 ${gridCols[columns]}`}>
      {products.map((product) => {
        const primaryImage =
          product.images.find((img) => img.isPrimary) || product.images[0];

        return (
          <ProductCard
            key={product.id}
            name={product.name}
            slug={product.slug}
            price={Number(product.price)}
            compareAtPrice={
              product.compareAtPrice ? Number(product.compareAtPrice) : null
            }
            imageUrl={primaryImage?.imageUrl}
            categorySlug={product.category?.slug}
            material={product.material}
          />
        );
      })}
    </div>
  );
}
