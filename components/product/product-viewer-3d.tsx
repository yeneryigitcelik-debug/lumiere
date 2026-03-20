"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Box } from "lucide-react";

const JewelryRing = dynamic(() => import("@/components/three/jewelry-ring"), { ssr: false });
const JewelryNecklace = dynamic(() => import("@/components/three/jewelry-necklace"), { ssr: false });
const JewelryEarring = dynamic(() => import("@/components/three/jewelry-earring"), { ssr: false });

interface ProductViewer3DProps {
  modelUrl?: string | null;
  jewelryType?: string;
}

export function ProductViewer3D({ jewelryType }: ProductViewer3DProps) {
  const [show3D, setShow3D] = useState(false);

  const getComponent = () => {
    switch (jewelryType) {
      case "kolye":
        return <JewelryNecklace className="aspect-square w-full" />;
      case "kupe":
        return <JewelryEarring className="aspect-square w-full" />;
      case "yuzuk":
      default:
        return <JewelryRing className="aspect-square w-full" />;
    }
  };

  if (!show3D) {
    return (
      <button
        onClick={() => setShow3D(true)}
        className="group flex w-full items-center justify-center gap-3 rounded-sm border border-gold-200 bg-gold-50/50 py-4 transition-all duration-300 hover:border-gold-400 hover:bg-gold-50"
      >
        <Box
          size={18}
          strokeWidth={1.5}
          className="text-gold-400 transition-colors group-hover:text-gold-600"
        />
        <span className="text-[12px] uppercase tracking-[0.2em] text-charcoal/60 transition-colors group-hover:text-gold-700">
          3D Goruntule
        </span>
      </button>
    );
  }

  return (
    <div className="animate-scale-in relative overflow-hidden rounded-sm border border-gold-200 bg-gradient-to-br from-gold-50 to-cream">
      {getComponent()}
      <button
        onClick={() => setShow3D(false)}
        className="absolute right-3 top-3 rounded-full bg-charcoal/60 px-3 py-1 text-[10px] text-white/80 backdrop-blur-sm transition-colors hover:bg-charcoal/80"
      >
        Kapat
      </button>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
        <p className="rounded-full bg-charcoal/50 px-3 py-1 text-[9px] text-white/60 backdrop-blur-sm">
          Surukle: Dondur
        </p>
      </div>
    </div>
  );
}
