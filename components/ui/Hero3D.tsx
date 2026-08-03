"use client";
import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, useAnimations, OrbitControls, Center, Bounds } from "@react-three/drei";

const MODEL_PATH = "/models/hero-object.glb";

function Model({ reducedMotion }: { reducedMotion: boolean }) {
  const { scene, animations } = useGLTF(MODEL_PATH);
  const { actions, names } = useAnimations(animations, scene);

  useEffect(() => {
    const name = names[0];
    const action = name ? actions[name] : undefined;
    if (!action) return;
    action.reset().play();
    action.paused = reducedMotion;
  }, [actions, names, reducedMotion]);

  return <primitive object={scene} />;
}

export function Hero3D() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <Canvas camera={{ fov: 32 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.7} />
      <hemisphereLight intensity={0.9} groundColor="#1a1a18" />
      <directionalLight position={[3, 5, 4]} intensity={2} />
      <directionalLight position={[-4, -1, -3]} intensity={0.6} color="#D4F236" />
      <Suspense fallback={null}>
        <Bounds fit margin={1.4}>
          <Center>
            <Model reducedMotion={reducedMotion} />
          </Center>
        </Bounds>
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={!reducedMotion}
        autoRotateSpeed={1.1}
        minPolarAngle={Math.PI / 2.4}
        maxPolarAngle={Math.PI / 1.9}
      />
    </Canvas>
  );
}

useGLTF.preload(MODEL_PATH);
