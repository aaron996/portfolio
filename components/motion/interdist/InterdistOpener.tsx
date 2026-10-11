/* Interdist — cảnh văn phòng (docs/case-motion.md): file rơi xuống bàn → nhân lên bay
   quanh đầu sếp → điện thoại hỏi → hai bản của cùng một file cho hai con số rồi đâm nhau →
   sếp choáng → đứng hình, cửa mở, Vinh bước vào → Vinh hỏi, sếp kể ba thứ cần biết →
   một tờ file phóng to phủ kín khung, thành nền giấy của cảnh xưởng. */

import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { caseStudies } from "../../../content/cases.vi";
import { Boss } from "../Boss";
import { Sheet } from "../Sheet";
import { Speech } from "../Speech";
import { Vinh } from "../Vinh";
import { blink, C, fonts, H, mix, mixColor, pop, ramp, W } from "../paper";

export const INTERDIST_OPENER_FRAMES = 372;
export const INTERDIST_OFFICE_FRAMES = 528;

export const lines = caseStudies.find(c => c.slug === "pg-sales-operations")!.motion!.lines;
export const FILES = [lines.file1, lines.file2, lines.file3, lines.file4, lines.file5, lines.file6];

export const T = {
  drop: 0, lift: 30, ring: 112, ask: 120, clash: 168, hit: 212, frenzy: 236, freeze: 290,
  door: 300, walk: 310, stop: 338, push: 340, glint: 348, end: INTERDIST_OPENER_FRAMES,
  question: 384, need: 446, snap: 486, cover: 500, office: INTERDIST_OFFICE_FRAMES,
};

export const BOSS = { x: 640, y: 470 };
/* Vòng nghiêng: phía sau bay trên đầu, phía trước bay ngang mép bàn — không che mặt sếp. */
const ORBIT = { x: 640, y: 300, rx: 350, ry: 170 };
const PILE = { x: 610, y: 436 };
export const SHADOW = "url(#cut)";

/* Góc quỹ đạo là tích phân của vận tốc theo khung, để lúc tăng tốc/đứng hình không giật. */
function orbitSpeed(f: number) {
  if (f < T.frenzy) return 0.014;
  if (f < T.freeze) return mix(0.014, 0.075, ramp(f, T.frenzy, T.freeze - 4, Easing.in(Easing.quad)));
  return 0.075 * (1 - ramp(f, T.freeze, T.door - 2, Easing.out(Easing.cubic)));
}
const ANGLE: number[] = [0];
export const CLOCK: number[] = [0];
for (let f = 1; f <= T.office + 1; f++) {
  ANGLE.push(ANGLE[f - 1] + orbitSpeed(f));
  CLOCK.push(CLOCK[f - 1] + (f < T.freeze ? mix(2, 32, ramp(f, T.frenzy - 20, T.freeze, Easing.in(Easing.quad))) : 0));
}

/** `calm` → đồng hồ đứng yên ở 8 giờ (cảnh sáng hôm sau). */
export function Room({ f, calm = false }: { f: number; calm?: boolean }) {
  const shake = f > T.frenzy && f < T.freeze ? Math.sin(f * 1.9) * 3 * ramp(f, T.frenzy, T.freeze) : 0;
  const minute = calm ? 0 : CLOCK[Math.min(f, CLOCK.length - 1)], hour = calm ? -60 : minute / 12;
  return <g>
    <rect width={W} height={H} fill={C.paper} />
    <rect y={560} width={W} height={H - 560} fill={C.floor} />
    <rect y={556} width={W} height={6} fill={C.floorLine} />

    <g transform="translate(-44 -14)">
    <g transform={`rotate(${shake} 210 170)`} filter={SHADOW}>
      <circle cx={210} cy={170} r={56} fill={C.white} />
      <path d="M210 170 L210 120 A50 50 0 0 0 185 126.7 Z" fill="#F2B8A8" />
      <circle cx={210} cy={170} r={56} fill="none" stroke={C.ink} strokeWidth={6} />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={210} y1={122} x2={210} y2={130} stroke={C.ink} strokeWidth={3} transform={`rotate(${i * 30} 210 170)`} />)}
      <line x1={210} y1={170} x2={210} y2={140} stroke={C.ink} strokeWidth={6} strokeLinecap="round" transform={`rotate(${hour + 300} 210 170)`} />
      <line x1={210} y1={170} x2={210} y2={128} stroke={C.tie} strokeWidth={4} strokeLinecap="round" transform={`rotate(${minute} 210 170)`} />
      <circle cx={210} cy={170} r={5} fill={C.ink} />
    </g>
    <text x={210} y={258} textAnchor="middle" fontFamily={fonts.mono} fontWeight={500} fontSize={17} fill={C.ink}>{lines.deadline}</text>
    </g>

    <g filter={SHADOW}>
      <path d="M96 470 Q70 400 104 360 Q116 420 112 470Z" fill={C.moss} />
      <path d="M112 470 Q120 380 160 350 Q156 430 124 470Z" fill="#2F7A52" />
      <path d="M104 470 Q60 440 54 400 Q96 418 116 470Z" fill={C.lime} />
      <path d="M84 470 L140 470 L132 560 L92 560Z" fill={C.tie} />
    </g>
  </g>;
}

