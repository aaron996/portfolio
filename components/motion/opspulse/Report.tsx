/* GHN Ops Pulse — báo cáo tự đi mỗi sáng (docs/case-motion.md). Lùi ra từ màn hình về phòng họp;
   mọi người gật gù rồi về. Đêm xuống, đồng hồ quay tới 7:00, trời sáng. Trùng — bạn đồng hành vốn
   hay cầm máy ảnh — nhảy lên nóc màn hình chụp chính dashboard 9 lần; mỗi ảnh gấp thành máy bay
   giấy bay vào nhóm lãnh đạo, cuối cùng là đoạn nhận xét ngày hôm qua — nhãn AUTO: báo cáo tự gửi.
   Mọi người quay lại, nhẹ nhõm; câu chốt, rồi tờ giấy trượt lên phủ khung để sang cảnh kết. */

import { Easing, useCurrentFrame } from "remotion";
import { Buddy, BUDDY } from "../Buddy";
import { Person } from "../Person";
import { Stage } from "../Stage";
import { Tagline } from "../Tagline";
import { Vinh } from "../Vinh";
import { blink, C, camera, mix, mixColor, pop, ramp } from "../paper";
import { type DashState } from "./Dashboard";
import { LEAD, lines, MANAGER, OPS } from "./cast";
import { Chat, Chip, MeetingRoom, SCREEN, SCREEN_C, SEG3, TRIO } from "./Hall";

export const REPORT_FRAMES = 384;
export const T = {
  nod: 30, leave: 50, dusk: 78, off: 86, spin: 92, dawn: 120, on: 150, trung: 154, shots: 176,
  note: 256, back: 262, glint: 286, tagline: 300, wipe: 356, end: REPORT_FRAMES,
};
export const SHOTS = Array.from({ length: Number(lines.tables) }, (_, k) => T.shots + k * 8);
const SHADOW = "url(#cut)";
const CHAT = { x: SEG3 + 1010, y: 236, w: 244, h: 320 };
const PERCH = { x: SCREEN.x + 70, y: SCREEN.y - 14 };

function sky(r: number) {
  const day = "#CFE0DA", dusk = "#E8B88A", night = "#2B3550", dawn = "#F2C48D";
  if (r < T.dusk) return day;
  if (r < T.dusk + 12) return mixColor(day, dusk, ramp(r, T.dusk, T.dusk + 12));
  if (r < T.dawn) return mixColor(dusk, night, ramp(r, T.dusk + 12, T.dusk + 22));
  if (r < T.dawn + 15) return mixColor(night, dawn, ramp(r, T.dawn, T.dawn + 15));
  return mixColor(dawn, day, ramp(r, T.dawn + 15, T.on));
}

function screenState(r: number): DashState | undefined {
  if (r < T.off) return { level: 3, t: 1, tag: 1, pulse: r * 0.4 };
  if (r < T.on) return undefined;
  const k = SHOTS.filter(at => r >= at).length;
  return k === 0 ? { level: 0, t: 1 } : { level: ((k - 1) % 4) as DashState["level"], t: 1, tag: 1, variant: k, pulse: r * 0.4 };
}

function Photos({ r }: { r: number }) {
  return <g>{SHOTS.map((at, k) => {
    const fly = ramp(r, at + 1, at + 13, Easing.inOut(Easing.quad));
    if (r < at + 1 || fly >= 1) return null;
    const from = { x: PERCH.x + 26, y: PERCH.y - 26 };
    const col = k % 3, row = Math.floor(k / 3);
    const to = { x: CHAT.x + 22 + col * ((CHAT.w - 44) / 3) + 30, y: CHAT.y + 64 + row * 56 + 23 };
    const x = mix(from.x, to.x, fly), y = mix(from.y, to.y, fly) - Math.sin(fly * Math.PI) * 120;
    const plane = fly > 0.3 && fly < 0.85;
    return <g key={k} transform={`translate(${x} ${y}) rotate(${plane ? -12 : fly * 30})`}>
      {plane
        ? <g filter={SHADOW}><path d="M-22 -8 L24 0 L-22 10 L-12 1Z" fill={C.white} /><path d="M-12 1 L24 0" stroke={C.grid} strokeWidth={2} /></g>
        : <rect x={-20} y={-14} width={40} height={28} rx={3} fill={C.white} stroke={C.grid} strokeWidth={2} filter={SHADOW} />}
    </g>;
  })}</g>;
}

