"use client";
import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Center, Bounds } from "@react-three/drei";

function Model() {
  const { scene } = useGLTF("/models/hero-object.glb");
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
            <Model />
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

useGLTF.preload("/models/hero-object.glb");
