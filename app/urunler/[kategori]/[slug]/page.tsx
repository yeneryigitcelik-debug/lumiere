import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ProductViewer3D } from "@/components/product/product-viewer-3d";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, metaTitle: true, metaDescription: true, shortDescription: true },
  });

  if (!product) return {};

  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.shortDescription || "",
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ kategori: string; slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!product) notFound();

  const primaryImage =
    product.images.find((img) => img.isPrimary) || product.images[0];

  const hasDiscount =
    product.compareAtPrice &&
    Number(product.compareAtPrice) > Number(product.price);

  return (
    <div className="pt-24">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-6 py-4">
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-charcoal/40">
          <Link href="/" className="transition-colors hover:text-gold-600">
            Ana Sayfa
          </Link>
          <span>/</span>
          <Link href="/urunler" className="transition-colors hover:text-gold-600">
            Koleksiyon
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/urunler/${product.category.slug}`}
                className="transition-colors hover:text-gold-600"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-charcoal/60">{product.name}</span>
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* ═══ LEFT: Gallery + 3D ═══ */}
          <div className="space-y-4">
            {/* 3D Viewer */}
            <ProductViewer3D
              modelUrl={product.modelUrl}
              jewelryType={product.category?.slug}
            />

            {/* Primary Image */}
            <div className="luxury-image-hover relative aspect-[3/4] overflow-hidden rounded-sm bg-gold-50">
              {primaryImage ? (
                <Image
                  src={primaryImage.imageUrl}
                  alt={primaryImage.altText || product.name}
                  width={800}
                  height={1067}
                  className="h-full w-full object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gold-50 to-gold-100">
                  <div className="text-center">
                    <span className="block font-serif text-6xl text-gold-200">&#9670;</span>
                    <span className="mt-3 block text-[10px] uppercase tracking-[0.2em] text-gold-300">
                      Lumiere & Co
                    </span>
                  </div>
                </div>
              )}

              {hasDiscount && (
                <div className="absolute left-4 top-4 bg-charcoal px-3 py-1.5">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-white">
                    İndirim
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img) => (
                  <div
                    key={img.id}
                    className="luxury-image-hover aspect-square cursor-pointer overflow-hidden rounded-sm bg-gold-50 ring-1 ring-gold-100 transition-all hover:ring-gold-400"
                  >
                    <Image
                      src={img.imageUrl}
                      alt={img.altText || product.name}
                      width={200}
                      height={200}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ═══ RIGHT: Details ═══ */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            {product.category && (
              <p className="text-[11px] uppercase tracking-[0.3em] text-gold-500">
                {product.category.name}
              </p>
            )}

            <h1 className="golden-divider mt-2 font-serif text-3xl font-medium text-charcoal sm:text-4xl">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-serif text-2xl font-medium text-charcoal">
                {formatPrice(Number(product.price))}
              </span>
              {hasDiscount && (
                <span className="text-sm text-charcoal/30 line-through">
                  {formatPrice(Number(product.compareAtPrice))}
                </span>
              )}
            </div>

            {product.shortDescription && (
              <p className="mt-5 text-sm leading-[1.8] text-charcoal/50">
                {product.shortDescription}
              </p>
            )}

            {/* Variants */}
            {product.variants.length > 0 && (
              <div className="mt-8">
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-charcoal/60">
                  Seçenekler
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      className="border border-gold-200 px-4 py-2 text-[12px] uppercase tracking-[0.1em] text-charcoal/70 transition-all duration-300 hover:border-gold-500 hover:text-gold-700"
                    >
                      {variant.name}
                      {Number(variant.priceModifier) > 0 &&
                        ` (+${formatPrice(Number(variant.priceModifier))})`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to cart */}
            <div className="mt-8">
              <AddToCartButton
                productId={product.id}
                name={product.name}
                price={Number(product.price)}
                image={primaryImage?.imageUrl}
                slug={product.slug}
              />
            </div>

            {/* Specs */}
            <div className="mt-10 space-y-0 border-t border-gold-100">
              {[
                { label: "Malzeme", value: product.material },
                { label: "Agirlik", value: product.weight },
                { label: "Boyutlar", value: product.dimensions },
                { label: "SKU", value: product.sku },
              ]
                .filter((spec) => spec.value)
                .map((spec) => (
                  <div
                    key={spec.label}
                    className="flex justify-between border-b border-gold-100/50 py-3.5 text-sm"
                  >
                    <span className="text-[11px] uppercase tracking-[0.15em] text-charcoal/40">
                      {spec.label}
                    </span>
                    <span className="text-charcoal/70">{spec.value}</span>
                  </div>
                ))}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-8">
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-charcoal/60">
                  Açıklama
                </h3>
                <div className="mt-3 text-sm leading-[1.8] text-charcoal/50">
                  {product.description}
                </div>
              </div>
            )}

            {/* Trust signals */}
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-gold-100 pt-8">
              {[
                { icon: "&#9670;", label: "7 İş Günü Kargo", sub: "Tüm siparişlerde" },
                { icon: "&#9671;", label: "Güvenli Ödeme", sub: "256-bit SSL" },
                { icon: "&#9674;", label: "925 Ayar", sub: "Kalite garantisi" },
              ].map((trust) => (
                <div key={trust.label} className="text-center">
                  <span
                    className="block text-lg text-gold-400"
                    dangerouslySetInnerHTML={{ __html: trust.icon }}
                  />
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.1em] text-charcoal/70">
                    {trust.label}
                  </p>
                  <p className="text-[9px] text-charcoal/35">{trust.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
