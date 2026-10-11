/* Bong bóng nói dùng chung cho các phim: nảy vào ở khung `at`, rút đi trước `until`.
   Toạ độ theo khung hình; `tail` là điểm đuôi bong bóng chỉ vào người nói. */

import type { ReactNode } from "react";
import { Easing } from "remotion";
import { C, pop, ramp } from "./paper";

export function Speech({ f, at, until, x, y, w, h, tail, children }: {
  f: number; at: number; until: number; x: number; y: number; w: number; h: number;
  tail: [number, number]; children: ReactNode;
}) {
  const s = (f < at ? 0 : pop(f, at, 200, 12)) * (1 - ramp(f, until - 8, until, Easing.in(Easing.back(2))));
  if (s <= 0.01) return null;
  const [tx, ty] = tail, bx = Math.min(Math.max(tx, x + 40), x + w - 40);
  return <g transform={`translate(${tx} ${ty}) scale(${s}) translate(${-tx} ${-ty})`} filter="url(#cut)">
    <path d={`M${bx - 16} ${y + h - 2} L${tx} ${ty} L${bx + 14} ${y + h - 2}Z`} fill={C.white} />
    <rect x={x} y={y} width={w} height={h} rx={Math.min(h / 2, 30)} fill={C.white} />
    {children}
  </g>;
}
