/* Hoạt cảnh sau khi sắp xong (kịch bản đầy đủ: docs/companions.md).
   Chấm và Lệch nhảy từ logo trên nav xuống sàn, đếm quân thấy thiếu một. Trùng nằm
   lẫn trong biểu đồ như một ô thừa — hé mắt thì bị phát hiện, ô đỉnh cột bên cạnh đá
   nó văng xuống sàn. Rồi Chấm chạy lên làm dấu chấm cho chữ "I" trong THINGS. Trùng
   và Lệch ở lại sàn.

   Toạ độ mọi keyframe là điểm giữa-đáy của ô (transform-origin: 50% 100%), tính
   theo khung `.hs-stage`. Thứ tự ô: 0 Chấm, 1 Trùng, 2 Lệch. */

export type ChartGeometry = {
  chartLeft: number; // mép trái cột đầu tiên
  floor: number; // đáy biểu đồ
  narrow: boolean;
};

/** Ô lạc lúc còn nằm trên biểu đồ: bạn nào, điểm giữa-đáy, góc nghiêng, cạnh ô trên canvas. */
export type Misfit = { buddy: number; x: number; y: number; r: number; cell: number };

/** Những việc canvas làm hộ: giấu ô lạc khi DOM thế chỗ, và cho ô đỉnh cột "đá". */
export type Stagehand = {
  hideMisfits: (hide: boolean) => void;
  /** Trả về đúng lúc chân chạm ô bị đá. */
  kick: (bar: number, victims: number[]) => Promise<void>;
  /** Hai ô vừa rời logo: nav đổi chỗ của chúng thành ô trống. */
  leaveHome: () => void;
  /** Bỏ khung cắt của sân khấu trong lúc hai ô bay từ nav xuống. */
  unclip: (on: boolean) => void;
};

export type Kick = { bar: number; victims: number[] };

type Point = { x: number; y: number };
export type Pose = Point & { sx?: number; sy?: number; r?: number; o?: number };

export type BuddyParts = {
  bodies: HTMLElement[];
  eyes: HTMLElement[];
  confused: HTMLElement;
  spotted: HTMLElement;
};

const wait = (ms: number, signal: AbortSignal) => new Promise<void>((resolve, reject) => {
  if (signal.aborted) return reject(signal.reason);
  const id = setTimeout(resolve, ms);
  signal.addEventListener("abort", () => { clearTimeout(id); reject(signal.reason); }, { once: true });
});

/** Bong bóng thoại bật lên ở `at` (góc trên-trái, toạ độ khung chứa) rồi tắt. */
export function popBubble(el: HTMLElement, at: Point, duration: number) {
  return el.animate([
    { transform: `translate(${at.x}px, ${at.y}px) scale(0)`, opacity: 0 },
    { transform: `translate(${at.x}px, ${at.y - 8}px) scale(1.15)`, opacity: 1, offset: 0.15 },
    { transform: `translate(${at.x}px, ${at.y - 10}px) scale(1)`, opacity: 1, offset: 0.85 },
    { transform: `translate(${at.x}px, ${at.y - 10}px) scale(0.6)`, opacity: 0 },
  ], { duration, easing: "ease-out", fill: "forwards" });
}

/** Vị trí và bề ngang nét chữ "I" — đo bằng metric thật của font. */
export function measureDot(iEl: HTMLElement, stage: HTMLElement) {
  const s = stage.getBoundingClientRect();
  const r = iEl.getBoundingClientRect();
  const cs = getComputedStyle(iEl);
  const ctx = document.createElement("canvas").getContext("2d")!;
  ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const m = ctx.measureText("I");
  const left = r.left - s.left - m.actualBoundingBoxLeft;
  const right = r.left - s.left + m.actualBoundingBoxRight;
  const baseline = r.top - s.top + m.fontBoundingBoxAscent;
  const capTop = baseline - m.actualBoundingBoxAscent;
  const stem = right - left;
  return { x: (left + right) / 2, y: capTop - stem * 0.35, stem };
}

/** Chỗ ba ô đáp xuống sàn, bên trái biểu đồ. Lệch văng xa nhất — outlier mà. */
export function floorSpots(geo: ChartGeometry, size: number): Point[] {
  const step = geo.narrow ? [1.4, 3, 4.6] : [1.6, 3.4, 5.6];
  return step.map(k => ({ x: geo.chartLeft - size * k, y: geo.floor }));
}

