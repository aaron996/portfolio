"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import type { Group } from "three";

export interface HeroObjectRigProps {
  id: string;
  active: boolean;
  pressed?: boolean;
  pointerRef: { current: { x: number; y: number } };
  restPosition: [number, number, number];
  restRotation: [number, number, number];
  hoverLift?: number;
  pressSink?: number;
  maxTiltX?: number;
  maxTiltY?: number;
  children: ReactNode;
}

/**
 * HeroObjectRig: Encapsulates physics, tilt, lift, press and damped spring return.
 * Decouples interaction rig from specific model geometry (procedural now, Meshy GLB later).
 */
export function HeroObjectRig({
  active,
  pressed = false,
  pointerRef,
  restPosition,
  restRotation,
  hoverLift = 0.08,
  pressSink = 0.04,
  maxTiltX = 0.08,
  maxTiltY = 0.08,
  children,
}: HeroObjectRigProps) {
  const group = useRef<Group>(null);
  const invalidate = useThree((state) => state.invalidate);
  const reducedMotion = Boolean(useReducedMotion());

  useEffect(() => {
    invalidate();
  }, [active, pressed, reducedMotion, invalidate]);

  useFrame((_, delta) => {
    if (!group.current) return;
    const g = group.current;

    if (reducedMotion) {
      g.position.set(restPosition[0], restPosition[1], restPosition[2]);
      g.rotation.set(restRotation[0], restRotation[1], restRotation[2]);
      return;
    }

    // Clamp delta to prevent jumps after tab refocus or frame hitch
    const dt = Math.min(delta, 0.1);
    const lerpFactor = 1 - Math.exp(-12 * dt);

    const targetY = restPosition[1] + (active ? (pressed ? -pressSink : hoverLift) : 0);
    const targetRotX = restRotation[0] + (active ? -(pointerRef.current?.y ?? 0) * maxTiltX : 0);
    const targetRotY = restRotation[1] + (active ? (pointerRef.current?.x ?? 0) * maxTiltY : 0);
    const targetRotZ = restRotation[2];

    const diffPosY = targetY - g.position.y;
    const diffRotX = targetRotX - g.rotation.x;
    const diffRotY = targetRotY - g.rotation.y;

    g.position.y += diffPosY * lerpFactor;
    g.rotation.x += diffRotX * lerpFactor;
    g.rotation.y += diffRotY * lerpFactor;
    g.rotation.z += (targetRotZ - g.rotation.z) * lerpFactor;

    // Invalidate next frame while motion is still settling
    if (
      Math.abs(diffPosY) > 0.0005 ||
      Math.abs(diffRotX) > 0.0005 ||
      Math.abs(diffRotY) > 0.0005
    ) {
      invalidate();
    }
  });

  return (
    <group ref={group} position={restPosition} rotation={restRotation}>
      {children}
    </group>
  );
}
