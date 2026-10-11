/* Shopee — cả phim trong một phòng (docs/case-motion.md). Team logistics của Shopee đứng sau bàn, báo cáo
   cho ba đối tác vận chuyển rơi xuống thành ba chồng giấy cao dần tới che mặt; thanh "Việc làm tay"
   đỏ rực, trời tối, đồng hồ quay. Vinh bước vào, đẩy kính, ghép cỗ máy AUTO từ khối SQL và Apps Script
   rồi bấm nút: máy hút giấy từ các chồng, báo cáo tự gấp thành máy bay giấy bay đi. Trời sáng, thanh
   việc làm tay tụt, nhãn −36%, cả team nhẹ nhõm. Câu chốt, rồi tờ giấy quét lên sang cảnh kết. */

import { Easing, useCurrentFrame } from "remotion";
import { Clock } from "../Clock";
import { Person } from "../Person";
import { Stage } from "../Stage";
import { Tagline } from "../Tagline";
import { Vinh } from "../Vinh";
import { blink, C, fonts, mix, mixColor, pop, ramp, wobble } from "../paper";
import { Chip, lines, SHADOW, TEAM } from "./cast";

export const OFFICE_FRAMES = 572;
export const T = {
  intro: 6, rain: 12, dusk: 60, night: 96, sleepy: 190, vinh: 236, stop: 266, push: 272, point: 292,
  sql: 292, script: 304, head: 318, funnel: 324, press: 330, run: 336, suck: 340, planes: 352,
  dawn: 384, cut: 438, relief: 444, glint: 462, tagline: 480, wipe: 546, end: OFFICE_FRAMES,
};
const PARTNERS = lines.partners.split("|");
const TEAM_X = [190, 420, 650];
const DESK = { x: 40, w: 760, top: 560 };
const SHEET_H = 10, START = 2, DROPS = 14, KEEP = 2;
const TEAM_Y = 620;
const MX = 925;
const INTAKE = { x: MX, y: 400 };
const VINH = { x: 1110, y: 690, s: 0.95 };
const BAR = { x: 830, y: 68, w: 280, h: 26 };

/** Tờ giấy thứ n rơi xuống chồng p. */
const dropAt = (p: number, n: number) => T.rain + n * 11 + p * 4;
/** Tờ trên cùng thứ k bị máy hút khỏi chồng p (k = 0 là tờ trên cùng lúc bắt đầu hút). */
const suckAt = (p: number, k: number) => T.suck + k * 6 + p * 2;
const MAX = START + DROPS;
export const DROP_TIMES = [0, 1, 2].flatMap(p => Array.from({ length: DROPS }, (_, n) => dropAt(p, n) + 10));
export const SUCK_TIMES = [0, 1, 2].flatMap(p => Array.from({ length: MAX - KEEP }, (_, k) => suckAt(p, k)));
export const PLANES = Array.from({ length: 6 }, (_, k) => T.planes + k * 13);
const seeded = (n: number) => { const v = Math.sin(n * 57.3) * 43758.5; return v - Math.floor(v); };

function pileCount(p: number, f: number) {
  const landed = Array.from({ length: DROPS }, (_, n) => n).filter(n => f >= dropAt(p, n) + 10).length;
  const gone = Array.from({ length: MAX - KEEP }, (_, k) => k).filter(k => f >= suckAt(p, k)).length;
  return START + landed - gone;
}

function sky(f: number) {
  const day = "#CFE0DA", dusk = "#E8B88A", night = "#2B3550", dawn = "#F2C48D";
  if (f < T.dusk) return day;
  if (f < T.night) return mixColor(day, dusk, ramp(f, T.dusk, T.night));
  if (f < T.dawn) return mixColor(dusk, night, ramp(f, T.night, T.night + 20));
  if (f < T.dawn + 20) return mixColor(night, dawn, ramp(f, T.dawn, T.dawn + 20));
  return mixColor(dawn, day, ramp(f, T.dawn + 20, T.dawn + 50));
}

function Paper({ x, y, w = 130, r = 0, s = 1 }: { x: number; y: number; w?: number; r?: number; s?: number }) {
  return <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-w / 2} y={-SHEET_H / 2} width={w} height={SHEET_H - 1} rx={2} fill={C.white} stroke={C.grid} strokeWidth={1.5} />
  </g>;
}

