/* Rà soát COD — cảnh 2 (docs/case-motion.md). Vinh trồi lên, đẩy kính, phẩy tay dựng cỗ máy AI rồi
   kéo cần cho máy chạy. Dữ liệu cuộc gọi, hành trình, tin nhắn bay vào phễu; máy bắn ra từng đơn
   đã gắn nhãn nghi ngờ, đơn tự chen vào danh sách theo mức (cao lên đầu). Cuối cảnh danh sách phóng
   ra cả khung — thành màn hình GHN Ops Pulse của cảnh sau (khớp khung đầu của CodBoard). */

import type { ReactNode } from "react";
import { Easing, useCurrentFrame } from "remotion";
import { Stage } from "../Stage";
import { Vinh } from "../Vinh";
import { blink, C, fonts, mix, pop, ramp, wobble } from "../paper";
import { lines } from "./cast";
import { Box } from "./Doorstep";

export const AI_FRAMES = 300;
export const T = {
  vinh: 4, push: 16, body: 30, hopper: 36, gears: 40, eye: 48, lever: 54, chimney: 56, chip: 62,
  src: 72, reach: 90, pull: 100, run: 110, feed: 112, panel: 130, out: 140, glint: 250, grow: 270, end: AI_FRAMES,
};
const SHADOW = "url(#cut)";
const VINH = { x: 470, y: 690, s: 0.95 };
const BODY = { x: 560, y: 330, w: 280, h: 310 };
const EYE = { x: 700, y: 440 };
const MOUTH = { x: 700, y: 262 };
const PIVOT = { x: 562, y: 545 };
const LAUNCH = { x: 852, y: 490 };
export const PANEL = { x: 925, y: 96, w: 330, h: 424 };
const ROW = { x: 940, y: 140, w: 300, h: 60, step: 74 };
const SOURCES = [110, 260, 410].map(x => ({ x, y: 200 }));
const SOURCE_NAMES = [lines.calls, lines.route, lines.messages];

export const LEVEL_COLOR = [C.tie, "#E8B84A", C.moss];
export const LEVEL_INK = [C.white, C.ink, C.white];
export const LEVELS = [lines.high, lines.mid, lines.low];

/** Dữ liệu bay vào phễu: nguồn k, khung bay. */
export const FEEDS = Array.from({ length: 9 }, (_, n) => ({ k: n % 3, at: T.feed + n * 7 }));
const FEED_DUR = 22;
/** Đơn máy bắn ra theo thứ tự này; danh sách tự xếp mức cao lên đầu. */
const OUT_LEVELS = [1, 0, 2, 0, 1];
const OUT_DUR = 22;
export const OUTS = OUT_LEVELS.map((level, j) => ({ level, at: T.out + j * 22, land: T.out + j * 22 + OUT_DUR }));
const before = (i: number, j: number) => OUT_LEVELS[i] < OUT_LEVELS[j] || (OUT_LEVELS[i] === OUT_LEVELS[j] && i < j);

/** Chỗ của đơn j trong danh sách lúc f: mỗi đơn xếp trên nó đã vào thì đẩy nó xuống một hàng. */
function rowY(j: number, f: number) {
  let n = 0;
  OUTS.forEach((o, i) => { if (i !== j && before(i, j)) n += ramp(f, o.land - 8, o.land + 2, Easing.inOut(Easing.cubic)); });
  return ROW.y + n * ROW.step;
}

function leverAngle(f: number) {
  return mix(-125, -205, ramp(f, T.pull, T.pull + 9, Easing.in(Easing.quad))) + (f > T.pull + 9 && f < T.pull + 16 ? wobble(f, 4, 2.6) : 0);
}

function knob(f: number) {
  const a = (leverAngle(f) * Math.PI) / 180;
  return { x: PIVOT.x + 56 * Math.cos(a), y: PIVOT.y + 56 * Math.sin(a) };
}

