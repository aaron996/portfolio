"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BoxPart } from "./PortTerminalZone";

/**
 * Rotating Holographic Radar Rings
 */
function HolographicRadar() {
  const innerRingRef = useRef<THREE.Group>(null);
  const outerRingRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (innerRingRef.current) {
      innerRingRef.current.rotation.y = t * 0.45;
      innerRingRef.current.rotation.x = Math.sin(t * 0.3) * 0.15;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.y = -t * 0.25;
      outerRingRef.current.rotation.z = Math.cos(t * 0.25) * 0.12;
    }
  });

  return (
    <group position={[0, 4.2, 0]}>
      {/* Inner Rotating Ring */}
      <group ref={innerRingRef}>
        <mesh>
          <torusGeometry args={[2.2, 0.03, 16, 64]} />
          <meshBasicMaterial color="#d4f236" transparent opacity={0.7} />
        </mesh>
        {/* Radar Crosshairs */}
        <BoxPart size={[4.2, 0.02, 0.02]} color="#d4f236" emissive="#d4f236" emissiveIntensity={0.8} />
        <BoxPart size={[0.02, 0.02, 4.2]} color="#d4f236" emissive="#d4f236" emissiveIntensity={0.8} />
      </group>

      {/* Outer Rotating Ring */}
      <group ref={outerRingRef}>
        <mesh>
          <torusGeometry args={[3.4, 0.025, 16, 64]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
        </mesh>
        {/* Orbiting Satellite Data Nodes */}
        {[-2.8, 2.8].map((x) => (
          <mesh key={x} position={[x, 0, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/**
 * Pulsing Glowing Data Conduit Pipes (data model / operations / BI streams)
 */
function DataPipelines() {
  const streamsGroupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (streamsGroupRef.current) {
      streamsGroupRef.current.children.forEach((pipe, i) => {
        const pulse = 0.4 + Math.sin(t * 4 + i * 1.5) * 0.4;
        const mesh = pipe.children[0] as THREE.Mesh;
        if (mesh && mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.emissiveIntensity = pulse;
        }
      });
    }
  });

  const streamConfigs = [
    { x: -3.5, z: -2.0, color: "#42b0d5", label: "DATA_MODEL" },
    { x: -1.8, z: -3.2, color: "#d4f236", label: "OPS_DATA" },
    { x: 1.8, z: -3.2, color: "#f59e0b", label: "KAS_OPS" },
    { x: 3.5, z: -2.0, color: "#38bdf8", label: "BI_METRICS" },
  ];

  return (
    <group ref={streamsGroupRef}>
      {streamConfigs.map((cfg, idx) => (
        <group key={idx} position={[cfg.x, 0, cfg.z]}>
          {/* Vertical Glowing Light Pipe */}
          <mesh position={[0, 2.5, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 5.0, 16]} />
            <meshStandardMaterial
              color={cfg.color}
              emissive={cfg.color}
              emissiveIntensity={0.6}
              transparent
              opacity={0.85}
            />
          </mesh>

          {/* Conduit Base Pedestal */}
          <BoxPart size={[0.5, 0.3, 0.5]} position={[0, 0.15, 0]} color="#132119" metal={0.8} />
          <BoxPart
            size={[0.3, 0.08, 0.3]}
            position={[0, 0.34, 0]}
            color={cfg.color}
            emissive={cfg.color}
            emissiveIntensity={0.8}
          />
        </group>
      ))}
    </group>
  );
}

/**
 * Curved Operations Command Console with telemetry screens
 */
function CommandConsole() {
  return (
    <group position={[0, 0, -0.6]}>
      {/* Console Desk Desk Arc */}
      <BoxPart size={[3.8, 0.85, 1.2]} position={[0, 0.42, 0]} color="#132119" metal={0.7} />

      {/* Main Center Telemetry Ultrawide Monitor */}
      <group position={[0, 1.35, 0.1]}>
        <BoxPart size={[1.8, 0.75, 0.06]} color="#0c110e" metal={0.9} />
        {/* Glowing Screen Content */}
        <BoxPart
          size={[1.72, 0.67, 0.02]}
          position={[0, 0, 0.03]}
          color="#0f291e"
          emissive="#d4f236"
          emissiveIntensity={0.4}
        />
      </group>

      {/* Flanking Side Monitors angled inward */}
      <group position={[-1.35, 1.35, 0.2]} rotation={[0, 0.35, 0]}>
        <BoxPart size={[0.85, 0.65, 0.06]} color="#0c110e" metal={0.9} />
        <BoxPart
          size={[0.79, 0.58, 0.02]}
          position={[0, 0, 0.03]}
          color="#082f49"
          emissive="#38bdf8"
          emissiveIntensity={0.4}
        />
      </group>

      <group position={[1.35, 1.35, 0.2]} rotation={[0, -0.35, 0]}>
        <BoxPart size={[0.85, 0.65, 0.06]} color="#0c110e" metal={0.9} />
        <BoxPart
          size={[0.79, 0.58, 0.02]}
          position={[0, 0, 0.03]}
          color="#451a03"
          emissive="#f59e0b"
          emissiveIntensity={0.35}
        />
      </group>
    </group>
  );
}

/**
 * Logistics Control Tower & Telemetry Grid Zone (Z = -88)
 */
export function ControlTowerZone() {
  return (
    <group position={[0, 0, -88]}>
      {/* Octagonal Control Tower Platform Ground */}
      <BoxPart size={[14, 0.4, 14]} position={[0, -0.2, 0]} color="#08100c" roughness={0.7} />

      {/* Cybernetic Telemetry Floor Grid Matrix */}
      {[-4, -2, 0, 2, 4].map((coord) => (
        <group key={coord}>
          <BoxPart
            size={[0.04, 0.01, 12]}
            position={[coord, 0.01, 0]}
            color="#22543d"
            emissive="#22543d"
            emissiveIntensity={0.4}
          />
          <BoxPart
            size={[12, 0.01, 0.04]}
            position={[0, 0.01, coord]}
            color="#22543d"
            emissive="#22543d"
            emissiveIntensity={0.4}
          />
        </group>
      ))}

      {/* Holographic Concentric Radar Rings */}
      <HolographicRadar />

      {/* Glowing Data Pipeline Streams */}
      <DataPipelines />

      {/* Command Center Telemetry Console */}
      <CommandConsole />
    </group>
  );
}
