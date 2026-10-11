/* Rà soát COD — cảnh 3 (docs/case-motion.md). Danh sách vừa phóng ra cả khung chính là module Rà soát
   COD trong GHN Ops Pulse: nhãn AUTO, đơn nghi ngờ xếp theo mức. Camera lùi ra — màn hình treo ở phòng
   vận hành, đội GHN đứng xem cùng Vinh. Lịch lật sang ngày mới, bảng tự cập nhật; đơn nghi ngờ cao
   được xử lý ngay, cả đội reo lên. Câu chốt, rồi tờ giấy quét lên sang cảnh kết. */

import { Easing, useCurrentFrame } from "remotion";
import { GHN } from "../ghn";
import { Person } from "../Person";
import { Stage } from "../Stage";
import { Tagline } from "../Tagline";
import { Vinh } from "../Vinh";
import { blink, C, fonts, mix, pop, ramp } from "../paper";
import { LEVEL_COLOR, LEVEL_INK, LEVELS } from "./AiEngine";
import { lines, MANAGER, OPS } from "./cast";
import { Bill, Box } from "./Doorstep";

export const BOARD_FRAMES = 250;
export const T = {
  header: 2, auto: 12, rows: 16, zoom: 50, zoomEnd: 94, flip: 102, refresh: 108, point: 118, stamp: 128,
  cheer: 140, glint: 150, tagline: 168, wipe: 222, end: BOARD_FRAMES,
};
const SHADOW = "url(#cut)";
/** Màn hình trên tường; khung đầu cảnh phóng sao cho màn hình vừa khít khung hình. */
const SCREEN = { x: 290, y: 46, w: 700, h: 393.75 };
const ZOOM0 = 1280 / SCREEN.w;
const DAY_A = [0, 0, 1, 1, 2], DAY_B = [0, 0, 1, 2, 2];
const FILL = [[0.92, 0.86], [0.64, 0.56], [0.32, 0.24]];
/** Đơn được xử lý (hàng của ngày mới) và khung đóng dấu. */
export const STAMPS = [0, 1].map(i => ({ row: i, at: T.stamp + i * 10 }));
const people = { ops: 170, vinh: 640, manager: 1100 };

function cameraAt(f: number) {
  const z = ramp(f, T.zoom, T.zoomEnd, Easing.inOut(Easing.cubic));
  const s = ZOOM0 ** (1 - z);
  const cx = 640, cy = mix(SCREEN.y + SCREEN.h / 2, 360, z);
  return `translate(640 360) scale(${s}) translate(${-cx} ${-cy})`;
}

