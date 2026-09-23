"use client";

import { useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PartProps {
  size: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  radius?: number;
  metal?: number;
  roughness?: number;
  emissive?: string;
  emissiveIntensity?: number;
}

export function BoxPart({
  size,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color,
  radius = 0.02,
  metal = 0.2,
  roughness = 0.5,
  emissive,
  emissiveIntensity = 0,
}: PartProps) {
  return (
    <RoundedBox args={size} position={position} rotation={rotation} radius={radius} smoothness={2}>
      <meshStandardMaterial
        color={color}
        metalness={metal}
        roughness={roughness}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
      />
    </RoundedBox>
  );
}

/**
 * Detailed Maersk shipping container model
 */
export function ShippingContainer({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = "#42b0d5",
  active = false,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  active?: boolean;
}) {
  const edgeColor = active ? "#95e0f7" : color;
  const edgeEmissive = active ? color : undefined;
  const edgeIntensity = active ? 0.35 : 0;

  return (
    <group position={position} rotation={rotation}>
      {/* Main container body */}
      <BoxPart size={[3.2, 1.25, 1.25]} color={color} radius={0.03} />

      {/* Corrugated ribs */}
      {[-1, 1].map((side) => (
        <group key={side}>
          {Array.from({ length: 18 }, (_, i) => (
            <BoxPart
              key={i}
              size={[0.07, 1.12, 0.035]}
              position={[-1.4 + i * 0.165, 0, side * 0.635]}
              color={color}
              radius={0.008}
            />
          ))}
          {/* Edge rails */}
          <BoxPart
            size={[3.25, 0.09, 0.09]}
            position={[0, side * 0.58, 0.635]}
            color={edgeColor}
            radius={0.01}
            emissive={edgeEmissive}
            emissiveIntensity={edgeIntensity}
          />
          {/* Corner posts */}
          <BoxPart
            size={[0.1, 1.26, 1.28]}
            position={[side * 1.58, 0, 0]}
            color={edgeColor}
            radius={0.012}
            emissive={edgeEmissive}
            emissiveIntensity={edgeIntensity}
          />
        </group>
      ))}

      {/* Roof ribs */}
      {Array.from({ length: 18 }, (_, i) => (
        <BoxPart
          key={i}
          size={[0.07, 0.035, 1.15]}
          position={[-1.4 + i * 0.165, 0.635, 0]}
          color={color}
          radius={0.008}
        />
      ))}

      {/* Door rods and lock handles */}
      {[-0.3, 0.3].map((z) => (
        <group key={z}>
          <BoxPart size={[0.035, 1.05, 0.52]} position={[1.62, 0, z]} color="#3499bb" radius={0.006} />
          <BoxPart size={[0.05, 0.95, 0.028]} position={[1.65, 0, z]} color="#d9e1df" metal={0.7} radius={0.005} />
          <BoxPart size={[0.08, 0.04, 0.15]} position={[1.67, -0.15, z]} color="#d9e1df" metal={0.7} radius={0.004} />
        </group>
      ))}
    </group>
  );
}

/**
 * Gantry quay crane structure in background
 */
function QuayCrane({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 4 Leg pillars */}
      <BoxPart size={[0.2, 7.5, 0.2]} position={[-1.5, 3.75, -1.2]} color="#1f3328" metal={0.5} />
      <BoxPart size={[0.2, 7.5, 0.2]} position={[1.5, 3.75, -1.2]} color="#1f3328" metal={0.5} />
      <BoxPart size={[0.2, 7.5, 0.2]} position={[-1.5, 3.75, 1.2]} color="#1f3328" metal={0.5} />
      <BoxPart size={[0.2, 7.5, 0.2]} position={[1.5, 3.75, 1.2]} color="#1f3328" metal={0.5} />

      {/* Cross beams */}
      <BoxPart size={[3.4, 0.25, 0.2]} position={[0, 4.2, -1.2]} color="#2d4839" />
      <BoxPart size={[3.4, 0.25, 0.2]} position={[0, 4.2, 1.2]} color="#2d4839" />
      <BoxPart size={[0.2, 0.25, 2.6]} position={[-1.5, 4.2, 0]} color="#2d4839" />
      <BoxPart size={[0.2, 0.25, 2.6]} position={[1.5, 4.2, 0]} color="#2d4839" />

      {/* Main Boom arm extending outwards */}
      <BoxPart size={[8.5, 0.35, 1.8]} position={[1.5, 7.2, 0]} color="#3a5a48" metal={0.6} />

      {/* Trolley and spreader */}
      <BoxPart size={[0.9, 0.3, 1.0]} position={[2.5, 6.9, 0]} color="#d4f236" emissive="#d4f236" emissiveIntensity={0.2} />
      {/* Cables */}
      <BoxPart size={[0.02, 2.2, 0.02]} position={[2.2, 5.7, -0.3]} color="#cbd5e1" metal={0.8} />
      <BoxPart size={[0.02, 2.2, 0.02]} position={[2.8, 5.7, -0.3]} color="#cbd5e1" metal={0.8} />
      <BoxPart size={[0.02, 2.2, 0.02]} position={[2.2, 5.7, 0.3]} color="#cbd5e1" metal={0.8} />
      <BoxPart size={[0.02, 2.2, 0.02]} position={[2.8, 5.7, 0.3]} color="#cbd5e1" metal={0.8} />

      {/* Spreader holding container mock */}
      <BoxPart size={[2.2, 0.15, 0.9]} position={[2.5, 4.5, 0]} color="#0c1510" metal={0.8} />
      {/* Warning beacon on crane top */}
      <BoxPart size={[0.15, 0.2, 0.15]} position={[-1.5, 7.6, 0]} color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} />
    </group>
  );
}

