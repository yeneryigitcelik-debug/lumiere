export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-stone-900">
          Blog Yazilari
        </h1>
        <Link href="/admin/blog/yeni">
          <Button>Yeni Yazi</Button>
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left">
              <th className="pb-2 font-medium text-stone-500">Baslik</th>
              <th className="pb-2 font-medium text-stone-500">Yazar</th>
              <th className="pb-2 font-medium text-stone-500">Durum</th>
              <th className="pb-2 font-medium text-stone-500">Tarih</th>
              <th className="pb-2 font-medium text-stone-500"></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-stone-100">
                <td className="py-3 font-medium">{post.title}</td>
                <td className="py-3 text-stone-500">{post.author?.name || "-"}</td>
                <td className="py-3">
                  <Badge variant={post.status === "PUBLISHED" ? "success" : "default"}>
                    {post.status === "PUBLISHED" ? "Yayinda" : "Taslak"}
                  </Badge>
                </td>
                <td className="py-3">{post.createdAt.toLocaleDateString("tr-TR")}</td>
                <td className="py-3">
                  <Link href={`/admin/blog/${post.id}`} className="text-stone-600 hover:underline">
                    Duzenle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