/** Một cú nhảy parabol, lấy mẫu dày để chuyển động mượt mà vẫn dùng easing linear. */
export function arc(from: Point, to: Point, height: number, steps = 14): Pose[] {
  const top = Math.min(from.y, to.y) - height;
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const x = from.x + (to.x - from.x) * t;
    const base = from.y + (to.y - from.y) * t;
    const lift = 4 * t * (1 - t) * (base - top);
    return { x, y: base - lift, r: (to.x < from.x ? -1 : 1) * Math.sin(t * Math.PI) * 10 };
  });
}

/** Tư thế → keyframe. Toạ độ là điểm giữa-đáy; ô có cạnh `size`, xoay/co quanh đáy. */
export function toFrame(p: Pose, size: number) {
  return { transform: `translate(${p.x - size / 2}px, ${p.y - size}px) rotate(${p.r ?? 0}deg) scale(${p.sx ?? 1}, ${p.sy ?? 1})`, opacity: p.o ?? 1 };
}

export function createBuddies(parts: BuddyParts, size: number) {
  const anims: Animation[] = [];
  const frame = (p: Pose) => toFrame(p, size);

  function move(el: HTMLElement, poses: Pose[], duration: number, easing = "linear") {
    const a = el.animate(poses.map(frame), { duration, easing, fill: "forwards" });
    anims.push(a);
    return a.finished;
  }

  function fade(el: HTMLElement, to: number, duration: number) {
    anims.push(el.animate([{ opacity: to }], { duration, fill: "forwards" }));
  }

  /* Bị đá văng: vừa bay vừa lộn vòng, lớn dần từ cỡ ô biểu đồ lên cỡ nhân vật. */
  function tumble(from: Pose, to: Point, height: number, spin: number): Pose[] {
    const s0 = from.sx ?? 1;
    return arc(from, to, height, 22).map((p, i, all) => {
      const t = i / (all.length - 1);
      const s = s0 + (1 - s0) * t;
      return { ...p, r: (from.r ?? 0) + spin * t, sx: s, sy: s };
    });
  }

  function look(eye: HTMLElement, keyframes: string[], duration: number) {
    const a = eye.animate(keyframes.map(transform => ({ transform })), { duration, easing: "ease-in-out", fill: "forwards" });
    anims.push(a);
    return a.finished;
  }

  function pop(el: HTMLElement, at: Point, duration: number) {
    anims.push(popBubble(el, at, duration));
  }

  /** Vài bước nhảy trên sàn rồi một cú nhảy lớn tới `to`. */
  function trip(from: Point, to: Point, hops: number, jump: number): Pose[] {
    const launch = { x: from.x + (to.x - from.x) * 0.7, y: from.y };
    const path: Pose[] = [];
    let at = from;
    for (let i = 1; i <= hops; i++) {
      const next = { x: from.x + (launch.x - from.x) * (i / hops), y: from.y };
      path.push(...arc(at, next, size * 1.2, 8).slice(path.length ? 1 : 0));
      at = next;
    }
    const leap = arc(at, to, jump, 18);
    return path.concat(path.length ? leap.slice(1) : leap);
  }

  /* Mở khoá cuộn xong: Lệch chạy tới nút "cuộn xuống", nhảy lên giậm hai cái như bấm hộ
     người xem, rồi nhảy về chỗ. `target` đo lúc xuất phát; null thì thôi. */
  async function stomp(geo: ChartGeometry, target: () => Point | null, press: () => void, signal: AbortSignal) {
    const el = parts.bodies[2], eye = parts.eyes[2];
    const home = floorSpots(geo, size)[2];
    await wait(900, signal); // để nút trượt vào xong
    const to = target();
    if (!to) return;
    const hops = geo.narrow ? 1 : 3;
    look(eye, ["translateX(0)", `translateX(${to.x > home.x ? 30 : -30}%)`], 200);
    await move(el, trip(home, to, hops, Math.max(size * 3, 50)), hops * 200 + 520);
    for (let n = 0; n < 2; n++) {
      press();
      await move(el, [{ ...to, sx: 1.3, sy: 0.65 }, { ...to }], 140, "ease-out");
      await move(el, arc(to, to, size * 0.9, 8), 260);
    }
    press();
    await move(el, [{ ...to, sx: 1.3, sy: 0.65 }, { ...to }], 140, "ease-out");
    look(eye, ["translateX(0)"], 200);
    await wait(250, signal);
    await move(el, arc(to, home, size * 3, 22), 720);
    await move(el, [{ ...home, sx: 1.25, sy: 0.75 }, { ...home }], 160, "ease-out");
  }

  /* Sau màn chào: Trùng — thợ chụp ảnh của nhóm — thấy góc trống trên biểu đồ, nhảy lên
     đậu trên mép khung MV, giậm một cái là màn hình bật lên (reveal). `target` là chỗ đứng
     trên mép trên của khung, đo lúc xuất phát; null thì bật màn hình luôn. */
  async function project(geo: ChartGeometry, target: () => Point | null, reveal: () => void, signal: AbortSignal) {
    const el = parts.bodies[1], eye = parts.eyes[1];
    const home = floorSpots(geo, size)[1];
    await wait(450, signal);
    const to = target();
    if (!to) { reveal(); return; }
    look(eye, ["translate(0, 0)", "translate(30%, -30%)"], 220);
    pop(parts.spotted, { x: home.x - 2, y: home.y - size * 2.2 }, 700);
    await move(el, [{ ...home }, { ...home, y: home.y - size * 0.6 }, { ...home }], 260, "ease-out");
    await wait(160, signal);
    const hops = geo.narrow ? 1 : 2;
    await move(el, trip(home, to, hops, Math.max(size * 4, 90)), hops * 220 + 720);
    await move(el, [{ ...to, sx: 1.35, sy: 0.6 }, { ...to }], 160, "ease-out");
    reveal();
    look(eye, ["translate(30%, -30%)", "translate(15%, 35%)", "translate(0, 0)"], 900);
    el.dataset.settled = "true";
  }

  /** `logo`: chỗ của Chấm (0) và Lệch (2) trong logo trên nav, đã quy về toạ độ sân khấu
   *  (sx/sy = cỡ ô logo so với cỡ nhân vật); null thì rơi từ mép trên xuống. */
  async function play(geo: ChartGeometry, dot: ReturnType<typeof measureDot>, logo: (Pose | null)[], misfits: Misfit[], kicks: Kick[], hand: Stagehand, signal: AbortSignal) {
    const { bodies, eyes, confused, spotted } = parts;
    const spots = floorSpots(geo, size);
    const start: Pose[] = [];
    misfits.forEach(m => { start[m.buddy] = { x: m.x, y: m.y, r: m.r, sx: m.cell / size, sy: m.cell / size }; });
    const hiding = misfits.map(m => m.buddy);
    const jumpers = [0, 1, 2].filter(i => !hiding.includes(i));

    // 0. DOM thế chỗ ô lạc trên canvas — Trùng nhắm mắt, nằm lẫn như mọi ô khác.
    await Promise.all(hiding.map(i => move(bodies[i], [start[i], start[i]], 1)));
    hand.hideMisfits(true);

    // 1. Chấm rồi Lệch nhảy ra khỏi logo, lớn dần từ cỡ ô logo lên cỡ nhân vật.
    const exits = jumpers.map(i => logo[i] ?? { x: spots[i].x, y: -size, sx: 1, sy: 1 });
    hand.unclip(true);
    await Promise.all(jumpers.map((i, n) => move(bodies[i], [exits[n], exits[n]], 1)));
    jumpers.forEach(i => fade(eyes[i], 1, 1));
    await wait(200, signal);
    hand.leaveHome();
    await Promise.all(jumpers.map(async (i, n) => {
      await wait(n * 260, signal);
      const p = spots[i];
      if (i !== 2) {
        await move(bodies[i], tumble(exits[n], p, size * 1.6, 0), 760);
        await move(bodies[i], [{ ...p, sx: 1.4, sy: 0.6 }, { ...p }], 180, "ease-out");
        return;
      }
      // Lệch: lộn một vòng, đáp quá đà ra xa rồi mới nhảy lùi về chỗ.
      const over = { x: Math.max(size * 0.7, p.x - size * 1.6), y: p.y };
      await move(bodies[i], tumble(exits[n], over, size * 2.5, -360), 820);
      await move(bodies[i], [{ ...over, sx: 1.45, sy: 0.55 }, { ...over }], 150, "ease-out");
      await move(bodies[i], arc(over, p, size * 0.9, 10), 300);
      await move(bodies[i], [{ ...p, sx: 1.25, sy: 0.75 }, { ...p }], 140, "ease-out");
    }));
    hand.unclip(false);
    await wait(200, signal);

    // 2. Đếm quân: Chấm nhìn Lệch, ngước lên logo — thiếu một. Cả hai ngó nghiêng.
    await look(eyes[0], ["translate(0, 0)", "translate(-30%, 0)"], 200);
    await wait(180, signal);
    await look(eyes[0], ["translate(-30%, 0)", "translate(-30%, -35%)"], 220);
    pop(confused, { x: spots[0].x - 4, y: spots[0].y - size * 2.2 }, 1100);
    await wait(200, signal);
    await Promise.all(jumpers.map((i, n) => Promise.all([
      look(eyes[i], ["translate(0, 0)", "translateX(-28%)", "translateX(-28%)", "translateX(28%)", "translateX(28%)", "translateX(0)"], 900 + n * 120),
      move(bodies[i], [{ ...spots[i] }, { ...spots[i], r: -7 }, { ...spots[i], r: 7 }, { ...spots[i], r: -4 }, { ...spots[i] }], 900 + n * 120, "ease-in-out"),
    ])));

    // 3. Trùng hé mắt trong biểu đồ, liếc xuống hai bạn. Lệch thấy trước — "!".
    hiding.forEach(i => { fade(eyes[i], 1, 160); look(eyes[i], ["translate(0, 0)", "translate(-30%, 25%)"], 260); });
    await wait(350, signal);
    pop(spotted, { x: spots[2].x - 2, y: spots[2].y - size * 2.2 }, 700);
    jumpers.forEach(i => look(eyes[i], ["translate(0, 0)", "translate(30%, -30%)"], 160));
    await move(bodies[2], [{ ...spots[2] }, { ...spots[2], y: spots[2].y - size * 0.8 }, { ...spots[2] }], 280, "ease-out");
    await wait(300, signal);

    // 4. Ô đỉnh cột bên cạnh đá Trùng văng xuống sàn; đáp bẹp dí rồi đứng dậy.
    for (const kick of kicks) {
      await hand.kick(kick.bar, kick.victims);
      await Promise.all(kick.victims.map(async v => {
        fade(eyes[v], 0, 60);
        await move(bodies[v], tumble(start[v], spots[v], size * 3, -360), 700);
        await move(bodies[v], [{ ...spots[v], sx: 0.9, sy: 1.15 }, { ...spots[v], sx: 1.45, sy: 0.5 }], 90, "ease-out");
      }));
    }
    jumpers.forEach(i => look(eyes[i], ["translate(30%, -30%)", "translate(0, 0)"], 200));
    await wait(300, signal);
    await Promise.all(hiding.map(i => move(bodies[i], [
      { ...spots[i], sx: 1.45, sy: 0.5 }, { ...spots[i], sx: 0.9, sy: 1.15 }, { ...spots[i] },
    ], 320, "ease-out")));
    hiding.forEach(i => { look(eyes[i], ["translate(0, 0)"], 1); fade(eyes[i], 1, 160); });
    await wait(300, signal);

    // 5. Chấm nhìn thấy chữ I.
    const leader = bodies[0];
    const goal = { x: dot.x, y: dot.y };
    look(eyes[0], ["translate(0, 0)", "translate(-30%, -30%)"], 200);
    pop(spotted, { x: spots[0].x - 2, y: spots[0].y - size * 2.2 }, 700);
    await move(leader, [{ ...spots[0] }, { ...spots[0], y: spots[0].y - size * 0.6 }, { ...spots[0] }], 260, "ease-out");
    await wait(200, signal);

    // 6. Chạy: vài bước nhảy trên sàn rồi một cú nhảy lớn lên đỉnh chữ I.
    const hops = geo.narrow ? 0 : 3;
    const launch = { x: spots[0].x + (goal.x - spots[0].x) * 0.45, y: spots[0].y };
    const path: Pose[] = [];
    let from: Point = spots[0];
    for (let i = 1; i <= hops; i++) {
      const to = { x: spots[0].x + (launch.x - spots[0].x) * (i / hops), y: launch.y };
      path.push(...arc(from, to, size * 1.2, 8).slice(path.length ? 1 : 0));
      from = to;
    }
    const jump = arc(from, goal, Math.max(size * 4, 80), 22);
    path.push(...(path.length ? jump.slice(1) : jump));

    // Trùng chạy theo vài bước (chậm nửa nhịp) rồi khựng lại; Lệch đứng ngó.
    const follow = (async () => {
      await wait(180, signal);
      const p = spots[1];
      const stop = { x: p.x + (launch.x - p.x) * 0.25, y: p.y };
      await move(bodies[1], arc(p, stop, size, 10), 420);
      await move(bodies[1], [...arc(stop, p, size * 0.8, 10)], 460);
    })();
    await move(leader, path, hops * 230 + 620);

    // 7. Đáp xuống, bẹp một nhịp, rồi phồng ra cho bằng nét chữ.
    const k = dot.stem / size;
    await move(leader, [{ ...goal }, { ...goal, sx: 1.3, sy: 0.65 }, { ...goal, sx: k * 0.9, sy: k * 1.1 }, { ...goal, sx: k, sy: k }], 420, "ease-out");
    look(eyes[0], ["translate(-30%, -30%)", "translate(0, 0)"], 200);
    leader.dataset.settled = "true";
    await follow;

    // 8. Trùng và Lệch nhảy cổ vũ rồi đứng lại dưới sàn.
    await Promise.all(bodies.slice(1).map(async (el, i) => {
      const p = spots[i + 1];
      await wait(i * 120, signal);
      for (let n = 0; n < 2; n++) await move(el, arc(p, p, size * 0.9, 8), 300);
      el.dataset.settled = "true";
    }));
  }

  /** Đặt thẳng vào tư thế cuối (đổi kích thước, hoặc giảm chuyển động). */
  function place(geo: ChartGeometry, dot: ReturnType<typeof measureDot>, projector?: Point | null) {
    reset();
    const k = dot.stem / size;
    const spots = floorSpots(geo, size);
    parts.bodies.forEach((el, i) => {
      Object.assign(el.style, frame(i === 0 ? { x: dot.x, y: dot.y, sx: k, sy: k } : i === 1 && projector ? projector : spots[i]));
      el.dataset.settled = "true";
    });
    parts.eyes.forEach(eye => { eye.style.opacity = "1"; });
  }

  function reset() {
    anims.splice(0).forEach(a => a.cancel());
    [...parts.bodies, ...parts.eyes].forEach(el => { el.removeAttribute("style"); delete el.dataset.settled; });
  }

  return { play, stomp, project, place, reset };
}

