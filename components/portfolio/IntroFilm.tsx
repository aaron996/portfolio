"use client";

/* Intro motion — vẽ live bằng SVG (kịch bản: docs/intro-motion.md).

   Mọi thứ trên hình là hàm thuần của thời gian `t` (giây): `frame(t)` trả về camera,
   tư thế ba bạn và đạo cụ, nên đứng yên ở giây nào cũng ra đúng khung đó (`?intro=1.8`).
   Toạ độ thế giới: sàn ở y = 0, Chấm đứng giữa x = 0, cạnh ô S = 30. Camera là một
   điểm nhìn (cx, cy) và độ phóng z (px trên một đơn vị) — tính theo kích thước màn hình,
   nên màn dọc hay ngang đều đóng khung đúng.

   Đã dựng: mở màn (0–4,2s), Phân tích (4,2–7,6s), Build + AI (7,6–11,5s), Ship (11,5–13,5s), Về nhà (13,5–17s), Ký tên + bay vào nav (17–20s). */

import { useCallback, useEffect, useRef, useState } from "react";
import { content } from "@/content/content.vi";
import { END, filmTime } from "./introClock";

const S = 30;
/** Từ giây này camera đã lùi đủ xa để nền giấy chiếm phần lớn khung. */
const LIGHT_AT = 2.32;

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** Tiến độ 0→1 của đoạn [a, b]. */
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const inOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const outExpo = (k: number) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k));
const inQuad = (k: number) => k * k;
const outQuad = (k: number) => 1 - (1 - k) * (1 - k);
const outBack = (k: number) => 1 + 2.7 * Math.pow(k - 1, 3) + 1.7 * Math.pow(k - 1, 2);
/** Đường parabol 0→1→0 — độ nhấc của một cú nhảy. */
const hump = (k: number) => 4 * k * (1 - k);
/** Một nhịp chớp/nảy hình tam giác quanh `at`, rộng `w` giây. */
const pulse = (t: number, at: number, w: number) => clamp(1 - Math.abs(t - at) / w);
/** Các bước nhảy nhỏ liên tiếp trong lúc chạy (k: tiến độ quãng chạy). */
const hops = (k: number, n: number, h: number) => (k > 0 && k < 1 ? hump((k * n) % 1) * h : 0);

/** Số ngẫu nhiên có hạt giống — đống pixel lần nào cũng đổ y hệt. */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

type Buddy = {
  x: number; lift: number; squash: number; rot: number;
  blink: number; eye: number; lookX: number; lookY: number; o: number;
  /** Độ cao mặt đang đứng; > 0 (đứng trong ô logo) thì không đổ bóng xuống sàn. */
  perch?: number;
  /** 0→1: thân chuyển sang màu lime của logo — đã về đúng ô. */
  glow?: number;
  /** Độ đậm của mắt (tắt dần khi logo bay vào nav, vì logo thật không có mắt). */
  eyes?: number;
};
const still = (x: number): Buddy => ({ x, lift: 0, squash: 0, rot: 0, blink: 0, eye: 1, lookX: 0, lookY: 0, o: 1 });

type Cam = { cx: number; cy: number; z: number };

/* ---------- màn Phân tích: biểu đồ ---------- */

const A0 = 4.2; // màn Phân tích bắt đầu
const CELL = 6, PITCH = 7;
const BARS = [2, 3, 4, 5, 6, 8];
const LAST = BARS.length - 1;
const BAR_X0 = -28, BAR_STEP = 22;
const SHOOT = 3; // số hàng cột cuối vọt thêm
const barLeft = (i: number) => BAR_X0 + i * BAR_STEP;
const barMid = (i: number) => barLeft(i) + (PITCH + CELL) / 2;
const barTop = (i: number) => -BARS[i] * PITCH;

/* Mốc thời gian của màn. */
const RUN = { t0: 4.8, t1: 5.45, x0: -80, x1: 112 }; // Chấm chạy quét qua đống pixel
const DUP = 5.72; // cột cuối tự nhân đôi dưới chân Trùng
const DUP_ROW = 0.028;
const KICK = 6.05; // Chấm đá bay phần trùng
const SHOOT_AT = 6.9; // cột cuối vọt lên, số đếm 90.1 → 97.5

type Cell = { x: number; y: number; r: number; s?: number; o?: number; hot?: boolean; fill?: string };

/* Mỗi pixel rơi xuống một chỗ lộn xộn rồi bay về một ô của biểu đồ khi Chấm chạy ngang
   qua. Ô và chỗ rơi cùng xếp theo x để pixel không bay chéo cả màn hình. */
const PIXELS = (() => {
  const rand = rng(7);
  const slots: { x: number; y: number; last: boolean }[] = [];
  BARS.forEach((rows, i) => {
    for (let c = 0; c < 2; c++) for (let r = 0; r < rows; r++) slots.push({ x: barLeft(i) + c * PITCH, y: -(r + 1) * PITCH, last: i === LAST });
  });
  slots.sort((a, b) => a.x - b.x || b.y - a.y);
  const piles = slots
    .map(() => ({ x: BAR_X0 - 7 + rand() * 128, y: -CELL - rand() * 6, r: (rand() - 0.5) * 80, drop: rand() * 0.32 }))
    .sort((a, b) => a.x - b.x);
  return slots.map((s, i) => {
    const p = piles[i];
    const land = A0 + 0.05 + p.drop + 0.3;
    const passed = RUN.t0 + clamp((p.x - 8 - RUN.x0) / (RUN.x1 - RUN.x0)) * (RUN.t1 - RUN.t0);
    return { ...s, px: p.x, py: p.y, pr: p.r, drop: p.drop, sortAt: Math.max(passed, land + 0.05) };
  });
})();

function pixelAt(p: (typeof PIXELS)[number], t: number): Cell | null {
  const fall = A0 + 0.05 + p.drop, land = fall + 0.3;
  const hot = p.last && t >= SHOOT_AT - 0.05;
  if (t < fall) return null;
  if (t < land) {
    const k = inQuad(seg(t, fall, land));
    return { x: p.px, y: lerp(-200, p.py, k), r: p.pr * k };
  }
  if (t < p.sortAt) return { x: p.px, y: p.py - hump(seg(t, land, land + 0.12)) * 3, r: p.pr };
  const k = seg(t, p.sortAt, p.sortAt + 0.28), e = inOut(k);
  return { x: lerp(p.px, p.x, e), y: lerp(p.py, p.y, e) - hump(k) * 14, r: p.pr * (1 - e), hot };
}

/* Phần Trùng nhân đôi: chồng thêm đúng chiều cao cột cuối, rồi bị đá văng. */
const DUPES = (() => {
  const rand = rng(11);
  const out: { x: number; y: number; row: number; vx: number; vy: number; spin: number }[] = [];
  for (let j = 0; j < BARS[LAST]; j++) for (let c = 0; c < 2; c++) out.push({
    x: barLeft(LAST) + c * PITCH, y: -(BARS[LAST] + j + 1) * PITCH, row: j,
    vx: -(50 + rand() * 80), vy: -(30 + rand() * 70), spin: (rand() - 0.5) * 900,
  });
  return out;
})();

function dupeAt(d: (typeof DUPES)[number], t: number): Cell | null {
  const appear = DUP + d.row * DUP_ROW;
  if (t < appear) return null;
  if (t < KICK) return { x: d.x, y: d.y, r: 0, s: outBack(seg(t, appear, appear + 0.08)) };
  const dt = t - KICK;
  if (dt > 0.8) return null;
  return { x: d.x + d.vx * dt, y: d.y + d.vy * dt + 160 * dt * dt, r: d.spin * dt, o: 1 - seg(dt, 0.4, 0.8) };
}
/** Số hàng Trùng đã nhân đôi — quyết định Trùng đang đứng cao bao nhiêu. */
const dupRows = (t: number) => (t < DUP ? 0 : Math.min(BARS[LAST], Math.floor((t - DUP) / DUP_ROW) + 1));

function shootAt(row: number, t: number): Cell | null {
  const at = SHOOT_AT + row * 0.09;
  if (t < at) return null;
  return { x: barLeft(LAST), y: -(BARS[LAST] + row + 1) * PITCH, r: 0, s: outBack(seg(t, at, at + 0.1)), hot: true };
}

function chart(t: number) {
  const cells: Cell[] = [];
  if (t < A0 || t >= B0) return { cells, trend: 0, trendFade: 1, circle: 0, stat: null as null | { y: number; k: number; pop: number } };
  PIXELS.forEach(p => { const c = pixelAt(p, t); if (c) cells.push(c); });
  DUPES.forEach(d => { const c = dupeAt(d, t); if (c) cells.push(c); });
  for (let r = 0; r < SHOOT; r++) {
    const c = shootAt(r, t);
    if (c) cells.push(c, { ...c, x: c.x + PITCH });
  }
  const grown = Math.min(SHOOT, t < SHOOT_AT ? 0 : Math.floor((t - SHOOT_AT) / 0.09) + 1);
  return {
    cells,
    // Đường xu hướng vẽ qua đỉnh các cột, rồi tắt khi cột cuối vọt lên.
    trend: seg(t, 6.15, 6.35),
    trendFade: 1 - seg(t, 7.0, 7.2),
    // Vòng đỏ khoanh Lệch — điểm ngoại lai.
    circle: seg(t, 6.42, 6.6) * (1 - seg(t, 6.72, 6.82)),
    stat: t < 6.8 ? null : { y: barTop(LAST) - grown * PITCH - 5, k: inOut(seg(t, SHOOT_AT, 7.3)), pop: outBack(seg(t, 6.8, 6.92)) },
  };
}

