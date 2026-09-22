"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BoxPart } from "./PortTerminalZone";

interface ParcelData {
  offset: number;
  size: [number, number, number];
  color: string;
  hasLabel: boolean;
}

/**
 * Animated conveyor belt with parcels gliding along
 */
function ConveyorSystem({ position }: { position: [number, number, number] }) {
  const parcelsGroupRef = useRef<THREE.Group>(null);
  const laserRef = useRef<THREE.Mesh>(null);

  // Pre-generate 10 parcel profiles with varying sizes & cardboard tones
  const parcels: ParcelData[] = useMemo(
    () => [
      { offset: 0, size: [0.45, 0.35, 0.45], color: "#c29b68", hasLabel: true },
      { offset: 1.4, size: [0.6, 0.4, 0.42], color: "#b38955", hasLabel: true },
      { offset: 2.7, size: [0.38, 0.28, 0.38], color: "#d6ab78", hasLabel: false },
      { offset: 4.1, size: [0.55, 0.48, 0.45], color: "#9e7748", hasLabel: true },
      { offset: 5.5, size: [0.7, 0.35, 0.5], color: "#c29b68", hasLabel: true },
      { offset: 6.9, size: [0.42, 0.32, 0.42], color: "#b38955", hasLabel: false },
      { offset: 8.3, size: [0.5, 0.4, 0.4], color: "#d6ab78", hasLabel: true },
      { offset: 9.7, size: [0.65, 0.38, 0.48], color: "#9e7748", hasLabel: true },
    ],
    []
  );

  const beltLength = 11.2;

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const speed = 1.2;

    if (parcelsGroupRef.current) {
      parcelsGroupRef.current.children.forEach((child, i) => {
        const baseOffset = parcels[i].offset;
        const currentZ = ((baseOffset + elapsed * speed) % beltLength) - beltLength / 2;
        child.position.z = currentZ;

        // Subtle jitter as box rides over rollers
        child.position.y = 0.82 + Math.sin(elapsed * 12 + i) * 0.003;
      });
    }

    if (laserRef.current) {
      const mat = laserRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.opacity = 0.55 + Math.sin(elapsed * 10) * 0.25;
      }
    }
  });

  return (
    <group position={position}>
      {/* Belt Bed */}
      <BoxPart size={[1.1, 0.12, beltLength]} position={[0, 0.72, 0]} color="#1e2924" metal={0.4} />
      {/* Rubber Belt Top Surface */}
      <BoxPart size={[0.92, 0.02, beltLength]} position={[0, 0.79, 0]} color="#0a0f0d" roughness={0.9} />
      {/* Side Guide Rails */}
      <BoxPart size={[0.06, 0.18, beltLength]} position={[-0.52, 0.84, 0]} color="#d4f236" metal={0.6} />
      <BoxPart size={[0.06, 0.18, beltLength]} position={[0.52, 0.84, 0]} color="#d4f236" metal={0.6} />

      {/* Support Legs */}
      {Array.from({ length: 6 }, (_, i) => {
        const z = -4.5 + i * 1.8;
        return (
          <group key={i}>
            <BoxPart size={[0.1, 0.75, 0.1]} position={[-0.45, 0.375, z]} color="#36493f" metal={0.6} />
            <BoxPart size={[0.1, 0.75, 0.1]} position={[0.45, 0.375, z]} color="#36493f" metal={0.6} />
            <BoxPart size={[0.9, 0.08, 0.08]} position={[0, 0.3, z]} color="#36493f" />
          </group>
        );
      })}

      {/* Sliding Parcels */}
      <group ref={parcelsGroupRef}>
        {parcels.map((p, i) => (
          <group key={i} position={[0, 0.82, p.offset - beltLength / 2]}>
            <BoxPart size={p.size} color={p.color} radius={0.015} roughness={0.7} />
            {/* Barcode / shipping label on top */}
            {p.hasLabel && (
              <BoxPart
                size={[0.16, 0.01, 0.2]}
                position={[0.04, p.size[1] / 2 + 0.006, 0]}
                color="#f8fafc"
                roughness={0.4}
              />
            )}
          </group>
        ))}
      </group>

      {/* Optical Laser Scanner Portal Arch */}
      <group position={[0, 0, 0]}>
        {/* Arch Frame */}
        <BoxPart size={[0.14, 1.8, 0.14]} position={[-0.75, 1.5, 0]} color="#0c110e" metal={0.7} />
        <BoxPart size={[0.14, 1.8, 0.14]} position={[0.75, 1.5, 0]} color="#0c110e" metal={0.7} />
        <BoxPart size={[1.64, 0.18, 0.22]} position={[0, 2.4, 0]} color="#132119" metal={0.7} />

        {/* Status Indicator Screen on Top */}
        <BoxPart
          size={[0.8, 0.22, 0.06]}
          position={[0, 2.58, 0.12]}
          color="#d4f236"
          emissive="#d4f236"
          emissiveIntensity={0.6}
        />

        {/* Laser Scanner Emitters */}
        <BoxPart
          size={[0.9, 0.06, 0.06]}
          position={[0, 2.28, 0]}
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={0.9}
        />

        {/* Laser Curtain Effect (Semi-transparent red plane) */}
        <mesh ref={laserRef} position={[0, 1.5, 0]}>
          <planeGeometry args={[1.1, 1.5]} />
          <meshBasicMaterial
            color="#ef4444"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Diverter Pusher Chute Branch */}
      <group position={[1.4, 0, 2.5]}>
        <BoxPart size={[1.8, 0.1, 0.9]} position={[0, 0.65, 0]} rotation={[0, 0, -0.12]} color="#1e2924" />
        <BoxPart size={[0.08, 0.35, 0.08]} position={[-0.4, 0.95, -0.42]} color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.5} />
      </group>
    </group>
  );
}

