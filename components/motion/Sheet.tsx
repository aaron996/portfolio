/* Một tờ file Excel bằng giấy: dải đầu xanh rêu, lưới ô, tên file bên dưới.
   `number` → con số to giữa tờ. `peek` → hai mắt vuông của Trùng (bản sao) ló ra. */

import { C, fonts } from "./paper";

export function Sheet({ x, y, scale = 1, rot = 0, label, number, peek, blink = 0, opacity = 1, filter }: {
  x: number; y: number; scale?: number; rot?: number; label?: string; number?: string;
  peek?: boolean; blink?: number; opacity?: number; filter?: string;
}) {
  if (scale <= 0.01 || opacity <= 0.01) return null;
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`} opacity={opacity} filter={filter}>
    <rect x={-55} y={-70} width={110} height={140} rx={8} fill={C.sheet} />
    <path d="M-55 -54 L-55 -62 Q-55 -70 -47 -70 L47 -70 Q55 -70 55 -62 L55 -54 Z" fill={C.moss} />
    {[-32, -14, 4, 22, 40].map(gy => <line key={gy} x1={-45} x2={45} y1={gy} y2={gy} stroke={C.grid} strokeWidth={2} />)}
    <line x1={-15} x2={-15} y1={-46} y2={56} stroke={C.grid} strokeWidth={2} />
    {!number && [[-40, -28, 18], [-40, -10, 12], [-40, 8, 20], [-40, 26, 9], [-8, -28, 30], [-8, -10, 22], [-8, 8, 34], [-8, 26, 16]].map(([bx, by, bw], i) =>
      <rect key={i} x={bx} y={by} width={bw} height={6} rx={3} fill={i % 3 === 1 ? C.lime : "#CFC8B6"} />)}
    {number && <>
      <rect x={-46} y={-46} width={92} height={104} rx={6} fill={C.white} />
      <text x={0} y={-8} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={19} fill={C.ink}>{number.split(" ").slice(0, -1).join(" ")}</text>
      <text x={0} y={46} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={34} fill={C.tie}>{number.split(" ").slice(-1)[0]}</text>
    </>}
    {peek && <g>
      <rect x={18} y={-48} width={9} height={9 * (1 - blink * 0.85)} fill={C.ink} />
      <rect x={34} y={-48} width={9} height={9 * (1 - blink * 0.85)} fill={C.ink} />
    </g>}
    {label && <text x={0} y={94} textAnchor="middle" fontFamily={fonts.mono} fontWeight={500} fontSize={15} fill={C.ink}>{label}</text>}
  </g>;
}
