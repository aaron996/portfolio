/* Tìm kho làm trễ — cảnh 3 và 4 (docs/case-motion.md). Cảnh 3 ở ô dưới-phải (1280..2560, 720..1440),
   cảnh 4 ở ô trên-phải (1280..2560, 0..720).
   3. Vinh và người bên nghiệp vụ xếp bốn quy tắc nghiệp vụ; bốn tầng rây theo đúng thứ tự đó — dòng
      thời gian của kiện lọt qua tầng 1, bị tầng 2 giữ lại → đèn rọi đúng Kho D: giữ đơn quá hạn.
   4. Hàng kho lúc đầu (nhắc lại cảnh 1): đèn quét qua rồi dừng ở Kho D, thư đòi đền bù đáp xuống đúng
      kho đó; bốn kho kia được minh oan. Vinh và người nghiệp vụ vui; câu chốt kết quả. */

import { Easing } from "remotion";
import { Person } from "../Person";
import { Vinh } from "../Vinh";
import { Warehouse } from "../Warehouse";
import { blink, C, fonts, mix, pop, ramp, wobble } from "../paper";
import { BUSINESS, Chip, Envelope, lines, SHADOW, whName } from "./cast";
import { T as A } from "./Scenes12";

export const T = {
  cards: 442, order: 458, priority: 480, toTray: 502, drop: 530, pass1: 542, catch: 558, light: 566, hit: 580, pan3: 640,
  spot: 676, lock: 700, env: 712, envLand: 736, cheer: 712, glint: 744, tagline: 760, wipe: 830, end: 856,
};

/* ── Cảnh 3 (x + 1280, y + 720) ── */
const X3 = 1280, Y3 = 720;
const SLOTS = [150, 250, 350, 450].map(x => X3 + x);
const START = [2, 0, 3, 1]; // quy tắc k nằm ở ô START[k] trước khi xếp lại
const TRAYS = [170, 262, 354, 446].map(y => Y3 + y);
const TOWER_X = X3 + 930;
const TARGET = { x: X3 + 1150, y: Y3 + 600 };

