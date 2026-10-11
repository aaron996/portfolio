/* Màn hình GHN Ops Pulse trong phim, vẽ theo khung 1280×720 (cảnh nào đặt nó lên tường thì tự
   thu nhỏ). Bốn tầng: toàn quốc → miền → vùng → danh sách hub. Chuyển tầng bằng cách thẻ được
   chọn phóng ra cả vùng nội dung rồi tách thành các thẻ con — kiểu "Powers of Ten". */

import { Easing } from "remotion";
import { C, fonts, mix, ramp } from "../paper";
import { Warehouse } from "../Warehouse";
import { lines } from "./cast";

export type DashState = {
  level: 0 | 1 | 2 | 3;
  /** 0..1 tiến độ chuyển vào tầng `level` (1 = đã ổn định). */
  t: number;
  /** 0..1 nhãn "Cần ưu tiên" bật lên ở tầng hub. */
  tag?: number;
  /** Đổi chiều cao cột cho các bảng khác nhau (9 ảnh chụp buổi sáng). */
  variant?: number;
  /** Nhịp chớp đèn của hub dồn đơn. */
  pulse?: number;
};

type Rect = { x: number; y: number; w: number; h: number };
const CONTENT: Rect = { x: 80, y: 112, w: 1120, h: 552 };
const L1 = [0, 1, 2].map(i => ({ x: 80 + i * (1040 / 3 + 40), y: 112, w: 1040 / 3, h: 552 }));
const L2 = [0, 1, 2, 3].map(i => ({ x: 80 + (i % 2) * 580, y: 112 + Math.floor(i / 2) * 296, w: 540, h: 256 }));
const RED = 2;
const BARS = [0.9, 0.86, 0.56, 0.94, 0.89];

const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({ x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), w: mix(a.w, b.w, t), h: mix(a.h, b.h, t) });
const ease = Easing.inOut(Easing.cubic);
const seeded = (n: number) => { const v = Math.sin(n * 91.7) * 43758.5; return v - Math.floor(v); };

function Card({ r, red, opacity = 1 }: { r: Rect; red?: boolean; opacity?: number }) {
  return <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={18} fill="#F6F4EE" stroke={red ? C.tie : C.grid} strokeWidth={red ? 5 : 3} opacity={opacity} />;
}

function Bars({ r, n, seed, color = C.moss }: { r: Rect; n: number; seed: number; color?: string }) {
  const bw = (r.w - 60) / n;
  return <g>{Array.from({ length: n }, (_, i) => {
    const h = 20 + seeded(seed + i) * (r.h * 0.22);
    return <rect key={i} x={r.x + 30 + i * bw + bw * 0.18} y={r.y + r.h - 28 - h} width={bw * 0.64} height={h} rx={3} fill={color} opacity={0.85} />;
  })}</g>;
}

function CardText({ r, label, value, red, big, o }: { r: Rect; label: string; value: string; red?: boolean; big?: boolean; o: number }) {
  if (o <= 0.01) return null;
  return <g opacity={o}>
    <text x={r.x + 30} y={r.y + (big ? 70 : 56)} fontFamily={fonts.sans} fontWeight={700} fontSize={big ? 44 : 30} fill={C.ink}>{label}</text>
    <text x={r.x + 26} y={r.y + (big ? 290 : 160)} fontFamily={fonts.sans} fontWeight={700} fontSize={big ? 210 : 86} fill={red ? C.tie : C.ink}>{value}</text>
    {red && <circle cx={r.x + r.w - 34} cy={r.y + 40} r={12} fill={C.tie} />}
  </g>;
}

