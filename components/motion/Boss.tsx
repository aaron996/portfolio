/* Sếp — nhân vật phụ kiểu giấy cắt: đầu hói hai chỏm tóc bạc, ria mép, vest xanh than,
   cà vạt đỏ. Ngồi sau bàn: gốc toạ độ ở mép bàn, giữa thân. */

import { C, mixColor } from "./paper";

export type BossPose = {
  /** 0..1 mặt đỏ dần vì tức. */
  red?: number;
  /** 0..1 mắt hoá vòng xoáy. */
  dizzy?: number;
  /** Góc quay vòng xoáy (độ). */
  spin?: number;
  /** 0..1 lông mày nhíu lo lắng. */
  worry?: number;
  /** -1..1 nhìn trái/phải, -1..1 nhìn lên/xuống. */
  look?: number;
  lookY?: number;
  /** 0..1 há miệng. */
  gasp?: number;
  /** Giọt mồ hôi: 0 = không, 0..1 = đang lăn xuống. */
  sweat?: number;
  /** Đầu nhấc lên (px) và nghiêng (độ). */
  lift?: number;
  tilt?: number;
  blink?: number;
  /** 0..1 vui: mắt cong hình ^, miệng cười. */
  happy?: number;
};

function Spiral({ cx, cy, spin }: { cx: number; cy: number; spin: number }) {
  return <path transform={`rotate(${spin} ${cx} ${cy})`} fill="none" stroke={C.ink} strokeWidth={2.6} strokeLinecap="round"
    d={`M${cx} ${cy} m0 -1.5 a1.5 1.5 0 1 1 -1.5 1.5 a4 4 0 1 1 4 4 a7 7 0 1 1 -7 -7 a9.5 9.5 0 1 1 9.5 9.5`} />;
}

export function Boss({ x, y, pose = {}, filter }: { x: number; y: number; pose?: BossPose; filter?: string }) {
  const { red = 0, dizzy = 0, spin = 0, worry = 0, look = 0, lookY = 0, gasp = 0, sweat = 0, lift = 0, tilt = 0, blink = 0, happy = 0 } = pose;
  const skin = mixColor(C.skin, C.angry, red);
  const ex = look * 6, ey = lookY * 4;
  const browY = -226 - worry * 6;

  return <g transform={`translate(${x} ${y})`} filter={filter}>
    <path d="M-112 20 Q-114 -108 -62 -130 L62 -130 Q114 -108 112 20 Z" fill={C.navy} />
    <polygon points="-34,-130 34,-130 0,-62" fill={C.sheet} />
    <polygon points="-34,-130 -6,-66 -44,-96" fill={C.navyDeep} />
    <polygon points="34,-130 6,-66 44,-96" fill={C.navyDeep} />
    <polygon points="0,-116 -11,-98 0,-46 11,-98" fill={C.tie} />
    <rect x={-8} y={-128} width={16} height={12} rx={3} fill={C.tie} />

    <g transform={`translate(0 ${-lift}) rotate(${tilt} 0 -140)`}>
      <rect x={-16} y={-150} width={32} height={24} fill={C.skinShade} />
      <circle cx={-60} cy={-196} r={12} fill={skin} />
      <circle cx={60} cy={-196} r={12} fill={skin} />
      <circle cx={0} cy={-200} r={62} fill={skin} />
      <ellipse cx={-54} cy={-226} rx={13} ry={18} fill={C.grey} />
      <ellipse cx={54} cy={-226} rx={13} ry={18} fill={C.grey} />
      <path d="M-8 -262 Q-4 -280 6 -276 M4 -262 Q12 -282 20 -272" fill="none" stroke={C.grey} strokeWidth={3} strokeLinecap="round" />

      <line x1={-36} y1={browY + worry * 4} x2={-10} y2={browY - worry * 3} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
      <line x1={10} y1={browY - worry * 3} x2={36} y2={browY + worry * 4} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />

      {happy > 0.5
        ? <g fill="none" stroke={C.ink} strokeWidth={4.5} strokeLinecap="round">
          <path d="M-32 -198 Q-22 -212 -12 -198" /><path d="M12 -198 Q22 -212 32 -198" />
        </g>
        : dizzy > 0.5
        ? <><Spiral cx={-22} cy={-202} spin={spin} /><Spiral cx={22} cy={-202} spin={-spin} /></>
        : <>
          <circle cx={-22} cy={-202} r={11} fill={C.white} />
          <circle cx={22} cy={-202} r={11} fill={C.white} />
          <ellipse cx={-22 + ex} cy={-201 + ey} rx={5.5} ry={5.5 * (1 - blink * 0.9)} fill={C.ink} />
          <ellipse cx={22 + ex} cy={-201 + ey} rx={5.5} ry={5.5 * (1 - blink * 0.9)} fill={C.ink} />
        </>}

      <ellipse cx={0} cy={-182} rx={10} ry={8} fill={C.skinShade} />
      <path d="M-26 -166 Q-14 -176 0 -170 Q14 -176 26 -166 Q14 -160 0 -164 Q-14 -160 -26 -166Z" fill="#4A4440" />
      {happy > 0.5
        ? <path d="M-18 -154 Q0 -134 18 -154 Q0 -146 -18 -154Z" fill="#5A2A22" stroke="#5A2A22" strokeWidth={3} strokeLinejoin="round" />
        : gasp > 0.05
        ? <ellipse cx={0} cy={-148} rx={10 + gasp * 4} ry={3 + gasp * 10} fill="#5A2A22" />
        : <path d="M-12 -150 Q0 -146 12 -150" fill="none" stroke={C.ink} strokeWidth={3} strokeLinecap="round" />}

      {sweat > 0 && sweat < 1 && <path transform={`translate(64 ${-236 + sweat * 50})`} d="M0 -10 Q8 2 0 8 Q-8 2 0 -10Z" fill={C.sweat} opacity={1 - sweat * 0.6} />}
    </g>
  </g>;
}
