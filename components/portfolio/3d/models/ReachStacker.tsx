"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BoxPart } from "../zones/PortTerminalZone";
import { getTransferPose, TRANSFER_GEOMETRY, type LogisticsJourneyStore } from "../LogisticsJourney";

/**
 * Reach Stacker / Container Handler Crane (Matching Screenshot 1)
 */
export function ReachStacker({
  position = [0, 0, 0],
  journeyStore,
  motionEnabled = true,
}: {
  position?: [number, number, number];
  journeyStore: LogisticsJourneyStore;
  motionEnabled?: boolean;
}) {
  const liftGroupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!motionEnabled) return;
    if (liftGroupRef.current) {
      const spreader = getTransferPose(journeyStore.current).spreader;
      liftGroupRef.current.position.set(spreader.x, spreader.y, spreader.z);
      liftGroupRef.current.rotation.set(0, spreader.yaw, 0);
    }
  });

  return (
    <group position={position}>
      {/* Heavy Wheel Base Chassis (Cyan/Teal industrial brand) */}
      <group position={[TRANSFER_GEOMETRY.startX, 0, -2.8]}>
        {/* Main Chassis Body */}
        <BoxPart size={[2.6, 1.2, 4.2]} position={[0, 0.9, 0]} color="#0284c7" radius={0.06} metal={0.6} />

        {/* Counterweight at Rear */}
        <BoxPart size={[2.7, 1.4, 1.2]} position={[0, 1.1, -1.6]} color="#0f172a" radius={0.04} metal={0.8} />

        {/* Driver Cabin (offset right/center) */}
        <group position={[0.65, 2.0, 0.2]}>
          <BoxPart size={[1.1, 1.2, 1.4]} color="#0c110e" metal={0.8} />
          {/* Glass Windows */}
          <BoxPart size={[1.14, 0.9, 1.3]} color="#0369a1" emissive="#38bdf8" emissiveIntensity={0.2} metal={0.9} />
        </group>

        {/* 4 Heavy Industrial Rubber Wheels */}
        {[
          [-1.4, 0.65, 1.3],
          [1.4, 0.65, 1.3],
          [-1.4, 0.65, -1.3],
          [1.4, 0.65, -1.3],
        ].map(([x, y, z], i) => (
          <group key={i} position={[x, y, z]}>
            <BoxPart size={[0.38, 1.3, 1.3]} color="#090d0b" radius={0.2} roughness={0.9} />
            <BoxPart size={[0.4, 0.65, 0.65]} color="#94a3b8" radius={0.1} metal={0.7} />
          </group>
        ))}

        {/* Telescopic Boom Pivot Tower */}
        <BoxPart size={[1.2, 3.2, 1.2]} position={[0, 2.4, -0.6]} color="#0f172a" metal={0.8} />
      </group>

      {/* Hydraulic Boom Arm & Spreader Assembly (Lifting Vertically) */}
      <group ref={liftGroupRef} position={[TRANSFER_GEOMETRY.startX, 0.4, TRANSFER_GEOMETRY.startZ]}>
        {/* Telescopic Arm extending to container */}
        <BoxPart
          size={[0.7, 0.6, 3.4]}
          position={[0, 1.8, -1.4]}
          rotation={[0.15, 0, 0]}
          color="#0284c7"
          metal={0.7}
        />

        {/* Spreader Frame (Clamped to Container Top) */}
        <group position={[0, 0.85, 0]}>
          {/* Main Top Spreader Beam */}
          <BoxPart size={[3.4, 0.22, 1.32]} color="#1e293b" radius={0.02} metal={0.8} />

          {/* Yellow/Black Safety Hazard Corners */}
          {[-1.68, 1.68].map((x) => (
            <group key={x} position={[x, 0, 0]}>
              <BoxPart
                size={[0.14, 0.28, 1.34]}
                color="#eab308"
                emissive="#eab308"
                emissiveIntensity={0.4}
              />
            </group>
          ))}

          {/* Twistlock Corner Castings (Locking into container) */}
          {[-1.6, 1.6].map((x) =>
            [-0.6, 0.6].map((z) => (
              <BoxPart key={`${x}-${z}`} size={[0.1, 0.25, 0.1]} position={[x, -0.2, z]} color="#0c110e" metal={0.9} />
            ))
          )}
        </group>

      </group>
    </group>
  );
}
