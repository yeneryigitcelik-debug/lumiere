"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";

interface Variant {
  id: string;
  name: string;
  priceModifier: number;
}

interface VariantSelectorProps {
  variants: Variant[];
  basePrice: number;
  compareAtPrice?: number | null;
  productId: string;
  productName: string;
  productImage?: string;
  productSlug: string;
  categorySlug: string;
}

export function VariantSelector({
  variants,
  basePrice,
  compareAtPrice,
  productId,
  productName,
  productImage,
  productSlug,
  categorySlug,
}: VariantSelectorProps) {
  // Store only ids; resolve against current props so stale/removed variants never reach the cart.
  const [selection, setSelection] = useState<{ productId: string; variantId: string } | null>(null);
  const selectedVariant =
    selection && selection.productId === productId
      ? variants.find((v) => v.id === selection.variantId) ?? null
      : null;
  const currentPrice = basePrice + (selectedVariant ? selectedVariant.priceModifier : 0);
  const hasDiscount = compareAtPrice && compareAtPrice > basePrice;

  return (
    <>
      {/* Price */}
      <div className="mt-6 flex items-baseline gap-3" aria-live="polite" aria-atomic="true">
        <span className="font-serif text-2xl font-medium text-charcoal">
          {formatPrice(currentPrice)}
        </span>
        {hasDiscount && !selectedVariant && (
          <span className="text-sm text-charcoal/30 line-through">
            {formatPrice(compareAtPrice)}
          </span>
        )}
      </div>

      {/* Variants */}
      {variants.length > 0 && (
        <div className="mt-8" role="group" aria-labelledby={`variants-${productId}`}>
          <h3
            id={`variants-${productId}`}
            className="text-[11px] uppercase tracking-[0.2em] text-charcoal/60"
          >
            Seçenekler
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {variants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() =>
                    setSelection(
                      isSelected ? null : { productId, variantId: variant.id }
                    )
                  }
                  className={`min-h-[44px] border px-4 py-2 text-[12px] uppercase tracking-[0.1em] transition-colors duration-300 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600 ${
                    isSelected
                      ? "border-gold-500 bg-gold-50 text-gold-700"
                      : "border-gold-200 text-charcoal/70 hover:border-gold-500 hover:text-gold-700"
                  }`}
                >
                  {variant.name}
                  {variant.priceModifier > 0 &&
                    ` (+${formatPrice(variant.priceModifier)})`}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add to cart */}
      <div className="mt-8">
        <AddToCartButton
          productId={productId}
          name={productName}
          price={currentPrice}
          image={productImage}
          slug={productSlug}
          categorySlug={categorySlug}
          variantId={selectedVariant?.id}
          variantName={selectedVariant?.name}
        />
      </div>
    </>
  );
}
