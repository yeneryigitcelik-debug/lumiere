import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const posts = await prisma.blogPost.findMany({
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await request.json();

  const post = await prisma.blogPost.create({
    data: {
      title: body.title,
      slug: slugify(body.title),
      content: body.content,
      excerpt: body.excerpt || null,
      coverImage: body.coverImage || null,
      authorId: session.user.id,
      status: body.status || "DRAFT",
      publishedAt: body.status === "PUBLISHED" ? new Date() : null,
      metaTitle: body.metaTitle || null,
      metaDescription: body.metaDescription || null,
      tags: body.tags || [],
    },
  });

  return NextResponse.json(post);
}

export async function PUT(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID gerekli" }, { status: 400 });

  const body = await request.json();

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      title: body.title,
      slug: slugify(body.title),
      content: body.content,
      excerpt: body.excerpt || null,
      coverImage: body.coverImage || null,
      status: body.status || "DRAFT",
      publishedAt: body.status === "PUBLISHED" ? new Date() : null,
      metaTitle: body.metaTitle || null,
      metaDescription: body.metaDescription || null,
      tags: body.tags || [],
    },
  });

  return NextResponse.json(post);
}

export async function DELETE(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID gerekli" }, { status: 400 });

  await prisma.blogPost.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
