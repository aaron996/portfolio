"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { LOGISTICS_WAYPOINTS } from "./LogisticsTypes";

interface CameraRigProps {
  scrollProgressRef: { current: number };
  pointerRef: { current: { x: number; y: number } };
  motionEnabled?: boolean;
}

export function LogisticsCameraRig({
  scrollProgressRef,
  pointerRef,
  motionEnabled = true,
}: CameraRigProps) {
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  const currentLookAtRef = useRef<THREE.Vector3>(
    new THREE.Vector3(...LOGISTICS_WAYPOINTS[0].targetLookAt)
  );

  // Construct continuous Catmull-Rom spline curves through the 5 waypoint camera positions and look-at targets
  const { cameraSpline, lookAtSpline } = useMemo(() => {
    const camPoints = LOGISTICS_WAYPOINTS.map(
      (w) => new THREE.Vector3(...w.cameraPos)
    );
    const lookPoints = LOGISTICS_WAYPOINTS.map(
      (w) => new THREE.Vector3(...w.targetLookAt)
    );

    const cSpline = new THREE.CatmullRomCurve3(camPoints, false, "catmullrom", 0.3);
    const lSpline = new THREE.CatmullRomCurve3(lookPoints, false, "catmullrom", 0.3);

    return { cameraSpline: cSpline, lookAtSpline: lSpline };
  }, []);

  useEffect(() => {
    if (motionEnabled) return;

    const staticWaypoint = LOGISTICS_WAYPOINTS[0];
    camera.position.set(...staticWaypoint.cameraPos);
    currentLookAtRef.current.set(...staticWaypoint.targetLookAt);
    camera.lookAt(currentLookAtRef.current);
    invalidate();
  }, [camera, invalidate, motionEnabled]);

  useFrame((_, delta) => {
    const rawProgress = scrollProgressRef.current;
    const clampedProgress = Math.max(0, Math.min(1, rawProgress));

    if (!motionEnabled) return;

    // Evaluate position and orientation along the Catmull-Rom spline
    const targetCameraPos = cameraSpline.getPoint(clampedProgress);
    const targetLookAt = lookAtSpline.getPoint(clampedProgress);

    // Subtle pointer parallax based on cursor coordinates
    const px = pointerRef.current.x * 0.45;
    const py = pointerRef.current.y * 0.25;

    targetCameraPos.x += px;
    targetCameraPos.y += py;

    // Smooth inertia interpolation (cinematic damping)
    const lerpRate = Math.min(1, delta * 4.2);
    camera.position.lerp(targetCameraPos, lerpRate);
    currentLookAtRef.current.lerp(targetLookAt, lerpRate);
    camera.lookAt(currentLookAtRef.current);
  });

  return null;
}
