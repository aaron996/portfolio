/* Chữ, dàn nhân vật và đạo cụ chung của phim Tìm kho làm trễ (docs/case-motion.md). */

import { caseStudies } from "../../../content/cases.vi";
import { GHN_OUTFIT, ghnLook } from "../ghn";
import type { Look } from "../Person";
import { C, fonts } from "../paper";

export const study = caseStudies.find(c => c.slug === "warehouse-attribution")!;
export const lines = study.motion!.lines;
export const LETTERS = ["A", "B", "C", "D", "E"];
export const whName = (k: number) => `${lines.wh} ${LETTERS[k]}`;
export const SHADOW = "url(#cut)";

export const BUSINESS: Look = { ...ghnLook(GHN_OUTFIT, "manager", lines.brand), hair: "bob", hairColor: "#5A3A28", glasses: undefined };

/** Kiện hàng có mắt — nhân vật đi qua các kho. Gốc ở giữa cạnh đáy. */
export function Parcel({ x, y, s = 1, blink = 0, look = 0, squash = 0 }: { x: number; y: number; s?: number; blink?: number; look?: number; squash?: number }) {
  const w = 70 * (1 + squash * 0.2), h = 58 * (1 - squash * 0.2);
  return <g transform={`translate(${x} ${y}) scale(${s})`} filter={SHADOW}>
    <rect x={-w / 2} y={-h} width={w} height={h} rx={5} fill={C.wood} />
    <rect x={-7} y={-h} width={14} height={h} fill={C.woodDeep} />
    <ellipse cx={-16 + look * 4} cy={-h + 22} rx={5} ry={6 * (1 - blink * 0.85)} fill={C.ink} />
    <ellipse cx={16 + look * 4} cy={-h + 22} rx={5} ry={6 * (1 - blink * 0.85)} fill={C.ink} />
  </g>;
}

/** Phong bì yêu cầu đền bù. `open` 0..1 mở nắp. */
export function Envelope({ x, y, s = 1, r = 0, open = 0 }: { x: number; y: number; s?: number; r?: number; open?: number }) {
  return <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter={SHADOW}>
    <rect x={-50} y={-32} width={100} height={64} rx={5} fill={C.white} />
    <path d="M-50 32 L0 0 L50 32" fill="none" stroke={C.grid} strokeWidth={3} />
    <g transform={`translate(0 -32) scale(1 ${1 - open * 2})`}>
      <path d="M-50 0 L0 34 L50 0Z" fill="#F1EDE3" stroke={C.grid} strokeWidth={3} />
    </g>
    <circle cx={0} cy={2} r={7} fill={C.tie} />
  </g>;
}

export function Chip({ x, y, s, text, bg = C.white, color = C.ink, size = 20 }: { x: number; y: number; s: number; text: string; bg?: string; color?: string; size?: number }) {
  if (s <= 0.01) return null;
  const w = text.length * size * 0.56 + 36;
  return <g transform={`translate(${x} ${y}) scale(${s})`} filter={SHADOW}>
    <rect x={-w / 2} y={-size} width={w} height={size * 2} rx={size} fill={bg} />
    <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={size} fill={color}>{text}</text>
  </g>;
}
