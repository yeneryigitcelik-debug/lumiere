"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const statuses = [
  "PENDING",
  "PAID",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

interface OrderStatusFormProps {
  orderId: string;
  currentStatus: string;
  trackingNumber: string;
  cargoCompany: string;
}

export function OrderStatusForm({
  orderId,
  currentStatus,
  trackingNumber: initialTracking,
  cargoCompany: initialCargo,
}: OrderStatusFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [trackingNumber, setTrackingNumber] = useState(initialTracking);
  const [cargoCompany, setCargoCompany] = useState(initialCargo);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await fetch(`/api/admin/orders?id=${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, trackingNumber, cargoCompany }),
    });

    setLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-stone-200 p-4">
      <h3 className="font-medium text-stone-900">Durumu Guncelle</h3>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <Input
        placeholder="Kargo Takip No"
        value={trackingNumber}
        onChange={(e) => setTrackingNumber(e.target.value)}
      />

      <Input
        placeholder="Kargo Sirketi"
        value={cargoCompany}
        onChange={(e) => setCargoCompany(e.target.value)}
      />

      <Button type="submit" disabled={loading}>
        {loading ? "Kaydediliyor..." : "Guncelle"}
      </Button>
    </form>
  );
}
