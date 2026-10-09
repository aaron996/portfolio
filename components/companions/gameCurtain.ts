/* Chấm kéo rèm vào game (kịch bản: docs/companions.md, mục "Game Ải Vận Hành").

   Dựng như một sân khấu hoạt hình: diềm vòm rơi xuống, sàn gỗ trồi lên, hai nửa rèm
   nhung trượt vào, gấp dồn ở mép (scaleX nhỏ). Chấm nhảy tới, nắm mép rèm phải và kéo:
   rèm duỗi nếp ra, tà rèm trễ nhịp (skew), vượt quá một chút rồi đậu lại. Lúc mở thì
   ngược lại, kèm bóng chào, hoa giấy ô vuông, rồi cả sân khấu rút đi.

   Rèm là DOM thuần gắn vào <body>, không thuộc React: nhờ vậy nó sống sót qua cú chuyển
   trang `/` → `/game`. Trang chủ gọi `closeCurtain` rồi mới chuyển trang; trang game
   gọi `openCurtain`. Chữ trong bong bóng đến từ `content.game.curtain`. */

import { arc, toFrame, type Pose } from "@/components/home/heroBuddies";
import { companions } from "./store";

const ID = "game-curtain";
const BUNCH = 0.15; // rèm gấp dồn ở mép: bề ngang còn bấy nhiêu
const EASE = "cubic-bezier(.45,.05,.25,1)";
const POP = "cubic-bezier(.3,1.5,.5,1)"; // vọt quá rồi về, như cao su
const LEAN = -8; // Chấm ngả về phía trước lúc kéo
const STALE_MS = 8000; // rèm không ai nhận (vd. chuyển trang hỏng) thì tự gỡ
const CONFETTI = ["#161614", "#1f5a3d", "#dcf25a", "#f3f1ea", "#c8372d"];

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
const frames = () => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
const fin = (a: Animation) => a.finished.then(() => {}, () => {});

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, parent?: Element) {
  const node = document.createElement(tag);
  node.className = className;
  parent?.append(node);
  return node;
}

