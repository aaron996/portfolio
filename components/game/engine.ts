/**
 * Engine cho minigame "Ải Vận Hành".
 *
 * Không phụ thuộc React. Chỉ nhận một <canvas> cùng dữ liệu bản đồ, rồi
 * bắn ra event khi có chuyện đáng để giao diện biết (qua ải, nhặt kỹ năng,
 * hết game). HUD máu và thanh máu trùm vẽ thẳng trong canvas — nếu đẩy
 * chúng lên React thì mỗi khung hình phải re-render một lần, không đáng.
 *
 * Toàn bộ bố cục, tên quái, bẫy và vật phẩm đến từ content/content.vi.ts.
 */
import type { GameMap, MobKind } from "@/content/types";

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
  /** Có {name} */
  pickupTool: string;
  pickupHeal: string;
}

/** Kích thước thế giới, cố định để bố cục trong content luôn đúng */
const W = 800;
const H = 420;
const GY = 344;
const WORLD = 2200;

/** Màu chung cho mọi thứ gây sát thương, để người chơi học một lần là nhớ */
const HAZARD = "#E0563F";
const LIME = "#d4f236";

/** Đồ nghề: 12 giây đánh nhanh hơn, xa hơn, mạnh gấp đôi */
const TOOL_SECONDS = 12;

/**
 * Ảnh asset, tải bất đồng bộ, có fallback về hình khối khi chưa có.
 *
 * Chỉ những nhóm đã có ảnh thật mới nằm trong ASSET_PATHS — phần còn thiếu
 * (nền trời/xa/đất/bệ, vật phẩm, hiệu ứng, giao diện) vẫn vẽ bằng code như
 * cũ. Thêm ảnh cho nhóm nào thì bổ sung đường dẫn ở đây, không cần sửa chỗ
 * khác — hàm draw tự chuyển sang dùng ảnh khi nó tải xong.
 */
const ASSET_BASE = "/game";
const imageCache = new Map<string, HTMLImageElement>();

function img(src: string): HTMLImageElement | null {
  let el = imageCache.get(src);
  if (!el) {
    el = new Image();
    el.src = `${ASSET_BASE}/${src}`;
    imageCache.set(src, el);
  }
  return el.complete && el.naturalWidth > 0 ? el : null;
}

const PLAYER_SPRITES = {
  idle: "player/idle.png",
  run: ["player/run-1.png", "player/run-2.png", "player/run-3.png", "player/run-4.png"],
  jump: "player/jump.png",
  attack: ["player/attack-1.png", "player/attack-2.png"],
  hurt: "player/hurt.png",
};

/** Quái chỉ có ảnh cho tổ hợp ải × loại thực sự xuất hiện trong content.vi.ts */
function mobSprite(mapIndex: number, kind: MobKind, frame: 1 | 2) {
  return img(`mob/m${mapIndex + 1}-${kind}-${frame}.png`);
}
function bossSprite(mapIndex: number, telegraph: boolean) {
  return img(`boss/b${mapIndex + 1}${telegraph ? "-tel" : ""}.png`);
}
const TRAP_SPRITES = {
  spike: "trap/spike.png",
  saw: "trap/saw.png",
  pulseJet: "trap/pulse-jet.png",
  pulseVent: "trap/pulse-vent.png",
};
function bgMidSprite(mapIndex: number) {
  return img(`bg/m${mapIndex + 1}-mid.png`);
}

/** Vẽ một ảnh lặp ngang để lấp đầy bề rộng `w`, cắt tấm cuối nếu dư */
function drawTiled(g: CanvasRenderingContext2D, im: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const tileW = h * (im.naturalWidth / im.naturalHeight);
  let cx = x;
  while (cx < x + w) {
    const dw = Math.min(tileW, x + w - cx);
    const sw = (dw / tileW) * im.naturalWidth;
    g.drawImage(im, 0, 0, sw, im.naturalHeight, cx, y, dw, h);
    cx += dw;
  }
}

