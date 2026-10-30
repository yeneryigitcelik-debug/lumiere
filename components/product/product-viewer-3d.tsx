"use client";

import { useEffect, useRef, useState } from "react";
import { Box } from "lucide-react";
import { useWebGLSupport } from "@/components/three/webgl-detector";
import { CanvasErrorBoundary } from "@/components/three/canvas-error-boundary";
import { ModelViewer } from "@/components/three/model-viewer";

interface ProductViewer3DProps {
  modelUrl?: string | null;
  /** Kept for API compatibility; no procedural stand-in is rendered for products. */
  jewelryType?: string;
}

/** Allow same-origin relative paths or https URLs only. */
export function getSafeModelUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" ? parsed.href : null;
  } catch {
    return null;
  }
}

export function ProductViewer3D({ modelUrl }: ProductViewer3DProps) {
  const [show3D, setShow3D] = useState(false);
  const webglSupported = useWebGLSupport();
  const openRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const hasOpenedRef = useRef(false);
  const safeUrl = getSafeModelUrl(modelUrl);

  useEffect(() => {
    if (show3D) {
      hasOpenedRef.current = true;
      closeRef.current?.focus();
    } else if (hasOpenedRef.current) {
      openRef.current?.focus();
    }
  }, [show3D]);

  // Hide entirely while capability is unknown, unsupported, or no real model exists.
  if (webglSupported !== true || !safeUrl) return null;

  if (!show3D) {
    return (
      <button
        ref={openRef}
        type="button"
        onClick={() => setShow3D(true)}
        className="group flex min-h-[44px] w-full items-center justify-center gap-3 rounded-sm border border-gold-200 bg-gold-50/50 py-4 transition-colors duration-300 motion-reduce:transition-none hover:border-gold-400 hover:bg-gold-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
      >
        <Box
          size={18}
          strokeWidth={1.5}
          aria-hidden="true"
          className="text-gold-400 transition-colors group-hover:text-gold-600"
        />
        <span className="text-[12px] uppercase tracking-[0.2em] text-charcoal/60 transition-colors group-hover:text-gold-700">
          3D Görüntüle
        </span>
      </button>
    );
  }

  return (
    <div
      role="region"
      aria-label="3D ürün görüntüleyici"
      onKeyDown={(e) => {
        if (e.key === "Escape") setShow3D(false);
      }}
      className="relative overflow-hidden rounded-sm border border-gold-200 bg-gradient-to-br from-gold-50 to-cream motion-safe:animate-scale-in"
    >
      <CanvasErrorBoundary key={safeUrl}>
        <ModelViewer key={safeUrl} modelUrl={safeUrl} className="aspect-square w-full" />
      </CanvasErrorBoundary>
      <button
        ref={closeRef}
        type="button"
        onClick={() => setShow3D(false)}
        className="absolute right-2 top-2 z-20 min-h-[44px] min-w-[44px] rounded-full bg-charcoal/70 px-4 text-[11px] text-white backdrop-blur-sm transition-colors motion-reduce:transition-none hover:bg-charcoal/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
      >
        Kapat
      </button>
    </div>
  );
}
