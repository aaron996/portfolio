/* GHN Ops Pulse — ba cảnh đầu trong một dải phòng dài, camera lia ngang (docs/case-motion.md):
   1. Con số toàn quốc ghép bằng ô; ba người vỗ tay. Camera zoom một mạch vào một ô → ô tách
      thành ô nhỏ, một ô đỏ → đó là một hub đang dồn đơn trễ. Lùi ra: mọi người vẫn cười.
   2. Lia sang bàn làm việc lúc 7:00: chụp · cắt · dán từng bảng vào nhóm chat, ngày càng gấp.
   3. Lia sang phòng họp: ba người cầm ba con số khác nhau. Vinh bước vào, ba tờ giấy bay vào
      một màn hình chung; camera lao vào màn hình (nối sang cảnh Drill). */

import { Easing, useCurrentFrame } from "remotion";
import { Clock } from "../Clock";
import { glyphCols, glyphTiles } from "../Glyphs";
import { Person } from "../Person";
import { Speech } from "../Speech";
import { Stage } from "../Stage";
import { Vinh } from "../Vinh";
import { Warehouse } from "../Warehouse";
import { blink, C, camera, fonts, mix, pop, ramp, wobble } from "../paper";
import { Dashboard, type DashState } from "./Dashboard";
import { LEAD, lines, MANAGER, OPS } from "./cast";

export const HALL_FRAMES = 582;
export const T = {
  tiles: 4, cheer: 44, chips: 50, zoom: 108, hub: 176, back: 206, pan1: 222,
  shot: 258, pan2: 382, argue: 412, vinh: 428, stop: 460, push: 466, fly: 488, on: 514, dive: 552, end: HALL_FRAMES,
};
const SHADOW = "url(#cut)";

/* ── Cảnh 1: con số ghép ô ── */
const STEP = 32, TILE = 28;
const NUMBER = lines.nationalValue;
const N0 = { x: 640 - (glyphCols(NUMBER) * STEP - 4) / 2, y: 108 };
const TILES = glyphTiles(NUMBER, N0.x, N0.y, STEP);
const TARGET = TILES.find(t => t.char === 1 && t.row === 5 && t.col === 0) ?? TILES[Math.floor(TILES.length / 2)];
const SUB = 8, SUB_STEP = 10;
const RED_SUB = { col: 2, row: 1 };
const HUB = { x: TARGET.x + RED_SUB.col * SUB_STEP, y: TARGET.y + RED_SUB.row * SUB_STEP };
const FOCUS = { x: HUB.x + SUB / 2, y: HUB.y + SUB / 2 };
const S_MAX = 72;
const seeded = (n: number) => { const v = Math.sin(n * 127.1) * 43758.5; return v - Math.floor(v); };

/* ── Cảnh 2, 3: vị trí trong dải phòng ── */
const SEG2 = 1280;
export const SEG3 = 2560;
export const SCREEN = { x: SEG3 + 360, y: 82, w: 560, h: 315 };
export const SCREEN_C = { x: SCREEN.x + SCREEN.w / 2, y: SCREEN.y + SCREEN.h / 2 };
const SHOTS = [258, 298, 328, 350, 356, 362, 368, 374, 380];
const SLOW = 3;
const MONITOR = { x: SEG2 + 610, y: 352, w: 240, h: 140 };
const CHAT = { x: SEG2 + 960, y: 150, w: 250, h: 330 };
export const TRIO = [SEG3 + 340, SEG3 + 500, SEG3 + 660];
const PAPERS = [lines.paperA, lines.paperB, lines.paperC];

function cameraAt(f: number) {
  if (f < T.pan1) {
    const zin = ramp(f, T.zoom, T.hub, Easing.inOut(Easing.cubic));
    const zout = ramp(f, T.back, T.pan1, Easing.in(Easing.cubic));
    const z = zin * (1 - zout);
    const s = Math.exp(Math.log(S_MAX) * z);
    const v = Math.min(1, z * 1.6);
    const sx = mix(FOCUS.x, 640, v), sy = mix(FOCUS.y, 400, v);
    return { t: camera(FOCUS.x - (sx - 640) / s, FOCUS.y - (sy - 360) / s, s), s };
  }
  if (f < T.dive) {
    const x = f < T.pan2 ? mix(640, SEG2 + 640, ramp(f, T.pan1, T.pan1 + 30, Easing.inOut(Easing.cubic)))
      : mix(SEG2 + 640, SEG3 + 640, ramp(f, T.pan2, T.pan2 + 30, Easing.inOut(Easing.cubic)));
    return { t: camera(x, 360, 1), s: 1 };
  }
  const d = ramp(f, T.dive, T.end, Easing.inOut(Easing.cubic));
  const s = mix(1, 1280 / SCREEN.w, d);
  return { t: camera(SEG3 + 640, mix(360, SCREEN_C.y, d), s), s };
}

