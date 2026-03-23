import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: { title: true, metaTitle: true, metaDescription: true, excerpt: true },
  });

  if (!post) return {};

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || "",
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: { author: { select: { name: true } } },
  });

  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      {post.coverImage && (
        <div className="aspect-video overflow-hidden rounded-lg">
          <Image
            src={post.coverImage}
            alt={post.title}
            width={800}
            height={450}
            className="h-full w-full object-cover"
            priority
          />
        </div>
      )}

      <h1 className="mt-6 font-serif text-3xl font-semibold text-stone-900 sm:text-4xl">
        {post.title}
      </h1>

      <div className="mt-3 flex items-center gap-3 text-sm text-stone-500">
        {post.author?.name && <span>{post.author.name}</span>}
        {post.publishedAt && (
          <span>{post.publishedAt.toLocaleDateString("tr-TR")}</span>
        )}
      </div>

      {post.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="prose prose-stone mt-8 max-w-none">
        <div
          dangerouslySetInnerHTML={{
            __html: post.content
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
              .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
              .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
              .replace(/javascript\s*:/gi, ""),
          }}
        />
      </div>
    </article>
  );
}