function HubRows({ t, tag = 0, pulse = 0, variant = 0 }: { t: number; tag?: number; pulse?: number; variant?: number }) {
  return <g>{BARS.map((b, i) => {
    const q = ease(ramp(t, 0.45 + i * 0.07, 0.8 + i * 0.05));
    if (q <= 0) return null;
    const y = 132 + i * 104, red = i === RED;
    const len = (variant ? 0.5 + seeded(variant * 7 + i) * 0.45 : b) * 560;
    return <g key={i} transform={`translate(${(1 - q) * 160} 0)`} opacity={q}>
      <rect x={80} y={y} width={1120} height={88} rx={14} fill={red ? "#FBEDE8" : "#F6F4EE"} stroke={red ? C.tie : C.grid} strokeWidth={red ? 4 : 2} />
      <text x={112} y={y + 56} fontFamily={fonts.sans} fontWeight={700} fontSize={30} fill={C.ink}>{`${lines.hub} ${i + 1}`}</text>
      <rect x={300} y={y + 30} width={560} height={28} rx={14} fill={C.grid} />
      <rect x={300} y={y + 30} width={len} height={28} rx={14} fill={red ? C.tie : C.moss} />
      {red && tag > 0 && <g transform={`translate(1000 ${y + 44}) scale(${tag})`}>
        <rect x={-104} y={-24} width={150} height={48} rx={24} fill={C.tie} />
        <text x={-29} y={9} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={22} fill={C.white}>{lines.priority}</text>
      </g>}
      {red && <Warehouse x={1100} y={y - 6} size={92} parcels={6} alarm={0.5 + 0.5 * Math.sin(pulse)} />}
    </g>;
  })}</g>;
}

export function Dashboard({ state }: { state: DashState }) {
  const { level, t, tag, variant = 0, pulse = 0 } = state;
  const values1 = lines.regionValues.split("|"), values2 = lines.zoneValues.split("|");
  const regions = [lines.region1, lines.region2, lines.region3];
  const crumbs = [lines.national, ...(level >= 2 ? [lines.region3] : []), ...(level >= 3 ? [`${lines.zone} ${RED + 1}`] : [])];
  const parentFade = 1 - ramp(t, 0.15, 0.35);

  // Thẻ cha đang phóng ra cả vùng nội dung (trước khi tách).
  const parent = level === 1 ? CONTENT : level === 2 ? L1[RED] : level === 3 ? L2[RED] : CONTENT;
  const grow = ease(ramp(t, 0, 0.4));
  const parentRect = lerpRect(parent, CONTENT, grow);

  return <g>
    <rect x={0} y={0} width={1280} height={720} fill={C.white} />
    <rect x={0} y={0} width={1280} height={78} fill={C.paper} />
    {[34, 58, 82].map((cx, i) => <circle key={cx} cx={cx} cy={39} r={8} fill={[C.tie, "#E8B84A", C.moss][i]} />)}
    <text x={116} y={50} fontFamily={fonts.sans} fontWeight={700} fontSize={28} fill={C.ink}>{lines.app}</text>
    <text x={420} y={49} fontFamily={fonts.mono} fontWeight={500} fontSize={20} fill={C.grey}>{crumbs.join("  ›  ")}</text>

    {level === 0 && <g>
      <Card r={CONTENT} />
      <CardText r={CONTENT} label={lines.national} value={lines.nationalValue} big o={1} />
      <Bars r={CONTENT} n={14} seed={3 + variant} />
    </g>}

    {level >= 1 && t < 1 && parentFade > 0.01 && <g opacity={parentFade}>
      <Card r={parentRect} red={level > 1} />
    </g>}

    {level === 1 && L1.map((r, i) => {
      const q = ease(ramp(t, 0.3 + i * 0.08, 0.75 + i * 0.08));
      if (q <= 0) return null;
      const rr = lerpRect(CONTENT, r, q);
      return <g key={i}>
        <Card r={rr} red={i === RED} />
        <CardText r={rr} label={regions[i]} value={values1[i]} red={i === RED} o={ramp(q, 0.7, 1)} />
        {q > 0.7 && <Bars r={rr} n={6} seed={i * 11 + variant} color={i === RED ? C.tie : C.moss} />}
      </g>;
    })}

    {level === 2 && L2.map((r, i) => {
      const q = ease(ramp(t, 0.35 + i * 0.07, 0.8 + i * 0.05));
      if (q <= 0) return null;
      const rr = lerpRect(CONTENT, r, q);
      return <g key={i}>
        <Card r={rr} red={i === RED} />
        <CardText r={rr} label={`${lines.zone} ${i + 1}`} value={values2[i]} red={i === RED} o={ramp(q, 0.7, 1)} />
      </g>;
    })}

    {level === 3 && <HubRows t={t} tag={tag} pulse={pulse} variant={variant} />}
  </g>;
}
