"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";

/* Khoảng cách (px) mà con trỏ lại gần thì bot mờ đi để không che nội dung. */
const FADE_RADIUS = 200;
/* Bot chỉ xuất hiện từ 860px trở lên, giống template. */
const MIN_WIDTH = 860;

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

const clampAbs = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));

function SensorRig({ reducedMotion }: { reducedMotion: boolean }) {
  const headAsset = useGLTF("/sensor-head.glb");
  const baseAsset = useGLTF("/tripod-base.glb");
  const pivot = useRef<THREE.Group>(null);
  const camera = useThree((state) => state.camera);
  const canvas = useThree((state) => state.gl.domElement);
  const invalidate = useThree((state) => state.invalidate);

  /* Góc mục tiêu (tYaw/tPitch) và góc hiện tại (yaw/pitch) — tách ra để đầu
     bot đuổi theo con trỏ có quán tính thay vì giật từng bước. */
  const angles = useRef({ yaw: 0, pitch: 0, targetYaw: 0, targetPitch: 0 });

  const models = useMemo(() => {
    const base = cloneAndLift(baseAsset.scene);
    const head = cloneAndLift(headAsset.scene);
    const baseFit = fitModel(base, 1.55, true);
    const headFit = fitModel(head, 0.78);
    return { base, head, baseTop: baseFit.height, lensDepth: headFit.depth * 0.5 };
  }, [baseAsset.scene, headAsset.scene]);

  /* Khung hình: đặt camera theo chiều cao thật của chân máy sau khi model load,
     giống template — nếu để camera nhìn vào gốc toạ độ thì đầu bot bị tràn khỏi
     canvas 230×272 và chân máy bị cắt. */
  useEffect(() => {
    camera.position.set(0.3, models.baseTop * 0.72 + 0.5, 3.9);
    camera.lookAt(0, models.baseTop * 0.62, 0);
    camera.updateProjectionMatrix();
    /* frameloop="demand" (chế độ giảm chuyển động) chỉ vẽ khi được yêu cầu —
       không invalidate thì khung hình còn giữ camera mặc định và đầu bot nằm
       ngoài khung. */
    invalidate();
  }, [camera, invalidate, models.baseTop]);

  useEffect(() => {
    if (reducedMotion) return;

    /* Ngắm thật: bắn tia từ camera qua con trỏ, cắt mặt phẳng đi qua khớp cổ
       và vuông góc với hướng camera, rồi quay đầu về đúng điểm cắt đó. Cách
       này đúng ở mọi vị trí con trỏ, kể cả ngoài vùng canvas — khác với việc
       quy đổi toạ độ chuột theo tâm viewport (cách cũ, nên đầu bot gần như
       không bao giờ chỉ đúng vào con trỏ). */
    const camDir = new THREE.Vector3();
    const pivotWorld = new THREE.Vector3();
    const ray = new THREE.Vector3();
    const hit = new THREE.Vector3();

    const onPointerMove = (event: PointerEvent) => {
      const group = pivot.current;
      if (!group) return;

      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const ndcX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

      camera.getWorldDirection(camDir);
      group.getWorldPosition(pivotWorld);

      ray.set(ndcX, ndcY, 0.5).unproject(camera).sub(camera.position).normalize();
      const denom = ray.dot(camDir);
      if (Math.abs(denom) < 1e-4) return;

      const distance = pivotWorld.clone().sub(camera.position).dot(camDir) / denom;
      hit.copy(camera.position).addScaledVector(ray, distance).sub(pivotWorld).normalize();

      /* Chặn dưới thành phần hướng trước: con trỏ ở phía trên/sau đầu bot cho
         z âm, atan2 sẽ lật hướng ngắm khoảng 180°. */
      const forward = Math.max(0.45, hit.z);
      angles.current.targetYaw = clampAbs(Math.atan2(hit.x, forward), 1.15);
      angles.current.targetPitch = clampAbs(Math.atan2(-hit.y, Math.hypot(hit.x, forward)), 0.6);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [camera, canvas, reducedMotion]);

  useFrame((_, delta) => {
    const group = pivot.current;
    if (!group || reducedMotion) return;
    const ease = 1 - Math.exp(-delta * 7);
    const state = angles.current;
    state.yaw += (state.targetYaw - state.yaw) * ease;
    state.pitch += (state.targetPitch - state.pitch) * ease;
    group.rotation.set(state.pitch, state.yaw, 0);
  });

  return (
    <group>
      <primitive object={models.base} />
      <group ref={pivot} position={[0, models.baseTop + 0.06, 0]} rotation-order="YXZ">
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
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fit = () => setVisible(window.innerWidth >= MIN_WIDTH);
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  /* Con trỏ lại gần thì bot lùi về hậu cảnh — nếu không nó sẽ chắn mất chữ ở
     góc phải dưới đúng lúc người đọc đang trỏ vào đó. */
  useEffect(() => {
    if (!visible) return;
    const onMove = (event: MouseEvent) => {
      const el = wrap.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      el.style.opacity = Math.hypot(dx, dy) < FADE_RADIUS ? "0.32" : "1";
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={wrap}
      aria-hidden="true"
      className="pointer-events-none fixed bottom-[22px] right-[26px] z-[45] h-[272px] w-[230px] transition-opacity duration-300"
    >
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
        <directionalLight color="#e8f0ff" intensity={1.6} position={[2.8, 0.8, -2.2]} />
        <SensorRig reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/sensor-head.glb");
useGLTF.preload("/tripod-base.glb");
