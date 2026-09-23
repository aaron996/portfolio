"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BoxPart } from "../zones/PortTerminalZone";
import { getTransferPose, TRANSFER_GEOMETRY, type LogisticsJourneyStore } from "../LogisticsJourney";

/**
 * European Style Semi-Truck & 40ft Container Trailer
 * Optimized for both Side Orthographic View (Screenshot 2)
 * and Top-Down 90° Bird's Eye View (Screenshot 3)
 */
export function LogisticsSemiTruck({
  journeyStore,
  position = [0, 0, 0],
  motionEnabled = true,
}: {
  journeyStore: LogisticsJourneyStore;
  position?: [number, number, number];
  motionEnabled?: boolean;
}) {
  const truckGroupRef = useRef<THREE.Group>(null);
  const wheelsGroupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!motionEnabled) return;
    const pose = getTransferPose(journeyStore.current);

    if (truckGroupRef.current) {
      truckGroupRef.current.position.set(pose.truck.x, 0, pose.truck.z);
      truckGroupRef.current.rotation.y = pose.truck.yaw;
    }

    if (wheelsGroupRef.current) {
      // Distance-derived, reversible wheel rotation: parked wheels remain still.
      const travelDistance = pose.truck.distance;
      wheelsGroupRef.current.children.forEach((w) => {
        w.rotation.x = travelDistance / 0.5;
      });
    }
  });

  return (
    <group position={position}>
      {/* Truck Entity */}
      <group ref={truckGroupRef} position={[0, 0, 2]}>
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
        <BoxPart size={[TRANSFER_GEOMETRY.trailerWidth, 0.2, 8.8]} position={[0, TRANSFER_GEOMETRY.trailerDeckY - 0.1, TRANSFER_GEOMETRY.trailerCenterZ]} color="#1e293b" metal={0.8} />


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
