/* Đồng hồ treo tường dùng chung. Góc kim tính bằng độ, 0 = 12 giờ, theo chiều kim đồng hồ. */

import { C } from "./paper";

export function Clock({ x, y, r = 50, minute, hour, filter }: {
  x: number; y: number; r?: number; minute: number; hour: number; filter?: string;
}) {
  return <g filter={filter}>
    <circle cx={x} cy={y} r={r} fill={C.white} />
    <circle cx={x} cy={y} r={r} fill="none" stroke={C.ink} strokeWidth={r * 0.11} />
    {Array.from({ length: 12 }, (_, i) => <line key={i} x1={x} y1={y - r * 0.86} x2={x} y2={y - r * 0.72}
      stroke={C.ink} strokeWidth={r * 0.055} transform={`rotate(${i * 30} ${x} ${y})`} />)}
    <line x1={x} y1={y} x2={x} y2={y - r * 0.5} stroke={C.ink} strokeWidth={r * 0.11} strokeLinecap="round" transform={`rotate(${hour} ${x} ${y})`} />
    <line x1={x} y1={y} x2={x} y2={y - r * 0.74} stroke={C.tie} strokeWidth={r * 0.075} strokeLinecap="round" transform={`rotate(${minute} ${x} ${y})`} />
    <circle cx={x} cy={y} r={r * 0.09} fill={C.ink} />
  </g>;
}
