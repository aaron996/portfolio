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
import mobSpriteMetrics from "./mob-sprite-metrics.json";

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
 * Sprite V2, nền xa/giữa, mặt đất, bệ, cổng và hiệu ứng đều dùng PNG.
 * Trời và thanh tiến độ vẫn là hình học; fallback chỉ dùng khi tải ảnh lỗi.
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
  idle: ["player/idle-1.png", "player/idle-2.png", "player/idle-3.png"],
  run: Array.from({ length: 8 }, (_, i) => `player/run-${i + 1}.png`),
  jumpRise: "player/jump-rise.png",
  jumpFall: "player/jump-fall.png",
  land: "player/land.png",
  attack: ["player/attack-1.png", "player/attack-2.png", "player/attack-3.png"],
  hurt: "player/hurt.png",
};
const SCENE_SPRITES = {
  platform: "bg/platform.png", ground: "bg/ground.png", gate: "ui/gate.png",
  heart: "ui/heart-full.png", bossbar: "ui/bossbar.png",
  aura: "fx/aura.png", shot: "fx/shot.png", hit: "fx/hit.png",
  dust: "fx/dust.png", ring: "fx/ring.png",
};
const SLASH_SPRITES = ["fx/slash-1.png", "fx/slash-2.png", "fx/slash-3.png"];

