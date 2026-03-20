"use client";

import { useState } from "react";
import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    addressLine: "",
    city: "",
    district: "",
    zipCode: "",
    customerNote: "",
    discountCode: "",
  });

  const subtotal = totalPrice();
  const shipping = subtotal >= 500 ? 0 : 29.9;
  const total = subtotal + shipping;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          shippingAddress: {
            fullName: form.fullName,
            email: form.email,
            phone: form.phone,
            addressLine: form.addressLine,
            city: form.city,
            district: form.district,
            zipCode: form.zipCode,
          },
          customerNote: form.customerNote,
          discountCode: form.discountCode || undefined,
        }),
      });

      const data = await res.json();

      if (data.paymentPageUrl) {
        clearCart();
        window.location.href = data.paymentPageUrl;
      } else {
        alert(data.error || "Ödeme başlatılamadı");
      }
    } catch {
      alert("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center pt-24">
        <div className="text-center">
          <span className="block font-serif text-5xl text-gold-200">&#9670;</span>
          <h1 className="mt-4 font-serif text-2xl font-medium text-charcoal">
            Sepetiniz Boş
          </h1>
          <Link href="/urunler" className="mt-6 inline-block text-[12px] uppercase tracking-[0.15em] text-gold-600 hover:text-gold-700">
            &larr; Alışverişe Başla
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold-500">
            Güvenli Ödeme
          </p>
          <h1 className="golden-divider-center mt-3 font-serif text-3xl font-medium text-charcoal">
            Ödeme
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-12 grid gap-12 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div>
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-charcoal/60">
                Teslimat Bilgileri
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Input name="fullName" placeholder="Ad Soyad" value={form.fullName} onChange={handleChange} required />
                <Input name="email" type="email" placeholder="E-posta" value={form.email} onChange={handleChange} required />
                <Input name="phone" placeholder="Telefon" value={form.phone} onChange={handleChange} required />
                <Input name="city" placeholder="Şehir" value={form.city} onChange={handleChange} required />
                <Input name="district" placeholder="İlçe" value={form.district} onChange={handleChange} />
                <Input name="zipCode" placeholder="Posta Kodu" value={form.zipCode} onChange={handleChange} />
                <div className="sm:col-span-2">
                  <Input name="addressLine" placeholder="Adres" value={form.addressLine} onChange={handleChange} required />
                </div>
                <div className="sm:col-span-2">
                  <textarea
                    name="customerNote"
                    placeholder="Sipariş notu (opsiyonel)"
                    value={form.customerNote}
                    onChange={handleChange}
                    className="flex w-full border border-gold-200 bg-white px-3 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-charcoal/60">
                İndirim Kodu
              </h2>
              <div className="mt-3 flex gap-2">
                <Input name="discountCode" placeholder="Kupon kodu" value={form.discountCode} onChange={handleChange} />
                <Button type="button" variant="outline">Uygula</Button>
              </div>
            </div>
          </div>

          {/* Özet */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="border border-gold-100 bg-gold-50/30 p-8">
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-charcoal/60">
                Sipariş Özeti
              </h2>

              <div className="mt-5 space-y-3">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId}`} className="flex justify-between text-sm">
                    <span className="text-charcoal/50">
                      {item.name} <span className="text-charcoal/30">x{item.quantity}</span>
                    </span>
                    <span className="text-charcoal">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2 border-t border-gold-200/50 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-charcoal/40">Ara Toplam</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal/40">Kargo</span>
                  <span>{shipping === 0 ? <span className="text-gold-600">Ücretsiz</span> : formatPrice(shipping)}</span>
                </div>
              </div>

              <div className="mt-4 flex justify-between border-t border-gold-200/50 pt-4">
                <span className="text-[11px] uppercase tracking-[0.15em] text-charcoal/60">Toplam</span>
                <span className="font-serif text-xl font-medium text-charcoal">{formatPrice(total)}</span>
              </div>

              <Button type="submit" className="mt-6 w-full" size="lg" disabled={loading}>
                {loading ? "İşlem yapılıyor..." : "Ödemeye Geç"}
              </Button>

              <p className="mt-4 text-center text-[9px] text-charcoal/30">
                256 Bit SSL ile güvenli ödeme
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
