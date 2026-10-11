/* Nhân vật Vinh, kiểu "giấy cắt" (duyệt 2026-10-11, docs/case-motion.md).
   Nhận diện bằng dáng: kính tròn viền đậm + tóc side-part mái phẩy kiểu Hàn (chân tóc phồng vừa,
   mái vuốt cong sang một bên, hai bên gọn), sơ mi trắng, quần đen.
   Gốc toạ độ ở giữa hai bàn chân. */

import { useId, type ReactNode } from "react";
import { C, reach } from "./paper";

export type VinhPose = {
  /** Pha bước chân (radian) và biên độ đi 0..1. */
  walk?: number;
  walking?: number;
  /** 0..1: tay trái đưa lên đẩy gọng kính. */
  push?: number;
  /** 0..1: vệt sáng chạy qua tròng kính; 0 hoặc 1 là không thấy. */
  glint?: number;
  /** Độ nghiêng mảng tóc (độ) — cho nảy trễ một nhịp sau đầu. */
  hair?: number;
  /** -1..1: mắt nhìn trái/phải. */
  look?: number;
  /** 0..1 nhắm mắt. */
  blink?: number;
  /** 0..1 cười tươi. */
  smile?: number;
  /** Đưa bàn tay phải/trái tới điểm này (toạ độ của Vinh) — chỉ, cầm kính lúp, đặt đồ.
   *  Tay có mục tiêu được vẽ đè lên thân. `handL` chỉ dùng khi không đẩy kính. */
  handR?: { x: number; y: number };
  handL?: { x: number; y: number };
  /** Nghiêng đầu (độ) — lắc đầu, gật đầu. Nhấc cả người (px). */
  tilt?: number;
  lift?: number;
};

const FACE = 44 / 38; // mặt vẽ theo toạ độ bản phác (đầu r=38 ở 80,84), phóng lên r=44.
const SHOULDER = { x: 31, y: -150 };
const HEAD_Y = -224;
const UPPER = 46, FORE = 48;
const SHIRT = "#FFFFFF", SHIRT_LINE = "#CFC6B2", SHIRT_SHADE = "#ECE8DE";
const PANTS = "#1E2125", SHOES = "#3A2A20";
const HAIR_LINE = "#4A3F38";

/* Tóc mái phẩy kiểu Hàn (Vinh chọn 2026-10-11), theo toạ độ bản phác. Ngôi rẽ ở x≈60 (bên
   trái người xem); mảng lớn dựng chân, chỉ phồng cao hơn đỉnh đầu khoảng 12 đơn vị (Vinh
   muốn phồng vừa phải), mái cong xuống chạm chân mày bên phải, đuôi móc vào trong. */
const HAIR_MASS = "M63 52 Q60 38 80 34.5 Q106 31 119 41 Q126 50 122 70 L121 87 L116 87 Q116 76 113 72 Q110 80 104 82 Q107 74 102 68 Q92 60 78 60 Q68 60 63 52Z";
const HAIR_STRANDS = "M67 47 Q76 37 100 36.5 M72 54 Q90 43 112 48 M84 58 Q100 58 108 72";
const SMALL_SIDE = "M60 50 Q48 50 44 62 Q41 74 42 88 L46 88 Q46 76 50 66 Q54 58 62 56Z";

/* Khuỷu luôn bẻ ra ngoài thân, dù tay đang buông hay đưa lên mặt. */
function elbow(side: 1 | -1, hand: { x: number; y: number }) {
  const sx = SHOULDER.x * side, sy = SHOULDER.y;
  const a = reach(sx, sy, hand.x, hand.y, UPPER, FORE, 1), b = reach(sx, sy, hand.x, hand.y, UPPER, FORE, -1);
  return { sx, sy, ...(a.ex * side > b.ex * side ? a : b) };
}

/* Buông tay thì cả cánh tay nằm sau thân áo — vai không bao giờ nhô khỏi đường vai.
   Chỉ khi đưa tay lên mặt (đẩy kính) cánh tay mới được vẽ đè lên trước. */
function Arm({ side, hand }: { side: 1 | -1; hand: { x: number; y: number } }) {
  const { sx, sy, ex, ey } = elbow(side, hand);
  const dx = hand.x - ex, dy = hand.y - ey, len = Math.hypot(dx, dy) || 1;
  const cx = ex + dx * 0.84, cy = ey + dy * 0.84, nx = (-dy / len) * 10, ny = (dx / len) * 10;
  const d = `M${sx} ${sy} L${ex} ${ey} L${hand.x} ${hand.y}`;
  return <g>
    <path d={d} stroke={SHIRT_LINE} strokeWidth={22} strokeLinejoin="round" strokeLinecap="round" fill="none" />
    <path d={d} stroke={SHIRT} strokeWidth={18} strokeLinejoin="round" strokeLinecap="round" fill="none" />
    <line x1={cx - nx} y1={cy - ny} x2={cx + nx} y2={cy + ny} stroke={SHIRT_LINE} strokeWidth={2} />
    <circle cx={hand.x} cy={hand.y} r={10.5} fill={C.skin} />
  </g>;
}