interface Mob {
  kind: MobKind;
  name: string;
  x: number; y: number; w: number; h: number;
  hp: number; dir: number;
  a: number; b: number;
  floor: number;
  hurt: number; bob: number; dead: boolean;
  cd: number; dash: number;
}
interface Boss {
  x: number; y: number; w: number; h: number;
  hp: number; mhp: number; dir: number;
  hurt: number; tel: number; cd: number; bob: number; dash: number;
}
interface Trap {
  kind: "spike" | "saw" | "pulse";
  x: number; y: number; w: number;
  t: number; pos: number; dir: number;
}
interface Pickup {
  kind: "heal" | "tool";
  name: string;
  x: number; y: number;
  taken: boolean; bob: number;
}
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string }
interface Shot { x: number; y: number; vx: number; vy: number; r: number }

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
    tool: 0, hurtT: 0,
  };
  let mobs: Mob[] = [];
  let traps: Trap[] = [];
  let pickups: Pickup[] = [];
  let parts: Particle[] = [];
  let shots: Shot[] = [];
  let boss: Boss | null = null;
  let cam = 0;

  /* ── vòng đời ải ─────────────────────────────────────── */

  const MOB_HP: Record<MobKind, number> = { walker: 2, flyer: 2, charger: 3, shooter: 2 };

  function loadMap(index: number) {
    lv = index;
    const m = maps[lv];
    Object.assign(player, {
      x: 60, y: GY - 40, vx: 0, vy: 0, face: 1,
      hp: 5, inv: 0, atk: 0, cd: 0, ground: false, tool: 0, hurtT: 0,
    });
    parts = [];
    shots = [];
    boss = null;
    cam = 0;
    shake = 0;
    fade = 0;
    msg = "";
    msgT = 0;

    mobs = m.mobs.map((sp) => {
      const floor = sp.y ?? GY;
      const range = sp.range ?? 70;
      const h = sp.kind === "flyer" ? 28 : 30;
      return {
        kind: sp.kind, name: sp.name,
        x: sp.x, y: floor - h, w: 30, h,
        hp: MOB_HP[sp.kind],
        dir: Math.random() < 0.5 ? -1 : 1,
        a: sp.x - range, b: sp.x + range,
        floor,
        hurt: 0, bob: Math.random() * 6, dead: false,
        cd: 1 + Math.random(), dash: 0,
      };
    });

    traps = m.traps.map((t) => ({
      kind: t.kind,
      x: t.x,
      y: t.y ?? GY,
      w: t.w ?? 26,
      t: Math.random() * 2,
      pos: 0,
      dir: 1,
    }));

    pickups = m.pickups.map((p) => ({
      kind: p.kind, name: p.name, x: p.x, y: p.y,
      taken: false, bob: Math.random() * 6,
    }));

    handlers.onMap?.(lv);
  }

  function spawnBoss() {
    boss = {
      x: WORLD - 190, y: GY - 78, w: 70, h: 78,
      hp: 16, mhp: 16, dir: -1,
      hurt: 0, tel: 0, cd: 2.2, bob: 0, dash: 0,
    };
    say(labels.bossAppear.replace("{boss}", maps[lv].boss), 1.6);
  }

  function clearMap() {
    phase = "clear";
    fade = 0;
    const m = maps[lv];
    if (boss) puff(boss.x + boss.w / 2, boss.y + boss.h / 2, LIME, 40);
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
    const buffed = player.tool > 0;
    player.atk = 0.19;
    player.cd = buffed ? 0.17 : 0.3;
    const reach = buffed ? 84 : 58;
    const dmg = buffed ? 2 : 1;

    // Tầm chém rộng hơn thân người, để đánh được trước khi bị quái chạm vào
    const hb = {
      x: player.face > 0 ? player.x + player.w - 6 : player.x + 6 - reach,
      y: player.y + 2, w: reach, h: 34,
    };
    const m = maps[lv];

    for (const o of mobs) {
      if (o.dead || !overlap(hb, o)) continue;
      o.hp -= dmg;
      o.hurt = 0.18;
      o.x += player.face * 14;
      shake = Math.max(shake, 3);
      puff(o.x + o.w / 2, o.y + o.h / 2, m.palette.mob, 6);
      if (o.hp <= 0) {
        o.dead = true;
        puff(o.x + o.w / 2, o.y + o.h / 2, LIME, 14);
      }
    }

    if (boss && overlap(hb, boss)) {
      boss.hp -= dmg;
      boss.hurt = 0.16;
      shake = Math.max(shake, 5);
      puff(boss.x + boss.w / 2, boss.y + boss.h / 2, m.palette.boss, 8);
      if (boss.hp <= 0) clearMap();
    }
  }

  function hurtPlayer(dir: number) {
    if (player.inv > 0 || phase !== "play") return;
    player.hp -= 1;
    player.inv = 1.35;
    player.hurtT = 0.35;
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
  function fire(x: number, y: number, vx: number, vy: number) {
    shots.push({ x, y, vx, vy, r: 9 });
  }

  /** Hộp gây sát thương của một cái bẫy tại thời điểm hiện tại, null nếu đang tắt */
  function trapBox(t: Trap): Box | null {
    // Cao 20 (không phải 13) để khớp ảnh gai thật — ảnh cao hơn hình khối cũ
    if (t.kind === "spike") return { x: t.x, y: t.y - 20, w: t.w, h: 20 };
    if (t.kind === "saw") return { x: t.x + t.pos - 15, y: t.y - 30, w: 30, h: 30 };
    // pulse: bật 1,1 giây rồi tắt 1,5 giây — có nhịp để đi qua
    return t.t % 2.6 < 1.1 ? { x: t.x, y: t.y - 74, w: 26, h: 74 } : null;
  }

  /* ── cập nhật ────────────────────────────────────────── */

  function stepMob(o: Mob, dt: number) {
    o.hurt = Math.max(0, o.hurt - dt);
    o.bob += dt * 6;
    if (o.hurt > 0) return;

    if (o.kind === "walker") {
      o.x += o.dir * 0.92 * dt * 60;
      if (o.x < o.a) { o.x = o.a; o.dir = 1; }
      if (o.x > o.b) { o.x = o.b; o.dir = -1; }
      o.y = o.floor - o.h;
    } else if (o.kind === "flyer") {
      o.x += o.dir * 0.75 * dt * 60;
      if (o.x < o.a) { o.x = o.a; o.dir = 1; }
      if (o.x > o.b) { o.x = o.b; o.dir = -1; }
      o.y = o.floor - o.h + Math.sin(o.bob * 0.5) * 16;
    } else if (o.kind === "charger") {
      o.y = o.floor - o.h;
      if (o.dash > 0) {
        o.dash -= dt;
        o.x += o.dir * 4.4 * dt * 60;
        if (o.dash <= 0) o.cd = 1.3;
      } else {
        o.cd -= dt;
        const near = Math.abs(player.x - o.x) < 240 && Math.abs(player.y - o.y) < 70;
        if (near && o.cd <= 0) {
          o.dir = player.x < o.x ? -1 : 1;
          o.dash = 0.75;
          puff(o.x + o.w / 2, o.y, HAZARD, 4);
        }
      }
      // Không cho lao ra khỏi vùng của nó quá xa
      o.x = Math.max(o.a - 140, Math.min(o.b + 140, o.x));
    } else {
      // shooter: đứng im, nhả đạn về phía người chơi
      o.y = o.floor - o.h;
      o.cd -= dt;
      if (o.cd <= 0) {
        o.cd = 2.2;
        const dir = player.x < o.x ? -1 : 1;
        o.dir = dir;
        fire(o.x + o.w / 2, o.y + o.h / 2, dir * 3.4, 0);
      }
    }
  }

  function stepBoss(b: Boss, dt: number) {
    const kind = maps[lv].bossKind;
    b.hurt = Math.max(0, b.hurt - dt);
    b.bob += dt * 3;

    if (b.dash > 0) {
      b.dash -= dt;
      b.x += b.dir * 9 * dt * 60;
      b.x = Math.max(60, Math.min(WORLD - b.w - 20, b.x));
      if (b.dash <= 0) b.cd = 1.8;
      return;
    }

    if (b.tel > 0) {
      b.tel -= dt;
      if (b.tel <= 0) {
        shake = 8;
        if (kind === "slam") {
          fire(b.x + 8, GY - 16, -4.2, 0);
          fire(b.x + b.w - 8, GY - 16, 4.2, 0);
        } else if (kind === "volley") {
          const dir = player.x < b.x ? -1 : 1;
          fire(b.x + b.w / 2, b.y + 20, dir * 4.4, -1.1);
          fire(b.x + b.w / 2, b.y + 34, dir * 4.6, 0);
          fire(b.x + b.w / 2, b.y + 48, dir * 4.4, 1.1);
        } else {
          b.dir = player.x < b.x ? -1 : 1;
          b.dash = 0.55;
        }
      }
      return;
    }

    b.cd -= dt;
    if (b.cd <= 0) {
      b.tel = kind === "dash" ? 0.6 : 0.55;
      b.cd = kind === "dash" ? 2.4 : 2.6;
      return;
    }
    b.dir = player.x < b.x ? -1 : 1;
    b.x = Math.max(60, Math.min(WORLD - b.w - 20, b.x + b.dir * 0.85 * dt * 60));
  }

  function step(dt: number) {
    if (phase !== "play" && phase !== "clear") return;
    const m = maps[lv];

    player.cd = Math.max(0, player.cd - dt);
    player.atk = Math.max(0, player.atk - dt);
    player.inv = Math.max(0, player.inv - dt);
    player.tool = Math.max(0, player.tool - dt);
    player.hurtT = Math.max(0, player.hurtT - dt);
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
      stepMob(o, dt);
      if (overlap(player, o)) hurtPlayer(player.x < o.x ? -1 : 1);
    }
    if (!alive && !boss && phase === "play") spawnBoss();

    for (const t of traps) {
      t.t += dt;
      if (t.kind === "saw") {
        t.pos += t.dir * 1.9 * dt * 60;
        if (t.pos < 0) { t.pos = 0; t.dir = 1; }
        if (t.pos > t.w) { t.pos = t.w; t.dir = -1; }
      }
      const box = trapBox(t);
      if (box && overlap(player, box)) {
        hurtPlayer(player.x < box.x + box.w / 2 ? -1 : 1);
      }
    }

    for (const p of pickups) {
      if (p.taken) continue;
      p.bob += dt * 4;
      const box = { x: p.x, y: p.y - 26, w: 24, h: 24 };
      if (!overlap(player, box)) continue;
      p.taken = true;
      if (p.kind === "heal") {
        player.hp = Math.min(player.mhp, player.hp + 1);
        say(labels.pickupHeal, 1.2);
        puff(p.x + 12, p.y - 14, "#ff6b5e", 12);
      } else {
        player.tool = TOOL_SECONDS;
        say(labels.pickupTool.replace("{name}", p.name), 1.6);
        puff(p.x + 12, p.y - 14, LIME, 16);
      }
    }

    if (boss) {
      stepBoss(boss, dt);
      if (overlap(player, boss)) hurtPlayer(player.x < boss.x ? -1 : 1);
    }

    shots = shots.filter((s) => {
      s.x += s.vx * dt * 60;
      s.y += s.vy * dt * 60;
      if (overlap(player, { x: s.x - s.r, y: s.y - s.r, w: s.r * 2, h: s.r * 2 })) {
        hurtPlayer(s.vx > 0 ? 1 : -1);
        return false;
      }
      return s.x > -30 && s.x < WORLD + 30 && s.y > -30 && s.y < H + 60;
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

    const mid = bgMidSprite(lv);
    if (mid) {
      // Lớp giữa vẽ bằng ảnh thật, lặp ngang liên tục theo camera
      const midH = 150;
      const tileW = midH * (mid.naturalWidth / mid.naturalHeight);
      const offset = ((cam * 0.55) % tileW + tileW) % tileW;
      drawTiled(g!, mid, -offset, GY - midH, W + tileW, midH);
    } else {
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
    }

    g!.fillStyle = p.ground;
    g!.fillRect(0, GY, W, H - GY);
    g!.fillStyle = p.groundEdge;
    g!.fillRect(0, GY, W, 7);
  }

  function drawLabel(text: string, x: number, y: number, color = "#ffffff") {
    g!.font = `500 10px ${FONT_SANS}`;
    g!.textAlign = "center";
    g!.globalAlpha = 0.82;
    g!.lineWidth = 3;
    g!.strokeStyle = "rgba(10,10,10,.75)";
    g!.strokeText(text, x, y);
    g!.fillStyle = color;
    g!.fillText(text, x, y);
    g!.globalAlpha = 1;
  }

  function drawFace(x: number, y: number, w: number, h: number) {
    g!.fillStyle = "rgba(10,10,10,.82)";
    const e = w * 0.08;
    g!.beginPath();
    g!.arc(x + w * 0.33, y + h * 0.4, e, 0, Math.PI * 2);
    g!.arc(x + w * 0.67, y + h * 0.4, e, 0, Math.PI * 2);
    g!.fill();
    g!.fillRect(x + w * 0.34, y + h * 0.66, w * 0.32, 2.5);
  }

  /**
   * Khung nào đang cần cho quái, theo đúng ý nghĩa của mục 3b trong
   * docs/game-assets.md: walker/flyer đảo khung theo nhịp bước, charger
   * đứng yên ở khung 1 tới lúc lao (dash>0) mới sang khung 2, shooter ở
   * khung 2 ngay trước khi bắn (cd<0.4) — đúng lúc code đang tô đỏ nòng.
   */
  function mobFrame(o: Mob): 1 | 2 {
    if (o.kind === "charger") return o.dash > 0 ? 2 : 1;
    if (o.kind === "shooter") return o.cd < 0.4 ? 2 : 1;
    return Math.floor(o.bob) % 2 === 0 ? 1 : 2;
  }

  function drawMob(o: Mob, color: string) {
    const sprite = mobSprite(lv, o.kind, mobFrame(o));
    if (sprite) {
      g!.filter = o.hurt > 0 ? "brightness(2.2) saturate(0.3)" : "none";
      const flip = o.dir < 0;
      g!.save();
      if (flip) {
        g!.translate(o.x + o.w, o.y);
        g!.scale(-1, 1);
        g!.drawImage(sprite, 0, 0, o.w, o.h);
      } else {
        g!.drawImage(sprite, o.x, o.y, o.w, o.h);
      }
      g!.restore();
      g!.filter = "none";
      return;
    }

    const body = o.hurt > 0 ? "#ffffff" : color;

    if (o.kind === "flyer") {
      // Cánh đập nhẹ hai bên
      g!.fillStyle = body;
      const flap = Math.sin(o.bob * 2) * 4;
      g!.beginPath();
      g!.moveTo(o.x - 2, o.y + 10);
      g!.lineTo(o.x - 14, o.y + 4 + flap);
      g!.lineTo(o.x - 2, o.y + 18);
      g!.moveTo(o.x + o.w + 2, o.y + 10);
      g!.lineTo(o.x + o.w + 14, o.y + 4 + flap);
      g!.lineTo(o.x + o.w + 2, o.y + 18);
      g!.fill();
    }

    g!.fillStyle = body;
    g!.beginPath();
    g!.roundRect(o.x, o.y, o.w, o.h, o.kind === "charger" ? 4 : 9);
    g!.fill();

    if (o.kind === "charger") {
      // Mũi nhọn quay về hướng sắp lao tới
      g!.fillStyle = o.dash > 0 ? HAZARD : body;
      g!.beginPath();
      const tip = o.dir > 0 ? o.x + o.w + 11 : o.x - 11;
      g!.moveTo(o.dir > 0 ? o.x + o.w : o.x, o.y + 6);
      g!.lineTo(tip, o.y + o.h / 2);
      g!.lineTo(o.dir > 0 ? o.x + o.w : o.x, o.y + o.h - 6);
      g!.fill();
    }
    if (o.kind === "shooter") {
      // Nòng chĩa về phía người chơi, đỏ dần khi sắp bắn
      g!.fillStyle = o.cd < 0.4 ? HAZARD : "rgba(10,10,10,.55)";
      g!.fillRect(o.dir > 0 ? o.x + o.w : o.x - 10, o.y + o.h * 0.42, 10, 6);
    }

    drawFace(o.x, o.y, o.w, o.h);
  }

  function drawTrap(t: Trap) {
    if (t.kind === "spike") {
      const sprite = img(TRAP_SPRITES.spike);
      if (sprite) {
        drawTiled(g!, sprite, t.x, t.y - 20, t.w, 20);
        return;
      }
      g!.fillStyle = HAZARD;
      g!.beginPath();
      for (let x = t.x; x < t.x + t.w; x += 12) {
        g!.moveTo(x, t.y);
        g!.lineTo(x + 6, t.y - 14);
        g!.lineTo(x + 12, t.y);
      }
      g!.fill();
      return;
    }
    if (t.kind === "saw") {
      const cx = t.x + t.pos;
      const cy = t.y - 15;
      g!.strokeStyle = "rgba(10,10,10,.25)";
      g!.lineWidth = 2;
      g!.beginPath();
      g!.moveTo(t.x, t.y - 2);
      g!.lineTo(t.x + t.w, t.y - 2);
      g!.stroke();

      const sprite = img(TRAP_SPRITES.saw);
      if (sprite) {
        // Ảnh đã đối xứng tròn quanh tâm — chỉ cần quay quanh chính tâm đó
        g!.save();
        g!.translate(cx, cy);
        g!.rotate(t.t * 6);
        g!.drawImage(sprite, -15, -15, 30, 30);
        g!.restore();
        return;
      }
      g!.fillStyle = HAZARD;
      g!.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = t.t * 6 + (i * Math.PI) / 4;
        g!.moveTo(cx, cy);
        g!.lineTo(cx + Math.cos(a) * 19, cy + Math.sin(a) * 19);
        g!.lineTo(cx + Math.cos(a + 0.4) * 19, cy + Math.sin(a + 0.4) * 19);
      }
      g!.fill();
      g!.beginPath();
      g!.arc(cx, cy, 12, 0, Math.PI * 2);
      g!.fill();
      return;
    }

    // pulse: lúc tắt còn thấy miệng phun, để biết đường mà tránh
    const on = t.t % 2.6 < 1.1;
    const jet = img(TRAP_SPRITES.pulseJet);
    const vent = img(TRAP_SPRITES.pulseVent);
    if (jet && vent) {
      if (on) g!.drawImage(jet, t.x, t.y - 74, 26, 74);
      g!.drawImage(vent, t.x - 2, t.y - 8, 30, 8);
      return;
    }
    g!.fillStyle = on ? HAZARD : "rgba(10,10,10,.35)";
    if (on) g!.fillRect(t.x, t.y - 74, 26, 74);
    g!.fillRect(t.x - 2, t.y - 8, 30, 8);
  }

  function drawPickup(p: Pickup) {
    const y = p.y - 26 + Math.sin(p.bob) * 3;
    const tool = p.kind === "tool";
    g!.fillStyle = tool ? LIME : "#ff8f85";
    g!.beginPath();
    g!.roundRect(p.x, y, 24, 24, 6);
    g!.fill();
    g!.fillStyle = "#0a0a0a";
    if (tool) {
      g!.fillRect(p.x + 7, y + 6, 4, 12);
      g!.fillRect(p.x + 13, y + 6, 4, 12);
      g!.fillRect(p.x + 7, y + 16, 10, 3);
    } else {
      g!.fillRect(p.x + 10, y + 6, 4, 12);
      g!.fillRect(p.x + 6, y + 10, 12, 4);
    }
    drawLabel(p.name, p.x + 12, y - 6, tool ? LIME : "#ffd2ce");
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

    for (const t of traps) drawTrap(t);
    for (const p of pickups) if (!p.taken) drawPickup(p);

    // Cửa ải ở cuối bản đồ
    g!.fillStyle = "rgba(255,255,255,.5)";
    g!.fillRect(WORLD - 70, GY - 96, 46, 96);
    g!.fillStyle = m.palette.groundEdge;
    g!.fillRect(WORLD - 64, GY - 88, 34, 88);

    for (const o of mobs) {
      if (o.dead) continue;
      drawMob(o, m.palette.mob);
      drawLabel(o.name, o.x + o.w / 2, o.y - 7);
    }

    if (boss) {
      const by = boss.y + Math.sin(boss.bob) * 2;
      // Trong 0,55s trước đòn, dùng khung "báo đòn" riêng thay vì tô màu đè
      const telegraphing = boss.tel > 0 && Math.floor(boss.tel * 14) % 2 === 0;
      const sprite = bossSprite(lv, telegraphing);
      if (sprite) {
        g!.filter = boss.hurt > 0 ? "brightness(2) saturate(0.3)" : "none";
        g!.drawImage(sprite, boss.x, by, boss.w, boss.h);
        g!.filter = "none";
      } else {
        g!.fillStyle = boss.hurt > 0 ? "#ffffff" : telegraphing ? "#ffe9a8" : m.palette.boss;
        g!.beginPath();
        g!.roundRect(boss.x, by, boss.w, boss.h, 9);
        g!.fill();
        drawFace(boss.x, by, boss.w, boss.h);
        g!.fillStyle = LIME;
        g!.beginPath();
        g!.moveTo(boss.x + 12, boss.y - 4);
        g!.lineTo(boss.x + 22, boss.y - 20);
        g!.lineTo(boss.x + 35, boss.y - 6);
        g!.lineTo(boss.x + 48, boss.y - 20);
        g!.lineTo(boss.x + 58, boss.y - 4);
        g!.fill();
      }
    }

    g!.fillStyle = HAZARD;
    for (const s of shots) {
      g!.beginPath();
      g!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      g!.fill();
    }

    // Nhấp nháy khi đang bất tử sau lúc trúng đòn
    if (player.inv <= 0 || Math.floor(player.inv * 16) % 2 === 0) {
      const idleImg = img(PLAYER_SPRITES.idle);
      if (idleImg) {
        // Chọn khung theo trạng thái: trúng đòn > đang chém > đang nhảy >
        // đang chạy > đứng yên. Khung chém rộng hơn thân (168x196 gốc,
        // hitbox chém vẫn tính riêng ở attack() — sprite chỉ là hình vẽ).
        let sprite: HTMLImageElement | null;
        let sw = player.w, sh = player.h + 9, sy = player.y - 9;
        if (player.hurtT > 0) {
          sprite = img(PLAYER_SPRITES.hurt);
        } else if (player.atk > 0) {
          const i = player.atk > 0.1 ? 0 : 1;
          sprite = img(PLAYER_SPRITES.attack[i]);
          sw = player.w + 16;
        } else if (!player.ground) {
          sprite = img(PLAYER_SPRITES.jump);
        } else if (Math.abs(player.vx) > 0.5) {
          const i = Math.floor(performance.now() / 90) % 4;
          sprite = img(PLAYER_SPRITES.run[i]);
        } else {
          sprite = idleImg;
        }
        // Khung riêng cho trạng thái này có thể chưa tải kịp — vẽ tạm idle
        // (đã chắc chắn có ở đây) thay vì để nhân vật biến mất một khung hình
        if (!sprite) {
          sprite = idleImg;
          sw = player.w;
          sh = player.h + 9;
          sy = player.y - 9;
        }
        {
          g!.save();
          if (player.face < 0) {
            // Sprite vẽ mặt phải sẵn — quay ngược quanh mép phải hitbox
            const dx = player.x + player.w - sw;
            g!.translate(dx + sw, sy);
            g!.scale(-1, 1);
            g!.drawImage(sprite, 0, 0, sw, sh);
          } else {
            g!.drawImage(sprite, player.x, sy, sw, sh);
          }
          g!.restore();
        }
      } else {
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
      }

      if (player.tool > 0) {
        // Đang cầm đồ nghề: viền sáng quanh người
        g!.strokeStyle = LIME;
        g!.lineWidth = 2;
        g!.beginPath();
        g!.roundRect(player.x - 3, player.y - 12, player.w + 6, player.h + 14, 9);
        g!.stroke();
      }

      if (player.atk > 0) {
        const reach = player.tool > 0 ? 40 : 32;
        g!.fillStyle = "rgba(212,242,54,.92)";
        g!.beginPath();
        g!.arc(
          player.face > 0 ? player.x + player.w + 10 : player.x - 10,
          player.y + 18, reach,
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
    if (player.tool > 0) {
      g!.fillStyle = "rgba(242,241,236,.2)";
      g!.fillRect(14, 34, 95, 5);
      g!.fillStyle = LIME;
      g!.fillRect(14, 34, 95 * (player.tool / TOOL_SECONDS), 5);
    }

    if (boss) {
      const bw = 380;
      const bx = (W - bw) / 2;
      g!.fillStyle = "rgba(10,10,10,.6)";
      g!.beginPath();
      g!.roundRect(bx - 3, 11, bw + 6, 20, 6);
      g!.fill();
      g!.fillStyle = HAZARD;
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
      g!.fillStyle = LIME;
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

  // Bắt đầu tải mọi ảnh có thể cần ngay từ lúc dựng game, không chờ tới lúc
  // dùng — img() chỉ tạo phần tử <img> khi được gọi lần đầu, nên nếu để tới
  // lúc nhảy/chạy mới gọi thì khung hình đầu tiên sẽ không có gì để vẽ.
  img(PLAYER_SPRITES.idle);
  img(PLAYER_SPRITES.jump);
  img(PLAYER_SPRITES.hurt);
  PLAYER_SPRITES.run.forEach(img);
  PLAYER_SPRITES.attack.forEach(img);
  Object.values(TRAP_SPRITES).forEach(img);
  maps.forEach((m, i) => {
    img(`boss/b${i + 1}.png`);
    img(`boss/b${i + 1}-tel.png`);
    img(`bg/m${i + 1}-mid.png`);
    const kinds = new Set(m.mobs.map((sp) => sp.kind));
    kinds.forEach((k) => {
      img(`mob/m${i + 1}-${k}-1.png`);
      img(`mob/m${i + 1}-${k}-2.png`);
    });
  });

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