function Floor() {
  return <g>
    <rect x={-400} y={0} width={4640} height={720} fill={C.paper} />
    <rect x={-400} y={600} width={4640} height={400} fill={C.floor} />
    <rect x={-400} y={596} width={4640} height={6} fill={C.floorLine} />
  </g>;
}

export function Chip({ x, y, text, s, color = C.ink, bg = C.white }: { x: number; y: number; text: string; s: number; color?: string; bg?: string }) {
  if (s <= 0.01) return null;
  const w = text.length * 12 + 34;
  return <g transform={`translate(${x} ${y}) scale(${s})`} filter={SHADOW}>
    <rect x={-w / 2} y={-20} width={w} height={40} rx={20} fill={bg} />
    <text x={0} y={7} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={20} fill={color}>{text}</text>
  </g>;
}

function NumberWall({ f, s }: { f: number; s: number }) {
  const subs = ramp(s, 2.2, 4.5);
  const detail = ramp(s, 9, 18);
  const parcels = 2 + ramp(f, T.hub - 30, T.hub + 24) * 6;
  return <g>
    <Chip x={640} y={70} text={lines.national} s={(f < T.tiles + 30 ? 0 : pop(f, T.tiles + 30, 200, 13)) * (1 - ramp(f, T.zoom, T.zoom + 12))} />
    {TILES.map((t, i) => {
      const at = T.tiles + i * 0.55;
      const p = f < at ? 0 : Math.min(pop(f, at, 170, 13), 1.08);
      if (p <= 0) return null;
      const fx = 640 + (seeded(i) - 0.5) * 1100, fy = -60 - seeded(i + 50) * 300;
      const x = mix(fx, t.x, p), y = mix(fy, t.y, p);
      const isTarget = t === TARGET;
      return <g key={i} transform={`rotate(${(1 - Math.min(p, 1)) * (seeded(i + 9) - 0.5) * 120} ${x + TILE / 2} ${y + TILE / 2})`}>
        <rect x={x} y={y} width={TILE} height={TILE} rx={2} fill="#3a3a33" />
        {isTarget && subs > 0 && <g opacity={subs}>
          <rect x={x} y={y} width={TILE} height={TILE} fill={C.paper} />
          {Array.from({ length: 9 }, (_, k) => {
            const col = k % 3, row = Math.floor(k / 3), red = col === RED_SUB.col && row === RED_SUB.row;
            return <rect key={k} x={x + col * SUB_STEP} y={y + row * SUB_STEP} width={SUB} height={SUB} rx={0.6} fill={red ? C.tie : "#3a3a33"} />;
          })}
          {detail > 0 && <g opacity={detail}>
            <rect x={HUB.x} y={HUB.y} width={SUB} height={SUB} fill={C.paper} />
            <Warehouse x={HUB.x} y={HUB.y - 0.4} size={SUB} parcels={parcels} alarm={0.5 + 0.5 * Math.sin(f * 0.5)} face={{ worry: true, look: -0.3, blink: blink(f, 50) }} />
          </g>}
        </g>}
      </g>;
    })}
  </g>;
}

function cheerPose(f: number, i: number) {
  const up = (f < T.cheer + i * 3 ? 0 : Math.min(pop(f, T.cheer + i * 3, 180, 10), 1.1)) * (1 - ramp(f, T.cheer + 40, T.cheer + 56));
  const hop = up > 0.3 ? Math.abs(Math.sin((f - T.cheer) * 0.35 + i)) * 10 * up : 0;
  return {
    handL: { x: mix(-52, -40, up), y: mix(-62, -268, up) }, handR: { x: mix(52, 40, up), y: mix(-62, -268, up) },
    armsFront: false, lift: hop, mouth: (up > 0.3 ? "grin" : "smile") as "grin" | "smile", blink: blink(f, 80, i * 17),
  };
}

