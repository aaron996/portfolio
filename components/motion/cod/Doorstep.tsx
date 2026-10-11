/* Rà soát COD — cảnh 1 (docs/case-motion.md). Trước cửa nhà: bưu tá GHN giao hàng, người mua trả
   tiền mặt, tiền vào túi bưu tá. Ứng dụng báo "Giao thành công" — nhưng tiền bị giữ lại mấy ngày mà
   hệ thống không thấy. Một tờ giấy trượt từ phải sang để sang cảnh cỗ máy AI. */

import { Easing, useCurrentFrame } from "remotion";
import { Person } from "../Person";
import { Stage } from "../Stage";
import { blink, C, fonts, mix, pop, ramp } from "../paper";
import { BUYER, lines, SHIPPER } from "./cast";

export const DOORSTEP_FRAMES = 210;
export const T = { arrive: 38, give: 40, pay: 60, cash: 74, banked: 90, status: 98, days: 118, held: 140, slide: 182, end: DOORSTEP_FRAMES };
const SHADOW = "url(#cut)";
const BUYER_X = 340, SHIPPER_X = 640;
const BAG = { x: SHIPPER_X + 36, y: 690 - 92 * 0.95 };

export function Box({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`} filter={SHADOW}>
    <rect x={-32} y={-26} width={64} height={52} rx={4} fill={C.wood} />
    <rect x={-6} y={-26} width={12} height={52} fill={C.woodDeep} />
  </g>;
}

export function Bill({ x, y, s = 1, r = 0 }: { x: number; y: number; s?: number; r?: number }) {
  return <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter={SHADOW}>
    <rect x={-30} y={-16} width={60} height={32} rx={3} fill="#8DBF7A" />
    <rect x={-24} y={-11} width={48} height={22} rx={2} fill="none" stroke="#5E9A4B" strokeWidth={2} />
    <text x={0} y={7} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={18} fill="#2F6B2A">{lines.currency}</text>
  </g>;
}

function Street() {
  return <g>
    <rect x={0} y={0} width={1280} height={720} fill="#E4EEEA" />
    {[[640, 470, 150, 130], [800, 430, 120, 170], [930, 490, 170, 110], [1110, 450, 140, 150], [1230, 500, 120, 100]].map(([x, y, w, h], i) =>
      <rect key={i} x={x} y={y} width={w} height={h} fill="#D2DFDA" />)}
    <rect x={0} y={0} width={560} height={600} fill="#E9DFC9" filter={SHADOW} />
    <rect x={60} y={340} width={130} height={120} rx={6} fill="#B9AE98" />
    <rect x={70} y={350} width={110} height={100} fill="#CFE0DA" />
    <line x1={125} x2={125} y1={350} y2={450} stroke="#B9AE98" strokeWidth={6} />
    <rect x={262} y={300} width={156} height={300} fill="#8C7A5E" />
    <rect x={274} y={312} width={132} height={288} fill={C.woodDeep} />
    <circle cx={392} cy={460} r={7} fill="#E8B84A" />
    <rect x={300} y={268} width={80} height={24} rx={4} fill="#B9AE98" />
    <rect x={250} y={592} width={180} height={12} rx={4} fill="#9C8E72" />
    <rect x={0} y={600} width={1280} height={120} fill={C.floor} />
    <rect x={0} y={596} width={1280} height={6} fill={C.floorLine} />
  </g>;
}

/* Lịch nhỏ cạnh túi tiền: lật ngày 1 → 2 → 3 — tiền nằm trong túi mấy ngày. */
function Days({ f }: { f: number }) {
  const s = f < T.days ? 0 : Math.min(pop(f, T.days, 220, 12), 1);
  if (s <= 0.01) return null;
  const day = 1 + Math.min(2, Math.floor((f - T.days) / 14));
  const flip = ((f - T.days) % 14) / 14;
  return <g transform={`translate(${BAG.x + 92} ${BAG.y - 30}) scale(${s})`} filter={SHADOW}>
    <rect x={-30} y={-30} width={60} height={62} rx={8} fill={C.white} />
    <rect x={-30} y={-30} width={60} height={16} rx={8} fill={C.tie} />
    <text x={0} y={22} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={30} fill={C.ink}>{day}</text>
    {day < 3 && flip > 0.7 && <rect x={-30} y={-14} width={60} height={46 * (1 - (flip - 0.7) / 0.3)} fill="#EFEBE2" />}
  </g>;
}

export function Doorstep() {
  const f = useCurrentFrame();
  const walk = ramp(f, 0, T.arrive, Easing.out(Easing.quad));
  const shipperX = mix(1420, SHIPPER_X, walk);
  const give = ramp(f, T.give, T.give + 14, Easing.inOut(Easing.quad));
  const boxAt = { x: mix(shipperX, BUYER_X + 40, give), y: 690 - 0.95 * 122 - Math.sin(give * Math.PI) * 30 };
  const paying = f >= T.pay && f < T.cash + 4;
  const cash = ramp(f, T.cash, T.banked, Easing.inOut(Easing.quad));
  const status = f < T.status ? 0 : Math.min(pop(f, T.status, 220, 12), 1);
  const held = f < T.held ? 0 : Math.min(pop(f, T.held, 200, 12), 1);
  const glow = f > T.days ? 0.5 + 0.5 * Math.sin(f * 0.4) : 0;
  const slide = ramp(f, T.slide, T.end, Easing.inOut(Easing.cubic));

  return <Stage>
    <Street />
    <Person x={BUYER_X} y={690} scale={0.95} look={BUYER} pose={{
      handL: give >= 1 ? { x: 44, y: -112 } : undefined,
      handR: paying ? { x: 62, y: -150 } : give >= 1 ? { x: 72, y: -114 } : undefined, armsFront: give >= 1,
      look: 1, mouth: f > T.cash ? "grin" : "smile", blink: blink(f, 70, 9),
    }} prop={paying && cash <= 0 ? <Bill x={70} y={-160} s={0.9} r={-8} /> : undefined} filter={SHADOW} />
    {glow > 0 && <circle cx={BAG.x} cy={BAG.y} r={34 + glow * 8} fill={C.tie} opacity={0.15 + glow * 0.1} />}
    <Person x={shipperX} y={690} scale={0.95} look={SHIPPER} pose={{
      walk: f * 0.5, walking: 1 - ramp(f, T.arrive - 6, T.arrive + 2),
      handL: give < 1 ? { x: -30, y: -122 } : undefined, handR: give < 1 ? { x: 30, y: -122 } : f > T.status - 6 ? { x: 40, y: -170 } : undefined, armsFront: true,
      look: f > T.status ? 1 : -1, mouth: f > T.cash ? "grin" : "smile", blink: blink(f, 80, 30),
    }} prop={<>
      <g transform="translate(36 -92)" filter={SHADOW}>
        <path d="M-58 -70 L-6 -6" stroke="#3A3F48" strokeWidth={5} />
        <rect x={-14} y={-14} width={34} height={30} rx={6} fill="#3A3F48" />
        {f > T.days && <g transform="translate(3 1)"><rect x={-6} y={-2} width={12} height={10} rx={2} fill="#E8B84A" /><path d="M-4 -2 V-6 A4 4 0 0 1 4 -6 V-2" fill="none" stroke="#E8B84A" strokeWidth={2.5} /></g>}
      </g>
      {f > T.status - 6 && <rect x={28} y={-196} width={24} height={40} rx={5} fill="#2B2F36" />}
    </>} filter={SHADOW} />
    {give < 1 && f < T.give
      ? <Box x={shipperX} y={boxAt.y} s={0.95} />
      : <Box x={boxAt.x} y={boxAt.y} s={0.95} />}
    {cash > 0 && cash < 1 && <Bill x={mix(BUYER_X + 66, BAG.x, cash)} y={mix(690 - 152, BAG.y, cash) - Math.sin(cash * Math.PI) * 70} s={mix(0.9, 0.5, cash)} r={cash * 360} />}

    {status > 0 && <g transform={`translate(${SHIPPER_X + 150} 360) scale(${status})`} filter={SHADOW}>
      <path d="M-60 26 L-96 70 L-30 30Z" fill={C.white} />
      <rect x={-130} y={-30} width={260} height={60} rx={30} fill={C.white} />
      <circle cx={-96} cy={0} r={16} fill={C.moss} />
      <path d="M-103 0 L-98 6 L-88 -6" stroke={C.white} strokeWidth={4} fill="none" strokeLinecap="round" />
      <text x={-70} y={8} fontFamily={fonts.sans} fontWeight={700} fontSize={22} fill={C.moss}>{lines.delivered}</text>
    </g>}
    <Days f={f} />
    {held > 0 && <g transform={`translate(640 110) scale(${held})`} filter={SHADOW}>
      <rect x={-300} y={-36} width={600} height={72} rx={36} fill={C.tie} />
      <text x={0} y={11} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={30} fill={C.white}>{lines.held}</text>
    </g>}

    {slide > 0 && <g transform={`translate(${mix(1300, 0, slide)} 0)`}>
      <rect x={-8} y={0} width={1300} height={720} fill="#D9D2C0" />
      <rect x={0} y={0} width={1300} height={720} fill={C.paper} />
    </g>}
  </Stage>;
}
