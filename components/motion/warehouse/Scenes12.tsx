/* Tìm kho làm trễ — cảnh 1 và 2 (docs/case-motion.md). Toạ độ theo "thế giới" của cả phim: cảnh 1
   ở ô trên-trái (0..1280, 0..720), cảnh 2 ở ô dưới-trái (0..1280, 720..1440).
   1. Sàn TMĐT gửi thư "Đơn này trễ. Đền bù!" — không nói trễ ở đâu. Năm kho xếp hàng như nhận diện
      nghi phạm, kho nào cũng gọi tên kho khác.
   2. Kiện hàng nhả ra các dấu quét Vào/Ra; Vinh dựng lại kiện nằm ở kho nào, bao lâu — Kho D giữ
      lâu nhất. Bản đầu có thêm loại kho trung chuyển, số ngày âm, cắt dữ liệu; Vinh thấy quá chuyên
      ngành nên đã bỏ (2026-10-11). */

import { Easing } from "remotion";
import { Vinh } from "../Vinh";
import { Warehouse } from "../Warehouse";
import { blink, C, fonts, mix, mixColor, pop, ramp, wobble } from "../paper";
import { Chip, Envelope, lines, Parcel, SHADOW, whName } from "./cast";

export const T = {
  env: 0, land: 22, letter: 28, shrink: 70, where: 86, whs: 92, accuse: 132, pan1: 210,
  vinh: 250, parcel: 244, stamps: 268, glint: 300, bars: 320, point: 372, pan2: 400,
};

/* ── Cảnh 1 ── */
const WH_X = [180, 410, 640, 870, 1100];
const ACCUSE = [1, 2, 3, 4, 0];

export function Scene1({ f }: { f: number }) {
  if (f > T.pan1 + 40) return null;
  const fly = ramp(f, T.env, T.land, Easing.out(Easing.quad));
  const ex = mix(-140, 640, fly), ey = mix(240, 330, fly) - Math.sin(fly * Math.PI) * 120;
  const open = ramp(f, T.land, T.land + 8);
  const rise = f < T.letter ? 0 : Math.min(pop(f, T.letter, 170, 13), 1.05);
  const shrink = ramp(f, T.shrink, T.shrink + 16, Easing.inOut(Easing.cubic));
  const lx = mix(640, 190, shrink), ly = mix(mix(330, 220, rise), 112, shrink), ls = mix(mix(0.5, 1, rise), 0.42, shrink);
  const where = f < T.where ? 0 : Math.min(pop(f, T.where, 220, 12), 1);
  return <g>
    {[0, 1, 2, 3, 4].map(k => <line key={k} x1={40} x2={1240} y1={360 + k * 50} y2={360 + k * 50} stroke="#D8D0BE" strokeWidth={3} />)}
    <rect x={0} y={600} width={1280} height={120} fill={C.floor} />
    <rect x={0} y={596} width={1280} height={6} fill={C.floorLine} />
    {WH_X.map((cx, k) => {
      const at = T.whs + k * 8;
      const p = f < at ? 0 : Math.min(pop(f, at, 170, 12), 1.04);
      const accusing = f > T.accuse + k * 10;
      const target = ACCUSE[k];
      const tilt = accusing ? wobble(f, 2.5, 1.4, k) : 0;
      if (p <= 0.01) return null;
      return <g key={k} transform={`translate(${cx} 600) scale(${p}) translate(${-cx} -600) rotate(${tilt} ${cx} 600)`}>
        <Warehouse x={cx - 105} y={425} size={210} label={whName(k)}
          face={{ look: accusing ? (WH_X[target] > cx ? 1 : -1) : 0, worry: true, blink: blink(f, 60, k * 9) }} />
        {accusing && f < T.pan1 + 10 && <Chip x={cx} y={385} s={Math.min(pop(f, T.accuse + k * 10, 230, 11), 1)} text={`${whName(target)}!`} size={17} />}
      </g>;
    })}
    {f < T.shrink + 20 && <Envelope x={ex} y={ey} s={1.2} r={(1 - fly) * -30} open={open} />}
    {rise > 0 && <g transform={`translate(${lx} ${ly}) scale(${ls})`} filter={SHADOW}>
      <rect x={-200} y={-110} width={400} height={220} rx={12} fill={C.white} />
      <rect x={-200} y={-110} width={400} height={50} rx={12} fill={C.moss} />
      <text x={0} y={-76} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={22} fill={C.white}>{lines.platform}</text>
      <text x={0} y={24} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={34} fill={C.tie}>{lines.claim}</text>
      {[0, 1].map(l => <rect key={l} x={-150} y={56 + l * 18} width={l ? 200 : 300} height={8} rx={4} fill={C.grid} />)}
    </g>}
    <Chip x={430} y={112} s={where} text={lines.noWhere} bg={C.tie} color={C.white} />
  </g>;
}

/* ── Cảnh 2 (y + 720) ── */
const Y2 = 720;
const ROWS = { A: 230, B: 290, C: 350, D: 410 };
const STAYS = lines.stays.split("|");
/** 100px một ngày; Kho D giữ kiện lâu nhất. */
const BARS = [
  { row: "A", x0: 200, x1: 250, at: T.bars, label: STAYS[0] },
  { row: "B", x0: 260, x1: 360, at: T.bars + 12, label: STAYS[1] },
  { row: "C", x0: 370, x1: 420, at: T.bars + 24, label: STAYS[2] },
  { row: "D", x0: 430, x1: 730, at: T.bars + 34, label: STAYS[3] },
] as const;
const STAMPS = ["A", "A", "B", "B", "C", "C", "D", "D"];

