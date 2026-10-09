/* Trận đấu lồng sắt ở footer. Sau khi ba ô đậu lên thẻ "Chơi Ải Vận Hành", club bật đèn,
   khán giả ùa vào; Chấm và Lệch nhảy xuống đấu khoảng 20 giây bằng đồ khán giả ném qua
   lồng — gậy bóng chày, ống nước, ghế xếp, chảo, súng, bình chữa cháy. Hai bên ăn miếng trả
   miếng, ba lần quay chậm + zoom cận cảnh (ghế đập, lộn người né đạn, cú kết liễu). Bên
   thắng bốc ngẫu nhiên mỗi lần diễn. Trùng đứng trên nóc lồng chụp ảnh, hết trận xuống chụp
   bên thắng nâng cúp.

   Toàn bộ chạy theo toạ độ tài liệu trên lớp `.cmp-page`; sân khấu là FightArena.tsx.
   Thời gian là "giờ trong phim": `wait` đếm theo một đồng hồ ảo chạy chậm lại khi quay chậm,
   và mọi animation đang chạy (nhân vật, hiệu ứng, khán giả) đổi playbackRate theo. Riêng ống
   kính (zoom) chạy giờ thật. */

import { arc, type Pose } from "@/components/home/heroBuddies";
import { content } from "@/content/content.vi";

const text = content.home.fight;

const CUP = `<svg viewBox="0 0 24 28" width="100%" height="100%" aria-hidden="true"><path d="M6 2h12v6a6 6 0 0 1-12 0z" fill="#f5c542"/><path d="M6 4H2.5v2A4 4 0 0 0 6 10M18 4h3.5v2a4 4 0 0 1-3.5 4" fill="none" stroke="#f5c542" stroke-width="2"/><rect x="10.5" y="13" width="3" height="6" fill="#d9a521"/><rect x="6.5" y="19" width="11" height="4" rx="1" fill="#f5c542"/></svg>`;
const CONFETTI = ["#dcf25a", "#ffffff", "#f5c542", "#7fd6ff", "#ff8aa8"];

type Face = 1 | -1;
type Point = { x: number; y: number };
type Weapon = "bat" | "pipe" | "pan" | "chair" | "gun" | "extinguisher" | "camera";
type Fighter = { i: number; x: number; y: number; k: number; wy: number; face: Face; hp: number; side: "a" | "b"; name: string; w: Weapon | null };
/** Khung hình của ống kính: nhìn vào điểm (x, y), phóng `s` lần. */
type Shot = Point & { s: number };

