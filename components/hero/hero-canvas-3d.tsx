"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

interface SceneProps {
  scrollProgress: number;
  mouseX: number;
  mouseY: number;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function MainRing({ progressRef, mouseRef }: {
  progressRef: React.RefObject<number>;
  mouseRef: React.RefObject<{ x: number; y: number }>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const smooth = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const p = progressRef.current ?? 0;
    const mx = mouseRef.current?.x ?? 0;
    const my = mouseRef.current?.y ?? 0;

    smooth.current.x += (mx - smooth.current.x) * 0.04;
    smooth.current.y += (my - smooth.current.y) * 0.04;

    const introScale = lerp(0.3, 1, p / 0.15);
    const showcaseRot = lerp(0, Math.PI * 2, (p - 0.15) / 0.35);
    const shift = lerp(0, -2.5, (p - 0.45) / 0.2);
    const returnShift = lerp(0, 2.5, (p - 0.65) / 0.2);
    const fade = lerp(1, 0, (p - 0.88) / 0.12);
    const zoom = lerp(1, 1.4, (p - 0.2) / 0.3) * lerp(1, 0.9, (p - 0.6) / 0.25);

    groupRef.current.position.x = shift + returnShift;
    groupRef.current.position.y = Math.sin(t * 0.4) * 0.08 + lerp(3, 0, p / 0.15);
    groupRef.current.rotation.x = Math.PI / 2.8 + showcaseRot * 0.15 + smooth.current.y * 0.12 + Math.sin(t * 0.2) * 0.03;
    groupRef.current.rotation.y = showcaseRot + smooth.current.x * 0.2 + t * 0.05;
    groupRef.current.scale.setScalar(introScale * zoom * fade);
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <torusGeometry args={[1.5, 0.12, 64, 128]} />
        <meshPhysicalMaterial color="#d4b574" metalness={1} roughness={0.1} envMapIntensity={2.5} />
      </mesh>
      <mesh>
        <torusGeometry args={[1.5, 0.06, 32, 128]} />
        <meshPhysicalMaterial color="#b8862f" metalness={1} roughness={0.25} envMapIntensity={1.5} />
      </mesh>
      <mesh position={[0, 0, 1.45]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.28, 0.14, 6]} />
        <meshPhysicalMaterial color="#c6994a" metalness={1} roughness={0.15} />
      </mesh>
      <mesh position={[0, 0, 1.62]} rotation={[Math.PI / 2, Math.PI / 4, 0]}>
        <octahedronGeometry args={[0.24, 0]} />
        <meshPhysicalMaterial
          color="#f8ecd4"
          metalness={0.02}
          roughness={0}
          transmission={0.94}
          thickness={0.6}
          ior={2.42}
          envMapIntensity={4}
          clearcoat={1}
        />
      </mesh>
      {[-0.35, 0.35].map((offset) => (
        <mesh key={offset} position={[offset, 0, 1.38]} rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshPhysicalMaterial color="#f0e6d2" transmission={0.88} ior={2.0} roughness={0} envMapIntensity={3} />
        </mesh>
      ))}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.5, Math.sin(a) * 1.5, 0.12 * Math.sin(a * 3)]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshPhysicalMaterial color="#e8d5b0" transmission={0.7} ior={1.8} roughness={0} />
          </mesh>
        );
      })}
    </group>
  );
}

function FloatingPieces({ progressRef }: { progressRef: React.RefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);

  const pieces = useMemo(() => [
    { pos: [-4, 2, -2], speed: 0.3 },
    { pos: [4.5, -1, -1.5], speed: 0.4 },
    { pos: [-3.5, -2, -1], speed: 0.25 },
    { pos: [3, 2.5, -2.5], speed: 0.35 },
    { pos: [-2, 3, -3], speed: 0.2 },
    { pos: [2.5, -3, -2], speed: 0.3 },
  ], []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const p = progressRef.current ?? 0;
    const appear = lerp(0, 1, (p - 0.1) / 0.2);
    const fade = lerp(1, 0, (p - 0.8) / 0.2);
    groupRef.current.scale.setScalar(appear * fade);

    groupRef.current.children.forEach((child, i) => {
      const piece = pieces[i];
      if (!piece) return;
      const t = state.clock.elapsedTime;
      child.position.y = piece.pos[1] + Math.sin(t * piece.speed + i) * 0.2;
      child.rotation.y = t * piece.speed * 0.5;
    });
  });

  return (
    <group ref={groupRef}>
      {pieces.map((p, i) => (
        <group key={i} position={[p.pos[0], p.pos[1], p.pos[2]]}>
          {i < 2 ? (
            <mesh scale={0.35}>
              <torusGeometry args={[0.8, 0.035, 24, 48]} />
              <meshPhysicalMaterial color="#d4b574" metalness={1} roughness={0.12} envMapIntensity={2} />
            </mesh>
          ) : i < 4 ? (
            <group scale={0.3}>
              <mesh position={[0, 0.3, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 0.6, 8]} />
                <meshPhysicalMaterial color="#c6994a" metalness={1} roughness={0.2} />
              </mesh>
              <mesh scale={[0.5, 0.8, 0.3]}>
                <sphereGeometry args={[0.3, 24, 24]} />
                <meshPhysicalMaterial color="#e8d5b0" transmission={0.8} ior={2.0} roughness={0} envMapIntensity={2} />
              </mesh>
            </group>
          ) : (
            <group scale={0.25}>
              {[0, 0.3, 0.6].map((off, j) => (
                <mesh key={j} position={[off, 0, 0]} rotation={[0, 0, j % 2 === 0 ? 0 : Math.PI / 3]}>
                  <torusGeometry args={[0.1, 0.02, 12, 24]} />
                  <meshPhysicalMaterial color="#d4b574" metalness={1} roughness={0.15} />
                </mesh>
              ))}
            </group>
          )}
        </group>
      ))}
    </group>
  );
}

