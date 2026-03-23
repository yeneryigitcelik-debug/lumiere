"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 pt-24">
        <span className="block font-serif text-6xl text-gold-200">&#9670;</span>
        <h1 className="mt-6 font-serif text-3xl font-medium text-charcoal">
          Sepetiniz Boş
        </h1>
        <p className="mt-3 text-sm text-charcoal/40">
          Henuz sepetinize urun eklemediniz.
        </p>
        <Link
          href="/urunler"
          className="mt-8 inline-flex items-center gap-2 bg-charcoal px-8 py-3.5 text-[12px] uppercase tracking-[0.2em] text-white transition-all duration-500 hover:bg-gold-700"
        >
          Koleksiyonu Keşfet
          <ArrowRight size={14} strokeWidth={1.5} />
        </Link>
      </div>
    );
  }

  const subtotal = totalPrice();
  const shipping = subtotal >= 500 ? 0 : 29.9;
  const total = subtotal + shipping;

  return (
    <div className="pt-24">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold-500">
            Alışveriş
          </p>
          <h1 className="golden-divider-center mt-3 font-serif text-3xl font-medium text-charcoal">
            Sepetim
          </h1>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-3">
          {/* Items */}
          <div className="space-y-0 lg:col-span-2">
            {/* Header */}
            <div className="hidden border-b border-gold-100 pb-3 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 sm:grid sm:grid-cols-12 sm:gap-4">
              <span className="col-span-6">Ürün</span>
              <span className="col-span-2 text-center">Adet</span>
              <span className="col-span-3 text-right">Fiyat</span>
              <span className="col-span-1" />
            </div>

            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                className="grid grid-cols-12 items-center gap-4 border-b border-gold-100/50 py-6"
              >
                {/* Product */}
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
                      <div className="flex h-full w-full items-center justify-center text-gold-200">
                        &#9670;
                      </div>
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/urunler/${item.categorySlug ? `${item.categorySlug}/` : ""}${item.slug}`}
                      className="font-serif text-sm font-medium text-charcoal transition-colors hover:text-gold-700"
                    >
                      {item.name}
                    </Link>
                    {item.variantName && (
                      <p className="mt-0.5 text-[11px] text-charcoal/40">
                        {item.variantName}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-charcoal/40">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </div>

                {/* Quantity */}
                <div className="col-span-4 flex items-center justify-center sm:col-span-2">
                  <div className="flex items-center border border-gold-200">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1, item.variantId)
                      }
                      className="flex h-8 w-8 items-center justify-center text-charcoal/40 transition-colors hover:text-charcoal"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="flex h-8 w-8 items-center justify-center text-[12px]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1, item.variantId)
                      }
                      className="flex h-8 w-8 items-center justify-center text-charcoal/40 transition-colors hover:text-charcoal"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-6 text-right sm:col-span-3">
                  <span className="font-serif text-sm font-medium text-charcoal">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>

                {/* Remove */}
                <div className="col-span-2 text-right sm:col-span-1">
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="text-charcoal/25 transition-colors hover:text-red-500"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="border border-gold-100 bg-gold-50/30 p-8">
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-charcoal/60">
                Sipariş Özeti
              </h2>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-charcoal/40">Ara Toplam</span>
                  <span className="text-charcoal">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal/40">Kargo</span>
                  <span className="text-charcoal">
                    {shipping === 0 ? (
                      <span className="text-gold-600">Ücretsiz</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[10px] text-gold-500">
                    500 TL üzeri alışverişlerde ücretsiz kargo
                  </p>
                )}
              </div>

              <div className="mt-6 flex justify-between border-t border-gold-200/50 pt-4">
                <span className="text-[11px] uppercase tracking-[0.15em] text-charcoal/60">
                  Toplam
                </span>
                <span className="font-serif text-xl font-medium text-charcoal">
                  {formatPrice(total)}
                </span>
              </div>

              <Link href="/odeme" className="mt-6 block">
                <button className="flex w-full items-center justify-center gap-2 bg-charcoal py-4 text-[12px] uppercase tracking-[0.2em] text-white transition-all duration-500 hover:bg-gold-700">
                  Ödemeye Geç
                  <ArrowRight size={14} strokeWidth={1.5} />
                </button>
              </Link>

              <Link
                href="/urunler"
                className="mt-4 block text-center text-[11px] uppercase tracking-[0.15em] text-charcoal/40 transition-colors hover:text-gold-600"
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
