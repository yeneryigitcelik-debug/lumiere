"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("E-posta veya şifre hatalı");
    } else {
      window.location.href = "/";
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6 pt-24">
      <div className="w-full max-w-md">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold-500">
            Hesabınız
          </p>
          <h1 className="golden-divider-center mt-3 font-serif text-3xl font-medium text-charcoal">
            Giriş Yap
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
              E-posta
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1.5"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-[0.15em] text-charcoal/60">
              Şifre
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1.5"
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </Button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gold-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-cream px-4 text-[11px] uppercase tracking-[0.15em] text-charcoal/30">
                veya
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="mt-5 w-full"
            size="lg"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            Google ile Giriş Yap
          </Button>
        </div>

        <p className="mt-8 text-center text-[12px] text-charcoal/40">
          Hesabınız yok mu?{" "}
          <Link href="/kayit" className="text-gold-600 transition-colors hover:text-gold-700">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
}
