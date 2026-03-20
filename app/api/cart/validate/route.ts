import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { items } = await request.json();

  if (!items || !Array.isArray(items)) {
    return NextResponse.json({ error: "Gecersiz sepet" }, { status: 400 });
  }

  const errors: string[] = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: { variants: true },
    });

    if (!product || !product.isActive) {
      errors.push(`${item.name || item.productId} artik mevcut degil`);
      continue;
    }

    if (item.variantId) {
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant || !variant.isActive) {
        errors.push(`${product.name} - secenek mevcut degil`);
        continue;
      }
      if (variant.stockQuantity < item.quantity) {
        errors.push(`${product.name} - ${variant.name} stokta yeterli degil`);
      }
    } else if (product.stockQuantity < item.quantity) {
      errors.push(`${product.name} stokta yeterli degil`);
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ valid: false, errors }, { status: 400 });
  }

  return NextResponse.json({ valid: true });
}