function Gear({ x, y, r, rot, fill }: { x: number; y: number; r: number; rot: number; fill: string }) {
  const teeth = Math.round(r / 4);
  return <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {Array.from({ length: teeth }, (_, k) =>
      <rect key={k} x={-r * 0.13} y={-r - r * 0.2} width={r * 0.26} height={r * 0.4} rx={2} fill={fill} transform={`rotate(${(k * 360) / teeth})`} />)}
    <circle r={r} fill={fill} />
    <circle r={r * 0.34} fill={C.paper} />
  </g>;
}

/** Biểu tượng nguồn dữ liệu, vẽ quanh gốc trong ô ~70px. 0 cuộc gọi · 1 hành trình · 2 tin nhắn. */
export function SourceIcon({ k }: { k: number }) {
  if (k === 0) return <g>
    <rect x={-22} y={-28} width={30} height={54} rx={7} fill={C.ink} />
    <rect x={-18} y={-22} width={22} height={36} rx={3} fill={C.lime} />
    <circle cx={-7} cy={20} r={2.6} fill="#56627E" />
    <path d="M16 -12 Q24 0 16 12 M24 -19 Q36 0 24 19" stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
  </g>;
  if (k === 1) return <g>
    <path d="M-28 24 Q-4 26 -8 6 Q-12 -12 12 -12" stroke={C.grey} strokeWidth={4} strokeDasharray="7 6" fill="none" strokeLinecap="round" />
    <circle cx={-28} cy={24} r={6} fill={C.moss} />
    <path d="M14 8 C4 -4 -2 -10 -2 -18 A16 16 0 1 1 30 -18 C30 -10 24 -4 14 8Z" fill={C.tie} />
    <circle cx={14} cy={-18} r={6} fill={C.white} />
  </g>;
  return <g>
    <path d="M-30 -24 H30 Q36 -24 36 -18 V8 Q36 14 30 14 H-2 L-16 28 L-13 14 H-30 Q-36 14 -36 8 V-18 Q-36 -24 -30 -24Z" fill={C.moss} />
    <rect x={-24} y={-13} width={44} height={6} rx={3} fill={C.white} />
    <rect x={-24} y={0} width={30} height={6} rx={3} fill={C.white} />
  </g>;
}

/** Một đơn trong danh sách: hộp hàng, mã đơn (vạch xám), nhãn mức nghi ngờ. Gốc ở góc trên-trái. */
export function OrderRow({ level, tag }: { level: number; tag: number }) {
  return <g>
    <rect x={0} y={0} width={ROW.w} height={ROW.h} rx={12} fill={tag > 0.5 && level === 0 ? "#FBEDE8" : C.white}
      stroke={tag > 0.5 && level === 0 ? C.tie : C.grid} strokeWidth={tag > 0.5 && level === 0 ? 3 : 2} />
    <Box x={34} y={30} s={0.42} />
    <rect x={64} y={18} width={84} height={9} rx={4.5} fill={C.grid} />
    <rect x={64} y={34} width={56} height={7} rx={3.5} fill="#EFEBE2" />
    {tag > 0.01 && <g transform={`translate(226 30) scale(${tag})`}>
      <rect x={-68} y={-17} width={136} height={34} rx={17} fill={LEVEL_COLOR[level]} />
      <text x={0} y={6} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={16} fill={LEVEL_INK[level]}>{LEVELS[level]}</text>
    </g>}
  </g>;
}

function Sources({ f }: { f: number }) {
  return <g>{SOURCES.map((p, k) => {
    const s = f < T.src + k * 6 ? 0 : Math.min(pop(f, T.src + k * 6, 220, 12), 1.05);
    if (s <= 0.01) return null;
    const sending = FEEDS.some(d => d.k === k && f >= d.at && f < d.at + 5);
    return <g key={k} transform={`translate(${p.x} ${p.y}) scale(${s * (sending ? 1.06 : 1)})`}>
      <rect x={-52} y={-52} width={104} height={104} rx={18} fill={C.white} filter={SHADOW} />
      <SourceIcon k={k} />
      <text x={0} y={84} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={20} fill={C.ink}>{SOURCE_NAMES[k]}</text>
    </g>;
  })}</g>;
}

