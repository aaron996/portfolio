/**
 * Engine cho minigame "Ải Vận Hành".
 *
 * Không phụ thuộc React. Chỉ nhận một <canvas> cùng dữ liệu bản đồ, rồi
 * bắn ra event khi có chuyện đáng để giao diện biết (qua ải, nhặt kỹ năng,
 * hết game). HUD máu và thanh máu trùm vẽ thẳng trong canvas — nếu đẩy
 * chúng lên React thì mỗi khung hình phải re-render một lần, không đáng.
 *
 * Toàn bộ chữ và bảng màu đến từ content/content.vi.ts.
 */
import type { GameMap } from "@/content/types";

export type GameKey = "left" | "right" | "jump" | "atk";
export type GamePhase = "title" | "play" | "clear" | "end";

export interface GameHandlers {
  /** Đổi bản đồ — giao diện cập nhật tên ải trên HUD */
  onMap?: (index: number) => void;
  /** Hạ trùm ải thứ index, rơi ra `skills` */
  onCleared?: (index: number, skills: string[]) => void;
  /** Hạ trùm ải cuối */
  onFinished?: () => void;
}

export interface GameLabels {
  /** Có {boss} */
  bossAppear: string;
  deathLine: string;
}

/** Kích thước thế giới, cố định để bố cục bệ nhảy trong content luôn đúng */
const W = 800;
const H = 420;
const GY = 344;
const WORLD = 2200;

interface Mob {
  x: number; y: number; w: number; h: number;
  hp: number; dir: number; a: number; b: number;
  hurt: number; bob: number; dead: boolean;
}
interface Boss {
  x: number; y: number; w: number; h: number;
  hp: number; mhp: number; dir: number;
  hurt: number; tel: number; cd: number; bob: number;
}
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string }
interface Shot { x: number; y: number; vx: number; r: number }

export interface GameInstance {
  loadMap(index: number): void;
  resume(): void;
  pause(): void;
  press(key: GameKey): void;
  release(key: GameKey): void;
  destroy(): void;
}