function GoldParticles({ progressRef, mouseRef }: {
  progressRef: React.RefObject<number>;
  mouseRef: React.RefObject<{ x: number; y: number }>;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 80;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 8 - 2
        ),
        speed: 0.15 + Math.random() * 0.4,
        offset: Math.random() * Math.PI * 2,
        size: 0.008 + Math.random() * 0.02,
      })),
    []
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const p = progressRef.current ?? 0;
    const mx = mouseRef.current?.x ?? 0;
    const my = mouseRef.current?.y ?? 0;
    const density = lerp(0.3, 1, p / 0.3);
    const fadeOut = lerp(1, 0, (p - 0.85) / 0.15);

    particles.forEach((pt, i) => {
      const x = pt.pos.x + Math.sin(t * pt.speed + pt.offset) * 0.4;
      const y = pt.pos.y + Math.cos(t * pt.speed * 0.7 + pt.offset) * 0.3;
      const z = pt.pos.z + Math.sin(t * pt.speed * 0.4 + pt.offset * 2) * 0.2;
      const dx = x - mx * 5;
      const dy = y - my * 4;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const repel = Math.max(0, 1 - dist / 4) * 0.6;

      dummy.position.set(x + dx * repel, y + dy * repel, z);
      const flicker = 1 + Math.sin(t * 4 + pt.offset) * 0.4;
      const visible = i < count * density ? 1 : 0;
      dummy.scale.setScalar(pt.size * flicker * visible * fadeOut);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial color="#d4b574" emissive="#c6994a" emissiveIntensity={1} toneMapped={false} />
    </instancedMesh>
  );
}

function Scene({ scrollProgress, mouseX, mouseY }: SceneProps) {
  const progressRef = useRef(scrollProgress);
  const mouseRef = useRef({ x: mouseX, y: mouseY });
  progressRef.current = scrollProgress;
  mouseRef.current = { x: mouseX, y: mouseY };

  useFrame((state) => {
    const cam = state.camera;
    const p = progressRef.current ?? 0;
    const targetZ = lerp(9, 5.5, p / 0.4);
    const targetY = lerp(1, 0.3, p / 0.3);
    cam.position.z += (targetZ - cam.position.z) * 0.05;
    cam.position.y += (targetY - cam.position.y) * 0.05;
    cam.position.x += ((mouseRef.current?.x ?? 0) * 0.3 - cam.position.x) * 0.02;
  });

  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[6, 8, 5]} intensity={1.3} color="#fff8ee" />
      <pointLight position={[-4, 3, -3]} color="#d4b574" intensity={0.5} />
      <pointLight position={[3, -2, 4]} color="#f0e0c0" intensity={0.3} />
      <spotLight position={[0, 8, 3]} angle={0.2} penumbra={1} intensity={0.6} color="#fff5e6" />
      <MainRing progressRef={progressRef} mouseRef={mouseRef} />
      <FloatingPieces progressRef={progressRef} />
      <GoldParticles progressRef={progressRef} mouseRef={mouseRef} />
      <Environment preset="studio" environmentIntensity={0.9} />
    </>
  );
}

export default function HeroCanvas3D({ scrollProgress, mouseX, mouseY }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 1, 9], fov: 36 }}
      style={{ background: "transparent" }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, typeof window !== "undefined" && window.innerWidth < 768 ? 1 : 1.5]}
    >
      <Scene scrollProgress={scrollProgress} mouseX={mouseX} mouseY={mouseY} />
    </Canvas>
  );
}
