"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BoxPart } from "../zones/PortTerminalZone";

/**
 * Procedural Giant Ocean Container Cargo Ship
 * Inspired by United Carriers Awwwards-winning ocean aerial shot
 */
export function ContainerShip({
  position = [0, 0, 0],
  motionEnabled = true,
}: {
  position?: [number, number, number];
  motionEnabled?: boolean;
}) {
  const wakeRef = useRef<THREE.Group>(null);
  const shipGroupRef = useRef<THREE.Group>(null);

  // Pre-generate colorful container bay layout (5 bays long, 4 containers wide, 2-3 tiers high)
  const containerBays = useMemo(() => {
    const colors = [
      "#42b0d5", // Maersk blue
      "#dc2626", // Red
      "#16a34a", // Green
      "#f8fafc", // White
      "#eab308", // Yellow
      "#2563eb", // Deep blue
      "#d97706", // Amber
      "#c026d3", // Magenta
    ];

    const bays: Array<{
      pos: [number, number, number];
      size: [number, number, number];
      color: string;
    }> = [];

    const numBays = 6;
    const numCols = 4;

    for (let b = 0; b < numBays; b++) {
      const bayZ = -6.5 + b * 2.5;
      for (let c = 0; c < numCols; c++) {
        const colX = -1.35 + c * 0.9;
        const tiers = (b === 0 || b === numBays - 1) ? 2 : 3;
        for (let t = 0; t < tiers; t++) {
          const color = colors[(b * numCols * 3 + c * 2 + t) % colors.length];
          bays.push({
            pos: [colX, 1.45 + t * 0.72, bayZ],
            size: [0.82, 0.68, 2.3],
            color,
          });
        }
      }
    }
    return bays;
  }, []);

  useFrame(({ clock }) => {
    if (!motionEnabled) return;
    const t = clock.getElapsedTime();

    // Subtle oceanic pitching and rolling
    if (shipGroupRef.current) {
      shipGroupRef.current.position.y = Math.sin(t * 1.2) * 0.08;
      shipGroupRef.current.rotation.z = Math.sin(t * 0.9) * 0.015;
      shipGroupRef.current.rotation.x = Math.cos(t * 0.8) * 0.01;
    }

    // Foaming wake wave pulse animation
    if (wakeRef.current) {
      wakeRef.current.children.forEach((mesh, idx) => {
        const mat = (mesh as THREE.Mesh).material as THREE.MeshBasicMaterial;
        if (mat) {
          mat.opacity = 0.5 + Math.sin(t * 3.5 + idx) * 0.25;
        }
      });
    }
  });

  return (
    <group position={position}>
      {/* Deep Ocean Blue Water Surface */}
      <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[48, 64]} />
        <meshStandardMaterial
          color="#031d38"
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>

      {/* Foaming Water Wake Trails */}
      <group ref={wakeRef} position={[0, 0.05, 0]}>
        {/* Bow Port Wave */}
        <mesh position={[-2.4, 0, -11]} rotation={[-Math.PI / 2, 0, 0.35]}>
          <planeGeometry args={[1.2, 8]} />
          <meshBasicMaterial color="#e0f2fe" transparent opacity={0.65} />
        </mesh>
        {/* Bow Starboard Wave */}
        <mesh position={[2.4, 0, -11]} rotation={[-Math.PI / 2, 0, -0.35]}>
          <planeGeometry args={[1.2, 8]} />
          <meshBasicMaterial color="#e0f2fe" transparent opacity={0.65} />
        </mesh>

        {/* Stern Frothy Propeller Wake */}
        <mesh position={[0, 0, 14]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4.2, 18]} />
          <meshBasicMaterial color="#f0f9ff" transparent opacity={0.4} />
        </mesh>
      </group>

      {/* Ship Hull Group */}
      <group ref={shipGroupRef}>
        {/* Main Midship Hull (Dark Naval Steel) */}
        <BoxPart size={[4.2, 2.2, 17]} position={[0, 0.4, 0.5]} color="#0f172a" roughness={0.4} metal={0.7} />

        {/* Red Anti-fouling Waterline Stripe */}
        <BoxPart size={[4.25, 0.35, 17.1]} position={[0, -0.4, 0.5]} color="#991b1b" roughness={0.5} />

        {/* Pointed Bow Section */}
        <group position={[0, 0.4, -9.5]}>
          <BoxPart size={[3.4, 2.2, 3.5]} position={[0, 0, 0]} color="#0f172a" metal={0.7} />
          <BoxPart size={[2.2, 2.4, 2.5]} position={[0, 0.1, -1.8]} color="#0f172a" metal={0.7} />
          {/* Bulbous Bow Tip */}
          <BoxPart size={[0.8, 1.8, 1.8]} position={[0, -0.2, -3.2]} color="#991b1b" />
          {/* Forward Forecastle Deck with Mooring Winches */}
          <BoxPart size={[2.8, 0.15, 3.2]} position={[0, 1.2, -0.8]} color="#334155" metal={0.8} />
          <BoxPart size={[0.3, 0.5, 0.3]} position={[0, 1.45, -1.8]} color="#e2e8f0" metal={0.9} />
        </group>

        {/* Transom Stern Section */}
        <group position={[0, 0.4, 9.8]}>
          <BoxPart size={[4.0, 2.2, 2.2]} color="#0f172a" metal={0.7} />
        </group>

        {/* Cargo Holds Deck Cell Guides */}
        <BoxPart size={[4.0, 0.2, 16]} position={[0, 1.25, -0.5]} color="#1e293b" metal={0.8} />

        {/* Rows of Stacked Containers */}
        {containerBays.map((b, idx) => (
          <BoxPart
            key={idx}
            size={b.size}
            position={b.pos}
            color={b.color}
            radius={0.012}
            roughness={0.45}
            metal={0.15}
          />
        ))}

        {/* Stern Superstructure / Bridge Navigation Tower */}
        <group position={[0, 0, 7.8]}>
          {/* Accommodations Block */}
          <BoxPart size={[3.6, 2.8, 2.0]} position={[0, 2.6, 0]} color="#f1f5f9" roughness={0.3} />
          {/* Bridge Wings & Wheelhouse */}
          <BoxPart size={[4.4, 0.7, 1.4]} position={[0, 4.2, 0]} color="#f8fafc" />
          {/* Wheelhouse Windows (Cyan reflective) */}
          <BoxPart
            size={[4.3, 0.32, 1.42]}
            position={[0, 4.25, 0]}
            color="#082f49"
            emissive="#38bdf8"
            emissiveIntensity={0.4}
          />
          {/* Radar Mast on top of Bridge */}
          <BoxPart size={[0.15, 1.6, 0.15]} position={[0, 5.3, 0]} color="#475569" metal={0.9} />
          <BoxPart size={[1.2, 0.1, 0.1]} position={[0, 5.8, 0]} color="#cbd5e1" metal={0.8} />
          {/* Exhaust Funnel (Maersk Sky Blue with Black Top) */}
          <BoxPart size={[0.8, 1.8, 0.9]} position={[0, 3.4, 1.4]} color="#42b0d5" />
          <BoxPart size={[0.82, 0.35, 0.92]} position={[0, 4.2, 1.4]} color="#0f172a" />
        </group>

        {/* Holographic Radar Callout Targets (Matching Screenshot 5) */}
        {/* Reticle 1: Full Supply Chain Visibility (at midship) */}
        <group position={[-2.8, 2.8, -2.5]}>
          <mesh>
            <torusGeometry args={[0.55, 0.02, 16, 32]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1} />
          </mesh>
          {/* Dashed Leader Line */}
          <BoxPart size={[1.6, 0.02, 0.02]} position={[-0.9, 0, 0]} color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.8} />
        </group>

        {/* Reticle 2: SLA & Data Pipelines (at bow) */}
        <group position={[2.8, 2.6, -7.0]}>
          <mesh>
            <torusGeometry args={[0.55, 0.02, 16, 32]} />
            <meshBasicMaterial color="#d4f236" transparent opacity={0.85} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#d4f236" emissive="#d4f236" emissiveIntensity={1} />
          </mesh>
          <BoxPart size={[1.6, 0.02, 0.02]} position={[0.9, 0, 0]} color="#d4f236" emissive="#d4f236" emissiveIntensity={0.8} />
        </group>
      </group>
    </group>
  );
}
