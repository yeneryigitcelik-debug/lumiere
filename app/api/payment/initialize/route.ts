import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getIyzipay, createCheckoutFormRequest } from "@/lib/iyzico";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(request: Request) {
  const session = await auth();
  const body = await request.json();
  const { items, shippingAddress, billingAddress, customerNote, discountCode } =
    body;

  if (!items || items.length === 0) {
    return NextResponse.json(
      { error: "Sepet bos" },
      { status: 400 }
    );
  }

  // Validate products and calculate total
  let subtotal = 0;
  const basketItems = [];
  const orderItems = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: { category: true, variants: true },
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: `Urun bulunamadi: ${item.productId}` },
        { status: 400 }
      );
    }

    // Stock control
    if (item.variantId) {
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (variant && variant.stockQuantity < item.quantity) {
        return NextResponse.json(
          { error: `Stokta yeterli ürün yok: ${product.name} (${variant.name})` },
          { status: 400 }
        );
      }
    } else if (product.stockQuantity < item.quantity) {
      return NextResponse.json(
        { error: `Stokta yeterli ürün yok: ${product.name}` },
        { status: 400 }
      );
    }

    let unitPrice = Number(product.price);

    if (item.variantId) {
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (variant) {
        unitPrice += Number(variant.priceModifier);
      }
    }

    const totalPrice = unitPrice * item.quantity;
    subtotal += totalPrice;

    basketItems.push({
      id: product.id,
      name: product.name,
      category1: product.category?.name || "Taki",
      itemType: "PHYSICAL",
      price: totalPrice.toFixed(2),
    });

    orderItems.push({
      productId: product.id,
      variantId: item.variantId || null,
      productName: product.name,
      productImage: null,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
    });
  }

  // Apply discount
  let discountAmount = 0;
  if (discountCode) {
    const discount = await prisma.discountCode.findUnique({
      where: { code: discountCode },
    });

    if (
      discount &&
      discount.isActive &&
      (!discount.expiresAt || discount.expiresAt > new Date()) &&
      (!discount.maxUses || discount.currentUses < discount.maxUses) &&
      subtotal >= Number(discount.minOrderAmount)
    ) {
      if (discount.discountType === "PERCENTAGE") {
        discountAmount = subtotal * (Number(discount.discountValue) / 100);
      } else {
        discountAmount = Number(discount.discountValue);
      }
    }
  }

  const shippingCost = subtotal >= 500 ? 0 : 29.9;
  const total = subtotal - discountAmount + shippingCost;
  const orderNumber = generateOrderNumber();

  // Create order in DB
  const order = await prisma.order.create({
    data: {
      userId: session?.user?.id || null,
      orderNumber,
      subtotal,
      shippingCost,
      discountAmount,
      total,
      customerEmail: shippingAddress.email || session?.user?.email || "",
      customerPhone: shippingAddress.phone,
      customerNote,
      discountCode: discountCode || null,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      items: {
        create: orderItems,
      },
    },
  });

  // Initialize iyzico CheckoutForm
  const checkoutFormRequest = createCheckoutFormRequest({
    conversationId: order.id,
    price: subtotal.toFixed(2),
    paidPrice: total.toFixed(2),
    basketItems,
    buyer: {
      id: session?.user?.id || "guest",
      name: shippingAddress.fullName.split(" ")[0] || "Ad",
      surname: shippingAddress.fullName.split(" ").slice(1).join(" ") || "Soyad",
      email: shippingAddress.email || session?.user?.email || "",
      identityNumber: "11111111111",
      registrationAddress: shippingAddress.addressLine,
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          "127.0.0.1",
      city: shippingAddress.city,
      country: "Turkey",
    },
    shippingAddress: {
      contactName: shippingAddress.fullName,
      city: shippingAddress.city,
      country: "Turkey",
      address: shippingAddress.addressLine,
    },
    billingAddress: {
      contactName: shippingAddress.fullName,
      city: shippingAddress.city,
      country: "Turkey",
      address: shippingAddress.addressLine,
    },
    callbackUrl: `${process.env.NEXTAUTH_URL}/api/payment/callback`,
  });

  return new Promise<Response>((resolve) => {
    getIyzipay().checkoutFormInitialize.create(
      checkoutFormRequest,
      (err: unknown, result: Record<string, unknown>) => {
        if (err) {
          resolve(
            NextResponse.json({ error: "Odeme baslatilamadi" }, { status: 500 })
          );
          return;
        }

        resolve(
          NextResponse.json({
            paymentPageUrl: result.paymentPageUrl,
            token: result.token,
            orderNumber: order.orderNumber,
          })
        );
      }
    );
  });
}