function Piles({ f }: { f: number }) {
  return <g>{TEAM_X.map((x, p) => {
    const n = pileCount(p, f);
    return <g key={p} filter={SHADOW}>{Array.from({ length: n }, (_, k) =>
      <Paper key={k} x={x + (seeded(p * 31 + k) - 0.5) * 14} y={DESK.top - SHEET_H / 2 - k * SHEET_H} r={(seeded(p * 7 + k) - 0.5) * 4} />)}</g>;
  })}</g>;
}

function Falling({ f }: { f: number }) {
  return <g>{[0, 1, 2].flatMap(p => Array.from({ length: DROPS }, (_, n) => {
    const at = dropAt(p, n), t = ramp(f, at, at + 10, Easing.in(Easing.quad));
    if (t <= 0 || t >= 1) return null;
    const land = DESK.top - SHEET_H / 2 - (START + n) * SHEET_H;
    return <g key={`${p}-${n}`} filter={SHADOW}><Paper x={TEAM_X[p] + (1 - t) * 30 * (seeded(n + p) - 0.5)} y={mix(-40, land, t)} r={(1 - t) * 40 * (seeded(n * 3 + p) - 0.5)} /></g>;
  }))}</g>;
}

function Sucked({ f }: { f: number }) {
  return <g>{[0, 1, 2].flatMap(p => Array.from({ length: MAX - KEEP }, (_, k) => {
    const at = suckAt(p, k), t = ramp(f, at, at + 14, Easing.in(Easing.quad));
    if (t <= 0 || t >= 1) return null;
    const y0 = DESK.top - SHEET_H / 2 - (MAX - 1 - k) * SHEET_H;
    return <g key={`${p}-${k}`} filter={SHADOW}>
      <Paper x={mix(TEAM_X[p], INTAKE.x, t)} y={mix(y0, INTAKE.y, t) - Math.sin(t * Math.PI) * 110} r={t * 260} s={mix(1, 0.3, t)} />
    </g>;
  }))}</g>;
}

function Planes({ f }: { f: number }) {
  return <g>{PLANES.map((at, k) => {
    const t = ramp(f, at, at + 28, Easing.in(Easing.quad));
    if (t <= 0 || t >= 1) return null;
    const x = mix(990, 1360, t), y = mix(432, 150 + (k % 3) * 70, t) - Math.sin(t * Math.PI) * 80;
    return <g key={k} transform={`translate(${x} ${y}) rotate(${-18 + t * 10}) scale(${mix(0.5, 1.1, Math.min(t * 3, 1))})`} filter={SHADOW}>
      <path d="M-24 -9 L26 0 L-24 11 L-13 1Z" fill={C.white} />
      <path d="M-13 1 L26 0" stroke={C.grid} strokeWidth={2} />
    </g>;
  })}</g>;
}

function Gear({ x, y, r, rot }: { x: number; y: number; r: number; rot: number }) {
  const teeth = Math.round(r / 4);
  return <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {Array.from({ length: teeth }, (_, k) =>
      <rect key={k} x={-r * 0.13} y={-r - r * 0.2} width={r * 0.26} height={r * 0.4} rx={2} fill="#8A93A6" transform={`rotate(${(k * 360) / teeth})`} />)}
    <circle r={r} fill="#8A93A6" />
    <circle r={r * 0.34} fill={C.paper} />
  </g>;
}

/** Khối rơi xuống từ trên, nảy khi chạm chỗ. */
function drop(f: number, at: number) {
  if (f < at) return { y: -800, s: 0 };
  const t = ramp(f, at, at + 10, Easing.in(Easing.quad));
  const bounce = f > at + 10 ? Math.abs(Math.sin((f - at - 10) * 0.6)) * 10 * Math.exp(-(f - at - 10) / 5) : 0;
  return { y: mix(-700, 0, t) - bounce, s: 1 };
}

