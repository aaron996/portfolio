"use client";

import { Component, type ErrorInfo, type ReactNode, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { LogisticsWorldScene } from "./LogisticsWorldScene";

interface LogisticsWorldCanvasProps {
  motionEnabled: boolean;
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

export function LogisticsWorldCanvas({ motionEnabled }: LogisticsWorldCanvasProps) {
  const scrollProgressRef = useRef({ current: 0 });
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

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      scrollProgressRef.current.current = Math.max(0, Math.min(1, scrollY / maxScroll));
    };

    const handlePointerMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      pointerRef.current.current = { x: nx, y: ny };
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handlePointerMove, { passive: true });

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handlePointerMove);
    };
  }, []);

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
            scrollProgressRef={scrollProgressRef.current}
            pointerRef={pointerRef.current}
            motionEnabled={motionEnabled}
          />
        </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}
