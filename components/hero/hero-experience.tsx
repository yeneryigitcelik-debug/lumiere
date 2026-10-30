"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useWebGLSupport, WebGLFallback } from "@/components/three/webgl-detector";
import { CanvasErrorBoundary } from "@/components/three/canvas-error-boundary";

const HeroCanvas3D = dynamic(() => import("./hero-canvas-3d"), {
  ssr: false,
  loading: () => null,
});

// Scroll narrative only for large, fine-pointer screens that allow motion.
const ENHANCED_QUERY =
  "(prefers-reduced-motion: no-preference) and (pointer: fine) and (hover: hover) and (min-width: 1024px) and (min-height: 600px)";

const STATS = [
  { value: "925", label: "Ayar Gümüş" },
  { value: "7 Gün", label: "Kargoda" },
  { value: "SSL", label: "Güvenli" },
];

const primaryCta =
  "inline-flex min-h-11 items-center justify-center gap-2 bg-gold-600 px-7 py-3 text-[12px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-gold-700";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function Diamond({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" width="36" height="36" viewBox="0 0 40 40" fill="none" className={className}>
      <path d="M20 2L36 18L20 38L4 18L20 2Z" stroke="#b8862f" strokeWidth="0.8" />
      <path d="M20 8L30 18L20 32L10 18L20 8Z" fill="#d4b574" opacity="0.25" />
      <circle cx="20" cy="18" r="1.5" fill="#b8862f" opacity="0.7" />
    </svg>
  );
}

