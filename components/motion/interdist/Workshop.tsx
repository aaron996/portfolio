/* Interdist — cảnh xưởng (docs/case-motion.md): nền là tờ file vừa phủ kín khung. File rơi
   vào phễu "Kiểm tra"; bản trùng (Trùng) bị bật ra kèm cờ đỏ — tức xem trước khi nhập.
   File đạt hoá thành ô, ô bay vào xếp thành cột theo vùng trong app. Vinh chỉnh chỉ tiêu.
   Lệch nhảy vào làm vọt một cột → tua lịch sử nhập lùi một bước, Lệch bị gỡ ra.
   Cuối cảnh camera dí vào cửa sổ app để nối sang màn hình máy tính của sếp. */

import { Easing, useCurrentFrame } from "remotion";
import { Buddy, BUDDY } from "../Buddy";
import { Sheet } from "../Sheet";
import { Stage } from "../Stage";
import { Vinh } from "../Vinh";
import { blink, C, fonts, mix, pop, ramp } from "../paper";
import { APP, AppScreen, tileSlot, TILE_COLOR, type AppState } from "./AppScreen";
import { FILES, lines, SHADOW } from "./InterdistOpener";

export const WORKSHOP_FRAMES = 352;

/** Vị trí cửa sổ app trong cảnh xưởng (góc trên-trái, tỉ lệ 1). */
export const PANEL = { x: 650, y: 90 };
const FUNNEL = { x: 430, mouth: 118, stem: 362 };
export const BAD = 1; // FILES[1] — bản sao "_v2" của file doanh số.
const BAD_LAND = { x: 300, y: 600 };
const LECH_LAND = { x: 528, y: 652 };

export const T = {
  vinh: 4, panel: 8, funnel: 14, sheets: 30, target: 150, price: 168, think: 178, slide: 196,
  lech: 240, spike: 254, think2: 266, rewind: 286, out: 298, zoom: 322, end: WORKSHOP_FRAMES,
};

export const COUNTS = [4, 3, 5, 3];
export const REGIONS = [lines.region1, lines.region2, lines.region3, lines.region4];
export const APP_LABELS: AppState["labels"] = {
  app: lines.app, regions: REGIONS, price: lines.price, target: lines.target, history: lines.history,
};

export const arrive = (i: number) => T.sheets + i * 12 + 18;

/* Ô xếp theo từng tầng để các cột cùng lớn dần. */
const SLOTS: { bar: number; k: number }[] = [];
for (let k = 0; k < Math.max(...COUNTS); k++) COUNTS.forEach((n, bar) => { if (k < n) SLOTS.push({ bar, k }); });
export const GOOD = FILES.map((_, i) => i).filter(i => i !== BAD);
export const TILES = GOOD.flatMap(i => [14, 19, 24].map(d => arrive(i) + d)).sort((a, b) => a - b)
  .map((launch, n) => ({ launch, land: launch + 18, ...SLOTS[n] }));
/** Lúc file đạt thứ n đã đổ đủ ô — thêm một chấm vào lịch sử nhập. */
export const IMPORTS = GOOD.map((_, n) => TILES[n * 3 + 2].land);

function Grid({ w }: { w: number }) {
  const o = ramp(w, 0, 20);
  return <g opacity={o}>
    {Array.from({ length: 33 }, (_, i) => <line key={`v${i}`} x1={i * 40} x2={i * 40} y1={0} y2={720} stroke="#EEEAE0" strokeWidth={2} />)}
    {Array.from({ length: 19 }, (_, i) => <line key={`h${i}`} x1={0} x2={1280} y1={i * 40} y2={i * 40} stroke="#EEEAE0" strokeWidth={2} />)}
    <rect y={652} width={1280} height={68} fill="#EFEBE2" />
    <rect y={650} width={1280} height={4} fill={C.floorLine} />
  </g>;
}

function funnelState(w: number) {
  const bad = w >= arrive(BAD) && w < arrive(BAD) + 14;
  const good = GOOD.some(i => w >= arrive(i) && w < arrive(i) + 6);
  return { rim: bad ? C.tie : good ? C.lime : "#B9DB52", shake: bad ? Math.sin(w * 3) * 5 : 0 };
}

function FunnelBack({ w }: { w: number }) {
  const s = w < T.funnel ? 0 : pop(w, T.funnel, 160, 12);
  const { shake } = funnelState(w);
  const y = mix(-260, 0, Math.min(s, 1.2));
  return <g transform={`translate(${shake} ${y})`}>
    <ellipse cx={FUNNEL.x} cy={FUNNEL.mouth} rx={122} ry={24} fill={C.mossDeep} />
  </g>;
}

