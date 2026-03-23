"use client";

import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import * as THREE from "three";

// ═══ Mouse tracker - tüm sahne mouse'a tepki verir ═══
function MouseTracker({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const smoothMouse = useRef({ x: 0, y: 0 });

  const handlePointerMove = useCallback((e: { point?: THREE.Vector3 }) => {
    if (e.point) {
      mouse.current.x = e.point.x * 0.15;
      mouse.current.y = e.point.y * 0.15;
    }
  }, []);

  useFrame(() => {
    smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * 0.03;
    smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * 0.03;

    if (groupRef.current) {
      groupRef.current.rotation.y = smoothMouse.current.x * 0.3;
      groupRef.current.rotation.x = -smoothMouse.current.y * 0.2;
    }
  });

  return (
    <>
      {/* Invisible plane to capture mouse */}
      <mesh
        position={[0, 0, 0]}
        onPointerMove={handlePointerMove}
        visible={false}
      >
        <planeGeometry args={[30, 30]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <group ref={groupRef}>{children}</group>
    </>
  );
}

// ═══ Ana yüzük - ortada dönen büyük altın yüzük ═══
function HeroRing() {
  const ringRef = useRef<THREE.Mesh>(null);
  const gemRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2.5 + Math.sin(t * 0.3) * 0.08;
      ringRef.current.rotation.z = t * 0.12;
    }
    if (gemRef.current) {
      gemRef.current.rotation.y = t * 0.5;
    }
  });

  return (
    <group position={[0, 0.2, 0]}>
      {/* Yüzük bandı */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.6, 0.14, 64, 128]} />
        <meshPhysicalMaterial
          color="#d4b574"
          metalness={1}
          roughness={0.12}
          envMapIntensity={2}
        />
      </mesh>

      {/* Taş yuvası */}
      <mesh position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.22, 0.3, 0.15, 8]} />
        <meshPhysicalMaterial
          color="#c6994a"
          metalness={1}
          roughness={0.18}
        />
      </mesh>

      {/* Ana taş - kristal */}
      <mesh ref={gemRef} position={[0, 1.72, 0]} rotation={[0, Math.PI / 4, 0]}>
        <octahedronGeometry args={[0.28, 0]} />
        <meshPhysicalMaterial
          color="#f5e6c8"
          metalness={0.05}
          roughness={0}
          transmission={0.92}
          thickness={0.8}
          ior={2.42}
          envMapIntensity={3}
          clearcoat={1}
          clearcoatRoughness={0}
        />
      </mesh>

      {/* Küçük yan taşlar */}
      {[-0.45, 0.45].map((x) => (
        <mesh key={x} position={[x, 1.35, x * 0.3]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshPhysicalMaterial
            color="#f0e8d4"
            transmission={0.85}
            ior={2.0}
            roughness={0}
            envMapIntensity={2}
          />
        </mesh>
      ))}
    </group>
  );
}

// ═══ Havada süzülen kolye pendant ═══
function FloatingPendant({ position, delay }: { position: [number, number, number]; delay: number }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime + delay;
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(t * 0.6) * 0.15;
      ref.current.rotation.y = t * 0.2;
      ref.current.rotation.z = Math.sin(t * 0.4) * 0.1;
    }
  });

  return (
    <group ref={ref} position={position} scale={0.5}>
      {/* Zincir halkası */}
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1, 0.015, 16, 32]} />
        <meshPhysicalMaterial color="#c6994a" metalness={1} roughness={0.2} />
      </mesh>
      {/* Çubuk */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.5, 8]} />
        <meshPhysicalMaterial color="#d4b574" metalness={1} roughness={0.15} />
      </mesh>
      {/* Damla */}
      <mesh position={[0, -0.2, 0]} scale={[0.6, 1, 0.4]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshPhysicalMaterial
          color="#e8d5b0"
          transmission={0.8}
          thickness={0.6}
          ior={2.0}
          roughness={0}
          envMapIntensity={2}
          iridescence={0.3}
        />
      </mesh>
    </group>
  );
}

