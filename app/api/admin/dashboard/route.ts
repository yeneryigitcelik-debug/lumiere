import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const [productCount, orderCount, customerCount, totalRevenue] =
    await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "PREPARING", "SHIPPED", "DELIVERED"] } },
        _sum: { total: true },
      }),
    ]);

  return NextResponse.json({
    productCount,
    orderCount,
    customerCount,
    totalRevenue: Number(totalRevenue._sum.total || 0),
  });
}
