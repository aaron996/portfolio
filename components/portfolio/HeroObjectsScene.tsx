"use client";

import { Component, type ReactNode, useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Box3, Euler, Group, Matrix4, Mesh, OrthographicCamera, Quaternion, Vector3 } from "three";
import { useReducedMotion } from "motion/react";
import { HeroObjectRig } from "./HeroObjectRig";

type Active = "container" | "keyboard" | null;

interface BoxProps {
  size: [number, number, number];
  position?: [number, number, number];
  color: string;
  radius?: number;
  metal?: number;
  emissive?: string;
  emissiveIntensity?: number;
}

function Part({
  size,
  position,
  color,
  radius = 0.025,
  metal = 0.15,
  emissive,
  emissiveIntensity = 0,
}: BoxProps) {
  return (
    <RoundedBox args={size} position={position} radius={radius} smoothness={2}>
      <meshStandardMaterial
        color={color}
        roughness={0.48}
        metalness={metal}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
      />
    </RoundedBox>
  );
}

/**
 * Geometric concept models; Maersk blue from published static brand token #42B0D5.
 */
function ContainerModel({ active }: { active: boolean }) {
  const edgeColor = active ? "#95e0f7" : "#75c5df";
  const edgeEmissive = active ? "#42b0d5" : undefined;
  const edgeIntensity = active ? 0.35 : 0;

  return (
    <group>
      <Part size={[3, 1.12, 1.12]} color="#42b0d5" />
      {[-1, 1].map((side) => (
        <group key={side}>
          {Array.from({ length: 19 }, (_, i) => (
            <Part
              key={i}
              size={[0.065, 0.98, 0.035]}
              position={[-1.35 + i * 0.15, 0, side * 0.575]}
              color="#42b0d5"
              radius={0.006}
            />
          ))}
          <Part
            size={[3.04, 0.09, 0.09]}
            position={[0, side * 0.52, 0.575]}
            color={edgeColor}
            radius={0.008}
            emissive={edgeEmissive}
            emissiveIntensity={edgeIntensity}
          />
          <Part
            size={[0.09, 1.13, 1.15]}
            position={[side * 1.48, 0, 0]}
            color={edgeColor}
            radius={0.01}
            emissive={edgeEmissive}
            emissiveIntensity={edgeIntensity}
          />
        </group>
      ))}
      {Array.from({ length: 19 }, (_, i) => (
        <Part
          key={i}
          size={[0.065, 0.035, 1]}
          position={[-1.35 + i * 0.15, 0.575, 0]}
          color="#62bfdd"
          radius={0.006}
        />
      ))}
      {[-0.27, 0.27].map((z) => (
        <group key={z}>
          <Part size={[0.035, 0.93, 0.48]} position={[1.54, 0, z]} color="#3499bb" radius={0.005} />
          <Part size={[0.055, 0.83, 0.026]} position={[1.57, 0, z]} color="#d9e1df" metal={0.7} radius={0.005} />
          <Part size={[0.07, 0.035, 0.14]} position={[1.59, -0.13, z]} color="#d9e1df" metal={0.7} radius={0.004} />
        </group>
      ))}
    </group>
  );
}

function KeyboardModel({ active, pressed, reducedMotion }: { active: boolean; pressed: boolean; reducedMotion?: boolean }) {
  const accentEmissive = active ? "#d4f236" : undefined;
  const accentIntensity = active ? 0.45 : 0;
  const keySinkY = pressed && !reducedMotion ? -0.04 : 0;

  return (
    <group>
      <Part size={[3.05, 0.25, 1.18]} color="#b6b5a4" radius={0.085} metal={0.4} />
      <Part size={[2.94, 0.07, 1.09]} position={[0, 0.13, 0]} color="#1d2725" radius={0.05} />
      <group position={[0, keySinkY, 0]}>
        {Array.from({ length: 4 }, (_, row) =>
          Array.from({ length: 12 }, (_, col) => {
            if (row === 3 && col > 2 && col < 8) return null;
            const space = row === 3 && col === 2;
            const accent = (row === 0 && col === 0) || (row === 2 && col === 11);
            const dark = (col === 0 || col === 11) && !accent;
            return (
              <Part
                key={`${row}-${col}`}
                size={[space ? 1.37 : 0.205, 0.14, 0.21]}
                position={[-1.32 + col * 0.24 + (space ? 0.6 : 0), 0.23, -0.375 + row * 0.25]}
                color={accent ? "#d4f236" : dark ? "#45534d" : "#eee8d3"}
                radius={0.024}
                metal={0.02}
                emissive={accent ? accentEmissive : undefined}
                emissiveIntensity={accent ? accentIntensity : 0}
              />
            );
          })
        )}
      </group>
      <Part size={[0.22, 0.035, 0.03]} position={[1.23, 0.175, 0.48]} color="#42b0d5" radius={0.008} />
    </group>
  );
}

export type HeroObjectBounds = Record<"container" | "keyboard", { left: number; top: number; width: number; height: number }>;

interface SceneObjectsProps {
  active: Active;
  pressed: Active;
  pointerRef: { current: { container: { x: number; y: number }; keyboard: { x: number; y: number } } };
  onReady: (invalidate: (() => void) | null) => void;
  onBounds: (bounds: HeroObjectBounds) => void;
}