// ═══ Havada süzülen küçük halka küpe ═══
function FloatingHoop({ position, delay, scale = 0.4 }: { position: [number, number, number]; delay: number; scale?: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime + delay;
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(t * 0.5) * 0.12;
      ref.current.rotation.x = Math.PI / 3 + Math.sin(t * 0.3) * 0.15;
      ref.current.rotation.y = t * 0.15;
    }
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <torusGeometry args={[0.8, 0.04, 32, 64]} />
      <meshPhysicalMaterial
        color="#d4b574"
        metalness={1}
        roughness={0.1}
        envMapIntensity={2.5}
      />
    </mesh>
  );
}

// ═══ Altın parçacıklar - mouse'a tepki verir ═══
function GoldDust() {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const count = isMobile ? 30 : 60;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { pointer } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6
      ),
      speed: 0.2 + Math.random() * 0.5,
      offset: Math.random() * Math.PI * 2,
      scale: 0.01 + Math.random() * 0.025,
    }));
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    particles.forEach((p, i) => {
      // Base floating animation
      const x = p.position.x + Math.sin(t * p.speed + p.offset) * 0.3;
      const y = p.position.y + Math.cos(t * p.speed * 0.7 + p.offset) * 0.2;
      const z = p.position.z + Math.sin(t * p.speed * 0.5 + p.offset * 2) * 0.15;

      // Mouse repulsion - parçacıklar mouse'tan hafifçe kaçar
      const mx = pointer.x * 4;
      const my = pointer.y * 3;
      const dx = x - mx;
      const dy = y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const repulsion = Math.max(0, 1 - dist / 3) * 0.5;

      dummy.position.set(
        x + dx * repulsion,
        y + dy * repulsion,
        z
      );

      // Parlaklık efekti - boyut titreşimi
      const flicker = 1 + Math.sin(t * 3 + p.offset) * 0.3;
      dummy.scale.setScalar(p.scale * flicker);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#d4b574"
        emissive="#c6994a"
        emissiveIntensity={0.8}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

// ═══ Dekoratif yüzen zincir parçası ═══
function FloatingChainSegment({ position, delay }: { position: [number, number, number]; delay: number }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime + delay;
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(t * 0.4) * 0.1;
      ref.current.rotation.z = Math.sin(t * 0.3) * 0.2;
      ref.current.rotation.y = t * 0.1;
    }
  });

  return (
    <group ref={ref} position={position} scale={0.35}>
      {[0, 0.35, 0.7, 1.05].map((offset, i) => (
        <mesh key={i} position={[offset, 0, 0]} rotation={[0, 0, i % 2 === 0 ? 0 : Math.PI / 4]}>
          <torusGeometry args={[0.12, 0.025, 16, 32]} />
          <meshPhysicalMaterial
            color="#d4b574"
            metalness={1}
            roughness={0.15}
            envMapIntensity={2}
          />
        </mesh>
      ))}
    </group>
  );
}

// ═══ Ana sahne ═══
export default function HeroCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 7], fov: 38 }}
      style={{ background: "transparent" }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, typeof window !== "undefined" && window.innerWidth < 768 ? 1 : 1.5]}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#fff8ee" />
      <pointLight position={[-4, 3, -3]} color="#d4b574" intensity={0.6} />
      <pointLight position={[3, -2, 2]} color="#f0e0c0" intensity={0.3} />

      <MouseTracker>
        {/* Ana yüzük */}
        <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.15}>
          <HeroRing />
        </Float>

        {/* Yüzen takı parçaları */}
        <FloatingPendant position={[-3.2, 0.8, -1]} delay={0} />
        <FloatingPendant position={[3.5, -0.5, -0.5]} delay={2} />
        <FloatingHoop position={[-2.5, -1.2, 0.5]} delay={1} scale={0.35} />
        <FloatingHoop position={[2.8, 1.5, -1.5]} delay={3} scale={0.28} />
        <FloatingChainSegment position={[1.8, -1.8, 0]} delay={0.5} />
        <FloatingChainSegment position={[-1.5, 2, -1]} delay={2.5} />
      </MouseTracker>

      {/* Altın parçacıklar */}
      <GoldDust />

      <Environment preset="studio" environmentIntensity={0.8} />
    </Canvas>
  );
}