/**
 * Inbound Port Zone (Z = 0)
 */
export function PortTerminalZone() {
  const beaconRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (beaconRef.current) {
      const material = beaconRef.current.material as THREE.MeshStandardMaterial;
      if (material) {
        material.emissiveIntensity = 0.4 + Math.sin(clock.getElapsedTime() * 3.5) * 0.4;
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Concrete Dock Pier */}
      <BoxPart size={[14, 0.4, 14]} position={[0, -0.2, 0]} color="#132119" roughness={0.8} />

      {/* Safety Hazard Strips on Dock Edge */}
      {Array.from({ length: 12 }, (_, i) => (
        <BoxPart
          key={i}
          size={[0.4, 0.02, 0.15]}
          position={[-2.8 + i * 0.5, 0.01, 3.8]}
          rotation={[0, 0.6, 0]}
          color={i % 2 === 0 ? "#d4f236" : "#0c110e"}
          emissive={i % 2 === 0 ? "#d4f236" : undefined}
          emissiveIntensity={i % 2 === 0 ? 0.3 : 0}
        />
      ))}

      {/* Primary hero container */}
      <ShippingContainer
        position={[0, 0.65, 0]}
        rotation={[0.04, -0.32, -0.05]}
        color="#42b0d5"
        active
      />

      {/* Background Container Stacks */}
      {/* Stack Left */}
      <ShippingContainer position={[-4.5, 0.65, -1.8]} rotation={[0, 0.15, 0]} color="#b91c1c" />
      <ShippingContainer position={[-4.3, 1.95, -1.7]} rotation={[0, 0.15, 0]} color="#0284c7" />
      <ShippingContainer position={[-4.2, 0.65, 1.5]} rotation={[0, 0.1, 0]} color="#d97706" />

      {/* Stack Right */}
      <ShippingContainer position={[4.6, 0.65, -1.5]} rotation={[0, -0.2, 0]} color="#15803d" />
      <ShippingContainer position={[4.4, 1.95, -1.6]} rotation={[0, -0.2, 0]} color="#42b0d5" />
      <ShippingContainer position={[4.5, 0.65, 1.8]} rotation={[0, -0.1, 0]} color="#b45309" />

      {/* Gantry Quay Crane in the background */}
      <QuayCrane position={[1.8, 0, -5.5]} />

      {/* Navigation Beacon Buoy */}
      <group position={[-3.5, 0, 3.2]}>
        <BoxPart size={[0.3, 1.1, 0.3]} position={[0, 0.55, 0]} color="#334155" metal={0.6} />
        <mesh ref={beaconRef} position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} />
        </mesh>
      </group>
    </group>
  );
}