/**
 * Secondary high-level sorting track curving above
 */
function OverheadGantry() {
  return (
    <group position={[0, 3.8, 0]}>
      {/* Heavy Steel Truss Beams */}
      <BoxPart size={[14, 0.35, 0.35]} position={[0, 0, -3.5]} color="#1c2d22" metal={0.7} />
      <BoxPart size={[14, 0.35, 0.35]} position={[0, 0, 3.5]} color="#1c2d22" metal={0.7} />
      {/* Industrial High-Bay Lights */}
      {[-4, 0, 4].map((x) => (
        <group key={x} position={[x, -0.2, 0]}>
          <BoxPart size={[0.4, 0.15, 0.4]} color="#0c110e" metal={0.8} />
          <BoxPart
            size={[0.3, 0.05, 0.3]}
            position={[0, -0.08, 0]}
            color="#ecfccb"
            emissive="#d4f236"
            emissiveIntensity={0.9}
          />
        </group>
      ))}
    </group>
  );
}

/**
 * Automated Sorting Hub Zone (Z = -28)
 */
export function SortingHubZone() {
  return (
    <group position={[0, 0, -28]}>
      {/* Warehouse Floor */}
      <BoxPart size={[16, 0.3, 16]} position={[0, -0.15, 0]} color="#0d1812" roughness={0.6} />

      {/* Painted Sorting Bay Lines */}
      {[-3, 0, 3].map((x) => (
        <BoxPart
          key={x}
          size={[0.1, 0.01, 14]}
          position={[x, 0.01, 0]}
          color="#334d3d"
          emissive="#334d3d"
          emissiveIntensity={0.2}
        />
      ))}

      {/* Main High-Speed Conveyor */}
      <ConveyorSystem position={[-0.8, 0, 0]} />

      {/* Parallel Secondary Return Conveyor */}
      <ConveyorSystem position={[2.8, 0, 1.2]} />

      {/* Pallet Staging Area with Sorted Totes */}
      <group position={[-4.0, 0, -2]}>
        {/* Wooden Pallet */}
        <BoxPart size={[1.6, 0.15, 1.6]} position={[0, 0.08, 0]} color="#85582f" roughness={0.9} />
        {/* Blue & Green Plastic Totes */}
        <BoxPart size={[0.7, 0.45, 0.7]} position={[-0.38, 0.38, -0.38]} color="#0284c7" />
        <BoxPart size={[0.7, 0.45, 0.7]} position={[0.38, 0.38, -0.38]} color="#16a34a" />
        <BoxPart size={[0.7, 0.45, 0.7]} position={[-0.38, 0.38, 0.38]} color="#16a34a" />
        <BoxPart size={[0.7, 0.45, 0.7]} position={[0.38, 0.38, 0.38]} color="#0284c7" />
        {/* Second Tier Totes */}
        <BoxPart size={[0.7, 0.45, 0.7]} position={[0, 0.85, 0]} color="#eab308" />
      </group>

      {/* Overhead Gantry & Industrial Lamps */}
      <OverheadGantry />
    </group>
  );
}
