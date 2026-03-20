import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true } },
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Urun bulunamadi" }, { status: 404 });
  }

  return NextResponse.json(product);
}