/** Mắt nhìn theo con trỏ. Mỗi ô một tốc độ: Lệch quay nhanh, Trùng chậm nửa nhịp. */
export function trackGaze(gazes: HTMLElement[], size: number, scope: HTMLElement) {
  const EASE = [0.3, 0.1, 0.55];
  const max = size * 0.13;
  const cur = gazes.map(() => ({ x: 0, y: 0 }));
  let target: Point | null = null;
  let raf = 0;
  let visible = true;

  function tick() {
    raf = 0;
    if (!target) return;
    let busy = false;
    gazes.forEach((g, i) => {
      const r = g.getBoundingClientRect();
      if (!r.width) return;
      const dx = target!.x - (r.left + r.width / 2 - cur[i].x);
      const dy = target!.y - (r.top + r.height / 2 - cur[i].y);
      const d = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, d / 160) * max;
      const want = { x: (dx / d) * reach, y: (dy / d) * reach };
      cur[i].x += (want.x - cur[i].x) * EASE[i];
      cur[i].y += (want.y - cur[i].y) * EASE[i];
      if (Math.abs(want.x - cur[i].x) + Math.abs(want.y - cur[i].y) > 0.05) busy = true;
      g.style.transform = `translate(${cur[i].x}px, ${cur[i].y}px)`;
    });
    if (busy) raf = requestAnimationFrame(tick);
  }

  const onMove = (e: PointerEvent) => {
    if (!visible) return;
    target = { x: e.clientX, y: e.clientY };
    if (!raf) raf = requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
  io.observe(scope);
  window.addEventListener("pointermove", onMove);

  return () => {
    window.removeEventListener("pointermove", onMove);
    io.disconnect();
    cancelAnimationFrame(raf);
    gazes.forEach(g => g.removeAttribute("style"));
  };
}
