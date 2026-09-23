export type TransferPhase = "hold" | "lift" | "place" | "release" | "depart";

export interface ChoreographyState {
  activeChapterId: "inbound" | "sorting" | "fleet" | "control" | "dispatch";
  chapterProgress: number;
}

export const TRANSFER_GEOMETRY = {
  containerLength: 3.2,
  containerWidth: 1.25,
  containerHeight: 1.25,
  trailerWidth: 1.7,
  trailerDeckY: 0.95,
  trailerCenterZ: -1.8,
  startX: -3,
  startZ: 0.2,
  spreaderFrameOffsetY: 0.85,
} as const;

export const TRANSFER_TIMELINE = {
  liftEnd: 0.08,
  placeEnd: 0.14,
  releaseEnd: 0.18,
  departEnd: 0.8,
} as const;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const t = clamp01(value); return t * t * (3 - 2 * t); };
const mix = (start: number, end: number, t: number) => start + (end - start) * t;

export function getTransferPhase(state: ChoreographyState): { phase: TransferPhase; progress: number } {
  if (state.activeChapterId === "inbound") return { phase: "hold", progress: state.chapterProgress };
  if (state.activeChapterId === "sorting") {
    if (state.chapterProgress < TRANSFER_TIMELINE.liftEnd) return { phase: "lift", progress: state.chapterProgress / TRANSFER_TIMELINE.liftEnd };
    if (state.chapterProgress < TRANSFER_TIMELINE.placeEnd) return { phase: "place", progress: (state.chapterProgress - TRANSFER_TIMELINE.liftEnd) / (TRANSFER_TIMELINE.placeEnd - TRANSFER_TIMELINE.liftEnd) };
    return { phase: "release", progress: clamp01((state.chapterProgress - TRANSFER_TIMELINE.placeEnd) / (TRANSFER_TIMELINE.releaseEnd - TRANSFER_TIMELINE.placeEnd)) };
  }
  return { phase: "depart", progress: state.activeChapterId === "fleet" ? clamp01(state.chapterProgress / TRANSFER_TIMELINE.departEnd) : 1 };
}

/** Truck origin and yaw are shared by vehicle and its single container after release. */
export function getTruckPose(routeProgress: number) {
  const p = clamp01(routeProgress);
  if (p < 0.48) {
    const progress = p / 0.48;
    return { x: 0, z: 2 + progress * 14, yaw: 0, distance: progress * 14 };
  }
  const progress = (p - 0.48) / 0.52;
  const angle = progress * (Math.PI / 2);
  const radius = 6.5;
  return { x: radius - Math.cos(angle) * radius, z: 16 + Math.sin(angle) * radius, yaw: angle, distance: 14 + angle * radius };
}

export interface TransferPose {
  phase: TransferPhase;
  container: { x: number; y: number; z: number; yaw: number };
  spreader: { x: number; y: number; z: number; yaw: number };
  truck: ReturnType<typeof getTruckPose>;
}

/** All world transforms derive from scroll state, including reverse and direct jumps. */
export function getTransferPose(state: ChoreographyState): TransferPose {
  const { phase, progress } = getTransferPhase(state);
  const g = TRANSFER_GEOMETRY;
  const deckCenterY = g.trailerDeckY + g.containerHeight / 2;
  const groundCenterY = g.containerHeight / 2;
  const raisedCenterY = 3.2;
  const truck = getTruckPose(phase === "depart" ? progress : 0);
  let x: number = g.startX;
  let y: number = groundCenterY;
  let z: number = g.startZ;
  let yaw: number = 0;

  if (phase === "lift") y = mix(groundCenterY, raisedCenterY, smooth(progress));
  if (phase === "place") {
    const travel = smooth(progress / 0.65);
    const lower = smooth((progress - 0.65) / 0.35);
    x = mix(g.startX, 0, travel);
    y = mix(raisedCenterY, deckCenterY, lower);
    yaw = travel * Math.PI / 2;
  }
  if (phase === "release" || phase === "depart") {
    const localZ = g.trailerCenterZ;
    x = truck.x + Math.sin(truck.yaw) * localZ;
    y = deckCenterY;
    z = truck.z + Math.cos(truck.yaw) * localZ;
    yaw = truck.yaw + Math.PI / 2;
  }

  const topY = y + g.containerHeight / 2;
  const engagedOriginY = topY - g.spreaderFrameOffsetY;
  const release = phase === "release" ? smooth(progress) : phase === "depart" ? 1 : 0;
  return {
    phase,
    container: { x, y, z, yaw },
    spreader: { x: mix(x, g.startX, release), y: engagedOriginY + release * 1.2, z: mix(z, g.startZ, release), yaw: mix(yaw, 0, release) },
    truck,
  };
}
