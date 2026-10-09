"use client";

import { useEffect, useRef, useState } from "react";
import { content } from "@/content/content.vi";
import { PortfolioIcon } from "@/components/portfolio/PortfolioIcon";
import { companions, useCompanions } from "@/components/companions/store";
import { createBuddies, measureDot, trackGaze, type ChartGeometry, type Kick, type Misfit } from "./heroBuddies";

const hero = content.prototype.hero;
const copy = content.home.sort;

/* Biểu đồ đích chỉ là hình — không nhãn, không trục số — nên chiều cao cột là
   trang trí, không phải dữ liệu thật. */
const BAR_HEIGHTS = [5, 7, 6, 9, 11, 10, 13, 15, 14, 17, 19, 22];
const BAR_COLS = 2;
const HIGHLIGHT_BAR = BAR_HEIGHTS.length - 1;
const BRUSH = 96;
const DEMO_BRUSH = 64;
const DONE_AT = 0.7;
/* Con trỏ mẫu tự chạy khi người xem chưa động vào: lần đầu sau 0,9s, lặp lại
   nếu vẫn đứng yên 7s, tối đa 3 lần để không tự sắp hộ hết. */
const DEMO_DELAY = 900;
const DEMO_IDLE = 7000;
const DEMO_MS = 2600;
const DEMO_PLAYS = 3;
/* Khoá cuộn ở hero (xem effect `hold`): cờ "đã xem màn chào" trong phiên, và hạn chờ màn
   chào sau khi đã sắp xong — quá hạn thì mở khoá dù hoạt cảnh chưa chạy hết. */
const WELCOME_SEEN = "pf-welcome-seen";
const WELCOME_TIMEOUT = 12000;

/* Ba ô "lạc" — xếp xong vẫn nằm sai chỗ, rồi bị đá văng ra thành nhân vật.
   Thứ tự khớp .hs-buddy: 0 Chấm (nghiêng trên cột 4), 1 Trùng (chồng lệch lên Chấm
   như một bản sao), 2 Lệch (ô xanh lạc trên cột đen). dx, dy tính theo bước lưới. */
const MISFITS = [
  { bar: 4, dx: 0.5, dy: 0, tilt: 12, green: false },
  { bar: 4, dx: 0.85, dy: -0.3, tilt: -6, green: false },
  { bar: 6, dx: 0.4, dy: 0, tilt: -10, green: true },
];
/* Ô đỉnh của cột bên phải lấy đà rồi thúc vào ô lạc. */
const KICKS: Kick[] = [{ bar: 5, victims: [0, 1] }, { bar: 7, victims: [2] }];

const COLORS = { loose: "rgba(22,22,20,0.22)", sorted: "#161614", highlight: "#1f5a3d", brush: "rgba(31,90,61,0.35)" };

type Cell = {
  x: number; y: number; vx: number; vy: number;
  tx: number; ty: number; bar: number;
  sortedAt: number; // 0 = chưa sắp; >0 = thời điểm bắt đầu bay về chỗ
  misfit?: number; tilt?: number; hidden?: boolean;
  nudge?: { start: number; vx: number; vy: number };
};

type Api = {
  sortAll: () => void; reshuffle: () => void;
  whenSettled: () => Promise<void>;
  misfits: () => Misfit[];
  hideMisfits: (hide: boolean) => void;
  kick: (bar: number, victims: number[]) => Promise<void>;
};

/* Cú đá: lấy đà lùi 45% (150ms) → thúc tới (90ms, chạm ô lạc ở cuối nhịp này) → về chỗ. */
const KICK_IMPACT = 240;
function nudgeAt(n: NonNullable<Cell["nudge"]>, now: number) {
  const t = now - n.start;
  if (t >= 490) return null;
  const k = t < 150 ? -0.45 * (t / 150) : t < KICK_IMPACT ? -0.45 + 1.45 * ((t - 150) / 90) : 1 - (t - KICK_IMPACT) / 250;
  return { x: n.vx * k, y: n.vy * k };
}