/* ---------- màn Build + AI: dashboard ---------- */

const B0 = 7.6; // màn Build + AI bắt đầu
const GREY = "#8f8b7f", LIME = "#d4f236", RED = "#d0443a", GREEN = "var(--accent)";
/** Góc trên-trái màn hình dashboard; lưới 18 × 11 ô, đứng trên một chân đế. */
const DX0 = -35, DY0 = -85, DCOLS = 18, DROWS = 11;
const dcell = (col: number, row: number) => ({ x: DX0 + col * PITCH, y: DY0 + row * PITCH });
const TOP = -DY0; // độ cao mép trên màn hình — Chấm đứng lên đó

/* Mốc thời gian của màn. */
const MORPH = B0 + 0.05; // biểu đồ gập thành khung dashboard
const SWING = 8.15; // Lệch gõ búa quá tay
const COPIES = [8.2, 8.45, 8.7]; // Trùng đá vào ba khối y hệt nhau
const CHIP_IN = 8.85, CHIP_HIT = 9.05; // chip AI hiện ra; Chấm húc đầu vào như khối hỏi chấm
const FILL = 9.08; // AI lấp đầy phần còn lại
const SCAN = 10.0, FOUND = 10.3, FLICK = 10.48; // Chấm soát bằng kính lúp, bắt một khối sai
const CHIP = { x: 112, y: -62 };
const LENS_X = DX0 + 13 * PITCH + CELL / 2; // cột của khối sai

type Slot = { col: number; row: number; fill: string };
const slot = (col: number, row: number, fill = GREY): Slot => ({ col, row, fill });

/* Khung viền và ô KPI đầu tiên dựng từ chính các ô của biểu đồ; phần còn lại AI lấp. */
const FRAME: Slot[] = [];
for (let c = 0; c < DCOLS; c++) FRAME.push(slot(c, 0), slot(c, DROWS - 1));
for (let r = 1; r < DROWS - 1; r++) FRAME.push(slot(0, r), slot(DCOLS - 1, r));
const tile = (c0: number, fill: string) => [0, 1, 2].flatMap(c => [slot(c0 + c, 2, fill), slot(c0 + c, 3, fill)]);
const BAR_SLOTS = [1, 2, 3, 2, 4, 5].flatMap((h, i) => Array.from({ length: h }, (_, k) => slot(2 + i, 9 - k)));
const LINE_SLOTS: Slot[] = [[10, 9], [11, 8], [12, 8], [13, 7], [14, 6], [15, 5]].map(([c, r]) => slot(c, r, GREEN));
const BAD = LINE_SLOTS[3]; // AI đặt nhầm khối này: lệch hai hàng, sai màu
const TRUNG_SLOT = BAR_SLOTS[3]; // Trùng đá ba khối y hệt vào đúng một chỗ

/** Toàn bộ ô của biểu đồ lúc kết màn Phân tích, xếp theo x. */
const CHART_END = (() => {
  const out = PIXELS.map(p => ({ x: p.x, y: p.y, hot: p.last }));
  for (let r = 0; r < SHOOT; r++) for (let c = 0; c < 2; c++) out.push({ x: barLeft(LAST) + c * PITCH, y: -(BARS[LAST] + r + 1) * PITCH, hot: true });
  return out.sort((a, b) => a.x - b.x || a.y - b.y);
})();
const BUILT = [...FRAME.sort((a, b) => a.col - b.col || a.row - b.row), ...tile(2, GREEN), ...BAR_SLOTS.slice(0, CHART_END.length - FRAME.length - 6)];
const AI_SLOTS = [...tile(7, LIME), ...tile(12, GREY), ...BAR_SLOTS.slice(BUILT.length - FRAME.length - 6), ...LINE_SLOTS]
  .filter(s => s !== TRUNG_SLOT)
  .sort((a, b) => Math.hypot(dcell(a.col, a.row).x - CHIP.x, dcell(a.col, a.row).y - CHIP.y) - Math.hypot(dcell(b.col, b.row).x - CHIP.x, dcell(b.col, b.row).y - CHIP.y));

/** Bay theo đường cong từ `a` tới `b`. */
function fly(a: { x: number; y: number }, b: { x: number; y: number }, k: number, height: number) {
  const e = inOut(k);
  return { x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e) - hump(k) * height };
}

function dashboard(t: number) {
  const cells: Cell[] = [];
  const empty: { x: number; y: number }[] = [];
  if (t < B0 || t >= FOLD) return { cells, empty, stand: t < B0 ? 0 : 1 - seg(t, FOLD, FOLD + 0.2), chip: null as null | { y: number; s: number; o: number }, lens: 0 };

  // 1. Biểu đồ gập thành khung: ô nào gần thì bay về chỗ đó.
  BUILT.forEach((s, i) => {
    const from = CHART_END[i], to = dcell(s.col, s.row);
    const at = MORPH + (i / BUILT.length) * 0.28, k = seg(t, at, at + 0.3);
    const p = fly(from, to, k, 12);
    cells.push({ ...p, r: 90 * inOut(k), fill: k < 0.5 ? (from.hot ? GREEN : GREY) : s.fill });
  });

  // 2. Làm tay. Trùng đá ba khối y hệt vào cùng một chỗ — chồng lên nhau như bản sao.
  const ts = dcell(TRUNG_SLOT.col, TRUNG_SLOT.row);
  COPIES.forEach((at, n) => {
    if (t < at - 0.08) return;
    const start = { x: -86, y: -10 };
    const land = { x: ts.x + n * 1.8, y: ts.y - n * 1.8 };
    if (n > 0 && t > FILL + 0.07) {
      // AI dọn bản sao: hai khối thừa xẹp mất.
      const k = seg(t, FILL + 0.07, FILL + 0.17);
      if (k < 1) cells.push({ ...land, r: 0, s: 1 - k, fill: GREY });
      return;
    }
    const k = seg(t, at, at + 0.35);
    cells.push({ ...fly(start, land, k, 40), r: 360 * (1 - k), s: t < at ? outBack(seg(t, at - 0.08, at)) : 1, fill: GREY });
  });

  // Lệch gõ búa quá tay: khối bay vút lên, dội vào mép trên rồi văng mất.
  if (t >= SWING - 0.15 && t < SWING + 0.75) {
    const start = { x: -40, y: -12 }, hit = { x: dcell(8, 0).x, y: DY0 - CELL };
    const k1 = seg(t, SWING, SWING + 0.15);
    const p = t < SWING + 0.15 ? { x: lerp(start.x, hit.x, k1), y: lerp(start.y, hit.y, k1) } : fly(hit, { x: 175, y: -190 }, seg(t, SWING + 0.15, SWING + 0.75), 30);
    cells.push({ ...p, r: t < SWING + 0.15 ? 0 : (t - SWING) * 1400, s: t < SWING ? outBack(seg(t, SWING - 0.15, SWING - 0.07)) : 1, fill: GREY });
  }

  // 3. Chip AI bị húc: các ô còn lại tuôn ra từ chip, mỗi ô một đường cong, gần trước xa sau.
  AI_SLOTS.forEach((s, i) => {
    const at = FILL + i * 0.012;
    const to = dcell(s.col, s.row);
    const bad = s === BAD;
    const target = bad ? dcell(s.col, s.row - 2) : to;
    if (t < at) { empty.push(to); return; }
    const k = seg(t, at, at + 0.22);
    if (!bad || t < FLICK) {
      if (bad && k >= 1) empty.push(to);
      cells.push({ ...fly(CHIP, target, k, 18), r: 0, s: 0.4 + 0.6 * outBack(k), fill: bad ? RED : s.fill });
      return;
    }
    // Chấm giậm chân một cái: khối sai bật lên, lộn một vòng, về đúng hàng và đúng màu.
    const j = seg(t, FLICK, FLICK + 0.28);
    cells.push({ ...fly(target, to, j, 10), r: 360 * inOut(j), fill: j < 0.5 ? RED : s.fill });
    if (j < 1) empty.push(to);
  });
  if (t < COPIES[0] + 0.27) empty.push(ts);

  return {
    cells,
    // Ô trống nét đứt — hiện khi khung dựng xong, để thấy còn bao nhiêu việc.
    empty: t < MORPH + 0.45 ? [] : empty,
    stand: seg(t, 7.9, 8.1),
    chip: t < CHIP_IN ? null : {
      y: CHIP.y - hump(seg(t, CHIP_HIT, CHIP_HIT + 0.14)) * 5,
      s: outBack(seg(t, CHIP_IN, CHIP_IN + 0.12)) * (1 - seg(t, 9.5, 9.65)),
      o: 1 - seg(t, 9.5, 9.65),
    },
    lens: seg(t, SCAN - 0.05, SCAN + 0.05) * (1 - seg(t, S0, S0 + 0.1)),
  };
}

/* ---------- màn Ship: thùng hàng ---------- */

