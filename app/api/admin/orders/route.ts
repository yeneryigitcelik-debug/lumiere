import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const orders = await prisma.order.findMany({
    include: { items: true, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}

export async function PUT(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID gerekli" }, { status: 400 });

  const body = await request.json();

  const updateData: Record<string, unknown> = {};

  if (body.status) {
    updateData.status = body.status;
    if (body.status === "SHIPPED") updateData.shippedAt = new Date();
    if (body.status === "DELIVERED") updateData.deliveredAt = new Date();
  }

  if (body.trackingNumber) updateData.trackingNumber = body.trackingNumber;
  if (body.cargoCompany) updateData.cargoCompany = body.cargoCompany;

  const order = await prisma.order.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(order);
}