function Machine({ f }: { f: number }) {
  const sql = drop(f, T.sql), script = drop(f, T.script);
  const head = f < T.head ? 0 : Math.min(pop(f, T.head, 200, 11), 1.05);
  const funnel = f < T.funnel ? 0 : Math.min(pop(f, T.funnel, 200, 11), 1.05);
  const running = f >= T.run;
  const spin = running ? (f - T.run) * 8 : 0;
  const pressed = f >= T.press && f < T.press + 6;
  const gulp = SUCK_TIMES.some(at => f >= at + 12 && f < at + 16);
  const shake = running && f < T.cut ? wobble(f, 1.2, 2.4) : 0;
  return <g transform={`translate(${shake} 0)`}>
    {head > 0.01 && <g transform={`translate(855 475) scale(${head}) translate(-855 -475)`}><Gear x={855} y={475} r={28} rot={spin} /></g>}
    {sql.s > 0 && <g transform={`translate(0 ${sql.y})`} filter={SHADOW}>
      <rect x={MX - 80} y={590} width={160} height={70} rx={12} fill={C.navy} />
      <text x={MX} y={634} textAnchor="middle" fontFamily={fonts.mono} fontWeight={600} fontSize={28} fill={C.white}>{lines.sql}</text>
    </g>}
    {script.s > 0 && <g transform={`translate(0 ${script.y})`} filter={SHADOW}>
      <rect x={MX - 85} y={520} width={170} height={70} rx={12} fill={C.moss} />
      <text x={MX - 4} y={561} textAnchor="middle" fontFamily={fonts.mono} fontWeight={600} fontSize={19} fill={C.white}>{lines.script}</text>
      <circle cx={MX + 85} cy={555} r={11} fill={pressed ? "#9CC23A" : C.lime} stroke={C.mossDeep} strokeWidth={3} />
    </g>}
    {funnel > 0.01 && <g transform={`translate(${MX} 430) scale(${funnel}) translate(${-MX} -430)`}>
      <path d={`M${MX - 58} 394 L${MX + 58} 394 L${MX + 26} 432 L${MX - 26} 432Z`} fill="#56627E" />
      <rect x={MX - 64} y={388} width={128} height={12} rx={6} fill={gulp ? C.lime : "#6E7891"} />
    </g>}
    {head > 0.01 && <g transform={`translate(${MX} 520) scale(${head}) translate(${-MX} -520)`} filter={SHADOW}>
      <rect x={MX - 70} y={430} width={140} height={90} rx={14} fill="#3A3F48" />
      <rect x={MX - 56} y={444} width={112} height={60} rx={8} fill={running ? C.lime : "#56627E"} />
      <text x={MX} y={485} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={30} fill={running ? C.ink : "#8A93A6"}>{lines.auto}</text>
    </g>}
  </g>;
}

function Meter({ f }: { f: number }) {
  const s = f < T.intro ? 0 : Math.min(pop(f, T.intro, 200, 12), 1);
  if (s <= 0.01) return null;
  const v = f < T.suck ? mix(0.45, 1, ramp(f, T.rain, T.rain + 160, Easing.out(Easing.quad))) : mix(1, 0.64, ramp(f, T.suck + 10, T.cut - 4, Easing.inOut(Easing.cubic)));
  const color = mixColor(C.moss, C.tie, Math.min(1, (v - 0.64) / 0.3));
  const alarm = v > 0.97 && f < T.suck + 10 ? 0.5 + 0.5 * Math.sin(f * 0.5) : 0;
  const cut = f < T.cut ? 0 : Math.min(pop(f, T.cut, 240, 10), 1.08);
  return <g transform={`translate(930 80) scale(${s}) translate(-930 -80)`}>
    <rect x={640} y={40} width={580} height={80} rx={18} fill={C.white} filter={SHADOW} />
    <text x={664} y={90} fontFamily={fonts.sans} fontWeight={700} fontSize={24} fill={C.ink}>{lines.manual}</text>
    <rect x={BAR.x} y={BAR.y} width={BAR.w} height={BAR.h} rx={13} fill={C.grid} />
    <rect x={BAR.x} y={BAR.y} width={BAR.w * v} height={BAR.h} rx={13} fill={color} />
    {alarm > 0 && <rect x={BAR.x - 4} y={BAR.y - 4} width={BAR.w + 8} height={BAR.h + 8} rx={17} fill="none" stroke={C.tie} strokeWidth={3} opacity={alarm} />}
    {cut > 0 && <g transform={`translate(1172 136) rotate(-8) scale(${cut})`} filter={SHADOW}>
      <circle r={52} fill={C.lime} />
      <text x={0} y={11} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={32} fill={C.ink}>{lines.cut}</text>
    </g>}
  </g>;
}

