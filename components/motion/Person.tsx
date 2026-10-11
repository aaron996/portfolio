/* Nhân vật phụ kiểu giấy cắt, cùng khung với Vinh (docs/case-motion.md): nhân viên vận hành,
   quản lý, lãnh đạo, bưu tá, người mua, đối tác… Đổi tóc, áo (polo, sơ mi, áo khoác), logo ngực,
   dây đeo thẻ, cà vạt, dải phản quang, mũ bảo hiểm để phân biệt.
   Gốc toạ độ ở giữa hai bàn chân; mặt vẽ theo toạ độ bản phác (đầu r=38 ở 80,84). */

import type { ReactNode } from "react";
import { C, fonts, reach } from "./paper";

export type Hair = "short" | "bob" | "bun" | "ponytail" | "helmet" | "cap" | "curly" | "grey";
export type Mouth = "smile" | "flat" | "open" | "sad" | "grin";

export type Look = {
  hair?: Hair;
  hairColor?: string;
  /** Màu mũ bảo hiểm / mũ lưỡi trai, và chữ in trên mũ. */
  hatColor?: string;
  hatLogo?: string;
  skin?: string;
  top?: string;
  /** "tee" cổ tròn, "polo" cổ bẻ có nẹp, "shirt" sơ mi, "jacket" áo khoác mở ngoài áo trong. */
  collar?: "tee" | "polo" | "shirt" | "jacket";
  inner?: string;
  /** Màu viền cổ và cổ tay áo (polo hai màu). */
  trim?: string;
  bottom?: string;
  shoes?: string;
  glasses?: "round" | "square";
  /** Thẻ tên đeo ngực (chữ lấy từ content). */
  badge?: string;
  /** Logo in ngực trái (chữ lấy từ content); `center` in to giữa ngực (chữ dài như "Shopee"). */
  logo?: { text: string; color: string; bg?: string; center?: boolean };
  /** Dây đeo thẻ nhân viên: màu dây. */
  lanyard?: string;
  tie?: string;
  /** Dải phản quang ngang thân (áo bưu tá). */
  stripes?: string;
};

export type Pose = {
  walk?: number;
  walking?: number;
  /** Mục tiêu bàn tay trái/phải (toạ độ của nhân vật). Bỏ trống = buông tay. */
  handL?: { x: number; y: number };
  handR?: { x: number; y: number };
  /** Vẽ đè tay lên thân (khi tay đưa ra trước). */
  armsFront?: boolean;
  /** Nghiêng đầu (độ) và nhấc người (px). */
  tilt?: number;
  lift?: number;
  look?: number;
  blink?: number;
  mouth?: Mouth;
  /** 0..1 lông mày nhíu. */
  worry?: number;
  /** 0..1 mắt lờ đờ buồn ngủ. */
  sleepy?: number;
};

const FACE = 44 / 38;
const HEAD_Y = -224;
const SHOULDER = { x: 31, y: -150 };
const UPPER = 46, FORE = 48;
const LIGHT = new Set(["#FFFFFF", "#FBFAF6", "#F3F1EA", "#F6F4EE"]);

function elbow(side: 1 | -1, hand: { x: number; y: number }) {
  const sx = SHOULDER.x * side, sy = SHOULDER.y;
  const a = reach(sx, sy, hand.x, hand.y, UPPER, FORE, 1), b = reach(sx, sy, hand.x, hand.y, UPPER, FORE, -1);
  return { sx, sy, ...(a.ex * side > b.ex * side ? a : b) };
}

function Arm({ side, hand, sleeve, skin, outline, cuff }: { side: 1 | -1; hand: { x: number; y: number }; sleeve: string; skin: string; outline?: string; cuff?: string }) {
  const { sx, sy, ex, ey } = elbow(side, hand);
  const d = `M${sx} ${sy} L${ex} ${ey} L${hand.x} ${hand.y}`;
  const dx = hand.x - ex, dy = hand.y - ey, len = Math.hypot(dx, dy) || 1;
  const cx = ex + dx * 0.8, cy = ey + dy * 0.8, nx = (-dy / len) * 10, ny = (dx / len) * 10;
  return <g>
    {outline && <path d={d} stroke={outline} strokeWidth={22} strokeLinejoin="round" strokeLinecap="round" fill="none" />}
    <path d={d} stroke={sleeve} strokeWidth={18} strokeLinejoin="round" strokeLinecap="round" fill="none" />
    {cuff && <line x1={cx - nx} y1={cy - ny} x2={cx + nx} y2={cy + ny} stroke={cuff} strokeWidth={5} strokeLinecap="round" />}
    <circle cx={hand.x} cy={hand.y} r={10.5} fill={skin} />
  </g>;
}