export function Door({ f }: { f: number }) {
  const o = ramp(f, T.door, T.door + 18, Easing.out(Easing.back(1.4)));
  const jiggle = f > T.door - 8 && f < T.door ? Math.sin(f * 4) * 4 : 0;
  const hx = 1056, top = 256, bot = 562, wDoor = 138;
  const free = hx + wDoor * Math.cos(o * 1.35);
  const grow = o * 22;
  return <g>
    <rect x={1044} y={244} width={162} height={318} fill="#BFB29A" filter={SHADOW} />
    <rect x={hx} y={top} width={wDoor} height={bot - top} fill={o > 0 ? C.light : "#D8CCB2"} />
    <polygon points={`${hx},${top} ${free},${top - grow} ${free},${bot + grow} ${hx},${bot}`} fill="#D8C2A0" />
    <circle cx={free - 16 * Math.cos(o * 1.35) + (o > 0.5 ? -6 : 0)} cy={410 + jiggle * 0.3} r={7} fill={C.ink} transform={`rotate(${jiggle} ${free - 16} 410)`} />
  </g>;
}

function Light({ f }: { f: number }) {
  const o = ramp(f, T.door, T.door + 14);
  if (o <= 0) return null;
  return <polygon points="1056,562 1194,562 1040,720 760,720" fill={C.light} opacity={0.8 * o} />;
}

export function Desk({ f, mug = true }: { f: number; mug?: boolean }) {
  const ringing = f > T.ring && f < T.ring + 60 && (f - T.ring) % 20 < 13;
  const shake = ringing ? Math.sin(f * 2.6) * 9 : 0;
  const frenzy = f > T.frenzy && f < T.freeze ? Math.sin(f * 2.3) * 2 * ramp(f, T.frenzy, T.freeze) : 0;
  return <g>
    <g filter={SHADOW}>
      <rect x={350} y={466} width={580} height={22} rx={6} fill={C.wood} />
      <rect x={372} y={488} width={536} height={112} fill={C.woodDeep} />
      <rect x={392} y={508} width={150} height={10} rx={5} fill={C.wood} />
      <rect x={738} y={508} width={150} height={10} rx={5} fill={C.wood} />
    </g>
    <g transform={`rotate(${shake} 450 462)`} filter={SHADOW}>
      <path d="M408 466 L418 432 L482 432 L492 466Z" fill={C.navy} />
      <rect x={430} y={438} width={40} height={18} rx={4} fill={C.sheet} />
      <path d={`M404 ${424 - (ringing ? 7 : 0)} Q450 ${404 - (ringing ? 7 : 0)} 496 ${424 - (ringing ? 7 : 0)} L492 ${434 - (ringing ? 7 : 0)} Q450 ${420 - (ringing ? 7 : 0)} 408 ${434 - (ringing ? 7 : 0)}Z`} fill={C.navyDeep} />
    </g>
    {ringing && [0, 1].map(i => <g key={i} stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round">
      <path d={`M${386 - i * 14} ${410 - i * 6} Q${376 - i * 16} 430 ${386 - i * 14} ${450 + i * 6}`} />
      <path d={`M${514 + i * 14} ${410 - i * 6} Q${524 + i * 16} 430 ${514 + i * 14} ${450 + i * 6}`} />
    </g>)}
    {mug && <g transform={`translate(${frenzy} 0)`} filter={SHADOW}>
      <rect x={826} y={420} width={44} height={48} rx={8} fill={C.lime} />
      <path d="M870 432 Q890 434 888 448 Q886 460 870 458" fill="none" stroke={C.lime} strokeWidth={7} />
    </g>}
    {mug && [0, 1].map(i => {
      const t = ((f + i * 22) % 44) / 44;
      return <path key={i} d={`M${840 + i * 14} ${410 - t * 30} q6 -8 0 -16 q-6 -8 0 -16`} fill="none" stroke="#B9B2A2" strokeWidth={3} strokeLinecap="round" opacity={Math.sin(t * Math.PI) * 0.8} />;
    })}
  </g>;
}