function Feeds({ f }: { f: number }) {
  return <g>{FEEDS.map((d, n) => {
    const t = ramp(f, d.at, d.at + FEED_DUR, Easing.inOut(Easing.quad));
    if (t <= 0 || t >= 1) return null;
    const from = SOURCES[d.k];
    const x = mix(from.x, MOUTH.x, t), y = mix(from.y, MOUTH.y + 20, t) - Math.sin(t * Math.PI) * 120;
    return <g key={n} transform={`translate(${x} ${y}) rotate(${t * 120 * (d.k === 0 ? -1 : 1)}) scale(${mix(0.62, 0.36, t)})`} filter={SHADOW}>
      <SourceIcon k={d.k} />
    </g>;
  })}</g>;
}

function Machine({ f }: { f: number }) {
  const at = (a: number) => (f < a ? 0 : Math.min(pop(f, a, 200, 11), 1.06));
  const body = at(T.body), hopper = at(T.hopper), g1 = at(T.gears), g2 = at(T.gears + 4), eye = at(T.eye), lever = at(T.lever), chimney = at(T.chimney);
  if (body <= 0.01) return null;
  const running = f >= T.run;
  const shake = running && f < T.grow ? wobble(f, 1.3, 2.4) : 0;
  const spin = running ? (f - T.run) * 7 : 0;
  const gulp = FEEDS.some(d => f >= d.at + FEED_DUR - 2 && f < d.at + FEED_DUR + 4);
  const fire = OUTS.some(o => f >= o.at - 2 && f < o.at + 4);
  const ring = running ? 8 + Math.sin(f * 0.45) * 5 : 0;
  const bx = BODY.x + BODY.w / 2, by = BODY.y + BODY.h;
  return <g transform={`translate(${shake} 0)`}>
    {/* Bánh răng nằm sau thân máy, chỉ lộ nửa ngoài. */}
    {g1 > 0.01 && <g transform={`translate(${BODY.x + BODY.w} 386) scale(${g1}) translate(${-BODY.x - BODY.w} -386)`}>
      <Gear x={BODY.x + BODY.w - 2} y={386} r={38} rot={spin} fill="#56627E" />
    </g>}
    {g2 > 0.01 && <g transform={`translate(${BODY.x + BODY.w} 590) scale(${g2}) translate(${-BODY.x - BODY.w} -590)`}>
      <Gear x={BODY.x + BODY.w + 4} y={590} r={26} rot={-spin * 1.45} fill="#8A93A6" />
    </g>}
    {chimney > 0.01 && <g transform={`translate(806 ${BODY.y}) scale(${chimney}) translate(-806 ${-BODY.y})`}>
      <rect x={792} y={BODY.y - 46} width={28} height={50} rx={4} fill={C.navyDeep} />
      <rect x={786} y={BODY.y - 54} width={40} height={12} rx={4} fill="#56627E" />
    </g>}
    {running && f < T.grow + 10 && Array.from({ length: 4 }, (_, p) => {
      const ph = (((f - T.run + p * 11) % 44) + 44) % 44 / 44;
      return <circle key={p} cx={806 + Math.sin(ph * 5 + p) * 6} cy={BODY.y - 60 - ph * 90} r={9 + ph * 16} fill="#DCD5C5" opacity={(1 - ph) * 0.85} />;
    })}
    {hopper > 0.01 && <g transform={`translate(${MOUTH.x} ${BODY.y}) scale(${hopper}) translate(${-MOUTH.x} ${-BODY.y})`} filter={SHADOW}>
      <path d={`M615 258 L785 258 L735 ${BODY.y + 4} L665 ${BODY.y + 4}Z`} fill={C.navyDeep} />
      <rect x={608} y={250} width={184} height={16} rx={8} fill={gulp ? C.lime : "#56627E"} />
    </g>}
    <g transform={`translate(${bx} ${by}) scale(${body}) translate(${-bx} ${-by})`}>
      <g filter={SHADOW}>
        <rect x={BODY.x} y={BODY.y} width={BODY.w} height={BODY.h} rx={26} fill={C.navy} />
        <rect x={BODY.x + 22} y={by - 6} width={44} height={16} rx={5} fill={C.navyDeep} />
        <rect x={BODY.x + BODY.w - 66} y={by - 6} width={44} height={16} rx={5} fill={C.navyDeep} />
      </g>
      <rect x={BODY.x + 18} y={BODY.y + 18} width={BODY.w - 36} height={BODY.h - 36} rx={18} fill={C.navyDeep} opacity={0.45} />
      {/* Khe bắn đơn bên phải. */}
      <rect x={BODY.x + BODY.w - 10} y={LAUNCH.y - 26} width={20} height={52} rx={6} fill={fire ? C.lime : "#1A2236"} />
      {Array.from({ length: 5 }, (_, i) => {
        const lit = running && f < T.grow && Math.floor(f / 4) % 5 === i;
        return <circle key={i} cx={640 + i * 30} cy={584} r={8} fill={lit ? C.lime : "#56627E"} />;
      })}
    </g>
    {eye > 0.01 && <g transform={`translate(${EYE.x} ${EYE.y}) scale(${eye})`}>
      {running && <circle r={62 + ring} fill="none" stroke={C.lime} strokeWidth={4} opacity={0.55} />}
      <circle r={62} fill="#1A2236" />
      <circle r={52} fill={C.lime} />
      <text x={0} y={16} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={46} fill={C.ink}>{lines.ai}</text>
    </g>}
    {lever > 0.01 && <g transform={`translate(${PIVOT.x} ${PIVOT.y}) scale(${lever}) rotate(${leverAngle(f)})`}>
      <rect x={0} y={-5} width={56} height={10} rx={5} fill="#B9C0CC" />
      <circle cx={56} cy={0} r={12} fill={C.tie} />
    </g>}
    {lever > 0.01 && <circle cx={PIVOT.x} cy={PIVOT.y} r={10 * lever} fill={C.navyDeep} />}
  </g>;
}