function FunnelFront({ w }: { w: number }) {
  const s = w < T.funnel ? 0 : pop(w, T.funnel, 160, 12);
  const { rim, shake } = funnelState(w);
  const y = mix(-260, 0, Math.min(s, 1.2));
  const { x, mouth, stem } = FUNNEL;
  return <g transform={`translate(${shake} ${y})`} filter={SHADOW}>
    <path d={`M${x - 122} ${mouth} Q${x} ${mouth + 46} ${x + 122} ${mouth} L${x + 22} ${stem - 66} L${x + 22} ${stem} L${x - 22} ${stem} L${x - 22} ${stem - 66}Z`} fill={C.moss} />
    <path d={`M${x - 122} ${mouth} Q${x} ${mouth + 46} ${x + 122} ${mouth}`} fill="none" stroke={rim} strokeWidth={8} strokeLinecap="round" />
    <text x={x} y={mouth + 92} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={24} fill={C.white}>{lines.check}</text>
  </g>;
}

function FallingSheets({ w }: { w: number }) {
  return <g>{FILES.map((label, i) => {
    const L = T.sheets + i * 12, A = arrive(i);
    if (w < L) return null;
    const from = { x: -90 + i * 46, y: -130 };
    const mouth = { x: FUNNEL.x + (i % 2 ? -26 : 26), y: FUNNEL.mouth - 10 };
    if (w < A) {
      const t = ramp(w, L, A, Easing.in(Easing.quad));
      return <Sheet key={label} x={mix(from.x, mouth.x, t)} y={mix(from.y, mouth.y, t) - Math.sin(t * Math.PI) * 60} scale={0.55} rot={mix(-50 + i * 14, 0, t)} label={label} />;
    }
    if (i === BAD) {
      const t = ramp(w, A, A + 24, Easing.out(Easing.quad));
      if (t < 1) return <Sheet key={label} x={mix(mouth.x, BAD_LAND.x, t)} y={mix(mouth.y, BAD_LAND.y, t) - Math.sin(t * Math.PI) * 180} scale={0.6} rot={-372 * t} label={label} peek blink={0} />;
      return null;
    }
    const t = ramp(w, A, A + 10, Easing.in(Easing.quad));
    if (t >= 1) return null;
    return <Sheet key={label} x={mouth.x} y={mix(mouth.y, mouth.y + 110, t)} scale={mix(0.55, 0.4, t)} rot={0} />;
  })}</g>;
}

/* Bản trùng nằm dưới sàn, cờ đỏ cắm bên cạnh. */
function Rejected({ w }: { w: number }) {
  const land = arrive(BAD) + 24;
  if (w < land) return null;
  const squash = 1 - 0.12 * Math.sin(ramp(w, land, land + 8) * Math.PI);
  const flag = w < land + 3 ? 0 : pop(w, land + 3, 220, 11);
  return <g>
    <Sheet x={BAD_LAND.x} y={BAD_LAND.y} scale={0.6 * squash} rot={-12} label={FILES[BAD]} peek blink={blink(w, 46, 7)} filter={SHADOW} />
    <g transform={`translate(372 650) scale(1 ${flag}) translate(-372 -650)`} filter={SHADOW}>
      <rect x={369} y={540} width={6} height={110} rx={3} fill={C.ink} />
      <path d="M375 540 L505 540 L490 558 L505 576 L375 576Z" fill={C.tie} />
      <text x={385} y={564} fontFamily={fonts.sans} fontWeight={700} fontSize={17} fill={C.white}>{lines.reject}</text>
    </g>
  </g>;
}

function FlyingTiles({ w }: { w: number }) {
  return <g>{TILES.map((t, n) => {
    if (w < t.launch || w >= t.land) return null;
    const p = ramp(w, t.launch, t.land, Easing.inOut(Easing.quad));
    const to = tileSlot(t.bar, t.k);
    const x = mix(FUNNEL.x, PANEL.x + to.x, p), y = mix(FUNNEL.stem, PANEL.y + to.y, p) - Math.sin(p * Math.PI) * 150;
    return <rect key={n} x={x - 13} y={y - 13} width={26} height={26} rx={2} fill={TILE_COLOR} transform={`rotate(${p * 270} ${x} ${y})`} />;
  })}</g>;
}