function rowY(row: keyof typeof ROWS) { return Y2 + ROWS[row]; }

function Stamp({ x, y, s, text, inbound }: { x: number; y: number; s: number; text: string; inbound: boolean }) {
  if (s <= 0.01) return null;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-46} y={-20} width={92} height={40} rx={8} fill={C.white} stroke={inbound ? C.moss : C.tie} strokeWidth={4} />
    <text x={0} y={7} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={18} fill={inbound ? C.moss : C.tie}>{text}</text>
  </g>;
}

export function Scene2({ f }: { f: number }) {
  if (f < T.pan1 - 10 || f > T.pan2 + 40) return null;
  const hop = ramp(f, T.parcel, T.parcel + 18, Easing.out(Easing.quad));
  const px = mix(40, 190, hop), py = Y2 + 600 - Math.sin(hop * Math.PI) * 90;
  const vinhIn = ramp(f, T.vinh, T.vinh + 30, Easing.out(Easing.quad));
  const push = ramp(f, T.glint - 8, T.glint, Easing.out(Easing.back(1.5))) * (1 - ramp(f, T.glint + 10, T.glint + 18));
  const point = f > T.point - 6 && f < T.pan2 - 6;
  const longest = ramp(f, T.point, T.point + 10);
  return <g>
    <rect x={0} y={Y2 + 600} width={1280} height={140} fill={C.floor} />
    <rect x={0} y={Y2 + 596} width={1280} height={6} fill={C.floorLine} />
    <rect x={110} y={Y2 + 50} width={1060} height={480} rx={14} fill={C.white} filter={SHADOW} />
    <Chip x={250} y={Y2 + 84} s={f < T.parcel ? 0 : Math.min(pop(f, T.parcel, 200, 12), 1)} text={lines.passport} bg={C.moss} color={C.white} size={18} />

    {/* Trục thời gian và tên kho */}
    <line x1={170} x2={1110} y1={Y2 + 470} y2={Y2 + 470} stroke={C.ink} strokeWidth={3} />
    {Array.from({ length: 10 }, (_, k) => <line key={k} x1={200 + k * 100} x2={200 + k * 100} y1={Y2 + 462} y2={Y2 + 478} stroke={C.ink} strokeWidth={2} />)}
    {(Object.keys(ROWS) as (keyof typeof ROWS)[]).map(r => <text key={r} x={150} y={rowY(r) + 7} textAnchor="end" fontFamily={fonts.sans} fontWeight={700} fontSize={18} fill={C.ink}
      opacity={ramp(f, T.bars - 6, T.bars)}>{`${lines.wh} ${r}`}</text>)}

    {/* Các lần ở kho */}
    {BARS.map((b, k) => {
      const grow = ramp(f, b.at, b.at + 12, Easing.out(Easing.quad));
      if (grow <= 0) return null;
      const y = rowY(b.row), hot = b.row === "D";
      return <g key={k}>
        {hot && longest > 0 && <rect x={b.x0 - 8} y={y - 22} width={b.x1 - b.x0 + 16} height={44} rx={10} fill={C.tie} opacity={0.16 * longest} />}
        <rect x={b.x0} y={y - 14} width={(b.x1 - b.x0) * grow} height={28} rx={6} fill={hot ? mixColor(C.moss, C.tie, longest) : C.moss} />
        {grow >= 1 && <text x={b.x1 + 22} y={y + 7} fontFamily={fonts.sans} fontWeight={700} fontSize={hot ? mix(18, 24, longest) : 18}
          fill={hot ? mixColor(C.ink, C.tie, longest) : C.ink}>{`${b.label} ${lines.day}`}</text>}
      </g>;
    })}

    {/* Dấu quét mã nhả ra từ kiện hàng, rồi chạy về hai đầu mỗi thanh */}
    {STAMPS.map((w, k) => {
      const at = T.stamps + k * 6;
      if (f < at) return null;
      const bar = BARS[Math.floor(k / 2)];
      const inbound = k % 2 === 0;
      const settle = ramp(f, bar.at, bar.at + 12, Easing.inOut(Easing.quad));
      const fly = ramp(f, at, at + 8, Easing.out(Easing.quad));
      const slot = { x: 200 + k * 116, y: Y2 + 130 };
      const x = mix(mix(px, slot.x, fly), inbound ? bar.x0 : bar.x1, settle);
      const y = mix(mix(py - 40, slot.y, fly), rowY(bar.row), settle);
      const s = mix(1.3 - 0.3 * Math.min(fly * 1.4, 1), 0.32, settle);
      return <Stamp key={k} x={x} y={y} s={s} text={`${inbound ? lines.scanIn : lines.scanOut} ${w}`} inbound={inbound} />;
    })}
    {f >= T.parcel && <Parcel x={px} y={py} s={1} blink={blink(f, 55, 4)} look={1} squash={f > T.parcel + 18 && f < T.parcel + 24 ? 0.5 : 0} />}

    <Vinh x={mix(1520, 1200, vinhIn)} y={Y2 + 600} scale={0.9} pose={{
      walk: f * 0.5, walking: 1 - ramp(f, T.vinh + 24, T.vinh + 32), look: -1, smile: 0.7, blink: blink(f, 90, 21),
      push, glint: ramp(f, T.glint - 4, T.glint + 6),
      handR: point ? { x: -110, y: -196 } : undefined,
    }} filter={SHADOW} />
  </g>;
}