function Trung({ r }: { r: number }) {
  if (r < T.trung) return null;
  const hop = ramp(r, T.trung, T.trung + 16, Easing.inOut(Easing.quad));
  const x = mix(SEG3 + 260, PERCH.x, hop), y = mix(600, PERCH.y, hop) - Math.sin(hop * Math.PI) * 160;
  const landed = hop >= 1;
  const shot = SHOTS.find(at => r >= at && r < at + 4);
  const squash = landed && r < T.trung + 22 ? 0.5 * Math.sin(ramp(r, T.trung + 16, T.trung + 22) * Math.PI) : shot !== undefined ? 0.15 : 0;
  const k = SHOTS.filter(at => r >= at).length;
  return <g>
    <Buddy x={x} y={y} size={42} color={BUDDY.dot} squash={squash} rot={landed ? 0 : -300 * hop} blink={blink(r, 40, 3)} look={0.6} />
    {landed && <g transform={`translate(${x + 22} ${y - 24})`} filter={SHADOW}>
      <rect x={-16} y={-12} width={32} height={22} rx={4} fill="#3A3F48" />
      <rect x={-8} y={-17} width={12} height={6} rx={2} fill="#3A3F48" />
      <circle cx={2} cy={-1} r={7} fill="#1D1D1B" stroke="#9AA3AE" strokeWidth={2} />
      {shot !== undefined && <g opacity={1 - (r - shot) / 4}>
        <circle cx={2} cy={-1} r={22} fill={C.white} opacity={0.9} />
        {[0, 45, 90, 135].map(a => <rect key={a} x={-1.5} y={-36} width={3} height={70} fill={C.white} transform={`rotate(${a} 2 -1)`} />)}
      </g>}
    </g>}
    {k > 0 && <Chip x={x + 10} y={y - 80} text={`${k}/${lines.tables}`} s={Math.min(pop(r, SHOTS[0], 220, 12), 1)} />}
  </g>;
}

function walkX(r: number, a: number, b: number, from: number, to: number) {
  return mix(from, to, ramp(r, a, b, Easing.inOut(Easing.quad)));
}

