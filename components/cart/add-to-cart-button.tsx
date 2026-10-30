"use client";

import { useEffect, useRef, useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { ensureInitialHydration, useCartStore } from "@/stores/cart";

interface AddToCartButtonProps {
  productId: string;
  name: string;
  price: number;
  image?: string;
  slug: string;
  categorySlug?: string;
  variantId?: string;
  variantName?: string;
}

type Feedback = { kind: "added" | "error"; key: string; message: string };

const CONFIRM_MS = 1200;
const MSG_ERROR =
  "Ürün sepete eklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.";

export function AddToCartButton({
  productId,
  name,
  price,
  image,
  slug,
  categorySlug,
  variantId,
  variantName,
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const hydrated = useCartStore((s) => s.hasHydrated);

  // Own the hydration independently of the Navbar (e.g. streamed boundaries).
  useEffect(() => {
    ensureInitialHydration();
  }, []);
  const actionKey = JSON.stringify([productId, variantId ?? null, price]);

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [seenKey, setSeenKey] = useState(actionKey);
  // Reset feedback during render when product/variant changes (no effect cascade).
  if (seenKey !== actionKey) {
    setSeenKey(actionKey);
    setFeedback(null);
  }

  const lockRef = useRef<{ key: string; deadline: number } | null>(null);
  const latestKeyRef = useRef(actionKey);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    latestKeyRef.current = actionKey;
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      lockRef.current = null;
    };
  }, [actionKey]);

  const added = feedback?.kind === "added" && feedback.key === actionKey;
  const failed = feedback?.kind === "error" && feedback.key === actionKey;

  const handleAdd = () => {
    const key = actionKey;
    const lock = lockRef.current;
    if (lock && lock.key === key && Date.now() < lock.deadline) return;

    const ok = addItem({
      productId,
      name,
      price,
      image,
      slug,
      categorySlug,
      variantId,
      variantName,
      quantity: 1,
    });

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;

    if (!ok) {
      lockRef.current = null;
      setFeedback({ kind: "error", key, message: MSG_ERROR });
      return;
    }

    lockRef.current = { key, deadline: Date.now() + CONFIRM_MS };
    setFeedback({
      kind: "added",
      key,
      message: `${name}${variantName ? ` (${variantName})` : ""} sepete eklendi.`,
    });
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (lockRef.current?.key === key) lockRef.current = null;
      if (latestKeyRef.current === key) setFeedback(null);
    }, CONFIRM_MS);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleAdd}
        disabled={!hydrated}
        aria-disabled={added || !hydrated || undefined}
        className={`group flex min-h-[44px] w-full items-center justify-center gap-3 py-4 text-[12px] uppercase tracking-[0.2em] transition-colors duration-500 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600 ${
          added
            ? "cursor-default bg-gold-600 text-white"
            : "bg-charcoal text-white hover:bg-gold-700"
        }`}
      >
        {added ? (
          <>
            <Check size={16} strokeWidth={1.5} aria-hidden="true" />
            Sepete Eklendi
          </>
        ) : (
          <>
            <ShoppingBag size={16} strokeWidth={1.5} aria-hidden="true" />
            Sepete Ekle
          </>
        )}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {added ? feedback.message : ""}
      </span>
      {failed && (
        <p role="alert" className="mt-2 text-[12px] text-red-700">
          {feedback.message}
        </p>
      )}
    </>
  );
}
