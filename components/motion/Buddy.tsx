/* Chấm / Trùng / Lệch trong phim — cùng hình với bạn đồng hành trên site (docs/companions.md):
   ô vuông góc bo nhẹ, hai mắt bầu dục màu giấy. Gốc toạ độ ở giữa cạnh đáy. */

import { C } from "./paper";

export const BUDDY = { dot: "#3a3a33", outlier: "#2a8a57" };

export function Buddy({ x, y, size = 30, color = BUDDY.dot, blink = 0, look = 0, squash = 0, rot = 0, tall = 1, pout = false }: {
  x: number; y: number; size?: number; color?: string; blink?: number; look?: number;
  /** >0 bẹp xuống khi tiếp đất, <0 vươn dài khi bật lên. */
  squash?: number; rot?: number;
  /** Kéo cao thân (Lệch làm "cột vọt"). */
  tall?: number;
  pout?: boolean;
}) {
  const w = size * (1 + squash * 0.25), h = size * tall * (1 - squash * 0.25);
  const ew = size * 0.2, eh = size * 0.24 * (1 - blink * 0.85);
  const ey = -h + size * 0.26 + size * 0.12;
  return <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2} y={-h} width={w} height={h} rx={size * 0.08} fill={color} />
    <ellipse cx={-w * 0.2 + look * size * 0.08} cy={ey} rx={ew / 2} ry={eh / 2} fill={C.paper} />
    <ellipse cx={w * 0.2 + look * size * 0.08} cy={ey} rx={ew / 2} ry={eh / 2} fill={C.paper} />
    {pout && <path d={`M${-size * 0.12} ${ey + size * 0.32} Q0 ${ey + size * 0.24} ${size * 0.12} ${ey + size * 0.32}`} stroke={C.paper} strokeWidth={size * 0.06} fill="none" strokeLinecap="round" />}
  </g>;
}
