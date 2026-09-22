"use client";

import { BoxPart } from "./PortTerminalZone";

/**
 * Logistics Delivery Truck (GHN / Shopee / 3PL style transport vehicle)
 */
function LogisticsTruck({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  cabColor = "#16a34a",
  stripeColor = "#d4f236",
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  cabColor?: string;
  stripeColor?: string;
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Chassis Frame */}
      <BoxPart size={[1.6, 0.25, 4.8]} position={[0, 0.45, 0]} color="#1e293b" metal={0.8} />

      {/* Wheels */}
      {[
        [-0.85, 0.4, 1.6],
        [0.85, 0.4, 1.6],
        [-0.85, 0.4, -1.2],
        [0.85, 0.4, -1.2],
        [-0.85, 0.4, -1.9],
        [0.85, 0.4, -1.9],
      ].map(([x, y, z], idx) => (
        <group key={idx} position={[x, y, z]}>
          <BoxPart size={[0.22, 0.7, 0.7]} color="#0f172a" radius={0.1} roughness={0.9} />
          {/* Wheel Rim */}
          <BoxPart size={[0.24, 0.38, 0.38]} color="#94a3b8" radius={0.05} metal={0.6} />
        </group>
      ))}

      {/* Driver Cabin */}
      <group position={[0, 1.25, 1.65]}>
        {/* Main Cab */}
        <BoxPart size={[1.7, 1.35, 1.4]} position={[0, 0, 0]} color={cabColor} radius={0.06} />
        {/* Windshield */}
        <BoxPart
          size={[1.5, 0.65, 0.08]}
          position={[0, 0.25, 0.68]}
          color="#0f172a"
          metal={0.9}
          roughness={0.1}
        />
        {/* Side Windows */}
        <BoxPart size={[0.08, 0.55, 0.7]} position={[-0.83, 0.2, 0.1]} color="#0f172a" metal={0.9} />
        <BoxPart size={[0.08, 0.55, 0.7]} position={[0.83, 0.2, 0.1]} color="#0f172a" metal={0.9} />
        {/* Bumper */}
        <BoxPart size={[1.8, 0.3, 0.3]} position={[0, -0.55, 0.65]} color="#0c110e" metal={0.6} />
        {/* Headlights */}
        <BoxPart
          size={[0.28, 0.14, 0.08]}
          position={[-0.65, -0.45, 0.78]}
          color="#fef08a"
          emissive="#fef08a"
          emissiveIntensity={0.8}
        />
        <BoxPart
          size={[0.28, 0.14, 0.08]}
          position={[0.65, -0.45, 0.78]}
          color="#fef08a"
          emissive="#fef08a"
          emissiveIntensity={0.8}
        />
      </group>

      {/* Cargo Box Trailer */}
      <group position={[0, 1.6, -0.6]}>
        {/* White Cargo Box */}
        <BoxPart size={[1.82, 1.85, 3.2]} color="#f1f5f9" radius={0.04} roughness={0.3} />
        {/* Brand Accent Stripe */}
        <BoxPart
          size={[1.84, 0.28, 3.22]}
          position={[0, -0.15, 0]}
          color={stripeColor}
          emissive={stripeColor}
          emissiveIntensity={0.25}
        />
        {/* Rear Roll-up Doors Frame */}
        <BoxPart size={[1.7, 1.7, 0.04]} position={[0, 0, -1.61]} color="#cbd5e1" metal={0.5} />
        {/* Taillights */}
        <BoxPart
          size={[0.15, 0.25, 0.04]}
          position={[-0.75, -0.7, -1.62]}
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={0.8}
        />
        <BoxPart
          size={[0.15, 0.25, 0.04]}
          position={[0.75, -0.7, -1.62]}
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={0.8}
        />
      </group>
    </group>
  );
}

/**
 * Pallet Storage Rack with Stored Goods
 */