const S0 = 11.5; // màn Ship bắt đầu
const FOLD = 11.7; // dashboard gập thành thùng
const STAMP = 12.3; // Trùng đáp lên nóc thùng — đóng dấu
const BOOT = 12.75; // Lệch sút thùng bay khỏi khung
const CARD = "#c9a77c", TAPE = "#b08c5d";
/** Thùng hàng 11 × 8 ô, đáy chạm sàn. */
const BOX_COLS = 11, BOX_ROWS = 8, BOX_X0 = -11;
const BOX_W = BOX_COLS * PITCH - (PITCH - CELL), BOX_H = BOX_ROWS * PITCH - (PITCH - CELL);
const BOX = { x: BOX_X0 + BOX_W / 2, y: -BOX_H / 2 - 1, top: BOX_H + 1 };

/** Toàn bộ ô của dashboard lúc kết màn Build + AI, xếp từ trên xuống. */
const DASH_END = [...BUILT, ...AI_SLOTS, TRUNG_SLOT]
  .map(s => ({ ...dcell(s.col, s.row), fill: s.fill }))
  .sort((a, b) => a.y - b.y || a.x - b.x);
const BOX_SLOTS = Array.from({ length: BOX_COLS * BOX_ROWS }, (_, i) => {
  const col = i % BOX_COLS, row = Math.floor(i / BOX_COLS);
  return { x: BOX_X0 + col * PITCH, y: -BOX_H - 1 + row * PITCH, fill: col === 5 ? TAPE : CARD };
});

function ship(t: number) {
  // Thùng đã bay khỏi khung thì thôi vẽ — camera bay vào nav sẽ quét qua chỗ đó.
  if (t < FOLD || t > BOOT + 0.5) return null;
  // Dashboard sụp xuống thành thùng: hàng trên rơi trước; ô thừa nhập vào hàng đáy rồi biến mất.
  const cells: Cell[] = DASH_END.map((from, i) => {
    const extra = i >= BOX_SLOTS.length;
    const to = BOX_SLOTS[extra ? BOX_SLOTS.length - 1 - (i - BOX_SLOTS.length) : i];
    const at = FOLD + (i / DASH_END.length) * 0.22, k = seg(t, at, at + 0.26);
    return { ...fly(from, to, k, 8), r: 90 * inOut(k), fill: k < 0.5 ? from.fill : to.fill, s: extra ? 1 - k : 1 };
  });
  // Bị sút: bay vòng cung lên phải, lộn hơn một vòng, ra khỏi khung.
  const k = seg(t, BOOT, BOOT + 0.5);
  return {
    cells,
    dx: 240 * outQuad(k),
    dy: -170 * Math.sin(k * Math.PI * 0.6),
    rot: 400 * inQuad(k),
    // Dấu "đã duyệt" đập lên mặt thùng đúng lúc Trùng đáp xuống.
    stamp: t < STAMP ? 0 : outBack(seg(t, STAMP, STAMP + 0.12)),
    // Vệt gió sau cú sút.
    trail: k > 0 && k < 1 ? k : 0,
  };
}

/* ---------- màn Về nhà: logo 3×3 ---------- */

const H0 = 13.5; // màn Về nhà bắt đầu
/** Ô logo bằng đúng cỡ nhân vật; khoảng cách theo tỉ lệ BrandMark (ô 7, bước 9,5). */
const G = (S * 9.5) / 7;
const DIM = "#3a3a33", DASH = "#9b978a";
/** Điểm giữa-đáy của ô logo `i` — lưới đứng trên sàn, hàng dưới cùng chạm sàn. */
const cellPos = (i: number) => ({ x: ((i % 3) - 1) * G, lift: (2 - Math.floor(i / 3)) * G });
const HOME = { cham: 4, trung: 6, lech: 2 }; // khớp LOGO_CELLS của bạn đồng hành
const DIM_CELLS = [0, 1, 3, 5, 7, 8];

/* Mốc thời gian của màn. */
const GRID_IN = 13.65;
const CHAM_IN = 14.0, CHAM_LAND = 14.4; // Chấm vào ô giữa gọn gàng
const TRUNG_IN = 14.6, BUMP = 14.95, TRUNG_LAND = 15.3; // Trùng nhảy trùng ô, bị bật ra
const LECH_IN = 15.4, LECH_GONE = 15.78, LECH_BACK = 16.2, LECH_LAND = 16.45; // Lệch vọt quá, một nhịp sau mới rơi về

function logoGrid(t: number, trungOut = false) {
  if (t < GRID_IN) return null;
  if (t >= K0) {
    // Lúc xếp thế, ô trống dưới chân hai bạn đang nhảy cũng là ô tối. Trùng lẻn đi thì ô của
    // nó thành viền nét đứt — y như logo thật trên nav lúc đó.
    const gone = trungOut && t >= SLIP;
    return {
      dim: [...Array(9).keys()].filter(i => !(gone && i === HOME.trung)).map(i => ({ ...cellPos(i), s: 1 })),
      homes: [],
      empty: gone ? [{ ...cellPos(HOME.trung), o: seg(t, SLIP, SLIP + 0.1) }] : [],
    };
  }
  return {
    empty: [] as { x: number; lift: number; o: number }[],
    dim: DIM_CELLS.map((i, n) => ({ ...cellPos(i), s: outBack(seg(t, GRID_IN + n * 0.04, GRID_IN + n * 0.04 + 0.12)) })),
    // Ba ô nhà còn trống: viền nét đứt như logo trên nav khi ba bạn đi vắng.
    homes: [HOME.lech, HOME.cham, HOME.trung].map(i => ({ ...cellPos(i), o: seg(t, GRID_IN + 0.1, GRID_IN + 0.3) })),
  };
}

/* ---------- màn Ký tên + bay vào nav ---------- */

const K0 = 17; // màn Ký tên bắt đầu
/** Vòng ô quanh tâm logo, theo chiều kim đồng hồ — đường chéo sáng quay như kim. */
const RING = [0, 1, 2, 5, 8, 7, 6, 3];
const SPIN0 = 17.05, SPIN_STEP = 0.1; // tám bước = một vòng, đi qua đủ bốn thế đường chéo
const NAME_IN = 17.95, ROLE_IN = 18.15, ROLE_STEP = 0.15;
const TEXT_OUT = 18.75, STAGE_OUT = 18.85; // chữ tắt, rồi nền giấy và sàn tan để lộ trang
const FLY = 19.0, FLY_END = 19.55; // logo thu nhỏ bay vào logo trên nav
const SLIP = 19.62; // Trùng lẻn khỏi logo, rơi xuống biểu đồ hero
/** Khung logo trong thế giới: ô S, bước G, ba ô một cạnh. */
const LOGO_SIZE = 2 * G + S;
const LOGO_C = { x: 0, y: -LOGO_SIZE / 2 };
/** Tỉ lệ thế giới / BrandMark (viewBox 26, ô 7). */
const BRAND = S / 7;

/** Chỗ của logo trên nav, theo toạ độ khung vẽ; null thì bay về góc trên-trái. */
export type NavMark = { x: number; y: number; w: number };

/** Một bạn ở ô RING[i0] quay theo vòng: vị trí lúc `t`. */
function spinPos(t: number, i0: number) {
  const n = Math.max(0, Math.min(RING.length, Math.floor((t - SPIN0) / SPIN_STEP) + 1));
  const from = cellPos(RING[(i0 + Math.max(0, n - 1)) % RING.length]), to = cellPos(RING[(i0 + n) % RING.length]);
  if (n === 0) return { ...cellPos(RING[i0]), hop: 0 };
  const k = seg(t, SPIN0 + (n - 1) * SPIN_STEP, SPIN0 + (n - 1) * SPIN_STEP + SPIN_STEP * 0.9);
  return { x: lerp(from.x, to.x, inOut(k)), lift: lerp(from.lift, to.lift, inOut(k)), hop: hump(k) };
}

/** Camera bay: logo thu nhỏ, tâm logo trượt thẳng (trên màn hình) tới tâm logo trên nav. */
function flyCamera(t: number, from: Cam, W: number, H: number, nav: NavMark | null): Cam {
  const target = nav ?? { x: 24, y: 20, w: 28 };
  const k = inOut(seg(t, FLY, FLY_END));
  const z1 = target.w / LOGO_SIZE;
  const z = Math.exp(lerp(Math.log(from.z), Math.log(z1), k));
  const a = { x: W / 2 + (LOGO_C.x - from.cx) * from.z, y: H / 2 + (LOGO_C.y - from.cy) * from.z };
  const b = { x: target.x + target.w / 2, y: target.y + target.w / 2 };
  const sx = lerp(a.x, b.x, k), sy = lerp(a.y, b.y, k);
  return { z, cx: LOGO_C.x - (sx - W / 2) / z, cy: LOGO_C.y - (sy - H / 2) / z };
}

function sign(t: number) {
  if (t < K0) return null;
  return {
    name: seg(t, NAME_IN, NAME_IN + 0.2) * (1 - seg(t, TEXT_OUT, TEXT_OUT + 0.15)),
    roles: [0, 1, 2, 3].map(i => outBack(seg(t, ROLE_IN + i * ROLE_STEP, ROLE_IN + i * ROLE_STEP + 0.12)) * (1 - seg(t, TEXT_OUT, TEXT_OUT + 0.15))),
  };
}

/* ---------- camera ---------- */