function RuleCard({ x, y, k, s = 1 }: { x: number; y: number; k: number; s?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`} filter={SHADOW}>
    <rect x={-46} y={-26} width={92} height={52} rx={8} fill={C.white} />
    <rect x={-46} y={-26} width={92} height={12} rx={6} fill={k === 1 ? C.moss : "#8C6A44"} />
    <text x={0} y={16} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={16} fill={C.ink}>{`${lines.rule} ${k + 1}`}</text>
  </g>;
}

function Bundle({ x, y, r = 0 }: { x: number; y: number; r?: number }) {
  return <g transform={`translate(${x} ${y}) rotate(${r})`} filter={SHADOW}>
    <rect x={-66} y={-18} width={132} height={36} rx={8} fill={C.white} />
    <rect x={-56} y={-8} width={18} height={16} rx={3} fill={C.moss} />
    <rect x={-34} y={-8} width={14} height={16} rx={3} fill={C.moss} />
    <rect x={-16} y={-8} width={44} height={16} rx={3} fill={C.moss} />
    <line x1={36} x2={36} y1={-14} y2={14} stroke={C.ink} strokeWidth={3} strokeDasharray="4 3" />
  </g>;
}

export function Scene3({ f }: { f: number }) {
  if (f < A.pan2 - 10 || f > T.pan3 + 40) return null;
  const drop = ramp(f, T.drop, T.pass1, Easing.in(Easing.quad));
  const through = ramp(f, T.pass1 + 4, T.catch, Easing.in(Easing.quad));
  const caught = f >= T.catch;
  const by = caught ? TRAYS[1] - 20 - Math.abs(Math.sin((f - T.catch) * 0.5)) * 10 * Math.exp(-(f - T.catch) / 8)
    : f >= T.pass1 + 4 ? mix(TRAYS[0] - 20, TRAYS[1] - 20, through) : mix(Y3 + 40, TRAYS[0] - 20, drop);
  const shake1 = f > T.pass1 - 2 && f < T.pass1 + 12 ? wobble(f, 6, 3) : 0;
  const light = ramp(f, T.light, T.light + 10);
  const hit = (f < T.hit ? 0 : Math.min(pop(f, T.hit, 200, 12), 1)) * (1 - ramp(f, T.pan3 + 10, T.pan3 + 20));
  const pri = (f < T.priority ? 0 : Math.min(pop(f, T.priority, 220, 12), 1)) * (1 - ramp(f, T.toTray + 30, T.toTray + 40));
  const reach = f >= T.cards && f < T.toTray;
  return <g>
    <rect x={X3} y={Y3 + 600} width={1280} height={140} fill={C.floor} />
    <rect x={X3} y={Y3 + 596} width={1280} height={6} fill={C.floorLine} />

    {/* Bàn xếp quy tắc */}
    <Person x={X3 + 210} y={Y3 + 650} look={BUSINESS} pose={{
      handR: reach ? { x: 60 + wobble(f, 6, 0.8), y: -150 } : undefined, armsFront: reach, look: 1, blink: blink(f, 70, 12),
      mouth: f > T.priority ? "grin" : "smile",
    }} filter={SHADOW} />
    <Chip x={X3 + 210} y={Y3 + 330} s={f < T.cards - 10 ? 0 : Math.min(pop(f, T.cards - 10, 220, 12), 1)} text={lines.business} bg={"#7A5C99"} color={C.white} size={17} />
    <Vinh x={X3 + 500} y={Y3 + 650} scale={1} pose={{
      look: -1, smile: 0.8, blink: blink(f, 90, 5), handR: reach ? { x: -60 + wobble(f, 6, 0.9, 2), y: -150 } : undefined,
    }} filter={SHADOW} />
    <g filter={SHADOW}>
      <rect x={X3 + 90} y={Y3 + 520} width={500} height={20} rx={6} fill={C.wood} />
      <rect x={X3 + 110} y={Y3 + 540} width={460} height={80} fill={C.woodDeep} />
    </g>
    {[0, 1, 2, 3].map(k => {
      const order = ramp(f, T.order + k * 4, T.order + k * 4 + 14, Easing.inOut(Easing.cubic));
      const toTray = ramp(f, T.toTray + k * 4, T.toTray + k * 4 + 18, Easing.inOut(Easing.cubic));
      if (f < T.cards) return null;
      const s = Math.min(pop(f, T.cards + k * 3, 220, 12), 1);
      const x0 = SLOTS[START[k]], x1 = SLOTS[k];
      const tx = TOWER_X - 200, ty = TRAYS[k];
      const x = mix(mix(x0, x1, order), tx, toTray), y = mix(Y3 + 494 - Math.sin(order * Math.PI) * 40, ty, toTray) - Math.sin(toTray * Math.PI) * 80;
      return <RuleCard key={k} x={x} y={y} k={k} s={s} />;
    })}
    <Chip x={X3 + 340} y={Y3 + 410} s={pri} text={lines.rules} size={17} />

    {/* Bốn tầng rây theo thứ tự ưu tiên */}
    <g filter={SHADOW}>
      <rect x={TOWER_X - 160} y={Y3 + 120} width={14} height={480} fill="#8C7A5E" />
      <rect x={TOWER_X + 146} y={Y3 + 120} width={14} height={480} fill="#8C7A5E" />
    </g>
    {TRAYS.map((y, k) => {
      const lit = k === 1 && caught;
      const dx = k === 0 ? shake1 : 0;
      return <g key={k} transform={`translate(${dx} 0)`}>
        <path d={`M${TOWER_X - 146} ${y} L${TOWER_X + 146} ${y} L${TOWER_X + 120} ${y + 26} L${TOWER_X - 120} ${y + 26}Z`} fill={lit ? C.moss : "#B9AE98"} />
        {Array.from({ length: 11 }, (_, m) => <line key={m} x1={TOWER_X - 120 + m * 24} x2={TOWER_X - 120 + m * 24} y1={y + 4} y2={y + 24} stroke={lit ? "#2F7A52" : "#9C8E72"} strokeWidth={3} />)}
      </g>;
    })}
    {f >= T.drop - 2 && <Bundle x={TOWER_X} y={by} r={caught ? 0 : wobble(f, 6, 1.4)} />}
    {light > 0 && <g opacity={light}>
      <polygon points={`${TOWER_X + 120},${TRAYS[1] + 6} ${TOWER_X + 140},${TRAYS[1] + 24} ${TARGET.x + 90},${Y3 + 600} ${TARGET.x - 90},${Y3 + 600}`} fill={C.light} opacity={0.85} />
    </g>}
    <Warehouse x={TARGET.x - 80} y={Y3 + 600 - 250 * (160 / 300)} size={160} label={whName(3)}
      face={{ look: -1, worry: light < 0.5, blink: blink(f, 50, 3) }} alarm={light > 0 ? 0.6 + 0.4 * Math.sin(f * 0.5) : 0} />
    <Chip x={X3 + 760} y={Y3 + 64} s={hit} text={lines.verdict} bg={C.tie} color={C.white} size={22} />
  </g>;
}

/* ── Cảnh 4 (x + 1280, y 0) ── */
const X4 = 1280;
const LINE = [115, 305, 495, 685, 875].map(x => X4 + x);
const GUILTY = 3;
const WH = 182, WH_Y = 600 - 250 * (WH / 300);
const ROOF = { x: LINE[GUILTY], y: WH_Y + 64 * (WH / 300) };
const PAIR = { vinh: X4 + 1050, business: X4 + 1190 };

export function Scene4({ f }: { f: number }) {
  if (f < T.pan3 - 10) return null;
  const sweep = ramp(f, T.spot, T.lock, Easing.inOut(Easing.cubic));
  const lx = mix(LINE[0] - 120, LINE[GUILTY], sweep) + (f > T.lock && f < T.lock + 14 ? wobble(f, 10 * (1 - (f - T.lock) / 14), 1.6) : 0);
  const on = ramp(f, T.spot - 6, T.spot + 4);
  const locked = f >= T.lock;
  const env = ramp(f, T.env, T.envLand, Easing.in(Easing.quad));
  const bounce = f >= T.envLand ? Math.abs(Math.sin((f - T.envLand) * 0.5)) * 14 * Math.exp(-(f - T.envLand) / 6) : 0;
  const ex = mix(X4 - 120, ROOF.x, env), ey = mix(-80, ROOF.y - 24, env) - Math.sin(env * Math.PI) * 60 - bounce;
  const cheer = (f < T.cheer ? 0 : Math.min(pop(f, T.cheer, 180, 10), 1.1)) * (1 - ramp(f, T.wipe - 4, T.wipe + 8));
  const hop = cheer > 0.3 ? Math.abs(Math.sin((f - T.cheer) * 0.35)) * 10 * cheer : 0;
  const push = ramp(f, T.glint - 8, T.glint, Easing.out(Easing.back(1.5))) * (1 - ramp(f, T.glint + 10, T.glint + 18));
  const verdict = f < T.lock + 4 ? 0 : Math.min(pop(f, T.lock + 4, 220, 12), 1);
  return <g>
    {[0, 1, 2, 3, 4].map(k => <line key={k} x1={X4 + 40} x2={X4 + 1240} y1={300 + k * 60} y2={300 + k * 60} stroke="#D8D0BE" strokeWidth={3} />)}
    <rect x={X4} y={600} width={1280} height={140} fill={C.floor} />
    <rect x={X4} y={596} width={1280} height={6} fill={C.floorLine} />
    {on > 0 && <g opacity={on}>
      <polygon points={`${lx - 24},-20 ${lx + 24},-20 ${lx + 120},600 ${lx - 120},600`} fill={C.light} opacity={0.9} />
      <ellipse cx={lx} cy={604} rx={120} ry={18} fill={C.light} />
    </g>}
    {LINE.map((cx, k) => {
      const guilty = k === GUILTY;
      const cleared = locked && !guilty;
      const lift = cleared && cheer > 0.3 ? Math.abs(Math.sin((f - T.cheer) * 0.3 + k)) * 8 : 0;
      return <g key={k} transform={`translate(0 ${-lift})`}>
        <Warehouse x={cx - WH / 2} y={WH_Y} size={WH} label={whName(k)}
          alarm={locked && guilty ? 0.6 + 0.4 * Math.sin(f * 0.5) : 0}
          face={{ look: locked ? (guilty ? 0 : cx < LINE[GUILTY] ? 1 : -1) : wobble(f, 1, 0.2, k), worry: !cleared, happy: cleared, blink: blink(f, guilty ? 24 : 60, k * 9) }} />
      </g>;
    })}
    {f >= T.env && <Envelope x={ex} y={ey} s={0.62} r={(1 - env) * -40} />}
    <Chip x={LINE[GUILTY]} y={392} s={verdict} text={lines.verdict} bg={C.tie} color={C.white} size={20} />
    <ellipse cx={PAIR.vinh} cy={702} rx={46} ry={8} fill="#3B2F1E" opacity={0.1} />
    <ellipse cx={PAIR.business} cy={702} rx={46} ry={8} fill="#3B2F1E" opacity={0.1} />
    <Vinh x={PAIR.vinh} y={700} scale={0.95} pose={{
      look: -1, smile: locked ? 1 : 0.6, blink: blink(f, 80, 9), push, glint: ramp(f, T.glint - 4, T.glint + 6),
    }} filter={SHADOW} />
    <Person x={PAIR.business} y={700} scale={0.95} look={BUSINESS} pose={{
      handL: { x: mix(-52, -40, cheer), y: mix(-62, -268, cheer) }, handR: { x: mix(52, 40, cheer), y: mix(-62, -268, cheer) },
      lift: hop, look: -1, mouth: cheer > 0.3 ? "grin" : "smile", blink: blink(f, 70, 12),
    }} filter={SHADOW} />
  </g>;
}
