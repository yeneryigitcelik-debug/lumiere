"use client";

import { useEffect, useState } from "react";

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}

export function useWebGLSupport() {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setSupported(detectWebGL());
  }, []);

  return supported;
}

export function WebGLFallback({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-charcoal via-warm-gray to-charcoal">
      <div className="text-center">
        <span className="block font-serif text-6xl text-gold-300">&#9670;</span>
        <p className="mt-4 font-serif text-2xl font-medium text-white/90">
          Lumière & Co
        </p>
        <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-white/30">
          Işığı Keşfet
        </p>
        {children}
      </div>
    </div>
  );
}