function camera(t: number, W: number, H: number, nav: NavMark | null): Cam {
  const cover = (box: number) => Math.max(W, H) / box; // vùng box×box phủ kín màn hình
  const contain = (bw: number, bh: number) => Math.min(W / bw, H / bh);
  const keys = [
    { cx: 0, cy: -7, z: cover(10) }, // chỉ thấy thân Chấm — đen kịt
    { cx: 0, cy: -8, z: cover(12) },
    // Hai con mắt khổng lồ: bề ngang vừa lọt trong thân (rộng 30), mép thân vừa chớm lộ.
    // Màn dọc không giấu được mép thân, thì ít nhất phải thấy đủ hai mắt (rộng 18).
    { cx: 0, cy: -18, z: Math.max(W / 28, Math.min(H / 40, W / 22)) },
    { cx: 0, cy: -44, z: contain(230, 125) }, // toàn cảnh sàn giấy
    { cx: 0, cy: -62, z: contain(280, 165) }, // lùi thêm cho biểu đồ và cột nhân đôi
    { cx: 0, cy: -68, z: contain(250, 190) }, // lưới logo đứng trên sàn
    { cx: 0, cy: -48, z: contain(250, 215) }, // chừa chỗ cho tên dưới logo
  ];
  const mix = (a: Cam, b: Cam, k: number): Cam => ({
    cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k),
    z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), k)),
  });
  let cam: Cam;
  if (t < 0.9) cam = mix(keys[0], keys[1], inOut(seg(t, 0, 0.9)));
  else if (t < 2.3) cam = mix(keys[1], keys[2], inOut(seg(t, 0.9, 2.0)));
  else if (t < A0) cam = mix(keys[2], keys[3], outExpo(seg(t, 2.3, 3.0)));
  else if (t < H0) cam = mix(keys[3], keys[4], inOut(seg(t, A0, A0 + 0.45)));
  else if (t < K0) cam = mix(keys[4], keys[5], inOut(seg(t, H0, H0 + 0.5)));
  else {
    cam = mix(keys[5], keys[6], inOut(seg(t, 17.85, 18.15)));
    if (t >= FLY) return flyCamera(t, cam, W, H, nav);
  }
  // Lệch rơi về: cả lưới rung.
  if (t > LECH_LAND) cam.cx += Math.sin((t - LECH_LAND) * 90) * 2.2 * (1 - seg(t, LECH_LAND, LECH_LAND + 0.3));
  // Lùi rất chậm sau khi đã đứng khung, cho cảnh không chết.
  if (t < A0) cam.z *= 1 - 0.015 * clamp(t - 3);
  // Giật mình, cú đá: camera khựng một cái.
  cam.cy += pulse(t, 2.18, 0.08) * 0.6 + pulse(t, KICK, 0.07) * 1.4 + pulse(t, CHIP_HIT, 0.07) * 1.2 + pulse(t, FLICK, 0.05) * 0.5 + pulse(t, STAMP, 0.05) * 0.8 + pulse(t, BOOT, 0.06) * 1.2;
  return cam;
}

/* ---------- diễn viên ---------- */

function chamAt(t: number): Buddy {
  if (t >= B0) return chamBuild(t);
  const b = still(0);
  if (t < A0) {
    b.blink = pulse(t, 1.82, 0.09);
    // Giật mình: mắt mở to, rồi nhỏ lại khi đã nhảy lùi.
    b.eye = 1 + 0.35 * outBack(seg(t, 2.12, 2.24)) * (1 - seg(t, 2.6, 2.8));
    // Lấy đà (bẹp) → bật lùi → đáp (bẹp) → đứng thẳng.
    const hop = seg(t, 2.3, 2.72);
    b.lift = hump(hop) * 11;
    b.squash = 0.35 * pulse(t, 2.26, 0.06) - 0.25 * Math.sin(hop * Math.PI) * (hop > 0 && hop < 1 ? 1 : 0)
      + 0.45 * pulse(t, 2.76, 0.1);
    // Ngượng: liếc xuống góc, rồi nhìn lại ống kính và lắc người vẫy chào.
    const shy = seg(t, 2.78, 2.9) * (1 - seg(t, 3.0, 3.1));
    b.lookX = -0.8 * shy; b.lookY = 0.5 * shy;
    b.rot = wave(t, 3.05);
    return b;
  }
  // Pixel đổ xuống: ngước nhìn, nhảy tránh sang trái.
  b.lookY = -1 * seg(t, A0, A0 + 0.08) * (1 - seg(t, 4.55, 4.65));
  if (t < RUN.t0) {
    const k = seg(t, 4.3, 4.58);
    b.x = lerp(0, RUN.x0, inOut(k));
    b.lift = hump(k) * 16;
    b.squash = 0.3 * pulse(t, 4.27, 0.04) + 0.4 * pulse(t, 4.6, 0.07);
    b.lookX = t > 4.62 ? 1 : 0;
    return b;
  }
  if (t < KICK - 0.15) {
    // Chạy quét qua đống pixel — chạy tới đâu pixel về chỗ tới đó.
    const k = seg(t, RUN.t0, RUN.t1);
    b.x = lerp(RUN.x0, RUN.x1, k);
    b.lift = hops(k, 5, 5);
    b.rot = k > 0 && k < 1 ? 7 : 0;
    b.squash = 0.4 * pulse(t, RUN.t1 + 0.04, 0.07);
    b.lookX = 1 - 2 * seg(t, 5.5, 5.6);
    // Thấy cột cuối tự cao gấp đôi: mắt mở to, ngước lên.
    b.lookY = -seg(t, 5.74, 5.8);
    b.eye = 1 + 0.3 * seg(t, 5.76, 5.82);
    return b;
  }
  // Nhảy lên đá bay phần trùng, rồi đáp xuống; ngước nhìn Lệch, rồi nhìn cột cuối.
  b.x = RUN.x1;
  const up = KICK - 0.15;
  b.lift = t < KICK ? lerp(0, 64, outQuad(seg(t, up, KICK))) : lerp(64, 0, inQuad(seg(t, KICK, KICK + 0.2)));
  b.rot = -28 * pulse(t, KICK, 0.08);
  b.squash = 0.35 * pulse(t, up - 0.02, 0.04) + 0.4 * pulse(t, KICK + 0.22, 0.07);
  b.lookX = -1;
  b.lookY = t < KICK + 0.3 ? -0.5 : -1 * (1 - seg(t, 6.85, 6.95)) + -0.6 * seg(t, 6.85, 6.95);
  b.eye = 1 + 0.3 * pulse(t, 7.0, 0.15);
  return b;
}

/** Lắc người sang hai bên hai lần — kiểu vẫy tay của một ô vuông. */
function wave(t: number, at: number, len = 0.7) {
  const k = seg(t, at, at + len);
  if (k <= 0 || k >= 1) return 0;
  return Math.sin(k * Math.PI * 4) * 10 * Math.sin(k * Math.PI);
}

function trungAt(t: number): Buddy {
  if (t >= B0) return trungBuild(t);
  const b = still(-58);
  if (t < A0) {
    // Trượt vào từ trái bằng hai bước nhảy nhỏ, mắt dán vào Chấm.
    const k = seg(t, 2.75, 3.2);
    b.x = lerp(-150, -58, inOut(k));
    b.lift = hops(k, 2, 5);
    b.squash = 0.3 * pulse(t, 3.22, 0.08);
    b.lookX = 0.9 * (1 - seg(t, 3.2, 3.3));
    // Bắt chước Chấm vẫy chào — chậm nửa nhịp.
    b.rot = wave(t, 3.3);
    b.blink = pulse(t, 3.95, 0.07);
    return b;
  }
  const home = -112, onBar = barMid(LAST), landed = -105;
  b.lookY = -1 * seg(t, A0 + 0.05, A0 + 0.15) * (1 - seg(t, 4.6, 4.7));
  if (t < 4.95) {
    // Né mưa pixel — trễ hơn Chấm một nhịp.
    const k = seg(t, 4.4, 4.7);
    b.x = lerp(-58, home, inOut(k));
    b.lift = hump(k) * 12;
    b.squash = 0.4 * pulse(t, 4.72, 0.07);
    b.lookX = t > 4.75 ? 1 : 0;
    return b;
  }
  if (t < 5.5) {
    // Chạy theo Chấm, bắt chước từng bước nhảy.
    const k = seg(t, 4.95, 5.45);
    b.x = lerp(home, barLeft(LAST) - 16, k);
    b.lift = hops(k, 5, 5);
    b.rot = k > 0 && k < 1 ? 7 : 0;
    b.lookX = 1;
    return b;
  }
  if (t < KICK) {
    // Nhảy lên đỉnh cột cuối — cột tự nhân đôi dưới chân, đẩy Trùng lên cao.
    const k = seg(t, 5.5, 5.68);
    b.x = lerp(barLeft(LAST) - 16, onBar, k);
    const top = -barTop(LAST);
    b.lift = t < 5.68 ? lerp(0, top, k) + hump(k) * 14 : top + dupRows(t) * PITCH;
    b.squash = 0.4 * pulse(t, 5.7, 0.05);
    b.lookX = t < 5.68 ? 1 : 0;
    b.eye = 1 + 0.15 * seg(t, 5.75, 5.95);
    return b;
  }
  // Bị đá bay theo phần trùng: lộn vòng qua cả biểu đồ, rơi xuống sàn bên trái, choáng.
  const k = seg(t, KICK, KICK + 0.45);
  const high = -barTop(LAST) + BARS[LAST] * PITCH;
  b.x = lerp(onBar, landed, k);
  b.lift = lerp(high, 0, inQuad(k)) + hump(k) * 25;
  b.rot = k < 1 ? -540 * k : Math.sin((t - KICK) * 18) * 6 * (1 - seg(t, 6.6, 6.9));
  b.squash = 0.6 * pulse(t, KICK + 0.47, 0.08);
  b.blink = k < 1 ? 0.6 : 0.7 * (1 - seg(t, 6.75, 6.9));
  b.lookX = 0.6 * seg(t, 6.85, 6.95);
  b.lookY = -seg(t, 6.85, 6.95);
  return b;
}