/** `hold` ghi đè độ "ôm đầu" 0..1 (cảnh sáng hôm sau: hai tay gối sau đầu). */
export function Arms({ f, red, hold, x = BOSS.x }: { f: number; red: number; hold?: number; x?: number }) {
  const grab = hold ?? ramp(f, T.frenzy, T.frenzy + 14, Easing.out(Easing.back(1.6))) * (1 - ramp(f, T.door + 2, T.door + 16));
  const jitter = grab > 0 ? Math.sin(f * 2.1) * 4 * grab : 0;
  const skin = mixColor(C.skin, C.angry, red);
  return <g>
    {[-1, 1].map(s => {
      const sx = x + s * 96, sy = BOSS.y - 112;
      const hx = mix(x + s * 80, x + s * 66 + jitter, grab), hy = mix(BOSS.y + 6, BOSS.y - 214, grab);
      const ex = sx + s * mix(10, 46, grab), ey = mix(sy + 66, sy - 30, grab);
      return <g key={s}>
        <path d={`M${sx} ${sy} Q${ex} ${ey} ${hx} ${hy}`} stroke={C.navy} strokeWidth={28} strokeLinecap="round" fill="none" />
        <circle cx={hx} cy={hy} r={17} fill={skin} />
      </g>;
    })}
  </g>;
}

type Placed = { key: string; x: number; y: number; scale: number; rot: number; label?: string; front: boolean };

function orbitSheets(f: number): Placed[] {
  return FILES.map((label, i) => {
    const a = ANGLE[f] + (i * Math.PI * 2) / FILES.length + 0.6;
    const depth = Math.sin(a);
    const lean = ramp(f, T.door + 2, T.door + 16, Easing.out(Easing.back(2))) * 10;
    const bob = f > T.end ? Math.sin((f - T.end) * 0.08 + i * 1.3) * 5 * ramp(f, T.end, T.end + 20) : 0;
    const ox = ORBIT.x + ORBIT.rx * Math.cos(a), oy = ORBIT.y + ORBIT.ry * depth + bob;
    const os = 0.8 + 0.22 * depth;
    const orot = Math.sin(a * 2 + i) * 9 + (f > T.frenzy ? Math.sin(f * 0.9 + i) * 10 * ramp(f, T.frenzy, T.freeze) : 0) + lean;

    if (i === 0 && f < T.lift) {
      const fall = ramp(f, T.drop, T.drop + 14, Easing.in(Easing.quad));
      const squash = f > T.drop + 14 ? 1 - 0.14 * Math.sin(ramp(f, T.drop + 14, T.drop + 24) * Math.PI) : 1;
      return { key: label, x: PILE.x, y: mix(-140, PILE.y, fall), scale: 0.62 * squash, rot: mix(-30, -6, fall), label, front: true };
    }
    const at = T.lift + i * 10;
    const p = f < at ? 0 : pop(f, at, 150, 13);
    if (p <= 0) return { key: label, x: PILE.x, y: PILE.y, scale: i === 0 ? 0.62 : 0, rot: -6, front: true };
    return {
      key: label, x: mix(PILE.x, ox, p), y: mix(PILE.y, oy, p), scale: mix(0.62, os, Math.min(p, 1)),
      rot: mix(-6, orot, Math.min(p, 1)), label, front: p < 0.6 || depth > 0,
    };
  });
}

