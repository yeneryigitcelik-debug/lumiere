"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows } from "@react-three/drei";
import type { Group } from "three";

function Ring() {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={groupRef}>
        {/* Ring band */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1, 0.12, 32, 100]} />
          <meshPhysicalMaterial
            color="#d4b574"
            metalness={1}
            roughness={0.15}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* Gem setting base */}
        <mesh position={[0, 0.95, 0]}>
          <cylinderGeometry args={[0.18, 0.25, 0.12, 6]} />
          <meshPhysicalMaterial
            color="#c6994a"
            metalness={1}
            roughness={0.2}
          />
        </mesh>

        {/* Gemstone */}
        <mesh position={[0, 1.12, 0]} rotation={[0, Math.PI / 4, 0]}>
          <octahedronGeometry args={[0.2, 0]} />
          <meshPhysicalMaterial
            color="#e8d5b0"
            metalness={0.1}
            roughness={0}
            transmission={0.9}
            thickness={0.5}
            ior={2.4}
            envMapIntensity={3}
          />
        </mesh>

        {/* Small accent stones */}
        {[-0.35, 0.35].map((x) => (
          <mesh key={x} position={[x, 0.75, Math.sqrt(1 - x * x) * 0.3]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshPhysicalMaterial
              color="#f3ead5"
              metalness={0}
              roughness={0}
              transmission={0.8}
              ior={2.0}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

export default function JewelryRing({ className }: { className?: string }) {
  return (
    <div className={`canvas-container ${className || "aspect-square w-full"}`}>
      <Canvas
        camera={{ position: [0, 1.5, 4], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-3, 3, -2]} color="#d4b574" intensity={0.5} />
        <spotLight
          position={[0, 5, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          color="#fff5e6"
        />
        <Ring />
        <ContactShadows
          position={[0, -0.5, 0]}
          opacity={0.25}
          scale={5}
          blur={2}
          far={4}
        />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
