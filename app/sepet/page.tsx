"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ArrowRight } from "lucide-react";
import { ensureInitialHydration, useCartStore } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/types";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-700";

function lineLabel(item: CartItem) {
  return item.variantName ? `${item.name} (${item.variantName})` : item.name;
}

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const storageWarning = useCartStore((s) => s.storageWarning);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalPrice = useCartStore((s) => s.totalPrice);

  // Own hydration independently of the Navbar; loading state stays until ready.
  useEffect(() => {
    ensureInitialHydration();
  }, []);

  const [status, setStatus] = useState("");
  const focusTargetRef = useRef<string | null>(null);
  const emptyHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const target = focusTargetRef.current;
    if (!target) return;
    focusTargetRef.current = null;
    const el =
      target === "empty"
        ? emptyHeadingRef.current
        : document.getElementById(target);
    el?.focus();
  }, [items]);

  const handleRemove = (item: CartItem, index: number) => {
    removeItem(item.productId, item.variantId);
    setStatus(`${lineLabel(item)} sepetten çıkarıldı.`);
    const remaining = items.length - 1;
    focusTargetRef.current =
      remaining <= 0 ? "empty" : `cart-remove-${Math.min(index, remaining - 1)}`;
  };

  const handleDecrease = (item: CartItem, index: number) => {
    if (item.quantity <= 1) {
      handleRemove(item, index);
      return;
    }
    const next = item.quantity - 1;
    updateQuantity(item.productId, next, item.variantId);
    setStatus(`${lineLabel(item)} adedi ${next} olarak güncellendi.`);
  };

  const handleIncrease = (item: CartItem) => {
    const next = item.quantity + 1;
    if (!Number.isSafeInteger(next)) return;
    updateQuantity(item.productId, next, item.variantId);
    setStatus(`${lineLabel(item)} adedi ${next} olarak güncellendi.`);
  };

  const liveRegion = (
    <p role="status" aria-live="polite" className="sr-only">
      {status}
    </p>
  );

  const warning = storageWarning ? (
    <p
      role="status"
      className="mx-auto mt-6 max-w-2xl border border-gold-200 bg-gold-50 px-4 py-3 text-center text-[12px] text-charcoal/80"
    >
      {storageWarning}
    </p>
  ) : null;

  if (!hasHydrated) {
    return (
      <div className="pt-24" aria-busy="true">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.3em] text-gold-700">
              Alışveriş
            </p>
            <h1 className="golden-divider-center mt-3 font-serif text-3xl font-medium text-charcoal">
              Sepetim
            </h1>
            <p role="status" className="mt-6 text-sm text-charcoal/70">
              Sepetiniz yükleniyor…
            </p>
          </div>
          <div className="mt-12 grid gap-12 lg:grid-cols-3" aria-hidden="true">
            <div className="space-y-4 lg:col-span-2">
              {[0, 1].map((n) => (
                <div
                  key={n}
                  className="h-24 bg-gold-50 motion-safe:animate-pulse"
                />
              ))}
            </div>
            <div className="h-64 bg-gold-50 motion-safe:animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 pt-24">
        {liveRegion}
        <span aria-hidden="true" className="block font-serif text-6xl text-gold-200">
          &#9670;
        </span>
        <h1
          ref={emptyHeadingRef}
          tabIndex={-1}
          className={`mt-6 font-serif text-3xl font-medium text-charcoal ${focusRing}`}
        >
          Sepetiniz Boş
        </h1>
        <p className="mt-3 text-sm text-charcoal/70">
          Henüz sepetinize ürün eklemediniz.
        </p>
        {warning}
        <Link
          href="/urunler"
          className={`mt-8 inline-flex min-h-11 items-center gap-2 bg-charcoal px-8 py-3.5 text-[12px] uppercase tracking-[0.2em] text-white transition-all duration-500 hover:bg-gold-700 motion-reduce:transition-none ${focusRing}`}
        >
          Koleksiyonu Keşfet
          <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const subtotal = totalPrice();
  const shipping = subtotal >= 500 ? 0 : 29.9;
  const total = subtotal + shipping;

  return (
    <div className="pt-24">
      {liveRegion}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold-700">
            Alışveriş
          </p>
          <h1 className="golden-divider-center mt-3 font-serif text-3xl font-medium text-charcoal">
            Sepetim
          </h1>
        </div>
        {warning}

        <div className="mt-12 grid gap-12 lg:grid-cols-3">
          <div className="space-y-0 lg:col-span-2">
            <div
              aria-hidden="true"
              className="hidden border-b border-gold-100 pb-3 text-[10px] uppercase tracking-[0.2em] text-charcoal/70 sm:grid sm:grid-cols-12 sm:gap-4"
            >
              <span className="col-span-6">Ürün</span>
              <span className="col-span-2 text-center">Adet</span>
              <span className="col-span-3 text-right">Fiyat</span>
              <span className="col-span-1" />
            </div>

            <ul aria-label="Sepetteki ürünler">
              {items.map((item, index) => {
                const label = lineLabel(item);
                const href = item.categorySlug
                  ? `/urunler/${item.categorySlug}/${item.slug}`
                  : "/urunler";
                return (
                  <li
                    key={`${item.productId}-${item.variantId ?? ""}`}
                    className="grid grid-cols-12 items-center gap-4 border-b border-gold-100/50 py-6"
                  >
                    <div className="col-span-12 flex gap-4 sm:col-span-6">
                      <div className="h-20 w-16 shrink-0 overflow-hidden rounded-sm bg-gold-50">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={80}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div
                            aria-hidden="true"
                            className="flex h-full w-full items-center justify-center text-gold-200"
                          >
                            &#9670;
                          </div>
                        )}
                      </div>
                      <div>
                        <Link
                          href={href}
                          className={`inline-flex min-h-11 items-center font-serif text-sm font-medium text-charcoal transition-colors hover:text-gold-700 motion-reduce:transition-none ${focusRing}`}
                        >
                          {item.name}
                          {!item.categorySlug && (
                            <span className="sr-only"> (koleksiyon sayfası)</span>
                          )}
                        </Link>
                        {item.variantName && (
                          <p className="text-[11px] text-charcoal/70">
                            {item.variantName}
                          </p>
                        )}
                        <p className="mt-1 text-[11px] text-charcoal/70">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>

                    <div className="col-span-5 flex items-center justify-center sm:col-span-2">
                      <div className="flex items-center border border-gold-200">
                        <button
                          type="button"
                          onClick={() => handleDecrease(item, index)}
                          aria-label={
                            item.quantity <= 1
                              ? `${label} ürününü sepetten çıkar`
                              : `${label} adedini azalt`
                          }
                          className={`flex h-11 w-11 items-center justify-center text-charcoal/70 transition-colors hover:text-charcoal motion-reduce:transition-none ${focusRing}`}
                        >
                          <Minus size={12} aria-hidden="true" />
                        </button>
                        <span
                          className="flex h-11 min-w-8 items-center justify-center px-1 text-[12px]"
                          aria-label={`Adet: ${item.quantity}`}
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleIncrease(item)}
                          aria-label={`${label} adedini artır`}
                          className={`flex h-11 w-11 items-center justify-center text-charcoal/70 transition-colors hover:text-charcoal motion-reduce:transition-none ${focusRing}`}
                        >
                          <Plus size={12} aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <div className="col-span-5 text-right sm:col-span-3">
                      <span className="font-serif text-sm font-medium text-charcoal">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>

                    <div className="col-span-2 flex justify-end sm:col-span-1">
                      <button
                        type="button"
                        id={`cart-remove-${index}`}
                        onClick={() => handleRemove(item, index)}
                        aria-label={`${label} ürününü sepetten çıkar`}
                        className={`flex h-11 w-11 items-center justify-center text-charcoal/70 transition-colors hover:text-red-700 motion-reduce:transition-none ${focusRing}`}
                      >
                        <Trash2 size={16} strokeWidth={1.5} aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="border border-gold-100 bg-gold-50/30 p-8">
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-charcoal/80">
                Sipariş Özeti
              </h2>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-charcoal/70">Ara Toplam</span>
                  <span className="text-charcoal">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal/70">Kargo</span>
                  <span className="text-charcoal">
                    {shipping === 0 ? (
                      <span className="text-gold-700">Ücretsiz</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[11px] text-gold-700">
                    500 TL üzeri alışverişlerde ücretsiz kargo
                  </p>
                )}
              </div>

              <div className="mt-6 flex justify-between border-t border-gold-200/50 pt-4">
                <span className="text-[11px] uppercase tracking-[0.15em] text-charcoal/80">
                  Toplam
                </span>
                <span className="font-serif text-xl font-medium text-charcoal">
                  {formatPrice(total)}
                </span>
              </div>

              <Link
                href="/odeme"
                className={`mt-6 flex min-h-11 w-full items-center justify-center gap-2 bg-charcoal py-4 text-[12px] uppercase tracking-[0.2em] text-white transition-all duration-500 hover:bg-gold-700 motion-reduce:transition-none ${focusRing}`}
              >
                Ödemeye Geç
                <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
              </Link>

              <Link
                href="/urunler"
                className={`mt-4 flex min-h-11 items-center justify-center text-center text-[11px] uppercase tracking-[0.15em] text-charcoal/70 transition-colors hover:text-gold-700 motion-reduce:transition-none ${focusRing}`}
              >
                &larr; Alışverişe Devam Et
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