function HairBack({ hair, color }: { hair: Hair; color: string }) {
  if (hair === "bob") return <path d="M37 108 Q33 42 80 39 Q127 42 123 108 L108 108 L52 108Z" fill={color} />;
  if (hair === "ponytail") return <path d="M112 62 Q140 70 134 112 Q128 96 116 88Z" fill={color} />;
  if (hair === "bun") return <circle cx={80} cy={34} r={13} fill={color} />;
  return null;
}

/* Mũ bảo hiểm nửa đầu kiểu Việt Nam: vỏ tròn to hơn đầu, lưỡi trai ngắn trên trán, quai cài cằm. */
function Helmet({ color, logo }: { color: string; logo?: string }) {
  return <g>
    <path d="M44 92 L70 124 M116 92 L90 124" stroke="#3A3F48" strokeWidth={4} strokeLinecap="round" />
    <rect x={74} y={120} width={12} height={8} rx={2} fill="#3A3F48" />
    <path d="M33 92 Q30 32 80 28 Q130 32 127 92 L117 94 Q116 72 102 66 Q80 60 58 66 Q44 72 43 94Z" fill={color} />
    <path d="M58 66 Q80 60 102 66" fill="none" stroke="#00000030" strokeWidth={4} />
    <path d="M50 70 Q80 58 110 70 L114 79 Q80 68 46 79Z" fill="#00000038" />
    <path d="M56 38 Q80 30 104 38" fill="none" stroke="#FFFFFF55" strokeWidth={5} strokeLinecap="round" />
    {logo && <text x={80} y={56} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={13} fill={C.white}>{logo}</text>}
  </g>;
}

function HairFront({ hair, color, hat, hatLogo }: { hair: Hair; color: string; hat: string; hatLogo?: string }) {
  switch (hair) {
    case "bob":
      return <path d="M41 84 Q38 44 80 40 Q122 44 119 84 Q112 62 96 58 Q84 66 66 60 Q50 64 41 84Z" fill={color} />;
    case "curly":
      return <g fill={color}>{[[50, 62], [60, 50], [74, 44], [88, 44], [102, 50], [112, 62], [46, 76], [116, 76]].map(([x, y], i) =>
        <circle key={i} cx={x} cy={y} r={12} />)}</g>;
    case "grey":
      return <g fill="#8A857B"><ellipse cx={46} cy={70} rx={8} ry={13} /><ellipse cx={114} cy={70} rx={8} ry={13} /></g>;
    case "helmet":
      return <Helmet color={hat} logo={hatLogo} />;
    case "cap":
      return <g>
        <path d="M40 74 Q40 38 80 36 Q120 38 120 74Z" fill={hat} />
        <path d="M40 72 Q20 74 14 82 L56 80Z" fill={hat} />
        {hatLogo && <text x={80} y={62} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={12} fill={C.white}>{hatLogo}</text>}
      </g>;
    default:
      return <path d="M42 82 Q38 44 80 40 Q122 44 118 82 Q114 62 98 57 Q80 52 62 57 Q47 62 42 82Z" fill={color} />;
  }
}

function MouthShape({ mouth }: { mouth: Mouth }) {
  const ink = { stroke: C.ink, strokeWidth: 2.5, fill: "none", strokeLinecap: "round" as const };
  switch (mouth) {
    case "flat": return <path d="M73 108 L87 108" {...ink} />;
    case "sad": return <path d="M72 111 Q80 104 88 111" {...ink} />;
    case "open": return <ellipse cx={80} cy={109} rx={6} ry={7} fill="#5A2A22" />;
    case "grin": return <path d="M70 105 Q80 118 90 105Z" fill="#5A2A22" stroke="#5A2A22" strokeWidth={2} strokeLinejoin="round" />;
    default: return <path d="M72 106 Q80 113 88 106" {...ink} />;
  }
}

