"use client";

/* Ba bạn đồng hành ngoài hero (kịch bản: docs/companions.md).

   Hai lớp:
   - `.cmp-fixed` (position: fixed) — khi đứng trên mép nav hoặc bay về logo.
   - `.cmp-page` (toạ độ tài liệu) — khi bám vào nội dung: khung xem trước, biểu đồ
     Đường đi, câu hỏi, thẻ game. Cuộn trang thì chúng trôi theo nội dung tự nhiên.

   Một "đạo diễn" chọn màn theo những gì người xem đang thấy và sự kiện các section
   gửi lên (`companion:*` trên window). Mỗi lúc chỉ diễn một chuyển cảnh; xong thì
   xét lại xem màn mong muốn đã đổi chưa. */

import { useEffect, useRef } from "react";
import { content } from "@/content/content.vi";
import { arc, toFrame, trackGaze, type Pose } from "@/components/home/heroBuddies";
import { readProgress } from "@/components/home/reading";
import { companions, useCompanions, type Spot } from "./store";
import { createFight } from "./fight";

const LEAVE_BELOW = 0.3; // hero còn hiện dưới mức này → rời hero
const RETURN_ABOVE = 0.5; // hero hiện quá mức này → về hero
const STAGGER = [0, 140, 70]; // Chấm đi trước, Lệch theo ngay, Trùng chậm nửa nhịp
const LOGO_CELLS = [4, 6, 2]; // ô trong logo 3×3 của Chấm, Trùng, Lệch
/* Khớp với CSS `.cp-chart[data-lead]`: đường nghề chờ Chấm nhảy tới đầu đường rồi
   mới vẽ, và Chấm chạy cùng easing/thời lượng với nét vẽ. */
export const RIDE_LEAD = 600;
const DRAW_MS = 1600;
const DRAW_EASE = "cubic-bezier(.45,.05,.25,1)";
const RUN_MS = 700; // Lệch chạy hết một câu hỏi
const WORK_LEAVE_MS = 1200;

type Mode = "fixed" | "page";

/* Các màn đi trên thanh tiến độ đọc (trang case): ba ô bám theo cuộn trang liên tục
   thay vì nhảy từng cú. */
const FOLLOW = ["read", "dedupe", "result"];
const EMERGE_DELAY = 1200; // trang case: chờ người xem nhìn trang rồi mới nhảy ra khỏi logo

/**
 * `origin` — ba ô ra sân khấu từ đâu: "hero" (trang chủ: màn đá văng ở hero) hoặc
 * "logo" (trang case: tự nhảy ra khỏi logo sau EMERGE_DELAY).
 */