export function HeroSort() {
  const stageRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const geoRef = useRef<ChartGeometry & { size: number }>(null);
  const settleRef = useRef<(() => void)[]>([]);
  const iRef = useRef<HTMLSpanElement>(null);
  const buddyRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<Api | null>(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [touch, setTouch] = useState(false);
  /* Màn chào (sắp ô → đá văng → Chấm làm dấu chấm chữ I) diễn xong chưa. Trước đó trang
     bị khoá cuộn (home.css, `data-welcome`), để các section phía dưới không chạy khi
     ba bạn đồng hành còn đang bận ở hero. */
  const [welcomed, setWelcomed] = useState(false);
  const [cue, setCue] = useState(true);
  const { enabled } = useCompanions();
  const playedRef = useRef(false);

  /* CSS đã chặn cuộn; còn phím tắt và cuộn khôi phục của trình duyệt thì vẫn có thể kéo
     trang đi — đưa về đầu. Nhưng không nhốt người xem:
     - tới bằng neo (`/#contact`…), Back/Forward, tải lại, hoặc đã xem màn chào trong phiên
       này → mở khoá ngay;
     - cố cuộn (lăn chuột, vuốt, PageDown/Space/↓) khi chưa sắp xong → tự "Sắp xếp ngay"
       để màn chào chạy tiếp thay vì đứng im;
     - Tab ra khỏi hero → mở khoá, để ô đang focus không nằm ngoài màn hình;
     - sắp xong mà màn chào kẹt quá WELCOME_TIMEOUT → mở khoá. */
  useEffect(() => {
    if (welcomed) {
      try { sessionStorage.setItem(WELCOME_SEEN, "1"); } catch {}
      return;
    }
    let seen = false;
    try { seen = sessionStorage.getItem(WELCOME_SEEN) === "1"; } catch {}
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (seen || window.location.hash || nav?.type === "back_forward" || nav?.type === "reload") {
      setWelcomed(true);
      return;
    }
    const stage = stageRef.current;
    const hold = () => { if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: "instant" }); };
    const nudge = (e: Event) => {
      if (e instanceof KeyboardEvent && !["PageDown", "ArrowDown", " ", "End"].includes(e.key)) return;
      if (!done) apiRef.current?.sortAll();
    };
    const away = (e: FocusEvent) => { if (stage && e.target instanceof Node && !stage.contains(e.target)) setWelcomed(true); };
    hold();
    window.addEventListener("scroll", hold);
    window.addEventListener("wheel", nudge, { passive: true });
    window.addEventListener("touchmove", nudge, { passive: true });
    window.addEventListener("keydown", nudge);
    document.addEventListener("focusin", away);
    const timer = done ? setTimeout(() => setWelcomed(true), WELCOME_TIMEOUT) : undefined;
    return () => {
      window.removeEventListener("scroll", hold);
      window.removeEventListener("wheel", nudge);
      window.removeEventListener("touchmove", nudge);
      window.removeEventListener("keydown", nudge);
      document.removeEventListener("focusin", away);
      clearTimeout(timer);
    };
  }, [welcomed, done]);

  /* Lời nhắc cuộn xuống tắt hẳn khi người xem đã tự cuộn. */
  useEffect(() => {
    if (!welcomed) return;
    const off = () => { if (window.scrollY > 80) setCue(false); };
    window.addEventListener("scroll", off, { passive: true });
    return () => window.removeEventListener("scroll", off);
  }, [welcomed]);

  useEffect(() => {
    const stage = stageRef.current!;
    const canvas = canvasRef.current!;
    const ghost = ghostRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTouch(window.matchMedia("(pointer: coarse)").matches);

    let w = 0, h = 0, size = 8, gap = 3, pitch = 10;
    let cells: Cell[] = [];
    let pointer: { x: number; y: number } | null = null;
    let raf = 0;
    let finished = false;
    let lastReported = -1;
    let userActive = false;
    let demoPlays = 0;
    let demoStart = 0;
    let demoNext = performance.now() + DEMO_DELAY;

    /* Đường quét chữ "S" qua vùng ô đang lộn xộn. */
    function demoPoint(t: number) {
      const narrow = w < 760;
      const x0 = narrow ? w * 0.12 : w * 0.56, x1 = narrow ? w * 0.82 : w * 0.88;
      const mid = narrow ? h * 0.72 : h * 0.5, amp = narrow ? h * 0.08 : h * 0.16;
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      return { x: x0 + (x1 - x0) * e, y: mid + Math.sin(e * Math.PI * 2.5) * amp };
    }
    function layout() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = stage.clientWidth; h = stage.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const narrow = w < 760;
      const region = narrow
        ? { left: w * 0.24, right: w * 0.94, base: h * 0.9, top: h * 0.56 }
        : { left: w * 0.52, right: w * 0.94, base: h * 0.84, top: h * 0.2 };
      const maxRows = Math.max(...BAR_HEIGHTS);
      const colsTotal = BAR_HEIGHTS.length * BAR_COLS + (BAR_HEIGHTS.length - 1);
      pitch = Math.min((region.right - region.left) / colsTotal, (region.base - region.top) / maxRows);
      gap = Math.max(2, pitch * 0.22);
      size = pitch - gap;
      const buddy = Math.max(14, size * 1.15);
      geoRef.current = { chartLeft: region.left, floor: region.base, narrow, size: buddy };
      stage.style.setProperty("--buddy", `${buddy}px`);

      const targets: Omit<Cell, "x" | "y" | "vx" | "vy" | "sortedAt">[] = [];
      BAR_HEIGHTS.forEach((rows, bar) => {
        for (let col = 0; col < BAR_COLS; col++) {
          for (let row = 0; row < rows; row++) {
            targets.push({
              tx: region.left + (bar * (BAR_COLS + 1) + col) * pitch,
              ty: region.base - (row + 1) * pitch,
              bar,
            });
          }
        }
      });
      MISFITS.forEach((m, misfit) => targets.push({
        tx: region.left + (m.bar * (BAR_COLS + 1) + m.dx) * pitch,
        ty: region.base - (BAR_HEIGHTS[m.bar] + 1 + m.dy) * pitch,
        bar: m.green ? HIGHLIGHT_BAR : m.bar, misfit, tilt: m.tilt,
      }));

      const keep = cells.length === targets.length;
      cells = targets.map((t, i) => keep
        ? { ...cells[i], ...t }
        : { ...t, x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6, sortedAt: 0 });
    }

    function report() {
      const sorted = cells.filter(c => c.sortedAt > 0).length / cells.length;
      const pct = Math.round(sorted * 100);
      if (pct !== lastReported) {
        lastReported = pct;
        setProgress(Math.min(100, Math.round((sorted / DONE_AT) * 100)));
        stage.style.setProperty("--p", String(Math.min(1, sorted / DONE_AT)));
      }
      if (!finished && sorted >= DONE_AT) {
        finished = true;
        const now = performance.now();
        cells.forEach(c => { if (!c.sortedAt) c.sortedAt = now + Math.random() * 500; });
        setDone(true);
      }
    }

    function sortAll() {
      const now = performance.now();
      cells.forEach(c => { if (!c.sortedAt) c.sortedAt = now + Math.random() * 600; });
      report();
      start();
    }

    function reshuffle() {
      finished = false;
      stage.style.setProperty("--p", "0");
      cells.forEach(c => { c.hidden = false; c.nudge = undefined; c.sortedAt = 0; c.vx = (Math.random() - 0.5) * 6; c.vy = (Math.random() - 0.5) * 6; });
      setDone(false);
      report();
      start();
    }

    let last = performance.now();
    function frame(now: number) {
      const dt = Math.min(48, now - last) / 16.67;
      last = now;
      ctx.clearRect(0, 0, w, h);
      let moving = false;

      let brush = pointer, radius = BRUSH;
      if (!userActive && !finished && !demoStart && demoPlays < DEMO_PLAYS && now >= demoNext) { demoStart = now; demoPlays++; }
      if (demoStart) {
        const t = (now - demoStart) / DEMO_MS;
        if (t >= 1 || userActive || finished) { demoStart = 0; demoNext = now + DEMO_IDLE; ghost.dataset.show = "false"; }
        else {
          brush = demoPoint(t); radius = DEMO_BRUSH;
          ghost.dataset.show = "true";
          ghost.style.transform = `translate(${brush.x}px, ${brush.y}px)`;
        }
      }

      for (const c of cells) {
        if (c.sortedAt && now >= c.sortedAt) {
          const k = 1 - Math.pow(1 - 0.14, dt);
          c.x += (c.tx - c.x) * k; c.y += (c.ty - c.y) * k;
          if (Math.abs(c.tx - c.x) + Math.abs(c.ty - c.y) > 0.3) moving = true;
          else { c.x = c.tx; c.y = c.ty; }
        } else {
          moving = true;
          c.vx += (Math.random() - 0.5) * 0.08 * dt; c.vy += (Math.random() - 0.5) * 0.08 * dt;
          c.vx *= 0.985; c.vy *= 0.985;
          c.x += c.vx * dt; c.y += c.vy * dt;
          if (c.x < 0 || c.x > w - size) { c.vx *= -1; c.x = Math.max(0, Math.min(w - size, c.x)); }
          if (c.y < 0 || c.y > h - size) { c.vy *= -1; c.y = Math.max(0, Math.min(h - size, c.y)); }
          if (brush && !c.sortedAt && Math.hypot(c.x - brush.x, c.y - brush.y) < radius) c.sortedAt = now + Math.random() * 120;
        }
        if (c.hidden) continue;
        const placed = c.sortedAt && now >= c.sortedAt;
        let x = c.x, y = c.y;
        if (c.nudge) {
          const off = nudgeAt(c.nudge, now);
          if (off) { x += off.x; y += off.y; moving = true; } else c.nudge = undefined;
        }
        ctx.fillStyle = !placed ? COLORS.loose : c.bar === HIGHLIGHT_BAR ? COLORS.highlight : COLORS.sorted;
        if (placed && c.tilt) {
          ctx.save(); ctx.translate(x + size / 2, y + size / 2); ctx.rotate((c.tilt * Math.PI) / 180);
          ctx.fillRect(-size / 2, -size / 2, size, size); ctx.restore();
        } else ctx.fillRect(x, y, size, size);
      }

      if (brush && !finished) {
        ctx.beginPath(); ctx.arc(brush.x, brush.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = COLORS.brush; ctx.lineWidth = 1.5; ctx.setLineDash([4, 6]); ctx.stroke(); ctx.setLineDash([]);
      }

      report();
      raf = moving ? requestAnimationFrame(frame) : 0;
      if (!moving && finished) settleRef.current.splice(0).forEach(resolve => resolve());
    }

    function start() {
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    }

    function move(e: PointerEvent) {
      const r = stage.getBoundingClientRect();
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
      userActive = true;
    }
    const leave = () => { pointer = null; };

    layout();
    if (reduced) {
      cells.forEach(c => { c.x = c.tx; c.y = c.ty; c.sortedAt = 1; });
      finished = true;
      setDone(true);
    }
    start();

    const ro = new ResizeObserver(() => { layout(); start(); });
    ro.observe(stage);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerdown", move);
    stage.addEventListener("pointerleave", leave);
    /* Ô đỉnh (cả hai cột) của một cột không phải ô lạc. */
    const topCells = (bar: number) => {
      const own = cells.filter(c => c.bar === bar && c.misfit === undefined);
      const top = Math.min(...own.map(c => c.ty));
      return own.filter(c => c.ty === top);
    };
    apiRef.current = {
      sortAll, reshuffle,
      whenSettled: () => new Promise<void>(resolve => {
        if (finished && !raf) resolve(); else settleRef.current.push(resolve);
      }),
      misfits: () => cells.filter(c => c.misfit !== undefined)
        .sort((p, q) => p.misfit! - q.misfit!)
        .map(c => ({ x: c.tx + size / 2, y: c.ty + size, r: c.tilt ?? 0, cell: size })),
      hideMisfits: hide => { cells.forEach(c => { if (c.misfit !== undefined) c.hidden = hide; }); start(); },
      kick: (bar, victims) => {
        const now = performance.now();
        const tops = topCells(bar);
        const victim = cells.find(c => c.misfit === victims[0])!;
        const dx = victim.tx - tops[0].tx, dy = victim.ty - tops[0].ty, d = Math.hypot(dx, dy) || 1;
        tops.forEach(c => { c.nudge = { start: now, vx: (dx / d) * pitch * 0.9, vy: (dy / d) * pitch * 0.9 }; });
        start();
        return new Promise(resolve => setTimeout(resolve, KICK_IMPACT));
      },
    };

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerdown", move);
      stage.removeEventListener("pointerleave", leave);
      apiRef.current = null;
    };
  }, []);

  /* Sắp xong → ba ô lạc bị đá văng, hoang mang, Chấm lên làm dấu chấm chữ I và cả
     ba nhìn theo con trỏ. Xáo lại thì dọn sạch. */
  useEffect(() => {
    const stage = stageRef.current, root = buddyRef.current, iEl = iRef.current, geo = geoRef.current, api = apiRef.current;
    if (!stage || !root || !iEl || !geo || !api) return;
    const parts = {
      bodies: [...root.querySelectorAll<HTMLElement>(".hs-buddy")],
      eyes: [...root.querySelectorAll<HTMLElement>(".hs-eyes")],
      confused: root.querySelector<HTMLElement>(".hs-bubble-confused")!,
      spotted: root.querySelector<HTMLElement>(".hs-bubble-spotted")!,
    };
    const gazes = [...root.querySelectorAll<HTMLElement>(".hs-gaze")];
    const buddies = createBuddies(parts, geo.size);
    root.dataset.hidden = "false";
    // Tắt bạn đồng hành thì biểu đồ cũng không còn ô lạc.
    if (!done || !enabled) {
      buddies.reset();
      api.hideMisfits(!enabled);
      // Tắt bạn đồng hành thì không còn màn chào nào để chờ.
      if (!enabled) setWelcomed(true);
      if (!done) { playedRef.current = false; companions.set({ place: "home", heroReady: false }); }
      return;
    }

    const ctrl = new AbortController();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stopGaze = () => {};
    const bridge = {
      stage, size: geo.size,
      positions: () => parts.bodies.map(body => {
        const r = body.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.bottom, size: r.width };
      }),
      show: (visible: boolean) => { root.dataset.hidden = visible ? "false" : "true"; },
    };
    const placeAll = () => {
      const g = geoRef.current;
      if (!g) return;
      api.hideMisfits(true);
      createBuddies(parts, g.size).place(g, measureDot(iEl, stage));
    };
    (async () => {
      await document.fonts.ready;
      await api.whenSettled();
      if (ctrl.signal.aborted) return;
      companions.set({ place: "hero", heroReady: false });
      // Đã diễn một lần (vd. tắt rồi bật lại) thì đặt thẳng vào tư thế cuối.
      if (reduced || playedRef.current) placeAll();
      else await buddies.play(geo, measureDot(iEl, stage), api.misfits(), KICKS, api, ctrl.signal);
      if (ctrl.signal.aborted) return;
      playedRef.current = true;
      stopGaze = trackGaze(gazes, geo.size, stage);
      companions.registerHero(bridge);
      companions.set({ heroReady: true });
      setWelcomed(true);
    })().catch(() => { if (!ctrl.signal.aborted) setWelcomed(true); }); // lỗi thì mở khoá, đừng nhốt người xem

    // Đổi kích thước sau khi đã yên vị thì đặt lại cho khớp chữ I và sàn mới.
    const ro = new ResizeObserver(() => { if (parts.bodies[0].dataset.settled) placeAll(); });
    ro.observe(stage);
    return () => { ctrl.abort(); ro.disconnect(); stopGaze(); buddies.reset(); companions.registerHero(null); };
  }, [done, enabled]);

  const [a, b, c, d] = hero.headlineLines;
  const iAt = c.indexOf("I");

  return (
    <section id="hero" ref={stageRef} className="hs-stage" data-done={done} data-welcome={welcomed ? "done" : "pending"}>
      <canvas ref={canvasRef} role="img" aria-label={copy.canvasLabel} />
      <div ref={ghostRef} className="hs-ghost" data-show="false" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M4 2.5 19.5 12l-7 1.6-3.4 6.9z" /></svg>
        <span>{touch ? copy.hintTouch : copy.hint}</span>
      </div>

      <div className="hs-copy">
        <h1 lang="en" aria-label={hero.heading}>
          <span>{a}</span><span>{b}</span>
          <span className="hs-second"><mark>{iAt < 0 ? c : <>{c.slice(0, iAt)}<span ref={iRef}>I</span>{c.slice(iAt + 1)}</>}</mark></span>
          <span className="hs-second"><mark>{d}</mark></span>
        </h1>
        <div className="hs-after">
          <a className="hs-btn" href={hero.primary.href}>
            <span>{hero.primary.label}</span>
            <span className="hs-btn-key" aria-hidden="true"><PortfolioIcon name="down" /></span>
          </a>
        </div>
      </div>

      <div ref={buddyRef} className="hs-buddies" aria-hidden="true">
        {["ink", "ink", "green"].map((variant, i) =>
          <div key={i} className="hs-buddy" data-variant={variant}>
            <span className="hs-eyes"><span className="hs-gaze"><span className="hs-blink"><i /><i /></span></span></span>
          </div>)}
        <span className="hs-bubble hs-bubble-confused">{copy.confused}</span>
        <span className="hs-bubble hs-bubble-spotted">{copy.spotted}</span>
      </div>

      <div className="hs-meter">
        {done
          ? <button type="button" className="hs-text-btn" onClick={() => apiRef.current?.reshuffle()}><PortfolioIcon name="shuffle" />{copy.reshuffle}</button>
          : <button type="button" className="hs-text-btn" onClick={() => apiRef.current?.sortAll()}><PortfolioIcon name="sort" />{copy.sortAll}</button>}
        {welcomed && cue
          ? <a className="hs-cue" href={hero.primary.href}>
              <span>{copy.scrollCue}</span>
              <PortfolioIcon name="down" />
            </a>
          : <output>
              <span className="hs-bar" aria-hidden="true"><span style={{ width: `${progress}%` }} /></span>
              <b>{progress}%</b> {copy.progress}
            </output>}
      </div>
    </section>
  );
}
