/* Chữ, dàn nhân vật và đạo cụ chung của phim Tự động hoá báo cáo tại Shopee (docs/case-motion.md).
   Team logistics của Shopee (team của Vinh) mặc áo cam thương hiệu Shopee, chữ "Shopee" in ngực —
   không dùng logo. Đối tác vận chuyển chỉ ghi tên bằng chữ. */

import { caseStudies } from "../../../content/cases.vi";
import type { Look } from "../Person";
import { C, fonts } from "../paper";

export const study = caseStudies.find(c => c.slug === "shopee-3pl-performance")!;
export const lines = study.motion!.lines;
export const SHADOW = "url(#cut)";
/** Cam thương hiệu Shopee. */
export const SHOPEE = "#EE4D2D";

const shirt = { top: SHOPEE, logo: { text: lines.shopee, color: C.white, center: true } };
export const TEAM: Look[] = [
  { ...shirt, hair: "ponytail", hairColor: "#2A2420", collar: "tee", bottom: "#2E3440" },
  { ...shirt, hair: "short", hairColor: "#3B2A22", glasses: "square", collar: "polo", trim: "#D63E20", bottom: "#3A3F48" },
  { ...shirt, hair: "bob", hairColor: "#5A3A28", collar: "tee", bottom: "#2E3440" },
];

export function Chip({ x, y, s, text, bg = C.white, color = C.ink, size = 20 }: { x: number; y: number; s: number; text: string; bg?: string; color?: string; size?: number }) {
  if (s <= 0.01) return null;
  const w = text.length * size * 0.56 + 36;
  return <g transform={`translate(${x} ${y}) scale(${s})`} filter={SHADOW}>
    <rect x={-w / 2} y={-size} width={w} height={size * 2} rx={size} fill={bg} />
    <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={size} fill={color}>{text}</text>
  </g>;
}
