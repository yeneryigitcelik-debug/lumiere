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
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    district: "",
  });

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.fullName || !form.phone || !form.addressLine || !form.city) return;
    setSaving(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ title: "", fullName: "", phone: "", addressLine: "", city: "", district: "" });
        setShowForm(false);
        fetchAddresses();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/addresses?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-stone-900">
          Adreslerim
        </h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "İptal" : "Yeni Adres"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-lg border border-stone-200 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="title"
              placeholder="Adres Başlığı (Ev, İş...)"
              value={form.title}
              onChange={handleChange}
              required
            />
            <Input
              name="fullName"
              placeholder="Ad Soyad"
              value={form.fullName}
              onChange={handleChange}
              required
            />
            <Input
              name="phone"
              placeholder="Telefon"
              value={form.phone}
              onChange={handleChange}
              required
            />
            <Input
              name="city"
              placeholder="Şehir"
              value={form.city}
              onChange={handleChange}
              required
            />
            <Input
              name="district"
              placeholder="İlçe"
              value={form.district}
              onChange={handleChange}
            />
            <div className="sm:col-span-2">
              <Input
                name="addressLine"
                placeholder="Adres"
                value={form.addressLine}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </form>
      )}

      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton h-24 w-full" />
            ))}
          </div>
        ) : addresses.length === 0 && !showForm ? (
          <p className="text-stone-500">Henüz kayıtlı adresiniz yok.</p>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr.id}
              className="flex items-start justify-between rounded-lg border border-stone-200 p-4"
            >
              <div>
                <p className="font-medium text-stone-900">
                  {addr.title}
                  {addr.isDefault && (
                    <span className="ml-2 text-[10px] uppercase text-gold-500">Varsayılan</span>
                  )}
                </p>
                <p className="text-sm text-stone-600">{addr.fullName}</p>
                <p className="text-sm text-stone-500">{addr.addressLine}</p>
                <p className="text-sm text-stone-500">
                  {addr.district && `${addr.district}, `}
                  {addr.city}
                </p>
                <p className="text-sm text-stone-400">{addr.phone}</p>
              </div>
              <button
                onClick={() => handleDelete(addr.id)}
                className="text-stone-400 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
