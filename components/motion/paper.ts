/* Bảng màu, kích thước và hàm chuyển động dùng chung cho các phim case (docs/case-motion.md).
   File trong components/motion/ chỉ import tương đối: Remotion CLI tự bundle và không hiểu
   alias "@/" của Next. */

import { Easing, interpolate, spring } from "remotion";

export const FPS = 30;
export const W = 1280;
export const H = 720;

export const C = {
  paper: "#F3F1EA",
  floor: "#E6E0D0",
  floorLine: "#D6CEBA",
  ink: "#1D1D1B",
  moss: "#1F5A3D",
  mossDeep: "#174631",
  lime: "#C8F560",
  skin: "#F2C9A0",
  skinShade: "#E3B48A",
  hair: "#2A2420",
  blush: "#F0997B",
  white: "#FFFFFF",
  sheet: "#FBFAF6",
  grid: "#E3DED1",
  wood: "#C9A77C",
  woodDeep: "#B08C5D",
  navy: "#2F3B55",
  navyDeep: "#243049",
  tie: "#C8553D",
  angry: "#E8826A",
  sweat: "#8EC5E8",
  light: "#FFF3C9",
  grey: "#8A857B",
};

export const fonts = {
  sans: "var(--hero-grotesk, 'Space Grotesk'), system-ui, sans-serif",
  mono: "var(--hero-mono, 'IBM Plex Mono'), ui-monospace, monospace",
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0 → 1 trong khoảng khung [a, b], mặc định ease in-out. */
export function ramp(frame: number, a: number, b: number, ease: (t: number) => number = Easing.inOut(Easing.cubic)) {
  return interpolate(frame, [a, b], [0, 1], { ...clamp, easing: ease });
}

/** Lò xo nảy bắt đầu ở khung `at`; trước đó là 0. */
export function pop(frame: number, at: number, stiffness = 180, damping = 12) {
  return spring({ frame: frame - at, fps: FPS, config: { stiffness, damping, mass: 0.6 } });
}

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Trộn hai màu hex. */
export function mixColor(a: string, b: string, t: number) {
  const p = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `rgb(${x.map((v, i) => Math.round(mix(v, y[i], t))).join(",")})`;
}

/** Chớp mắt định kỳ: trả về 0..1 (1 = nhắm). `seed` lệch nhịp giữa các nhân vật. */
export function blink(frame: number, every = 96, seed = 0) {
  const t = (frame + seed) % every;
  return t < 3 ? [0.5, 1, 0.5][t] : 0;
}

/** IK hai đoạn: từ vai S tới bàn tay T, khuỷu bẻ về phía `bend` (1 hoặc -1). */
export function reach(sx: number, sy: number, tx: number, ty: number, l1: number, l2: number, bend: 1 | -1) {
  const dx = tx - sx, dy = ty - sy;
  const d = Math.min(Math.max(Math.hypot(dx, dy), Math.abs(l1 - l2) + 0.01), l1 + l2 - 0.01);
  const a = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d));
  const base = Math.atan2(dy, dx) + bend * a;
  return { ex: sx + l1 * Math.cos(base), ey: sy + l1 * Math.sin(base) };
}

/** Camera nhìn vào điểm (cx, cy) của khung với độ phóng `s` — dùng làm transform của nhóm cảnh. */
export const camera = (cx: number, cy: number, s: number) => `translate(${W / 2} ${H / 2}) scale(${s}) translate(${-cx} ${-cy})`;

/** Lắc đều theo khung (cho rung, run, chóng mặt): biên độ `amp`, tần số `speed`. */
export const wobble = (f: number, amp: number, speed = 1.7, seed = 0) => Math.sin(f * speed + seed) * amp;

/** Tách một câu làm hai dòng gần bằng nhau theo từ (chữ dài trên thẻ nhỏ). */
export function twoLines(text: string): [string, string] {
  const words = text.split(" ");
  let best = 1, diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (d < diff) { diff = d; best = i; }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

/** Các điểm của đường cong Bézier bậc ba, chỉ tới tỉ lệ `upto` — để vẽ dần một đường đứt nét. */
export function curve(a: number[], b: number[], c: number[], d: number[], upto: number) {
  const pts: string[] = [];
  for (let k = 0; k <= 24; k++) {
    const t = (k / 24) * upto, u = 1 - t;
    const x = u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0];
    const y = u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1];
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}
