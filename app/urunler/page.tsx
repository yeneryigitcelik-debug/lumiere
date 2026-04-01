export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product/product-grid";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Koleksiyon",
  description: "by collection takı koleksiyonu. Kolyeler, yüzükler, bileklikler.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; page?: string }>;
}) {
  const params = await searchParams;
  const sort = params.sort || "newest";
  const page = parseInt(params.page || "1");
  const limit = 12;

  const orderBy: Record<string, string> = {};
  switch (sort) {
    case "price_asc":
      orderBy.price = "asc";
      break;
    case "price_desc":
      orderBy.price = "desc";
      break;
    default:
      orderBy.createdAt = "desc";
  }

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="pt-24">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold-500">
            Tüm Parçalar
          </p>
          <h1 className="golden-divider-center mt-3 font-serif text-4xl font-medium text-charcoal sm:text-5xl">
            Koleksiyon
          </h1>
        </div>

        {/* Category Filter */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/urunler"
            className="bg-charcoal px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-white"
          >
            Tümü
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/urunler/${cat.slug}`}
              className="border border-gold-200 px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-charcoal/60 transition-all duration-300 hover:border-gold-500 hover:text-gold-700"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/urunler?page=${p}&sort=${sort}`}
                className={`flex h-10 w-10 items-center justify-center text-[12px] transition-all duration-300 ${
                  p === page
                    ? "bg-charcoal text-white"
                    : "border border-gold-200 text-charcoal/50 hover:border-gold-500 hover:text-gold-700"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
