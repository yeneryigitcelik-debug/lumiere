import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/giris");

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id, userId: session.user.id },
    include: { items: true },
  });

  if (!order) notFound();

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-stone-900">
        Siparis #{order.orderNumber}
      </h1>

      <div className="mt-4">
        <Badge>{order.status}</Badge>
      </div>

      <div className="mt-6 space-y-3">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between rounded-md border border-stone-200 p-3"
          >
            <div>
              <p className="font-medium text-stone-900">{item.productName}</p>
              <p className="text-sm text-stone-500">Adet: {item.quantity}</p>
            </div>
            <p className="font-medium">{formatPrice(Number(item.totalPrice))}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-2 border-t border-stone-200 pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-stone-500">Ara Toplam</span>
          <span>{formatPrice(Number(order.subtotal))}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">Kargo</span>
          <span>{formatPrice(Number(order.shippingCost))}</span>
        </div>
        {Number(order.discountAmount) > 0 && (
          <div className="flex justify-between">
            <span className="text-stone-500">Indirim</span>
            <span className="text-green-600">
              -{formatPrice(Number(order.discountAmount))}
            </span>
          </div>
        )}
        <div className="flex justify-between border-t border-stone-200 pt-2 font-semibold">
          <span>Toplam</span>
          <span>{formatPrice(Number(order.total))}</span>
        </div>
      </div>

      {order.trackingNumber && (
        <div className="mt-6 rounded-md bg-stone-50 p-4">
          <p className="text-sm text-stone-500">Kargo Takip No</p>
          <p className="font-medium text-stone-900">{order.trackingNumber}</p>
          {order.cargoCompany && (
            <p className="text-sm text-stone-500">{order.cargoCompany}</p>
          )}
        </div>
      )}
    </div>
  );
}
