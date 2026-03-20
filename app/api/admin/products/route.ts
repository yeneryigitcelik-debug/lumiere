import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const categoriesOnly = request.nextUrl.searchParams.get("categoriesOnly");

  if (categoriesOnly) {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ categories });
  }

  const products = await prisma.product.findMany({
    include: { category: true, images: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await request.json();

  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug: slugify(body.name),
      description: body.description || null,
      shortDescription: body.shortDescription || null,
      price: body.price,
      compareAtPrice: body.compareAtPrice,
      sku: body.sku || null,
      stockQuantity: body.stockQuantity || 0,
      categoryId: body.categoryId,
      material: body.material || null,
      weight: body.weight || null,
      dimensions: body.dimensions || null,
      isFeatured: body.isFeatured || false,
      metaTitle: body.metaTitle || null,
      metaDescription: body.metaDescription || null,
    },
  });

  return NextResponse.json(product);
}

export async function PUT(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID gerekli" }, { status: 400 });

  const body = await request.json();

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: body.name,
      slug: slugify(body.name),
      description: body.description || null,
      shortDescription: body.shortDescription || null,
      price: body.price,
      compareAtPrice: body.compareAtPrice,
      sku: body.sku || null,
      stockQuantity: body.stockQuantity || 0,
      categoryId: body.categoryId,
      material: body.material || null,
      weight: body.weight || null,
      dimensions: body.dimensions || null,
      isFeatured: body.isFeatured || false,
      isActive: body.isActive ?? true,
      metaTitle: body.metaTitle || null,
      metaDescription: body.metaDescription || null,
    },
  });

  return NextResponse.json(product);
}

export async function DELETE(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID gerekli" }, { status: 400 });

  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