function lechAt(t: number): Buddy {
  if (t >= B0) return lechBuild(t);
  const b = still(64);
  if (t < A0) {
    // Rơi từ trên xuống, nảy lên quá đà rồi mới chịu đứng yên.
    const fall = seg(t, 2.95, 3.2);
    b.o = t < 2.95 ? 0 : 1;
    b.lift = t < 3.2 ? lerp(220, 0, inQuad(fall)) : hump(seg(t, 3.28, 3.62)) * 20 + hump(seg(t, 3.66, 3.8)) * 4;
    b.squash = (t < 3.2 ? -0.3 * fall : 0) + 0.6 * pulse(t, 3.24, 0.08) + 0.35 * pulse(t, 3.64, 0.06) + 0.15 * pulse(t, 3.82, 0.05);
    b.rot = t < 3.2 ? 0 : Math.sin(seg(t, 3.28, 3.62) * Math.PI * 2) * 12;
    b.lookX = -0.9 * seg(t, 3.85, 3.95);
    return b;
  }
  const home = -47, onBar = barMid(0), hang = 92;
  // Né mưa pixel bằng một cú lộn nhào qua đầu cả nhóm — Lệch thì phải quá đà.
  const k = seg(t, 4.25, 4.62);
  b.x = lerp(64, home, inOut(k));
  b.lift = hump(k) * 38;
  b.rot = -360 * inOut(k);
  b.squash = 0.5 * pulse(t, 4.64, 0.07);
  b.lookX = t > 4.7 ? 1 : 0;
  if (t < 6.02) return b;
  b.rot = 0;
  if (t < 6.2) {
    // Nhảy lên cột đầu…
    const j = seg(t, 6.02, 6.18);
    b.x = lerp(home, onBar, j);
    b.lift = lerp(0, -barTop(0), j) + hump(j) * 12;
    b.squash = 0.35 * pulse(t, 6.19, 0.03);
    return b;
  }
  b.x = onBar;
  if (t < 6.75) {
    // …rồi bật vọt lên cao hơn hẳn đường xu hướng và treo lơ lửng vẫy chào.
    const j = seg(t, 6.2, 6.38);
    b.lift = lerp(-barTop(0), hang, outQuad(j)) + Math.sin((t - 6.38) * 9) * 1.5 * seg(t, 6.38, 6.45);
    b.squash = -0.3 * (1 - j) * (j > 0 ? 1 : 0);
    b.rot = wave(t, 6.4, 0.35);
    return b;
  }
  // Nhận ra mình đang lơ lửng — rơi xuống.
  const j = seg(t, 6.75, 6.98);
  b.x = lerp(onBar, home, j);
  b.lift = lerp(hang, 0, inQuad(j));
  b.squash = -0.25 * j * (j < 1 ? 1 : 0) + 0.6 * pulse(t, 7.0, 0.08);
  b.eye = 1 + 0.3 * (j > 0 && j < 1 ? 1 : 0);
  b.lookX = 1 * seg(t, 7.05, 7.15);
  b.lookY = -seg(t, 7.05, 7.15);
  return b;
}

/* ---------- màn Build + AI: diễn viên ---------- */

function chamBuild(t: number): Buddy {
  if (t >= S0) return chamShip(t);
  const b = still(RUN.x1);
  // Đứng xem hai bạn làm tay, thở dài một cái.
  b.lookX = -1;
  b.lookY = -0.3;
  b.squash = 0.25 * pulse(t, 8.72, 0.1);
  if (t < CHIP_HIT + 0.2) {
    // Chip AI hiện trên đầu: ngước lên, nhún, húc đầu vào như khối hỏi chấm.
    if (t >= CHIP_IN) { b.lookX = 0; b.lookY = -1; b.eye = 1 + 0.2 * seg(t, CHIP_IN, CHIP_IN + 0.08); }
    const reach = -CHIP.y - 6 - S;
    b.lift = t < CHIP_HIT ? lerp(0, reach, outQuad(seg(t, 8.93, CHIP_HIT))) : lerp(reach, 0, inQuad(seg(t, CHIP_HIT, CHIP_HIT + 0.17)));
    b.squash += 0.35 * pulse(t, 8.9, 0.04) - 0.25 * pulse(t, 9.0, 0.06) + 0.4 * pulse(t, CHIP_HIT + 0.19, 0.06);
    return b;
  }
  if (t < 9.65) { b.eye = 1.2; return b; }
  if (t < SCAN) {
    // Nhảy lên mép trên màn hình.
    const k = seg(t, 9.65, 9.95);
    b.x = lerp(RUN.x1, 84, k);
    b.lift = lerp(0, TOP, k) + hump(k) * 20;
    b.squash = 0.4 * pulse(t, 9.97, 0.05);
    b.lookY = 1;
    return b;
  }
  // Đi dọc mép trên, kính lúp thả xuống quét màn hình; thấy khối sai thì khựng lại, giậm chân.
  const k = seg(t, SCAN, FOUND);
  b.x = lerp(84, LENS_X, k);
  b.lift = TOP + hops(k, 3, 3);
  b.lookY = 1;
  b.lookX = k < 1 ? -0.6 : 0;
  b.eye = 1 + 0.35 * seg(t, FOUND, FOUND + 0.06) * (1 - seg(t, 10.7, 10.85));
  b.squash = 0.5 * pulse(t, FLICK - 0.02, 0.06);
  // Sửa xong: nhảy mừng một cái.
  b.lift += hump(seg(t, 10.85, 11.1)) * 8;
  if (t > 10.85) { b.lookY = 0; b.lookX = 0; }
  return b;
}

function trungBuild(t: number): Buddy {
  if (t >= S0) return trungShip(t);
  const b = still(lerp(-105, -100, seg(t, B0, B0 + 0.3)));
  b.blink = 0.7 * (1 - seg(t, B0, B0 + 0.15));
  b.lookX = 1; b.lookY = -0.5;
  // Ba cú đá, ba khối y hệt nhau.
  COPIES.forEach(at => { b.rot += 14 * pulse(t, at + 0.02, 0.06); b.squash += 0.3 * pulse(t, at, 0.05); });
  // AI chạy: giật nảy, mắt tròn xoe.
  const jump = seg(t, FILL + 0.02, FILL + 0.25);
  b.x -= 8 * inOut(jump);
  b.lift = hump(jump) * 10;
  b.eye = 1 + 0.5 * seg(t, FILL, FILL + 0.06) * (1 - seg(t, 9.6, 9.9));
  if (t > SCAN) b.lookY = -1;
  return b;
}

function lechBuild(t: number): Buddy {
  if (t >= S0) return lechShip(t);
  const k = seg(t, B0 + 0.1, B0 + 0.3);
  const b = still(lerp(-47, -58, k));
  b.lift = hump(k) * 8;
  b.lookX = 1;
  // Nện búa xong thì nhìn khối bay vút đi, rồi ngượng nhìn xuống.
  b.lookY = -seg(t, SWING + 0.05, SWING + 0.12) * (1 - seg(t, 8.75, 8.85)) + 0.6 * seg(t, 8.75, 8.85) * (1 - seg(t, FILL, FILL + 0.05));
  b.squash = 0.3 * pulse(t, SWING, 0.05);
  // AI chạy: buông búa, giật nảy.
  const jump = seg(t, FILL + 0.04, FILL + 0.26);
  b.lift += hump(jump) * 12;
  b.eye = 1 + 0.5 * seg(t, FILL, FILL + 0.06) * (1 - seg(t, 9.6, 9.9));
  if (t > SCAN) b.lookY = -1;
  return b;
}

/** Búa của Lệch: gốc cán (toạ độ thế giới), góc (0 = dựng đứng, dương = nghiêng về trước). */
function hammerAt(t: number, lech: Buddy) {
  if (t < B0 + 0.35 || t > S0 + 0.15) return null;
  const s = outBack(seg(t, B0 + 0.35, B0 + 0.47));
  const hand = { x: lech.x + 14, y: -lech.lift - 11 };
  const swing = t < SWING - 0.12 ? lerp(-15, -55, seg(t, 8.0, SWING - 0.12))
    : t < SWING ? lerp(-55, 85, inQuad(seg(t, SWING - 0.06, SWING)))
    : lerp(85, -15, inOut(seg(t, SWING + 0.25, SWING + 0.5)));
  if (t < FILL + 0.04) return { ...hand, a: swing, s };
  // Rơi khỏi tay, nảy một cái rồi nằm im.
  const k = seg(t, FILL + 0.04, FILL + 0.3);
  return { x: hand.x + 6 * k, y: lerp(hand.y, -1.5, inQuad(k)) - hump(seg(t, FILL + 0.3, FILL + 0.42)) * 3, a: lerp(swing, 90, k), s };
}