/** Cổ áo và chi tiết ngực (logo, nẹp, dây thẻ, cà vạt, phản quang), theo toạ độ thân. */
function Front({ look, outline }: { look: Look; outline?: string }) {
  const { collar = "tee", top = "#5B7FA6", inner = "#F3F1EA", trim, logo, lanyard, tie, stripes, badge } = look;
  const edge = trim ?? "#00000033";
  return <g>
    {stripes && [-112, -96].map(y => <rect key={y} x={-44} y={y} width={88} height={8} fill={stripes} opacity={0.9} />)}
    {collar === "jacket" && <path d="M-16 -166 L0 -132 L16 -166 L12 -70 L-12 -70Z" fill={inner} />}
    {collar === "jacket" && <line x1={0} y1={-132} x2={0} y2={-72} stroke="#00000022" strokeWidth={2} />}
    <rect x={-10} y={-182} width={20} height={20} fill={C.skinShade} />
    {collar === "tee" && <path d="M-14 -167 Q0 -152 14 -167Z" fill={C.skinShade} />}
    {collar === "polo" && <>
      <path d="M-10 -165 L0 -148 L10 -165Z" fill={C.skinShade} />
      <line x1={0} y1={-148} x2={0} y2={-126} stroke={edge} strokeWidth={2.5} />
      {[-142, -132].map(y => <circle key={y} cx={2.5} cy={y} r={2} fill={edge} />)}
      <path d="M-14 -170 L-2 -150 L-24 -152 L-22 -166Z" fill={trim ?? top} stroke={outline ?? "#00000026"} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M14 -170 L2 -150 L24 -152 L22 -166Z" fill={trim ?? top} stroke={outline ?? "#00000026"} strokeWidth={1.5} strokeLinejoin="round" />
    </>}
    {collar === "shirt" && <>
      <path d="M-11 -164 L0 -150 L11 -164Z" fill={C.skinShade} />
      {tie && <>
        <path d="M-6 -152 L6 -152 L4 -144 L-4 -144Z" fill={tie} />
        <path d="M-4 -144 L4 -144 L8 -104 L0 -94 L-8 -104Z" fill={tie} />
      </>}
      <path d="M-13 -168 L-1 -149 L-21 -150 L-19 -165Z" fill={top} stroke={outline ?? "#00000033"} strokeWidth={1.5} />
      <path d="M13 -168 L1 -149 L21 -150 L19 -165Z" fill={top} stroke={outline ?? "#00000033"} strokeWidth={1.5} />
    </>}
    {collar === "jacket" && tie && <>
      <path d="M-5 -158 L5 -158 L3 -150 L-3 -150Z" fill={tie} />
      <path d="M-3 -150 L3 -150 L6 -112 L0 -104 L-6 -112Z" fill={tie} />
    </>}
    {lanyard && <>
      <path d="M-12 -166 L-2 -118 M12 -166 L2 -118" stroke={lanyard} strokeWidth={4} strokeLinecap="round" />
      <rect x={-11} y={-120} width={22} height={28} rx={3} fill={C.white} stroke="#00000022" strokeWidth={1.5} />
      <rect x={-11} y={-120} width={22} height={8} rx={3} fill={lanyard} />
    </>}
    {logo && <g transform={logo.center ? "translate(0 -116)" : `translate(${collar === "jacket" ? 29 : 20} -132)`}>
      {logo.bg && <rect x={-15} y={-9} width={30} height={16} rx={3} fill={logo.bg} />}
      <text x={0} y={logo.center ? 5 : 4} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={logo.center ? 15 : 11} fill={logo.color}>{logo.text}</text>
    </g>}
    {badge && <g transform="translate(22 -132)">
      <rect x={-15} y={-9} width={30} height={18} rx={3} fill={C.white} />
      <text x={0} y={4} textAnchor="middle" fontSize={9} fontWeight={700} fill={C.ink} fontFamily={fonts.mono}>{badge}</text>
    </g>}
  </g>;
}

