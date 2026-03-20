"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Kayıt yapılamadı");
        return;
      }

      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      window.location.href = "/";
    } catch {
      setError("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6 pt-24">
      <div className="w-full max-w-md">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold-500">
            Yeni Hesap
          </p>
          <h1 className="golden-divider-center mt-3 font-serif text-3xl font-medium text-charcoal">
            Kayıt Ol
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          {error && (
            <p className="border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-600">
              {error}
            </p>
          )}

          <div>
            <label className="text-[11px] uppercase tracking-[0.15em] text-charcoal/60">
              Ad Soyad
            </label>
            <Input name="name" value={form.name} onChange={handleChange} required className="mt-1.5" />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-[0.15em] text-charcoal/60">
              E-posta
            </label>
            <Input name="email" type="email" value={form.email} onChange={handleChange} required className="mt-1.5" />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-[0.15em] text-charcoal/60">
              Şifre
            </label>
            <Input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} className="mt-1.5" />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
          </Button>
        </form>

        <p className="mt-8 text-center text-[12px] text-charcoal/40">
          Zaten hesabınız var mı?{" "}
          <Link href="/giris" className="text-gold-600 transition-colors hover:text-gold-700">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}