/* ---------- màn Ship: diễn viên ---------- */

function chamShip(t: number): Buddy {
  if (t >= H0) return chamHome(t);
  // Nhảy từ mép màn hình xuống sàn bên phải, nhìn dashboard gập lại.
  const k = seg(t, S0, S0 + 0.25);
  const b = still(lerp(LENS_X, 122, k));
  b.lift = lerp(TOP, 0, k) + hump(k) * 14;
  b.squash = 0.4 * pulse(t, S0 + 0.27, 0.06);
  b.lookX = -1; b.lookY = -0.3;
  return watchKick(t, b);
}

function trungShip(t: number): Buddy {
  if (t >= H0) return trungHome(t);
  const b = still(-108);
  b.lookX = 1;
  if (t < 12.0) return b;
  // Nhảy qua đầu Lệch lên nóc thùng — đáp xuống là đóng dấu.
  if (t < STAMP + 0.12) {
    const k = seg(t, 12.0, STAMP);
    b.x = lerp(-108, BOX.x, k);
    b.lift = lerp(0, BOX.top, k) + hump(k) * 34;
    b.rot = -20 * hump(k);
    b.squash = 0.6 * pulse(t, STAMP + 0.02, 0.06);
    return b;
  }
  // Nhảy xuống bên phải, tránh đường cho Lệch.
  const k = seg(t, 12.42, 12.62);
  b.x = lerp(BOX.x, 88, k);
  b.lift = lerp(BOX.top, 0, k) + hump(k) * 10;
  b.squash = 0.35 * pulse(t, 12.64, 0.05);
  b.lookX = -1;
  return watchKick(t, b);
}

function lechShip(t: number): Buddy {
  if (t >= H0) return lechHome(t);
  const b = still(-58);
  b.lookX = 1;
  b.lookY = t > 12.0 && t < STAMP + 0.1 ? -1 : 0;
  // Lấy đà chạy tới, sút.
  const k = seg(t, 12.45, 12.7);
  b.x = lerp(-58, BOX_X0 - S / 2 - 1, k);
  b.lift = hops(k, 2, 5);
  b.rot = (k > 0 && k < 1 ? 8 : 0) + 30 * pulse(t, BOOT, 0.08);
  b.squash = 0.4 * pulse(t, BOOT - 0.04, 0.04);
  // Sút xong: nhảy cẫng lên.
  b.lift += hump(seg(t, 13.05, 13.3)) * 10;
  return watchKick(t, b);
}

/** Sau cú sút cả ba ngước nhìn theo thùng bay. */
function watchKick(t: number, b: Buddy) {
  const k = seg(t, BOOT + 0.05, BOOT + 0.15);
  if (k > 0) { b.lookX = lerp(b.lookX, 1, k); b.lookY = lerp(b.lookY, -1, k); }
  return b;
}

/* ---------- màn Về nhà: diễn viên ---------- */

function chamHome(t: number): Buddy {
  if (t >= K0) return chamSign(t);
  const b = still(122);
  const home = cellPos(HOME.cham);
  b.lookX = -0.7;
  // Vào ô giữa gọn gàng: một cú nhảy, đáp đúng chỗ, sáng đèn.
  const k = seg(t, CHAM_IN, CHAM_LAND);
  b.x = lerp(122, home.x, inOut(k));
  b.lift = lerp(0, home.lift, k) + hump(k) * 45;
  b.perch = k >= 1 ? home.lift : 0;
  b.squash = 0.3 * pulse(t, CHAM_IN - 0.04, 0.04) + 0.35 * pulse(t, CHAM_LAND + 0.02, 0.06) + 0.45 * pulse(t, BUMP, 0.06);
  b.glow = seg(t, CHAM_LAND + 0.05, CHAM_LAND + 0.2);
  if (t > TRUNG_IN - 0.1) b.lookX = 1;
  // Bị Trùng giẫm lên đầu: nhắm tịt mắt, rồi liếc xuống nhìn Trùng.
  b.blink = pulse(t, BUMP + 0.03, 0.08);
  if (t > BUMP + 0.08) { b.lookX = -1; b.lookY = 1; }
  // Chờ Lệch rơi về: ngước lên; Lệch đáp thì quay sang nhìn, rồi nhìn thẳng.
  if (t > LECH_GONE) { b.lookX = 0.3; b.lookY = -1; }
  if (t > LECH_LAND) { b.lookX = 1; b.lookY = -0.6; }
  if (t > 16.8) { b.lookX = 0; b.lookY = 0; }
  b.blink += pulse(t, 16.92, 0.06);
  return b;
}

function trungHome(t: number): Buddy {
  const b = still(88);
  const target = cellPos(HOME.cham), home = cellPos(HOME.trung);
  b.lookX = -0.7;
  if (t < BUMP) {
    // Bắt chước Chấm: nhảy vào đúng ô của Chấm.
    const k = seg(t, TRUNG_IN, BUMP);
    b.x = lerp(88, target.x, inOut(k));
    b.lift = lerp(0, target.lift + S, k) + hump(k) * 40;
    b.squash = 0.3 * pulse(t, TRUNG_IN - 0.04, 0.04);
    return b;
  }
  // Dội khỏi đầu Chấm, lộn một vòng, rơi vào ô dưới trái.
  const k = seg(t, BUMP, TRUNG_LAND);
  b.x = lerp(target.x, home.x, k);
  b.lift = lerp(target.lift + S, home.lift, inQuad(k)) + hump(k) * 18;
  b.rot = -360 * outQuad(k);
  b.squash = 0.5 * pulse(t, TRUNG_LAND + 0.02, 0.07);
  b.blink = 0.6 * (1 - seg(t, TRUNG_LAND + 0.1, TRUNG_LAND + 0.3));
  b.glow = seg(t, TRUNG_LAND + 0.05, TRUNG_LAND + 0.2);
  b.lookX = 0.6;
  if (t > LECH_GONE) { b.lookX = 0.6; b.lookY = -1; }
  if (t > LECH_LAND) { b.lookX = 1; b.lookY = -1; }
  if (t > 16.8) { b.lookX = 0; b.lookY = 0; }
  b.blink += pulse(t, 16.95, 0.06);
  return b;
}

function lechHome(t: number): Buddy {
  if (t >= K0) return lechSign(t);
  // Tránh chỗ cho lưới hiện ra.
  const back = seg(t, H0 + 0.05, H0 + 0.3);
  const b = still(lerp(BOX_X0 - S / 2 - 1, -100, inOut(back)));
  b.lift = hump(back) * 10;
  b.lookX = 1;
  const home = cellPos(HOME.lech);
  if (t < LECH_IN) return b;
  if (t < LECH_BACK) {
    // Vọt lên quá đà, bay qua ô của mình, ra khỏi khung.
    const k = seg(t, LECH_IN, LECH_GONE);
    b.x = lerp(-100, 150, k);
    b.lift = 210 * k;
    b.rot = -360 * k;
    b.squash = 0.4 * pulse(t, LECH_IN - 0.04, 0.04) - 0.3 * (k > 0 && k < 1 ? 1 : 0);
    return b;
  }
  // Một nhịp sau mới rơi thẳng xuống ô trên phải; cả lưới rung.
  const k = seg(t, LECH_BACK, LECH_LAND);
  b.x = home.x;
  b.lift = lerp(330, home.lift, inQuad(k));
  b.perch = k >= 1 ? home.lift : 0;
  b.squash = -0.3 * (k < 1 ? 1 : 0) + 0.7 * pulse(t, LECH_LAND + 0.02, 0.09);
  b.rot = k >= 1 ? Math.sin((t - LECH_LAND) * 30) * 5 * (1 - seg(t, LECH_LAND, LECH_LAND + 0.35)) : 0;
  b.glow = seg(t, LECH_LAND + 0.05, LECH_LAND + 0.2);
  b.lookX = -1 * seg(t, 16.55, 16.65) * (1 - seg(t, 16.8, 16.9));
  b.blink = pulse(t, 16.98, 0.06);
  return b;
}

/* ---------- màn Ký tên: diễn viên ---------- */

/** Chung cho cả ba lúc đã thành ô logo: sáng lime, chớp mắt cùng nhau, mắt tắt khi bay vào nav. */
function asLogo(t: number, b: Buddy) {
  b.glow = 1;
  b.perch = b.lift;
  b.blink = pulse(t, 18.45, 0.06);
  b.eyes = 1 - seg(t, FLY + 0.05, FLY + 0.3);
  return b;
}

function chamSign(t: number): Buddy {
  const home = cellPos(HOME.cham);
  const b = still(home.x);
  b.lift = home.lift;
  // Ô giữa là trục quay: mỗi bước nhún một cái như kim giây.
  for (let n = 0; n < RING.length; n++) b.squash += 0.12 * pulse(t, SPIN0 + n * SPIN_STEP, 0.04);
  return asLogo(t, b);
}

function spinner(t: number, i0: number): Buddy {
  const p = spinPos(t, i0);
  const b = still(p.x);
  b.lift = p.lift + p.hop * 6;
  b.squash = -0.15 * p.hop;
  return asLogo(t, b);
}

function lechSign(t: number): Buddy {
  return spinner(t, RING.indexOf(HOME.lech));
}

