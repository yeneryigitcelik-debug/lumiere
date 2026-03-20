"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows } from "@react-three/drei";
import type { Group } from "three";
import * as THREE from "three";

function Necklace() {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  // Create chain curve
  const chainPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= 50; i++) {
    const t = (i / 50) * Math.PI;
    const x = Math.sin(t) * 1.8;
    const y = -Math.cos(t) * 1.2 + 0.5;
    chainPoints.push(new THREE.Vector3(x, y, 0));
  }
  const chainCurve = new THREE.CatmullRomCurve3(chainPoints);

  return (
    <Float speed={1} rotationIntensity={0.15} floatIntensity={0.2}>
      <group ref={groupRef}>
        {/* Chain */}
        <mesh>
          <tubeGeometry args={[chainCurve, 80, 0.025, 8, false]} />
          <meshPhysicalMaterial
            color="#d4b574"
            metalness={1}
            roughness={0.15}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* Pendant - teardrop shape */}
        <group position={[0, -0.7, 0]}>
          {/* Bail (connector) */}
          <mesh position={[0, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.08, 0.02, 16, 32]} />
            <meshPhysicalMaterial
              color="#c6994a"
              metalness={1}
              roughness={0.2}
            />
          </mesh>

          {/* Teardrop pendant */}
          <mesh position={[0, 0, 0]} scale={[0.7, 1, 0.25]}>
            <sphereGeometry args={[0.4, 32, 32]} />
            <meshPhysicalMaterial
              color="#e8d5b0"
              metalness={0.05}
              roughness={0}
              transmission={0.85}
              thickness={1}
              ior={2.2}
              envMapIntensity={2.5}
              iridescence={0.3}
              iridescenceIOR={1.3}
            />
          </mesh>

          {/* Gold frame around pendant */}
          <mesh position={[0, 0, 0]} scale={[0.72, 1.02, 0.08]}>
            <sphereGeometry args={[0.4, 32, 32]} />
            <meshPhysicalMaterial
              color="#c6994a"
              metalness={1}
              roughness={0.2}
              wireframe
            />
          </mesh>
        </group>
      </group>
    </Float>
  );
}

export default function JewelryNecklace({ className }: { className?: string }) {
  return (
    <div className={`canvas-container ${className || "aspect-square w-full"}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-3, 2, -2]} color="#d4b574" intensity={0.5} />
        <spotLight
          position={[0, 5, 2]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          color="#fff5e6"
        />
        <Necklace />
        <ContactShadows
          position={[0, -2, 0]}
          opacity={0.2}
          scale={5}
          blur={2.5}
        />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