export function Vinh({ x, y, scale = 1, pose = {}, prop, filter }: {
  x: number; y: number; scale?: number; pose?: VinhPose;
  /** Vật cầm tay, vẽ trên cùng theo toạ độ của Vinh (vd kính lúp ở bàn tay phải). */
  prop?: ReactNode; filter?: string;
}) {
  const id = useId().replace(/:/g, "");
  const { walk = 0, walking = 0, push = 0, glint = 0, hair = 0, look = 0, blink = 0, smile = 0.4, handR, tilt = 0, lift = 0 } = pose;
  const swing = Math.sin(walk) * walking;
  const bob = -Math.abs(Math.sin(walk)) * 6 * walking - lift;

  const restL = { x: -52 - swing * 14, y: -62 };
  const restR = { x: 52 - swing * 14, y: -62 };
  // Ngón tay chạm sống mũi kính.
  const bridge = { x: -2, y: HEAD_Y + 4 * FACE };
  const raised = push > 0.05 || Boolean(pose.handL);
  const fromL = pose.handL ?? restL;
  const handL = { x: fromL.x + (bridge.x - fromL.x) * push, y: fromL.y + (bridge.y - fromL.y) * push };

  const eyeX = look * 3;
  const eyeRy = 3 * (1 - blink * 0.9);
  const mouth = 108 + smile * 1;

  return <g transform={`translate(${x} ${y}) scale(${scale})`} filter={filter}>
    <g transform={`translate(0 ${bob})`}>
      {[-1, 1].map(s => <g key={s} transform={`rotate(${swing * 20 * s} ${s * 14} -70)`}>
        <rect x={s * 14 - 11} y={-74} width={22} height={68} rx={9} fill={PANTS} />
        <ellipse cx={s * 14 + s * 4} cy={-5} rx={17} ry={8} fill={SHOES} />
      </g>)}
      <rect x={-40} y={-80} width={80} height={22} rx={8} fill={PANTS} />

      {!handR && <Arm side={1} hand={restR} />}
      {!raised && <Arm side={-1} hand={handL} />}

      <path d="M-45 -68 Q-49 -138 -41 -154 Q-30 -167 0 -168 Q30 -167 41 -154 Q49 -138 45 -68 Z" fill={SHIRT} stroke={SHIRT_LINE} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M24 -160 Q42 -142 43 -70 L31 -70 Q33 -132 20 -158Z" fill={SHIRT_SHADE} />
      <rect x={-40} y={-80} width={80} height={10} rx={3} fill={PANTS} />
      <rect x={-7} y={-80} width={14} height={10} rx={2} fill="#8A857B" />
      <line x1={0} y1={-152} x2={0} y2={-82} stroke={SHIRT_LINE} strokeWidth={2} />
      {[-138, -118, -98].map(by => <circle key={by} cx={4} cy={by} r={2} fill={SHIRT_LINE} />)}

      <rect x={-10} y={-182} width={20} height={20} fill={C.skinShade} />
      <path d="M-11 -164 L0 -150 L11 -164Z" fill={C.skinShade} />
      <path d="M-13 -168 L-1 -149 L-21 -150 L-19 -165Z" fill={SHIRT} stroke={SHIRT_LINE} strokeWidth={2} strokeLinejoin="round" />
      <path d="M13 -168 L1 -149 L21 -150 L19 -165Z" fill={SHIRT} stroke={SHIRT_LINE} strokeWidth={2} strokeLinejoin="round" />

      <g transform={`rotate(${tilt} 0 -182)`}>
      <g transform={`translate(0 ${HEAD_Y}) scale(${FACE}) translate(-80 -84)`}>
        <defs>
          <clipPath id={`lens${id}`}>
            <circle cx={66} cy={90} r={10.5} />
            <circle cx={94} cy={90} r={10.5} />
          </clipPath>
        </defs>
        <circle cx={43} cy={90} r={7} fill={C.skin} />
        <circle cx={117} cy={90} r={7} fill={C.skin} />
        <circle cx={80} cy={84} r={38} fill={C.skin} />
        <path d={SMALL_SIDE} fill={C.hair} />
        <g transform={`rotate(${hair} 64 52)`}>
          <path d={HAIR_MASS} fill={C.hair} />
          <path d={HAIR_STRANDS} fill="none" stroke={HAIR_LINE} strokeWidth={2.2} strokeLinecap="round" />
        </g>
        <line x1={54} y1={88} x2={45} y2={86} stroke={C.ink} strokeWidth={2.5} />
        <line x1={106} y1={88} x2={115} y2={86} stroke={C.ink} strokeWidth={2.5} />
        <circle cx={66} cy={90} r={12} fill={C.white} fillOpacity={0.4} />
        <circle cx={94} cy={90} r={12} fill={C.white} fillOpacity={0.4} />
        <ellipse cx={66 + eyeX} cy={91} rx={3} ry={eyeRy} fill={C.ink} />
        <ellipse cx={94 + eyeX} cy={91} rx={3} ry={eyeRy} fill={C.ink} />
        {glint > 0 && glint < 1 && <g clipPath={`url(#lens${id})`}>
          <polygon points="0,0 10,0 -6,30 -16,30" transform={`translate(${44 + glint * 70} 75)`} fill={C.white} opacity={0.95} />
        </g>}
        <circle cx={66} cy={90} r={12} fill="none" stroke={C.ink} strokeWidth={3} />
        <circle cx={94} cy={90} r={12} fill="none" stroke={C.ink} strokeWidth={3} />
        <path d="M78 88 Q80 85 82 88" stroke={C.ink} strokeWidth={2.5} fill="none" />
        <ellipse cx={55} cy={105} rx={5} ry={3} fill={C.blush} fillOpacity={0.6} />
        <ellipse cx={105} cy={105} rx={5} ry={3} fill={C.blush} fillOpacity={0.6} />
        <path d={`M72 ${mouth - 2} Q80 ${mouth + 4 + smile * 6} 88 ${mouth - 2}`} stroke={C.ink} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      </g>
      </g>

      {raised && <Arm side={-1} hand={handL} />}
      {handR && <Arm side={1} hand={handR} />}
      {prop}
    </g>
  </g>;
}