export type FightHost = {
  /** 0 Chấm, 1 Trùng (máy ảnh), 2 Lệch. */
  bodies: HTMLElement[];
  page: HTMLElement;
  arena: HTMLElement;
  footer: HTMLElement;
  size: number;
  reduced: boolean;
  animate: (i: number, poses: Pose[], options: KeyframeAnimationOptions) => Animation;
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

export function createFight(host: FightHost) {
  const { bodies, page, arena, footer, reduced } = host;
  const S = host.size;
  const cam = arena.querySelector<HTMLElement>(".hc-cam")!;
  const ac = new AbortController();
  const nodes = new Set<HTMLElement>();
  let finished = false;

  /* ---------- đồng hồ phim ---------- */

  let rate = 1, vBase = 0, rBase = performance.now();
  const vnow = () => vBase + (performance.now() - rBase) * rate;
  type Waiter = { at: number; id: number; resolve: () => void };
  const waiters = new Set<Waiter>();
  const schedule = (w: Waiter) => {
    clearTimeout(w.id);
    w.id = window.setTimeout(() => { waiters.delete(w); w.resolve(); }, Math.max(0, (w.at - vnow()) / rate));
  };
  const wait = (n: number) => new Promise<void>((resolve, reject) => {
    if (ac.signal.aborted) return reject(new Error("abort"));
    const w: Waiter = { at: vnow() + (reduced ? 0 : n), id: 0, resolve };
    waiters.add(w);
    schedule(w);
    ac.signal.addEventListener("abort", () => { clearTimeout(w.id); waiters.delete(w); reject(new Error("abort")); }, { once: true });
  });
  /** Chạy `fn` sau `n` ms giờ phim mà không chặn kịch bản. */
  const later = (n: number, fn: () => void) => { wait(n).then(fn, () => {}); };
  /** Cho một bước chạy song song; bị huỷ giữa chừng thì lặng lẽ dừng. */
  const meanwhile = (p: Promise<unknown>) => { p.catch(() => {}); };
  const ms = (n: number) => (reduced ? 1 : n);

  const lens = new Set<Animation>(); // animation của ống kính — luôn chạy giờ thật
  function track<T extends Animation>(a: T) {
    if (rate !== 1) a.playbackRate = rate;
    return a;
  }
  function setRate(r: number) {
    if (reduced || r === rate) return;
    vBase = vnow(); rBase = performance.now(); rate = r;
    waiters.forEach(schedule);
    [...page.getAnimations({ subtree: true }), ...arena.getAnimations({ subtree: true })]
      .forEach(a => { if (!lens.has(a)) a.updatePlaybackRate(r); });
  }

  const docRect = (el: Element) => {
    const r = el.getBoundingClientRect();
    return { left: r.left + scrollX, top: r.top + scrollY, width: r.width, height: r.height };
  };
  let A = docRect(arena);

  /* ---------- hiệu ứng rời ---------- */

  function node(cls: string, html = "") {
    const n = document.createElement("span");
    n.className = `cmp-fx ${cls}`;
    if (html) n.innerHTML = html;
    page.appendChild(n);
    nodes.add(n);
    return n;
  }
  const drop = (n: HTMLElement) => { n.remove(); nodes.delete(n); };
  function play(n: HTMLElement, frames: Keyframe[], duration: number, o: { easing?: string; keep?: boolean; delay?: number } = {}) {
    const a = track(n.animate(frames, { duration: ms(duration), easing: o.easing ?? "linear", fill: "forwards", delay: reduced ? 0 : o.delay ?? 0 }));
    if (!o.keep) a.finished.then(() => drop(n), () => {});
    return a;
  }
  const at = (x: number, y: number, s = 1, r = 0) => `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`;

  function sparks(x: number, y: number, color: string, count = 8, dist = 30, cls = "fx-spark") {
    for (let n = 0; n < count; n++) {
      const angle = (Math.PI * 2 * n) / count + Math.random() * 0.6;
      const d = dist * (0.6 + Math.random() * 0.6);
      const s = node(cls);
      s.style.background = color;
      play(s, [
        { transform: at(x, y, 1, (angle * 180) / Math.PI), opacity: 1 },
        { transform: at(x + Math.cos(angle) * d, y + Math.sin(angle) * d + (cls === "fx-shard" ? dist * 0.6 : 0), 0.4, (angle * 180) / Math.PI + 200), opacity: 0 },
      ], cls === "fx-shard" ? 700 : 380, { easing: "ease-out" });
    }
  }

  function popText(msg: string, x: number, y: number, cls: string, duration = 900, rise = 34) {
    const n = node(`fx-text ${cls}`);
    n.textContent = msg;
    play(n, [
      { transform: at(x, y, 0.4), opacity: 0 },
      { transform: at(x, y - 8, 1.15), opacity: 1, offset: 0.18 },
      { transform: at(x, y - rise * 0.6), opacity: 1, offset: 0.7 },
      { transform: at(x, y - rise), opacity: 0 },
    ], duration, { easing: "ease-out" });
  }

  function slashFx(x: number, y: number, dir: Face, scale = 1) {
    const r0 = dir > 0 ? -70 : 250, r1 = dir > 0 ? 40 : 140;
    play(node("fx-slash"), [
      { transform: at(x, y, 0.5 * scale, r0), opacity: 0 },
      { transform: at(x, y, 1.1 * scale, (r0 + r1) / 2), opacity: 1, offset: 0.4 },
      { transform: at(x, y, 1.3 * scale, r1), opacity: 0 },
    ], 280, { easing: "ease-out" });
  }

  function muzzle(x: number, y: number) {
    play(node("fx-muzzle"), [
      { transform: at(x, y, 0.3), opacity: 1 },
      { transform: at(x, y, 1.3), opacity: 1, offset: 0.4 },
      { transform: at(x, y, 0.2), opacity: 0 },
    ], 140);
  }

  function dust(x: number, y: number) {
    for (const dir of [-1, 1]) {
      play(node("fx-dust"), [
        { transform: at(x, y - 3, 0.5), opacity: 0.7 },
        { transform: at(x + dir * 18, y - 8, 1.6), opacity: 0 },
      ], 420, { easing: "ease-out" });
    }
  }

  function flash(strength = 0.9) {
    if (reduced) return;
    const n = node("fx-flash");
    Object.assign(n.style, { left: `${A.left}px`, top: `${A.top}px`, width: `${A.width}px`, height: `${A.height}px` });
    play(n, [{ opacity: 0 }, { opacity: strength, offset: 0.2 }, { opacity: 0 }], 280);
  }

  function confetti(count: number) {
    for (let n = 0; n < count; n++) {
      const c = node("fx-conf");
      c.style.background = CONFETTI[n % CONFETTI.length];
      const x0 = A.left + Math.random() * A.width, y0 = A.top - 8;
      const x1 = x0 + (Math.random() - 0.5) * 120, y1 = A.top + A.height - 40 - Math.random() * 24;
      play(c, [
        { transform: at(x0, y0, 1, 0), opacity: 1 },
        { transform: at(x1, y1, 1, (Math.random() - 0.5) * 900), opacity: 1, offset: 0.88 },
        { transform: at(x1, y1, 1, (Math.random() - 0.5) * 900), opacity: 0 },
      ], 1700 + Math.random() * 1000, { easing: "cubic-bezier(.3,.1,.5,1)", delay: Math.random() * 280 });
    }
  }

  /** Rung cả khung. Dùng `translate` để không giẫm lên `transform` của ống kính. */
  function shake(el: HTMLElement = arena, power = 5) {
    if (reduced) return;
    track(el.animate([
      { translate: "0 0" }, { translate: `${-power}px ${power * 0.6}px` }, { translate: `${power * 0.8}px ${-power * 0.6}px` },
      { translate: `${-power * 0.6}px ${power * 0.4}px` }, { translate: "0 0" },
    ], { duration: 380 }));
  }

  /* ---------- ống kính ---------- */

  let shot: Shot | null = null; // null = toàn cảnh
  let lensGen = 0;
  let pageO: Point = { x: 0, y: 0 };
  let pageSize = { w: 0, h: 0 };

  /** Biến đổi cho lớp nhân vật (kèm clip-path cắt đúng khung sàn đấu) và cho `.hc-cam`. Điểm
      nhìn kéo dần về giữa khung khi zoom sâu, nhưng không để lộ mép sân khấu. */
  function frame(v: Shot) {
    const right = A.left + A.width, bottom = A.top + A.height;
    const pull = (1 - 1 / v.s) * 0.8;
    const g = {
      x: clamp(v.x + (A.left + A.width / 2 - v.x) * pull, right - v.s * (right - v.x), A.left + v.s * (v.x - A.left)),
      y: clamp(v.y + (A.top + A.height / 2 - v.y) * pull, bottom - v.s * (bottom - v.y), A.top + v.s * (v.y - A.top)),
    };
    const shift = (o: Point) => ({ x: g.x - o.x - v.s * (v.x - o.x), y: g.y - o.y - v.s * (v.y - o.y) });
    const tp = shift(pageO), tc = shift({ x: A.left, y: A.top });
    const inset = [
      (A.top - pageO.y - tp.y) / v.s, pageSize.w - (right - pageO.x - tp.x) / v.s,
      pageSize.h - (bottom - pageO.y - tp.y) / v.s, (A.left - pageO.x - tp.x) / v.s,
    ];
    return {
      g,
      page: { transform: `translate(${tp.x}px, ${tp.y}px) scale(${v.s})`, clipPath: `inset(${inset.map(n => `${n.toFixed(1)}px`).join(" ")})` },
      cam: { transform: `translate(${tc.x}px, ${tc.y}px) scale(${v.s})` },
    };
  }

  function lensTo(next: Shot | null, duration: number) {
    if (reduced) return;
    const from = shot ?? { x: A.left + A.width / 2, y: A.top + A.height / 2, s: 1 };
    const to = next ?? { ...from, s: 1 };
    const pf: Keyframe[] = [], cf: Keyframe[] = [];
    for (let n = 0; n <= 8; n++) {
      const u = ease(n / 8);
      const f = frame({ x: from.x + (to.x - from.x) * u, y: from.y + (to.y - from.y) * u, s: from.s + (to.s - from.s) * u });
      pf.push(f.page); cf.push(f.cam);
    }
    const old = [...lens];
    const options = { duration, easing: "linear", fill: "forwards" as const };
    const a = page.animate(pf, options), b = cam.animate(cf, options);
    lens.add(a); lens.add(b);
    old.forEach(o => { o.cancel(); lens.delete(o); });
    shot = next;
    const gen = ++lensGen;
    // Về toàn cảnh xong thì gỡ hẳn biến đổi và clip-path khỏi lớp nhân vật.
    if (!next) a.finished.then(() => { if (gen === lensGen) { lens.forEach(o => o.cancel()); lens.clear(); } }, () => {});
    return gen;
  }

  /** Giật ống kính một nhịp khi có đòn nặng. */
  function punch(p: Point) {
    if (reduced || shot) return;
    const gen = lensTo({ ...p, s: 1.1 }, 70);
    later(90, () => { if (gen === lensGen) lensTo(null, 260); });
  }

  /** Quay chậm + zoom vào `on`; `null` thì về tốc độ thường và toàn cảnh. */
  function slowmo(on: Point | null, r = 0.25, s = 1.8, lensMs = 240) {
    if (reduced) return;
    if (on) {
      const g = frame({ ...on, s }).g;
      arena.style.setProperty("--fx", `${(((g.x - A.left) / A.width) * 100).toFixed(1)}%`);
      arena.style.setProperty("--fy", `${(((g.y - A.top) / A.height) * 100).toFixed(1)}%`);
      arena.dataset.slowmo = "true";
      setRate(r);
      lensTo({ ...on, s }, lensMs);
    } else {
      arena.dataset.slowmo = "false";
      setRate(1);
      lensTo(null, 420);
    }
  }

  /* ---------- khán giả ---------- */

  let crowdGen = 0;
  function roar(mode: "hype" | "gasp" | "chant", hold = 800) {
    arena.dataset.crowd = mode;
    const gen = ++crowdGen;
    later(hold, () => { if (gen === crowdGen) arena.dataset.crowd = "on"; });
  }

  /* ---------- dọn dẹp ---------- */

  function clean() {
    nodes.forEach(n => n.remove());
    nodes.clear();
    lens.forEach(a => a.cancel());
    lens.clear();
    shot = null;
    rate = 1;
    bodies.forEach(b => {
      delete b.dataset.ko; delete b.dataset.charge; delete b.dataset.spot;
      const w = b.querySelector<HTMLElement>(".hs-wpn");
      if (w) { delete w.dataset.w; w.getAnimations().forEach(a => a.cancel()); }
    });
    Object.assign(arena.dataset, { lit: "false", hud: "false", crowd: "off", slowmo: "false" });
    ["--hp-a", "--hp-b", "--fx", "--fy"].forEach(p => arena.style.removeProperty(p));
  }

  function stop() {
    ac.abort();
    clean();
    footer.dataset.fight = finished ? "done" : "idle";
  }

  /* ---------- kịch bản ---------- */

  async function sequence() {
    A = docRect(arena);
    const pr = docRect(page);
    pageO = { x: pr.left, y: pr.top };
    pageSize = { w: page.offsetWidth, h: page.offsetHeight };
    const floor = docRect(arena.querySelector(".hc-floor")!).top;
    const cage = docRect(arena.querySelector(".hc-cage")!);
    const cageEl = arena.querySelector<HTMLElement>(".hc-cage")!;
    const stands = docRect(arena.querySelector(".hc-crowd-back")!);
    const lamps = [...arena.querySelectorAll<HTMLElement>(".hc-light")];
    const cx = A.left + A.width / 2;
    const F = Math.round(clamp(S * 2.8, 40, Math.min(60, A.height * 0.15)));
    const half = clamp(A.width * 0.16, F * 2.2, F * 4.2);
    const L = cage.left + F * 0.9, R = cage.left + cage.width - F * 0.9;

    const init = (i: number, side: "a" | "b", name: string, face: Face): Fighter => {
      const r = bodies[i].getBoundingClientRect();
      return { i, x: r.left + r.width / 2 + scrollX, y: r.bottom + scrollY, k: r.width / S, wy: 1, face, hp: 100, side, name, w: null };
    };
    const X = init(0, "a", text.aName, 1), T = init(1, "a", "", 1), Y = init(2, "b", text.bName, -1);
    // W thắng, Z thua — bốc ngẫu nhiên mỗi lần diễn.
    const W = Math.random() < 0.5 ? X : Y, Z = W === X ? Y : X;
    /** Hướng về phía đối thủ: Chấm luôn đứng bên trái, Lệch bên phải. */
    const d = (f: Fighter): Face => (f === X ? 1 : -1);

    const part = (f: Fighter) => bodies[f.i].querySelector<HTMLElement>(".hs-wpn")!;
    const stand = (f: Fighter, m: { wx?: number; wy?: number; r?: number } = {}): Pose =>
      ({ x: f.x, y: f.y, r: m.r ?? 0, sx: f.face * f.k * (m.wx ?? 1), sy: f.k * f.wy * (m.wy ?? 1) });
    const go = (f: Fighter, poses: Pose[], duration: number, delay = 0) =>
      track(host.animate(f.i, poses, { duration: ms(duration), delay: reduced ? 0 : delay, easing: "linear" }));

    function hop(f: Fighter, x: number, y: number, height: number, duration: number, o: { k?: number; delay?: number; spin?: number; tilt?: number } = {}) {
      const k1 = o.k ?? f.k, k0 = f.k;
      const poses = arc({ x: f.x, y: f.y }, { x, y }, height, 16).map((p, n, all) => {
        const t = n / (all.length - 1), kk = k0 + (k1 - k0) * t;
        const r = o.spin !== undefined ? o.spin * t : o.tilt !== undefined ? o.tilt * Math.sin(t * Math.PI) : p.r;
        return { ...p, r, sx: f.face * kk, sy: kk * f.wy };
      });
      go(f, poses, duration, o.delay);
      f.x = x; f.y = y; f.k = k1;
    }
    const squash = (f: Fighter) => go(f, [stand(f), stand(f, { wx: 1.25, wy: 0.7 }), stand(f)], 160);
    const cheer = (f: Fighter, h = 0.8) => hop(f, f.x, f.y, F * h, 340);
    const duck = (f: Fighter, duration: number) =>
      go(f, [stand(f), stand(f, { wx: 1.3, wy: 0.5 }), stand(f, { wx: 1.3, wy: 0.5 }), stand(f)], duration);
    const flashBody = (f: Fighter) =>
      track(bodies[f.i].animate([{ filter: "brightness(3.2)" }, { filter: "brightness(1)" }], { duration: ms(170) }));
    const hand = (f: Fighter): Point => ({ x: f.x + d(f) * F * 0.45, y: f.y - F * 0.6 });

    async function rush(f: Fighter, toX: number, hops = 2) {
      const from = f.x;
      toX = clamp(toX, L, R);
      for (let n = 1; n <= hops; n++) {
        hop(f, from + ((toX - from) * n) / hops, floor, F * 0.4, 170);
        await wait(170);
      }
    }
    /** Lao tới sát đối thủ (cách `gap` lần cạnh thân). */
    const close = (f: Fighter, gap = 1.2, hops = 2) => rush(f, (f === X ? Y : X).x - d(f) * F * gap, hops);

    function shout(x?: number, y?: number) {
      popText(pick(text.cheers), x ?? A.left + A.width * (0.08 + Math.random() * 0.84),
        y ?? stands.top + Math.random() * stands.height * 0.5, "fx-cheer", 800, 22);
    }
    const rattle = () => shake(cageEl, 4);
    function snap() {
      if (T.w !== "camera") return;
      const p = { x: T.x + T.face * F * 0.45, y: T.y - F * 0.35 };
      play(node("fx-burst"), [{ transform: at(p.x, p.y, 0.3), opacity: 1 }, { transform: at(p.x, p.y, 1.7), opacity: 0 }], 260);
      flash(0.25);
      popText(text.shutter, p.x, T.y - F * 1.3, "fx-shutter", 700, 16);
    }

    /* Vũ khí */
    function item(w: Weapon) {
      const n = node("fx-item", `<span class="wpn" data-w="${w}"></span>`);
      n.style.width = n.style.height = `${F}px`;
      return n;
    }
    /** Đồ rời tay: rơi xuống sàn rồi mờ dần, hoặc văng hẳn ra khán đài. */
    function toss(w: Weapon, from: Point, dir: Face, far = false) {
      const to = far ? { x: from.x + dir * F * 4.5, y: stands.top + stands.height * 0.4 } : { x: from.x + dir * F * 1.1, y: floor - F * 0.2 };
      const path = arc(from, to, F * (far ? 2 : 0.7), 12);
      const frames: Keyframe[] = path.map((p, n, all) => ({ transform: at(p.x, p.y, 1, dir * (far ? 720 : 300) * (n / (all.length - 1))), offset: (n / (all.length - 1)) * 0.6 }));
      const last = frames[frames.length - 1].transform as string;
      play(item(w), [...frames, { transform: last, opacity: 1, offset: 0.8 }, { transform: last, opacity: 0 }], far ? 1000 : 900);
    }
    function equip(f: Fighter, w: Weapon | null, dropOld: "floor" | "far" | "none" = "floor") {
      if (f.w && dropOld !== "none") toss(f.w, hand(f), (-d(f)) as Face, dropOld === "far");
      f.w = w;
      const el = part(f);
      if (w) el.dataset.w = w; else delete el.dataset.w;
    }
    /** Khán giả ném đồ qua nóc lồng, rơi trúng tay. */
    async function fling(w: Weapon, f: Fighter, delay = 0) {
      if (delay) await wait(delay);
      const from = { x: clamp(f.x - d(f) * F * (1 + Math.random() * 2), A.left + 20, A.left + A.width - 20), y: stands.top + stands.height * 0.3 };
      const to = hand(f);
      const n = item(w);
      play(n, arc(from, to, F * 2.4, 16).map((p, k, all) => ({ transform: at(p.x, p.y, 1, 540 * (k / (all.length - 1))) })), 620);
      shout(from.x, from.y - F * 0.4);
      await wait(620);
      drop(n);
      equip(f, w);
      squash(f);
    }
    const wield = (f: Fighter, frames: Keyframe[], duration: number, o: KeyframeAnimationOptions = {}) =>
      track(part(f).animate(frames, { duration: ms(duration), easing: "ease-in-out", ...o }));
    const swing = (f: Fighter, duration = 380) => wield(f, [
      { transform: "rotate(0deg)" }, { transform: "rotate(-150deg)", offset: 0.35 },
      { transform: "rotate(95deg)", offset: 0.62 }, { transform: "rotate(0deg)" },
    ], duration);
    const flex = (f: Fighter) => wield(f, [{ transform: "rotate(0deg)" }, { transform: "rotate(-360deg)" }], 420);
    const raise = (f: Fighter) => wield(f, [{ transform: "rotate(0deg)" }, { transform: "rotate(-150deg)" }], 200, { easing: "ease-out", fill: "forwards" });
    const slam = (f: Fighter) => wield(f, [{ transform: "rotate(-150deg)" }, { transform: "rotate(70deg)", offset: 0.6 }, { transform: "rotate(0deg)" }], 220, { easing: "ease-in" });
    const guard = (f: Fighter) => wield(f, [
      { transform: "rotate(0deg)" }, { transform: "rotate(-62deg) translateY(-12%)", offset: 0.25 },
      { transform: "rotate(-62deg) translateY(-12%)", offset: 0.8 }, { transform: "rotate(0deg)" },
    ], 640);
    function fire(f: Fighter): Point {
      wield(f, [{ transform: "translateX(0) rotate(0deg)" }, { transform: "translateX(-25%) rotate(-14deg)", offset: 0.35 }, { transform: "translateX(0) rotate(0deg)" }], 240);
      const m = { x: f.x + d(f) * F * 0.95, y: f.y - F * 0.5 };
      muzzle(m.x, m.y);
      return m;
    }
    function bullet(from: Point, to: Point, speed = 0.9) {
      const angle = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
      const duration = Math.max(120, Math.hypot(to.x - from.x, to.y - from.y) / speed);
      play(node("fx-bullet"), [{ transform: at(from.x, from.y, 1, angle) }, { transform: at(to.x, to.y, 1, angle) }], duration);
      return duration;
    }
    function popLamp(el: HTMLElement) {
      const r = docRect(el.querySelector(".hc-lamp")!);
      sparks(r.left + r.width / 2, r.top + r.height, "#fff3a3", 12, 34);
      track(el.animate([
        { opacity: 1 }, { opacity: 0.1, offset: 0.08 }, { opacity: 1, offset: 0.16 }, { opacity: 0, offset: 0.24 },
        { opacity: 0, offset: 0.8 }, { opacity: 0.6, offset: 0.85 }, { opacity: 0, offset: 0.9 }, { opacity: 1 },
      ], { duration: ms(2800) }));
    }

    /** Trúng đòn: loé trắng, tia lửa, số sát thương, tụt máu, bật lùi (vào lồng thì lồng rung). */
    function hurt(f: Fighter, dmg: number, o: { knock?: number; big?: boolean; tilt?: number } = {}) {
      const dir = -d(f) as Face;
      flashBody(f);
      sparks(f.x, f.y - F * 0.5, "#ff7a6b", o.big ? 16 : 9, o.big ? 52 : 34);
      popText(`-${dmg}`, f.x, f.y - F * 1.3, "fx-dmg");
      f.hp = Math.max(0, f.hp - dmg);
      arena.style.setProperty(`--hp-${f.side}`, String(f.hp / 100));
      const want = f.x + dir * F * (o.knock ?? 0.9), x = clamp(want, L, R);
      hop(f, x, floor, F * 0.45, 330, { tilt: dir * (o.tilt ?? 16) });
      if (Math.abs(x - want) > 1) later(300, rattle);
      roar(o.big ? "gasp" : "hype", 700);
      if (Math.random() < 0.6) shout();
      if (o.big) punch({ x: f.x, y: f.y - F * 0.6 });
    }

    /* ----- 0. Club bật đèn, khán giả ùa vào, hai bên nhảy xuống ----- */
    bodies.forEach(b => { b.dataset.spot = "true"; });
    Object.assign(arena.dataset, { lit: "true", hud: "true", crowd: "on" });
    footer.dataset.fight = "on";
    arena.style.setProperty("--hp-a", "1");
    arena.style.setProperty("--hp-b", "1");
    hop(X, cx - half, floor, F * 2.4, 900, { k: F / S });
    hop(Y, cx + half, floor, F * 2.4, 900, { k: F / S, delay: 140 });
    // Trùng leo lên nóc lồng làm phó nháy: cột giữa bên trái, nhưng không đứng che biển neon.
    const neon = docRect(arena.querySelector(".hc-neon")!);
    const perch = Math.max(cage.left + F * 0.5, Math.min(cage.left + cage.width / 3, neon.left - F * 0.7));
    hop(T, perch, cage.top, F * 1.6, 900, { k: (F * 0.8) / S, delay: 260 });
    await wait(1050);
    squash(X); squash(Y);
    dust(X.x, floor); dust(Y.x, floor);
    roar("hype", 1000);
    equip(T, "camera");
    popText(text.go, cx, A.top + A.height * 0.32, "fx-banner", 1000, 10);
    snap();

    /* ----- 1. Khán giả ném vũ khí vào ----- */
    meanwhile(fling("bat", X, 250));
    await fling("pipe", Y, 380);
    flex(X); flex(Y);
    await wait(420);

    /* ----- 2. Lao vào nhau, vũ khí va chan chát ----- */
    meanwhile(rush(X, cx - F * 0.62, 2));
    await rush(Y, cx + F * 0.62, 2);
    swing(X, 340); swing(Y, 340);
    await wait(140);
    sparks(cx, X.y - F * 0.75, "#ffffff", 16, 44);
    popText(text.clang, cx, X.y - F * 1.6, "fx-text");
    punch({ x: cx, y: X.y - F * 0.7 });
    hop(X, X.x - F * 1.6, floor, F * 0.5, 380, { tilt: -14 });
    hop(Y, Y.x + F * 1.6, floor, F * 0.5, 380, { tilt: 14 });
    roar("hype", 700);
    shout();
    await wait(560);

    /* ----- 3. Ăn miếng trả miếng ----- */
    // Z vụt trước, W cúi né rồi phản đòn.
    await close(Z);
    swing(Z, 340); duck(W, 340);
    await wait(320);
    swing(W, 300);
    await wait(150);
    slashFx(W.x + d(W) * F * 0.95, W.y - F * 0.6, d(W));
    hurt(Z, 15);
    await wait(360);
    // Z vụt trả, W văng vào lồng.
    await close(Z, 1.2, 1);
    swing(Z, 320);
    await wait(160);
    slashFx(Z.x + d(Z) * F * 0.95, Z.y - F * 0.6, d(Z));
    hurt(W, 10, { knock: 2.6 });
    await wait(380);

    /* ----- 4. Ghế xếp — quay chậm lần 1 ----- */
    await fling("chair", Z);
    const up = raise(Z);
    hop(Z, W.x - d(Z) * F * 1.1, floor, F * 2.4, 640);
    await wait(400);
    slowmo({ x: W.x, y: W.y - F * 0.8 }, 0.3, 1.8);
    await wait(200);
    slam(Z); up.cancel();
    await wait(100);
    flash(0.75); shake();
    sparks(W.x, W.y - F * 1.1, "#b3bcc8", 9, F * 1.2, "fx-shard");
    equip(Z, null, "none"); // ghế vỡ tan
    equip(W, null, "far"); // gậy của W văng ra khán đài
    popText(text.smash, W.x, W.y - F * 1.9, "fx-banner", 1100, 10);
    hurt(W, 20, { big: true, knock: 1.3, tilt: 60 });
    snap();
    await wait(220);
    slowmo(null);
    await wait(260);
    go(W, [stand(W), stand(W, { r: -d(W) * 85 })], 160); // nằm sõng soài một nhịp
    await wait(320);
    hop(W, W.x, floor, F * 0.6, 320); // lồm cồm dậy
    await wait(300);

    /* ----- 5. Chảo và súng — né đạn kiểu bullet time ----- */
    meanwhile(fling("pan", W));
    await fling("gun", Z, 140);
    await wait(150);
    // Phát 1: W giơ chảo đỡ, đạn dội ngược lên trúng một bóng đèn.
    let m = fire(Z);
    guard(W);
    const shield = { x: W.x + d(W) * F * 0.65, y: m.y };
    await wait(bullet(m, shield));
    sparks(shield.x, shield.y, "#ffffff", 12, 30);
    popText(text.ping, shield.x, shield.y - F * 0.9, "fx-text", 700);
    const lamp = lamps.reduce((best, el) => Math.abs(docRect(el).left - W.x) < Math.abs(docRect(best).left - W.x) ? el : best, lamps[0]);
    const lp = docRect(lamp.querySelector(".hc-lamp")!);
    await wait(bullet(shield, { x: lp.left + lp.width / 2, y: lp.top + lp.height }, 1.3));
    popLamp(lamp);
    roar("gasp", 600);
    shout();
    await wait(280);
    // Phát 2: W lộn ngược qua đầu viên đạn.
    m = fire(Z);
    bullet(m, { x: W.x + d(Z) * F * 7, y: m.y });
    await wait(Math.max(0, (Math.abs(W.x - m.x) - F * 1.8) / 0.9));
    slowmo({ x: W.x, y: W.y - F }, 0.22, 1.9);
    hop(W, W.x, floor, F * 1.6, 400, { spin: -d(W) * 360 });
    await wait(400);
    squash(W); dust(W.x, floor);
    slowmo(null);
    snap();
    roar("hype", 900);
    await wait(150);
    // W ném chảo như ném đĩa, trúng Z.
    swing(W, 260);
    await wait(120);
    equip(W, null, "none");
    const from = hand(W), hit = { x: Z.x + d(Z) * F * 0.2, y: Z.y - F * 0.6 };
    const pan = item("pan");
    play(pan, [{ transform: at(from.x, from.y, 1, 0) }, { transform: at(hit.x, hit.y, 1, 720 * d(W)) }], 300);
    await wait(300);
    drop(pan);
    toss("pan", hit, d(W));
    popText(text.bong, hit.x, Z.y - F * 1.7, "fx-text", 800);
    hurt(Z, 20);
    await wait(320);

    /* ----- 6. Bình chữa cháy ----- */
    await fling("extinguisher", Z);
    const nozzle = { x: Z.x + d(Z) * F * 0.95, y: Z.y - F * 0.95 };
    wield(Z, [{ transform: "rotate(0deg)" }, { transform: "rotate(-8deg)" }, { transform: "rotate(4deg)" }, { transform: "rotate(-6deg)" }, { transform: "rotate(0deg)" }], 900);
    popText(text.spray, nozzle.x, nozzle.y - F * 0.5, "fx-shutter", 900, 20);
    for (let n = 0; n < 16; n++) {
      const tx = W.x + (Math.random() * 2 - 1) * F * 0.9, ty = W.y - F * (0.2 + Math.random() * 0.9), s = 1.6 + Math.random() * 1.4;
      play(node("fx-puff"), [
        { transform: at(nozzle.x, nozzle.y, 0.3), opacity: 0.95 },
        { transform: at(tx, ty, s), opacity: 0.9, offset: 0.3 },
        { transform: at(tx - d(Z) * F * 0.3, ty - F * 0.3, s * 1.25), opacity: 0.75, offset: 0.75 },
        { transform: at(tx - d(Z) * F * 0.5, ty - F * 0.5, s * 1.4), opacity: 0 },
      ], 1900, { delay: n * 45, easing: "ease-out" });
    }
    await wait(480);
    hurt(W, 8, { knock: 0.4 });
    await wait(200);
    // Z lao qua làn khói, phang luôn bình vào W.
    await close(Z);
    swing(Z, 340);
    await wait(170);
    slashFx(Z.x + d(Z) * F * 0.95, Z.y - F * 0.6, d(Z), 1.3);
    hurt(W, 22, { knock: 1.6, big: true });
    await wait(340);
    go(W, [stand(W), stand(W, { wx: 1.2, wy: 0.62 })], 220); // quỵ gối
    await wait(420);

    /* ----- 7. Lật kèo — quay chậm lần 3 và cú kết liễu ----- */
    bodies[W.i].dataset.charge = "true";
    roar("chant", 1800);
    shout(); later(350, shout); later(700, shout);
    go(W, [stand(W, { wx: 1.2, wy: 0.62 }), stand(W, { wx: 0.9, wy: 1.2 }), stand(W)], 360); // bật dậy
    for (let n = 0; n < 4; n++) sparks(W.x, W.y - F * 0.6, "#fff3a3", 3, F * 0.7);
    await fling("bat", W, 100);
    flex(W);
    await wait(260);
    // Z lao vào vụt ngang — W cúi người cho bình sượt qua đầu, rồi đập ngược lên.
    await close(Z, 1.15);
    slowmo({ x: (W.x + Z.x) / 2, y: W.y - F * 0.7 }, 0.3, 1.9);
    swing(Z, 380); duck(W, 300);
    await wait(260);
    swing(W, 260);
    await wait(120);
    slashFx(Z.x, Z.y - F * 0.6, d(W), 1.4);
    hurt(Z, 25, { knock: 1.4 });
    await wait(200);
    slowmo(null);
    await wait(300);
    // Nhảy xoay một vòng, phang cú home run.
    hop(W, Z.x - d(W) * F * 0.95, floor, F * 2.8, 600, { spin: d(W) * 360 });
    await wait(420);
    swing(W, 300);
    await wait(110);
    slowmo({ x: Z.x, y: Z.y - F * 0.7 }, 0.3, 2, 160);
    slashFx(Z.x, Z.y - F * 0.7, d(W), 2);
    flash(0.95); shake();
    sparks(Z.x, Z.y - F * 0.5, "#fff3a3", 18, 56);
    flashBody(Z);
    popText(`-${Z.hp}`, Z.x, Z.y - F * 1.3, "fx-dmg");
    Z.hp = 0;
    arena.style.setProperty(`--hp-${Z.side}`, "0");
    delete bodies[W.i].dataset.charge;
    popText(text.ko, cx, A.top + A.height * 0.32, "fx-banner fx-ko", 1700, 14);
    // Z bị hất tung, xoay vòng, rơi nằm bẹp (bay tới lồng thì lồng rung).
    const want = Z.x + d(W) * F * 3.4;
    // Nằm nghiêng: xoay 90° quanh đáy, thân dẹt lại để đọc ra là "nằm" chứ không phải ô vuông đứng.
    const land = { x: clamp(want, L, R), y: floor - F * 0.36 };
    const spin = d(W) * 450;
    go(Z, arc({ x: Z.x, y: Z.y }, land, F * 3.2, 24).map((p, n, all) => {
      const t = n / (all.length - 1);
      return { ...p, r: spin * t, sx: Z.face * Z.k * (1 - 0.28 * t), sy: Z.k * (1 + 0.1 * t) };
    }), 850);
    Z.x = land.x;
    roar("hype", 2800);
    await wait(260);
    slowmo(null);
    await wait(610);
    if (Math.abs(land.x - want) > 1) rattle();
    const lying = (lift: number): Pose => ({ x: land.x, y: land.y - lift, r: spin, sx: Z.face * Z.k * 0.72, sy: Z.k * 1.1 });
    go(Z, [lying(0), lying(F * 0.35), lying(0)], 360);
    bodies[Z.i].dataset.ko = "true";
    dust(land.x + d(W) * F * 0.5, floor);
    const stars = node("fx-stars", "<i>★</i><i>★</i><i>★</i>");
    stars.style.left = `${land.x + d(W) * F * 1.15}px`;
    stars.style.top = `${floor - F * 0.75}px`;
    arena.dataset.hud = "false";
    await wait(1000);

    /* ----- 8. Bên thắng nâng cúp, Trùng xuống chụp ----- */
    hop(W, clamp(Z.x - d(W) * F * 2.6, L + F * 2.6, R - F * 2.6), floor, F * 1.1, 600);
    await wait(650);
    W.wy = 1.18;
    go(W, [stand(W)], 1);
    const cupRest = F * 1.45;
    const cup = node("fx-cup", CUP);
    cup.style.width = cup.style.height = `${F * 0.95}px`;
    play(cup, [
      { transform: at(W.x, W.y - F * 6) },
      { transform: at(W.x, W.y - cupRest), offset: 0.5 },
      { transform: at(W.x, W.y - cupRest - F * 0.3), offset: 0.7 },
      { transform: at(W.x, W.y - cupRest) },
    ], 800, { easing: "ease-in", keep: true });
    await wait(850);
    sparks(W.x, W.y - cupRest, "#f5c542", 10, 30);

    T.face = d(W);
    hop(T, clamp(W.x - d(W) * F * 2.4, L, R), floor, F * 1.4, 700);
    await wait(760);
    squash(T); dust(T.x, floor);
    await wait(260);

    for (const [n, pose] of [{ spin: 0, h: 1.2 }, { spin: 360, h: 1.5 }, { spin: 0, h: 1.0 }].entries()) {
      snap();
      confetti(n === 2 ? 44 : 20);
      sparks(W.x, W.y - cupRest, "#f5c542", 8, 36);
      roar("hype", 900);
      const base = { x: W.x, y: W.y };
      const samples = arc(base, base, F * pose.h, 18);
      go(W, samples.map((p, k, all) => ({ ...p, r: pose.spin * (k / (all.length - 1)), sx: W.face * W.k, sy: W.k * W.wy })), 520);
      track(cup.animate(samples.map(p => ({ transform: at(p.x, p.y - cupRest) })), { duration: ms(520), fill: "forwards" }));
      await wait(950);
    }

    // Ảnh lấy liền bật ra từ máy ảnh, đậu lại ở góc phía Trùng.
    const win = text.win.replace("{name}", W.name);
    const pol = node("fx-polaroid",
      `<span class="pol-pic"><i class="pol-dot"${W === Y ? ' data-variant="green"' : ""}><b></b><b></b></i><span class="pol-cup">${CUP}</span></span><span class="pol-cap"></span>`);
    pol.querySelector(".pol-cap")!.textContent = win;
    const dest = { x: d(W) > 0 ? A.left + Math.max(70, A.width * 0.1) : A.left + A.width - Math.max(70, A.width * 0.1), y: A.top + 92 };
    play(pol, [
      { transform: at(T.x + T.face * F * 0.5, T.y - F * 1.0, 0.1, 0), opacity: 0 },
      { transform: at(T.x + T.face * F * 0.5, T.y - F * 3.1, 1, -8), opacity: 1, offset: 0.45 },
      { transform: at(dest.x, dest.y, 1, d(W) > 0 ? -5 : 5), opacity: 1 },
    ], 1000, { easing: "ease-out", keep: true });
    popText(win, cx, A.top + A.height * 0.32, "fx-banner", 1900, 12);
    await wait(1100);
    cheer(T);
  }

  async function run() {
    try {
      await sequence();
      finished = true;
      footer.dataset.fight = "done";
      return true;
    } catch {
      return false;
    }
  }

  return { run, stop };
}