export function Report() {
  const r = useCurrentFrame();
  const out = ramp(r, 0, 30, Easing.inOut(Easing.cubic));
  // Lùi ra xa hơn khung phòng họp một chút để có chỗ cho Trùng trên nóc màn hình.
  const s = mix(1280 / SCREEN.w, 0.9, out);
  const night = ramp(r, T.dusk, T.dusk + 18) * (1 - ramp(r, T.dawn + 8, T.on));
  const spin = ramp(r, T.spin, T.on, Easing.inOut(Easing.cubic));
  const screen = screenState(r);
  const on = r < T.off ? 1 - ramp(r, T.off - 6, T.off) : ramp(r, T.on, T.on + 6);
  const flash = SHOTS.some(at => r >= at && r < at + 3);
  const nod = r > T.nod && r < T.nod + 18 ? Math.sin(((r - T.nod) / 18) * Math.PI * 2) * 5 : 0;
  const leaving = r >= T.leave;
  const back = r >= T.back;
  const looks = [OPS, MANAGER, LEAD];
  const wipe = ramp(r, T.wipe, T.end - 2, Easing.inOut(Easing.cubic));
  const auto = (r < T.on ? 0 : pop(r, T.on, 200, 12)) * (1 - ramp(r, T.tagline - 6, T.tagline));
  const dim = ramp(r, T.tagline - 4, T.tagline + 8);

  const people = looks.map((look, i) => {
    let x = TRIO[i], walking = 0;
    if (leaving && !back) { x = walkX(r, T.leave + i * 3, T.leave + 26 + i * 3, TRIO[i], SEG3 - 160 - i * 60); walking = r < T.leave + 28 + i * 3 ? 1 : 0; }
    if (back) {
      const home = [SEG3 + 300, SEG3 + 470, SEG3 + 900][i];
      const from = i === 2 ? SEG3 + 1400 : SEG3 - 160 - i * 80;
      x = walkX(r, T.back + i * 4, T.back + 26 + i * 4, from, home);
      walking = r < T.back + 28 + i * 4 ? 1 : 0;
    }
    const mug = i === 0 && back;
    const phone = i === 2 && back;
    return <g key={i}>
      <Person x={x} y={700} scale={0.86} look={look} pose={{
        walk: r * 0.5, walking, tilt: back ? 0 : nod, mouth: back ? "grin" : "smile",
        look: back ? (i === 2 ? 0.6 : 0.8) : (SCREEN_C.x - x) / 300, blink: blink(r, 75, i * 13),
        handR: mug ? { x: 34, y: -150 } : phone ? { x: 18, y: -170 } : undefined, armsFront: mug || phone,
      }} prop={mug ? <g transform="translate(34 -150)"><rect x={-11} y={-14} width={22} height={24} rx={4} fill={C.lime} /><path d="M11 -8 Q19 -6 18 0 Q17 6 11 5" fill="none" stroke={C.lime} strokeWidth={4} /></g>
        : phone ? <rect x={4} y={-196} width={26} height={44} rx={5} fill="#2B2F36" transform="rotate(-12 18 -170)" /> : undefined} filter={SHADOW} />
    </g>;
  });

  const vinhX = !leaving ? SEG3 + 940 : !back ? walkX(r, T.leave + 4, T.leave + 30, SEG3 + 940, SEG3 + 1420) : walkX(r, T.back + 10, T.back + 34, SEG3 - 200, SEG3 + 700);
  const vinhWalk = (leaving && !back && r < T.leave + 32) || (back && r < T.back + 36) ? 1 : 0;

  return <Stage>
    <g transform={camera(SEG3 + 640, mix(SCREEN_C.y, 330, out), s)}>
      <rect x={SEG3 - 400} y={0} width={2200} height={720} fill={C.paper} />
      <rect x={SEG3 - 400} y={600} width={2200} height={300} fill={C.floor} />
      <rect x={SEG3 - 400} y={596} width={2200} height={6} fill={C.floorLine} />
      <MeetingRoom screen={screen} on={on} sky={sky(r)} moon={night} minute={360 * 22 * spin} hour={270 + 660 * spin} />
      {flash && <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill={C.white} opacity={0.8} />}
      <Chat f={r} x={CHAT.x} y={CHAT.y} w={CHAT.w} h={CHAT.h} title={lines.group} items={SHOTS.map(at => at + 13)} note={T.note} />
      {people}
      <Vinh x={vinhX} y={700} scale={0.92} pose={{
        walk: r * 0.5, walking: vinhWalk, look: back ? 1 : -1, smile: 0.9, blink: blink(r, 90, 40),
        push: back ? ramp(r, T.glint - 8, T.glint, Easing.out(Easing.back(1.5))) * (1 - ramp(r, T.glint + 10, T.glint + 18)) : 0,
        glint: back ? ramp(r, T.glint - 4, T.glint + 6) : 0,
      }} filter={SHADOW} />
      <Trung r={r} />
      <Photos r={r} />
      <rect x={SEG3 - 400} y={0} width={2200} height={720} fill="#141B2B" opacity={0.55 * night} />
    </g>
    <Chip x={800} y={64} text={lines.auto} s={auto} bg={C.lime} />
    {dim > 0 && <rect x={0} y={0} width={1280} height={720} fill={C.paper} opacity={dim * 0.5} />}
    <Tagline f={r} at={T.tagline} text={lines.tagline} />
    {wipe > 0 && <g transform={`rotate(${-3 * (1 - wipe)} 640 ${mix(760, -60, wipe)})`}>
      <rect x={-80} y={mix(760, -60, wipe) + 6} width={1440} height={900} fill="#D9D2C0" />
      <rect x={-80} y={mix(760, -60, wipe)} width={1440} height={900} fill={C.paper} />
    </g>}
  </Stage>;
}
