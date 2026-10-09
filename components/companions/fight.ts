/* Cảnh vui ở footer: sau khi ba ô đậu lên thẻ "Chơi Ải Vận Hành", Chấm (kiếm) và Lệch
   (súng) nhảy xuống sàn đấu được rọi đèn, đánh nhau khoảng 20 giây rồi Chấm hạ gục Lệch.
   Lệch nằm bẹp mắt chữ X, sao xoay quanh đầu; Chấm nâng cúp, Trùng giơ máy ảnh chụp,
   pháo giấy bay và một tấm ảnh lấy liền hiện ra.

   Toàn bộ chạy theo toạ độ tài liệu trên lớp `.cmp-page`. Mỗi bước chờ bằng `wait` (không
   chờ animation) để tổng thời lượng đoán trước được. Kịch bản cố định — Chấm luôn thắng. */

import { arc, type Pose } from "@/components/home/heroBuddies";
import { content } from "@/content/content.vi";

const text = content.home.fight;

const CUP = `<svg viewBox="0 0 24 28" width="100%" height="100%" aria-hidden="true"><path d="M6 2h12v6a6 6 0 0 1-12 0z" fill="#f5c542"/><path d="M6 4H2.5v2A4 4 0 0 0 6 10M18 4h3.5v2a4 4 0 0 1-3.5 4" fill="none" stroke="#f5c542" stroke-width="2"/><rect x="10.5" y="13" width="3" height="6" fill="#d9a521"/><rect x="6.5" y="19" width="11" height="4" rx="1" fill="#f5c542"/></svg>`;
const CONFETTI = ["#dcf25a", "#ffffff", "#f5c542", "#7fd6ff", "#ff8aa8"];

type Face = 1 | -1;
type Fighter = { i: number; x: number; y: number; k: number; wy: number; face: Face };
type Shot = "dodge" | "hit" | "block";

