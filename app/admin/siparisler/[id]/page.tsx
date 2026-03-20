import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { OrderStatusForm } from "@/components/admin/order-status-form";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!order) notFound();

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="font-serif text-2xl font-semibold text-stone-900">
          Siparis #{order.orderNumber}
        </h1>
        <Badge>{order.status}</Badge>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="font-medium text-stone-900">Urunler</h2>
          <div className="mt-3 space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between rounded-md border border-stone-200 p-3">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-stone-500">Adet: {item.quantity}</p>
                </div>
                <p className="font-medium">{formatPrice(Number(item.totalPrice))}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-1 text-sm">
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
                <span className="text-green-600">-{formatPrice(Number(order.discountAmount))}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-stone-200 pt-2 font-semibold">
              <span>Toplam</span>
              <span>{formatPrice(Number(order.total))}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="font-medium text-stone-900">Musteri Bilgileri</h2>
            <div className="mt-2 text-sm text-stone-600">
              <p>{order.user?.name || "Misafir"}</p>
              <p>{order.customerEmail}</p>
              {order.customerPhone && <p>{order.customerPhone}</p>}
            </div>
          </div>

          <div>
            <h2 className="font-medium text-stone-900">Teslimat Adresi</h2>
            <div className="mt-2 text-sm text-stone-600">
              {typeof order.shippingAddress === "object" && order.shippingAddress && (
                <>
                  <p>{(order.shippingAddress as Record<string, string>).fullName}</p>
                  <p>{(order.shippingAddress as Record<string, string>).addressLine}</p>
                  <p>{(order.shippingAddress as Record<string, string>).city}</p>
                </>
              )}
            </div>
          </div>

          <OrderStatusForm
            orderId={order.id}
            currentStatus={order.status}
            trackingNumber={order.trackingNumber || ""}
            cargoCompany={order.cargoCompany || ""}
          />
        </div>
      </div>
    </div>
  );
}