function SceneObjects({ active, pressed, pointerRef, onReady, onBounds }: SceneObjectsProps) {
  const invalidate = useThree((state) => state.invalidate);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const reducedMotion = Boolean(useReducedMotion());
  const containerModel = useRef<Group>(null);
  const keyboardModel = useRef<Group>(null);

  useEffect(() => {
    onReady(invalidate);
    return () => onReady(null);
  }, [invalidate, onReady]);

  useEffect(() => {
    if (camera instanceof OrthographicCamera) {
      const compact = size.width < 240 || size.height < 320;
      camera.zoom = Math.min(size.width / 4.4, (compact ? Math.min(size.height, 240) : size.height) / 5.2);
      camera.position.x = compact ? 2.6 : 4.5;
      camera.lookAt(compact ? 0.65 : 0, 0, 0);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();

      // Project a stable motion envelope, not the animated pose. Moving the hit
      // region on every frame would cause hover/leave feedback at model edges.
      const project = (model: Group, position: number[], rotation: number[], tilt: number, lift: number, sink: number) => {
        model.updateWorldMatrix(true, true);
        const inverse = model.matrixWorld.clone().invert();
        const localBox = new Box3();
        model.traverse((child) => {
          if (child instanceof Mesh) {
            child.geometry.computeBoundingBox();
            if (child.geometry.boundingBox) {
              localBox.union(child.geometry.boundingBox.clone().applyMatrix4(new Matrix4().multiplyMatrices(inverse, child.matrixWorld)));
            }
          }
        });
        const points: Vector3[] = [];
        for (const x of [localBox.min.x, localBox.max.x])
          for (const y of [localBox.min.y, localBox.max.y])
            for (const z of [localBox.min.z, localBox.max.z]) points.push(new Vector3(x, y, z));
        let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
        for (const dx of [-tilt, 0, tilt]) for (const dy of [-tilt, 0, tilt]) for (const offset of [-sink, 0, lift]) {
          const transform = new Matrix4().compose(
            new Vector3(position[0], position[1] + offset, position[2]),
            new Quaternion().setFromEuler(new Euler(rotation[0] + dx, rotation[1] + dy, rotation[2])),
            new Vector3(1, 1, 1)
          );
          for (const corner of points) {
            const p = corner.clone().applyMatrix4(transform).project(camera);
            const x = (p.x + 1) * size.width / 2;
            const y = (1 - p.y) * size.height / 2;
            left = Math.min(left, x); right = Math.max(right, x);
            top = Math.min(top, y); bottom = Math.max(bottom, y);
          }
        }
        // Two pixels cover rounded geometry and interpolation between samples.
        left = Math.max(0, left - 2); top = Math.max(0, top - 2);
        right = Math.min(size.width, right + 2); bottom = Math.min(size.height, bottom + 2);
        return { left, top, width: right - left, height: bottom - top };
      };
      if (containerModel.current && keyboardModel.current) {
        onBounds({
          container: project(containerModel.current, [0, 1.38, 0], [0.06, -0.32, -0.14], 0.07, 0.07, 0.03),
          keyboard: project(keyboardModel.current, [-0.1, -1.98, 0.4], [0.22, 0.12, 0.13], 0.1, 0.1, 0.05),
        });
      }
      invalidate();
    }
  }, [camera, size, invalidate, onBounds]);

  const containerPointer = {
    get current() {
      return pointerRef.current.container;
    },
  };

  const keyboardPointer = {
    get current() {
      return pointerRef.current.keyboard;
    },
  };

  return (
    <>
      <HeroObjectRig
        id="container"
        active={active === "container"}
        pressed={pressed === "container"}
        pointerRef={containerPointer}
        restPosition={[0, 1.38, 0]}
        restRotation={[0.06, -0.32, -0.14]}
        hoverLift={0.07}
        pressSink={0.03}
        maxTiltX={0.07}
        maxTiltY={0.07}
      >
        <group ref={containerModel}><ContainerModel active={active === "container"} /></group>
      </HeroObjectRig>

      <HeroObjectRig
        id="keyboard"
        active={active === "keyboard"}
        pressed={pressed === "keyboard"}
        pointerRef={keyboardPointer}
        restPosition={[-0.1, -1.98, 0.4]}
        restRotation={[0.22, 0.12, 0.13]}
        hoverLift={0.10}
        pressSink={0.05}
        maxTiltX={0.10}
        maxTiltY={0.10}
      >
        <group ref={keyboardModel}><KeyboardModel active={active === "keyboard"} pressed={pressed === "keyboard"} reducedMotion={reducedMotion} /></group>
      </HeroObjectRig>
    </>
  );
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export type HeroObjectsSceneProps = SceneObjectsProps;

// R3F compares camera options during configuration. Keep this reference stable
// when projected bounds update the DOM overlay in the parent component.
const cameraOptions = { position: [4.5, 5.4, 10] as [number, number, number], zoom: 75 };

export function HeroObjectsScene(props: HeroObjectsSceneProps) {
  return (
    <SceneBoundary>
      <Canvas
        orthographic
        camera={cameraOptions}
        dpr={[1, 1.5]}
        frameloop="demand"
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[2, 6, 5]} intensity={3} color="#fff7df" />
        <directionalLight position={[-4, 1, 3]} intensity={1.5} color="#b3dbed" />
        <directionalLight position={[1, 2, -3]} intensity={2} color="#d4f236" />
        <SceneObjects {...props} />
      </Canvas>
    </SceneBoundary>
  );
}