function ClashSheets({ f }: { f: number }) {
  if (f < T.clash || f > T.frenzy + 10) return null;
  const inA = pop(f, T.clash, 170, 14);
  const inB = f < T.clash + 12 ? 0 : pop(f, T.clash + 12, 120, 11); // Trùng: chậm nửa nhịp.
  const brace = ramp(f, T.hit - 16, T.hit - 6, Easing.out(Easing.quad));
  const rush = ramp(f, T.hit - 6, T.hit, Easing.in(Easing.cubic));
  const recoil = ramp(f, T.hit, T.hit + 12, Easing.out(Easing.back(2)));
  const leave = ramp(f, T.frenzy - 8, T.frenzy + 8, Easing.in(Easing.quad));
  const spread = 80 * inB + 30 * brace - 106 * rush + 104 * recoil;
  const y = mix(330, 220, leave), s = mix(1.55, 0.5, leave) * inA, o = 1 - leave;
  const tilt = 14 * recoil;
  return <g>
    <Sheet x={640 - Math.max(spread, 0) - 2} y={y} scale={s} rot={-4 - tilt - 6 * brace} number={lines.numberA} opacity={o} filter={SHADOW} />
    {inB > 0 && <Sheet x={640 + Math.max(spread, 0) + 2} y={y + 4} scale={s * Math.min(inB, 1.05)} rot={5 + tilt + 6 * brace} number={lines.numberB} peek blink={blink(f, 40, 9)} opacity={o} filter={SHADOW} />}
  </g>;
}

function Burst({ f }: { f: number }) {
  const t = ramp(f, T.hit, T.hit + 14, Easing.out(Easing.cubic));
  if (f < T.hit || t >= 1) return null;
  const pts = Array.from({ length: 16 }, (_, i) => {
    const r = i % 2 ? 34 : 92, a = (i / 16) * Math.PI * 2;
    return `${Math.cos(a) * r},${Math.sin(a) * r}`;
  }).join(" ");
  return <g transform={`translate(640 320) scale(${0.4 + t * 0.9}) rotate(${t * 20})`} opacity={1 - t}>
    <polygon points={pts} fill={C.lime} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
  </g>;
}

function Steam({ f }: { f: number }) {
  if (f < T.frenzy + 4 || f > T.door + 24) return null;
  return <g>{Array.from({ length: 9 }, (_, i) => {
    const born = T.frenzy + 4 + i * 6, t = (f - born) / 26;
    if (t < 0 || t > 1) return null;
    const side = i % 2 ? 1 : -1;
    return <circle key={i} cx={BOSS.x + side * (30 + t * 40)} cy={BOSS.y - 262 - t * 90} r={14 + t * 26} fill={C.white} stroke={C.floorLine} strokeWidth={4} opacity={(1 - t) * 0.95} />;
  })}</g>;
}

function Bubble({ f }: { f: number }) {
  const inn = f < T.ask ? 0 : pop(f, T.ask, 200, 12);
  const out = ramp(f, T.clash - 6, T.clash + 4, Easing.in(Easing.back(2)));
  const s = inn * (1 - out);
  if (s <= 0.01) return null;
  return <g transform={`translate(430 420) scale(${s}) translate(-430 -420)`}>
    <path d="M410 376 L436 420 L452 376Z" fill={C.white} />
    <rect x={238} y={312} width={344} height={68} rx={34} fill={C.white} />
    <text x={410} y={356} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={26} fill={C.ink}>{lines.ask}</text>
  </g>;
}

