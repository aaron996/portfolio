/* Cảnh kết chung của mọi phim case: các ô khớp vào logo 3×3; ba ô sáng là nhà của Chấm,
   Trùng, Lệch — chúng nhảy về nhà rồi hoá thành ô sáng (docs/companions.md). Cạnh logo là
   tên case. Dùng `useCurrentFrame` tương đối: đặt trong một <Sequence>. */

import { Easing, useCurrentFrame } from "remotion";
import { Buddy, BUDDY } from "./Buddy";
import { Stage } from "./Stage";
import { blink, C, fonts, mix, mixColor, pop, ramp } from "./paper";

export const END_FRAMES = 96;

const CELL = 66, STEP = 84, ORIGIN = { x: 250, y: 236 };
const LIT = [2, 4, 6];
const DARK = "#3a3a33", LIME = "#d4f236";
export const HOMES = [
  { cell: 2, color: BUDDY.dot, at: 16 },
  { cell: 4, color: BUDDY.dot, at: 22 }, // Trùng: chậm nửa nhịp.
  { cell: 6, color: BUDDY.outlier, at: 27, high: true },
];

const cellPos = (i: number) => ({ x: ORIGIN.x + (i % 3) * STEP, y: ORIGIN.y + Math.floor(i / 3) * STEP });

/** Tách tên case làm hai dòng gần bằng nhau theo từ. */
function split(title: string) {
  if (title.length <= 18) return [title, ""];
  const words = title.split(" ");
  let best = 1, diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (d < diff) { diff = d; best = i; }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

export function EndCard({ title, note }: { title: string; note: string }) {
  const e = useCurrentFrame();
  const [l1, l2] = split(title);
  const oneLine = !l2;
  const text = ramp(e, 34, 52, Easing.out(Easing.cubic));
  const sleep = ramp(e, 74, 82);

  return <Stage>
    {Array.from({ length: 9 }, (_, i) => {
      const p = cellPos(i);
      if (LIT.includes(i)) {
        return <rect key={i} x={p.x + 2} y={p.y + 2} width={CELL - 4} height={CELL - 4} rx={4} fill="none" stroke="#9b978a" strokeWidth={3} strokeDasharray="9 7" opacity={ramp(e, 0, 8)} />;
      }
      const s = e < i * 2 ? 0 : pop(e, i * 2, 240, 13);
      return <g key={i} transform={`translate(${p.x + CELL / 2} ${p.y + CELL / 2}) scale(${s})`}>
        <rect x={-CELL / 2} y={-CELL / 2} width={CELL} height={CELL} rx={4} fill={DARK} />
      </g>;
    })}
    {HOMES.map((h, n) => {
      if (e < h.at) return null;
      const p = cellPos(h.cell);
      const from = { x: 120 + n * 60, y: 800 };
      const t = ramp(e, h.at, h.at + 16, Easing.inOut(Easing.quad));
      const x = mix(from.x, p.x + CELL / 2, t), y = mix(from.y, p.y + CELL, t) - Math.sin(t * Math.PI) * (h.high ? 260 : 170);
      const landed = t >= 1;
      const lit = ramp(e, h.at + 17, h.at + 24);
      const squash = landed ? 0.5 * Math.sin(ramp(e, h.at + 16, h.at + 24) * Math.PI) : -0.2;
      return <Buddy key={h.cell} x={x} y={y} size={mix(40, CELL, t)} color={mixColor(h.color, LIME, lit)}
        squash={squash} rot={landed ? 0 : -300 * t} blink={Math.max(blink(e, 50, n * 9), sleep)} look={0} />;
    })}
    <g opacity={text} transform={`translate(0 ${(1 - text) * 24})`}>
      <text x={560} y={oneLine ? 350 : 318} fontFamily={fonts.sans} fontWeight={700} fontSize={oneLine ? 64 : 54} fill={C.ink}>{l1}</text>
      {!oneLine && <text x={560} y={382} fontFamily={fonts.sans} fontWeight={700} fontSize={54} fill={C.ink}>{l2}</text>}
      <text x={562} y={oneLine ? 400 : 432} fontFamily={fonts.mono} fontWeight={500} fontSize={21} fill={C.moss}>{note}</text>
    </g>
  </Stage>;
}