function appState(w: number): AppState {
  const counts = COUNTS.map((_, b) => TILES.filter(t => t.bar === b && w >= t.land).length);
  const history: AppState["history"] = IMPORTS.filter(at => w >= at).map(() => "ok" as const);
  if (w >= T.spike) history.push(w >= T.rewind + 10 ? "undone" : "bad");
  const back = ramp(w, T.rewind, T.rewind + 10, Easing.inOut(Easing.cubic));
  const knob = ramp(w, T.slide, T.slide + 30, Easing.inOut(Easing.cubic));
  return {
    counts,
    target: w >= T.target ? mix(4.5, 3.5, knob) : undefined,
    checks: w < T.target + 6 ? 0 : Math.min(pop(w, T.target + 6, 200, 12), 1.15),
    price: 0.5 + 0.22 * Math.sin(ramp(w, T.price, T.price + 22) * Math.PI),
    targetKnob: mix(0.62, 0.42, knob),
    history,
    playhead: history.length ? (w >= T.spike ? mix(5, 4, back) : history.length - 1) : undefined,
    labels: APP_LABELS,
  };
}

/* Lệch: rơi xuống nóc cột Trung, vươn cao thành "cột vọt", bị tua lùi rồi nhảy ra sàn. */
function Lech({ w }: { w: number }) {
  if (w < T.lech) return null;
  const top = { x: PANEL.x + tileSlot(1, 0).x, y: PANEL.y + 262 - COUNTS[1] * 29 };
  const fall = ramp(w, T.lech, T.lech + 12, Easing.in(Easing.quad));
  const grow = ramp(w, T.spike, T.spike + 8, Easing.out(Easing.back(2))) * (1 - ramp(w, T.rewind + 4, T.rewind + 12, Easing.in(Easing.quad)));
  const hop = ramp(w, T.out, T.out + 20, Easing.inOut(Easing.quad));
  const size = mix(26, 40, hop);
  const x = mix(top.x, LECH_LAND.x, hop), y = mix(mix(top.y - 240, top.y, fall), LECH_LAND.y, hop) - Math.sin(hop * Math.PI) * 160;
  const landed = w >= T.out + 20;
  const squash = landed ? 0.6 * Math.sin(ramp(w, T.out + 20, T.out + 28) * Math.PI) : fall < 1 ? -0.3 : 0;
  return <Buddy x={x} y={y} size={size} color={BUDDY.outlier} tall={1 + 2.4 * grow} squash={squash} rot={hop > 0 && !landed ? -360 * hop : 0}
    blink={blink(w, 52, 3)} look={landed ? -0.6 : 0.4} pout={landed} />;
}

function vinhPose(w: number) {
  const think = (a: number) => ramp(w, a, a + 8, Easing.out(Easing.back(1.5))) * (1 - ramp(w, a + 18, a + 26));
  return {
    push: Math.max(think(T.think), think(T.think2)),
    glint: w < T.think2 ? ramp(w, T.think + 8, T.think + 18) : ramp(w, T.think2 + 8, T.think2 + 18),
    look: 1, smile: 0.7, blink: blink(w, 80, 30),
    hair: w > T.vinh && w < T.vinh + 20 ? -6 * Math.sin((w - T.vinh) * 0.6) * Math.exp(-(w - T.vinh) / 6) : 0,
  };
}

export function Workshop() {
  const w = useCurrentFrame();
  const vin = w < T.vinh ? 0 : pop(w, T.vinh, 170, 12);
  const panel = w < T.panel ? 0 : pop(w, T.panel, 170, 13);
  const zoom = ramp(w, T.zoom, T.end, Easing.inOut(Easing.cubic));
  const cx = PANEL.x + APP.w / 2, cy = PANEL.y + APP.h / 2;
  const s = mix(1, 1280 / APP.w, zoom);
  const camera = `translate(640 360) scale(${s}) translate(${-mix(640, cx, zoom)} ${-mix(360, cy, zoom)})`;

  return <Stage bg={C.sheet}>
    <g transform={camera}>
      <Grid w={w} />
      <FunnelBack w={w} />
      <FallingSheets w={w} />
      <FunnelFront w={w} />
      <Rejected w={w} />
      <g transform={`translate(${cx} ${cy}) scale(${panel}) translate(${-cx} ${-cy})`} filter={SHADOW}>
        <g transform={`translate(${PANEL.x} ${PANEL.y})`}><AppScreen state={appState(w)} /></g>
      </g>
      <Lech w={w} />
      <FlyingTiles w={w} />
      <ellipse cx={150} cy={652} rx={52} ry={9} fill="#3B2F1E" opacity={0.12 * Math.min(vin, 1)} />
      <g transform={`translate(0 ${(1 - Math.min(vin, 1)) * 420})`}>
        <Vinh x={150} y={650} scale={1.05} pose={vinhPose(w)} filter={SHADOW} />
      </g>
    </g>
  </Stage>;
}
