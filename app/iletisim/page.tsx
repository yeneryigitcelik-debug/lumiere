"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="noise-overlay relative overflow-hidden bg-charcoal py-20">
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.4em] text-gold-400">
            Bize Ulaşın
          </p>
          <h1 className="mt-4 font-serif text-4xl font-medium text-white">
            İletişim
          </h1>
          <div className="mx-auto mt-4 h-[0.5px] w-12 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2">
          {/* Bilgiler */}
          <div>
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-gold-500">
              İletişim Bilgileri
            </h2>
            <div className="mt-6 space-y-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-charcoal/40">Telefon</p>
                <p className="mt-1 text-sm text-charcoal">+90 531 961 42 54</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-charcoal/40">E-posta</p>
                <p className="mt-1 text-sm text-charcoal">info@lumiereand.com</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-charcoal/40">Sosyal Medya</p>
                <p className="mt-1 text-sm text-charcoal">@lumiere.andco</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-charcoal/40">Çalışma Saatleri</p>
                <p className="mt-1 text-sm text-charcoal">Pazartesi - Cuma: 09:00 - 18:00</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-gold-500">
              Mesaj Gönderin
            </h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {status === "success" && (
                <p className="border border-green-200 bg-green-50 px-4 py-3 text-[12px] text-green-700">
                  Mesajınız başarıyla gönderildi!
                </p>
              )}
              {status === "error" && (
                <p className="border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-600">
                  Bir hata oluştu, lütfen tekrar deneyin.
                </p>
              )}
              <Input name="name" placeholder="Adınız" value={form.name} onChange={handleChange} required />
              <Input name="email" type="email" placeholder="E-posta adresiniz" value={form.email} onChange={handleChange} required />
              <textarea
                name="message"
                placeholder="Mesajınız"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className="flex w-full border border-gold-200 bg-white px-3 py-2.5 text-sm text-charcoal placeholder:text-charcoal/30 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
              <Button type="submit" className="w-full" size="lg" disabled={status === "loading"}>
                {status === "loading" ? "Gönderiliyor..." : "Gönder"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
