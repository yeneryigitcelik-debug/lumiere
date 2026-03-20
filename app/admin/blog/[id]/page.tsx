import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BlogEditForm } from "@/components/admin/blog-edit-form";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { id },
  });

  if (!post) notFound();

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-stone-900">
        Yazi Duzenle: {post.title}
      </h1>
      <BlogEditForm post={post} />
    </div>
  );
}