function Trio1({ f }: { f: number }) {
  const looks = [OPS, MANAGER, LEAD], roles = [lines.roleOps, lines.roleManager, lines.roleLead];
  return <g>{looks.map((look, i) => {
    const x = 450 + i * 190;
    const chip = (f < T.chips + i * 5 ? 0 : pop(f, T.chips + i * 5, 220, 12)) * (1 - ramp(f, T.zoom - 6, T.zoom + 4));
    return <g key={i}>
      <ellipse cx={x} cy={692} rx={50} ry={9} fill="#3B2F1E" opacity={0.1} />
      <Person x={x} y={690} scale={0.95} look={look} pose={cheerPose(f, i)} filter={SHADOW} />
      <Chip x={x} y={392} text={roles[i]} s={chip} />
    </g>;
  })}</g>;
}

/* ── Cảnh 2 ── */
function shotState(f: number, k: number) {
  const at = SHOTS[k], slow = k < SLOW, dur = slow ? SHOTS[k + 1] - at : 8;
  const fly0 = slow ? at + dur * 0.55 : at + 1, fly1 = slow ? at + dur * 0.9 : at + 7;
  return { at, slow, dur, fly0, fly1, cut: slow ? at + dur * 0.28 : -1 };
}

function Desk({ f }: { f: number }) {
  const shotsDone = SHOTS.filter(at => f >= at).length;
  const flash = SHOTS.some(at => f >= at && f < at + 3);
  const cups = [272, 322, 352].filter(at => f >= at).length;
  return <g>
    <Clock x={SEG2 + 200} y={150} r={54} minute={0} hour={210} filter={SHADOW} />
    <g filter={SHADOW}>
      <rect x={MONITOR.x - 10} y={MONITOR.y - 10} width={MONITOR.w + 20} height={MONITOR.h + 20} rx={10} fill="#2B2F36" />
      <rect x={MONITOR.x + MONITOR.w / 2 - 12} y={MONITOR.y + MONITOR.h + 10} width={24} height={22} fill="#3A3F48" />
      <ellipse cx={MONITOR.x + MONITOR.w / 2} cy={522} rx={46} ry={8} fill="#3A3F48" />
    </g>
    <g transform={`translate(${MONITOR.x} ${MONITOR.y}) scale(${MONITOR.w / 1280})`}>
      <Dashboard state={{ level: 3, t: 1, variant: shotsDone + 1, pulse: f * 0.4 }} />
    </g>
    {flash && <rect x={MONITOR.x} y={MONITOR.y} width={MONITOR.w} height={MONITOR.h} fill={C.white} opacity={0.85} />}
    <Chip x={MONITOR.x + MONITOR.w / 2} y={MONITOR.y - 34} text={`${Math.max(1, shotsDone)}/${lines.tables}`} s={f < T.shot ? 0 : Math.min(pop(f, T.shot, 220, 12), 1)} />
    {Array.from({ length: cups }, (_, i) => <g key={i} transform={`translate(${SEG2 + 360 + i * 46} 486)`} filter={SHADOW}>
      <rect x={0} y={0} width={32} height={34} rx={6} fill={[C.lime, C.white, "#E8B84A"][i]} />
      <path d="M32 8 Q44 10 42 20 Q40 28 32 26" fill="none" stroke={[C.lime, C.white, "#E8B84A"][i]} strokeWidth={5} />
    </g>)}
    <rect x={SEG2 + 880} y={508} width={58} height={12} rx={4} fill="#2B2F36" />
  </g>;
}

/** Mặt bàn và thân bàn vẽ sau người: người đứng sau bàn, chân khuất. */
function DeskFront() {
  return <g filter={SHADOW}>
    <rect x={SEG2 + 300} y={520} width={700} height={22} rx={6} fill={C.wood} />
    <rect x={SEG2 + 320} y={542} width={660} height={190} fill={C.woodDeep} />
  </g>;
}