export type FightHost = {
  /** 0 Chấm (kiếm), 1 Trùng (máy ảnh), 2 Lệch (súng). */
  bodies: HTMLElement[];
  page: HTMLElement;
  arena: HTMLElement;
  footer: HTMLElement;
  size: number;
  reduced: boolean;
  animate: (i: number, poses: Pose[], options: KeyframeAnimationOptions) => Animation;
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function createFight(host: FightHost) {
  const { bodies, page, arena, footer, reduced } = host;
  const S = host.size;
  const ac = new AbortController();
  const nodes = new Set<HTMLElement>();
  let finished = false;

  const ms = (n: number) => (reduced ? 1 : n);
  const wait = (n: number) => new Promise<void>((resolve, reject) => {
    if (ac.signal.aborted) return reject(new Error("abort"));
    const id = setTimeout(resolve, reduced ? 0 : n);
    ac.signal.addEventListener("abort", () => { clearTimeout(id); reject(new Error("abort")); }, { once: true });
  });

  const docRect = (el: Element) => {
    const r = el.getBoundingClientRect();
    return { left: r.left + scrollX, top: r.top + scrollY, width: r.width, height: r.height };
  };

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
    const a = n.animate(frames, { duration: ms(duration), easing: o.easing ?? "linear", fill: "forwards", delay: reduced ? 0 : o.delay ?? 0 });
    if (!o.keep) a.finished.then(() => drop(n), () => {});
    return a;
  }
  const at = (x: number, y: number, s = 1, r = 0) => `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`;

  function sparks(x: number, y: number, color: string, count = 8, dist = 30) {
    for (let n = 0; n < count; n++) {
      const angle = (Math.PI * 2 * n) / count + Math.random() * 0.6;
      const d = dist * (0.6 + Math.random() * 0.6);
      const s = node("fx-spark");
      s.style.background = color;
      play(s, [
        { transform: at(x, y), opacity: 1 },
        { transform: at(x + Math.cos(angle) * d, y + Math.sin(angle) * d, 0.2), opacity: 0 },
      ], 380, { easing: "ease-out" });
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
    const n = node("fx-slash");
    const r0 = dir > 0 ? -70 : 250, r1 = dir > 0 ? 40 : 140;
    play(n, [
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
      const n = node("fx-dust");
      play(n, [
        { transform: at(x, y - 3, 0.5), opacity: 0.7 },
        { transform: at(x + dir * 18, y - 8, 1.6), opacity: 0 },
      ], 420, { easing: "ease-out" });
    }
  }

  function flash(strength = 0.9) {
    if (reduced) return;
    const a = docRect(arena);
    const n = node("fx-flash");
    Object.assign(n.style, { left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px` });
    play(n, [{ opacity: 0 }, { opacity: strength, offset: 0.2 }, { opacity: 0 }], 280);
  }

  function confetti(count: number) {
    const a = docRect(arena);
    for (let n = 0; n < count; n++) {
      const c = node("fx-conf");
      c.style.background = CONFETTI[n % CONFETTI.length];
      const x0 = a.left + Math.random() * a.width, y0 = a.top - 8;
      const x1 = x0 + (Math.random() - 0.5) * 120, y1 = a.top + a.height - 20 - Math.random() * 14;
      play(c, [
        { transform: at(x0, y0, 1, 0), opacity: 1 },
        { transform: at(x1, y1, 1, (Math.random() - 0.5) * 900), opacity: 1, offset: 0.88 },
        { transform: at(x1, y1, 1, (Math.random() - 0.5) * 900), opacity: 0 },
      ], 1700 + Math.random() * 1000, { easing: "cubic-bezier(.3,.1,.5,1)", delay: Math.random() * 280 });
    }
  }

  function shake() {
    if (reduced) return;
    [arena, page].forEach(el => el.animate([
      { transform: "translate(0, 0)" }, { transform: "translate(-5px, 3px)" }, { transform: "translate(4px, -3px)" },
      { transform: "translate(-3px, 2px)" }, { transform: "translate(0, 0)" },
    ], { duration: 380 }));
  }

  const setHp = (side: "a" | "b", v: number) => arena.style.setProperty(`--hp-${side}`, String(v));

  /* ---------- sẵn sàng / dọn dẹp ---------- */

  function clean() {
    nodes.forEach(n => n.remove());
    nodes.clear();
    bodies.forEach(b => { delete b.dataset.weapon; delete b.dataset.ko; delete b.dataset.charge; });
    arena.dataset.lit = "false";
    arena.dataset.hud = "false";
    arena.style.removeProperty("--hp-a");
    arena.style.removeProperty("--hp-b");
  }

  function stop() {
    ac.abort();
    clean();
    footer.dataset.fight = finished ? "done" : "idle";
  }

  /* ---------- kịch bản ---------- */

  async function sequence() {
    const a = docRect(arena);
    const floor = a.top + a.height - 22;
    const cx = a.left + a.width / 2;
    const half = Math.max(80, Math.min(210, a.width * 0.27));
    const F = Math.round(Math.max(40, Math.min(52, S * 2.4)));
    const L = a.left + F * 1.4, R = a.left + a.width - F * 1.4;

    const init = (i: number): Fighter => {
      const r = bodies[i].getBoundingClientRect();
      return { i, x: r.left + r.width / 2 + scrollX, y: r.bottom + scrollY, k: r.width / S, wy: 1, face: 1 };
    };
    const A = init(0), T = init(1), B = init(2);
    B.face = -1;

    const part = (f: Fighter, sel: string) => bodies[f.i].querySelector<HTMLElement>(sel)!;
    const stand = (f: Fighter, m: { wx?: number; wy?: number; r?: number } = {}): Pose =>
      ({ x: f.x, y: f.y, r: m.r ?? 0, sx: f.face * f.k * (m.wx ?? 1), sy: f.k * f.wy * (m.wy ?? 1) });
    const go = (f: Fighter, poses: Pose[], duration: number, delay = 0) =>
      host.animate(f.i, poses, { duration: ms(duration), delay: reduced ? 0 : delay, easing: "linear" });

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

    function flashBody(f: Fighter) {
      bodies[f.i].animate([{ filter: "brightness(3.2)" }, { filter: "brightness(1)" }], { duration: ms(170) });
    }
    function swing(f: Fighter) {
      part(f, ".hs-sword").animate([
        { transform: "rotate(-40deg)" }, { transform: "rotate(-110deg)", offset: 0.25 },
        { transform: "rotate(100deg)", offset: 0.55 }, { transform: "rotate(20deg)" },
      ], { duration: ms(400), easing: "ease-in-out" });
    }
    function bash(f: Fighter) {
      part(f, ".hs-gun").animate([
        { transform: "rotate(0deg)" }, { transform: "rotate(-40deg) translateX(-20%)", offset: 0.3 },
        { transform: "rotate(30deg) translateX(40%)", offset: 0.55 }, { transform: "rotate(0deg)" },
      ], { duration: ms(400), easing: "ease-in-out" });
    }

    /** Bị đánh trúng: loé trắng, tia lửa, số sát thương, thanh máu tụt, bật lùi. */
    function hit(f: Fighter, from: Fighter, dmg: number, side: "a" | "b", hp: number) {
      const dir: Face = f.x >= from.x ? 1 : -1;
      flashBody(f);
      sparks(f.x, f.y - F * 0.5, "#ff7a6b", 9, 34);
      popText(`-${dmg}`, f.x, f.y - F * 1.25, "fx-dmg");
      setHp(side, hp);
      hop(f, clamp(f.x + dir * F * 0.9, L, R), floor, F * 0.45, 330, { tilt: dir * 16 });
    }

    async function rush(f: Fighter, toX: number, hops = 3) {
      const from = f.x;
      for (let n = 1; n <= hops; n++) {
        hop(f, from + ((toX - from) * n) / hops, floor, F * 0.4, 170);
        await wait(170);
      }
    }

    async function strike(f: Fighter) {
      swing(f);
      await wait(220);
      slashFx(f.x + f.face * F * 0.95, f.y - F * 0.6, f.face);
    }

    /** Một phát bắn. `dodge`: mục tiêu nhảy né; `hit`: trúng; `block`: gạt bằng kiếm (có thể bật ngược). */
    async function fire(s: Fighter, t: Fighter, outcome: Shot, reflect = false, dmg = 15, side: "a" | "b" = "a", hp = 0.85) {
      const dir: Face = t.x >= s.x ? 1 : -1;
      part(s, ".hs-gun").animate([
        { transform: "translateX(0) rotate(0deg)" }, { transform: "translateX(-25%) rotate(-14deg)", offset: 0.35 }, { transform: "translateX(0) rotate(0deg)" },
      ], { duration: ms(240) });
      const mx = s.x + dir * F * 0.95, my = s.y - F * 0.5;
      muzzle(mx, my);
      const endX = outcome === "dodge" ? t.x + dir * 360 : t.x - dir * F * 0.5;
      const dur = Math.max(170, Math.abs(endX - mx) / 0.85);
      const bullet = node("fx-bullet");
      play(bullet, [{ transform: at(mx, my, 1, dir > 0 ? 0 : 180) }, { transform: at(endX, my, 1, dir > 0 ? 0 : 180) }], dur);
      if (outcome === "dodge") {
        const passAt = (Math.abs(t.x - mx) / Math.abs(endX - mx)) * dur;
        await wait(Math.max(0, passAt - 280));
        hop(t, t.x, t.y, F * 1.7, 560);
        await wait(Math.max(0, dur - Math.max(0, passAt - 280)));
      } else if (outcome === "hit") {
        await wait(dur);
        hit(t, s, dmg, side, hp);
      } else {
        await wait(Math.max(0, dur - 210));
        swing(t);
        await wait(210);
        sparks(endX, my, "#ffffff", 12, 36);
        if (reflect) {
          const back = node("fx-bullet");
          play(back, [{ transform: at(endX, my, 1, dir > 0 ? 180 : 0) }, { transform: at(s.x - dir * F * 0.3, my, 1, dir > 0 ? 180 : 0) }], 260);
          await wait(260);
          hit(s, t, 30, "b", 0.45);
        }
      }
    }

    /* ----- 1. Nhảy xuống sàn, rọi đèn ----- */
    arena.dataset.lit = "true";
    arena.dataset.hud = "true";
    footer.dataset.fight = "on";
    setHp("a", 1); setHp("b", 1);
    hop(A, cx - half, floor, F * 2.4, 900, { k: F / S });
    hop(B, cx + half, floor, F * 2.4, 900, { k: F / S, delay: 140 });
    await wait(1050);
    squash(A); squash(B);
    dust(A.x, floor); dust(B.x, floor);
    cheer(T, 0.9);
    await wait(350);

    /* ----- 2. Rút vũ khí ----- */
    await wait(200);
    bodies[0].dataset.weapon = "sword";
    bodies[2].dataset.weapon = "gun";
    sparks(A.x + F * 0.9, A.y - F * 1.0, "#ffffff", 6, 18);
    popText(text.go, cx, a.top + F * 1.2, "fx-banner", 1100, 10);
    await wait(1100);

    /* ----- 3. Giao đấu ----- */
    // Lệch bắn hai phát, Chấm nhảy né cả hai.
    await fire(B, A, "dodge");
    await wait(300);
    cheer(T);
    await fire(B, A, "dodge");
    await wait(500);

    // Chấm lao tới chém trúng Lệch.
    await rush(A, B.x - F * 1.2, 3);
    await strike(A);
    hit(B, A, 25, "b", 0.75);
    await wait(360);
    cheer(T, 1.1);
    await wait(500);

    // Lệch lùi ra bắn: một phát trúng, một phát bị né.
    hop(B, clamp(B.x + F * 2.4, L, R), floor, F * 0.9, 460);
    await wait(500);
    await rush(A, B.x - F * 3.2, 2);
    await fire(B, A, "hit", false, 15, "a", 0.85);
    await wait(250);
    await fire(B, A, "dodge");
    await wait(300);

    // Cận chiến: kiếm chạm báng súng, cả hai văng ra.
    await rush(A, B.x - F * 1.3, 2);
    swing(A); bash(B);
    await wait(220);
    sparks((A.x + B.x) / 2, A.y - F * 0.6, "#ffffff", 16, 42);
    popText(text.clang, (A.x + B.x) / 2, A.y - F * 1.5, "fx-text");
    hop(A, clamp(A.x - F * 1.6, L, R), floor, F * 0.5, 380, { tilt: -14 });
    hop(B, clamp(B.x + F * 1.6, L, R), floor, F * 0.5, 380, { tilt: 14 });
    await wait(380);
    cheer(T, 1.0);
    await wait(500);

    // Lệch bắn, Chấm gạt đạn bật ngược trúng chính Lệch.
    await fire(B, A, "block", true);
    popText("!", A.x, A.y - F * 1.4, "fx-text");
    await wait(900);

    // Lệch cuống, bắn liên tiếp: né, trúng, né.
    await fire(B, A, "dodge");
    await wait(160);
    await fire(B, A, "hit", false, 10, "a", 0.75);
    await wait(160);
    await fire(B, A, "dodge");
    await wait(500);

    // Chấm phản công hai nhát liên hoàn.
    await rush(A, B.x - F * 1.2, 3);
    await strike(A);
    hit(B, A, 15, "b", 0.3);
    await wait(380);
    await rush(A, B.x - F * 1.2, 1);
    await strike(A);
    hit(B, A, 15, "b", 0.15);
    await wait(420);
    cheer(T, 1.2);
    await wait(400);

    // Đối mặt nhau một nhịp.
    await rush(A, B.x - F * 2.6, 1);
    await wait(500);

    /* ----- 4. Đòn kết liễu ----- */
    bodies[0].dataset.charge = "true";
    go(A, [stand(A), stand(A, { wx: 1.15, wy: 0.8 }), stand(A, { wx: 0.9, wy: 1.2 }), stand(A, { wx: 1.15, wy: 0.8 }), stand(A)], 800);
    for (let n = 0; n < 5; n++) sparks(A.x + F * 0.9, A.y - F * 1.0, "#fff3a3", 3, 22);
    await wait(900);
    delete bodies[0].dataset.charge;

    hop(A, B.x - F * 0.9, floor, F * 3, 700, { spin: 360 });
    await wait(430);
    swing(A);
    await wait(130);
    slashFx(B.x - F * 0.3, B.y - F * 0.7, 1, 2);
    flash(0.95);
    shake();
    sparks(B.x, B.y - F * 0.5, "#fff3a3", 18, 56);
    setHp("b", 0);
    flashBody(B);
    popText(text.ko, cx, a.top + F * 1.4, "fx-banner fx-ko", 1700, 14);
    // Lệch bị hất lên, quay vòng, rơi xuống nằm bẹp bên phải.
    const land = { x: clamp(B.x + F * 3.4, L, R), y: floor - F * 0.5 };
    const launch = arc({ x: B.x, y: B.y }, land, F * 3.2, 24).map((p, n, all) => {
      const t = n / (all.length - 1);
      return { ...p, r: 450 * t, sx: B.face * B.k, sy: B.k * (1 - 0.15 * t) };
    });
    go(B, launch, 850);
    B.x = land.x; B.y = floor; B.wy = 0.85;
    await wait(870);
    // Nảy một cái rồi nằm yên.
    const lying = (lift: number): Pose => ({ x: land.x, y: land.y - lift, r: 450, sx: B.face * B.k, sy: B.k * 0.85 });
    go(B, [lying(0), lying(F * 0.35), lying(0)], 360);
    bodies[2].dataset.ko = "true";
    dust(land.x + F * 0.5, floor);
    const stars = node("fx-stars", "<i>★</i><i>★</i><i>★</i>");
    stars.style.left = `${land.x + F * 0.5}px`;
    stars.style.top = `${floor - F * 1.15}px`;
    arena.dataset.hud = "false";
    await wait(1300);

    /* ----- 5. Chấm nâng cúp, Trùng chụp ảnh ----- */
    hop(A, cx, floor, F * 1.1, 600);
    await wait(650);
    A.wy = 1.18;
    go(A, [stand(A)], 1);
    const cupH = F * 0.95, cupRest = F * 1.45;
    const cup = node("fx-cup", CUP);
    cup.style.width = cup.style.height = `${cupH}px`;
    play(cup, [
      { transform: at(A.x, A.y - F * 6) },
      { transform: at(A.x, A.y - cupRest), offset: 0.5 },
      { transform: at(A.x, A.y - cupRest - F * 0.3), offset: 0.7 },
      { transform: at(A.x, A.y - cupRest) },
    ], 800, { easing: "ease-in", keep: true });
    await wait(850);
    sparks(A.x, A.y - cupRest, "#f5c542", 10, 30);

    bodies[1].dataset.weapon = "camera";
    T.face = 1;
    hop(T, cx - F * 3.2, floor, F * 2.2, 800, { k: (F * 0.9) / S });
    await wait(900);
    squash(T);
    dust(T.x, floor);
    await wait(300);

    const poses = [
      { spin: 0, h: 1.2 }, { spin: 360, h: 1.5 }, { spin: 0, h: 1.0 },
    ];
    for (let n = 0; n < poses.length; n++) {
      popText(text.shutter, T.x + F * 0.3, T.y - F * 1.5, "fx-text fx-shutter", 760);
      flash(0.9);
      confetti(n === poses.length - 1 ? 44 : 20);
      sparks(A.x, A.y - cupRest, "#f5c542", 8, 36);
      const from = { x: A.x, y: A.y };
      const samples = arc(from, from, F * poses[n].h, 18);
      go(A, samples.map((p, m, all) => ({ ...p, r: poses[n].spin * (m / (all.length - 1)), sx: A.face * A.k, sy: A.k * A.wy })), 520);
      cup.animate(samples.map(p => ({ transform: at(p.x, p.y - cupRest) })), { duration: ms(520), fill: "forwards" });
      await wait(950);
    }

    // Ảnh lấy liền bật ra từ máy ảnh, đậu lại ở góc trái sàn đấu.
    const pol = node("fx-polaroid",
      `<span class="pol-pic"><i class="pol-dot"><b></b><b></b></i><span class="pol-cup">${CUP}</span></span><span class="pol-cap">${text.win}</span>`);
    const dest = { x: a.left + Math.min(78, a.width * 0.2), y: a.top + 66 };
    play(pol, [
      { transform: at(T.x + F * 0.5, T.y - F * 1.0, 0.1, 0), opacity: 0 },
      { transform: at(T.x + F * 0.5, T.y - F * 3.1, 1, -8), opacity: 1, offset: 0.45 },
      { transform: at(dest.x, dest.y, 1, -5), opacity: 1 },
    ], 1000, { easing: "ease-out", keep: true });
    popText(text.win, cx, a.top + F * 1.4, "fx-banner", 1900, 12);
    await wait(1100);
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
