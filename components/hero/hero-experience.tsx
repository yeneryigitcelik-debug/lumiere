"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useWebGLSupport, WebGLFallback } from "@/components/three/webgl-detector";
import { CanvasErrorBoundary } from "@/components/three/canvas-error-boundary";

const HeroCanvas3D = dynamic(() => import("./hero-canvas-3d"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-200 border-t-gold-500" />
    </div>
  ),
});

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function HeroExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const webglSupported = useWebGLSupport();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollable = containerRef.current.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const progress = clamp(-rect.top / scrollable, 0, 1);
    setScrollProgress(progress);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMouse({
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -(e.clientY / window.innerHeight) * 2 + 1,
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleScroll, handleMouseMove]);

  const phase1 = clamp(scrollProgress / 0.20, 0, 1);
  const phase2 = clamp((scrollProgress - 0.20) / 0.25, 0, 1);
  const phase3 = clamp((scrollProgress - 0.45) / 0.20, 0, 1);
  const phase4 = clamp((scrollProgress - 0.65) / 0.20, 0, 1);
  const fadeOut = clamp((scrollProgress - 0.85) / 0.15, 0, 1);

  const bgOpacity = lerp(0, 0.85, phase1) - lerp(0, 0.85, fadeOut);

  return (
    <div ref={containerRef} className="relative" style={{ height: "500vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Arka plan */}
        <div className="absolute inset-0 bg-cream" style={{ opacity: 1 - bgOpacity }} />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, rgba(26,26,26,${bgOpacity}) 0%, rgba(26,26,26,${bgOpacity * 0.95}) 50%, rgba(26,26,26,${bgOpacity * 0.8}) 100%)`,
          }}
        />

        {/* 3D Canvas */}
        {mounted && webglSupported === false && (
          <div className="absolute inset-0">
            <WebGLFallback>
              <div className="mt-6 flex justify-center gap-4">
                <Link
                  href="/urunler"
                  className="bg-gold-500 px-6 py-3 text-[12px] uppercase tracking-[0.2em] text-white transition-all hover:bg-gold-600"
                >
                  Koleksiyonu Keşfet
                </Link>
              </div>
            </WebGLFallback>
          </div>
        )}
        {mounted && webglSupported !== false && (
          <div className="absolute inset-0">
            <CanvasErrorBoundary
              fallback={
                <WebGLFallback>
                  <div className="mt-6 flex justify-center gap-4">
                    <Link
                      href="/urunler"
                      className="bg-gold-500 px-6 py-3 text-[12px] uppercase tracking-[0.2em] text-white transition-all hover:bg-gold-600"
                    >
                      Koleksiyonu Keşfet
                    </Link>
                  </div>
                </WebGLFallback>
              }
            >
              <HeroCanvas3D
                scrollProgress={scrollProgress}
                mouseX={mouse.x}
                mouseY={mouse.y}
              />
            </CanvasErrorBoundary>
          </div>
        )}

        {/* FAZ 1: Açılış */}
        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
          style={{
            opacity: phase1 < 0.3 ? phase1 / 0.3 : phase2 > 0 ? 1 - phase2 : 1,
          }}
        >
          <div className="text-center">
            <p
              className="text-[11px] uppercase tracking-[0.5em]"
              style={{
                color: bgOpacity > 0.5 ? "rgba(196,153,74,0.7)" : "rgba(196,153,74,0.6)",
                transform: `translateY(${lerp(30, 0, phase1)}px)`,
              }}
            >
              Lumière &amp; Co
            </p>
            <h1
              className="mt-4 font-serif font-medium leading-none"
              style={{
                fontSize: "clamp(3rem, 8vw, 10rem)",
                color: bgOpacity > 0.5 ? "rgba(255,255,255,0.95)" : "rgba(26,26,26,0.9)",
                transform: `translateY(${lerp(50, 0, phase1)}px)`,
                letterSpacing: `${lerp(0.05, 0.02, phase1)}em`,
              }}
            >
              Işığı Keşfet
            </h1>
            <div
              className="mx-auto mt-4 h-[0.5px] bg-gradient-to-r from-transparent via-gold-500 to-transparent"
              style={{ width: `${lerp(0, 120, phase1)}px`, opacity: phase1 }}
            />
          </div>
        </div>

        {/* FAZ 2: Vitrin */}
        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-center"
          style={{ opacity: phase2 > 0 ? (phase3 > 0 ? 1 - phase3 : phase2) : 0 }}
        >
          <div className="mx-auto w-full max-w-7xl px-6">
            <div className="max-w-md">
              <p
                className="text-[10px] uppercase tracking-[0.4em] text-gold-400"
                style={{ transform: `translateX(${lerp(-40, 0, phase2)}px)`, opacity: phase2 }}
              >
                El Yapımı Koleksiyon
              </p>
              <h2
                className="mt-3 font-serif text-4xl font-medium leading-[1.15] text-white sm:text-5xl"
                style={{ transform: `translateX(${lerp(-60, 0, phase2)}px)`, opacity: phase2 }}
              >
                Her Parça<br />
                Bir <span className="italic text-gold-400">Hikâye</span><br />
                Anlatır
              </h2>
              <p
                className="mt-5 text-sm leading-relaxed text-white/40"
                style={{ transform: `translateX(${lerp(-40, 0, phase2)}px)`, opacity: clamp(phase2 * 2 - 0.5, 0, 1) }}
              >
                925 ayar gümüş ve zirkon taşlarla, usta zanaatkârların
                ellerinde şekillenen benzersiz tasarımlar.
              </p>
            </div>
          </div>
        </div>

        {/* FAZ 3: Marka vaadi */}
        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-end"
          style={{ opacity: phase3 > 0 ? (phase4 > 0 ? 1 - phase4 : phase3) : 0 }}
        >
          <div className="mx-auto w-full max-w-7xl px-6">
            <div className="ml-auto max-w-md text-right">
              <p
                className="text-[10px] uppercase tracking-[0.4em] text-gold-400"
                style={{ transform: `translateX(${lerp(40, 0, phase3)}px)`, opacity: phase3 }}
              >
                Işıltının ve Lüksün Hikâyesi
              </p>
              <h2
                className="mt-3 font-serif text-4xl font-medium leading-[1.15] text-white sm:text-5xl"
                style={{ transform: `translateX(${lerp(60, 0, phase3)}px)`, opacity: phase3 }}
              >
                Zarafet<br />
                <span className="italic text-gold-400">Zamansızdır</span>
              </h2>
              <div className="mt-6 flex justify-end gap-8" style={{ opacity: clamp(phase3 * 2 - 0.5, 0, 1) }}>
                {[
                  { value: "925", label: "Ayar Gümüş" },
                  { value: "7 Gün", label: "Kargoda" },
                  { value: "SSL", label: "Güvenli" },
                ].map((s) => (
                  <div key={s.label} className="text-right">
                    <p className="font-serif text-2xl font-medium text-gold-400">{s.value}</p>
                    <p className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-white/30">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAZ 4: CTA */}
        <div
          className="absolute inset-0 z-10 flex items-center justify-center"
          style={{
            opacity: phase4 > 0 ? (fadeOut > 0 ? 1 - fadeOut : phase4) : 0,
            pointerEvents: phase4 > 0.5 ? "auto" : "none",
          }}
        >
          <div className="text-center">
            <p
              className="text-[10px] uppercase tracking-[0.4em] text-gold-400"
              style={{ transform: `translateY(${lerp(20, 0, phase4)}px)`, opacity: phase4 }}
            >
              Koleksiyonu Keşfedin
            </p>
            <h2
              className="mt-4 font-serif text-5xl font-medium text-white sm:text-6xl"
              style={{ transform: `translateY(${lerp(40, 0, phase4)}px) scale(${lerp(0.9, 1, phase4)})`, opacity: phase4 }}
            >
              Işığınızı<br />
              <span className="italic text-gold-400">Bulun</span>
            </h2>
            <div
              className="mt-8 flex justify-center gap-4"
              style={{ transform: `translateY(${lerp(30, 0, phase4)}px)`, opacity: clamp(phase4 * 2 - 0.6, 0, 1) }}
            >
              <Link
                href="/urunler"
                className="group inline-flex items-center gap-2 bg-gold-500 px-8 py-3.5 text-[12px] uppercase tracking-[0.2em] text-white transition-all duration-500 hover:bg-gold-600"
              >
                Alışverişe Başla
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
              </Link>
              <Link
                href="/hakkimizda"
                className="inline-flex items-center gap-2 border border-white/20 px-8 py-3.5 text-[12px] uppercase tracking-[0.2em] text-white/70 transition-all duration-500 hover:border-gold-400 hover:text-gold-400"
              >
                Hikâyemiz
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll göstergesi */}
        <div className="pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2">
          <div className="flex flex-col items-center gap-3" style={{ opacity: 1 - fadeOut }}>
            <span
              className="text-[9px] uppercase tracking-[0.3em]"
              style={{ color: bgOpacity > 0.5 ? "rgba(255,255,255,0.25)" : "rgba(26,26,26,0.25)" }}
            >
              Kaydır
            </span>
            <div className="relative h-12 w-[1px] overflow-hidden">
              <div
                className="absolute left-0 top-0 w-full bg-gradient-to-b from-gold-500 to-transparent"
                style={{ height: "100%", transform: `translateY(${scrollProgress * 100}%)` }}
              />
              <div
                className="h-full w-full"
                style={{ background: bgOpacity > 0.5 ? "rgba(255,255,255,0.08)" : "rgba(26,26,26,0.08)" }}
              />
            </div>
          </div>
        </div>

        {/* Sağ progress noktaları */}
        <div
          className="pointer-events-none absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-3 lg:flex"
          style={{ opacity: 1 - fadeOut }}
        >
          {[0, 0.25, 0.50, 0.75].map((threshold, i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full transition-all duration-500"
              style={{
                backgroundColor: scrollProgress >= threshold
                  ? "rgba(196,153,74,0.8)"
                  : bgOpacity > 0.5 ? "rgba(255,255,255,0.15)" : "rgba(26,26,26,0.12)",
                transform: scrollProgress >= threshold ? "scale(1.3)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