export function Chat({ f, x, y, w, h, title, items, note }: {
  f: number; x: number; y: number; w: number; h: number; title: string;
  /** Khung mỗi ảnh tới nơi (đã sắp theo thời gian). */
  items: number[]; note?: number;
}) {
  const open = f < items[0] - 14 ? 0 : Math.min(pop(f, items[0] - 14, 200, 13), 1);
  if (open <= 0.01) return null;
  const arrived = items.filter(at => f >= at).length;
  const thumbs = Math.min(arrived, 9);
  return <g transform={`translate(${x + w / 2} ${y + h}) scale(${open}) translate(${-(x + w / 2)} ${-(y + h)})`} filter={SHADOW}>
    <rect x={x} y={y} width={w} height={h} rx={22} fill="#2B2F36" />
    <rect x={x + 10} y={y + 10} width={w - 20} height={h - 20} rx={14} fill={C.sheet} />
    <rect x={x + 10} y={y + 10} width={w - 20} height={42} rx={14} fill={C.moss} />
    <text x={x + w / 2} y={y + 38} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={17} fill={C.white}>{title}</text>
    {Array.from({ length: thumbs }, (_, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const s = Math.min(pop(f, items[i], 260, 12), 1.1);
      const tx = x + 22 + col * ((w - 44) / 3), ty = y + 64 + row * 56;
      return <g key={i} transform={`translate(${tx + 32} ${ty + 24}) scale(${s}) translate(${-(tx + 32)} ${-(ty + 24)})`}>
        <rect x={tx} y={ty} width={(w - 44) / 3 - 8} height={46} rx={6} fill={C.white} stroke={C.grid} strokeWidth={2} />
        {[0, 1, 2].map(b => <rect key={b} x={tx + 8 + b * 20} y={ty + 34 - 8 - seeded(i * 3 + b) * 18} width={12} height={8 + seeded(i * 3 + b) * 18} rx={2} fill={i % 4 === 2 && b === 1 ? C.tie : C.moss} />)}
      </g>;
    })}
    {note !== undefined && f >= note && <g transform={`translate(${x + w / 2} ${y + 252}) scale(${Math.min(pop(f, note, 220, 12), 1)}) translate(${-(x + w / 2)} ${-(y + 252)})`}>
      <rect x={x + 22} y={y + 236} width={w - 44} height={h - 256} rx={10} fill={C.white} stroke={C.moss} strokeWidth={3} />
      <text x={x + 36} y={y + 262} fontFamily={fonts.sans} fontWeight={700} fontSize={15} fill={C.moss}>{lines.note}</text>
      {[0, 1, 2].map(l => <rect key={l} x={x + 36} y={y + 276 + l * 14} width={(w - 80) * (l === 2 ? 0.6 : 1)} height={6} rx={3} fill={C.grid} />)}
    </g>}
  </g>;
}

function FlyingShots({ f }: { f: number }) {
  return <g>{SHOTS.map((_, k) => {
    const st = shotState(f, k);
    if (f < st.at + 1 || f >= st.fly1) return null;
    const card = { x: MONITOR.x + MONITOR.w / 2, y: MONITOR.y + MONITOR.h / 2 };
    const fly = ramp(f, st.fly0, st.fly1, Easing.inOut(Easing.quad));
    const toX = CHAT.x + 40 + (k % 3) * 70, toY = CHAT.y + 90 + Math.floor(k / 3) * 56;
    const x = mix(card.x, toX, fly), y = mix(card.y - (st.slow ? 30 : 0), toY, fly) - Math.sin(fly * Math.PI) * 60;
    const grow = Math.min(pop(f, st.at + 1, 240, 12), 1);
    const sz = mix(1, 0.4, fly) * grow;
    const snip = st.slow && f >= st.cut && f < st.cut + 10;
    return <g key={k} transform={`translate(${x} ${y}) rotate(${fly * 12 - 4}) scale(${sz})`}>
      <rect x={-70} y={-44} width={140} height={88} rx={6} fill={C.white} stroke={C.grid} strokeWidth={3} filter={SHADOW} />
      {[0, 1, 2, 3].map(b => <rect key={b} x={-50 + b * 26} y={20 - 10 - seeded(k * 4 + b) * 34} width={16} height={10 + seeded(k * 4 + b) * 34} rx={2} fill={C.moss} />)}
      {snip && <g transform={`translate(70 -44) rotate(${wobble(f, 25, 2.4)})`}>
        <path d="M0 0 L-26 -10 L-24 -4Z" fill={C.ink} />
        <path d="M0 0 L-26 10 L-24 4Z" fill={C.ink} />
        <circle cx={6} cy={-6} r={6} fill="none" stroke={C.tie} strokeWidth={3} />
        <circle cx={6} cy={6} r={6} fill="none" stroke={C.tie} strokeWidth={3} />
      </g>}
    </g>;
  })}</g>;
}

function OpsAtDesk({ f }: { f: number }) {
  const sleepy = ramp(f, T.shot + 40, T.pan2, Easing.in(Easing.quad)) * 0.9;
  const type = Math.sin(f * 0.9) * 4;
  return <Person x={SEG2 + 470} y={650} look={OPS} pose={{
    handL: { x: 26, y: -140 + type }, handR: { x: 88, y: -144 - type }, armsFront: true,
    look: 1, sleepy, mouth: sleepy > 0.5 ? "flat" : "smile", tilt: sleepy * 8, blink: blink(f, 70, 5),
  }} filter={SHADOW} />;
}