/** Chỉ diễn khi người xem còn muốn bạn đồng hành và không giảm chuyển động. */
export function curtainAllowed() {
  if (typeof window === "undefined") return false;
  return companions.get().enabled && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type Geo = { vw: number; vh: number; floorH: number; top: number; floor: number; chip: number; W: number };

function measure(): Geo {
  const vw = window.innerWidth, vh = window.innerHeight;
  const floorH = Math.round(Math.max(64, vh * 0.1));
  return {
    vw, vh, floorH,
    top: Math.round(Math.max(60, vh * 0.11)), // chiều cao diềm vòm
    floor: vh - Math.round(floorH * 0.42), // chỗ chân Chấm đứng trên sàn
    chip: Math.round(Math.min(40, Math.max(26, vh * 0.045))),
    W: vw * 0.52, // mỗi nửa rèm phủ hơn nửa màn một chút để khép chồng lên nhau
  };
}

type Stage = {
  root: HTMLElement; g: Geo;
  left: HTMLElement; right: HTMLElement; leftCloth: HTMLElement; rightCloth: HTMLElement;
  valance: HTMLElement; floor: HTMLElement; chip: HTMLElement; body: HTMLElement; eyes: HTMLElement;
};

function build(g: Geo): Stage {
  const root = el("div", "gc");
  root.id = ID;
  root.dataset.geo = JSON.stringify(g);
  root.setAttribute("aria-hidden", "true");
  root.style.setProperty("--gc-top", `${g.top}px`);
  root.style.setProperty("--gc-floor", `${g.floorH}px`);
  root.style.setProperty("--gc-chip", `${g.chip}px`);
  const floor = el("div", "gc-floor", root);
  const left = el("div", "gc-drape gc-left", root);
  const leftCloth = el("div", "gc-cloth", left);
  const right = el("div", "gc-drape gc-right", root);
  const rightCloth = el("div", "gc-cloth", right);
  const valance = el("div", "gc-valance", root);
  el("div", "gc-trim", valance);
  const chip = el("div", "gc-chip", root);
  const body = el("div", "gc-chip-body", chip);
  const eyes = el("span", "gc-eyes", body);
  eyes.append(document.createElement("i"), document.createElement("i"));
  return { root, g, left, right, leftCloth, rightCloth, valance, floor, chip, body, eyes };
}

function find(): Stage | null {
  const root = document.getElementById(ID);
  if (!root) return null;
  const q = (s: string) => root.querySelector<HTMLElement>(s)!;
  return {
    root, g: JSON.parse(root.dataset.geo!) as Geo,
    left: q(".gc-left"), right: q(".gc-right"), leftCloth: q(".gc-left .gc-cloth"), rightCloth: q(".gc-right .gc-cloth"),
    valance: q(".gc-valance"), floor: q(".gc-floor"), chip: q(".gc-chip"), body: q(".gc-chip-body"), eyes: q(".gc-eyes"),
  };
}

/** Nhún lên xuống theo nhịp bước chạy. */
function bob(body: HTMLElement, duration: number, lift = 7) {
  return body.animate(
    [{ transform: "translateY(0)" }, { transform: `translateY(${-lift}px)` }, { transform: "translateY(0)" }],
    { duration: 190, iterations: Math.max(1, Math.round(duration / 190)) },
  );
}

/** Bẹp xuống rồi bật lên — lúc đáp, lúc nhảy. */
function squash(body: HTMLElement, depth = 0.3, duration = 220) {
  body.style.transformOrigin = "50% 100%";
  return fin(body.animate(
    [{ transform: "scale(1,1)" }, { transform: `scale(${1 + depth},${1 - depth})`, offset: 0.4 }, { transform: `scale(${1 - depth * 0.4},${1 + depth * 0.5})`, offset: 0.75 }, { transform: "scale(1,1)" }],
    { duration, easing: "ease-out" },
  ));
}

/** Thân chuyển động của rèm: thời điểm, bề ngang (gấp dồn → duỗi) và độ trễ của tà rèm. */
const PULL = {
  close: { at: [0, 0.55, 0.85, 1], scale: [BUNCH, 0.8, 1.03, 1], skew: [0, -5, 2, 0] },
  open: { at: [0, 0.18, 0.7, 1], scale: [1, 1.04, 0.45, BUNCH], skew: [0, 2.5, -5, 0] },
};

/** Hai nửa rèm và Chấm kéo cùng nhịp: Chấm luôn ở ngay trước mép trong của nửa rèm phải. */
function pull(s: Stage, dir: keyof typeof PULL, duration: number) {
  const { g } = s;
  const p = PULL[dir];
  const key = (side: 1 | -1) => p.at.map((offset, i) => ({
    offset, easing: EASE,
    transform: `scaleX(${p.scale[i]}) skewX(${side * p.skew[i]}deg)`,
  }));
  const lead = (i: number) => g.vw - g.W * p.scale[i] - g.chip * 0.7;
  const chipFrames = p.at.map((offset, i) => ({ offset, easing: EASE, ...toFrame({ x: lead(i), y: g.floor, r: LEAN }, g.chip) }));
  return Promise.all([
    fin(s.leftCloth.animate(key(-1), { duration, fill: "forwards" })),
    fin(s.rightCloth.animate(key(1), { duration, fill: "forwards" })),
    fin(s.chip.animate(chipFrames, { duration, fill: "forwards" })),
  ]);
}

/** Một nhịp lắc tắt dần của tà rèm sau khi dừng. */
function ripple(s: Stage, duration = 650) {
  const k = (side: number, deg: number) => ({ transform: `scaleX(1) skewX(${side * deg}deg)` });
  const frames = (side: number) => [k(side, 0), k(side, 2.2), k(side, -1.5), k(side, 0.9), k(side, -0.4), k(side, 0)];
  s.leftCloth.animate(frames(-1), { duration, easing: "ease-out" });
  s.rightCloth.animate(frames(1), { duration, easing: "ease-out" });
}

/** Hoa giấy: những ô vuông dữ liệu bắn ra từ Chấm. */
function confetti(s: Stage, at: { x: number; y: number }) {
  for (let i = 0; i < 18; i++) {
    const piece = el("i", "gc-piece", s.root);
    const size = 6 + Math.random() * 7;
    piece.style.cssText = `width:${size}px;height:${size}px;background:${CONFETTI[i % CONFETTI.length]};left:${at.x}px;top:${at.y}px`;
    const dx = (Math.random() - 0.5) * 520, up = 140 + Math.random() * 180, fall = 80 + Math.random() * 120;
    const spin = (Math.random() - 0.5) * 900;
    piece.animate([
      { transform: "translate(0,0) rotate(0deg) scale(.4)", opacity: 1 },
      { transform: `translate(${dx * 0.6}px, ${-up}px) rotate(${spin * 0.5}deg) scale(1)`, opacity: 1, offset: 0.45, easing: "ease-in" },
      { transform: `translate(${dx}px, ${fall}px) rotate(${spin}deg) scale(.8)`, opacity: 0 },
    ], { duration: 900 + Math.random() * 400, easing: "cubic-bezier(.2,.7,.4,1)", fill: "forwards", delay: Math.random() * 120 });
  }
}

/**
 * Trang chủ: dựng sân khấu, Chấm (ô đang ngồi trên thẻ game, nếu thấy) nhảy tới mép phải,
 * kéo rèm khép lại. Trả về khi rèm đã kín — lúc đó mới chuyển trang.
 */
export async function closeCurtain(card: DOMRect) {
  document.getElementById(ID)?.remove();
  const g = measure();
  const s = build(g);
  const { root, left, right, leftCloth, rightCloth, valance, floor, chip, body, eyes } = s;
  const bunched = `scaleX(${BUNCH})`;
  leftCloth.style.transform = rightCloth.style.transform = bunched;

  // Xuất phát từ chính Chấm đang ngồi trên thẻ (nếu thấy), không thì từ mép thẻ.
  const source = document.querySelector<HTMLElement>(".cmp .hs-buddy");
  const seen = source && getComputedStyle(source).opacity !== "0" ? source.getBoundingClientRect() : null;
  const from = seen && seen.width > 0
    ? { x: seen.left + seen.width / 2, y: seen.bottom, size: seen.width }
    : { x: card.left + card.width / 2, y: card.top, size: 18 };
  if (source && seen) source.style.visibility = "hidden";

  const edge = { x: g.vw - g.W * BUNCH - g.chip * 0.7, y: g.floor };
  const hop: Pose[] = arc(from, edge, Math.max(g.vh * 0.22, 100), 24).map((p, i, all) => {
    const k = (from.size + (g.chip - from.size) * (i / (all.length - 1))) / g.chip;
    return { ...p, sx: k, sy: k };
  });
  chip.style.transform = toFrame(hop[0], g.chip).transform;
  document.body.append(root);
  setTimeout(() => { if (root.isConnected && !root.dataset.claimed) root.remove(); }, STALE_MS);

  // 1. Sân khấu dựng lên: diềm vòm rơi xuống nảy một cái, sàn trồi lên, hai nửa rèm
  //    (đang gấp dồn) trượt vào. Cùng lúc Chấm nhảy tới mép phải.
  valance.animate([{ transform: "translateY(-110%)" }, { transform: "translateY(6%)", offset: 0.6 }, { transform: "translateY(0)" }], { duration: 480, easing: "ease-out", fill: "forwards" });
  floor.animate([{ transform: "translateY(101%)" }, { transform: "translateY(0)" }], { duration: 420, easing: POP, fill: "forwards" });
  left.animate([{ transform: "translateX(-101%)" }, { transform: "translateX(0)" }], { duration: 420, delay: 80, easing: POP, fill: "forwards" });
  right.animate([{ transform: "translateX(101%)" }, { transform: "translateX(0)" }], { duration: 420, delay: 80, easing: POP, fill: "forwards" });
  eyes.animate([{ transform: "translateX(0)" }, { transform: "translateX(-25%)" }], { duration: 200, delay: 320, fill: "forwards" });
  await fin(chip.animate(hop.map(p => toFrame(p, g.chip)), { duration: 600, easing: "linear", fill: "forwards" }));
  await squash(body, 0.35, 200);

  // 2. Kéo: hai nửa rèm duỗi nếp ra, Chấm đi trước mép rèm phải, nhún theo bước chạy.
  bob(body, 1100);
  await pull(s, "close", 1100);

  // 3. Rèm kín: tà rèm đung đưa tắt dần, Chấm bước ra giữa khe rèm và đứng thẳng lại.
  ripple(s);
  const mid = { x: g.vw / 2, y: g.floor };
  await fin(chip.animate([toFrame({ x: g.vw - g.W - g.chip * 0.7, y: g.floor, r: LEAN }, g.chip), toFrame({ ...mid, r: 0 }, g.chip)], { duration: 260, easing: "ease-out", fill: "forwards" }));
  eyes.animate([{ transform: "translateX(-25%)" }, { transform: "translateX(0)" }], { duration: 160, fill: "forwards" });
  await wait(160);
}

/** Trang game: Chấm chào trong bong bóng, kéo rèm mở ra, hoa giấy bay, sân khấu rút đi. */
export async function openCurtain(line: string) {
  const s = find();
  if (!s || s.root.dataset.claimed) return;
  const { root, g, left, right, valance, floor, chip, body, eyes } = s;
  root.dataset.claimed = "true";
  const mid = { x: g.vw / 2, y: g.floor };

  await frames();
  await wait(300); // để canvas game vẽ xong khung đầu dưới tấm rèm

  // 1. Chào: bong bóng thoại bật lên, Chấm nhún hai nhịp (bẹp rồi vọt lên).
  const rect = chip.getBoundingClientRect();
  const bubble = el("span", "gc-bubble", root);
  bubble.textContent = line;
  bubble.style.left = `${rect.left + rect.width / 2}px`;
  bubble.style.top = `${rect.top - g.chip * 1.5}px`;
  bubble.animate(
    [{ opacity: 0, transform: "translate(-50%, 10px) scale(.4)" }, { opacity: 1, transform: "translate(-50%, 0) scale(1)" }],
    { duration: 320, easing: POP, fill: "forwards" },
  );
  for (let n = 0; n < 2; n++) {
    await squash(body, 0.28, 180);
    await fin(chip.animate([toFrame(mid, g.chip), toFrame({ ...mid, y: mid.y - g.chip * 0.9, sx: 0.92, sy: 1.1 }, g.chip), toFrame(mid, g.chip)], { duration: 380, easing: "ease-out", fill: "forwards" }));
  }
  await wait(120);
  bubble.animate([{ opacity: 1, transform: "translate(-50%, 0) scale(1)" }, { opacity: 0, transform: "translate(-50%, -8px) scale(.8)" }], { duration: 180, fill: "forwards" });

  // 2. Chạy tới mép rèm phải, nắm lấy rồi kéo mở: rèm co nếp về hai bên.
  const grip = { x: g.vw - g.W - g.chip * 0.7, y: g.floor, r: LEAN };
  eyes.animate([{ transform: "translateX(0)" }, { transform: "translateX(25%)" }], { duration: 140, fill: "forwards" });
  await fin(chip.animate(arc(mid, grip, g.chip * 1.2, 12).map(p => toFrame({ ...p, r: LEAN }, g.chip)), { duration: 320, easing: "linear", fill: "forwards" }));
  bob(body, 1000);
  await pull(s, "open", 1000);
  confetti(s, { x: g.vw - g.W * BUNCH - g.chip, y: g.floor - g.chip });

  // 3. Rèm gấp ở mép, sân khấu rút: rèm trượt ra ngoài, diềm bay lên, sàn chìm xuống,
  //    Chấm nhảy bật đi.
  const out = { x: g.vw - g.W * BUNCH - g.chip * 0.7, y: g.floor };
  await Promise.all([
    fin(left.animate([{ transform: "translateX(0)" }, { transform: "translateX(-101%)" }], { duration: 420, easing: "cubic-bezier(.5,0,.8,.4)", fill: "forwards" })),
    fin(right.animate([{ transform: "translateX(0)" }, { transform: "translateX(101%)" }], { duration: 420, easing: "cubic-bezier(.5,0,.8,.4)", fill: "forwards" })),
    fin(valance.animate([{ transform: "translateY(0)" }, { transform: "translateY(8%)", offset: 0.25 }, { transform: "translateY(-115%)" }], { duration: 480, easing: "ease-in", fill: "forwards" })),
    fin(floor.animate([{ transform: "translateY(0)" }, { transform: "translateY(101%)" }], { duration: 420, easing: "ease-in", fill: "forwards" })),
    fin(chip.animate(
      [toFrame({ ...out, r: LEAN }, g.chip), toFrame({ x: out.x + g.chip * 1.2, y: out.y - g.chip * 2.2, r: 14 }, g.chip), { ...toFrame({ x: out.x + g.chip * 2.6, y: out.y + g.chip * 0.5, r: 30, sx: 0.5, sy: 0.5 }, g.chip), opacity: 0 }],
      { duration: 520, easing: "ease-in-out", fill: "forwards" },
    )),
  ]);
  await wait(700); // hoa giấy rơi nốt
  root.remove();
}
