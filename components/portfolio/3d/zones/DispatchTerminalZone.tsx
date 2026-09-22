"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BoxPart } from "./PortTerminalZone";

/**
 * Mechanical Keyboard (Reused from hero design with tactical custom keycaps)
 */
function MechanicalKeyboard({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Keyboard Case */}
      <BoxPart size={[2.2, 0.18, 0.85]} color="#2d3732" radius={0.04} metal={0.6} />
      <BoxPart size={[2.1, 0.04, 0.78]} position={[0, 0.1, 0]} color="#132119" radius={0.02} />

      {/* Keycaps Grid */}
      {Array.from({ length: 4 }, (_, row) =>
        Array.from({ length: 11 }, (_, col) => {
          if (row === 3 && col > 2 && col < 7) return null; // Spacebar slot
          const isSpace = row === 3 && col === 2;
          const isAccent = (row === 0 && col === 0) || (row === 2 && col === 10);
          const isBlue = col === 0 || col === 10;
          return (
            <BoxPart
              key={`${row}-${col}`}
              size={[isSpace ? 0.95 : 0.15, 0.1, 0.15]}
              position={[-0.85 + col * 0.17 + (isSpace ? 0.4 : 0), 0.18, -0.25 + row * 0.17]}
              color={isAccent ? "#d4f236" : isBlue ? "#42b0d5" : "#e2e8f0"}
              radius={0.015}
              metal={0.1}
              emissive={isAccent ? "#d4f236" : undefined}
              emissiveIntensity={isAccent ? 0.3 : 0}
            />
          );
        })
      )}
    </group>
  );
}

/**
 * Smart Parcel Delivery Locker Station
 */
function SmartLockerStation({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Main Locker Cabinet Body */}
      <BoxPart size={[3.8, 3.2, 0.9]} position={[0, 1.6, 0]} color="#132119" radius={0.04} metal={0.6} />
      {/* Top Canopy */}
      <BoxPart size={[4.1, 0.18, 1.2]} position={[0, 3.25, 0.1]} color="#0c110e" metal={0.8} />

      {/* Grid of Locker Compartments */}
      {Array.from({ length: 4 }, (_, r) =>
        Array.from({ length: 5 }, (_, c) => {
          const isDelivered = (r === 1 && c === 2) || (r === 2 && c === 3);
          return (
            <group key={`${r}-${c}`} position={[-1.4 + c * 0.7, 0.5 + r * 0.65, 0.46]}>
              <BoxPart size={[0.62, 0.58, 0.04]} color="#1e2d25" metal={0.5} />
              {/* LED Locker Status Indicator */}
              <BoxPart
                size={[0.08, 0.03, 0.02]}
                position={[0.22, 0.2, 0.03]}
                color={isDelivered ? "#38bdf8" : "#22c55e"}
                emissive={isDelivered ? "#38bdf8" : "#22c55e"}
                emissiveIntensity={0.8}
              />
              {/* Compartment Handle */}
              <BoxPart size={[0.04, 0.12, 0.03]} position={[0.24, 0, 0.03]} color="#cbd5e1" metal={0.8} />
            </group>
          );
        })
      )}

      {/* Central Interactive Touchscreen Terminal on Locker */}
      <group position={[0, 1.6, 0.48]}>
        <BoxPart size={[0.7, 0.9, 0.06]} color="#0c110e" metal={0.9} />
        <BoxPart
          size={[0.62, 0.78, 0.02]}
          position={[0, 0, 0.04]}
          color="#164e63"
          emissive="#38bdf8"
          emissiveIntensity={0.4}
        />
      </group>
    </group>
  );
}

/**
 * Terminal Dispatch & Fulfillment Zone (Z = -118)
 */
export function DispatchTerminalZone({ motionEnabled = true }: { motionEnabled?: boolean }) {
  const successPillRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!motionEnabled) return;
    if (successPillRef.current) {
      successPillRef.current.position.y = 1.6 + Math.sin(clock.getElapsedTime() * 2.5) * 0.06;
    }
  });

  return (
    <group position={[0, 0, -118]}>
      {/* Station Floor */}
      <BoxPart size={[16, 0.3, 14]} position={[0, -0.15, 0]} color="#0c130f" roughness={0.7} />

      {/* Guideline Arrows */}
      {[-2, 0, 2].map((x) => (
        <BoxPart
          key={x}
          size={[0.1, 0.01, 8]}
          position={[x, 0.01, 0]}
          color="#34d399"
          emissive="#34d399"
          emissiveIntensity={0.2}
        />
      ))}

      {/* Smart Locker in the Background */}
      <SmartLockerStation position={[0, 0, -4.5]} />

      {/* Workstation Desk with Mechanical Keyboard */}
      <group position={[1.5, 0, -0.8]}>
        {/* Sleek Desk Table */}
        <BoxPart size={[3.0, 0.1, 1.5]} position={[0, 0.85, 0]} color="#1a2b22" radius={0.02} metal={0.6} />
        {/* Steel Desk Legs */}
        <BoxPart size={[0.1, 0.85, 1.3]} position={[-1.35, 0.425, 0]} color="#0c110e" metal={0.8} />
        <BoxPart size={[0.1, 0.85, 1.3]} position={[1.35, 0.425, 0]} color="#0c110e" metal={0.8} />

        {/* Mechanical Keyboard on Desk */}
        <MechanicalKeyboard position={[0, 0.95, 0.2]} />

        {/* Floating Delivered Golden Parcel with Tag */}
        <group ref={successPillRef} position={[-0.8, 1.6, -0.1]}>
          <BoxPart size={[0.65, 0.5, 0.55]} color="#f59e0b" roughness={0.3} metal={0.3} />
          {/* Neon Lime Security Ribbon */}
          <BoxPart size={[0.67, 0.1, 0.57]} color="#d4f236" emissive="#d4f236" emissiveIntensity={0.5} />
          <BoxPart size={[0.1, 0.52, 0.57]} color="#d4f236" emissive="#d4f236" emissiveIntensity={0.5} />
        </group>
      </group>
    </group>
  );
}
