export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function AdminDashboard() {
  const [productCount, orderCount, totalRevenue, recentOrders] =
    await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "PREPARING", "SHIPPED", "DELIVERED"] } },
        _sum: { total: true },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

  const stats = [
    { label: "Toplam Urun", value: productCount.toString() },
    { label: "Toplam Siparis", value: orderCount.toString() },
    {
      label: "Toplam Gelir",
      value: formatPrice(Number(totalRevenue._sum.total || 0)),
    },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-stone-900">
        Dashboard
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-stone-200 p-4"
          >
            <p className="text-sm text-stone-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mt-8 text-lg font-medium text-stone-900">
        Son Siparisler
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left">
              <th className="pb-2 font-medium text-stone-500">Siparis No</th>
              <th className="pb-2 font-medium text-stone-500">Tutar</th>
              <th className="pb-2 font-medium text-stone-500">Durum</th>
              <th className="pb-2 font-medium text-stone-500">Tarih</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-b border-stone-100">
                <td className="py-2 font-medium">{order.orderNumber}</td>
                <td className="py-2">{formatPrice(Number(order.total))}</td>
                <td className="py-2">{order.status}</td>
                <td className="py-2">
                  {order.createdAt.toLocaleDateString("tr-TR")}
                </td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-stone-500">
                  Henuz siparis yok
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
