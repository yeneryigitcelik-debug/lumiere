"use client";

import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF, Environment } from "@react-three/drei";

function Model({ url, onLoaded }: { url: string; onLoaded: () => void }) {
  const { scene } = useGLTF(url);

  useEffect(() => {
    onLoaded();
  }, [scene, onLoaded]);

  return <primitive object={scene} />;
}

interface SceneProps {
  modelUrl: string;
  autoRotate: boolean;
  enableZoom: boolean;
  onLoaded: () => void;
}

export default function Scene({
  modelUrl,
  autoRotate,
  enableZoom,
  onLoaded,
}: SceneProps) {
  return (
    <Canvas
      camera={{ fov: 40, position: [0, 0, 5] }}
      style={{ background: "transparent" }}
      gl={{ antialias: true, alpha: true }}
    >
      <Stage
        environment="city"
        intensity={0.5}
        adjustCamera={1.2}
      >
        <Model url={modelUrl} onLoaded={onLoaded} />
      </Stage>
      <Environment preset="city" />
      <OrbitControls
        autoRotate={autoRotate}
        autoRotateSpeed={0.8}
        enableZoom={enableZoom}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
        dampingFactor={0.05}
        enableDamping
      />
    </Canvas>
  );
}