/** Quái chỉ có ảnh cho tổ hợp ải × loại thực sự xuất hiện trong content.vi.ts */
function mobSprite(mapIndex: number, kind: MobKind, frame: number) {
  return img(`mob/m${mapIndex + 1}-${kind}-${frame}.png`)
    ?? img(`mob/m${mapIndex + 1}-${kind}-1.png`);
}
function bossSprite(mapIndex: number, telegraph: boolean, hurt: boolean) {
  return img(`boss/b${mapIndex + 1}${hurt ? "-hit" : telegraph ? "-tel" : ""}.png`)
    ?? img(`boss/b${mapIndex + 1}.png`);
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
function pickupSprite(mapIndex: number, kind: Pickup["kind"]) {
  return img(`item/${kind}-${mapIndex + 1}.png`);
}

/** Vẽ ảnh theo đúng tỉ lệ, neo giữa ở chân thay vì ép vừa hitbox. */
function drawSpriteAtFeet(
  g: CanvasRenderingContext2D,
  sprite: HTMLImageElement,
  centerX: number,
  feetY: number,
  maxW: number,
  maxH: number,
  flip = false,
) {
  const scale = Math.min(maxW / sprite.naturalWidth, maxH / sprite.naturalHeight);
  const w = sprite.naturalWidth * scale;
  const h = sprite.naturalHeight * scale;
  g.save();
  g.translate(centerX, feetY);
  if (flip) g.scale(-1, 1);
  g.drawImage(sprite, -w / 2, -h, w, h);
  g.restore();
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

/** Preserve the end caps; repeat only the centre of the platform beam. */
function drawLedge(g: CanvasRenderingContext2D, im: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const sourceCap = Math.round(im.naturalWidth * 0.1);
  const cap = Math.min(w / 2, h * sourceCap / im.naturalHeight);
  g.drawImage(im, 0, 0, sourceCap, im.naturalHeight, x, y, cap, h);
  const middle = im.naturalWidth - sourceCap * 2;
  const tile = h * middle / im.naturalHeight;
  for (let dx = cap; dx < w - cap; dx += tile) {
    const width = Math.min(tile, w - cap - dx);
    g.drawImage(im, sourceCap, 0, middle * width / tile, im.naturalHeight, x + dx, y, width, h);
  }
  g.drawImage(im, im.naturalWidth-sourceCap, 0, sourceCap, im.naturalHeight, x+w-cap, y, cap, h);
}

interface Mob {
  kind: MobKind;
  name: string;
  x: number; y: number; w: number; h: number;
  hp: number; dir: number;
  a: number; b: number;
  floor: number;
  hurt: number; bob: number; anim: number; dead: boolean;
  cd: number; dash: number; tel: number;
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
  let worldTime = 0;
  let accumulator = 0;

  const keys: Record<GameKey, boolean> = { left: false, right: false, jump: false, atk: false };

  const player = {
    x: 60, y: GY - 40, w: 26, h: 40,
    vx: 0, vy: 0, face: 1,
    hp: 5, mhp: 5, inv: 0, atk: 0, cd: 0, ground: false,
    tool: 0, hurtT: 0, runFrame: 0, landT: 0,
    attackActive: 0, attackHit: false, attackBuffed: false,
  };
  let mobs: Mob[] = [];
  let traps: Trap[] = [];
  let pickups: Pickup[] = [];
  let parts: Particle[] = [];
  let shots: Shot[] = [];
  let effects: { kind: "hit" | "dust"; x: number; y: number; life: number; duration: number }[] = [];
  let boss: Boss | null = null;
  let cam = 0;

  /* ── vòng đời ải ─────────────────────────────────────── */

  const MOB_HP: Record<MobKind, number> = { walker: 2, flyer: 2, charger: 3, rider: 3, shooter: 2 };

  function loadMap(index: number) {
    lv = index;
    const m = maps[lv];
    Object.assign(player, {
      x: 60, y: GY - 40, vx: 0, vy: 0, face: 1,
      hp: 5, inv: 0, atk: 0, cd: 0, ground: false, tool: 0, hurtT: 0,
      runFrame: 0, landT: 0, attackActive: 0, attackHit: false, attackBuffed: false,
    });
    parts = [];
    shots = [];
    effects = [];
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
        x: sp.x, y: floor - h, w: sp.kind === "rider" ? 48 : 30, h,
        hp: MOB_HP[sp.kind],
        dir: Math.random() < 0.5 ? -1 : 1,
        a: sp.x - range, b: sp.x + range,
        floor,
        hurt: 0, bob: Math.random() * 6, anim: Math.random(), dead: false,
        cd: 1 + Math.random(), dash: 0, tel: 0,
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
      x: WORLD - 190, y: GY - 82, w: 72, h: 82,
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
    player.vy = -684;
    player.ground = false;
    player.landT = 0;
    effect("dust", player.x + player.w / 2, player.y + player.h);
    puff(player.x + player.w / 2, player.y + player.h, "#ffffff", 4);
  }

  function attack() {
    if (phase !== "play" || player.cd > 0) return;
    const buffed = player.tool > 0;
    player.atk = buffed ? 0.2 : 0.28;
    player.attackActive = buffed ? 0.085 : 0.12;
    player.attackHit = false;
    player.attackBuffed = buffed;
    player.cd = buffed ? 0.23 : 0.34;
  }

  /** Sát thương rơi đúng vào khung chém, không xảy ra ngay lúc người chơi bấm. */
  function resolveAttack() {
    if (player.attackHit) return;
    player.attackHit = true;
    const reach = player.attackBuffed ? 84 : 58;
    const dmg = player.attackBuffed ? 2 : 1;

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
      effect("hit", o.x + o.w / 2, o.y + o.h / 2);
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
      effect("hit", boss.x + boss.w / 2, boss.y + boss.h / 2);
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
    player.vy = -360;
    player.vx = dir * 450;
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
        vx: (Math.random() - 0.5) * 300,
        vy: -Math.random() * 240 - 60,
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
  function effect(kind: "hit" | "dust", x: number, y: number) {
    const duration = kind === "hit" ? 0.22 : 0.28;
    effects.push({ kind, x, y, duration, life: duration });
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
    o.anim += dt;
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
    } else if (o.kind === "charger" || o.kind === "rider") {
      o.y = o.floor - o.h;
      if (o.dash > 0) {
        o.dash -= dt;
        o.x += o.dir * 4.4 * dt * 60;
        if (o.dash <= 0) o.cd = 1.3;
      } else if (o.tel > 0) {
        o.tel = Math.max(0, o.tel - dt);
        if (o.tel === 0) o.dash = 0.75;
      } else {
        o.cd -= dt;
        const near = Math.abs(player.x - o.x) < 240 && Math.abs(player.y - o.y) < 70;
        if (near && o.cd <= 0) {
          o.dir = player.x < o.x ? -1 : 1;
          o.tel = o.kind === "rider" ? 0.5 : 0.25;
          puff(o.x + o.w / 2, o.y, HAZARD, 4);
        }
      }
      // Không cho lao ra khỏi vùng của nó quá xa
      o.x = Math.max(o.a - 140, Math.min(o.b + 140, o.x));
    } else {
      // Shooter: hai khung đứng, rồi ngắm trước khi bắn và giật lùi sau phát bắn.
      o.y = o.floor - o.h;
      if (o.dash > 0) {
        o.dash = Math.max(0, o.dash - dt);
      } else if (o.tel > 0) {
        o.tel = Math.max(0, o.tel - dt);
        const dir = player.x < o.x ? -1 : 1;
        o.dir = dir;
        if (o.tel === 0) {
          fire(o.x + o.w / 2, o.y + o.h / 2, dir * 3.4, 0);
          o.dash = 0.16; // recoil window; frame 4
          o.cd = 2.2;
        }
      } else {
        o.cd -= dt;
        if (o.cd <= 0) o.tel = 0.35;
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
    worldTime += dt;

    player.cd = Math.max(0, player.cd - dt);
    const previousAttack = player.atk;
    player.atk = Math.max(0, player.atk - dt);
    if (
      previousAttack > player.attackActive &&
      player.atk <= player.attackActive &&
      !player.attackHit
    ) resolveAttack();
    player.inv = Math.max(0, player.inv - dt);
    player.tool = Math.max(0, player.tool - dt);
    player.hurtT = Math.max(0, player.hurtT - dt);
    player.landT = Math.max(0, player.landT - dt);
    effects = effects.filter(e => { e.life -= dt; return e.life > 0; });
    msgT = Math.max(0, msgT - dt);
    shake *= Math.exp(-9 * dt);

    const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    if (dir) {
      player.vx += dir * 2300 * dt;
      player.face = dir;
    }
    player.vx *= Math.exp(-12 * dt);
    player.vx = Math.max(-360, Math.min(360, player.vx));
    const moveX = player.vx * dt;
    player.x = Math.max(0, Math.min(WORLD - player.w, player.x + moveX));
    if (player.ground && Math.abs(moveX) > 0.01) {
      player.runFrame += Math.abs(moveX) / 16;
    }

    const prevBottom = player.y + player.h;
    const wasGrounded = player.ground;
    player.vy += 2232 * dt;
    player.y += player.vy * dt;
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

    if (!wasGrounded && player.ground) {
      player.landT = 0.1;
      effect("dust", player.x + player.w / 2, player.y + player.h);
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
      p.vy += 1260 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      return p.life > 0;
    });

    const want = Math.max(0, Math.min(WORLD - W, player.x + player.w / 2 - W / 2));
    cam += (want - cam) * Math.min(1, dt * 7);
    if (phase === "clear") fade += dt;
  }

  /* ── vẽ ──────────────────────────────────────────────── */

  function drawBackground(m: GameMap) {
    const p = m.palette;
    const sky = g!.createLinearGradient(0, 0, 0, GY);
    sky.addColorStop(0, p.sky);
    sky.addColorStop(1, p.far);
    g!.fillStyle = sky;
    g!.fillRect(0, 0, W, H);

    const far = img(`bg/m${lv + 1}-far.png`);
    if (far) {
      const h = 210;
      const tileW = h * far.naturalWidth / far.naturalHeight;
      const offset = ((cam * 0.25) % tileW + tileW) % tileW;
      g!.globalAlpha = 0.65;
      drawTiled(g!, far, -offset, GY - h - 10, W + tileW, h);
      g!.globalAlpha = 1;
    }

    const mid = bgMidSprite(lv);
    if (mid) {
      // Lớp giữa vẽ bằng ảnh thật, lặp ngang liên tục theo camera
      const midH = 150;
      const tileW = midH * (mid.naturalWidth / mid.naturalHeight);
      const offset = ((cam * 0.55) % tileW + tileW) % tileW;
      g!.globalAlpha = 0.75;
      drawTiled(g!, mid, -offset, GY - midH, W + tileW, midH);
      g!.globalAlpha = 1;
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
    const ground = img(SCENE_SPRITES.ground);
    if (ground) {
      const tileW = (H - GY) * ground.naturalWidth / ground.naturalHeight;
      const offset = cam % tileW;
      drawTiled(g!, ground, -offset, GY, W + tileW, H - GY);
    }
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
   * Dùng đủ bốn khung của mỗi quái. Walker/flyer chạy tuần tự 1–4;
   * charger/rider dùng 3 để lấy đà và 4 để lao; shooter dùng 3 để ngắm
   * và 4 cho nhịp giật lùi sau khi bắn. Khung 1–2 giữ chuyển động chờ.
   */
  function mobFrame(o: Mob): number {
    if (o.kind === "rider" || o.kind === "charger") {
      if (o.dash > 0) return 4;
      if (o.tel > 0) return 3;
      return Math.floor(o.anim * 6) % 2 + 1;
    }
    if (o.kind === "shooter") {
      if (o.dash > 0) return 4;
      if (o.tel > 0) return 3;
      return Math.floor(o.anim * 4) % 2 + 1;
    }
    const fps = o.kind === "flyer" ? 8 : 6;
    return Math.floor(o.anim * fps) % 4 + 1;
  }

  function drawMob(o: Mob, color: string) {
    const frame = mobFrame(o);
    const sprite = mobSprite(lv, o.kind, frame);
    if (sprite) {
      g!.filter = o.hurt > 0 ? "brightness(2.2) saturate(0.3)" : "none";
      const maxW = o.kind === "rider" ? 76 : o.kind === "flyer" ? 68 : 48;
      const maxH = o.kind === "rider" ? 46 : o.kind === "flyer" ? 40 : 48;
      const metrics = (mobSpriteMetrics as Record<string, {width:number;height:number;frames:Record<string,{x:number;y:number}>}>)[`m${lv + 1}-${o.kind}`];
      if (metrics) {
        const anchor = metrics.frames[String(frame)];
        const scale = Math.min(maxW / metrics.width, maxH / metrics.height);
        g!.save();
        g!.translate(o.x + o.w / 2, o.y + o.h + 3);
        if (o.dir < 0) g!.scale(-1, 1);
        g!.drawImage(sprite, -anchor.x * scale, -anchor.y * scale,
          sprite.naturalWidth * scale, sprite.naturalHeight * scale);
        g!.restore();
      } else {
        drawSpriteAtFeet(g!, sprite, o.x + o.w / 2, o.y + o.h + 3, maxW, maxH, o.dir < 0);
      }
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
    const sprite = pickupSprite(lv, p.kind);
    if (sprite) {
      g!.save();
      g!.shadowColor = tool ? "rgba(212,242,54,.85)" : "rgba(255,143,133,.85)";
      g!.shadowBlur = 11;
      drawSpriteAtFeet(g!, sprite, p.x + 12, y + 28, 36, 36);
      g!.restore();
      drawLabel(p.name, p.x + 12, y - 8, tool ? LIME : "#ffd2ce");
      return;
    }
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
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0) {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const targetW = Math.round(rect.width * dpr);
      const targetH = Math.round(rect.height * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
    }
    g!.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
    g!.imageSmoothingEnabled = true;
    g!.imageSmoothingQuality = "high";
    g!.save();
    if (!reduced && shake > 0.2) {
      g!.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    }
    drawBackground(m);
    g!.translate(-cam, 0);

    for (const [px, py, pw] of m.plats) {
      const platform = img(SCENE_SPRITES.platform);
      if (platform) {
        drawLedge(g!, platform, px, py, pw, 16);
        continue;
      }
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
    const gate = img(SCENE_SPRITES.gate);
    if (gate) drawSpriteAtFeet(g!, gate, WORLD - 47, GY, 58, 112);

    for (const o of mobs) {
      if (o.dead) continue;
      drawMob(o, m.palette.mob);
      const visualHeight = o.kind === "flyer" ? 40 : o.kind === "rider" ? 46 : 48;
      drawLabel(o.name, o.x + o.w / 2, o.y + o.h - visualHeight - 5);
    }

    if (boss) {
      const by = boss.y + Math.sin(boss.bob) * 2;
      // Trong 0,55s trước đòn, dùng khung "báo đòn" riêng thay vì tô màu đè
      const telegraphing = boss.tel > 0 && Math.floor(boss.tel * 14) % 2 === 0;
      const sprite = bossSprite(lv, telegraphing, boss.hurt > 0);
      const ring = img(SCENE_SPRITES.ring);
      if (boss.tel > 0 && ring) {
        g!.globalAlpha = 0.8;
        drawSpriteAtFeet(g!, ring, boss.x + boss.w / 2, boss.y + boss.h + 8, 116, 24);
        g!.globalAlpha = 1;
      }
      if (sprite) {
        drawSpriteAtFeet(g!, sprite, boss.x + boss.w / 2, by + boss.h + 2, 104, 108, boss.dir < 0);
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
      const shot = img(SCENE_SPRITES.shot);
      if (shot) {
        g!.save();
        g!.translate(s.x, s.y);
        g!.rotate(Math.atan2(s.vy, s.vx));
        // Orb centre matches the collision circle; its tail extends behind it.
        g!.drawImage(shot, -27, -12, 40, 24);
        g!.restore();
        continue;
      }
      g!.beginPath();
      g!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      g!.fill();
    }

    if (player.tool > 0) {
      const aura = img(SCENE_SPRITES.aura);
      if (aura) {
        g!.globalAlpha = reduced ? 0.65 : 0.62 + Math.sin(worldTime * 4) * 0.1;
        drawSpriteAtFeet(g!, aura, player.x + player.w / 2, player.y + player.h + 7, 76, 94);
        g!.globalAlpha = 1;
      }
    }

    // Nhấp nháy khi đang bất tử sau lúc trúng đòn
    if (player.inv <= 0 || Math.floor(player.inv * 16) % 2 === 0) {
      const idleImg = img(PLAYER_SPRITES.idle[Math.floor(worldTime * 3) % 3])
        ?? img(PLAYER_SPRITES.idle[0]);
      if (idleImg) {
        // All 18 frames share a 512px canvas and feet anchor (256,470).
        let sprite: HTMLImageElement | null;
        if (player.hurtT > 0) {
          sprite = img(PLAYER_SPRITES.hurt);
        } else if (player.atk > 0) {
          const i = player.atk > player.attackActive ? 0
            : player.atk > player.attackActive * 0.4 ? 1 : 2;
          sprite = img(PLAYER_SPRITES.attack[i]);
        } else if (!player.ground) {
          sprite = img(player.vy < 0 ? PLAYER_SPRITES.jumpRise : PLAYER_SPRITES.jumpFall);
        } else if (player.landT > 0) {
          sprite = img(PLAYER_SPRITES.land);
        } else if (Math.abs(player.vx) > 0.5) {
          const i = Math.floor(player.runFrame) % PLAYER_SPRITES.run.length;
          sprite = img(PLAYER_SPRITES.run[i]);
        } else {
          sprite = idleImg;
        }
        // Khung riêng cho trạng thái này có thể chưa tải kịp — vẽ tạm idle
        // (đã chắc chắn có ở đây) thay vì để nhân vật biến mất một khung hình
        sprite ??= idleImg;
        const size = 112;
        g!.save();
        g!.translate(player.x + player.w / 2, player.y + player.h + 2);
        if (player.face < 0) g!.scale(-1, 1);
        g!.drawImage(sprite, -size / 2, -size * 470 / 512, size, size);
        g!.restore();
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

      if (player.atk > 0) {
        const active = player.atk <= player.attackActive;
        const progress = 1 - player.atk / player.attackActive;
        if (active) {
          const frame = Math.min(2, Math.floor(progress * 3));
          const slash = img(SLASH_SPRITES[frame]);
          if (slash) {
            const reach = player.attackBuffed ? 84 : 58;
            g!.save();
            g!.translate(player.x + player.w / 2, player.y + 18);
            g!.scale(player.face, 1);
            g!.globalAlpha = 0.95 - progress * 0.45;
            g!.drawImage(slash, 12, -36, reach, 72);
            g!.restore();
          }
        }
      }
    }

    for (const p of parts) {
      g!.globalAlpha = Math.max(0, p.life / 0.55);
      const spark = img(SCENE_SPRITES.hit);
      if (spark) g!.drawImage(spark, p.x - 3, p.y - 3, 6, 6);
      else {
        g!.fillStyle = p.color;
        g!.fillRect(p.x - 2.5, p.y - 2.5, 5, 5);
      }
    }
    for (const e of effects) {
      const sprite = img(SCENE_SPRITES[e.kind]);
      if (!sprite) continue;
      const progress = 1 - e.life / e.duration;
      g!.globalAlpha = Math.min(1, e.life / e.duration * 2);
      const w = (e.kind === "hit" ? 38 : 48) * (0.75 + progress * 0.5);
      const h = e.kind === "hit" ? w : w * 0.3;
      drawSpriteAtFeet(g!, sprite, e.x, e.kind === "hit" ? e.y + h / 2 : e.y + 3, w, h);
    }
    g!.globalAlpha = 1;
    g!.restore();

    // HUD trong canvas
    for (let i = 0; i < player.mhp; i++) {
      const heart = img(SCENE_SPRITES.heart);
      if (heart) {
        g!.globalAlpha = i < player.hp ? 1 : 0.25;
        g!.filter = i < player.hp ? "none" : "grayscale(1)";
        drawSpriteAtFeet(g!, heart, 23 + i * 22, 31, 19, 18);
        g!.globalAlpha = 1;
        g!.filter = "none";
        continue;
      }
      g!.fillStyle = i < player.hp ? "#ff6b5e" : "rgba(242,241,236,.22)";
      g!.beginPath();
      g!.roundRect(14 + i * 20, 14, 15, 14, 4);
      g!.fill();
    }
    if (player.tool > 0) {
      const activeTool = pickupSprite(lv, "tool");
      if (activeTool) drawSpriteAtFeet(g!, activeTool, 28, 68, 30, 30);
      g!.fillStyle = "rgba(242,241,236,.2)";
      g!.fillRect(48, 47, 95, 6);
      g!.fillStyle = LIME;
      g!.fillRect(48, 47, 95 * (player.tool / TOOL_SECONDS), 6);
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
      const bossbar = img(SCENE_SPRITES.bossbar);
      if (bossbar) g!.drawImage(bossbar, bx - 12, 6, bw + 24, 30);
      g!.font = `600 12px ${FONT_SANS}`;
      g!.textAlign = "center";
      g!.lineWidth = 3;
      g!.strokeStyle = "rgba(10,10,10,.7)";
      g!.strokeText(m.boss, W / 2, 45);
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
    g!.setTransform(1, 0, 0, 1, 0, 0);
  }

  /* ── vòng lặp và input ───────────────────────────────── */

  function frame(t: number) {
    const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;
    accumulator = Math.min(0.1, accumulator + dt);
    const fixedStep = 1 / 120;
    while (accumulator >= fixedStep) {
      step(fixedStep);
      accumulator -= fixedStep;
    }
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
  PLAYER_SPRITES.idle.forEach(img);
  img(PLAYER_SPRITES.jumpRise);
  img(PLAYER_SPRITES.jumpFall);
  img(PLAYER_SPRITES.land);
  img(PLAYER_SPRITES.hurt);
  PLAYER_SPRITES.run.forEach(img);
  PLAYER_SPRITES.attack.forEach(img);
  Object.values(TRAP_SPRITES).forEach(img);
  Object.values(SCENE_SPRITES).forEach(img);
  SLASH_SPRITES.forEach(img);
  maps.forEach((m, i) => {
    img(`boss/b${i + 1}.png`);
    img(`boss/b${i + 1}-tel.png`);
    img(`boss/b${i + 1}-hit.png`);
    img(`bg/m${i + 1}-mid.png`);
    img(`bg/m${i + 1}-far.png`);
    img(`item/heal-${i + 1}.png`);
    img(`item/tool-${i + 1}.png`);
    const kinds = new Set(m.mobs.map((sp) => sp.kind));
    kinds.forEach((k) => {
      img(`mob/m${i + 1}-${k}-1.png`);
      img(`mob/m${i + 1}-${k}-2.png`);
      img(`mob/m${i + 1}-${k}-3.png`);
      img(`mob/m${i + 1}-${k}-4.png`);
    });
  });

  loadMap(0);
  raf = requestAnimationFrame(frame);

  return {
    loadMap,
    resume() {
      phase = "play";
      last = performance.now();
      accumulator = 0;
    },
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