/** SSR / no-JS / reduced-motion / mobile / no-WebGL composition: one screen. */
function StaticHero() {
  return (
    <section aria-labelledby="hero-title" className="hero-public relative overflow-hidden bg-cream">
      <div className="mx-auto flex min-h-[calc(100svh-72px)] max-w-7xl flex-col items-center justify-center px-6 py-10 text-center">
        <Diamond className="mx-auto mb-5" />
        <p className="text-[11px] lowercase tracking-[0.5em] text-gold-600">by collection</p>
        <h1
          id="hero-title"
          className="mt-3 font-serif font-medium leading-none text-charcoal"
          style={{ fontSize: "clamp(2.5rem, 8vw, 7rem)" }}
        >
          Işığı Keşfet
        </h1>
        <div aria-hidden="true" className="mx-auto mt-4 h-px w-28 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
        <p className="mt-5 max-w-md text-sm leading-relaxed text-charcoal/70">
          925 ayar gümüş ve zirkon taşlarla, usta zanaatkârların ellerinde şekillenen benzersiz tasarımlar.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/urunler" className={primaryCta}>
            Koleksiyonu Keşfet <span aria-hidden="true">&rarr;</span>
          </Link>
          <Link
            href="/hakkimizda"
            className="inline-flex min-h-11 items-center justify-center border border-charcoal/20 px-7 py-3 text-[12px] uppercase tracking-[0.2em] text-charcoal/80 transition-colors hover:border-gold-600 hover:text-gold-700"
          >
            Hikâyemiz
          </Link>
        </div>
        <ul className="mt-8 hidden justify-center gap-10 sm:flex">
          {STATS.map((s) => (
            <li key={s.label}>
              <p className="font-serif text-xl font-medium text-gold-600">{s.value}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-charcoal/60">{s.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function HeroExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [motionOk, setMotionOk] = useState(false);
  const [frame, setFrame] = useState({ p: 0, x: 0, y: 0 });
  const [inView, setInView] = useState(true);
  const webglSupported = useWebGLSupport(motionOk);
  const enhanced = motionOk && webglSupported === true;

  // Track motion / pointer / viewport preference, including runtime changes.
  useEffect(() => {
    const mql = window.matchMedia(ENHANCED_QUERY);
    const update = () => setMotionOk(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Scroll + pointer, batched into at most one React update per animation frame.
  useEffect(() => {
    if (!enhanced) return;
    const el = containerRef.current;
    if (!el) return;
    let raf = 0;
    const pointer = { x: 0, y: 0 };

    const flush = () => {
      raf = 0;
      if (document.hidden) return;
      const rect = el.getBoundingClientRect();
      const scrollable = el.offsetHeight - window.innerHeight;
      const p = scrollable > 0 ? clamp(-rect.top / scrollable, 0, 1) : 0;
      setFrame((f) =>
        f.p === p && f.x === pointer.x && f.y === pointer.y ? f : { p, x: pointer.x, y: pointer.y }
      );
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(flush);
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      schedule();
    };

    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", schedule);
    schedule();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [enhanced]);

  if (!enhanced) return <StaticHero />;

  const scrollProgress = frame.p;
  const phase1 = clamp(scrollProgress / 0.2, 0, 1);
  const phase2 = clamp((scrollProgress - 0.2) / 0.25, 0, 1);
  const phase3 = clamp((scrollProgress - 0.45) / 0.2, 0, 1);
  const phase4 = clamp((scrollProgress - 0.65) / 0.2, 0, 1);
  const fadeOut = clamp((scrollProgress - 0.85) / 0.15, 0, 1);
  const bgOpacity = Math.max(0, lerp(0, 0.85, phase1) - lerp(0, 0.85, fadeOut));
  const dark = bgOpacity > 0.5;

  // Phase 1 is fully visible at load (no blank first screen).
  const o1 = phase2 > 0 ? 1 - phase2 : 1;
  const o2 = phase2 > 0 ? (phase3 > 0 ? 1 - phase3 : phase2) : 0;
  const o3 = phase3 > 0 ? (phase4 > 0 ? 1 - phase4 : phase3) : 0;
  const o4 = phase4 > 0 ? (fadeOut > 0 ? 1 - fadeOut : phase4) : 0;
  const live = (o: number) => o > 0.5;

  return (
    <section ref={containerRef} aria-labelledby="hero-title" className="hero-public relative" style={{ height: "260vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 bg-cream" style={{ opacity: 1 - bgOpacity }} />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, rgba(26,26,26,${bgOpacity}) 0%, rgba(26,26,26,${bgOpacity * 0.95}) 50%, rgba(26,26,26,${bgOpacity * 0.8}) 100%)`,
          }}
        />

        <div aria-hidden="true" className="absolute inset-0">
          {inView && (
            <CanvasErrorBoundary fallback={<WebGLFallback />}>
              <HeroCanvas3D scrollProgress={scrollProgress} mouseX={frame.x} mouseY={frame.y} />
            </CanvasErrorBoundary>
          )}
        </div>

        {/* Faz 1: Açılış */}
        <div
          className="absolute inset-0 z-10 flex items-center justify-center pt-[72px]"
          style={{ opacity: o1, pointerEvents: live(o1) ? "auto" : "none" }}
          aria-hidden={!live(o1) || undefined}
          inert={!live(o1)}
        >
          <div className="text-center">
            <p
              className="text-[11px] lowercase tracking-[0.5em]"
              style={{ color: dark ? "rgba(212,181,116,0.9)" : "#9a6b24" }}
            >
              by collection
            </p>
            <h1
              id="hero-title"
              className="mt-4 font-serif font-medium leading-none"
              style={{
                fontSize: "clamp(3rem, 8vw, 10rem)",
                color: dark ? "rgba(255,255,255,0.95)" : "rgba(26,26,26,0.92)",
                letterSpacing: `${lerp(0.02, 0.04, phase1)}em`,
              }}
            >
              Işığı Keşfet
            </h1>
            <div aria-hidden="true" className="mx-auto mt-4 h-px w-28 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
            <div className="mt-8 flex justify-center">
              <Link href="/urunler" className={primaryCta}>
                Koleksiyonu Keşfet <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Faz 2: Vitrin */}
        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-center"
          style={{ opacity: o2 }}
          aria-hidden={!live(o2) || undefined}
          inert={!live(o2)}
        >
          <div className="mx-auto w-full max-w-7xl px-6">
            <div className="max-w-md" style={{ transform: `translateX(${lerp(-40, 0, phase2)}px)` }}>
              <p className="text-[10px] uppercase tracking-[0.4em] text-gold-300">El Yapımı Koleksiyon</p>
              <h2 className="mt-3 font-serif text-4xl font-medium leading-[1.15] text-white sm:text-5xl">
                Her Parça<br />
                Bir <span className="italic text-gold-300">Hikâye</span><br />
                Anlatır
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-white/70">
                925 ayar gümüş ve zirkon taşlarla, usta zanaatkârların ellerinde şekillenen benzersiz tasarımlar.
              </p>
            </div>
          </div>
        </div>

        {/* Faz 3: Marka vaadi */}
        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-end"
          style={{ opacity: o3 }}
          aria-hidden={!live(o3) || undefined}
          inert={!live(o3)}
        >
          <div className="mx-auto w-full max-w-7xl px-6">
            <div className="ml-auto max-w-md text-right" style={{ transform: `translateX(${lerp(40, 0, phase3)}px)` }}>
              <p className="text-[10px] uppercase tracking-[0.4em] text-gold-300">Işıltının ve Lüksün Hikâyesi</p>
              <h2 className="mt-3 font-serif text-4xl font-medium leading-[1.15] text-white sm:text-5xl">
                Zarafet<br />
                <span className="italic text-gold-300">Zamansızdır</span>
              </h2>
              <ul className="mt-6 flex justify-end gap-8">
                {STATS.map((s) => (
                  <li key={s.label} className="text-right">
                    <p className="font-serif text-2xl font-medium text-gold-300">{s.value}</p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-white/60">{s.label}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Faz 4: CTA */}
        <div
          className="absolute inset-0 z-10 flex items-center justify-center"
          style={{ opacity: o4, pointerEvents: live(o4) ? "auto" : "none" }}
          aria-hidden={!live(o4) || undefined}
          inert={!live(o4)}
        >
          <div className="text-center" style={{ transform: `translateY(${lerp(30, 0, phase4)}px)` }}>
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold-300">Koleksiyonu Keşfedin</p>
            <h2 className="mt-4 font-serif text-5xl font-medium text-white sm:text-6xl">
              Işığınızı<br />
              <span className="italic text-gold-300">Bulun</span>
            </h2>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/urunler" className={primaryCta}>
                Alışverişe Başla <span aria-hidden="true">&rarr;</span>
              </Link>
              <Link
                href="/hakkimizda"
                className="inline-flex min-h-11 items-center border border-white/30 px-7 py-3 text-[12px] uppercase tracking-[0.2em] text-white/85 transition-colors hover:border-gold-300 hover:text-gold-300"
              >
                Hikâyemiz
              </Link>
            </div>
          </div>
        </div>

        {/* Dekoratif ilerleme */}
        <div aria-hidden="true" className="pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2">
          <div className="flex flex-col items-center gap-3" style={{ opacity: 1 - fadeOut }}>
            <span
              className="text-[9px] uppercase tracking-[0.3em]"
              style={{ color: dark ? "rgba(255,255,255,0.4)" : "rgba(26,26,26,0.45)" }}
            >
              Kaydır
            </span>
            <div
              className="relative h-12 w-px overflow-hidden"
              style={{ background: dark ? "rgba(255,255,255,0.1)" : "rgba(26,26,26,0.1)" }}
            >
              <div
                className="absolute left-0 top-0 h-full w-full bg-gradient-to-b from-gold-500 to-transparent"
                style={{ transform: `translateY(${scrollProgress * 100}%)` }}
              />
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-6 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-3"
          style={{ opacity: 1 - fadeOut }}
        >
          {[0, 0.25, 0.5, 0.75].map((threshold) => (
            <div
              key={threshold}
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor:
                  scrollProgress >= threshold
                    ? "rgba(196,153,74,0.8)"
                    : dark
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(26,26,26,0.12)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
