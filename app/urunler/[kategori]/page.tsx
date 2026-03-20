import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product/product-grid";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kategori: string }>;
}): Promise<Metadata> {
  const { kategori } = await params;
  const category = await prisma.category.findUnique({
    where: { slug: kategori },
  });

  if (!category) return {};

  return {
    title: category.name,
    description: category.description || `${category.name} koleksiyonu`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ kategori: string }>;
}) {
  const { kategori } = await params;

  const [category, categories] = await Promise.all([
    prisma.category.findUnique({ where: { slug: kategori } }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  if (!category) notFound();

  const products = await prisma.product.findMany({
    where: { isActive: true, categoryId: category.id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="pt-24">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold-500">
            Koleksiyon
          </p>
          <h1 className="golden-divider-center mt-3 font-serif text-4xl font-medium text-charcoal sm:text-5xl">
            {category.name}
          </h1>
          {category.description && (
            <p className="mx-auto mt-6 max-w-md text-sm text-charcoal/40">
              {category.description}
            </p>
          )}
        </div>

        {/* Category Filter */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/urunler"
            className="border border-gold-200 px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-charcoal/60 transition-all duration-300 hover:border-gold-500 hover:text-gold-700"
          >
            Tümü
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/urunler/${cat.slug}`}
              className={`px-4 py-2 text-[11px] uppercase tracking-[0.15em] transition-all duration-300 ${
                cat.id === category.id
                  ? "bg-charcoal text-white"
                  : "border border-gold-200 text-charcoal/60 hover:border-gold-500 hover:text-gold-700"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Products */}
        <div className="mt-14">
          <ProductGrid
            products={products.map((p) => ({
              ...p,
              price: Number(p.price),
              compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
