export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

const statusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }> = {
  PENDING: { label: "Beklemede", variant: "warning" },
  PAID: { label: "Odendi", variant: "info" },
  PREPARING: { label: "Hazirlaniyor", variant: "info" },
  SHIPPED: { label: "Kargoda", variant: "info" },
  DELIVERED: { label: "Teslim Edildi", variant: "success" },
  CANCELLED: { label: "Iptal", variant: "danger" },
  REFUNDED: { label: "Iade", variant: "danger" },
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      items: true,
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-stone-900">
        Siparisler
      </h1>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left">
              <th className="pb-2 font-medium text-stone-500">Siparis No</th>
              <th className="pb-2 font-medium text-stone-500">Musteri</th>
              <th className="pb-2 font-medium text-stone-500">Tutar</th>
              <th className="pb-2 font-medium text-stone-500">Durum</th>
              <th className="pb-2 font-medium text-stone-500">Tarih</th>
              <th className="pb-2 font-medium text-stone-500"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const status = statusMap[order.status] || statusMap.PENDING;
              return (
                <tr key={order.id} className="border-b border-stone-100">
                  <td className="py-3 font-medium">{order.orderNumber}</td>
                  <td className="py-3 text-stone-500">
                    {order.user?.name || order.customerEmail}
                  </td>
                  <td className="py-3">{formatPrice(Number(order.total))}</td>
                  <td className="py-3">
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </td>
                  <td className="py-3">
                    {order.createdAt.toLocaleDateString("tr-TR")}
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/admin/siparisler/${order.id}`}
                      className="text-stone-600 hover:underline"
                    >
                      Detay
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