function Icon({ kind, x, y }: { kind: "pin" | "store" | "box"; x: number; y: number }) {
  const p = { fill: "none", stroke: C.moss, strokeWidth: 4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  return <g transform={`translate(${x} ${y})`}>
    {kind === "pin" && <><path d="M0 14 Q-13 0 -13 -6 A13 13 0 1 1 13 -6 Q13 0 0 14Z" {...p} /><circle cy={-6} r={4} fill={C.moss} /></>}
    {kind === "store" && <><path d="M-14 -4 L-14 13 L14 13 L14 -4" {...p} /><path d="M-17 -4 L-13 -14 L13 -14 L17 -4Z" {...p} fill={C.lime} /><path d="M-4 13 L-4 4 L4 4 L4 13" {...p} /></>}
    {kind === "box" && <><path d="M0 -14 L14 -7 L14 9 L0 16 L-14 9 L-14 -7Z" {...p} /><path d="M-14 -7 L0 0 L14 -7 M0 0 L0 16" {...p} /></>}
  </g>;
}

function Talk({ f }: { f: number }) {
  const chips: { kind: "pin" | "store" | "box"; label: string }[] = [
    { kind: "pin", label: lines.needRegion }, { kind: "store", label: lines.needStore }, { kind: "box", label: lines.needProduct },
  ];
  return <g>
    <Speech f={f} at={T.question} until={T.need} x={700} y={236} w={380} h={66} tail={[990, 340]}>
      <text x={890} y={278} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={25} fill={C.ink}>{lines.question}</text>
    </Speech>
    <Speech f={f} at={T.need} until={T.cover + 2} x={226} y={92} w={500} h={84} tail={[580, 214]}>
      {chips.map((c, i) => {
        const s = f < T.need + 6 + i * 7 ? 0 : pop(f, T.need + 6 + i * 7, 260, 11);
        const cx = [266, 386, 552][i];
        return <g key={c.kind} transform={`translate(${cx} 134) scale(${s}) translate(${-cx} -134)`}>
          <Icon kind={c.kind} x={cx} y={134} />
          <text x={cx + 24} y={142} fontFamily={fonts.sans} fontWeight={700} fontSize={21} fill={C.ink}>{c.label}</text>
        </g>;
      })}
    </Speech>
  </g>;
}

/* Tờ file phía trước nhất phóng to phủ kín khung → nền giấy của cảnh xưởng. */
const COVER_FROM = orbitSheets(T.cover).filter(s => s.front).sort((a, b) => b.scale - a.scale)[0];

function Cover({ f }: { f: number }) {
  if (f < T.cover) return null;
  const from = COVER_FROM;
  const t = ramp(f, T.cover, T.office - 4, Easing.inOut(Easing.cubic));
  const cw = mix(110 * from.scale, W * 1.2, t), ch = mix(140 * from.scale, H * 1.2, t);
  const cx = mix(from.x, 640, t), cy = mix(from.y, 360, t);
  const strip = 16 * from.scale * (1 - ramp(f, T.cover, T.cover + 12));
  return <g transform={`rotate(${from.rot * (1 - t)} ${cx} ${cy})`}>
    <rect x={cx - cw / 2} y={cy - ch / 2} width={cw} height={ch} rx={8 * (1 - t)} fill={C.sheet} />
    {strip > 0.5 && <rect x={cx - cw / 2} y={cy - ch / 2} width={cw} height={strip} fill={C.moss} />}
  </g>;
}

function bossPose(f: number) {
  const hop = f > T.ring && f < T.ring + 14 ? Math.sin(((f - T.ring) / 14) * Math.PI) * 16 : 0;
  const red = ramp(f, T.frenzy, T.freeze - 10) * (1 - 0.6 * ramp(f, T.door + 4, T.door + 40));
  const dizzy = f > T.frenzy + 20 && f < T.door + 6 ? 1 : 0;
  let look = 0, lookY = 0.3;
  if (f < T.lift) lookY = 1;
  else if (f < T.ring) { look = Math.cos(ANGLE[f] + 0.6) * 0.9; lookY = -0.4; }
  else if (f < T.clash) { look = -0.9; lookY = 0.6; }
  else if (f < T.hit - 16) look = f < T.clash + 16 ? -0.7 : 0.7;
  else if (f < T.hit) look = Math.sin(f * 1.1);
  if (f > T.door) { look = 1; lookY = 0; }
  // Gật đầu khi kể xong ba thứ cần biết.
  const nod = f > T.need + 30 && f < T.need + 48 ? Math.sin(((f - T.need - 30) / 18) * Math.PI * 2) * 3 : 0;
  return {
    red: red * (1 - ramp(f, T.end, T.need)), dizzy, spin: f * 16,
    lift: hop + (f > T.door ? 6 * ramp(f, T.door, T.door + 10) * (1 - ramp(f, T.end, T.end + 20)) : 0) - nod,
    tilt: f > T.frenzy && f < T.freeze ? Math.sin(f * 1.7) * 4 : 0,
    worry: Math.max(ramp(f, T.ring, T.ring + 8), ramp(f, T.lift + 20, T.ring) * 0.4) * (f > T.door + 10 ? 0.5 : 1),
    look, lookY,
    gasp: f >= T.hit && f < T.hit + 22 ? 1 - ramp(f, T.hit + 10, T.hit + 22)
      : f > T.door && f < T.end + 8 ? 0.5 * ramp(f, T.door, T.door + 8)
      : f > T.need && f < T.need + 28 ? 0.35 + Math.sin(f * 0.9) * 0.25 : 0,
    sweat: f > T.ring + 4 && f < T.ring + 40 ? (f - T.ring - 4) / 36 : f > T.door + 6 && f < T.door + 40 ? (f - T.door - 6) / 34 : 0,
    blink: blink(f, 70, 20),
  };
}

function vinhPose(f: number) {
  const walkT = ramp(f, T.walk, T.stop, Easing.out(Easing.quad));
  const settle = f > T.stop ? Math.sin((f - T.stop) * 0.55) * Math.exp(-(f - T.stop) / 7) : 0;
  const push = Math.max(
    ramp(f, T.push, T.push + 9, Easing.out(Easing.back(1.5))) * (1 - ramp(f, T.end - 12, T.end - 2)),
    ramp(f, T.snap - 8, T.snap, Easing.out(Easing.back(1.5))) * (1 - ramp(f, T.snap + 10, T.snap + 18)),
  );
  return {
    x: mix(1128, 1000, walkT), y: mix(574, 650, walkT), scale: mix(0.84, 1, walkT),
    pose: {
      walk: f * 0.5, walking: 1 - ramp(f, T.stop - 6, T.stop + 2),
      hair: -9 * settle - push * 3, push, look: -1,
      glint: f < T.end ? ramp(f, T.glint, T.glint + 10, Easing.inOut(Easing.quad)) : ramp(f, T.snap - 2, T.snap + 8, Easing.inOut(Easing.quad)),
      smile: mix(0.4, 1, ramp(f, T.glint, T.glint + 6)), blink: blink(f, 90, 50),
    },
  };
}

function camera(f: number) {
  const punch = f >= T.hit ? 0.05 * Math.exp(-(f - T.hit) / 5) : 0;
  const shake = f >= T.hit && f < T.hit + 10 ? Math.sin(f * 3.1) * 8 * (1 - (f - T.hit) / 10) : 0;
  const toDoor = ramp(f, T.door, T.door + 40, Easing.inOut(Easing.cubic)) * (1 - ramp(f, T.end, T.end + 34, Easing.inOut(Easing.cubic)));
  const s = 1 + 0.03 * ramp(f, 0, T.freeze) + punch + 0.05 * toDoor;
  const tx = -70 * toDoor + shake, ty = -10 * toDoor;
  return `translate(${640 + tx} ${360 + ty}) scale(${s}) translate(-640 -360)`;
}

export function InterdistOpener() {
  const f = useCurrentFrame();
  const sheets = orbitSheets(f);
  const pose = bossPose(f);
  const v = vinhPose(f);
  const vinhIn = f >= T.walk;

  return <AbsoluteFill style={{ background: C.paper }}>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <defs>
        <filter id="cut" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx={0} dy={4} stdDeviation={0} floodColor="#3B2F1E" floodOpacity={0.16} />
        </filter>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency={0.85} numOctaves={2} seed={4} />
          <feColorMatrix values="0 0 0 0 0.23  0 0 0 0 0.18  0 0 0 0 0.12  0 0 0 0.55 0" />
        </filter>
      </defs>
      <g transform={camera(f)}>
        <Room f={f} />
        <Door f={f} />
        <Light f={f} />
        {sheets.filter(s => !s.front).map(({ key, ...s }) => <Sheet key={key} {...s} filter={SHADOW} />)}
        <Boss x={BOSS.x} y={BOSS.y} pose={pose} filter={SHADOW} />
        <Steam f={f} />
        <Desk f={f} />
        <Arms f={f} red={pose.red} />
        {sheets.filter(s => s.front).map(({ key, ...s }) => <Sheet key={key} {...s} filter={SHADOW} />)}
        <ClashSheets f={f} />
        <Burst f={f} />
        <Bubble f={f} />
        <Talk f={f} />
        {vinhIn && <>
          <ellipse cx={v.x} cy={v.y + 2} rx={52 * v.scale} ry={9 * v.scale} fill="#3B2F1E" opacity={0.12} />
          <Vinh x={v.x} y={v.y} scale={v.scale} pose={v.pose} filter={SHADOW} />
        </>}
        <Cover f={f} />
      </g>
      <rect width={W} height={H} filter="url(#grain)" opacity={0.08} style={{ mixBlendMode: "multiply" }} />
    </svg>
  </AbsoluteFill>;
}