function Outs({ f, landed }: { f: number; landed: boolean }) {
  return <g>{OUTS.map((o, j) => {
    if (f < o.at) return null;
    const isLanded = f >= o.land;
    if (isLanded !== landed) return null;
    const tag = f < o.land ? 0 : Math.min(pop(f, o.land, 240, 11), 1.08);
    if (isLanded) return <g key={j} transform={`translate(${ROW.x} ${rowY(j, f)})`} filter={SHADOW}><OrderRow level={o.level} tag={tag} /></g>;
    const t = ramp(f, o.at, o.land, Easing.out(Easing.quad));
    const cx = mix(LAUNCH.x, ROW.x + ROW.w / 2, t), cy = mix(LAUNCH.y, rowY(j, o.land) + ROW.h / 2, t) - Math.sin(t * Math.PI) * 110;
    return <g key={j} transform={`translate(${cx} ${cy}) rotate(${(1 - t) * -18}) scale(${mix(0.3, 1, t)}) translate(${-ROW.w / 2} ${-ROW.h / 2})`} filter={SHADOW}>
      <OrderRow level={o.level} tag={0} />
    </g>;
  })}</g>;
}

/** Bảng danh sách; lúc `grow` phóng ra cả khung, thành khung app của cảnh sau. */
function Panel({ f, children }: { f: number; children: ReactNode }) {
  const s = f < T.panel ? 0 : Math.min(pop(f, T.panel, 200, 12), 1.04);
  if (s <= 0.01) return null;
  const g = ramp(f, T.grow, T.end - 2, Easing.inOut(Easing.cubic));
  const x = mix(PANEL.x, 0, g), y = mix(PANEL.y, 0, g), w = mix(PANEL.w, 1280, g), h = mix(PANEL.h, 720, g);
  const rx = mix(18, 0, g), strip = mix(32, 78, g);
  const cx = PANEL.x + PANEL.w / 2, cy = PANEL.y + PANEL.h / 2;
  return <g transform={`translate(${cx} ${cy}) scale(${g > 0 ? 1 : s}) translate(${-cx} ${-cy})`}>
    <rect x={x} y={y} width={w} height={h} rx={rx} fill={C.white} stroke={C.grid} strokeWidth={2} strokeOpacity={1 - g} filter={g < 1 ? SHADOW : undefined} />
    <path d={`M${x} ${y + strip} V${y + rx} Q${x} ${y} ${x + rx} ${y} H${x + w - rx} Q${x + w} ${y} ${x + w} ${y + rx} V${y + strip}Z`} fill={C.paper} />
    {[0, 1, 2].map(i => <circle key={i} cx={mix(PANEL.x + 20 + i * 16, 34 + i * 24, g)} cy={mix(PANEL.y + 16, 39, g)} r={mix(5, 8, g)}
      fill={[C.tie, "#E8B84A", C.moss][i]} />)}
    <g opacity={1 - ramp(g, 0, 0.3)}>{children}</g>
  </g>;
}

