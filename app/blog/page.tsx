export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "by collection blog yazıları, takı bakım ipuçları ve daha fazlası.",
};

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    include: { author: { select: { name: true } } },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="noise-overlay relative overflow-hidden bg-charcoal py-20">
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.4em] text-gold-400">
            Ilham &amp; Bilgi
          </p>
          <h1 className="mt-4 font-serif text-4xl font-medium text-white">Blog</h1>
          <div className="mx-auto mt-4 h-[0.5px] w-12 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-16">
        {posts.length === 0 ? (
          <div className="py-16 text-center">
            <span className="block font-serif text-5xl text-gold-200">&#9670;</span>
            <p className="mt-4 text-sm text-charcoal/40">Henüz blog yazısı bulunmuyor.</p>
          </div>
        ) : (
          <div className="stagger-children grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                <div className="luxury-image-hover aspect-video overflow-hidden bg-gold-50">
                  {post.coverImage && (
                    <Image src={post.coverImage} alt={post.title} width={600} height={340} className="h-full w-full object-cover" />
                  )}
                </div>
                <h2 className="mt-4 font-serif text-lg font-medium text-charcoal transition-colors group-hover:text-gold-700">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="mt-1.5 text-sm text-charcoal/40 line-clamp-2">{post.excerpt}</p>
                )}
                <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-gold-400">
                  {post.publishedAt?.toLocaleDateString("tr-TR")}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