export function createGame(
  canvas: HTMLCanvasElement,
  maps: GameMap[],
  labels: GameLabels,
  handlers: GameHandlers = {}
): GameInstance {
  const g = canvas.getContext("2d");
  if (!g) throw new Error("Không lấy được 2d context của canvas");

  const reduced =
    typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // canvas.font không hiểu var(--font-inter), phải đọc tên font thật ra trước
  const cssVar = (name: string, fallback: string) => {
    const v = getComputedStyle(canvas).getPropertyValue(name).trim();
    return v || fallback;
  };
  const FONT_SANS = `${cssVar("--font-inter", "")} system-ui, sans-serif`.trim();
  const FONT_DISPLAY = `${cssVar("--font-archivo", "")} system-ui, sans-serif`.trim();

  let lv = 0;
  let phase: GamePhase = "title";
  let raf = 0;
  let last = 0;
  let shake = 0;
  let fade = 0;
  let msg = "";
  let msgT = 0;

  const keys: Record<GameKey, boolean> = { left: false, right: false, jump: false, atk: false };

  const player = {
    x: 60, y: GY - 40, w: 26, h: 40,
    vx: 0, vy: 0, face: 1,
    hp: 5, mhp: 5, inv: 0, atk: 0, cd: 0, ground: false,
  };
  let mobs: Mob[] = [];
  let parts: Particle[] = [];
  let shots: Shot[] = [];
  let boss: Boss | null = null;
  let cam = 0;

  /* ── vòng đời ải ─────────────────────────────────────── */

  function loadMap(index: number) {
    lv = index;
    const m = maps[lv];
    Object.assign(player, {
      x: 60, y: GY - 40, vx: 0, vy: 0, face: 1,
      hp: 5, inv: 0, atk: 0, cd: 0, ground: false,
    });
    parts = [];
    shots = [];
    boss = null;
    cam = 0;
    shake = 0;
    fade = 0;
    msg = "";
    msgT = 0;

    // Quái đứng rải trên mặt đất, cộng thêm vài con đứng trên bệ nhảy
    const spots: [number, number][] = [
      [430, GY], [660, GY], [900, GY], [1150, GY], [1420, GY], [1680, GY],
    ];
    m.plats.forEach((p, i) => {
      if (i % 2 === 0) spots.push([p[0] + p[2] / 2, p[1]]);
    });
    mobs = spots.map(([x, y]) => ({
      x, y: y - 30, w: 30, h: 30,
      hp: 2, dir: Math.random() < 0.5 ? -1 : 1,
      a: x - 70, b: x + 70,
      hurt: 0, bob: Math.random() * 6, dead: false,
    }));

    handlers.onMap?.(lv);
  }

  function spawnBoss() {
    boss = {
      x: WORLD - 190, y: GY - 78, w: 70, h: 78,
      hp: 16, mhp: 16, dir: -1,
      hurt: 0, tel: 0, cd: 2.2, bob: 0,
    };
    say(labels.bossAppear.replace("{boss}", maps[lv].boss), 1.6);
  }

  function clearMap() {
    phase = "clear";
    fade = 0;
    const m = maps[lv];
    if (boss) puff(boss.x + boss.w / 2, boss.y + boss.h / 2, "#d4f236", 40);
    boss = null;
    handlers.onCleared?.(lv, m.skills);
    if (lv + 1 >= maps.length) handlers.onFinished?.();
  }

  /* ── hành động ───────────────────────────────────────── */

  function jump() {
    if (phase !== "play" || !player.ground) return;
    player.vy = -11.4;
    player.ground = false;
    puff(player.x + player.w / 2, player.y + player.h, "#ffffff", 4);
  }

  function attack() {
    if (phase !== "play" || player.cd > 0) return;
    player.atk = 0.19;
    player.cd = 0.3;

    // Tầm chém rộng hơn thân người, để đánh được trước khi bị quái chạm vào
    const hb = {
      x: player.face > 0 ? player.x + player.w - 6 : player.x - 52,
      y: player.y + 2, w: 58, h: 34,
    };
    const m = maps[lv];

    for (const o of mobs) {
      if (o.dead || !overlap(hb, o)) continue;
      o.hp -= 1;
      o.hurt = 0.18;
      o.x += player.face * 14;
      shake = Math.max(shake, 3);
      puff(o.x + o.w / 2, o.y + o.h / 2, m.palette.mob, 6);
      if (o.hp <= 0) {
        o.dead = true;
        puff(o.x + o.w / 2, o.y + o.h / 2, "#d4f236", 14);
      }
    }

    if (boss && overlap(hb, boss)) {
      boss.hp -= 1;
      boss.hurt = 0.16;
      shake = Math.max(shake, 5);
      puff(boss.x + boss.w / 2, boss.y + boss.h / 2, m.palette.boss, 8);
      if (boss.hp <= 0) clearMap();
    }
  }

  function hurtPlayer(dir: number) {
    if (player.inv > 0) return;
    player.hp -= 1;
    player.inv = 1.35;
    player.vy = -6;
    player.vx = dir * 7.5;
    shake = 6;
    puff(player.x + player.w / 2, player.y + player.h / 2, "#ff6b5e", 8);
    if (player.hp <= 0) {
      say(labels.deathLine, 1.4);
      window.setTimeout(() => {
        if (phase === "play") loadMap(lv);
      }, 700);
    }
  }

  /* ── tiện ích ────────────────────────────────────────── */

  type Box = { x: number; y: number; w: number; h: number };
  const overlap = (a: Box, b: Box) =>
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  function puff(x: number, y: number, color: string, n: number) {
    for (let i = 0; i < n; i++) {
      parts.push({
        x, y, color,
        vx: (Math.random() - 0.5) * 5,
        vy: -Math.random() * 4 - 1,
        life: 0.55,
      });
    }
  }
  function say(text: string, seconds: number) {
    msg = text;
    msgT = seconds;
  }

  /* ── cập nhật ────────────────────────────────────────── */

  function step(dt: number) {
    if (phase !== "play" && phase !== "clear") return;
    const m = maps[lv];

    player.cd = Math.max(0, player.cd - dt);
    player.atk = Math.max(0, player.atk - dt);
    player.inv = Math.max(0, player.inv - dt);
    msgT = Math.max(0, msgT - dt);
    shake *= 0.86;

    const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    if (dir) {
      player.vx += dir * 1.5;
      player.face = dir;
    }
    player.vx *= 0.82;
    player.vx = Math.max(-6, Math.min(6, player.vx));
    player.x = Math.max(0, Math.min(WORLD - player.w, player.x + player.vx * dt * 60));

    const prevBottom = player.y + player.h;
    player.vy += 0.62 * dt * 60;
    player.y += player.vy * dt * 60;
    player.ground = false;
    if (player.y + player.h >= GY) {
      player.y = GY - player.h;
      player.vy = 0;
      player.ground = true;
    }
    // Bệ nhảy chỉ đỡ khi rơi từ trên xuống, để nhảy xuyên từ dưới lên được
    for (const [px, py, pw] of m.plats) {
      if (
        player.vy > 0 && prevBottom <= py + 4 &&
        player.y + player.h >= py &&
        player.x + player.w > px && player.x < px + pw
      ) {
        player.y = py - player.h;
        player.vy = 0;
        player.ground = true;
      }
    }

    let alive = 0;
    for (const o of mobs) {
      if (o.dead) continue;
      alive++;
      o.hurt = Math.max(0, o.hurt - dt);
      o.bob += dt * 6;
      if (o.hurt <= 0) o.x += o.dir * 0.92 * dt * 60;
      if (o.x < o.a) { o.x = o.a; o.dir = 1; }
      if (o.x > o.b) { o.x = o.b; o.dir = -1; }
      if (overlap(player, o)) hurtPlayer(player.x < o.x ? -1 : 1);
    }
    if (!alive && !boss && phase === "play") spawnBoss();

    if (boss) {
      boss.hurt = Math.max(0, boss.hurt - dt);
      boss.bob += dt * 3;
      boss.cd -= dt;
      if (boss.tel > 0) {
        boss.tel -= dt;
        if (boss.tel <= 0) {
          // Giậm đất: hai quả cầu chạy hai bên, phải nhảy tránh
          shake = 8;
          shots.push({ x: boss.x + 8, y: GY - 16, vx: -4.2, r: 11 });
          shots.push({ x: boss.x + boss.w - 8, y: GY - 16, vx: 4.2, r: 11 });
        }
      } else if (boss.cd <= 0) {
        boss.tel = 0.55;
        boss.cd = 2.6;
      } else {
        boss.dir = player.x < boss.x ? -1 : 1;
        boss.x = Math.max(60, Math.min(WORLD - boss.w - 20, boss.x + boss.dir * 0.85 * dt * 60));
      }
      if (overlap(player, boss)) hurtPlayer(player.x < boss.x ? -1 : 1);
    }

    shots = shots.filter((s) => {
      s.x += s.vx * dt * 60;
      if (overlap(player, { x: s.x - s.r, y: s.y - s.r, w: s.r * 2, h: s.r * 2 })) {
        hurtPlayer(s.vx > 0 ? 1 : -1);
      }
      return s.x > -30 && s.x < WORLD + 30;
    });

    parts = parts.filter((p) => {
      p.life -= dt;
      p.vy += 0.35;
      p.x += p.vx;
      p.y += p.vy;
      return p.life > 0;
    });

    const want = Math.max(0, Math.min(WORLD - W, player.x + player.w / 2 - W / 2));
    cam += (want - cam) * Math.min(1, dt * 7);
    if (phase === "clear") fade += dt;
  }

  /* ── vẽ ──────────────────────────────────────────────── */

  function drawBackground(m: GameMap) {
    const p = m.palette;
    g!.fillStyle = p.sky;
    g!.fillRect(0, 0, W, H);

    g!.fillStyle = p.far;
    for (let i = 0; i < 9; i++) {
      const x = ((i * 300 - cam * 0.25) % (W + 300)) - 150;
      const h = 70 + ((i * 53) % 60);
      g!.fillRect(x, GY - h - 40, 150, h + 40);
    }

    for (let i = 0; i < 11; i++) {
      const x = ((i * 220 - cam * 0.55) % (W + 220)) - 110;
      const h = 48 + ((i * 71) % 54);
      g!.fillStyle = p.mid;
      if (m.deco === "container") {
        g!.fillRect(x, GY - h, 120, h);
        g!.fillStyle = p.far;
        g!.fillRect(x + 8, GY - h + 9, 104, 5);
      } else if (m.deco === "gear") {
        g!.beginPath();
        g!.arc(x + 60, GY - h, 30, 0, Math.PI * 2);
        g!.fill();
      } else {
        g!.fillRect(x, GY - h, 90, h);
      }
    }

    g!.fillStyle = p.ground;
    g!.fillRect(0, GY, W, H - GY);
    g!.fillStyle = p.groundEdge;
    g!.fillRect(0, GY, W, 7);
  }

  function drawLabel(text: string, x: number, y: number) {
    g!.font = `500 10px ${FONT_SANS}`;
    g!.textAlign = "center";
    g!.globalAlpha = 0.82;
    g!.lineWidth = 3;
    g!.strokeStyle = "rgba(10,10,10,.75)";
    g!.strokeText(text, x, y);
    g!.fillStyle = "#ffffff";
    g!.fillText(text, x, y);
    g!.globalAlpha = 1;
  }

  function drawBlob(x: number, y: number, w: number, h: number, color: string, hurt: number, bob: number) {
    const o = Math.sin(bob) * 2;
    g!.fillStyle = hurt > 0 ? "#ffffff" : color;
    g!.beginPath();
    g!.roundRect(x, y + o, w, h, 9);
    g!.fill();
    g!.fillStyle = "rgba(10,10,10,.82)";
    const e = w * 0.08;
    g!.beginPath();
    g!.arc(x + w * 0.33, y + h * 0.4 + o, e, 0, Math.PI * 2);
    g!.arc(x + w * 0.67, y + h * 0.4 + o, e, 0, Math.PI * 2);
    g!.fill();
    g!.fillRect(x + w * 0.34, y + h * 0.66 + o, w * 0.32, 2.5);
  }

  function draw() {
    const m = maps[lv];
    g!.save();
    if (!reduced && shake > 0.2) {
      g!.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    }
    drawBackground(m);
    g!.translate(-cam, 0);

    for (const [px, py, pw] of m.plats) {
      g!.fillStyle = m.palette.groundEdge;
      g!.beginPath();
      g!.roundRect(px, py, pw, 13, 5);
      g!.fill();
      g!.fillStyle = "rgba(255,255,255,.22)";
      g!.fillRect(px + 4, py + 2, pw - 8, 3);
    }

    // Cửa ải ở cuối bản đồ
    g!.fillStyle = "rgba(255,255,255,.5)";
    g!.fillRect(WORLD - 70, GY - 96, 46, 96);
    g!.fillStyle = m.palette.groundEdge;
    g!.fillRect(WORLD - 64, GY - 88, 34, 88);

    for (const o of mobs) {
      if (o.dead) continue;
      drawBlob(o.x, o.y, o.w, o.h, m.palette.mob, o.hurt, o.bob);
      drawLabel(m.mob, o.x + o.w / 2, o.y - 7);
    }

    if (boss) {
      const flash = boss.tel > 0 && Math.floor(boss.tel * 14) % 2 === 0;
      drawBlob(boss.x, boss.y, boss.w, boss.h, flash ? "#ffe9a8" : m.palette.boss, boss.hurt, boss.bob);
      g!.fillStyle = "#d4f236";
      g!.beginPath();
      g!.moveTo(boss.x + 12, boss.y - 4);
      g!.lineTo(boss.x + 22, boss.y - 20);
      g!.lineTo(boss.x + 35, boss.y - 6);
      g!.lineTo(boss.x + 48, boss.y - 20);
      g!.lineTo(boss.x + 58, boss.y - 4);
      g!.fill();
    }

    g!.fillStyle = "#d4f236";
    for (const s of shots) {
      g!.beginPath();
      g!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      g!.fill();
    }

    // Nhấp nháy khi đang bất tử sau lúc trúng đòn
    if (player.inv <= 0 || Math.floor(player.inv * 16) % 2 === 0) {
      g!.fillStyle = "#1e1e1c";
      g!.beginPath();
      g!.roundRect(player.x, player.y, player.w, player.h, 7);
      g!.fill();
      g!.fillStyle = "#ffd8ae";
      g!.beginPath();
      g!.roundRect(player.x + 3, player.y - 9, player.w - 6, 16, 6);
      g!.fill();
      g!.fillStyle = "#0a0a0a";
      g!.fillRect(player.x + (player.face > 0 ? 15 : 6), player.y - 4, 4, 4);

      if (player.atk > 0) {
        g!.fillStyle = "rgba(212,242,54,.92)";
        g!.beginPath();
        g!.arc(
          player.face > 0 ? player.x + player.w + 10 : player.x - 10,
          player.y + 18, 32,
          player.face > 0 ? -1.1 : 2.0,
          player.face > 0 ? 1.1 : 4.3
        );
        g!.lineTo(player.face > 0 ? player.x + player.w - 4 : player.x + 4, player.y + 18);
        g!.fill();
      }
    }

    for (const p of parts) {
      g!.globalAlpha = Math.max(0, p.life / 0.55);
      g!.fillStyle = p.color;
      g!.fillRect(p.x - 2.5, p.y - 2.5, 5, 5);
    }
    g!.globalAlpha = 1;
    g!.restore();

    // HUD trong canvas
    for (let i = 0; i < player.mhp; i++) {
      g!.fillStyle = i < player.hp ? "#ff6b5e" : "rgba(242,241,236,.22)";
      g!.beginPath();
      g!.roundRect(14 + i * 20, 14, 15, 14, 4);
      g!.fill();
    }

    if (boss) {
      const bw = 380;
      const bx = (W - bw) / 2;
      g!.fillStyle = "rgba(10,10,10,.6)";
      g!.beginPath();
      g!.roundRect(bx - 3, 11, bw + 6, 20, 6);
      g!.fill();
      g!.fillStyle = "#e0563f";
      g!.beginPath();
      g!.roundRect(bx, 14, bw * (boss.hp / boss.mhp), 14, 4);
      g!.fill();
      g!.font = `600 12px ${FONT_SANS}`;
      g!.textAlign = "center";
      g!.fillStyle = "#f2f1ec";
      g!.fillText(m.boss, W / 2, 45);
    }

    if (msgT > 0) {
      g!.globalAlpha = Math.min(1, msgT * 2);
      g!.font = `800 26px ${FONT_DISPLAY}`;
      g!.textAlign = "center";
      g!.lineWidth = 6;
      g!.strokeStyle = "rgba(10,10,10,.8)";
      g!.strokeText(msg, W / 2, 140);
      g!.fillStyle = "#d4f236";
      g!.fillText(msg, W / 2, 140);
      g!.globalAlpha = 1;
    }

    if (phase === "clear" && fade < 1) {
      g!.globalAlpha = Math.min(0.75, fade);
      g!.fillStyle = "#0a0a0a";
      g!.fillRect(0, 0, W, H);
      g!.globalAlpha = 1;
    }
  }

  /* ── vòng lặp và input ───────────────────────────────── */

  function frame(t: number) {
    const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;
    step(dt);
    draw();
    raf = requestAnimationFrame(frame);
  }

  const KEYMAP: Record<string, GameKey> = {
    ArrowLeft: "left", KeyA: "left",
    ArrowRight: "right", KeyD: "right",
    ArrowUp: "jump", KeyW: "jump", Space: "jump",
    KeyJ: "atk", KeyZ: "atk", KeyX: "atk",
  };

  function press(k: GameKey) {
    keys[k] = true;
    if (k === "jump") jump();
    if (k === "atk") attack();
  }
  function release(k: GameKey) {
    keys[k] = false;
  }

  function onKeyDown(e: KeyboardEvent) {
    const k = KEYMAP[e.code];
    if (!k) return;
    e.preventDefault();
    press(k);
  }
  function onKeyUp(e: KeyboardEvent) {
    const k = KEYMAP[e.code];
    if (k) release(k);
  }
  function onPointer() {
    if (phase === "play") attack();
  }

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  canvas.addEventListener("pointerdown", onPointer);

  loadMap(0);
  raf = requestAnimationFrame(frame);

  return {
    loadMap,
    resume() { phase = "play"; },
    pause() { if (phase === "play") phase = "title"; },
    press,
    release,
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("pointerdown", onPointer);
    },
  };
}