function Room({ f }: { f: number }) {
  const spin = ramp(f, T.rain, T.vinh, Easing.inOut(Easing.quad));
  return <g>
    <rect x={0} y={0} width={1280} height={720} fill={C.paper} />
    <rect x={0} y={600} width={1280} height={120} fill={C.floor} />
    <rect x={0} y={596} width={1280} height={6} fill={C.floorLine} />
    <g filter={SHADOW}>
      <rect x={60} y={70} width={160} height={180} rx={6} fill="#B9AE98" />
      <rect x={72} y={82} width={136} height={156} fill={sky(f)} />
      {f > T.night && f < T.dawn + 10 && <circle cx={168} cy={120} r={16} fill="#F3EBD0" opacity={ramp(f, T.night, T.night + 20) * (1 - ramp(f, T.dawn, T.dawn + 10))} />}
      {f > T.dawn && <circle cx={110} cy={mix(240, 130, ramp(f, T.dawn, T.dawn + 40, Easing.out(Easing.quad)))} r={18} fill="#F2B544" />}
      <line x1={140} x2={140} y1={82} y2={238} stroke="#B9AE98" strokeWidth={8} />
      <line x1={72} x2={208} y1={160} y2={160} stroke="#B9AE98" strokeWidth={8} />
    </g>
    <Clock x={310} y={140} r={44} minute={360 * 9 * spin} hour={300 + 270 * spin} filter={SHADOW} />
  </g>;
}

function teamPose(f: number, i: number) {
  const stress = ramp(f, T.rain + 40, T.rain + 120);
  const relief = f >= T.relief + i * 4;
  const up = relief ? Math.min(pop(f, T.relief + i * 4, 180, 10), 1.1) * (1 - ramp(f, T.wipe - 4, T.wipe + 8)) : 0;
  const mug = i === 1 && relief;
  const cheer = !mug && up > 0;
  const hop = cheer && up > 0.3 ? Math.abs(Math.sin((f - T.relief) * 0.35 + i)) * 8 * up : 0;
  const sleepy = i === 1 && !relief ? ramp(f, T.sleepy, T.sleepy + 30) * (1 - ramp(f, T.suck + 30, T.suck + 50)) : 0;
  return {
    handL: cheer ? { x: mix(-52, -40, up), y: mix(-62, -268, up) } : undefined,
    handR: cheer ? { x: mix(52, 40, up), y: mix(-62, -268, up) } : mug ? { x: 34, y: -170 } : undefined,
    armsFront: mug, lift: hop, worry: relief ? 0 : stress, sleepy, tilt: sleepy * 8 + (relief ? 0 : wobble(f, stress * 2, 1.3, i)),
    look: relief ? 0.4 : (i - 1) * -0.3, blink: blink(f, 70, i * 13),
    mouth: (relief ? "grin" : stress > 0.5 ? (i === 0 ? "open" : "sad") : "smile") as "grin" | "open" | "sad" | "smile",
    mug,
  };
}

function Team({ f }: { f: number }) {
  return <g>{TEAM.map((look, i) => {
    const { mug, ...pose } = teamPose(f, i);
    return <Person key={i} x={TEAM_X[i]} y={TEAM_Y} scale={0.9} look={look} pose={pose} filter={SHADOW}
      prop={mug ? <g transform="translate(34 -170)"><rect x={-11} y={-14} width={22} height={24} rx={4} fill={C.lime} /><path d="M11 -8 Q19 -6 18 0 Q17 6 11 5" fill="none" stroke={C.lime} strokeWidth={4} /></g> : undefined} />;
  })}</g>;
}

