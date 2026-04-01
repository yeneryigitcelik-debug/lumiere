export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product/product-grid";
import { HeroExperience } from "@/components/hero/hero-experience";

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: {
        images: true,
        category: { select: { id: true, name: true, slug: true } },
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <>
      {/* ═══ HERO - Apple-style scroll-driven 3D experience ═══ */}
      <HeroExperience />

      {/* ═══ CATEGORIES ═══ */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.3em] text-gold-500">
              Koleksiyonlarımız
            </p>
            <h2 className="golden-divider-center mt-3 font-serif text-3xl font-medium text-charcoal sm:text-4xl">
              Kategoriler
            </h2>
          </div>

          <div className="stagger-children mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/urunler/${category.slug}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-sm bg-gradient-to-br from-gold-50 to-gold-100"
              >
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-charcoal/0 transition-all duration-700 group-hover:bg-charcoal/80" />

                {/* Default state */}
                <div className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 group-hover:opacity-0">
                  <span className="font-serif text-3xl text-gold-300">&#9670;</span>
                  <span className="mt-3 text-[12px] font-medium uppercase tracking-[0.15em] text-charcoal/70">
                    {category.name}
                  </span>
                </div>

                {/* Hover state */}
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <span className="font-serif text-lg font-medium text-white">
                    {category.name}
                  </span>
                  <span className="mt-2 text-[10px] uppercase tracking-[0.2em] text-gold-400">
                    Keşfet &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══ FEATURED PRODUCTS ═══ */}
      <section className="border-y border-gold-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-gold-500">
                Seçilmiş Parçalar
              </p>
              <h2 className="golden-divider mt-3 font-serif text-3xl font-medium text-charcoal sm:text-4xl">
                Çok Satanlar
              </h2>
            </div>
            <Link
              href="/urunler"
              className="group flex items-center gap-2 text-[12px] uppercase tracking-[0.15em] text-charcoal/50 transition-colors hover:text-gold-600"
            >
              Tümünü Gör
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                &rarr;
              </span>
            </Link>
          </div>

          <div className="mt-12">
            <ProductGrid
              products={featuredProducts.map((p) => ({
                ...p,
                price: Number(p.price),
                compareAtPrice: p.compareAtPrice
                  ? Number(p.compareAtPrice)
                  : null,
              }))}
            />
          </div>
        </div>
      </section>

      {/* ═══ BRAND STORY ═══ */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-gold-500">
              Hikâyemiz
            </p>
            <h2 className="golden-divider mt-3 font-serif text-3xl font-medium text-charcoal sm:text-4xl">
              Işık ve Zarafet
            </h2>
            <p className="mt-8 text-sm leading-[1.8] text-charcoal/50">
              by collection, benzersiz ve zarif takılarla lüks ve özel bir deneyim
              sunmayı amaçlar. Her bir parçamız, usta zanaatkârların ellerinde özenle
              şekillendirilir.
            </p>
            <p className="mt-4 text-sm leading-[1.8] text-charcoal/50">
              925 ayar gümüş, zirkon taş ve özel kaplama teknikleriyle üretilen
              koleksiyonlarımız, kaliteyi ve zarafeti bir arada sunar.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-8">
              {[
                { value: "100%", label: "El Yapimi" },
                { value: "500+", label: "Mutlu Musteri" },
                { value: "50+", label: "Benzersiz Tasarim" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-serif text-2xl font-medium text-gold-600 sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-charcoal/40">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-gradient-to-br from-gold-50 via-gold-100 to-cream">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="block font-serif text-[120px] leading-none text-gold-200/50">
                  bc
                </span>
                <div className="mt-4 h-[0.5px] w-20 mx-auto bg-gradient-to-r from-transparent via-gold-300 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="noise-overlay relative overflow-hidden bg-charcoal py-24 text-center text-white">
        <div className="relative z-10 mx-auto max-w-2xl px-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold-400">
            Özel Tasarımlar
          </p>
          <h2 className="mt-4 font-serif text-3xl font-medium sm:text-4xl">
            Hayalinizdeki Takıyı
            <br />
            <span className="italic text-gold-400">Birlikte</span> Tasarlayalım
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-white/40">
            Özel sipariş ile size özel, tek ve benzersiz bir takı yaratıyoruz.
            Fikirlerinizi bize anlatın.
          </p>
          <Link
            href="/iletisim"
            className="mt-8 inline-flex items-center gap-2 border border-gold-500/30 px-8 py-3.5 text-[12px] uppercase tracking-[0.2em] text-gold-400 transition-all duration-500 hover:border-gold-400 hover:bg-gold-400 hover:text-charcoal"
          >
            İletişime Geçin
            <span>&rarr;</span>
          </Link>
        </div>

        {/* Decorative */}
        <div className="absolute left-1/2 top-0 h-20 w-[0.5px] -translate-x-1/2 bg-gradient-to-b from-gold-500/30 to-transparent" />
        <div className="absolute bottom-0 left-1/2 h-20 w-[0.5px] -translate-x-1/2 bg-gradient-to-t from-gold-500/30 to-transparent" />
      </section>
    </>
  );
}
