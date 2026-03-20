export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

const statusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "info" | "gold" }> = {
  PENDING: { label: "Beklemede", variant: "warning" },
  PAID: { label: "Ödendi", variant: "info" },
  PREPARING: { label: "Hazırlanıyor", variant: "gold" },
  SHIPPED: { label: "Kargoda", variant: "info" },
  DELIVERED: { label: "Teslim Edildi", variant: "success" },
  CANCELLED: { label: "İptal", variant: "danger" },
  REFUNDED: { label: "İade Edildi", variant: "danger" },
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-charcoal">Siparişlerim</h1>
      <div className="mt-1 h-[0.5px] w-10 bg-gradient-to-r from-gold-400 to-transparent" />

      {orders.length === 0 ? (
        <div className="mt-12 text-center">
          <span className="block font-serif text-4xl text-gold-200">&#9670;</span>
          <p className="mt-3 text-sm text-charcoal/40">Henüz siparişiniz yok.</p>
          <Link href="/urunler" className="mt-4 inline-block text-[12px] uppercase tracking-[0.15em] text-gold-600 hover:text-gold-700">
            Alışverişe Başla &rarr;
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {orders.map((order) => {
            const status = statusMap[order.status] || statusMap.PENDING;
            return (
              <Link
                key={order.id}
                href={`/hesabim/siparislerim/${order.id}`}
                className="flex items-center justify-between border border-gold-100 p-5 transition-all hover:border-gold-300 hover:bg-gold-50/20"
              >
                <div>
                  <p className="font-serif text-sm font-medium text-charcoal">{order.orderNumber}</p>
                  <p className="mt-0.5 text-[11px] text-charcoal/40">
                    {order.createdAt.toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={status.variant}>{status.label}</Badge>
                  <span className="font-serif text-sm font-medium text-charcoal">
                    {formatPrice(Number(order.total))}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
