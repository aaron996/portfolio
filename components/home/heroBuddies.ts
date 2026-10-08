/* Hoạt cảnh sau khi sắp xong (kịch bản đầy đủ: docs/companions.md).
   Biểu đồ xếp xong vẫn còn 3 ô nằm sai chỗ — Chấm, Trùng, Lệch. Ô đỉnh của cột
   bên cạnh đá văng chúng xuống sàn; chúng đứng dậy, ngó nghiêng hoang mang, rồi
   Chấm chạy lên làm dấu chấm cho chữ "I" trong THINGS. Trùng và Lệch ở lại sàn.

   Toạ độ mọi keyframe là điểm giữa-đáy của ô (transform-origin: 50% 100%), tính
   theo khung `.hs-stage`. Thứ tự ô: 0 Chấm, 1 Trùng, 2 Lệch. */

export type ChartGeometry = {
  chartLeft: number; // mép trái cột đầu tiên
  floor: number; // đáy biểu đồ
  narrow: boolean;
};

/** Ô lạc lúc còn nằm trên biểu đồ: điểm giữa-đáy, góc nghiêng, cạnh ô trên canvas. */
export type Misfit = { x: number; y: number; r: number; cell: number };

/** Những việc canvas làm hộ: giấu ô lạc khi DOM thế chỗ, và cho ô đỉnh cột "đá". */
export type Stagehand = {
  hideMisfits: (hide: boolean) => void;
  /** Trả về đúng lúc chân chạm ô bị đá. */
  kick: (bar: number, victims: number[]) => Promise<void>;
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
    const a = el.animate([
      { transform: `translate(${at.x}px, ${at.y}px) scale(0)`, opacity: 0 },
      { transform: `translate(${at.x}px, ${at.y - 8}px) scale(1.15)`, opacity: 1, offset: 0.15 },
      { transform: `translate(${at.x}px, ${at.y - 10}px) scale(1)`, opacity: 1, offset: 0.85 },
      { transform: `translate(${at.x}px, ${at.y - 10}px) scale(0.6)`, opacity: 0 },
    ], { duration, easing: "ease-out", fill: "forwards" });
    anims.push(a);
  }

  async function play(geo: ChartGeometry, dot: ReturnType<typeof measureDot>, misfits: Misfit[], kicks: Kick[], hand: Stagehand, signal: AbortSignal) {
    const { bodies, eyes, confused, spotted } = parts;
    const spots = floorSpots(geo, size);
    const start: Pose[] = misfits.map(m => ({ x: m.x, y: m.y, r: m.r, sx: m.cell / size, sy: m.cell / size }));

    // 0. DOM thế chỗ ba ô lạc trên canvas; chúng hé mắt, ngó sang bên phải nghe ngóng.
    await Promise.all(bodies.map((el, i) => move(el, [start[i], start[i]], 1)));
    hand.hideMisfits(true);
    await wait(350, signal);
    eyes.forEach(eye => fade(eye, 1, 150));
    await Promise.all(eyes.map(eye => look(eye, ["translateX(0)", "translateX(30%)"], 240)));
    await wait(380, signal);

    // 1. Từng cú đá: ô bị đá nhắm mắt, lộn vòng bay xuống sàn, đáp bẹp dí.
    const landed: Promise<void>[] = [];
    for (const kick of kicks) {
      await hand.kick(kick.bar, kick.victims);
      landed.push(...kick.victims.map(async (v, n) => {
        await wait(n * 70, signal);
        fade(eyes[v], 0, 60);
        const far = v === 2;
        await move(bodies[v], tumble(start[v], spots[v], size * (far ? 4.5 : 3), far ? -540 : -360), far ? 820 : 660);
        await move(bodies[v], [{ ...spots[v], sx: 0.9, sy: 1.15 }, { ...spots[v], sx: 1.45, sy: 0.5 }], 90, "ease-out");
      }));
      await wait(420, signal);
    }
    await Promise.all(landed);
    await wait(500, signal);

    // 2. Đứng dậy, mở mắt.
    await Promise.all(bodies.map((el, i) => move(el, [
      { ...spots[i], sx: 1.45, sy: 0.5 }, { ...spots[i], sx: 0.9, sy: 1.15 }, { ...spots[i] },
    ], 320, "ease-out")));
    eyes.forEach(eye => { look(eye, ["translateX(0)"], 1); fade(eye, 1, 160); });

    // 3. Ngó nghiêng hoang mang.
    pop(confused, { x: spots[0].x - 4, y: spots[0].y - size * 2.2 }, 1300);
    await Promise.all([
      ...eyes.map((eye, i) => look(eye, ["translateX(0)", "translateX(-28%)", "translateX(-28%)", "translateX(28%)", "translateX(28%)", "translateX(0)"], 1300 + i * 120)),
      ...bodies.map((el, i) => move(el, [{ ...spots[i] }, { ...spots[i], r: -7 }, { ...spots[i], r: 7 }, { ...spots[i], r: -4 }, { ...spots[i] }], 1300 + i * 120, "ease-in-out")),
    ]);

    // 4. Chấm nhìn thấy chữ I.
    const leader = bodies[0];
    const goal = { x: dot.x, y: dot.y };
    look(eyes[0], ["translate(0, 0)", "translate(-30%, -30%)"], 200);
    pop(spotted, { x: spots[0].x - 2, y: spots[0].y - size * 2.2 }, 700);
    await move(leader, [{ ...spots[0] }, { ...spots[0], y: spots[0].y - size * 0.6 }, { ...spots[0] }], 260, "ease-out");
    await wait(200, signal);

    // 5. Chạy: vài bước nhảy trên sàn rồi một cú nhảy lớn lên đỉnh chữ I.
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

    // 6. Đáp xuống, bẹp một nhịp, rồi phồng ra cho bằng nét chữ.
    const k = dot.stem / size;
    await move(leader, [{ ...goal }, { ...goal, sx: 1.3, sy: 0.65 }, { ...goal, sx: k * 0.9, sy: k * 1.1 }, { ...goal, sx: k, sy: k }], 420, "ease-out");
    look(eyes[0], ["translate(-30%, -30%)", "translate(0, 0)"], 200);
    leader.dataset.settled = "true";
    await follow;

    // 7. Trùng và Lệch nhảy cổ vũ rồi đứng lại dưới sàn.
    await Promise.all(bodies.slice(1).map(async (el, i) => {
      const p = spots[i + 1];
      await wait(i * 120, signal);
      for (let n = 0; n < 2; n++) await move(el, arc(p, p, size * 0.9, 8), 300);
      el.dataset.settled = "true";
    }));
  }

  /** Đặt thẳng vào tư thế cuối (đổi kích thước, hoặc giảm chuyển động). */
  function place(geo: ChartGeometry, dot: ReturnType<typeof measureDot>) {
    reset();
    const k = dot.stem / size;
    const spots = floorSpots(geo, size);
    parts.bodies.forEach((el, i) => {
      Object.assign(el.style, frame(i === 0 ? { x: dot.x, y: dot.y, sx: k, sy: k } : spots[i]));
      el.dataset.settled = "true";
    });
    parts.eyes.forEach(eye => { eye.style.opacity = "1"; });
  }

  function reset() {
    anims.splice(0).forEach(a => a.cancel());
    [...parts.bodies, ...parts.eyes].forEach(el => { el.removeAttribute("style"); delete el.dataset.settled; });
  }

  return { play, place, reset };
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
