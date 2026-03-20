"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useCartStore } from "@/stores/cart";

interface AddToCartButtonProps {
  productId: string;
  name: string;
  price: number;
  image?: string;
  slug: string;
  variantId?: string;
  variantName?: string;
}

export function AddToCartButton({
  productId,
  name,
  price,
  image,
  slug,
  variantId,
  variantName,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    addItem({
      productId,
      name,
      price,
      image,
      slug,
      variantId,
      variantName,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={added}
      className={`group flex w-full items-center justify-center gap-3 py-4 text-[12px] uppercase tracking-[0.2em] transition-all duration-500 ${
        added
          ? "bg-gold-600 text-white"
          : "bg-charcoal text-white hover:bg-gold-700"
      }`}
    >
      {added ? (
        <>
          <Check size={16} strokeWidth={1.5} />
          Sepete Eklendi
        </>
      ) : (
        <>
          <ShoppingBag size={16} strokeWidth={1.5} />
          Sepete Ekle
        </>
      )}
    </button>
  );
}