function Refresh({ spin }: { spin: number }) {
  return <g transform={`rotate(${spin})`}>
    <path d="M10 0 A10 10 0 1 1 3.1 -9.5" stroke={C.ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />
    <path d="M1 -15.5 L9.5 -9.8 L1.5 -4.2Z" fill={C.ink} />
  </g>;
}

/** Màn hình Rà soát COD, vẽ theo khung 1280×720 (khớp khung cuối của AiEngine). */
function Board({ f }: { f: number }) {
  const head = ramp(f, T.header, T.header + 12, Easing.out(Easing.cubic));
  const auto = f < T.auto ? 0 : Math.min(pop(f, T.auto, 220, 11), 1) * (1 + 0.12 * Math.sin(ramp(f, T.refresh, T.refresh + 14) * Math.PI));
  const spin = ramp(f, T.refresh - 2, T.refresh + 22, Easing.inOut(Easing.cubic)) * 720;
  return <g>
    <rect x={0} y={0} width={1280} height={720} fill={C.white} />
    <rect x={0} y={0} width={1280} height={78} fill={C.paper} />
    {[34, 58, 82].map((cx, i) => <circle key={cx} cx={cx} cy={39} r={8} fill={[C.tie, "#E8B84A", C.moss][i]} />)}
    <g opacity={head} transform={`translate(0 ${(1 - head) * -12})`}>
      <text x={116} y={50} fontFamily={fonts.sans} fontWeight={700} fontSize={28} fill={C.ink}>{lines.app}</text>
      <text x={340} y={50} fontFamily={fonts.sans} fontWeight={700} fontSize={28} fill={C.grey}>›</text>
      <text x={368} y={50} fontFamily={fonts.sans} fontWeight={700} fontSize={28} fill={C.moss}>{lines.module}</text>
    </g>
    {auto > 0.01 && <g transform={`translate(1060 39) scale(${auto})`}>
      <rect x={-180} y={-22} width={360} height={44} rx={22} fill={C.lime} />
      <g transform="translate(-154 0)"><Refresh spin={spin} /></g>
      <text x={-130} y={7} fontFamily={fonts.sans} fontWeight={700} fontSize={20} fill={C.ink}>{lines.auto}</text>
    </g>}
    {DAY_A.map((_, i) => <Row key={i} f={f} i={i} />)}
  </g>;
}

function Row({ f, i }: { f: number; i: number }) {
  const q = ramp(f, T.rows + i * 6, T.rows + i * 6 + 14, Easing.out(Easing.cubic));
  if (q <= 0) return null;
  const y = 104 + i * 112;
  // Lật hàng khi bảng tự cập nhật: gập lại, đổi đơn của ngày mới, mở ra.
  const r0 = T.refresh + i * 3;
  const fold = f < r0 + 5 ? ramp(f, r0, r0 + 5) : 1 - ramp(f, r0 + 5, r0 + 10);
  const day = f >= r0 + 5 ? 1 : 0;
  const level = (day ? DAY_B : DAY_A)[i];
  const fill = FILL[level][(i + day) % 2];
  const stamp = STAMPS.find(s => s.row === i && day);
  const done = !stamp || f < stamp.at ? 0 : 1.8 - 0.8 * Math.min(pop(f, stamp.at, 300, 14), 1);
  const high = level === 0 && done === 0;
  const cy = y + 46;
  return <g opacity={q} transform={`translate(${(1 - q) * 140} ${cy}) scale(1 ${1 - fold}) translate(0 ${-cy})`}>
    <rect x={80} y={y} width={1120} height={92} rx={14} fill={high ? "#FBEDE8" : "#F6F4EE"} stroke={high ? C.tie : C.grid} strokeWidth={high ? 4 : 2} />
    <Box x={140} y={cy} s={0.8} />
    <rect x={196} y={y + 28} width={200 - ((i * 37 + day * 53) % 60)} height={14} rx={7} fill={C.grid} />
    <rect x={196} y={y + 52} width={130} height={10} rx={5} fill="#EFEBE2" />
    <Bill x={470} y={cy} s={0.85} />
    <rect x={540} y={y + 38} width={280} height={16} rx={8} fill={C.grid} />
    <rect x={540} y={y + 38} width={280 * fill} height={16} rx={8} fill={LEVEL_COLOR[level]} />
    <rect x={862} y={y + 23} width={176} height={46} rx={23} fill={LEVEL_COLOR[level]} />
    <text x={950} y={y + 54} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={22} fill={LEVEL_INK[level]}>{LEVELS[level]}</text>
    {done > 0 && <g transform={`translate(1122 ${cy}) rotate(-7) scale(${done})`} opacity={Math.min(done, 1)}>
      <rect x={-78} y={-28} width={156} height={56} rx={8} fill={C.white} stroke={C.moss} strokeWidth={5} />
      <text x={0} y={9} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={26} fill={C.moss}>{lines.done}</text>
    </g>}
  </g>;
}

/** Lịch treo tường: lật một tờ sang ngày mới — bảng chạy AUTO theo ngày. */
function Calendar({ f }: { f: number }) {
  const x = 150, y = 210;
  const t = ramp(f, T.flip, T.flip + 10, Easing.in(Easing.quad));
  const page = (n: number) => <text x={x} y={y + 104} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={60} fill={C.ink}>{n}</text>;
  return <g>
    <g filter={SHADOW}>
      <rect x={x - 64} y={y} width={128} height={136} rx={10} fill={C.white} />
      <rect x={x - 64} y={y} width={128} height={34} rx={10} fill={C.tie} />
      <rect x={x - 64} y={y + 22} width={128} height={12} fill={C.tie} />
    </g>
    {page(15)}
    {t < 1 && <g transform={`translate(0 ${y + 34}) scale(1 ${1 - 2 * t}) translate(0 ${-(y + 34)})`}>
      <rect x={x - 64} y={y + 34} width={128} height={102} rx={4} fill={t > 0.5 ? "#EFEBE2" : C.white} />
      {t <= 0.5 && page(14)}
    </g>}
    {[-30, 30].map(dx => <rect key={dx} x={x + dx - 4} y={y - 10} width={8} height={22} rx={4} fill="#56627E" />)}
  </g>;
}

function Room() {
  return <g>
    <rect x={-200} y={-200} width={1680} height={1120} fill={C.paper} />
    <rect x={-200} y={600} width={1680} height={320} fill={C.floor} />
    <rect x={-200} y={596} width={1680} height={6} fill={C.floorLine} />
    <g filter={SHADOW}>
      <rect x={1084} y={86} width={110} height={52} rx={12} fill={GHN.orange} />
    </g>
    <text x={1139} y={122} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={30} fill={C.white}>{lines.brand}</text>
    <g filter={SHADOW}>
      <rect x={SCREEN.x - 14} y={SCREEN.y - 14} width={SCREEN.w + 28} height={SCREEN.h + 28} rx={12} fill="#2B2F36" />
      <path d={`M1196 600 L1236 600 L1230 540 L1202 540Z`} fill={C.tie} />
      <path d="M1216 540 Q1186 470 1212 430 Q1222 490 1220 540Z" fill={C.moss} />
      <path d="M1218 540 Q1250 480 1276 466 Q1260 510 1224 540Z" fill="#2F7A52" />
    </g>
  </g>;
}

function cheer(f: number, i: number) {
  const up = (f < T.cheer + i * 3 ? 0 : Math.min(pop(f, T.cheer + i * 3, 180, 10), 1.1)) * (1 - ramp(f, T.wipe - 4, T.wipe + 10));
  const hop = up > 0.3 ? Math.abs(Math.sin((f - T.cheer) * 0.35 + i)) * 10 * up : 0;
  return { up, hop };
}

function Team({ f }: { f: number }) {
  const o = cheer(f, 0), m = cheer(f, 1);
  const point = ramp(f, T.point - 8, T.point + 2, Easing.out(Easing.back(1.4))) * (1 - ramp(f, T.cheer - 6, T.cheer));
  const pose = (c: { up: number; hop: number }, seed: number, look: number) => ({
    handL: { x: mix(-52, -40, c.up), y: mix(-62, -268, c.up) }, handR: { x: mix(52, 40, c.up), y: mix(-62, -268, c.up) },
    lift: c.hop, look, mouth: (c.up > 0.3 ? "grin" : "smile") as "grin" | "smile", blink: blink(f, 80, seed),
  });
  const mPose = point > 0.01
    ? { handL: { x: mix(-52, -86, point), y: mix(-62, -238, point) }, look: -1, mouth: "open" as const, blink: blink(f, 80, 17) }
    : pose(m, 17, -1);
  const vin = ramp(f, T.glint, T.glint + 8, Easing.out(Easing.back(1.5))) * (1 - ramp(f, T.glint + 16, T.glint + 24));
  return <g>
    {[people.ops, people.vinh, people.manager].map(x => <ellipse key={x} cx={x} cy={700} rx={46} ry={8} fill="#3B2F1E" opacity={0.1} />)}
    <Person x={people.ops} y={698} scale={0.88} look={OPS} pose={pose(o, 5, 1)} filter={SHADOW} />
    <Vinh x={people.vinh} y={698} scale={0.88} filter={SHADOW} pose={{
      push: vin, glint: ramp(f, T.glint + 6, T.glint + 16), look: 0.3, smile: f > T.stamp ? 1 : 0.7, blink: blink(f, 90, 40),
    }} />
    <Person x={people.manager} y={698} scale={0.88} look={MANAGER} pose={mPose} filter={SHADOW} />
  </g>;
}

export function CodBoard() {
  const f = useCurrentFrame();
  const dim = ramp(f, T.tagline - 4, T.tagline + 8);
  const wipe = ramp(f, T.wipe, T.end - 2, Easing.inOut(Easing.cubic));
  return <Stage>
    <g transform={cameraAt(f)}>
      <Room />
      <Calendar f={f} />
      <g transform={`translate(${SCREEN.x} ${SCREEN.y}) scale(${SCREEN.w / 1280})`}><Board f={f} /></g>
      <Team f={f} />
    </g>
    {dim > 0 && <rect x={0} y={0} width={1280} height={720} fill={C.paper} opacity={dim * 0.5} />}
    <Tagline f={f} at={T.tagline} text={lines.tagline} />
    {wipe > 0 && <g transform={`rotate(${-3 * (1 - wipe)} 640 ${mix(760, -60, wipe)})`}>
      <rect x={-80} y={mix(760, -60, wipe) + 6} width={1440} height={900} fill="#D9D2C0" />
      <rect x={-80} y={mix(760, -60, wipe)} width={1440} height={900} fill={C.paper} />
    </g>}
  </Stage>;
}
