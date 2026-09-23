"use client";

import { ReachStacker } from "./models/ReachStacker";
import { LogisticsSemiTruck } from "./models/LogisticsSemiTruck";
import { ContainerShip } from "./models/ContainerShip";
import { DispatchTerminalZone } from "./zones/DispatchTerminalZone";
import { LogisticsCameraRig } from "./LogisticsCameraRig";
import { BoxPart, ShippingContainer } from "./zones/PortTerminalZone";
import { getTransferPose, TRANSFER_GEOMETRY, type LogisticsJourneyStore } from "./LogisticsJourney";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface LogisticsWorldSceneProps {
  journeyStore: LogisticsJourneyStore;
  pointerRef: { current: { x: number; y: number } };
  motionEnabled?: boolean;
}

export function LogisticsWorldScene({
  journeyStore,
  pointerRef,
  motionEnabled = true,
}: LogisticsWorldSceneProps) {
  return (
    <>
      {/* Dynamic Background Atmosphere */}
      <color attach="background" args={["#0a0f0d"]} />
      <fog attach="fog" args={["#0a0f0d", 14, 75]} />

      {/* Ambient base lighting */}
      <ambientLight intensity={1.4} color="#a7f3d0" />

      {/* Key Directional Sun/Floodlight */}
      <directionalLight position={[12, 24, 14]} intensity={2.6} color="#ffffff" />

      {/* Maersk Sky Blue Rim Light */}
      <directionalLight position={[-16, 14, -8]} intensity={1.8} color="#38bdf8" />

      {/* Cyan Ocean Accent Light */}
      <pointLight position={[0, 18, -65]} intensity={3.5} color="#0284c7" distance={50} />

      {/* Lime Cybernetic Telemetry Accent Light */}
      <pointLight position={[0, 8, -14]} intensity={2.2} color="#d4f236" distance={25} />

      {/* ZONE 1: Port & Inbound Terminal with Reach Stacker Container Lift (Hero) */}
      <group position={[0, 0, 0]}>
        {/* Concrete Quay Dock */}
        <BoxPart size={[18, 0.4, 16]} position={[0, -0.2, 0]} color="#132119" roughness={0.8} />

        {/* Reach stacker and container */}
        <ReachStacker
          position={[0, 0, 0]}
          journeyStore={journeyStore}
          motionEnabled={motionEnabled}
        />
        <TransferContainer journeyStore={journeyStore} motionEnabled={motionEnabled} />

        {/* Background Secondary Container Stacks */}
        <group position={[-5.8, 0, -2.5]}>
          <BoxPart size={[3.2, 1.25, 1.25]} position={[0, 0.65, 0]} color="#b91c1c" />
          <BoxPart size={[3.2, 1.25, 1.25]} position={[0, 1.95, 0]} color="#0369a1" />
        </group>
        <group position={[5.8, 0, -2.5]}>
          <BoxPart size={[3.2, 1.25, 1.25]} position={[0, 0.65, 0]} color="#15803d" />
          <BoxPart size={[3.2, 1.25, 1.25]} position={[0, 1.95, 0]} color="#eab308" />
        </group>
      </group>

      {/* ZONE 2 & 3: Highway Transit & 90° Top-Down Curve (Featured Cases & Other Works) */}
      <group position={[0, 0, 0]}>
        <LogisticsSemiTruck
          position={[0, 0, 0]}
          journeyStore={journeyStore}
          motionEnabled={motionEnabled}
        />
      </group>

      {/* ZONE 4: Aerial Macro Ocean & Container Cargo Ship (Pipeline, Scale Shift) */}
      <group position={[0, 0, -68]}>
        <ContainerShip position={[0, 0, 0]} motionEnabled={motionEnabled} />
      </group>

      {/* ZONE 5: Final Delivery Destination & Fulfillment Desk (Experience, Contact) */}
      <group position={[0, 0, 0]}>
        <DispatchTerminalZone motionEnabled={motionEnabled} />
      </group>

      {/* Multi-Perspective Camera Rig */}
      <LogisticsCameraRig
        journeyStore={journeyStore}
        pointerRef={pointerRef}
        motionEnabled={motionEnabled}
      />
    </>
  );
}

/** The only transfer container. Its pose is a pure function of the shared chapter state. */
function TransferContainer({ journeyStore, motionEnabled }: { journeyStore: LogisticsJourneyStore; motionEnabled: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current || !motionEnabled) return;
    const pose = getTransferPose(journeyStore.current).container;
    ref.current.position.set(pose.x, pose.y, pose.z);
    ref.current.rotation.set(0, pose.yaw, 0);
  });
  return <group ref={ref} position={[TRANSFER_GEOMETRY.startX, TRANSFER_GEOMETRY.containerHeight / 2, TRANSFER_GEOMETRY.startZ]}><ShippingContainer color="#42b0d5" active /></group>;
}
