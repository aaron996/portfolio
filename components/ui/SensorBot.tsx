"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";

function cloneAndLift(source: THREE.Object3D) {
  const clone = source.clone(true);
  clone.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const material = Array.isArray(object.material) ? object.material[0] : object.material;
    if (!(material instanceof THREE.MeshStandardMaterial)) return;
    const next = material.clone();
    next.roughness = Math.min(0.95, next.roughness * 0.8 + 0.12);
    next.metalness = Math.min(1, next.metalness * 0.72);
    if (next.map) {
      next.emissiveMap = next.map;
      next.emissive = new THREE.Color("#6d6d63");
      next.emissiveIntensity = 1;
    }
    object.material = next;
  });
  return clone;
}

function fitModel(object: THREE.Object3D, target: number, restOnGround = false) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const scale = target / Math.max(size.x, size.y, size.z);
  object.scale.setScalar(scale);
  object.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  if (restOnGround) object.position.y = -box.min.y * scale;
  return { height: size.y * scale, depth: size.z * scale };
}

function SensorRig({ reducedMotion }: { reducedMotion: boolean }) {
  const headAsset = useGLTF("/sensor-head.glb");
  const baseAsset = useGLTF("/tripod-base.glb");
  const pivot = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  const models = useMemo(() => {
    const base = cloneAndLift(baseAsset.scene);
    const head = cloneAndLift(headAsset.scene);
    const baseFit = fitModel(base, 1.55, true);
    const headFit = fitModel(head, 0.78);
    return { base, head, baseTop: baseFit.height, lensDepth: headFit.depth * 0.5 };
  }, [baseAsset.scene, headAsset.scene]);

  useEffect(() => {
    if (reducedMotion) return;
    const onPointerMove = (event: PointerEvent) => {
      target.current.x = THREE.MathUtils.clamp((event.clientX / window.innerWidth - 0.5) * 1.7, -1.05, 1.05);
      target.current.y = THREE.MathUtils.clamp((event.clientY / window.innerHeight - 0.5) * -0.72, -0.5, 0.5);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [reducedMotion]);

  useFrame((_, delta) => {
    if (!pivot.current || reducedMotion) return;
    const ease = 1 - Math.exp(-delta * 7);
    pivot.current.rotation.y = THREE.MathUtils.lerp(pivot.current.rotation.y, target.current.x, ease);
    pivot.current.rotation.x = THREE.MathUtils.lerp(pivot.current.rotation.x, target.current.y, ease);
  });

  return (
    <group position={[0, -0.82, 0]}>
      <primitive object={models.base} />
      <group
        ref={pivot}
        position={[0, models.baseTop + 0.06, 0]}
        rotation-order="YXZ"
      >
        <primitive object={models.head} />
        <mesh position={[0, 0, models.lensDepth + 0.008]}>
          <circleGeometry args={[0.044, 32]} />
          <meshBasicMaterial color="#d4f236" />
        </mesh>
        <mesh position={[0, 0, models.lensDepth + 0.004]}>
          <ringGeometry args={[0.052, 0.108, 36]} />
          <meshBasicMaterial color="#d4f236" transparent opacity={0.2} />
        </mesh>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <circleGeometry args={[0.62, 40]} />
        <meshBasicMaterial color="#050505" transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

export function SensorBot() {
  const reducedMotion = Boolean(useReducedMotion());

  return (
    <div className="pointer-events-none fixed -bottom-2 right-0 z-30 hidden h-[190px] w-[150px] lg:block 2xl:bottom-2 2xl:right-4 2xl:h-[225px] 2xl:w-[180px]">
      <Canvas
        camera={{ position: [0.3, 1.45, 3.9], fov: 30 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        frameloop={reducedMotion ? "demand" : "always"}
      >
        <hemisphereLight args={["#cfd8c0", "#101010", 1.5]} />
        <directionalLight color="#fff6e2" intensity={3} position={[2.2, 3.2, 3.4]} />
        <directionalLight color="#bcc6d8" intensity={1.5} position={[-2.6, 1.2, 2]} />
        <directionalLight color="#d4f236" intensity={2.6} position={[-1.8, 1.6, -2.6]} />
        <SensorRig reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/sensor-head.glb");
useGLTF.preload("/tripod-base.glb");
