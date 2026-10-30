"use client";

import { Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";

const Scene = dynamic(() => import("./scene"), { ssr: false });

const LOAD_TIMEOUT_MS = 20000;

interface ModelViewerProps {
  modelUrl: string;
  className?: string;
  autoRotate?: boolean;
  enableZoom?: boolean;
}

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function subscribeVisibility(cb: () => void) {
  document.addEventListener("visibilitychange", cb);
  return () => document.removeEventListener("visibilitychange", cb);
}

export function ModelViewer({
  modelUrl,
  className,
  autoRotate = true,
  enableZoom = true,
}: ModelViewerProps) {
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [timedOutUrl, setTimedOutUrl] = useState<string | null>(null);
  const activeUrlRef = useRef<string | null>(modelUrl);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true
  );
  const pageVisible = useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "visible",
    () => false
  );

  const loaded = loadedUrl === modelUrl;
  const timedOut = !loaded && timedOutUrl === modelUrl;

  useEffect(() => {
    activeUrlRef.current = modelUrl;
    return () => {
      activeUrlRef.current = null;
    };
  }, [modelUrl]);

  useEffect(() => {
    if (loaded) return;
    const t = setTimeout(() => {
      if (activeUrlRef.current === modelUrl) setTimedOutUrl(modelUrl);
    }, LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [loaded, modelUrl]);

  const handleLoaded = useCallback(() => {
    // Ignore stale callbacks after URL change or unmount.
    if (activeUrlRef.current === modelUrl) setLoadedUrl(modelUrl);
  }, [modelUrl]);

  return (
    <div
      className={`canvas-container relative ${className || "aspect-square w-full"}`}
      aria-busy={!loaded && !timedOut}
    >
      {!loaded && !timedOut && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center" role="status">
          <div
            aria-hidden="true"
            className="h-8 w-8 rounded-full border-2 border-gold-200 border-t-gold-500 motion-safe:animate-spin"
          />
          <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-charcoal/40">
            3D Model Yükleniyor
          </p>
        </div>
      )}

      {timedOut ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-gold-50 to-cream" role="alert">
          <span aria-hidden="true" className="block font-serif text-5xl text-gold-200">&#9670;</span>
          <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-charcoal/40">
            3D görüntüleyici yüklenemedi
          </p>
        </div>
      ) : (
        <Suspense fallback={null}>
          <Scene
            modelUrl={modelUrl}
            autoRotate={autoRotate && !reducedMotion && pageVisible}
            enableZoom={enableZoom}
            onLoaded={handleLoaded}
          />
        </Suspense>
      )}

      {loaded && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 motion-safe:animate-fade-in">
          <p className="rounded-full bg-charcoal/60 px-3 py-1 text-[10px] text-white/80 backdrop-blur-sm">
            Sürükle: Döndür &middot; Kaydır: Yakınlaştır
          </p>
        </div>
      )}
    </div>
  );
}
