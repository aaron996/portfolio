"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { LOGISTICS_WAYPOINTS } from "./LogisticsTypes";
import type { LogisticsJourneyStore } from "./LogisticsJourney";
import { getTransferPose } from "./LogisticsJourney";

interface CameraRigProps {
  journeyStore: LogisticsJourneyStore;
  pointerRef: { current: { x: number; y: number } };
  motionEnabled?: boolean;
}

export function LogisticsCameraRig({
  journeyStore,
  pointerRef,
  motionEnabled = true,
}: CameraRigProps) {
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  const viewportWidth = useThree((state) => state.size.width);
  const currentLookAtRef = useRef<THREE.Vector3>(
    new THREE.Vector3(...LOGISTICS_WAYPOINTS[0].targetLookAt)
  );

  const targetCameraRef = useRef(new THREE.Vector3());
  const targetLookAtRef = useRef(new THREE.Vector3());
  const nextCameraRef = useRef(new THREE.Vector3());
  const nextLookAtRef = useRef(new THREE.Vector3());

  useEffect(() => {
    if (motionEnabled) return;

    const staticWaypoint = LOGISTICS_WAYPOINTS[0];
    camera.position.set(...staticWaypoint.cameraPos);
    currentLookAtRef.current.set(...staticWaypoint.targetLookAt);
    camera.lookAt(currentLookAtRef.current);
    invalidate();
  }, [camera, invalidate, motionEnabled]);

  useFrame(() => {
    if (!motionEnabled) return;

    const state = journeyStore.current;
    const chapter = LOGISTICS_WAYPOINTS.find((waypoint) => waypoint.id === state.activeChapterId) ?? LOGISTICS_WAYPOINTS[0];
    const targetCameraPos = targetCameraRef.current.set(...chapter.cameraPos);
    const targetLookAt = targetLookAtRef.current.set(...chapter.targetLookAt);

    if (state.activeChapterId === "sorting") {
      const transfer = getTransferPose(state);
      const subject = transfer.container;
      const isDesktop = viewportWidth > 900;
      const subjectLead = isDesktop ? 2 : 0;
      // Desktop keeps the transfer in the open lane beside the first dossier.
      // Mobile pulls back and lifts it above the bounded stage before full-width cards.
      targetCameraPos.set(
        subject.x + (isDesktop ? 5.5 : 7),
        isDesktop ? 4.6 : 4.9,
        subject.z + (isDesktop ? 8.5 : 10.5),
      );
      targetLookAt.set(
        subject.x - subjectLead,
        isDesktop ? Math.max(1.35, subject.y) : Math.max(0.9, subject.y - 0.65),
        subject.z,
      );
      // Keep the completed transfer framed while the dossiers pass, then widen to the road view.
      const t = THREE.MathUtils.smoothstep(state.chapterProgress, 0.76, 1);
      targetCameraPos.lerp(nextCameraRef.current.set(...LOGISTICS_WAYPOINTS[2].cameraPos), t);
      targetLookAt.lerp(nextLookAtRef.current.set(...LOGISTICS_WAYPOINTS[2].targetLookAt), t);
    } else if (state.activeChapterId === "fleet") {
      const truck = getTransferPose(state).truck;
      targetCameraPos.set(truck.x + 8, 12, truck.z + 9);
      targetLookAt.set(truck.x, 1.3, truck.z - 1);
      const oceanTransition = THREE.MathUtils.smoothstep(state.chapterProgress, 0.82, 1);
      targetCameraPos.lerp(nextCameraRef.current.set(...LOGISTICS_WAYPOINTS[3].cameraPos), oceanTransition);
      targetLookAt.lerp(nextLookAtRef.current.set(...LOGISTICS_WAYPOINTS[3].targetLookAt), oceanTransition);
    }

    // Subtle pointer parallax based on cursor coordinates
    const px = pointerRef.current.x * 0.45;
    const py = pointerRef.current.y * 0.25;

    targetCameraPos.x += px;
    targetCameraPos.y += py;
    camera.up.set(0, 1, 0);
    camera.position.copy(targetCameraPos);
    currentLookAtRef.current.copy(targetLookAt);
    camera.lookAt(currentLookAtRef.current);
  });

  return null;
}