export function Person({ x, y, scale = 1, look = {}, pose = {}, prop, filter }: {
  x: number; y: number; scale?: number; look?: Look; pose?: Pose;
  /** Vật cầm tay, vẽ ở toạ độ của nhân vật (vd tờ giấy ở giữa hai bàn tay). */
  prop?: ReactNode; filter?: string;
}) {
  const { hair = "short", hairColor = "#2A2420", hatColor = C.tie, hatLogo, skin = C.skin, top = "#5B7FA6", trim, bottom = "#2E3440", shoes = C.ink, glasses } = look;
  const { walk = 0, walking = 0, handL, handR, armsFront, tilt = 0, lift = 0, look: eye = 0, blink = 0, mouth = "smile", worry = 0, sleepy = 0 } = pose;
  const swing = Math.sin(walk) * walking;
  const bob = -Math.abs(Math.sin(walk)) * 6 * walking - lift;
  const restL = { x: -52 - swing * 14, y: -62 };
  const restR = { x: 52 - swing * 14, y: -62 };
  const hl = handL ?? restL, hr = handR ?? restR;
  const outline = LIGHT.has(top) ? "#CFC6B2" : undefined;
  const lid = Math.max(blink, sleepy * 0.75);
  const arms = <>
    <Arm side={1} hand={hr} sleeve={top} skin={skin} outline={outline} cuff={trim} />
    <Arm side={-1} hand={hl} sleeve={top} skin={skin} outline={outline} cuff={trim} />
  </>;

  return <g transform={`translate(${x} ${y}) scale(${scale})`} filter={filter}>
    <g transform={`translate(0 ${bob})`}>
      {[-1, 1].map(s => <g key={s} transform={`rotate(${swing * 20 * s} ${s * 14} -70)`}>
        <rect x={s * 14 - 11} y={-74} width={22} height={68} rx={9} fill={bottom} />
        <ellipse cx={s * 14 + s * 4} cy={-5} rx={17} ry={8} fill={shoes} />
      </g>)}
      <rect x={-40} y={-80} width={80} height={22} rx={8} fill={bottom} />
      {!armsFront && arms}
      <path d="M-45 -68 Q-49 -138 -41 -154 Q-30 -167 0 -168 Q30 -167 41 -154 Q49 -138 45 -68 Z" fill={top} stroke={outline} strokeWidth={outline ? 2.5 : 0} />
      <Front look={look} outline={outline} />

      <g transform={`rotate(${tilt} 0 -182)`}>
        <g transform={`translate(0 ${HEAD_Y}) scale(${FACE}) translate(-80 -84)`}>
          <HairBack hair={hair} color={hairColor} />
          <circle cx={43} cy={90} r={7} fill={skin} />
          <circle cx={117} cy={90} r={7} fill={skin} />
          <circle cx={80} cy={84} r={38} fill={skin} />
          {hair !== "helmet" && <HairFront hair={hair} color={hairColor} hat={hatColor} hatLogo={hatLogo} />}
          {worry > 0 && <g stroke={C.ink} strokeWidth={3} strokeLinecap="round">
            <line x1={58} y1={76 + worry * 3} x2={72} y2={74 - worry * 2} />
            <line x1={88} y1={74 - worry * 2} x2={102} y2={76 + worry * 3} />
          </g>}
          <ellipse cx={66 + eye * 3} cy={91} rx={3.2} ry={3.2 * (1 - lid * 0.9)} fill={C.ink} />
          <ellipse cx={94 + eye * 3} cy={91} rx={3.2} ry={3.2 * (1 - lid * 0.9)} fill={C.ink} />
          {sleepy > 0.3 && <g stroke={C.ink} strokeWidth={2} strokeLinecap="round"><line x1={60} y1={88} x2={72} y2={88} /><line x1={88} y1={88} x2={100} y2={88} /></g>}
          {glasses && <g fill="none" stroke={C.ink} strokeWidth={3}>
            {glasses === "round"
              ? <><circle cx={66} cy={90} r={11} /><circle cx={94} cy={90} r={11} /></>
              : <><rect x={55} y={82} width={22} height={16} rx={3} /><rect x={83} y={82} width={22} height={16} rx={3} /></>}
            <path d="M77 89 L83 89" />
          </g>}
          <ellipse cx={55} cy={104} rx={5} ry={3} fill={C.blush} fillOpacity={0.5} />
          <ellipse cx={105} cy={104} rx={5} ry={3} fill={C.blush} fillOpacity={0.5} />
          <MouthShape mouth={mouth} />
          {hair === "helmet" && <HairFront hair={hair} color={hairColor} hat={hatColor} hatLogo={hatLogo} />}
        </g>
      </g>
      {armsFront && arms}
      {prop}
    </g>
  </g>;
}