/* ── Cảnh 3 ── */
/** Phòng họp (dùng lại ở cảnh báo cáo buổi sáng). `screen` = nội dung màn hình, `on` 0..1 độ sáng
 *  màn hình, `sky` màu trời qua cửa sổ, `night` 0..1 phủ tối, đồng hồ theo độ. */
export function MeetingRoom({ screen, on, sky = "#CFE0DA", moon = 0, minute = 0, hour = 270 }: {
  screen?: DashState; on: number; sky?: string; moon?: number; minute?: number; hour?: number;
}) {
  return <g>
    <g filter={SHADOW}>
      <rect x={SEG3 + 40} y={120} width={170} height={210} rx={6} fill="#B9AE98" />
      <rect x={SEG3 + 52} y={132} width={146} height={186} fill={sky} />
      {moon > 0 && <circle cx={SEG3 + 160} cy={170} r={18} fill="#F3EBD0" opacity={moon} />}
      <line x1={SEG3 + 125} x2={SEG3 + 125} y1={132} y2={318} stroke="#B9AE98" strokeWidth={8} />
      <line x1={SEG3 + 52} x2={SEG3 + 198} y1={225} y2={225} stroke="#B9AE98" strokeWidth={8} />
    </g>
    <Clock x={SEG3 + 1080} y={150} r={46} minute={minute} hour={hour} filter={SHADOW} />
    <g filter={SHADOW}>
      <rect x={SCREEN.x - 14} y={SCREEN.y - 14} width={SCREEN.w + 28} height={SCREEN.h + 28} rx={12} fill="#2B2F36" />
    </g>
    <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill="#3A3F48" />
    <path d={`M${SCREEN.x + 60} ${SCREEN.y} L${SCREEN.x + 160} ${SCREEN.y} L${SCREEN.x + 40} ${SCREEN.y + SCREEN.h} L${SCREEN.x - 60} ${SCREEN.y + SCREEN.h}Z`} fill="#FFFFFF" opacity={0.06} />
    {on > 0 && screen && <g opacity={on} transform={`translate(${SCREEN.x} ${SCREEN.y}) scale(${SCREEN.w / 1280})`}>
      <Dashboard state={screen} />
    </g>}
    <g filter={SHADOW}>
      <path d={`M${SEG3 + 1160} 600 L${SEG3 + 1200} 600 L${SEG3 + 1194} 540 L${SEG3 + 1166} 540Z`} fill={C.tie} />
      <path d={`M${SEG3 + 1180} 540 Q${SEG3 + 1150} 470 ${SEG3 + 1176} 430 Q${SEG3 + 1186} 490 ${SEG3 + 1184} 540Z`} fill={C.moss} />
      <path d={`M${SEG3 + 1182} 540 Q${SEG3 + 1214} 480 ${SEG3 + 1240} 466 Q${SEG3 + 1224} 510 ${SEG3 + 1188} 540Z`} fill="#2F7A52" />
    </g>
  </g>;
}

function paperFly(f: number, i: number, x: number) {
  const t = ramp(f, T.fly + i * 4, T.on - 2 + i * 2, Easing.inOut(Easing.cubic));
  const from = { x, y: 700 - 132 * 0.86 };
  return { t, x: mix(from.x, SCREEN_C.x, t), y: mix(from.y, SCREEN_C.y, t) - Math.sin(t * Math.PI) * 140, s: mix(1, 0.45, t), r: t * (i - 1) * 40 };
}

export function Paper({ text, x, y, s, r }: { text: string; x: number; y: number; s: number; r: number }) {
  return <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter={SHADOW}>
    <rect x={-36} y={-46} width={72} height={92} rx={5} fill={C.white} />
    <rect x={-36} y={-46} width={72} height={12} rx={5} fill={C.moss} />
    <text x={0} y={14} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={22} fill={C.ink}>{text}</text>
  </g>;
}

