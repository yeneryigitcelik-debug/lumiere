"use client";

import dynamic from "next/dynamic";

const HeroCanvas = dynamic(() => import("./hero-canvas"), { ssr: false });

export function HeroScene() {
  return (
    <div className="canvas-container absolute inset-0">
      <HeroCanvas />
    </div>
  );
}
