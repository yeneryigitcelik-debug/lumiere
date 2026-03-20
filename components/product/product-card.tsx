import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  imageUrl?: string;
  categorySlug?: string;
  material?: string | null;
}

export function ProductCard({
  name,
  slug,
  price,
  compareAtPrice,
  imageUrl,
  categorySlug,
  material,
}: ProductCardProps) {
  const href = categorySlug
    ? `/urunler/${categorySlug}/${slug}`
    : `/urunler/${slug}`;

  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  return (
    <Link href={href} className="group relative block">
      {/* Image */}
      <div className="luxury-image-hover relative aspect-[3/4] overflow-hidden rounded-sm bg-gold-50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            width={400}
            height={533}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gold-50 to-gold-100">
            <div className="text-center">
              <span className="block font-serif text-4xl text-gold-300">&#9670;</span>
              <span className="mt-2 block text-[10px] uppercase tracking-[0.2em] text-gold-300">
                Lumiere
              </span>
            </div>
          </div>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute left-3 top-3 bg-charcoal px-2.5 py-1">
            <span className="text-[10px] font-medium uppercase tracking-wider text-white">
              -{discountPercent}%
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-charcoal/0 transition-colors duration-500 group-hover:bg-charcoal/10" />

        {/* Quick view hint */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-charcoal/90 py-3 text-center transition-transform duration-500 group-hover:translate-y-0">
          <span className="text-[11px] uppercase tracking-[0.2em] text-white">
            Detayı Gör
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4">
        {material && (
          <p className="text-[10px] uppercase tracking-[0.2em] text-gold-500">
            {material}
          </p>
        )}
        <h3 className="mt-1 font-serif text-[15px] font-medium text-charcoal transition-colors duration-300 group-hover:text-gold-700">
          {name}
        </h3>
        <div className="mt-1.5 flex items-center gap-2.5">
          <span className="text-sm font-medium text-charcoal">
            {formatPrice(price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-charcoal/35 line-through">
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
