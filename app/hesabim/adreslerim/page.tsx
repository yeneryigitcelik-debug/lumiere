"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

interface Address {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  district?: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    district: "",
  });

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then(() => {
        // addresses would be fetched from a separate API
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-stone-900">
          Adreslerim
        </h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Iptal" : "Yeni Adres"}
        </Button>
      </div>

      {showForm && (
        <form className="mt-6 space-y-4 rounded-lg border border-stone-200 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="title"
              placeholder="Adres Basligi (Ev, Is...)"
              value={form.title}
              onChange={handleChange}
            />
            <Input
              name="fullName"
              placeholder="Ad Soyad"
              value={form.fullName}
              onChange={handleChange}
            />
            <Input
              name="phone"
              placeholder="Telefon"
              value={form.phone}
              onChange={handleChange}
            />
            <Input
              name="city"
              placeholder="Sehir"
              value={form.city}
              onChange={handleChange}
            />
            <Input
              name="district"
              placeholder="Ilce"
              value={form.district}
              onChange={handleChange}
            />
            <div className="sm:col-span-2">
              <Input
                name="addressLine"
                placeholder="Adres"
                value={form.addressLine}
                onChange={handleChange}
              />
            </div>
          </div>
          <Button type="submit">Kaydet</Button>
        </form>
      )}

      <div className="mt-6 space-y-4">
        {addresses.length === 0 && !showForm && (
          <p className="text-stone-500">Henuz kayitli adresiniz yok.</p>
        )}
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="flex items-start justify-between rounded-lg border border-stone-200 p-4"
          >
            <div>
              <p className="font-medium text-stone-900">{addr.title}</p>
              <p className="text-sm text-stone-600">{addr.fullName}</p>
              <p className="text-sm text-stone-500">{addr.addressLine}</p>
              <p className="text-sm text-stone-500">
                {addr.district && `${addr.district}, `}
                {addr.city}
              </p>
            </div>
            <button className="text-stone-400 hover:text-red-500">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
