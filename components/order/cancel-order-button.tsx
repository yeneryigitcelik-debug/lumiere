"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    if (!confirm("Siparişi iptal etmek istediğinize emin misiniz?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?action=cancel&id=${orderId}`, {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Sipariş iptal edilemedi");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <button
        onClick={handleCancel}
        disabled={loading}
        className="border border-red-200 px-4 py-2 text-[12px] uppercase tracking-[0.1em] text-red-500 transition-all hover:bg-red-50 disabled:opacity-50"
      >
        {loading ? "İptal ediliyor..." : "Siparişi İptal Et"}
      </button>
    </div>
  );
}
