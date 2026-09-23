"use client";

import { Component, type ErrorInfo, type ReactNode, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { LogisticsWorldScene } from "./LogisticsWorldScene";
import { deriveJourneyState, measureChapterBounds, type LogisticsJourneyStore } from "./LogisticsJourney";
import { LOGISTICS_WAYPOINTS } from "./LogisticsTypes";

interface LogisticsWorldCanvasProps {
  motionEnabled: boolean;
  journeyStore: LogisticsJourneyStore;
}

function StaticSceneFallback() {
  return (
    <div className="pf-3d-scene-fallback" aria-hidden="true">
      <span className="pf-3d-fallback-horizon" />
      <span className="pf-3d-fallback-container" />
      <span className="pf-3d-fallback-route" />
    </div>
  );
}

class SceneErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // The reading layer is independent; keep a quiet visual fallback if the scene cannot mount.
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function LogisticsWorldCanvas({ motionEnabled, journeyStore }: LogisticsWorldCanvasProps) {
  const pointerRef = useRef({ current: { x: 0, y: 0 } });
  const [mounted, setMounted] = useState(false);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setMounted(true);

    try {
      const testCanvas = document.createElement("canvas");
      const forceFallback = new URLSearchParams(window.location.search).has("force-3d-fallback");
      setWebglSupported(!forceFallback && Boolean(testCanvas.getContext("webgl2") || testCanvas.getContext("webgl")));
    } catch {
      setWebglSupported(false);
    }

    let bounds = measureChapterBounds();
    let measureFrame = 0;
    const updateJourney = () => journeyStore.update(deriveJourneyState(bounds, window.scrollY, window.innerHeight, document.documentElement.scrollHeight));
    const remeasure = () => { bounds = measureChapterBounds(); updateJourney(); };
    const scheduleRemeasure = () => {
      cancelAnimationFrame(measureFrame);
      measureFrame = requestAnimationFrame(remeasure);
    };
    const resizeObserver = new ResizeObserver(scheduleRemeasure);
    bounds.forEach(({ id }) => {
      const sectionId = LOGISTICS_WAYPOINTS.find((waypoint) => waypoint.id === id)?.sectionId;
      const section = sectionId ? document.getElementById(sectionId) : null;
      if (section) resizeObserver.observe(section);
    });

    const handlePointerMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      pointerRef.current.current = { x: nx, y: ny };
    };

    window.addEventListener("scroll", updateJourney, { passive: true });
    window.addEventListener("resize", scheduleRemeasure, { passive: true });
    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("load", scheduleRemeasure, { once: true });
    document.fonts?.ready.then(scheduleRemeasure).catch(() => undefined);

    // Initial check
    remeasure();

    return () => {
      window.removeEventListener("scroll", updateJourney);
      window.removeEventListener("resize", scheduleRemeasure);
      window.removeEventListener("mousemove", handlePointerMove);
      resizeObserver.disconnect();
      cancelAnimationFrame(measureFrame);
    };
  }, [journeyStore]);

  if (!mounted || webglSupported !== true) {
    return <StaticSceneFallback />;
  }

  return (
    <div
      className="pf-3d-canvas-container"
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      <SceneErrorBoundary fallback={<StaticSceneFallback />}>
        <Canvas
          frameloop={motionEnabled ? "always" : "demand"}
          fallback={<StaticSceneFallback />}
          onCreated={({ invalidate }) => invalidate()}
          camera={{
            fov: 42,
            near: 0.1,
            far: 90,
            position: [0, 1.8, 6.2],
          }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            alpha: false,
          }}
        >
          <LogisticsWorldScene
            journeyStore={journeyStore}
            pointerRef={pointerRef.current}
            motionEnabled={motionEnabled}
          />
        </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}
