/* Câu chốt kết quả trước cảnh kết logo — chữ to, gạch chân lime, nảy vào giữa khung.
   Dùng chung cho mọi phim case (docs/case-motion.md: mỗi phim kết bằng một câu kết quả đậm).
   Câu dài tự tách hai dòng theo từ; muốn chọn chỗ xuống dòng thì đặt "\n" trong câu. */

import { C, fonts, pop, ramp, twoLines } from "./paper";

export function Tagline({ f, at, text, y = 330 }: { f: number; at: number; text: string; y?: number }) {
  const s = f < at ? 0 : Math.min(pop(f, at, 180, 13), 1.04);
  if (s <= 0.01) return null;
  const rows = text.includes("\n") ? text.split("\n") : text.length > 26 ? twoLines(text) : [text];
  const size = rows.length > 1 ? 54 : 60;
  const under = ramp(f, at + 6, at + 22);
  return <g transform={`translate(640 ${y}) scale(${s})`}>
    <rect x={-560} y={-40 - rows.length * 40} width={1120} height={rows.length * 80 + 60} rx={28} fill={C.white} filter="url(#cut)" />
    {rows.map((line, k) => {
      const ly = (k - (rows.length - 1) / 2) * 72 + 18;
      const w = line.length * size * 0.5;
      return <g key={k}>
        <rect x={-w / 2} y={ly - 2} width={w * under} height={16} rx={8} fill={C.lime} />
        <text x={0} y={ly} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={size} fill={C.ink}>{line}</text>
      </g>;
    })}
  </g>;
}
