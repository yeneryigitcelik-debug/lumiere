"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows } from "@react-three/drei";
import type { Group } from "three";

function Earring({ posX }: { posX: number }) {
  return (
    <group position={[posX, 0, 0]}>
      {/* Hook */}
      <mesh position={[0, 0.8, 0]} rotation={[0, 0, Math.PI / 6 * (posX > 0 ? -1 : 1)]}>
        <torusGeometry args={[0.12, 0.015, 16, 32, Math.PI]} />
        <meshPhysicalMaterial color="#d4b574" metalness={1} roughness={0.15} />
      </mesh>

      {/* Connecting link */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
        <meshPhysicalMaterial color="#c6994a" metalness={1} roughness={0.2} />
      </mesh>

      {/* Main drop shape */}
      <mesh position={[0, -0.1, 0]} scale={[0.6, 1, 0.35]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshPhysicalMaterial
          color="#f0e6d0"
          metalness={0}
          roughness={0}
          transmission={0.8}
          thickness={0.8}
          ior={2.0}
          envMapIntensity={2}
        />
      </mesh>

      {/* Gold cap */}
      <mesh position={[0, 0.15, 0]}>
        <coneGeometry args={[0.15, 0.12, 16]} />
        <meshPhysicalMaterial color="#c6994a" metalness={1} roughness={0.2} />
      </mesh>

      {/* Bottom accent */}
      <mesh position={[0, -0.55, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshPhysicalMaterial color="#d4b574" metalness={1} roughness={0.1} />
      </mesh>
    </group>
  );
}

function EarringPair() {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.25;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={groupRef}>
        <Earring posX={-0.6} />
        <Earring posX={0.6} />
      </group>
    </Float>
  );
}

export default function JewelryEarring({ className }: { className?: string }) {
  return (
    <div className={`canvas-container ${className || "aspect-square w-full"}`}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-3, 2, -2]} color="#d4b574" intensity={0.4} />
        <EarringPair />
        <ContactShadows
          position={[0, -1.2, 0]}
          opacity={0.2}
          scale={4}
          blur={2}
        />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