export function CompanionLayer({ nav, origin = "hero" }: { nav: string; origin?: "hero" | "logo" }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { enabled } = useCompanions();

  useEffect(() => {
    const root = rootRef.current;
    const navEl = document.querySelector<HTMLElement>(nav);
    if (!root || !navEl) return;
    const layers: Record<Mode, HTMLElement> = {
      fixed: root.querySelector<HTMLElement>(".cmp-fixed")!,
      page: root.querySelector<HTMLElement>(".cmp-page")!,
    };
    const bodies = [...root.querySelectorAll<HTMLElement>(".hs-buddy")];
    const eyes = bodies.map(b => b.querySelector<HTMLElement>(".hs-eyes")!);
    const gazes = bodies.map(b => b.querySelector<HTMLElement>(".hs-gaze")!);
    const tired = root.querySelector<HTMLElement>(".cmp-bubble")!;
    const puzzled = root.querySelector<HTMLElement>(".cmp-bubble-q")!;
    const floor = navEl.querySelector<HTMLElement>(".site-progress");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const anims: Animation[][] = bodies.map(() => []);
    const ratios: Record<string, number> = { hero: 1, work: 0, path: 0, questions: 0, night: 0, arena: 0, dedupe: 0, result: 0 };

    let scene = "off";
    let busy = false;
    let alive = true;
    let stopGaze: (() => void) | null = null;
    let hovered: string | null = null;
    let leaveTimer: ReturnType<typeof setTimeout> | undefined;
    let pathRide: "pending" | "done" | null = null;
    let rideAt = 0;
    let pathStop: number | null = null;
    let questions: "pending" | "done" | null = null;
    let homing = false;
    let emerged = false;
    let emergeReady = origin !== "logo";
    let followMode = "read";
    const following = new Set([0, 1, 2]);
    let fight: ReturnType<typeof createFight> | null = null;
    let fighting = false;
    let fightDone = false;

    const size = () => companions.hero()?.size ?? 16;
    const ms = (n: number) => (reduced ? 1 : n);
    const wait = (n: number) => new Promise(r => setTimeout(r, reduced ? 0 : n));
    root.style.setProperty("--buddy", `${size()}px`);

    /* ---------- chuyển động ---------- */

    function cancel(i: number) { anims[i].splice(0).forEach(a => a.cancel()); }

    function current(i: number): Spot | null {
      if (getComputedStyle(bodies[i]).opacity === "0") return null;
      const r = bodies[i].getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.bottom, size: r.width };
    }

    const shift = (s: Spot, mode: Mode): Spot => mode === "page" ? { ...s, x: s.x + window.scrollX, y: s.y + window.scrollY } : s;

    function animate(i: number, poses: Pose[], options: KeyframeAnimationOptions) {
      const a = bodies[i].animate(poses.map(p => toFrame(p, size())), { fill: "forwards", ...options });
      anims[i].push(a);
      return a;
    }
    const done = (a: Animation) => a.finished.then(() => {}, () => {});

    /** Nhảy tới `to` (toạ độ viewport), chuyển sang lớp `mode` nếu cần. */
    function moveTo(i: number, to: Spot, mode: Mode, o: { delay?: number; height?: number; duration?: number } = {}) {
      const from = current(i) ?? to;
      cancel(i);
      if (bodies[i].parentElement !== layers[mode]) layers[mode].appendChild(bodies[i]);
      const a = shift(from, mode), b = shift(to, mode), s = size();
      const height = o.height ?? Math.max(s * 2.5, Math.abs(b.y - a.y) * 0.25);
      const poses = arc(a, b, height, 18).map((p, k, all) => {
        const t = k / (all.length - 1);
        const scale = (a.size + (b.size - a.size) * t) / s;
        return { ...p, sx: scale, sy: scale };
      });
      return done(animate(i, poses, { duration: ms(o.duration ?? 650), delay: reduced ? 0 : o.delay ?? 0 }));
    }

    function placeAt(i: number, at: Spot, mode: Mode) {
      cancel(i);
      if (bodies[i].parentElement !== layers[mode]) layers[mode].appendChild(bodies[i]);
      const p = shift(at, mode);
      animate(i, [{ ...p, sx: at.size / size(), sy: at.size / size() }], { duration: 1 });
    }

    function hideAll() {
      bodies.forEach((b, i) => {
        cancel(i);
        layers.fixed.appendChild(b);
        b.removeAttribute("style");
        delete b.dataset.settled;
      });
      eyes.forEach(e => e.removeAttribute("style"));
    }

    function wakeUp() {
      eyes.forEach(e => { e.style.opacity = "1"; });
      bodies.forEach(b => { b.dataset.settled = "true"; });
      if (!stopGaze) stopGaze = trackGaze(gazes, size(), document.documentElement);
    }

    const setNight = (on: boolean) => { root.dataset.night = on ? "true" : "false"; };

    function pop(el: HTMLElement, at: Spot, duration: number, mode: Mode = "page") {
      const p = shift(at, mode);
      el.animate([
        { transform: `translate(${p.x}px, ${p.y}px) scale(0)`, opacity: 0 },
        { transform: `translate(${p.x}px, ${p.y - 8}px) scale(1.15)`, opacity: 1, offset: 0.15 },
        { transform: `translate(${p.x}px, ${p.y - 10}px) scale(1)`, opacity: 1, offset: 0.85 },
        { transform: `translate(${p.x}px, ${p.y - 10}px) scale(0.6)`, opacity: 0 },
      ], { duration: ms(duration), easing: "ease-out", fill: "forwards" });
    }

    /* ---------- vị trí các màn (toạ độ viewport) ---------- */

    function dockSpots(): Spot[] {
      const r = navEl!.getBoundingClientRect();
      const s = size();
      const cx = r.left + r.width / 2;
      return [0, 1.5, -2.8].map(k => ({ x: cx + k * s, y: r.bottom - 1, size: s }));
    }

    function logoSpots(): Spot[] | null {
      const rects = navEl!.querySelectorAll("svg rect");
      if (rects.length < 9) return null;
      return LOGO_CELLS.map(c => {
        const r = rects[c].getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.bottom, size: r.width };
      });
    }

    function workSpots(slug: string): { spots: Spot[]; modes: Mode[] } | null {
      const frame = document.querySelector<HTMLElement>(".wi-frame");
      const r = frame?.getBoundingClientRect();
      if (!r || !r.width) return null; // mobile: không có khung xem trước
      const s = size();
      const spots = [{ x: r.left + s * 2, y: r.top, size: s }, { x: r.left + s * 3.6, y: r.top, size: s }, dockSpots()[2]];
      const modes: Mode[] = ["page", "page", "fixed"];
      const dot = slug === content.home.work.chart.slug ? frame!.querySelector(".wi-dot-after") : null;
      if (dot) {
        const d = dot.getBoundingClientRect();
        spots[2] = { x: d.left + d.width / 2, y: d.top + d.height * 0.25, size: s };
        modes[2] = "page";
      }
      return { spots, modes };
    }

    function pathGeo() {
      const svg = document.querySelector<SVGSVGElement>(".cp-chart");
      const main = svg?.querySelector<SVGPathElement>(".cp-line:not(.cp-branch)");
      const ctm = svg?.getScreenCTM();
      if (!svg || !main || !ctm) return null;
      const s = size();
      const toScreen = (x: number, y: number): Spot => {
        const p = new DOMPoint(x, y).matrixTransform(ctm);
        return { x: p.x, y: p.y, size: s };
      };
      const at = (path: SVGPathElement, back = 0) => {
        const pt = path.getPointAtLength(Math.max(0, path.getTotalLength() - back));
        return toScreen(pt.x, pt.y);
      };
      const branch = svg.querySelector<SVGPathElement>(".cp-branch");
      const stops = [...svg.querySelectorAll<SVGCircleElement>(".cp-dot")].map(c =>
        toScreen(Number(c.getAttribute("cx")), Number(c.getAttribute("cy")) - Number(c.getAttribute("r"))));
      const active = [...svg.querySelectorAll(".cp-stop")].findIndex(el => el.getAttribute("data-active") === "true");
      const total = main.getTotalLength();
      return {
        lech: at(main, 34), // ngồi ngay trước mũi tên "nay"
        trung: branch ? at(branch) : at(main),
        stops, active: Math.max(0, active),
        ride: Array.from({ length: 49 }, (_, k) => {
          const pt = main.getPointAtLength((total * k) / 48);
          return toScreen(pt.x, pt.y);
        }),
      };
    }

    function nightSpots(): Spot[] | null {
      const r = document.querySelector(".hc-game")?.getBoundingClientRect();
      if (!r) return null;
      const s = size();
      return [26, 26 + s * 1.6, 26 + s * 3.8].map(dx => ({ x: r.left + dx, y: r.top, size: s }));
    }

    /* ---------- đạo diễn ---------- */

    /* Màn nền khi không có gì đặc biệt: trang có thanh đọc thì đi trên đó, không thì
       đứng trên mép nav. */
    const base = () => (floor ? "read" : "dock");

    function desired(): string {
      const st = companions.get();
      const hero = companions.hero();
      if (!st.enabled) return "off";
      if (homing) return "home";
      if (st.place === "home") return origin === "logo" && !emerged && emergeReady ? base() : "off";
      // Hero đang diễn màn mở đầu bằng bộ ba ô riêng; chưa đăng ký thì lớp này nằm yên,
      // nếu không sẽ có bộ ba thứ hai nhảy ra từ logo ngay lúc đó.
      if (st.place === "hero" && !hero) return "off";
      if (st.place === "hero") return st.heroReady && ratios.hero < LEAVE_BELOW ? "dock" : "hero";
      if (hero && ratios.hero > RETURN_ABOVE) return "hero";
      if (ratios.night > 0.45) return "night";
      if (questions === "pending") return "questions";
      if (pathRide && ratios.path > 0.25) return pathRide === "pending" ? "path:ride" : `path:${pathStop ?? "active"}`;
      if (hovered && ratios.work > 0.15 && workSpots(hovered)) return `work:${hovered}`;
      if (floor && ratios.result > 0.5) return "result";
      if (floor && ratios.dedupe > 0.3) return "dedupe";
      return base();
    }

    /* ---------- đi trên thanh đọc (trang case) ---------- */

    /* Chấm đứng ở chỗ đang đọc, Trùng lẽo đẽo phía sau, Lệch chờ sẵn ở cuối thanh. */
    function readSpots(): Spot[] {
      const r = navEl!.getBoundingClientRect();
      const s = size();
      const left = r.left + s * 2, right = r.right - s * 2;
      const x = left + (right - left) * readProgress();
      return [{ x, y: r.bottom - 1, size: s }, { x: Math.max(left - s, x - s * 1.5), y: r.bottom - 1, size: s }, { x: right, y: r.bottom - 1, size: s }];
    }

    /** Chuyển ô `i` sang điều khiển bằng style (bám cuộn liên tục) ngay tại chỗ đang đứng. */
    function takeOver(i: number) {
      const at = current(i) ?? readSpots()[i];
      const body = bodies[i];
      if (body.parentElement !== layers.fixed) layers.fixed.appendChild(body);
      const f = toFrame({ ...at, sx: at.size / size(), sy: at.size / size() }, size());
      body.style.transform = f.transform;
      body.style.opacity = "1";
      cancel(i);
      return { x: at.x, y: at.y, k: at.size / size() };
    }

    function startFollow() {
      const cur = bodies.map((_, i) => takeOver(i));
      const EASE = [0.22, 0.09, 0.3]; // Trùng chậm nửa nhịp
      let raf = 0;
      const tick = () => {
        raf = 0;
        const t = readSpots();
        let moving = false;
        bodies.forEach((body, i) => {
          if (!following.has(i)) return;
          const merge = followMode === "dedupe" && i === 1;
          const target = merge ? { x: cur[0].x, y: cur[0].y } : t[i];
          const k = merge ? 0.35 : followMode === "dedupe" && i === 0 ? 1.15 : 1;
          const dx = target.x - cur[i].x;
          cur[i].x += dx * EASE[i];
          cur[i].y += (target.y - cur[i].y) * EASE[i];
          cur[i].k += (k - cur[i].k) * 0.2;
          const walking = Math.abs(dx) > 0.5;
          const r = walking ? Math.max(-10, Math.min(10, dx * 0.6)) : 0;
          const bob = walking ? Math.abs(Math.sin(cur[i].x / 6)) * size() * 0.18 : 0;
          body.style.transform = toFrame({ x: cur[i].x, y: cur[i].y - bob, r, sx: cur[i].k, sy: cur[i].k }, size()).transform;
          // Gộp xong thì Trùng biến vào trong Chấm.
          body.style.opacity = merge && Math.abs(dx) < 2 ? "0" : "1";
          if (walking || Math.abs(k - cur[i].k) > 0.01) moving = true;
        });
        if (moving) raf = requestAnimationFrame(tick);
      };
      const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
      window.addEventListener("scroll", kick, { passive: true });
      window.addEventListener("resize", kick);
      kick();
      return Object.assign(() => {
        cancelAnimationFrame(raf);
        window.removeEventListener("scroll", kick);
        window.removeEventListener("resize", kick);
        bodies.forEach(b => { b.style.opacity = "1"; });
      }, { kick, cur });
    }
    let followCtl: ReturnType<typeof startFollow> | null = null;

    /* Cảnh đấu ở footer (fight.ts): bắt đầu khi ba ô đã đậu lên thẻ game và sàn đấu hiện đủ
       trên màn hình; rời khỏi footer giữa chừng thì huỷ và sẽ diễn lại từ đầu khi quay lại. */
    function stopFight() {
      fight?.stop();
      fight = null;
      fighting = false;
    }
    function maybeFight() {
      const arena = document.querySelector<HTMLElement>(".hc-arena");
      const footer = document.querySelector<HTMLElement>(".hc");
      if (!arena || !footer || fighting || fightDone || busy || !alive || scene !== "night" || ratios.arena < 0.85) return;
      fighting = true;
      const mine = createFight({ bodies, page: layers.page, arena, footer, size: size(), reduced, animate });
      fight = mine;
      mine.run().then(completed => {
        if (fight !== mine) return;
        fighting = false;
        if (completed) fightDone = true;
      });
    }

    async function enter(key: string, prev: string) {
      if (key !== "night") stopFight();
      const hero = companions.hero();
      if (followCtl && !FOLLOW.includes(key)) { followCtl(); followCtl = null; following.add(2); }

      if (key === "off") {
        // Đang ở ngoài mà bị gọi về (vd. xáo lại biểu đồ) thì bay về logo rồi mới tắt,
        // đừng biến mất giữa chừng. Đang nằm trong hero thì lớp này không có gì để bay.
        const l = logoSpots();
        if (l && prev !== "hero") await Promise.all(bodies.map((_, i) =>
          current(i) ? moveTo(i, l[i], "fixed", { delay: [0, 120, 240][i], duration: 800 }) : undefined));
        stopGaze?.(); stopGaze = null;
        setNight(false);
        hideAll();
        return;
      }

      if (key === "hero") {
        if (!hero) return;
        stopGaze?.(); stopGaze = null;
        setNight(false);
        const to = hero.positions();
        if (prev !== "off" && prev !== "hero") await Promise.all(bodies.map((_, i) => moveTo(i, to[i], "fixed", { delay: STAGGER[i] })));
        hero.show(true);
        hideAll();
        companions.set({ place: "hero" });
        return;
      }

      // Từ đây ba ô ở ngoài, trong lớp này. Vừa rời hero thì nhận chúng tại chỗ; trang
      // không có hero (trang case) thì chúng nhảy ra từ ba ô trong logo.
      if (prev === "hero" || prev === "off") {
        if (hero && companions.get().place === "hero") {
          const from = hero.positions();
          hero.show(false);
          bodies.forEach((_, i) => placeAt(i, from[i], "fixed"));
        } else {
          const l = logoSpots();
          if (!l) return;
          bodies.forEach((_, i) => placeAt(i, l[i], "fixed"));
          emerged = true;
        }
        companions.set({ place: "dock" });
      }
      wakeUp();
      setNight(key === "night");

      if (FOLLOW.includes(key)) {
        if (!followCtl) {
          const t = readSpots();
          await Promise.all(bodies.map((_, i) => moveTo(i, t[i], "fixed", { delay: STAGGER[i] })));
          followCtl = startFollow();
        }
        const wasDedupe = followMode === "dedupe";
        followMode = key;
        if (key === "result") {
          // Lệch rời thanh đọc, nhảy lên đứng khoe trên thẻ kết quả.
          const card = document.querySelector("[data-companion='result']")?.getBoundingClientRect();
          if (card) {
            following.delete(2);
            await moveTo(2, { x: card.right - size() * 2, y: card.top, size: size() }, "page", { height: size() * 3 });
          }
        } else if (!following.has(2)) {
          const at = takeOver(2);
          followCtl.cur[2] = at;
          following.add(2);
        }
        if (wasDedupe && key !== "dedupe") {
          // Trùng tách ra khỏi Chấm, ngơ ngác.
          const c = followCtl.cur[0];
          pop(puzzled, { x: c.x + size() * 0.6, y: c.y - size() * 2.2, size: size() }, 1300, "fixed");
        }
        followCtl.kick();
        return;
      }

      if (key === "dock") {
        const d = dockSpots();
        await Promise.all(bodies.map((_, i) => moveTo(i, d[i], "fixed", { delay: STAGGER[i] })));
      } else if (key.startsWith("work:")) {
        const w = workSpots(key.slice(5));
        if (w) await Promise.all(bodies.map((_, i) => moveTo(i, w.spots[i], w.modes[i], { delay: [0, 160, 80][i], height: size() * 2 })));
      } else if (key === "path:ride") {
        const g = pathGeo();
        if (!g) { pathRide = "done"; return; }
        await Promise.all([
          moveTo(0, g.ride[0], "page", { duration: 520 }),
          moveTo(2, g.lech, "page", { delay: 260 }),
          moveTo(1, g.trung, "page", { delay: 420 }),
        ]);
        // Chạy theo đầu nét đang vẽ: cùng thời lượng, cùng easing, keyframe cách đều theo độ dài.
        cancel(0);
        const ride = animate(0, g.ride.map(p => shift(p, "page")), { duration: ms(DRAW_MS), easing: DRAW_EASE });
        const late = performance.now() - rideAt;
        if (late > 0) ride.currentTime = Math.min(late, DRAW_MS);
        else ride.startTime = (document.timeline.currentTime as number) - late;
        await done(ride);
        pathRide = "done";
      } else if (key.startsWith("path:")) {
        const g = pathGeo();
        if (g) await Promise.all([
          moveTo(0, g.stops[pathStop ?? g.active] ?? g.stops[g.active], "page"),
          moveTo(1, g.trung, "page", { delay: 120 }),
          moveTo(2, g.lech, "page", { delay: 60 }),
        ]);
      } else if (key === "questions") {
        await runQuestions();
      } else if (key === "night") {
        const n = nightSpots();
        if (n) await Promise.all(bodies.map((_, i) => moveTo(i, n[i], "page", { delay: STAGGER[i] })));
      } else if (key === "home") {
        const l = logoSpots();
        if (l) await Promise.all(bodies.map((_, i) => moveTo(i, l[i], "fixed", { delay: [0, 120, 240][i], duration: 800 })));
        homing = false;
        stopGaze?.(); stopGaze = null;
        hideAll();
        companions.set({ place: "home" });
      }
    }

    /* Lệch chạy dưới từng câu hỏi, vệt dạ quang mọc theo sau lưng nó. */
    async function runQuestions() {
      const section = document.querySelector<HTMLElement>("[data-companion='questions']");
      const marks = section ? [...section.querySelectorAll<HTMLElement>(".aq-text mark")] : [];
      const d = dockSpots();
      moveTo(0, d[0], "fixed");
      moveTo(1, d[1], "fixed", { delay: 140 });
      const s = size();
      let last: Spot | null = null;
      for (const mark of marks) {
        const r = mark.getBoundingClientRect();
        const start = { x: r.left + s, y: r.bottom - 2, size: s };
        const end = { x: r.right - s * 0.6, y: r.bottom - 2, size: s };
        await moveTo(2, start, "page", { height: s * 3, duration: 520 });
        cancel(2);
        const a = shift(start, "page"), b = shift(end, "page");
        const steps = 14;
        const run = Array.from({ length: steps + 1 }, (_, k) => {
          const t = k / steps;
          return { x: a.x + (b.x - a.x) * t, y: a.y - Math.abs(Math.sin(t * Math.PI * 5)) * s * 0.35, size: s };
        });
        mark.style.transition = `background-size ${ms(RUN_MS)}ms linear`;
        mark.style.backgroundSize = "100% 38%";
        await done(animate(2, run, { duration: ms(RUN_MS) }));
        last = end;
      }
      if (last) pop(tired, { ...last, x: last.x - s * 0.3, y: last.y - s * 2 }, 1200);
      if (section) section.dataset.driver = "done";
      marks.forEach(m => { m.style.transition = ""; m.style.backgroundSize = ""; });
      await wait(1100);
      questions = "done";
    }

    async function direct() {
      if (busy || !alive) return;
      busy = true;
      try {
        for (let n = 0; n < 8 && alive; n++) {
          const want = desired();
          if (want === scene) break;
          const prev = scene;
          await enter(want, prev);
          scene = want;
        }
      } finally {
        busy = false;
      }
      maybeFight();
    }

    /* Nhún tại chỗ — phản ứng nhỏ, chỉ khi đang rảnh. */
    function bounce(indexes: number[], times = 1) {
      if (busy || fighting) return;
      indexes.forEach(async (i, n) => {
        const at = current(i);
        if (!at) return;
        const mode: Mode = bodies[i].parentElement === layers.page ? "page" : "fixed";
        await wait(n * 90);
        for (let k = 0; k < times; k++) await moveTo(i, at, mode, { height: size() * 1.6, duration: 320 });
      });
    }

    /* ---------- tín hiệu ---------- */

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const key = e.target === companions.hero()?.stage ? "hero" : (e.target as HTMLElement).dataset.companion;
        if (key) ratios[key] = e.intersectionRatio;
      });
      direct();
      maybeFight();
    }, { threshold: [0, 0.1, 0.15, 0.25, LEAVE_BELOW, 0.4, 0.45, RETURN_ABOVE, 0.75, 1] });
    document.querySelectorAll<HTMLElement>("[data-companion]").forEach(el => io.observe(el));
    let observedHero: HTMLElement | null = null;
    const syncHero = () => {
      const stage = companions.hero()?.stage ?? null;
      if (stage === observedHero) return;
      if (observedHero) io.unobserve(observedHero);
      if (stage) io.observe(stage);
      observedHero = stage;
      root.style.setProperty("--buddy", `${size()}px`);
    };

    const on: Record<string, (e: Event) => void> = {
      "companion:work": e => {
        const slug = (e as CustomEvent<string | null>).detail;
        clearTimeout(leaveTimer);
        if (slug) { hovered = slug; setTimeout(direct, 320); } // đợi khung xem trước trượt vào xong (280ms)
        else leaveTimer = setTimeout(() => { hovered = null; direct(); }, WORK_LEAVE_MS);
      },
      "companion:path": () => { pathRide = "pending"; rideAt = performance.now() + RIDE_LEAD; direct(); },
      "companion:path-stop": e => { pathStop = (e as CustomEvent<number>).detail; if (pathRide) direct(); },
      "companion:questions": () => { questions = "pending"; direct(); },
      "companion:copied": () => { if (scene === "night") bounce([1], 2); },
      "companion:rematch": () => {
        if (scene !== "night") return;
        stopFight();
        fightDone = false;
        scene = "stale:night"; // đưa ba ô về lại thẻ game rồi đấu lại
        direct();
      },
    };
    Object.entries(on).forEach(([name, fn]) => window.addEventListener(name, fn));

    const card = document.querySelector(".hc-game");
    const onCard = () => { if (scene === "night") bounce([0, 2, 1]); };
    card?.addEventListener("pointerenter", onCard);

    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element).closest?.("a[href='#top']");
      if (link && companions.get().place === "dock" && companions.get().enabled) { homing = true; direct(); }
    };
    document.addEventListener("click", onClick);

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (scene !== "off" && scene !== "hero" && !busy && !followCtl) { stopFight(); scene = `stale:${scene}`; direct(); }
      }, 150);
    };
    window.addEventListener("resize", onResize);

    /* Mobile: biểu đồ Đường đi nằm trong khung cuộn ngang. Người xem lướt ngang thì ba ô
       đang bám trên biểu đồ nhảy theo chỗ mới. */
    const pathScroll = document.querySelector(".cp-scroll");
    let pathTimer: ReturnType<typeof setTimeout> | undefined;
    const onPathScroll = () => {
      clearTimeout(pathTimer);
      pathTimer = setTimeout(() => {
        if (scene.startsWith("path:") && scene !== "path:ride" && !busy) { scene = `stale:${scene}`; direct(); }
      }, 140);
    };
    pathScroll?.addEventListener("scroll", onPathScroll, { passive: true });

    const unsubscribe = companions.subscribe(() => { syncHero(); direct(); });
    const emergeTimer = emergeReady ? undefined : setTimeout(() => { emergeReady = true; direct(); }, EMERGE_DELAY);
    syncHero();
    direct();

    return () => {
      alive = false;
      unsubscribe();
      io.disconnect();
      Object.entries(on).forEach(([name, fn]) => window.removeEventListener(name, fn));
      card?.removeEventListener("pointerenter", onCard);
      document.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      pathScroll?.removeEventListener("scroll", onPathScroll);
      clearTimeout(leaveTimer); clearTimeout(resizeTimer); clearTimeout(pathTimer);
      clearTimeout(emergeTimer);
      followCtl?.();
      stopGaze?.();
      stopFight();
      hideAll();
    };
  }, [nav, enabled, origin]);

  return <div ref={rootRef} className="cmp" aria-hidden="true">
    <div className="cmp-fixed">
      <span className="cmp-bubble cmp-bubble-q">{content.home.sort.confused}</span>
      {["ink", "ink", "green"].map((variant, i) =>
        <div key={i} className="hs-buddy" data-variant={variant}>
          <span className="hs-eyes"><span className="hs-gaze"><span className="hs-blink"><i /><i /></span></span></span>
          <span className="hs-wpn wpn" />
        </div>)}
    </div>
    <div className="cmp-page">
      <span className="cmp-bubble">{content.home.companions.tired}</span>
    </div>
  </div>;
}