function PalletRack({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Upright Steel Columns (Safety Orange) */}
      {[-1.8, 0, 1.8].map((x) =>
        [-0.6, 0.6].map((z) => (
          <BoxPart key={`${x}-${z}`} size={[0.1, 4.2, 0.1]} position={[x, 2.1, z]} color="#ea580c" metal={0.6} />
        ))
      )}

      {/* Horizontal Cross Beams */}
      {[0.4, 1.8, 3.2].map((y) => (
        <group key={y}>
          <BoxPart size={[3.8, 0.1, 0.08]} position={[0, y, -0.58]} color="#f97316" metal={0.6} />
          <BoxPart size={[3.8, 0.1, 0.08]} position={[0, y, 0.58]} color="#f97316" metal={0.6} />
          {/* Deck Wire Meshes */}
          <BoxPart size={[3.7, 0.02, 1.1]} position={[0, y + 0.04, 0]} color="#475569" metal={0.8} />

          {/* Pallets and Goods on Each Level */}
          {[-0.95, 0.95].map((px) => (
            <group key={px} position={[px, y + 0.1, 0]}>
              <BoxPart size={[1.1, 0.1, 0.9]} position={[0, 0.05, 0]} color="#a16207" roughness={0.9} />
              {/* Stacked Shrink-Wrapped Goods */}
              <BoxPart
                size={[0.95, 0.75, 0.8]}
                position={[0, 0.48, 0]}
                color={y === 0.4 ? "#e2e8f0" : y === 1.8 ? "#93c5fd" : "#86efac"}
                roughness={0.4}
              />
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

/**
 * Cross-Dock Loading Bay Doors
 */
function LoadingBayDoors({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Warehouse Exterior Wall */}
      <BoxPart size={[16, 5.5, 0.4]} position={[0, 2.75, 0]} color="#0c110e" roughness={0.8} />

      {/* 3 Dock Openings */}
      {[-4.5, 0, 4.5].map((x, idx) => (
        <group key={x} position={[x, 1.6, 0.15]}>
          {/* Roll-up Shutter Door */}
          <BoxPart size={[2.6, 3.0, 0.1]} color="#1e293b" metal={0.4} />
          {/* Inflatable Dock Seal / Shelter Pads */}
          <BoxPart size={[0.25, 3.2, 0.35]} position={[-1.38, 0.1, 0]} color="#090d0b" />
          <BoxPart size={[0.25, 3.2, 0.35]} position={[1.38, 0.1, 0]} color="#090d0b" />
          <BoxPart size={[3.0, 0.25, 0.35]} position={[0, 1.65, 0]} color="#090d0b" />
          {/* Rubber Bumpers at Ground */}
          <BoxPart size={[0.3, 0.45, 0.25]} position={[-1.2, -1.35, 0.1]} color="#000000" />
          <BoxPart size={[0.3, 0.45, 0.25]} position={[1.2, -1.35, 0.1]} color="#000000" />
          {/* Dock Number Sign */}
          <BoxPart
            size={[0.6, 0.3, 0.05]}
            position={[0, 1.95, 0.1]}
            color="#d4f236"
            emissive="#d4f236"
            emissiveIntensity={0.5}
          />
        </group>
      ))}
    </group>
  );
}

/**
 * Cross-Dock & Fleet Dispatch Zone (Z = -58)
 */
export function FleetDockZone() {
  return (
    <group position={[0, 0, -58]}>
      {/* Asphalt Staging Yard Ground */}
      <BoxPart size={[18, 0.3, 16]} position={[0, -0.15, 0]} color="#0b130e" roughness={0.9} />

      {/* Yellow Parking Bay Guideline Stripes */}
      {[-4.5, 0, 4.5].map((x) => (
        <group key={x}>
          <BoxPart size={[0.12, 0.01, 8.5]} position={[x - 1.4, 0.01, 0.5]} color="#eab308" emissive="#eab308" emissiveIntensity={0.3} />
          <BoxPart size={[0.12, 0.01, 8.5]} position={[x + 1.4, 0.01, 0.5]} color="#eab308" emissive="#eab308" emissiveIntensity={0.3} />
        </group>
      ))}

      {/* Loading Bay Wall in Background */}
      <LoadingBayDoors position={[0, 0, -5.2]} />

      {/* Primary 3PL Delivery Truck Backed into Dock 2 */}
      <LogisticsTruck
        position={[0, 0, -2.2]}
        rotation={[0, Math.PI, 0]}
        cabColor="#16a34a"
        stripeColor="#d4f236"
      />

      {/* Secondary Van Dispatched on Right */}
      <LogisticsTruck
        position={[4.2, 0, 1.5]}
        rotation={[0, 2.7, 0]}
        cabColor="#0284c7"
        stripeColor="#38bdf8"
      />

      {/* High-density Pallet Racks on Left */}
      <PalletRack position={[-5.8, 0, 0]} />
    </group>
  );
}
