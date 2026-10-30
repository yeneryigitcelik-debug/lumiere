"use client";

import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Pending = null | "credentials" | "google";

const SLOW_AFTER_MS = 20000;
const MSG_INVALID = "E-posta veya şifre hatalı";
const MSG_GENERIC = "Giriş şu anda tamamlanamadı. Lütfen biraz sonra tekrar deneyin.";
const MSG_NETWORK = "Bağlantı sorunu nedeniyle giriş tamamlanamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.";
const MSG_GOOGLE = "Google ile giriş başlatılamadı. Lütfen tekrar deneyin.";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState<Pending>(null);
  const [slow, setSlow] = useState(false);

  const inFlightRef = useRef(false);
  const mountedRef = useRef(true);
  // Per-attempt epoch: each lock() bumps it; stale promise settlements are ignored.
  const attemptRef = useRef(0);
  // True current pending kind (avoids stale effect closures).
  const pendingKindRef = useRef<Pending>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, []);

  // Lifecycle: Google signIn navigates away and keeps the form locked. If the browser
  // restores this page from bfcache (pageshow.persisted) while a Google attempt is pending,
  // the old attempt is invalidated and the form unlocked; inputs are kept. Credentials
  // attempts and non-persisted pageshow events never unlock here.
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted || pendingKindRef.current !== "google") return;
      attemptRef.current += 1;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      inFlightRef.current = false;
      pendingKindRef.current = null;
      setPending(null);
      setSlow(false);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const lock = (kind: Exclude<Pending, null>) => {
    const id = ++attemptRef.current;
    inFlightRef.current = true;
    pendingKindRef.current = kind;
    setPending(kind);
    setSlow(false);
    setError("");
    clearTimer();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (mountedRef.current && attemptRef.current === id) setSlow(true);
    }, SLOW_AFTER_MS);
    return id;
  };

  const unlockWithError = (message: string) => {
    clearTimer();
    inFlightRef.current = false;
    pendingKindRef.current = null;
    if (!mountedRef.current) return;
    setPending(null);
    setSlow(false);
    setError(message);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inFlightRef.current) return;
    const id = lock("credentials");

    let result: Awaited<ReturnType<typeof signIn>> | undefined;
    try {
      result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
    } catch {
      if (attemptRef.current !== id) return;
      unlockWithError(MSG_NETWORK);
      return;
    }

    if (attemptRef.current !== id) return;

    // Page was left (e.g. user navigated to /kayit) while pending: never navigate.
    if (!mountedRef.current) {
      clearTimer();
      inFlightRef.current = false;
      return;
    }

    if (result?.ok === true && !result.error) {
      clearTimer();
      // Keep the form locked (inFlightRef/pending stay set) until navigation unmounts this page.
      router.push("/");
      router.refresh();
      return;
    }

    const invalid =
      result?.error === "CredentialsSignin" || result?.status === 401;
    unlockWithError(invalid ? MSG_INVALID : MSG_GENERIC);
  };

  const handleGoogle = async () => {
    if (inFlightRef.current) return;
    const id = lock("google");
    try {
      // Default redirect: an undefined/resolved result means navigation is underway.
      await signIn("google", { callbackUrl: "/" });
    } catch {
      if (attemptRef.current !== id) return;
      if (!mountedRef.current) {
        clearTimer();
        inFlightRef.current = false;
        return;
      }
      unlockWithError(MSG_GOOGLE);
      return;
    }
    if (attemptRef.current !== id) return;
    if (!mountedRef.current) {
      clearTimer();
      inFlightRef.current = false;
    }
  };

  const isPending = pending !== null;
  const statusText =
    pending === "credentials"
      ? "Giriş yapılıyor, lütfen bekleyin."
      : pending === "google"
        ? "Google girişine yönlendiriliyorsunuz."
        : "";

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6 pt-24 pb-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold-500">
            Hesabınız
          </p>
          <h1 className="golden-divider-center mt-3 font-serif text-3xl font-medium text-charcoal">
            Giriş Yap
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-5"
          aria-busy={isPending}
          noValidate={false}
        >
          {error && (
            <p
              id="login-error"
              ref={errorRef}
              role="alert"
              tabIndex={-1}
              className="border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700 focus:outline-2 focus:outline-offset-2 focus:outline-red-600"
            >
              {error}
            </p>
          )}

          <div>
            <label
              htmlFor="login-email"
              className="text-[11px] uppercase tracking-[0.15em] text-charcoal/70"
            >
              E-posta
            </label>
            <Input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={isPending}
              aria-invalid={error === MSG_INVALID ? true : undefined}
              aria-describedby={error ? "login-error" : undefined}
              required
              className="mt-1.5 h-12 text-base read-only:bg-gold-50/40"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="text-[11px] uppercase tracking-[0.15em] text-charcoal/70"
            >
              Şifre
            </label>
            <Input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              readOnly={isPending}
              aria-invalid={error === MSG_INVALID ? true : undefined}
              aria-describedby={error ? "login-error" : undefined}
              required
              className="mt-1.5 h-12 text-base read-only:bg-gold-50/40"
            />
          </div>

          <Button
            type="submit"
            className="min-h-12 w-full motion-reduce:transition-none"
            size="lg"
            disabled={isPending}
          >
            {pending === "credentials" ? "Giriş yapılıyor..." : "Giriş Yap"}
          </Button>

          <p role="status" aria-live="polite" className="text-center text-[13px] text-charcoal/70">
            {statusText}
            {slow && isPending && (
              <span className="mt-2 block">
                İşlem beklenenden uzun sürüyor. Bağlantınız yavaş olabilir; dilerseniz{" "}
                <a
                  href="/giris"
                  className="inline-flex min-h-11 items-center text-gold-700 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
                >
                  sayfayı yenileyin
                </a>
                .
              </span>
            )}
          </p>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gold-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-cream px-4 text-[11px] uppercase tracking-[0.15em] text-charcoal/60">
                veya
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="mt-5 min-h-12 w-full text-charcoal/80 motion-reduce:transition-none"
            size="lg"
            disabled={isPending}
            onClick={handleGoogle}
          >
            {pending === "google" ? "Google açılıyor..." : "Google ile Giriş Yap"}
          </Button>
        </div>

        <p className="mt-8 text-center text-[13px] text-charcoal/70">
          Hesabınız yok mu?{" "}
          <Link
            href="/kayit"
            className="inline-flex min-h-11 items-center px-1 text-gold-700 transition-colors hover:text-gold-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 motion-reduce:transition-none"
          >
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
}