function Desk() {
  return <g>
    <g filter={SHADOW}>
      <rect x={DESK.x} y={DESK.top} width={DESK.w} height={18} rx={4} fill={C.wood} />
      <rect x={DESK.x + 16} y={DESK.top + 18} width={DESK.w - 32} height={118} fill={C.woodDeep} />
    </g>
    {TEAM_X.map((x, p) => <g key={p}>
      <rect x={x - 82} y={DESK.top + 44} width={164} height={40} rx={8} fill={C.white} />
      <text x={x} y={DESK.top + 71} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={19} fill={C.ink}>{PARTNERS[p]}</text>
    </g>)}
  </g>;
}

function vinhPose(f: number) {
  const walk = ramp(f, T.vinh, T.stop, Easing.out(Easing.quad));
  const settle = f > T.stop ? Math.sin((f - T.stop) * 0.55) * Math.exp(-(f - T.stop) / 7) : 0;
  const think = (a: number) => ramp(f, a, a + 8, Easing.out(Easing.back(1.5))) * (1 - ramp(f, a + 14, a + 22));
  const point = ramp(f, T.point, T.point + 8, Easing.out(Easing.back(1.4))) * (1 - ramp(f, T.press - 10, T.press - 4));
  const press = ramp(f, T.press - 6, T.press, Easing.out(Easing.quad)) * (1 - ramp(f, T.press + 8, T.press + 16));
  const rest = { x: -50, y: -64 };
  const button = { x: (MX + 85 - VINH.x) / VINH.s, y: (555 - VINH.y) / VINH.s };
  const handL = point > 0.01 ? { x: mix(rest.x, -92, point), y: mix(rest.y, -200, point) }
    : press > 0.01 ? { x: mix(rest.x, button.x, press), y: mix(rest.y, button.y, press) } : undefined;
  return {
    x: mix(1420, VINH.x, walk),
    pose: {
      walk: f * 0.5, walking: 1 - ramp(f, T.stop - 6, T.stop + 2), push: Math.max(think(T.push), think(T.glint)),
      glint: f < T.glint ? ramp(f, T.push + 6, T.push + 16) : ramp(f, T.glint + 6, T.glint + 16),
      hair: -8 * settle, look: -1, smile: f > T.run ? 1 : 0.7, blink: blink(f, 90, 40), handL,
    },
  };
}

export function Office() {
  const f = useCurrentFrame();
  const night = ramp(f, T.dusk, T.night + 20) * (1 - ramp(f, T.dawn, T.dawn + 30));
  const reports = (f < T.intro + 6 ? 0 : Math.min(pop(f, T.intro + 6, 200, 12), 1)) * (1 - ramp(f, T.rain + 96, T.rain + 108));
  const v = vinhPose(f);
  const dim = ramp(f, T.tagline - 4, T.tagline + 8);
  const wipe = ramp(f, T.wipe, T.end - 2, Easing.inOut(Easing.cubic));
  return <Stage>
    <Room f={f} />
    <Team f={f} />
    <Desk />
    <Piles f={f} />
    <Falling f={f} />
    <Machine f={f} />
    <Sucked f={f} />
    <Planes f={f} />
    {f >= T.vinh && <>
      <ellipse cx={v.x} cy={VINH.y + 2} rx={48} ry={8} fill="#3B2F1E" opacity={0.1} />
      <Vinh x={v.x} y={VINH.y} scale={VINH.s} pose={v.pose} filter={SHADOW} />
    </>}
    <rect x={0} y={0} width={1280} height={720} fill="#141B2B" opacity={0.22 * night} />
    {f > T.run && f < T.dawn + 30 && <circle cx={MX} cy={474} r={90} fill={C.lime} opacity={0.18 * night} />}
    <Meter f={f} />
    <Chip x={420} y={326} s={reports} text={lines.reports} />
    {dim > 0 && <rect x={0} y={0} width={1280} height={720} fill={C.paper} opacity={dim * 0.5} />}
    <Tagline f={f} at={T.tagline} text={lines.tagline} />
    {wipe > 0 && <g transform={`rotate(${-3 * (1 - wipe)} 640 ${mix(760, -60, wipe)})`}>
      <rect x={-80} y={mix(760, -60, wipe) + 6} width={1440} height={900} fill="#D9D2C0" />
      <rect x={-80} y={mix(760, -60, wipe)} width={1440} height={900} fill={C.paper} />
    </g>}
  </Stage>;
}
