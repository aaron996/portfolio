/* Cửa sổ app "Doanh số" trong phim Interdist: biểu đồ cột theo vùng xếp bằng ô, đường chỉ
   tiêu, dấu đạt/chưa đạt, hai thanh trượt Giá / Chỉ tiêu và dải lịch sử nhập.
   Vẽ theo toạ độ riêng 560×315 (gốc trên-trái); cảnh đặt nó ở đâu thì tự transform. */

import { C, fonts } from "../paper";

export const APP = { w: 560, h: 315 };
const BASE = 262, STEP = 29, TILE = 26;
export const BAR_X = [104, 186, 268, 350];
export const TILE_COLOR = "#3a3a33";

/** Tâm ô thứ `k` (đếm từ 0, từ dưới lên) của cột `bar`, toạ độ trong app. */
export function tileSlot(bar: number, k: number) {
  return { x: BAR_X[bar], y: BASE - (k + 1) * STEP + 3 + TILE / 2 };
}

export type AppState = {
  /** Số ô đã xếp ở mỗi cột (cho phép số lẻ: ô cuối đang nảy vào, 0..1 là tỉ lệ). */
  counts: number[];
  /** Chỉ tiêu tính theo số ô; undefined = chưa có. */
  target?: number;
  /** 0..1 hiện dấu đạt/chưa đạt. */
  checks?: number;
  price?: number;
  targetKnob?: number;
  /** Dải lịch sử: mỗi chấm một lần nhập. */
  history?: ("ok" | "bad" | "undone")[];
  /** Vị trí đầu đọc trên dải lịch sử (chỉ số chấm, cho phép số lẻ). */
  playhead?: number;
  labels: { app: string; regions: string[]; price: string; target: string; history: string };
};

function Check({ x, y, ok, s }: { x: number; y: number; ok: boolean; s: number }) {
  if (s <= 0.01) return null;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={11} fill={ok ? C.moss : C.tie} />
    {ok
      ? <path d="M-5 0 L-1.5 4 L5.5 -4" fill="none" stroke={C.white} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      : <path d="M0 -5 L0 1 M0 4.5 L0 5" stroke={C.white} strokeWidth={3} strokeLinecap="round" />}
  </g>;
}

export function AppScreen({ state }: { state: AppState }) {
  const { counts, target, checks = 0, price = 0.5, targetKnob = 0.6, history = [], playhead, labels } = state;
  return <g>
    <rect x={0} y={0} width={APP.w} height={APP.h} rx={14} fill={C.white} stroke={C.floorLine} strokeWidth={3} />
    <path d={`M1.5 30 L1.5 14 Q1.5 1.5 14 1.5 L${APP.w - 14} 1.5 Q${APP.w - 1.5} 1.5 ${APP.w - 1.5} 14 L${APP.w - 1.5} 30Z`} fill={C.paper} />
    {[20, 38, 56].map((cx, i) => <circle key={cx} cx={cx} cy={16} r={5} fill={[C.tie, "#E8B84A", C.moss][i]} />)}
    <text x={80} y={21} fontFamily={fonts.mono} fontWeight={500} fontSize={14} fill={C.ink}>{labels.app}</text>

    <line x1={26} x2={392} y1={BASE + 1} y2={BASE + 1} stroke={C.ink} strokeWidth={2.5} />
    {BAR_X.map((bx, b) => {
      const full = Math.floor(counts[b]), part = counts[b] - full;
      return <g key={bx}>
        {Array.from({ length: full }, (_, k) => {
          const p = tileSlot(b, k);
          return <rect key={k} x={p.x - TILE / 2} y={p.y - TILE / 2} width={TILE} height={TILE} rx={2} fill={TILE_COLOR} />;
        })}
        {part > 0 && (() => {
          const p = tileSlot(b, full);
          const s = 0.4 + part * 0.6;
          return <rect x={p.x - (TILE * s) / 2} y={p.y + TILE / 2 - TILE * s} width={TILE * s} height={TILE * s} rx={2} fill={TILE_COLOR} />;
        })()}
        <text x={bx} y={BASE + 24} textAnchor="middle" fontFamily={fonts.mono} fontWeight={500} fontSize={14} fill={C.ink}>{labels.regions[b]}</text>
        {target !== undefined && <Check x={bx} y={BASE - Math.max(counts[b], target) * STEP - 16} ok={counts[b] >= target - 0.01} s={checks} />}
      </g>;
    })}
    {target !== undefined && <g>
      <line x1={26} x2={392} y1={BASE - target * STEP + 1.5} y2={BASE - target * STEP + 1.5} stroke={C.tie} strokeWidth={2.5} strokeDasharray="8 6" />
      <text x={28} y={BASE - target * STEP - 6} fontFamily={fonts.mono} fontWeight={500} fontSize={12} fill={C.tie}>{labels.target}</text>
    </g>}

    <line x1={414} x2={414} y1={46} y2={APP.h - 18} stroke={C.grid} strokeWidth={2} />
    {[{ label: labels.price, v: price, y: 70 }, { label: labels.target, v: targetKnob, y: 132 }].map(sl => <g key={sl.y}>
      <text x={430} y={sl.y} fontFamily={fonts.mono} fontWeight={500} fontSize={13} fill={C.ink}>{sl.label}</text>
      <line x1={432} x2={536} y1={sl.y + 22} y2={sl.y + 22} stroke={C.grid} strokeWidth={6} strokeLinecap="round" />
      <line x1={432} x2={432 + 104 * sl.v} y1={sl.y + 22} y2={sl.y + 22} stroke={C.moss} strokeWidth={6} strokeLinecap="round" />
      <circle cx={432 + 104 * sl.v} cy={sl.y + 22} r={9} fill={C.white} stroke={C.moss} strokeWidth={3.5} />
    </g>)}
    <text x={430} y={208} fontFamily={fonts.mono} fontWeight={500} fontSize={13} fill={C.ink}>{labels.history}</text>
    <line x1={432} x2={536} y1={240} y2={240} stroke={C.grid} strokeWidth={2} />
    {history.map((h, i) => <circle key={i} cx={438 + i * 19} cy={240} r={6.5}
      fill={h === "ok" ? C.moss : h === "bad" ? C.tie : C.white} stroke={h === "undone" ? C.tie : "none"} strokeWidth={2} strokeDasharray={h === "undone" ? "3 2" : undefined} />)}
    {playhead !== undefined && history.length > 0 && <path transform={`translate(${438 + playhead * 19} 224)`} d="M-6 -6 L6 -6 L0 2Z" fill={C.ink} />}
  </g>;
}