function trungSign(t: number, out: boolean): Buddy {
  const b = spinner(t, RING.indexOf(HOME.trung));
  if (!out || t < SLIP) return b;
  // Đã nằm trong logo trên nav: Trùng lặng lẽ tụt ra khỏi ô, rơi xuống biểu đồ ở hero.
  const k = seg(t, SLIP, END);
  b.lift -= 900 * inQuad(k);
  b.x += 60 * k;
  b.rot = 25 * k;
  b.o = 1 - seg(t, END - 0.1, END);
  b.perch = cellPos(HOME.trung).lift;
  return b;
}

export function frame(t: number, W: number, H: number, nav: NavMark | null = null, trungOut = false) {
  const lech = lechAt(t);
  return {
    cam: camera(t, W, H, nav),
    sign: sign(t),
    // Nền giấy và sàn tan dần để lộ trang thật phía sau trước khi logo bay vào nav.
    stage: 1 - seg(t, STAGE_OUT, STAGE_OUT + 0.3),
    chart: chart(t),
    dash: dashboard(t),
    ship: ship(t),
    logo: logoGrid(t, trungOut),
    hammer: hammerAt(t, lech),
    cast: [
      { b: t >= K0 ? trungSign(t, trungOut) : trungAt(t), color: "var(--text)" },
      { b: lech, color: "var(--accent)" },
      { b: chamAt(t), color: "var(--text)" },
    ],
    // "!" của Chấm: lúc giật mình ở mở màn, và lúc bắt được khối sai.
    startled: seg(t, 2.14, 2.24) * (1 - seg(t, 2.7, 2.85)) + seg(t, FOUND, FOUND + 0.08) * (1 - seg(t, 10.7, 10.8)),
    burst: seg(t, CHIP_HIT, CHIP_HIT + 0.3),
    captions: {
      analyze: seg(t, 6.15, 6.35) * (1 - seg(t, B0, B0 + 0.15)),
      build: seg(t, 9.25, 9.45) * (1 - seg(t, S0, S0 + 0.15)),
      ship: seg(t, BOOT + 0.03, BOOT + 0.23) * (1 - seg(t, H0, H0 + 0.15)),
    },
  };
}

/* ---------- vẽ ---------- */

function BuddyShape({ b, color, stage }: { b: Buddy; color: string; stage: number }) {
  const w = S * (1 + b.squash * 0.25), h = S * (1 - b.squash * 0.25);
  const ex = S * 0.2, ey = -h + S * 0.38;
  const rx = S * 0.1 * b.eye, ry = S * 0.12 * b.eye * (1 - b.blink * 0.88);
  const lx = b.lookX * S * 0.08, ly = b.lookY * S * 0.06;
  const perch = b.perch ?? 0, glow = b.glow ?? 0;
  const shadow = clamp(1 - b.lift / 60);
  // Về đúng ô thì thân sáng lime như ô logo; mắt đổi sang màu mực cho còn nhìn thấy.
  const eyes = glow > 0.5 ? "var(--text)" : "var(--bg)";
  return <g opacity={b.o}>
    {perch <= 0 && <ellipse cx={b.x} cy={0.6} rx={S * 0.55 * (0.6 + 0.4 * shadow)} ry={S * 0.06} fill="var(--text)" opacity={0.1 * shadow * stage} />}
    <g transform={`translate(${b.x} ${-b.lift}) rotate(${b.rot})`}>
      <rect x={-w / 2} y={-h} width={w} height={h} rx={S * 0.08 * (1 - glow)} fill={color} />
      {glow > 0 && <rect x={-w / 2} y={-h} width={w} height={h} rx={S * 0.08 * (1 - glow)} fill={LIME} opacity={glow} />}
      <g opacity={b.eyes ?? 1}>
        <ellipse cx={-ex + lx} cy={ey + ly} rx={rx} ry={ry} fill={eyes} />
        <ellipse cx={ex + lx} cy={ey + ly} rx={rx} ry={ry} fill={eyes} />
      </g>
    </g>
  </g>;
}

export function IntroFilm({ freeze, sfx, muted, onMuteFallback, onEnd, onTone, trungOut }: {
  freeze: number | null; onEnd: () => void; onTone: (tone: "dark" | "light" | "clear") => void;
  /** Tiếng hiệu ứng (một file trộn sẵn, chạy theo giờ thật). Đứng yên một khung thì không phát. */
  sfx: string; muted: boolean; onMuteFallback: () => void;
  /** Trang đang để trống ô của Trùng trong logo nav (Trùng nấp trong biểu đồ hero). */
  trungOut: boolean;
}) {
  const [t, setT] = useState(freeze ?? 0);
  const [size, setSize] = useState<{ W: number; H: number } | null>(null);

  // Đo chính khung vẽ, không đo cửa sổ: trang đang giữ chỗ thanh cuộn nên hộp thoại hẹp hơn innerWidth.
  const boxRef = useRef<HTMLDivElement>(null);
  // Chỗ logo trên nav — đích của cú bay cuối. Nav còn xê dịch khi font tải xong, nên đo
  // lại liên tục trong lúc bay, không đo một lần lúc mở.
  const [nav, setNav] = useState<NavMark | null>(null);
  const measureNav = useCallback(() => {
    const box = boxRef.current;
    const mark = document.querySelector(".home-brand svg")?.getBoundingClientRect();
    if (!box || !mark || !mark.width) return setNav(null);
    const r = box.getBoundingClientRect();
    setNav(prev => {
      const next = { x: mark.left - r.left, y: mark.top - r.top, w: mark.width };
      return prev && prev.x === next.x && prev.y === next.y && prev.w === next.w ? prev : next;
    });
  }, []);
  useEffect(() => {
    const box = boxRef.current!;
    const ro = new ResizeObserver(() => { setSize({ W: box.clientWidth, H: box.clientHeight }); measureNav(); });
    ro.observe(box);
    document.fonts?.ready.then(measureNav);
    return () => ro.disconnect();
  }, [measureNav]);
  useEffect(() => { if (t >= FLY - 0.1) measureNav(); }, [t, measureNav]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const clockRef = useRef(0); // giờ thật của phim, để bật tiếng giữa chừng vào đúng chỗ
  // Chưa có cú chạm nào thì Chrome chặn cả phát câm với <audio>, nên lúc đầu tiếng có thể chưa
  // chạy. Người xem bấm loa (là một cú chạm) thì bắt đầu phát từ đúng giây phim đang chiếu.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = muted;
    if (!muted && audio.paused && !(clockRef.current >= audio.duration)) {
      audio.currentTime = clockRef.current;
      audio.play().catch(() => {});
    }
  }, [muted]);

  useEffect(() => {
    if (freeze !== null) { setT(freeze); return; }
    let raf = 0, last = performance.now(), clock = 0, ended = false;
    // Trình duyệt chặn phát có tiếng thì báo lên để nút loa hiện "Bật tiếng"; phim vẫn chạy.
    const audio = audioRef.current;
    if (audio && !audio.muted) {
      audio.currentTime = 0;
      audio.play().catch(() => onMuteFallback());
    }
    const tick = (now: number) => {
      // Tab ẩn thì rAF dừng; khi quay lại không nhảy cóc qua đoạn đã lỡ.
      clock += Math.min(now - last, 50) / 1000;
      clockRef.current = clock;
      last = now;
      // Tiếng là file trộn sẵn theo giờ thật: lệch quá 0,12s (vd. vừa quay lại tab) thì kéo về.
      if (audio && !audio.paused && Math.abs(audio.currentTime - clock) > 0.12) audio.currentTime = clock;
      const film = filmTime(clock);
      setT(film);
      if (film >= END) { if (!ended) { ended = true; onEnd(); } return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); audio?.pause(); };
    // Chỉ chạy một lần mỗi lượt phim; `muted` đổi giữa chừng do effect riêng lo.
  }, [freeze, onEnd, onMuteFallback]);

  // Mép ngoài hộp thoại (rãnh thanh cuộn) cùng tông với khung hình: tối lúc còn dí sát Chấm, sáng sau đó.
  // Cuối phim nền tan hẳn: hộp thoại trong suốt để trang thật hiện ra sau logo đang bay.
  const tone = t >= STAGE_OUT + 0.3 ? "clear" : t >= LIGHT_AT ? "light" : "dark";
  useEffect(() => { onTone(tone); }, [tone, onTone]);

  const film = size && frame(t, size.W, size.H, nav, trungOut);
  return <div ref={boxRef} className="pf-intro-film">
    {size && film && <Scene {...size} {...film} t={t} />}
    {freeze === null && <audio ref={audioRef} src={sfx} preload="auto" muted={muted} />}
  </div>;
}

function Pixel({ c }: { c: Cell }) {
  const s = c.s ?? 1, half = CELL / 2;
  return <rect x={c.x + half - half * s} y={c.y + half - half * s} width={CELL * s} height={CELL * s} rx={0.6}
    fill={c.fill ?? (c.hot ? GREEN : GREY)} opacity={c.o ?? 1}
    transform={c.r ? `rotate(${c.r} ${c.x + half} ${c.y + half})` : undefined} />;
}

/** Ngôi sao bốn cánh trên chip AI. */
const SPARK = "M0 -4.2 C0.6 -1.2 1.2 -0.6 4.2 0 C1.2 0.6 0.6 1.2 0 4.2 C-0.6 1.2 -1.2 0.6 -4.2 0 C-1.2 -0.6 -0.6 -1.2 0 -4.2 Z";

