"use client";

import { useState, useEffect } from "react";

// Sabit parçacık pozisyonları - hydration hatası olmaz
const PARTICLES = [
  { w: 3, h: 4, l: 12, t: 25, o: 0.35, d: 5.2, dd: 0.5 },
  { w: 4, h: 3, l: 45, t: 15, o: 0.45, d: 6.1, dd: 1.2 },
  { w: 2, h: 3, l: 78, t: 60, o: 0.55, d: 7.3, dd: 0.8 },
  { w: 3, h: 2, l: 30, t: 80, o: 0.40, d: 4.8, dd: 2.0 },
  { w: 4, h: 4, l: 65, t: 40, o: 0.50, d: 5.5, dd: 1.5 },
  { w: 2, h: 3, l: 88, t: 70, o: 0.35, d: 6.8, dd: 0.3 },
  { w: 3, h: 3, l: 20, t: 55, o: 0.60, d: 7.0, dd: 1.8 },
  { w: 4, h: 2, l: 55, t: 85, o: 0.45, d: 5.8, dd: 2.5 },
  { w: 2, h: 4, l: 8, t: 45, o: 0.38, d: 6.5, dd: 0.7 },
  { w: 3, h: 3, l: 92, t: 30, o: 0.52, d: 4.5, dd: 1.0 },
  { w: 4, h: 3, l: 40, t: 10, o: 0.42, d: 7.5, dd: 2.2 },
  { w: 2, h: 2, l: 72, t: 90, o: 0.48, d: 5.0, dd: 0.2 },
];

export function SplashScreen() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2800),
      setTimeout(() => setPhase(4), 3600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  if (phase === 4) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-800 ${
        phase === 3 ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
      style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 50%, #1a1a1a 100%)" }}
    >
      {/* Parçacıklar */}
      <div className="absolute inset-0 overflow-hidden">
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${p.w}px`,
              height: `${p.h}px`,
              left: `${p.l}%`,
              top: `${p.t}%`,
              background: `radial-gradient(circle, rgba(212,181,116,${p.o}) 0%, transparent 70%)`,
              animation: `float ${p.d}s ease-in-out infinite`,
              animationDelay: `${p.dd}s`,
            }}
          />
        ))}
      </div>

      {/* Merkez parıltı */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-[2000ms]"
        style={{
          width: phase >= 1 ? "500px" : "0px",
          height: phase >= 1 ? "500px" : "0px",
          background: "radial-gradient(circle, rgba(196,153,74,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative text-center">
        {/* Elmas */}
        <div
          className="mx-auto mb-8 transition-all duration-[1200ms] ease-out"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: `translateY(${phase >= 1 ? 0 : 20}px) rotate(${phase >= 1 ? 0 : 45}deg)`,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mx-auto">
            <path d="M20 2L36 18L20 38L4 18L20 2Z" stroke="url(#ds)" strokeWidth="0.5" fill="none">
              <animate attributeName="stroke-dasharray" from="0,200" to="200,0" dur="1.5s" fill="freeze" />
            </path>
            <path d="M20 8L30 18L20 32L10 18L20 8Z" fill="url(#df)" opacity="0.2">
              <animate attributeName="opacity" values="0.1;0.3;0.1" dur="3s" repeatCount="indefinite" />
            </path>
            <circle cx="20" cy="18" r="1.5" fill="#d4b574" opacity="0.6">
              <animate attributeName="r" values="1;2;1" dur="2s" repeatCount="indefinite" />
            </circle>
            <defs>
              <linearGradient id="ds" x1="4" y1="2" x2="36" y2="38">
                <stop offset="0%" stopColor="#d4b574" /><stop offset="100%" stopColor="#9a6b24" />
              </linearGradient>
              <linearGradient id="df" x1="10" y1="8" x2="30" y2="32">
                <stop offset="0%" stopColor="#d4b574" /><stop offset="100%" stopColor="#9a6b24" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Logo */}
        <div
          className="transition-all duration-[1000ms] ease-out"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: `translateY(${phase >= 1 ? 0 : 15}px)`,
            transition: "all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          <p className="text-[12px] font-light lowercase tracking-[0.6em] text-gold-500/70">
            by
          </p>
        </div>

        <div
          className="mt-2 transition-all duration-[1000ms] ease-out"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: `translateY(${phase >= 1 ? 0 : 15}px)`,
            letterSpacing: phase >= 2 ? "0.35em" : "0.15em",
            transition: "all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          <h1 className="font-serif font-light text-white" style={{ fontSize: "clamp(1.8rem, 4.5vw, 3rem)" }}>
            COLLECTION
          </h1>
        </div>

        {/* Dekoratif çizgi */}
        <div
          className="mt-4 flex items-center justify-center gap-4 transition-all duration-[1000ms]"
          style={{ opacity: phase >= 1 ? 1 : 0, transitionDelay: "200ms" }}
        >
          <div
            className="h-[0.5px] bg-gradient-to-r from-transparent to-gold-500/40 transition-all duration-[1500ms]"
            style={{ width: phase >= 2 ? "50px" : "0px" }}
          />
          <span className="font-serif text-xs text-gold-500/50">&#9670;</span>
          <div
            className="h-[0.5px] bg-gradient-to-l from-transparent to-gold-500/40 transition-all duration-[1500ms]"
            style={{ width: phase >= 2 ? "50px" : "0px" }}
          />
        </div>

        {/* Slogan */}
        <div
          className="mt-10 transition-all duration-[1000ms] ease-out"
          style={{ opacity: phase >= 2 ? 1 : 0, transform: `translateY(${phase >= 2 ? 0 : 10}px)` }}
        >
          <div className="mx-auto mb-4 h-[0.5px] w-16 bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
          <p className="text-[9px] uppercase tracking-[0.5em] text-gold-400/50">
            Zarafet &middot; Işık &middot; Koleksiyon
          </p>
        </div>

        {/* Loading */}
        <div className="mx-auto mt-12 h-[1px] w-40 overflow-hidden rounded-full bg-white/[0.04]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-700 via-gold-400 to-gold-700 transition-all ease-out"
            style={{
              width: phase === 0 ? "0%" : phase === 1 ? "30%" : phase === 2 ? "75%" : "100%",
              transitionDuration: phase === 1 ? "900ms" : phase === 2 ? "1600ms" : "600ms",
            }}
          />
        </div>
      </div>
    </div>
  );
}
