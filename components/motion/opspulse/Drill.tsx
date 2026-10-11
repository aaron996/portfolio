/* GHN Ops Pulse — đi sâu trong dashboard (docs/case-motion.md). Màn hình phủ kín khung (nối từ cú
   lao camera ở Hall). Con trỏ bấm: toàn quốc → Miền Nam → Vùng 3 → danh sách hub, một hub đỏ gắn
   nhãn "Cần ưu tiên" — chính hub đang dồn đơn ở cảnh 1. */

import { Easing, useCurrentFrame } from "remotion";
import { Stage } from "../Stage";
import { C, mix, ramp } from "../paper";
import { Dashboard, type DashState } from "./Dashboard";

export const DRILL_FRAMES = 210;
export const T = { click0: 24, click1: 76, click2: 128, tag: 166, hide: 176, end: DRILL_FRAMES };
const SPLIT = 32;

/* Tâm thẻ được bấm ở mỗi tầng (khớp bố cục trong Dashboard). */
const STOPS = [
  { at: 0, x: 1120, y: 760 },
  { at: T.click0 - 4, x: 640, y: 380 },
  { at: T.click1 - 4, x: 80 + 2 * (1040 / 3 + 40) + 1040 / 6, y: 388 },
  { at: T.click2 - 4, x: 350, y: 536 },
  { at: T.end, x: 640, y: 560 },
];

function cursorAt(d: number) {
  for (let i = 0; i < STOPS.length - 1; i++) {
    const a = STOPS[i], b = STOPS[i + 1];
    if (d <= b.at) {
      const t = ramp(d, i === 0 ? a.at : a.at + 18, b.at, Easing.inOut(Easing.cubic));
      return { x: mix(a.x, b.x, t), y: mix(a.y, b.y, t) };
    }
  }
  return STOPS[STOPS.length - 1];
}

export function drillState(d: number): DashState {
  if (d < T.click0) return { level: 0, t: 1 };
  if (d < T.click1) return { level: 1, t: ramp(d, T.click0, T.click0 + SPLIT) };
  if (d < T.click2) return { level: 2, t: ramp(d, T.click1, T.click1 + SPLIT) };
  return { level: 3, t: ramp(d, T.click2, T.click2 + SPLIT + 4), tag: ramp(d, T.tag, T.tag + 8, Easing.out(Easing.back(2.2))), pulse: d * 0.4 };
}

export function Drill() {
  const d = useCurrentFrame();
  const c = cursorAt(d);
  const clicks = [T.click0, T.click1, T.click2];
  const press = clicks.some(k => d >= k && d < k + 5) ? 0.82 : 1;
  const hide = 1 - ramp(d, T.hide, T.hide + 10);
  return <Stage bg={C.white}>
    <Dashboard state={drillState(d)} />
    {clicks.map(k => {
      const r = ramp(d, k, k + 14);
      if (r <= 0 || r >= 1) return null;
      const at = cursorAt(k);
      return <circle key={k} cx={at.x} cy={at.y} r={10 + r * 50} fill="none" stroke={C.moss} strokeWidth={5} opacity={1 - r} />;
    })}
    {hide > 0 && <g transform={`translate(${c.x} ${c.y}) scale(${press * 1.4})`} opacity={hide}>
      <path d="M0 0 L0 34 L9 26 L16 40 L22 37 L15 24 L27 24Z" fill={C.ink} stroke={C.white} strokeWidth={3} strokeLinejoin="round" />
    </g>}
  </Stage>;
}
