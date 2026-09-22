"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BoxPart } from "../zones/PortTerminalZone";

/**
 * European Style Semi-Truck & 40ft Container Trailer
 * Optimized for both Side Orthographic View (Screenshot 2)
 * and Top-Down 90° Bird's Eye View (Screenshot 3)
 */
export function LogisticsSemiTruck({
  scrollProgressRef,
  position = [0, 0, 0],
  motionEnabled = true,
}: {
  scrollProgressRef?: { current: number };
  position?: [number, number, number];
  motionEnabled?: boolean;
}) {
  const truckGroupRef = useRef<THREE.Group>(null);
  const wheelsGroupRef = useRef<THREE.Group>(null);

  // Define sweeping road path for the truck as scroll progresses between 0.18 and 0.58
  // 1. Straight highway drive (0.18 to 0.35)
  // 2. 90-degree sweeping curve at T-junction (0.35 to 0.55)
  useFrame(({ clock }) => {
    if (!motionEnabled) return;
    const elapsed = clock.getElapsedTime();
    const scrollProgress = scrollProgressRef ? scrollProgressRef.current : 0;

    if (truckGroupRef.current) {
      // Normalizing progress between 0.20 and 0.65
      const p = Math.max(0, Math.min(1, (scrollProgress - 0.20) / 0.45));

      if (p < 0.48) {
        // Straight side-driving section (Screenshot 2, cases)
        const straightProgress = p / 0.48;
        truckGroupRef.current.position.x = -10 + straightProgress * 14;
        truckGroupRef.current.position.z = 0;
        truckGroupRef.current.rotation.y = Math.PI / 2;
      } else {
        // Turning through 90° asphalt junction (Screenshot 3, other-works)
        const turnProgress = (p - 0.48) / 0.52;
        const angle = Math.PI / 2 - turnProgress * (Math.PI / 2);
        const radius = 6.5;

        truckGroupRef.current.position.x = 4 + Math.cos(angle) * radius;
        truckGroupRef.current.position.z = -radius + Math.sin(angle) * radius;
        truckGroupRef.current.rotation.y = angle + Math.PI / 2;
      }
    }

    // Wheel rotation animation
    if (wheelsGroupRef.current) {
      wheelsGroupRef.current.children.forEach((w) => {
        w.rotation.x = elapsed * 14;
      });
    }
  });

  return (
    <group position={position}>
      {/* Truck Entity */}
      <group ref={truckGroupRef} position={[-8, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        {/* Cab Tractor (Black European High-Roof Sleeper) */}
        <group position={[0, 0, 3.2]}>
          {/* Main Cab Body */}
          <BoxPart size={[1.8, 1.9, 1.8]} position={[0, 1.45, 0]} color="#0c110e" radius={0.06} metal={0.6} />

          {/* Aerodynamic High-Roof Wind Deflector */}
          <BoxPart size={[1.76, 0.65, 1.5]} position={[0, 2.65, -0.1]} color="#0c110e" radius={0.08} />

          {/* Tinted Curved Windshield */}
          <BoxPart
            size={[1.6, 0.75, 0.08]}
            position={[0, 1.8, 0.91]}
            color="#0f172a"
            metal={0.9}
            roughness={0.1}
          />

          {/* Front Grille */}
          <BoxPart size={[1.5, 0.7, 0.08]} position={[0, 0.85, 0.92]} color="#1e293b" metal={0.8} />

          {/* LED Headlights */}
          <BoxPart
            size={[0.3, 0.16, 0.08]}
            position={[-0.65, 0.65, 0.93]}
            color="#fef08a"
            emissive="#fef08a"
            emissiveIntensity={0.9}
          />
          <BoxPart
            size={[0.3, 0.16, 0.08]}
            position={[0.65, 0.65, 0.93]}
            color="#fef08a"
            emissive="#fef08a"
            emissiveIntensity={0.9}
          />

          {/* Aerodynamic Side Skirts & Chrome Fuel Tank */}
          <BoxPart size={[0.35, 0.55, 1.6]} position={[-0.95, 0.55, -0.4]} color="#94a3b8" metal={0.8} />
          <BoxPart size={[0.35, 0.55, 1.6]} position={[0.95, 0.55, -0.4]} color="#94a3b8" metal={0.8} />
        </group>

        {/* 40ft Trailer Chassis Frame */}
        <BoxPart size={[1.7, 0.2, 8.8]} position={[0, 0.85, -1.8]} color="#1e293b" metal={0.8} />

        {/* 40ft Corrugated White/Silver Container (Matching Screenshot 2 & 3) */}
        <group position={[0, 2.05, -1.8]}>
          <BoxPart size={[1.82, 2.15, 8.4]} color="#e2e8f0" radius={0.04} roughness={0.35} />

          {/* Side Corrugations */}
          {[-0.92, 0.92].map((sideX) =>
            Array.from({ length: 32 }, (_, idx) => (
              <BoxPart
                key={`${sideX}-${idx}`}
                size={[0.04, 1.95, 0.12]}
                position={[sideX, 0, -3.9 + idx * 0.25]}
                color="#cbd5e1"
                radius={0.008}
              />
            ))
          )}

          {/* Roof Corrugation Ribs (Prominent in Top-down view) */}
          {Array.from({ length: 32 }, (_, idx) => (
            <BoxPart
              key={`roof-${idx}`}
              size={[1.7, 0.04, 0.12]}
              position={[0, 1.09, -3.9 + idx * 0.25]}
              color="#cbd5e1"
              radius={0.008}
            />
          ))}
        </group>

        {/* Heavy Wheels Assembly */}
        <group ref={wheelsGroupRef}>
          {/* Cab Front Steering Wheels */}
          <group position={[-0.95, 0.5, 3.8]}>
            <BoxPart size={[0.22, 1.0, 1.0]} color="#090d0b" radius={0.2} roughness={0.9} />
            <BoxPart size={[0.24, 0.5, 0.5]} color="#94a3b8" radius={0.08} metal={0.7} />
          </group>
          <group position={[0.95, 0.5, 3.8]}>
            <BoxPart size={[0.22, 1.0, 1.0]} color="#090d0b" radius={0.2} roughness={0.9} />
            <BoxPart size={[0.24, 0.5, 0.5]} color="#94a3b8" radius={0.08} metal={0.7} />
          </group>

          {/* Cab Rear Drive Wheels */}
          {[-0.95, 0.95].map((x) => (
            <group key={x} position={[x, 0.5, 2.1]}>
              <BoxPart size={[0.26, 1.0, 1.0]} color="#090d0b" radius={0.2} roughness={0.9} />
              <BoxPart size={[0.28, 0.5, 0.5]} color="#94a3b8" radius={0.08} metal={0.7} />
            </group>
          ))}

          {/* Trailer Triple Axles (6 Wheels) */}
          {[-4.2, -5.2, -6.2].map((z) =>
            [-0.95, 0.95].map((x) => (
              <group key={`${x}-${z}`} position={[x, 0.5, z]}>
                <BoxPart size={[0.25, 1.0, 1.0]} color="#090d0b" radius={0.2} roughness={0.9} />
                <BoxPart size={[0.27, 0.5, 0.5]} color="#94a3b8" radius={0.08} metal={0.7} />
              </group>
            ))
          )}
        </group>
      </group>

      {/* Asphalt Highway & T-Junction Road with Paint Markings */}
      <group position={[0, -0.05, -12]}>
        {/* Asphalt Ground Surface */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[36, 36]} />
          <meshStandardMaterial color="#0b110e" roughness={0.9} />
        </mesh>

        {/* Straight Lane Dashed White Lines */}
        {Array.from({ length: 14 }, (_, i) => (
          <BoxPart
            key={i}
            size={[1.2, 0.02, 0.16]}
            position={[-14 + i * 2.2, 0.02, 12]}
            color="#f8fafc"
            emissive="#f8fafc"
            emissiveIntensity={0.2}
          />
        ))}

        {/* Sweeping Curve Painted Road Boundary & Islands */}
        <BoxPart size={[0.18, 0.02, 18]} position={[-6.2, 0.02, 0]} color="#f8fafc" />
        <BoxPart size={[0.18, 0.02, 18]} position={[6.2, 0.02, 0]} color="#f8fafc" />
      </group>
    </group>
  );
}
