"use client";

import { useEffect, useState, type ReactNode } from "react";

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as
      | WebGLRenderingContext
      | WebGL2RenderingContext
      | null;
    if (!gl) return false;
    // Release the probe context immediately so it does not count against the
    // browser's active WebGL context limit.
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    canvas.width = 0;
    canvas.height = 0;
    return true;
  } catch {
    return false;
  }
}

/** Returns null until probed (or while disabled), then true/false. */
export function useWebGLSupport(enabled: boolean = true) {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    if (!enabled || supported !== null) return;
    const id = requestAnimationFrame(() => setSupported(detectWebGL()));
    return () => cancelAnimationFrame(id);
  }, [enabled, supported]);

  return enabled ? supported : null;
}

/**
 * Decorative brand backdrop used when the 3D scene cannot render.
 * Contains no heading so it never duplicates the page hero heading.
 */
export function WebGLFallback({ children }: { children?: ReactNode }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-charcoal via-warm-gray to-charcoal">
      <div className="text-center">
        <div aria-hidden="true">
          <span className="block font-serif text-6xl text-gold-300">&#9670;</span>
          <span className="mt-4 block font-serif text-2xl font-medium lowercase tracking-[0.2em] text-white/90">
            by collection
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
