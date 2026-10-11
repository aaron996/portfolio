/* Interdist — sáng hôm sau (docs/case-motion.md). Mở bằng màn hình app phủ kín khung (nối
   từ cú dí camera ở cảnh xưởng), lùi ra thấy đó là màn hình trên bàn sếp. Dữ liệu ngày mới
   đổ vào, cả bốn vùng đạt; sếp gối tay sau đầu cười, ba bạn đồng hành nhảy trên nóc màn
   hình, Vinh nhún nhảy. Cuối cảnh một tờ giấy trượt lên phủ khung để sang cảnh kết. */

import { Easing, useCurrentFrame } from "remotion";
import { Boss } from "../Boss";
import { Buddy, BUDDY } from "../Buddy";
import { Stage } from "../Stage";
import { Vinh } from "../Vinh";
import { blink, C, mix, pop, ramp } from "../paper";
import { APP, AppScreen, type AppState } from "./AppScreen";
import { Arms, BOSS, Desk, Door, Room, SHADOW } from "./InterdistOpener";
import { APP_LABELS, COUNTS } from "./Workshop";

export const MORNING_FRAMES = 180;

const SCREEN = { x: 396, y: 288, w: 240, h: 135 };
const BOSS_X = 780;
export const T = { grow: 24, lean: 40, buddies: 62, vinh: 70, think: 104, wipe: 142, end: MORNING_FRAMES };

function appState(m: number): AppState {
  const counts = COUNTS.map((n, b) => n + ramp(m, T.grow + b * 6, T.grow + b * 6 + 8, Easing.out(Easing.back(2))));
  return {
    counts, target: 3.5, checks: 1, price: 0.5, targetKnob: 0.42,
    history: m >= T.grow ? ["ok", "ok", "ok", "ok", "ok", "undone", "ok"] : ["ok", "ok", "ok", "ok", "ok", "undone"],
    playhead: m >= T.grow ? mix(4, 6, ramp(m, T.grow, T.grow + 8)) : 4,
    labels: APP_LABELS,
  };
}

function Monitor({ m }: { m: number }) {
  const { x, y, w, h } = SCREEN;
  return <g>
    <g filter={SHADOW}>
      <rect x={x + w / 2 - 12} y={y + h} width={24} height={36} fill="#3A3F48" />
      <ellipse cx={x + w / 2} cy={y + h + 40} rx={48} ry={9} fill="#3A3F48" />
      <rect x={x - 9} y={y - 9} width={w + 18} height={h + 18} rx={10} fill="#2B2F36" />
    </g>
    <rect x={x} y={y} width={w} height={h} fill={C.sheet} />
    <g transform={`translate(${x} ${y}) scale(${w / APP.w})`}><AppScreen state={appState(m)} /></g>
  </g>;
}

/* Ba bạn đồng hành ló lên nóc màn hình rồi nhún nhảy: Trùng chậm nửa nhịp, Lệch nhảy cao và
   đứng xa nhóm. */
function Buddies({ m }: { m: number }) {
  const top = SCREEN.y - 9;
  const cast = [
    { x: SCREEN.x + 36, color: BUDDY.dot, at: T.buddies, hop: 18, seed: 0 },
    { x: SCREEN.x + 72, color: BUDDY.dot, at: T.buddies + 5, hop: 18, seed: 5 },
    { x: SCREEN.x + SCREEN.w - 30, color: BUDDY.outlier, at: T.buddies + 9, hop: 34, seed: 2 },
  ];
  return <g>{cast.map((b, i) => {
    if (m < b.at) return null;
    const rise = Math.min(pop(m, b.at, 220, 12), 1.1);
    const phase = ((m - b.at - 10 - b.seed) % 18) / 18;
    const bounce = m > b.at + 10 ? Math.sin(phase * Math.PI) * b.hop : 0;
    const squash = m > b.at + 10 && phase < 0.12 ? 0.5 : 0;
    return <g key={i} clipPath={rise < 1 ? "url(#above)" : undefined}>
      <Buddy x={b.x} y={top + (1 - rise) * 34 - bounce} size={30} color={b.color} blink={blink(m, 60, i * 13)} look={i === 2 ? -0.5 : 0.3} squash={squash} />
    </g>;
  })}</g>;
}

function Sun({ m }: { m: number }) {
  return <polygon points="866,30 1010,30 958,400 814,400" fill={C.light} opacity={0.55 + 0.05 * Math.sin(m * 0.05)} />;
}

function Wipe({ m }: { m: number }) {
  const t = ramp(m, T.wipe, T.end - 4, Easing.inOut(Easing.cubic));
  if (t <= 0) return null;
  const y = mix(760, -60, t);
  return <g transform={`rotate(${-3 * (1 - t)} 640 ${y})`}>
    <rect x={-80} y={y + 6} width={1440} height={900} fill="#D9D2C0" />
    <rect x={-80} y={y} width={1440} height={900} fill={C.paper} />
  </g>;
}

export function Morning() {
  const m = useCurrentFrame();
  const out = ramp(m, 0, 44, Easing.inOut(Easing.cubic));
  const s = mix(1280 / SCREEN.w, 1, out);
  const cx = mix(SCREEN.x + SCREEN.w / 2, 640, out), cy = mix(SCREEN.y + SCREEN.h / 2, 360, out);
  const lean = ramp(m, T.lean, T.lean + 16, Easing.out(Easing.back(1.6)));
  const happy = m > T.lean + 4 ? 1 : 0;
  const vinHop = m > T.vinh && m < T.vinh + 36 ? Math.abs(Math.sin(((m - T.vinh) / 18) * Math.PI)) * 34 : 0;
  const push = ramp(m, T.think, T.think + 8, Easing.out(Easing.back(1.5))) * (1 - ramp(m, T.think + 20, T.think + 28));

  return <Stage>
    <defs><clipPath id="above"><rect x={0} y={0} width={1280} height={SCREEN.y - 9} /></clipPath></defs>
    <g transform={`translate(640 360) scale(${s}) translate(${-cx} ${-cy})`}>
      <Room f={0} calm />
      <Sun m={m} />
      <Door f={0} />
      <g transform={`rotate(${-5 * lean} ${BOSS_X} ${BOSS.y + 20})`}>
        {/* Tay vòng ra sau gáy: nửa đầu động tác vẽ trước thân, nửa sau vẽ sau đầu. */}
        {lean >= 0.6 && <Arms f={0} red={0} hold={lean} x={BOSS_X} />}
        <Boss x={BOSS_X} y={BOSS.y} pose={{ happy, look: -0.6, lookY: 0.2, lift: 4 * lean, blink: blink(m, 70, 20) }} filter={SHADOW} />
        {lean < 0.6 && <Arms f={0} red={0} hold={lean} x={BOSS_X} />}
      </g>
      <Desk f={m + 600} />
      <Buddies m={m} />
      <Monitor m={m} />
      <ellipse cx={1050} cy={652} rx={52} ry={9} fill="#3B2F1E" opacity={0.12 * (1 - vinHop / 60)} />
      <Vinh x={1050} y={650 - vinHop} pose={{
        look: -1, smile: 1, push, blink: blink(m, 80, 10),
        glint: ramp(m, T.think + 8, T.think + 18),
        hair: vinHop > 0 ? Math.cos(((m - T.vinh) / 18) * Math.PI * 2) * 5 : 0,
      }} filter={SHADOW} />
    </g>
    <Wipe m={m} />
  </Stage>;
}
