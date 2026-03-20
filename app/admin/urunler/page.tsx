export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: { select: { name: true } },
      images: { where: { isPrimary: true }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-stone-900">
          Urunler
        </h1>
        <Link href="/admin/urunler/yeni">
          <Button>Yeni Urun</Button>
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left">
              <th className="pb-2 font-medium text-stone-500">Urun</th>
              <th className="pb-2 font-medium text-stone-500">Kategori</th>
              <th className="pb-2 font-medium text-stone-500">Fiyat</th>
              <th className="pb-2 font-medium text-stone-500">Stok</th>
              <th className="pb-2 font-medium text-stone-500">Durum</th>
              <th className="pb-2 font-medium text-stone-500"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-stone-100">
                <td className="py-3 font-medium text-stone-900">
                  {product.name}
                </td>
                <td className="py-3 text-stone-500">
                  {product.category?.name || "-"}
                </td>
                <td className="py-3">{formatPrice(Number(product.price))}</td>
                <td className="py-3">{product.stockQuantity}</td>
                <td className="py-3">
                  <Badge variant={product.isActive ? "success" : "default"}>
                    {product.isActive ? "Aktif" : "Pasif"}
                  </Badge>
                </td>
                <td className="py-3">
                  <Link
                    href={`/admin/urunler/${product.id}`}
                    className="text-sm text-stone-600 hover:text-stone-900 hover:underline"
                  >
                    Duzenle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