function Trio3({ f }: { f: number }) {
  const looks = [OPS, MANAGER, LEAD];
  return <g>{looks.map((look, i) => {
    const x = TRIO[i];
    const holding = f < T.fly + i * 4;
    const shake = f > T.argue && f < T.fly ? wobble(f, 5, 1.6, i * 2) : 0;
    const argue = f > T.argue && f < T.fly;
    const toward = i === 0 ? 1 : i === 2 ? -1 : (Math.sin(f * 0.15) > 0 ? 1 : -1);
    const watching = f >= T.on;
    const fly = paperFly(f, i, x);
    return <g key={i}>
      <ellipse cx={x} cy={702} rx={44} ry={8} fill="#3B2F1E" opacity={0.1} />
      <Person x={x} y={700} scale={0.86} look={look} pose={{
        handL: holding ? { x: -24, y: -124 } : undefined, handR: holding ? { x: 24, y: -124 } : undefined, armsFront: true,
        worry: argue ? 1 : 0, tilt: argue ? toward * 5 : 0, look: watching ? (SCREEN_C.x - x) / 300 : argue ? toward : 0,
        mouth: argue ? (i === 1 ? "open" : "sad") : watching ? "grin" : "smile", blink: blink(f, 75, i * 13),
      }} prop={holding ? <Paper text={PAPERS[i]} x={0} y={-132} s={1} r={shake} /> : undefined} filter={SHADOW} />
      {!holding && fly.t < 1 && <Paper text={PAPERS[i]} x={fly.x} y={fly.y} s={fly.s * 0.86} r={fly.r} />}
      <Speech f={f} at={T.argue + i * 12} until={T.fly - 4} x={x - 34} y={404} w={68} h={48} tail={[x, 470]}>
        <text x={x} y={437} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={26} fill={C.tie}>{lines.huh}</text>
      </Speech>
    </g>;
  })}</g>;
}

function VinhEnters({ f }: { f: number }) {
  if (f < T.vinh) return null;
  const w = ramp(f, T.vinh, T.stop, Easing.out(Easing.quad));
  const settle = f > T.stop ? Math.sin((f - T.stop) * 0.55) * Math.exp(-(f - T.stop) / 7) : 0;
  const push = ramp(f, T.push, T.push + 8, Easing.out(Easing.back(1.5))) * (1 - ramp(f, T.push + 18, T.push + 26));
  const x = mix(SEG3 + 1360, SEG3 + 940, w);
  return <g>
    <ellipse cx={x} cy={702} rx={48} ry={8} fill="#3B2F1E" opacity={0.1} />
    <Vinh x={x} y={700} scale={0.92} pose={{
      walk: f * 0.5, walking: 1 - ramp(f, T.stop - 6, T.stop + 2), push, hair: -8 * settle - push * 3, look: -1,
      glint: ramp(f, T.push + 4, T.push + 14), smile: 0.8, blink: blink(f, 90, 40),
    }} filter={SHADOW} />
  </g>;
}

export function Hall() {
  const f = useCurrentFrame();
  const cam = cameraAt(f);
  const hubLabel = (f < T.hub ? 0 : pop(f, T.hub, 200, 12)) * (1 - ramp(f, T.back - 4, T.back + 4));
  const manual = (f < T.shot - 6 ? 0 : pop(f, T.shot - 6, 200, 12)) * (1 - ramp(f, T.pan2, T.pan2 + 10));
  const oneBoard = (f < T.on + 2 ? 0 : pop(f, T.on + 2, 200, 12)) * (1 - ramp(f, T.dive + 2, T.dive + 12));
  const chatItems = SHOTS.map((_, k) => Math.round(shotState(f, k).fly1));
  return <Stage>
    <g transform={cam.t}>
      <Floor />
      <NumberWall f={f} s={cam.s} />
      {f < T.pan1 + 40 && <Trio1 f={f} />}
      {f > T.pan1 - 10 && f < T.pan2 + 40 && <>
        <Desk f={f} />
        <OpsAtDesk f={f} />
        <DeskFront />
        <Chat f={f} x={CHAT.x} y={CHAT.y} w={CHAT.w} h={CHAT.h} title={lines.group} items={chatItems} />
        <FlyingShots f={f} />
      </>}
      {f > T.pan2 - 10 && <>
        <MeetingRoom on={ramp(f, T.on, T.on + 8)} screen={{ level: 0, t: 1 }} />
        <Trio3 f={f} />
        <VinhEnters f={f} />
      </>}
    </g>
    <Chip x={640} y={110} text={lines.hotHub} s={hubLabel} color={C.white} bg={C.tie} />
    <Chip x={640} y={64} text={lines.manual} s={manual} />
    <Chip x={640} y={36} text={lines.oneBoard} s={oneBoard} bg={C.lime} />
  </Stage>;
}
