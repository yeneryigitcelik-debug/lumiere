import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { code, subtotal } = await request.json();

  if (!code) {
    return NextResponse.json({ error: "Kupon kodu gerekli" }, { status: 400 });
  }

  const discount = await prisma.discountCode.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!discount || !discount.isActive) {
    return NextResponse.json({ error: "Gecersiz kupon kodu" }, { status: 404 });
  }

  if (discount.expiresAt && discount.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Kupon kodunun suresi dolmus" },
      { status: 400 }
    );
  }

  if (discount.maxUses && discount.currentUses >= discount.maxUses) {
    return NextResponse.json(
      { error: "Kupon kodu kullanim limitine ulasmis" },
      { status: 400 }
    );
  }

  if (subtotal && subtotal < Number(discount.minOrderAmount)) {
    return NextResponse.json(
      {
        error: `Minimum siparis tutari ${Number(discount.minOrderAmount)} TL`,
      },
      { status: 400 }
    );
  }

  let discountAmount = 0;
  if (discount.discountType === "PERCENTAGE") {
    discountAmount = (subtotal || 0) * (Number(discount.discountValue) / 100);
  } else {
    discountAmount = Number(discount.discountValue);
  }

  return NextResponse.json({
    valid: true,
    code: discount.code,
    discountType: discount.discountType,
    discountValue: Number(discount.discountValue),
    discountAmount,
  });
}