function Scene({ W, H, t, cam, chart, dash, ship: box, logo, sign: signed, stage, hammer, cast, startled, burst, captions: shown }: { W: number; H: number; t: number } & ReturnType<typeof frame>) {
  const { bubbles, captions, stat, signature } = content.prototype.intro;
  const cham = cast[2].b, lech = cast[1].b;
  const trend = [barMid(0), barTop(0) - 3, barMid(LAST), barTop(LAST) - 3];
  const lensY = DY0 + BAD.row * PITCH - 2 * PITCH + CELL / 2; // ngang hàng khối AI đặt nhầm
  const bad = dash.cells.length ? dcell(BAD.col, BAD.row - 2) : null;
  const caption = (text: string, k: number) => k > 0 && <text x={0} y={13 + 4 * (1 - outQuad(k))} textAnchor="middle" opacity={k}
    fontFamily="var(--hero-poster), sans-serif" fontSize={9.5} fill="var(--text)">{text}</text>;
  return <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
    {stage > 0 && <rect width={W} height={H} fill="var(--bg)" opacity={stage} />}
    <g transform={`translate(${W / 2} ${H / 2}) scale(${cam.z}) translate(${-cam.cx} ${-cam.cy})`}>
      {stage > 0 && <g opacity={stage}>
        <rect x={-2000} y={0} width={4000} height={2000} fill="#ebe8de" />
        <line x1={-2000} x2={2000} y1={0} y2={0} stroke="var(--line)" strokeWidth={0.6} />
      </g>}

      {dash.stand > 0 && <g fill={GREY} opacity={dash.stand}>
        <rect x={DX0 + 8 * PITCH} y={DY0 + DROWS * PITCH - 1} width={PITCH + CELL} height={-DY0 - DROWS * PITCH + 1} />
        <rect x={DX0 + 6 * PITCH} y={-2} width={6 * PITCH} height={2} rx={0.6} />
      </g>}
      {dash.empty.map((e, i) => <rect key={i} x={e.x + 0.3} y={e.y + 0.3} width={CELL - 0.6} height={CELL - 0.6} rx={0.6}
        fill="none" stroke={GREY} strokeWidth={0.45} strokeDasharray="1.1 0.9" opacity={0.8} />)}
      {chart.cells.map((c, i) => <Pixel key={i} c={c} />)}
      {dash.cells.map((c, i) => <Pixel key={i} c={c} />)}
      {box && <g transform={`translate(${box.dx} ${box.dy}) rotate(${box.rot} ${BOX.x} ${BOX.y})`}>
        {box.trail > 0 && [-14, 0, 14].map(o => <line key={o} x1={BOX.x - BOX_W / 2 - 6} x2={BOX.x - BOX_W / 2 - 6 - 40 * (1 - box.trail)}
          y1={BOX.y + o} y2={BOX.y + o} stroke="var(--text)" strokeWidth={1.2} strokeLinecap="round" opacity={0.35} />)}
        {box.cells.map((c, i) => <Pixel key={i} c={c} />)}
        {box.stamp > 0 && <g transform={`translate(${BOX.x + 18} ${BOX.y + 8}) rotate(-12) scale(${2.2 - 1.2 * box.stamp})`} opacity={clamp(box.stamp * 1.5)}>
          <rect x={-9} y={-9} width={18} height={18} rx={3} fill="none" stroke={GREEN} strokeWidth={1.8} />
          <path d="M-5 0.5 L-1.5 4 L5.5 -4" fill="none" stroke={GREEN} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        </g>}
      </g>}
      {chart.trend > 0 && chart.trendFade > 0 && <line
        x1={trend[0]} y1={trend[1]} x2={lerp(trend[0], trend[2], chart.trend)} y2={lerp(trend[1], trend[3], chart.trend)}
        stroke="var(--text)" strokeWidth={0.9} strokeDasharray="3 2.2" strokeLinecap="round" opacity={0.75 * chart.trendFade} />}

      {dash.chip && <g transform={`translate(${CHIP.x} ${dash.chip.y}) scale(${dash.chip.s})`} opacity={dash.chip.o}>
        <rect x={-7} y={-7} width={14} height={14} rx={2.2} fill={LIME} stroke="var(--text)" strokeWidth={0.8} />
        <path d={SPARK} fill="var(--text)" />
      </g>}
      {burst > 0 && burst < 1 && <circle cx={CHIP.x} cy={CHIP.y} r={8 + 26 * outQuad(burst)} fill="none" stroke={LIME} strokeWidth={2.2 * (1 - burst)} />}

      {logo && <g>
        {logo.dim.map((c, i) => <rect key={i} x={c.x - (S / 2) * c.s} y={-c.lift - S / 2 - (S / 2) * c.s} width={S * c.s} height={S * c.s} fill={DIM} />)}
        {logo.homes.map((c, i) => <rect key={i} x={c.x - S / 2 + 1.5} y={-c.lift - S + 1.5} width={S - 3} height={S - 3}
          fill="none" stroke={DASH} strokeWidth={1.3} strokeDasharray="4.5 3.5" opacity={c.o} />)}
        {/* Ô trống đúng nét của BrandMark (inset 0,5, cạnh 6, nét 1, gạch 1,6/1,2) để khớp logo thật. */}
        {logo.empty.map((c, i) => <rect key={i} x={c.x - S / 2 + 0.5 * BRAND} y={-c.lift - S + 0.5 * BRAND} width={6 * BRAND} height={6 * BRAND}
          fill="none" stroke={DASH} strokeWidth={BRAND} strokeDasharray={`${1.6 * BRAND} ${1.2 * BRAND}`} opacity={c.o} />)}
      </g>}

      {cast.map(({ b, color }, i) => <BuddyShape key={i} b={b} color={color} stage={stage} />)}

      {hammer && <g transform={`translate(${hammer.x} ${hammer.y}) rotate(${hammer.a}) scale(${hammer.s})`}>
        <rect x={-0.8} y={-15} width={1.6} height={15} rx={0.6} fill="#9a6b3f" />
        <rect x={-5} y={-19} width={10} height={5} rx={1} fill="var(--text)" />
      </g>}

      {dash.lens > 0 && <g opacity={dash.lens}>
        <line x1={cham.x} y1={-cham.lift} x2={cham.x} y2={lensY - 9} stroke="var(--text)" strokeWidth={0.5} />
        <circle cx={cham.x} cy={lensY} r={9 * outBack(dash.lens)} fill="rgb(255 255 255 / .35)" stroke="var(--text)" strokeWidth={1.4} />
        {/* Trong kính: khối sai phóng to, chỉ khi kính đang nằm ngay trên nó. */}
        {bad && startled > 0 && Math.abs(cham.x - LENS_X) < 1 && (() => {
          const c = dash.cells.find(x => x.fill === RED);
          return c && <rect x={c.x + CELL / 2 - CELL} y={c.y + CELL / 2 - CELL} width={CELL * 2} height={CELL * 2} rx={1} fill={RED} />;
        })()}
      </g>}

      {chart.circle > 0 && <circle cx={lech.x} cy={-lech.lift - S / 2} r={S * 0.95}
        fill="none" stroke={RED} strokeWidth={1.6} pathLength={1} strokeDasharray="1 1"
        strokeDashoffset={1 - chart.circle} transform={`rotate(-80 ${lech.x} ${-lech.lift - S / 2})`} />}
      {chart.stat && <text x={barMid(LAST)} y={chart.stat.y} textAnchor="middle"
        fontFamily="var(--hero-mono), monospace" fontWeight={700} fontSize={7.5 * chart.stat.pop} fill={GREEN}>
        {lerp(stat.from, stat.to, chart.stat.k).toFixed(1)}{stat.suffix}</text>}

      {startled > 0 && <text
        x={cham.x + S * 0.62} y={-cham.lift - S * 1.12}
        transform={`rotate(12 ${cham.x + S * 0.62} ${-cham.lift - S * 1.12})`}
        fontSize={S * 0.5 * outBack(clamp(startled))} fontWeight={800} fill={GREEN} textAnchor="middle"
        opacity={clamp(startled * 2)}>{bubbles.startled}</text>}

      {caption(captions.analyze, shown.analyze)}
      {caption(captions.build, shown.build)}
      {caption(captions.ship, shown.ship)}

      {signed && signed.name > 0 && <g>
        <text x={0} y={24 + 5 * (1 - outQuad(signed.name))} textAnchor="middle" opacity={signed.name}
          fontFamily="var(--hero-poster), sans-serif" fontSize={17} fill="var(--text)">{signature.name}</text>
        <text x={0} y={40} textAnchor="middle" fontFamily="var(--hero-mono), monospace" fontWeight={700} fontSize={7} letterSpacing={0.8} fill={GREEN}>
          {signature.roles.map((r, i) => <tspan key={r} opacity={clamp(signed.roles[i])}>{i > 0 ? signature.sep : ""}{r}</tspan>)}
        </text>
      </g>}
    </g>
    {/* Nối từ nhịp đen của teaser cũ (đen tuyền): bắt đầu đen tuyền rồi mới lộ thân Chấm (đen ấm). */}
    {t < 0.8 && <rect width={W} height={H} fill="#000" opacity={1 - seg(t, 0.15, 0.8)} />}
  </svg>;
}
