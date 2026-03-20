import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIyzipay } from "@/lib/iyzico";

export async function POST(request: Request) {
  const body = await request.formData();
  const token = body.get("token") as string;

  if (!token) {
    return NextResponse.redirect(
      new URL("/odeme/basarisiz", process.env.NEXTAUTH_URL!)
    );
  }

  return new Promise<Response>((resolve) => {
    getIyzipay().checkoutForm.retrieve(
      { locale: "tr", token },
      async (err: unknown, result: Record<string, unknown>) => {
        if (err || result.status !== "success") {
          resolve(
            NextResponse.redirect(
              new URL("/odeme/basarisiz", process.env.NEXTAUTH_URL!)
            )
          );
          return;
        }

        const conversationId = result.conversationId as string;

        await prisma.order.update({
          where: { id: conversationId },
          data: {
            status: "PAID",
            iyzicoPaymentId: result.paymentId as string,
            iyzicoConversationId: conversationId,
            iyzicoFraudStatus: result.fraudStatus as number,
            paymentMethod: "iyzico",
            installment: (result.installment as number) || 1,
            paidAt: new Date(),
          },
        });

        // Update discount code usage
        const order = await prisma.order.findUnique({
          where: { id: conversationId },
        });

        if (order?.discountCode) {
          await prisma.discountCode.update({
            where: { code: order.discountCode },
            data: { currentUses: { increment: 1 } },
          });
        }

        const redirectUrl = new URL(
          `/odeme/basarili?siparis=${order?.orderNumber}`,
          process.env.NEXTAUTH_URL!
        );

        resolve(NextResponse.redirect(redirectUrl));
      }
    );
  });
}