function vinhPose(f: number) {
  const point = ramp(f, T.body - 8, T.body + 2, Easing.out(Easing.back(1.4))) * (1 - ramp(f, T.chip - 2, T.chip + 8));
  const grab = ramp(f, T.reach, T.pull - 2, Easing.inOut(Easing.quad)) * (1 - ramp(f, T.run + 12, T.run + 22));
  const k = knob(f);
  const lever = { x: (k.x - VINH.x) / VINH.s, y: (k.y - VINH.y) / VINH.s };
  const rest = { x: 50, y: -64 };
  let handR: { x: number; y: number } | undefined;
  if (point > 0.01) handR = { x: mix(rest.x, 86, point), y: mix(rest.y, -206, point) };
  else if (grab > 0.01) handR = { x: mix(rest.x, lever.x, grab), y: mix(rest.y, lever.y, grab) };
  const think = (a: number) => ramp(f, a, a + 8, Easing.out(Easing.back(1.5))) * (1 - ramp(f, a + 16, a + 24));
  const nod = f > OUTS[4].land && f < OUTS[4].land + 16 ? Math.sin(((f - OUTS[4].land) / 16) * Math.PI * 2) * 4 : 0;
  return {
    handR, push: Math.max(think(T.push), think(T.glint)),
    glint: f < T.glint ? ramp(f, T.push + 6, T.push + 16) : ramp(f, T.glint + 6, T.glint + 16),
    look: f < T.src || f > T.out ? 1 : -0.5, smile: f > T.run ? 0.9 : 0.6, blink: blink(f, 84, 30), tilt: nod,
    hair: f > T.vinh && f < T.vinh + 20 ? -6 * Math.sin((f - T.vinh) * 0.6) * Math.exp(-(f - T.vinh) / 6) : 0,
  };
}

export function AiEngine() {
  const f = useCurrentFrame();
  const floor = mix(720, 600, ramp(f, 0, 14, Easing.out(Easing.cubic)));
  const vin = f < T.vinh ? 0 : pop(f, T.vinh, 170, 12);
  const chip = f < T.chip ? 0 : Math.min(pop(f, T.chip, 200, 12), 1);
  return <Stage>
    <rect x={0} y={floor} width={1280} height={720} fill={C.floor} />
    <rect x={0} y={floor - 4} width={1280} height={6} fill={C.floorLine} />
    <Sources f={f} />
    <Feeds f={f} />
    <Machine f={f} />
    {chip > 0 && <g transform={`translate(640 70) scale(${chip})`} filter={SHADOW}>
      <rect x={-196} y={-28} width={392} height={56} rx={28} fill={C.white} />
      <text x={0} y={9} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={26} fill={C.ink}>{lines.aiScore}</text>
    </g>}
    <ellipse cx={VINH.x} cy={VINH.y + 2} rx={50} ry={9} fill="#3B2F1E" opacity={0.12 * Math.min(vin, 1)} />
    <g transform={`translate(0 ${(1 - Math.min(vin, 1)) * 420})`}>
      <Vinh x={VINH.x} y={VINH.y} scale={VINH.s} pose={vinhPose(f)} filter={SHADOW} />
    </g>
    <Panel f={f}><Outs f={f} landed /></Panel>
    <Outs f={f} landed={false} />
  </Stage>;
}
