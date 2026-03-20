"use client";

import { Suspense, useState } from "react";
import dynamic from "next/dynamic";

const Scene = dynamic(() => import("./scene"), { ssr: false });

interface ModelViewerProps {
  modelUrl: string;
  className?: string;
  autoRotate?: boolean;
  enableZoom?: boolean;
}

export function ModelViewer({
  modelUrl,
  className,
  autoRotate = true,
  enableZoom = true,
}: ModelViewerProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`canvas-container relative ${className || "aspect-square w-full"}`}>
      {/* Loading state */}
      {!loaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-200 border-t-gold-500" />
          <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-charcoal/40">
            3D Model Yukleniyor
          </p>
        </div>
      )}

      <Suspense fallback={null}>
        <Scene
          modelUrl={modelUrl}
          autoRotate={autoRotate}
          enableZoom={enableZoom}
          onLoaded={() => setLoaded(true)}
        />
      </Suspense>

      {/* Controls hint */}
      {loaded && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 animate-fade-in">
          <p className="rounded-full bg-charcoal/60 px-3 py-1 text-[10px] text-white/70 backdrop-blur-sm">
            Surukle: Dondur &middot; Scroll: Yakinlastir
          </p>
        </div>
      )}
    </div>
  );
}
