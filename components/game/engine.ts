/**
 * Engine cho minigame "Ải Vận Hành".
 *
 * Không phụ thuộc React. Chỉ nhận một <canvas> cùng dữ liệu bản đồ, rồi
 * bắn ra event khi có chuyện đáng để giao diện biết (qua ải, nhặt vật phẩm,
 * tạm dừng, hết game). HUD máu và thanh máu trùm vẽ thẳng trong canvas — nếu
 * đẩy chúng lên React thì mỗi khung hình phải re-render một lần, không đáng.
 *
 * Toàn bộ bố cục, tên quái, bẫy và vật phẩm đến từ content/content.vi.ts.
 *
 * ĐỌC MỤC "RIG" BÊN DƯỚI TRƯỚC KHI THÊM ASSET MỚI. Đó là chỗ giữ cho nhân vật
 * không phình to nhỏ giữa các khung hình — lỗi nặng nhất của bản trước.
 */
import type { GameMap, MobKind } from "@/content/types";
import mobSpriteMetrics from "./mob-sprite-metrics.json";

export type GameKey = "left" | "right" | "jump" | "atk" | "shoot" | "guard";
export type GamePhase = "title" | "play" | "paused" | "clear" | "end";

/**
 * Vì sao game đang dừng. Ba lý do dùng chung một `phase`, khác nhau ở bảng
 * mà giao diện dựng lên: tự bấm dừng, vừa nhặt vật phẩm, hay đang mở túi đồ.
 */
export type PauseReason = "manual" | "pickup" | "inventory";

/** Thông tin đủ để giao diện dựng thẻ giải nghĩa vật phẩm vừa nhặt */
export interface PickupInfo {
  kind: "heal" | "tool" | "gun";
  name: string;
  desc: string;
  /** Số giây buff còn hiệu lực, 0 với vật phẩm hồi máu và súng */
  seconds: number;
  /** Số đạn được nạp, 0 với hai loại còn lại */
  ammo: number;
}

/** Ảnh chụp trạng thái ải, để bảng tạm dừng nói đúng việc còn phải làm */
export interface GameStatus {
  mapIndex: number;
  mobsLeft: number;
  mobsTotal: number;
  bossAlive: boolean;
  bossHpPct: number;
  hp: number;
  mhp: number;
  /** Số giây buff đồ nghề còn lại, 0 nếu không cầm */
  toolLeft: number;
  toolName: string | null;
  /** Đạn còn trong súng, 0 nếu chưa nhặt hoặc đã bắn hết */
  ammo: number;
  gunName: string | null;
  /** Thể lực đỡ đòn, 0..1 */
  guard: number;
  /** Mọi vật phẩm đã nhặt trong ải này, theo thứ tự nhặt */
  items: PickupInfo[];
}

export interface GameHandlers {
  /** Đổi bản đồ — giao diện cập nhật tên ải trên HUD */
  onMap?: (index: number) => void;
  /** Hạ trùm ải thứ index, rơi ra `skills` */
  onCleared?: (index: number, skills: string[]) => void;
  /** Hạ trùm ải cuối */
  onFinished?: () => void;
  /** Vào/ra trạng thái tạm dừng — kể cả khi engine tự dừng vì mất focus */
  onPause?: (paused: boolean, reason: PauseReason) => void;
  /** Nhặt được vật phẩm, kèm câu giải nghĩa để dựng thẻ */
  onPickup?: (info: PickupInfo) => void;
}

export interface GameLabels {
  /** Có {boss} */
  bossAppear: string;
  deathLine: string;
  /** Có {name} */
  pickupTool: string;
  pickupHeal: string;
  /** Có {name} */
  pickupGun: string;
  /** Bấm bắn mà súng rỗng */
  noAmmo: string;
  /** Đỡ trúng nhịp */
  parryLine: string;
  /** Giữ đỡ tới cạn thể lực */
  guardBreakLine: string;
  /** Gợi ý phím tạm dừng, vẽ ở góc dưới canvas */
  pauseHint: string;
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
 * Súng quét — vũ khí thứ hai, bấm K.
 *
 * Cân bằng ở đây là cố ý: đạn ít và giãn nhịp hơn nhát chém, đổi lại bắn
 * được từ xa. Không giới hạn đạn thì cả game rút về đứng một chỗ nhả đạn,
 * mà nhịp gần mới là chỗ vui của thể loại này. 14 viên đủ dọn một cụm quái
 * khó hoặc bào một phần ba máu trùm, không đủ để đi hết ải bằng súng.
 */
const GUN_AMMO = 14;
const GUN_COOLDOWN = 0.26;
const GUN_DMG = 1;
const GUN_SPEED = 620;

/**
 * Đỡ đòn — giữ L.
 *
 * Thể lực là thứ giữ cho đỡ đòn không thành "giữ nút là bất tử": giữ lâu tự
 * cạn, mỗi đòn chặn được tốn thêm một phần. Cạn thì vỡ đỡ, đứng chịu trận
 * 0,7 giây — đúng cái giá phải trả cho việc bấm đỡ bừa.
 *
 * PARRY_WINDOW là 0,22 giây đầu sau khi bấm: chặn trong khoảng đó không tốn
 * thể lực và bật ngược đạn về phía kẻ bắn. Đây là đường vượt trùm ải 2 và 4
 * (hai con bắn loạt ba quả) cho người chơi không muốn nhảy né.
 */
const GUARD_DRAIN = 0.3;
const GUARD_BLOCK_COST = 0.26;
const GUARD_REGEN = 0.5;
/** Trễ trước khi thể lực bắt đầu hồi, tính từ lúc thả đỡ hoặc chặn xong */
const GUARD_REGEN_DELAY = 0.35;
const GUARD_BREAK_TIME = 0.7;
/** Vỡ đỡ xong phải hồi tới mức này mới đỡ lại được */
const GUARD_MIN_TO_RAISE = 0.35;
const PARRY_WINDOW = 0.22;

/**
 * Bố cục ba lớp nền, chốt bằng cách ghép thử cả năm ải rồi soi.
 *
 * Ảnh nền đã được cắt hết hàng trong suốt trên dưới (`sprites.py pack
 * --trim-v`), nên chiều cao vẽ ở đây chính là chiều cao phần có hình: lớp giữa
 * cao 150 nghĩa là mái che chợ hàng ở ải Shopee cao đúng 150px, gấp đôi nhân
 * vật. Chân lớp xa nằm cao hơn mặt đất 70px để phần dưới khuất sau lớp giữa —
 * vật ở xa phải nằm cao hơn trên màn hình thì mới ra chiều sâu.
 */
const FAR_H = 230;
const FAR_BOTTOM_UP = 70;
const MID_H = 150;

/* ══════════════════════════════════════════════════════════════════════════
   ASSET — danh mục và RIG

   1. MANIFEST khai báo đúng những file CÓ THẬT trong public/game. Engine
      không đoán, không thử tải file chưa khai báo — nếu đoán thì mỗi lần
      load game là một tràng 404 trong console. Gen thêm khung mới thì sửa số
      ở đây, engine dùng ngay, không cần sửa chỗ khác.

   2. RIG là cơ chế cố định tỷ lệ. Bản trước vẽ sprite theo kiểu "ép vừa một
      cái hộp maxW × maxH", nên mỗi khung có tỉ lệ riêng: khung chém lọt hộp
      104×74 thì cao 74px, khung đứng lọt hộp 54×70 thì cao 70px — nhân vật
      phình lên 6% đúng lúc tung đòn, và vì asset đời 1 bị crop sát alpha rồi
      normalize về cùng chiều cao, đầu nhân vật to nhỏ khác nhau từng khung.

      Cách sửa: KHÔNG ép vừa hộp nữa. Mỗi khung khai báo ba số:
        unit — phần chiều cao ảnh mà "thước đo" chiếm. Với nhân vật thước đo
               là chiều cao ĐẦU (đỉnh tóc → chin); với quái là chiều cao thân.
        ax   — hoành độ neo, tính theo bề rộng ảnh. Lấy ở hông, không lấy ở
               giữa ảnh: khung chém có tay vung ra ngoài nên giữa ảnh lệch
               khỏi thân người.
        ay   — tung độ neo, tính theo chiều cao ảnh. Lấy ở gan bàn chân.
      Engine phóng ảnh sao cho thước đo luôn bằng một số px cố định
      (HEAD_PX / MOB_PX / BOSS_PX), rồi đặt điểm neo (ax, ay) đúng vào
      (tâm thân, mặt sàn). Đầu không đổi cỡ, chân không trượt, dù khung nào.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Đời asset đang dùng, khai riêng cho từng nhóm. "v1" là bộ ảnh đời đầu, bị
 * crop sát alpha nên phải hiệu chuẩn từng khung. "v2" là bộ gen theo spec ở
 * docs/game-assets.md — khung 1024² cố định, không crop, cỡ nhân vật nhất
 * quán, nên cả bộ dùng chung một rig.
 *
 * Khai riêng từng nhóm để gen lại được từng nhóm một: nhân vật đã sang v2
 * (18 khung), quái và trùm vẫn đời 1 và vẫn đúng cỡ nhờ rig riêng của chúng.
 * Một công tắc chung cho cả ba là cách chắc chắn làm lệch nhóm chưa gen lại.
 */
type RigSet = "v1" | "v2";
const RIG_SET: Record<"mob" | "boss", RigSet> = {
  mob: "v1",
  boss: "v1",
};

/** File nào đã có thật. Xem khối chú thích trên trước khi sửa. */
const ASSETS = {
  /** player/idle.png, hoặc player/idle-1..N.png khi N > 1 */
  playerIdle: 3,
  /** player/run-1..N.png — 4 khung là tối thiểu, 8 khung mới thật mượt */
  playerRun: 8,
  /** player/attack-1..N.png — 2 khung (vung, tới đích), 3 khung có cả thu đòn */
  playerAttack: 3,
  /** "split" = có jump-rise/jump-fall/land riêng; "single" = chỉ có jump.png */
  playerJump: "split" as "single" | "split",
  /**
   * mob/mX-kind-1..N.png — khai theo từng loại vì số khung không đều nhau.
   * `default` áp cho loại không khai riêng. Khai 4 mà thiếu file thì con đó
   * nhấp nháy về hình khối, nên chỉ tăng khi đã đủ khung cho MỌI ải có loại đó.
   */
  mobFrames: { default: 4, rider: 4 } as Record<string, number>,
  /** boss/bX.png + bX-tel.png; 3 = có thêm bX-hit.png */
  bossFrames: 3,
  /** Đã có ảnh cho quái rider chưa. Chưa có thì engine vẽ bằng code. */
  riderArt: true,
  /** fx/slash-1..N.png. 0 = vẽ vệt chém bằng code. */
  slashFx: 3,
  /** item/gun-X.png đã có chưa. Chưa thì engine vẽ khẩu súng bằng code. */
  gunArt: false,
  /** bg/mX-sky.png — lớp trời vẽ bằng ảnh thay vì dốc màu code */
  bgSky: false,
  /** bg/mX-far.png — lớp xa vẽ bằng ảnh thay vì bằng code */
  bgFar: true,
  /** bg/mX-near.png — lớp tiền cảnh phủ trước nhân vật */
  bgNear: false,
};

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

/** Ba số hiệu chuẩn của một khung hình. Xem khối chú thích RIG. */
interface Rig {
  unit: number;
  ax: number;
  ay: number;
}

/** Thước đo hiển thị — cố định, mọi khung đều bị phóng về đúng các số này */
const HEAD_PX = 30;
const MOB_PX = 44;
const FLYER_PX = 32;
const RIDER_PX = 52;
const BOSS_PX = 100;

/**
 * Rig của bộ nhân vật v2, dùng cho cả 18 khung.
 *
 * Khung 1024×1024, tâm thân ở x = 512, gan bàn chân ở y = 960 — hai số này do
 * `scripts/sprites.py normalize` đóng vào từng file nên đúng tuyệt đối.
 *
 * `unit` là chiều cao đầu chia chiều cao khung. 353px là số đo bằng mắt trên
 * năm khung mà bộ đo tự động không bị cánh tay làm lệch (idle-1 356, idle-3
 * 350, run-7 350, run-8 350, attack-2 356). Muốn nhân vật to/nhỏ hơn thì sửa
 * HEAD_PX, đừng sửa số này — nó là thuộc tính của ảnh, không phải của game.
 */
const PLAYER_RIG: Rig = { unit: 353 / 1024, ax: 0.5, ay: 960 / 1024 };

/** Quái đời 1: file 188×188 (bay 343×172), nội dung đệm 6px mỗi phía */
const MOB_RIG_V1: Rig = { unit: 176 / 188, ax: 0.5, ay: 182 / 188 };
const FLYER_RIG_V1: Rig = { unit: 160 / 172, ax: 0.5, ay: 166 / 172 };
const BOSS_RIG_V1: Rig = { unit: 416 / 446, ax: 0.5, ay: 431 / 446 };
/** Quái đúng spec: khung 512×512, thân cao 440px, chân ở y = 476 */
const MOB_RIG_V2: Rig = { unit: 440 / 512, ax: 0.5, ay: 476 / 512 };
/**
 * Rider là loại quái duy nhất đã có ảnh đời 2, nên nó có rig riêng thay vì
 * dùng rig của bộ quái cũ. `unit` lấy theo khung 1 (thân cao 428/512) chứ
 * không phải khung cao nhất: bốn khung rider cố ý cao thấp khác nhau — lúc
 * lao thì người rạp xuống — và engine phải giữ nguyên cái khác nhau đó.
 */
const RIDER_RIG: Rig = { unit: 428 / 512, ax: 0.5, ay: 476 / 512 };
/** Trùm đúng spec: khung 768×768, thân cao 660px, chân ở y = 714 */
const BOSS_RIG_V2: Rig = { unit: 660 / 768, ax: 0.5, ay: 714 / 768 };

function playerRig(): Rig {
  // Cả 18 khung cùng một rig. Bảng hiệu chuẩn từng khung của bộ đời 1 đã bỏ —
  // cần lại thì `python scripts/sprites.py check --emit-rig` in ra được.
  return PLAYER_RIG;
}
function mobRig(kind: MobKind): Rig {
  if (kind === "rider") return RIDER_RIG;
  if (RIG_SET.mob === "v2") return MOB_RIG_V2;
  return kind === "flyer" ? FLYER_RIG_V1 : MOB_RIG_V1;
}
/** Số khung của một loại quái, xem chú thích ASSETS.mobFrames */
const mobFrameCount = (kind: MobKind) => ASSETS.mobFrames[kind] ?? ASSETS.mobFrames.default;
function mobRef(kind: MobKind): number {
  if (kind === "flyer") return FLYER_PX;
  if (kind === "rider") return RIDER_PX;
  return MOB_PX;
}
const bossRig = () => (RIG_SET.boss === "v2" ? BOSS_RIG_V2 : BOSS_RIG_V1);

/* ── tên file ─────────────────────────────────────────── */

const P_IDLE =
  ASSETS.playerIdle > 1
    ? Array.from({ length: ASSETS.playerIdle }, (_, i) => `player/idle-${i + 1}.png`)
    : ["player/idle.png"];
const P_RUN = Array.from({ length: ASSETS.playerRun }, (_, i) => `player/run-${i + 1}.png`);
const P_ATK = Array.from({ length: ASSETS.playerAttack }, (_, i) => `player/attack-${i + 1}.png`);
const P_RISE = ASSETS.playerJump === "split" ? "player/jump-rise.png" : "player/jump.png";
const P_FALL = ASSETS.playerJump === "split" ? "player/jump-fall.png" : "player/jump.png";
const P_LAND = ASSETS.playerJump === "split" ? "player/land.png" : "player/jump.png";
const P_HURT = "player/hurt.png";
const SCENE_SPRITES = {
  platform: "bg/platform.png", ground: "bg/ground.png", gate: "ui/gate.png",
  heart: "ui/heart-full.png", bossbar: "ui/bossbar.png", aura: "fx/aura.png",
  shot: "fx/shot.png", hit: "fx/hit.png", dust: "fx/dust.png", ring: "fx/ring.png",
};

const TRAP_SPRITES = {
  spike: "trap/spike.png",
  saw: "trap/saw.png",
  pulseJet: "trap/pulse-jet.png",
  pulseVent: "trap/pulse-vent.png",
};

function mobSprite(mapIndex: number, kind: MobKind, frame: number) {
  return img(`mob/m${mapIndex + 1}-${kind}-${frame}.png`);
}
/**
 * Khung trùm: "-tel" cho lúc báo đòn, "-hit" cho lúc vừa trúng đòn (chỉ khi
 * ASSETS.bossFrames >= 3, chưa có thì engine tô sáng lên bằng filter).
 */
function bossSprite(mapIndex: number, state: "idle" | "tel" | "hit") {
  const n = mapIndex + 1;
  if (state === "hit" && ASSETS.bossFrames >= 3) {
    const hit = img(`boss/b${n}-hit.png`);
    if (hit) return hit;
  }
  return img(`boss/b${n}${state === "tel" ? "-tel" : ""}.png`);
}
function pickupSprite(mapIndex: number, kind: Pickup["kind"]) {
  // Chưa gen ảnh súng thì đừng gọi img() — mỗi lần gọi là một cái 404
  if (kind === "gun" && !ASSETS.gunArt) return null;
  return img(`item/${kind}-${mapIndex + 1}.png`);
}

/* ── vẽ ảnh ───────────────────────────────────────────── */

interface DrawOpts {
  flip?: boolean;
  /** Nghiêng người, radian, quay quanh điểm neo */
  rot?: number;
  /** Bóp/giãn quanh điểm neo — dùng cho squash & stretch */
  sx?: number;
  sy?: number;
  alpha?: number;
  filter?: string;
}

/**
 * Vẽ một khung theo rig: phóng ảnh sao cho thước đo bằng đúng `ref` px, rồi
 * đặt điểm neo của ảnh vào (x, y). Không có tham số maxW/maxH — chiều rộng
 * hoàn toàn tự do, đó chính là điểm khác so với bản trước.
 */
function drawRig(
  g: CanvasRenderingContext2D,
  im: HTMLImageElement,
  rig: Rig,
  ref: number,
  x: number,
  y: number,
  o: DrawOpts = {},
) {
  const h = ref / rig.unit;
  const w = h * (im.naturalWidth / im.naturalHeight);
  g.save();
  if (o.alpha != null) g.globalAlpha = o.alpha;
  if (o.filter) g.filter = o.filter;
  g.translate(x, y);
  if (o.rot) g.rotate(o.rot);
  g.scale((o.flip ? -1 : 1) * (o.sx ?? 1), o.sy ?? 1);
  g.drawImage(im, -rig.ax * w, -rig.ay * h, w, h);
  g.restore();
}

/** Vẽ đồ vật (vật phẩm, bẫy) — ép vừa hộp là đủ, chúng không có tỉ lệ cơ thể */
function drawFit(
  g: CanvasRenderingContext2D,
  im: HTMLImageElement,
  centerX: number,
  bottomY: number,
  maxW: number,
  maxH: number,
) {
  const scale = Math.min(maxW / im.naturalWidth, maxH / im.naturalHeight);
  const w = im.naturalWidth * scale;
  const h = im.naturalHeight * scale;
  g.drawImage(im, centerX - w / 2, bottomY - h, w, h);
}

/** Vẽ một ảnh lặp ngang để lấp đầy bề rộng `w`, cắt tấm cuối nếu dư */
function drawTiled(
  g: CanvasRenderingContext2D,
  im: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const tileW = h * (im.naturalWidth / im.naturalHeight);
  let cx = x;
  while (cx < x + w) {
    const dw = Math.min(tileW, x + w - cx);
    const sw = (dw / tileW) * im.naturalWidth;
    g.drawImage(im, 0, 0, sw, im.naturalHeight, cx, y, dw, h);
    cx += dw;
  }
}

/* ── màu ──────────────────────────────────────────────── */

function hexRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
/** Trộn hai màu hex, t = 0 lấy a, t = 1 lấy b */
function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexRgb(a);
  const [r2, g2, b2] = hexRgb(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${bl})`;
}
/** Lặp toạ độ về đoạn [0, n) — % của JS trả số âm với số âm */
const wrap = (v: number, n: number) => ((v % n) + n) % n;
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

/* ── thực thể ─────────────────────────────────────────── */

interface Mob {
  kind: MobKind;
  name: string;
  x: number; y: number; w: number; h: number;
  hp: number; dir: number;
  a: number; b: number;
  floor: number;
  hurt: number; bob: number; anim: number;
  dead: boolean;
  /** Đếm lên sau khi chết, để chạy hoạt ảnh tan biến rồi mới thôi vẽ */
  deadT: number;
  cd: number; dash: number;
  /** Báo đòn: rider rú ga, charger rùng mình trước khi lao */
  tel: number;
  /** Giật lùi sau khi bắn, giảm dần về 0 */
  recoil: number;
  /** Bước chân gần nhất, để chỉ nhả bụi một lần mỗi bước */
  stepPhase: number;
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
  kind: "heal" | "tool" | "gun";
  name: string;
  desc: string;
  x: number; y: number;
  taken: boolean; bob: number;
}
interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; max: number; color: string;
  /** "spark" bay theo trọng lực, "dust" nở ra rồi tan, "ring" là vòng loang */
  kind: "spark" | "dust" | "ring";
  size: number;
}
interface Shot { x: number; y: number; vx: number; vy: number; r: number; t: number }
/** Tia súng quét của người chơi — bay thẳng, xuyên qua bẫy, tan khi trúng */
interface Bullet { x: number; y: number; vx: number; t: number }
/** Một nhát chém đã bay ra khỏi tay — vẽ vệt lưỡi liềm rồi tự tan */
interface Slash {
  x: number; y: number; face: number;
  t: number; dur: number;
  reach: number; thick: number; color: string;
  /** Nhát thứ ba của combo vẽ to và sáng hơn */
  heavy: boolean;
}

export interface GameInstance {
  loadMap(index: number): void;
  resume(): void;
  pause(): void;
  togglePause(): void;
  isPaused(): boolean;
  /** Mở/đóng bảng túi đồ — game dừng lại trong lúc mở */
  toggleInventory(): void;
  /** Vì sao đang dừng, để giao diện chọn đúng bảng */
  pauseReason(): PauseReason;
  /**
   * Có dừng hẳn game mỗi khi nhặt vật phẩm không. Giao diện đọc lựa chọn đã
   * lưu của người chơi rồi báo xuống — engine không đụng vào localStorage.
   */
  setPauseOnPickup(on: boolean): void;
  status(): GameStatus;
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
  let flash = 0;
  let msg = "";
  let msgT = 0;
  let worldTime = 0;
  let accumulator = 0;
  /**
   * Đứng hình vài chục ms đúng lúc đòn trúng. Đây là mẹo cũ của thể loại
   * này: cùng một sát thương, có hit-stop thì đòn "nặng" hẳn lên.
   */
  let freeze = 0;

  const keys: Record<GameKey, boolean> = {
    left: false, right: false, jump: false, atk: false, shoot: false, guard: false,
  };
  let pauseWhy: PauseReason = "manual";
  let pauseOnPickup = true;
  /** Vật phẩm đã nhặt trong ải đang chơi — nguồn của bảng túi đồ */
  let bag: PickupInfo[] = [];

  const player = {
    x: 60, y: GY - 40, w: 26, h: 40,
    vx: 0, vy: 0, face: 1,
    hp: 5, mhp: 5, inv: 0, atk: 0, atkDur: 0.28, cd: 0, ground: false,
    tool: 0, hurtT: 0,
    /** Tên đồ nghề đang cầm, để bảng túi đồ gọi đúng tên */
    toolName: null as string | null,
    /** Đạn còn lại và tên khẩu súng đang cầm */
    ammo: 0, gunName: null as string | null,
    /** Đếm ngược hoạt ảnh bắn, và nhịp nghỉ giữa hai phát */
    shootT: 0, gunCd: 0,
    /** Đang giơ đỡ hay không, và đã giơ được bao lâu (để tính parry) */
    guarding: false, guardT: 0,
    /** Thể lực đỡ, 0..1. Cạn thì vỡ đỡ. */
    stam: 1, stamDelay: 0, breakT: 0,
    /** Pha chu kỳ chạy, 0..1 — quy ra khung hình và cả nhịp nhún */
    runPhase: 0,
    attackActive: 0, attackHit: false, attackBuffed: false,
    /** Combo ba nhát: đánh tiếp trong 0,55s thì lên nhát kế */
    combo: 0, comboT: 0,
    /** Đếm ngược hoạt ảnh chạm đất, để bóp người một nhịp */
    landT: 0,
    /** Thời gian còn được nhảy sau khi rời mặt đất (coyote time) */
    coyote: 0,
    /** Bấm nhảy sớm trước khi chạm đất vẫn được ghi nhận */
    jumpBuf: 0,
    /** Tốc độ rơi khung trước, để biết đáp đất mạnh hay nhẹ */
    fallSpeed: 0,
  };
  let mobs: Mob[] = [];
  let traps: Trap[] = [];
  let pickups: Pickup[] = [];
  let parts: Particle[] = [];
  let shots: Shot[] = [];
  let bullets: Bullet[] = [];
  let slashes: Slash[] = [];
  let boss: Boss | null = null;
  let cam = 0;

  /* ── vòng đời ải ─────────────────────────────────────── */

  const MOB_HP: Record<MobKind, number> = {
    walker: 2, flyer: 2, charger: 3, shooter: 2, rider: 3,
  };

  /** Hộp thân quái theo loại. Rider ngồi xe nên rộng và thấp hơn. */
  function mobBox(kind: MobKind) {
    if (kind === "flyer") return { w: 30, h: 28 };
    // Rider ngồi trên xe: hộp rộng và cao hơn để phủ cả thân người, không chỉ cái xe
    if (kind === "rider") return { w: 42, h: 40 };
    return { w: 30, h: 30 };
  }

  function loadMap(index: number) {
    lv = index;
    const m = maps[lv];
    Object.assign(player, {
      x: 60, y: GY - 40, vx: 0, vy: 0, face: 1,
      hp: 5, inv: 0, atk: 0, cd: 0, ground: false, tool: 0, hurtT: 0,
      toolName: null, ammo: 0, gunName: null, shootT: 0, gunCd: 0,
      guarding: false, guardT: 0, stam: 1, stamDelay: 0, breakT: 0,
      runPhase: 0, attackActive: 0, attackHit: false, attackBuffed: false,
      combo: 0, comboT: 0, landT: 0, coyote: 0, jumpBuf: 0, fallSpeed: 0,
    });
    bag = [];
    parts = [];
    shots = [];
    bullets = [];
    slashes = [];
    boss = null;
    cam = 0;
    shake = 0;
    fade = 0;
    flash = 0;
    freeze = 0;
    msg = "";
    msgT = 0;

    mobs = m.mobs.map((sp) => {
      const floor = sp.y ?? GY;
      const range = sp.range ?? 70;
      const { w, h } = mobBox(sp.kind);
      return {
        kind: sp.kind, name: sp.name,
        x: sp.x, y: floor - h, w, h,
        hp: MOB_HP[sp.kind],
        dir: Math.random() < 0.5 ? -1 : 1,
        a: sp.x - range, b: sp.x + range,
        floor,
        hurt: 0, bob: Math.random() * 6, anim: Math.random(),
        dead: false, deadT: 0,
        cd: 1 + Math.random(), dash: 0, tel: 0, recoil: 0,
        stepPhase: 0,
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
      kind: p.kind, name: p.name, desc: p.desc, x: p.x, y: p.y,
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
    flash = 0.5;
    shake = 7;
  }

  function clearMap() {
    phase = "clear";
    fade = 0;
    const m = maps[lv];
    if (boss) {
      puff(boss.x + boss.w / 2, boss.y + boss.h / 2, LIME, 40);
      ring(boss.x + boss.w / 2, boss.y + boss.h / 2, LIME);
    }
    boss = null;
    flash = 0.6;
    handlers.onCleared?.(lv, m.skills);
    if (lv + 1 >= maps.length) handlers.onFinished?.();
  }

  /* ── hành động ───────────────────────────────────────── */

  /** Đang bị khoá tay: vỡ đỡ chưa hồi xong, hoặc đang giơ đỡ */
  const busy = () => player.breakT > 0 || player.guarding;

  function tryJump() {
    if (phase !== "play" || busy()) return;
    if (!player.ground && player.coyote <= 0) return;
    player.vy = -684;
    player.ground = false;
    player.coyote = 0;
    player.jumpBuf = 0;
    dust(player.x + player.w / 2, player.y + player.h, 6, 1);
  }

  function attack() {
    if (phase !== "play" || player.cd > 0 || busy()) return;
    const buffed = player.tool > 0;
    // Combo ba nhát: hai nhát đầu nhanh, nhát ba chậm hơn nhưng nặng
    player.combo = player.comboT > 0 ? (player.combo + 1) % 3 : 0;
    player.comboT = 0.55;
    const heavy = player.combo === 2;

    player.atkDur = heavy ? 0.34 : buffed ? 0.2 : 0.28;
    player.atk = player.atkDur;
    player.attackActive = heavy ? 0.14 : buffed ? 0.085 : 0.12;
    player.attackHit = false;
    player.attackBuffed = buffed;
    player.cd = heavy ? 0.42 : buffed ? 0.23 : 0.34;

    // Nhích người theo hướng chém — đòn có lực đẩy thì mới thấy "ăn"
    if (player.ground) player.vx += player.face * (heavy ? 130 : 70);
  }

  /** Sát thương rơi đúng vào khung chém, không xảy ra ngay lúc người chơi bấm. */
  function resolveAttack() {
    if (player.attackHit) return;
    player.attackHit = true;
    const heavy = player.combo === 2;
    const buffed = player.attackBuffed;
    const reach = (buffed ? 84 : 58) * (heavy ? 1.22 : 1);
    const dmg = (buffed ? 2 : 1) + (heavy ? 1 : 0);

    // Vệt chém bay ra khỏi tay, sống độc lập với khung hình nhân vật
    slashes.push({
      // Tâm cung đặt trước thân người, không đặt ở giữa ngực — để lưỡi quét
      // trong khoảng trống phía trước chứ không quét xuyên qua chính mình
      x: player.x + player.w / 2 + player.face * 16,
      y: player.y + 16,
      face: player.face,
      t: 0,
      dur: heavy ? 0.3 : 0.22,
      reach: reach * 0.62,
      thick: heavy ? 20 : buffed ? 16 : 12,
      color: buffed ? LIME : "#f2ffc4",
      heavy,
    });

    // Tầm chém rộng hơn thân người, để đánh được trước khi bị quái chạm vào
    const hb = {
      x: player.face > 0 ? player.x + player.w - 6 : player.x + 6 - reach,
      y: player.y + 2, w: reach, h: 34,
    };
    const m = maps[lv];
    let hitAny = false;

    for (const o of mobs) {
      if (o.dead || !overlap(hb, o)) continue;
      hitAny = true;
      o.hp -= dmg;
      o.hurt = 0.18;
      o.x += player.face * (heavy ? 22 : 14);
      o.tel = 0;
      o.dash = 0;
      spark(o.x + o.w / 2, o.y + o.h / 2, player.face);
      puff(o.x + o.w / 2, o.y + o.h / 2, m.palette.mob, 6);
      if (o.hp <= 0) {
        o.dead = true;
        o.deadT = 0;
        puff(o.x + o.w / 2, o.y + o.h / 2, LIME, 16);
        ring(o.x + o.w / 2, o.y + o.h / 2, LIME);
      }
    }

    if (boss && overlap(hb, boss)) {
      hitAny = true;
      boss.hp -= dmg;
      boss.hurt = 0.16;
      spark(boss.x + boss.w / 2, boss.y + boss.h / 2, player.face);
      puff(boss.x + boss.w / 2, boss.y + boss.h / 2, m.palette.boss, 8);
      if (boss.hp <= 0) clearMap();
    }

    if (hitAny) {
      shake = Math.max(shake, heavy ? 7 : 4);
      freeze = reduced ? 0 : heavy ? 0.075 : 0.045;
    }
  }

  /* ── súng quét: đòn tầm xa, bấm K ─────────────────────── */

  function shoot() {
    if (phase !== "play" || busy() || player.gunCd > 0 || player.atk > 0) return;
    if (player.ammo <= 0) {
      // Không im lặng nuốt cú bấm: người chơi phải biết vì sao không có gì xảy ra
      say(labels.noAmmo, 1);
      player.gunCd = 0.3;
      return;
    }
    player.ammo -= 1;
    player.gunCd = GUN_COOLDOWN;
    player.shootT = 0.2;
    // Giật lùi nhẹ — đòn tầm xa mà không có phản lực thì bấm như bấm chuột
    if (player.ground) player.vx -= player.face * 46;
    const muzzleX = player.x + player.w / 2 + player.face * 20;
    const muzzleY = player.y + 17;
    bullets.push({ x: muzzleX, y: muzzleY, vx: player.face * GUN_SPEED, t: 0 });
    puff(muzzleX, muzzleY, LIME, 3);
    shake = Math.max(shake, 1.6);
  }

  /** Một viên đạn của người chơi ăn vào cái gì đó. `true` nghĩa là viên đó tan. */
  function bulletHits(b: Bullet, m: GameMap): boolean {
    const box = { x: b.x - 7, y: b.y - 5, w: 14, h: 10 };
    for (const o of mobs) {
      if (o.dead || !overlap(box, o)) continue;
      o.hp -= GUN_DMG;
      o.hurt = 0.16;
      o.tel = 0;
      o.dash = 0;
      spark(b.x, b.y, Math.sign(b.vx) || 1);
      puff(o.x + o.w / 2, o.y + o.h / 2, m.palette.mob, 5);
      if (o.hp <= 0) {
        o.dead = true;
        o.deadT = 0;
        puff(o.x + o.w / 2, o.y + o.h / 2, LIME, 16);
        ring(o.x + o.w / 2, o.y + o.h / 2, LIME);
      }
      return true;
    }
    if (boss && overlap(box, boss)) {
      boss.hp -= GUN_DMG;
      boss.hurt = 0.14;
      spark(b.x, b.y, Math.sign(b.vx) || 1);
      puff(boss.x + boss.w / 2, boss.y + boss.h / 2, m.palette.boss, 6);
      if (boss.hp <= 0) clearMap();
      return true;
    }
    return false;
  }

  /* ── đỡ đòn: giữ L ───────────────────────────────────── */

  /**
   * Cập nhật trạng thái đỡ mỗi khung. Tách khỏi `press`/`release` vì đỡ là
   * trạng thái giữ nút, không phải một cú bấm: điều kiện giơ được hay không
   * thay đổi liên tục (rời mặt đất, cạn thể lực, vừa vỡ đỡ).
   */
  function stepGuard(dt: number) {
    if (player.breakT > 0) {
      player.breakT = Math.max(0, player.breakT - dt);
      player.guarding = false;
    }

    const canRaise =
      keys.guard &&
      player.breakT <= 0 &&
      player.ground &&
      player.atk <= 0 &&
      player.hurtT <= 0 &&
      player.stam >= (player.guarding ? 0 : GUARD_MIN_TO_RAISE);

    if (canRaise) {
      if (!player.guarding) {
        player.guarding = true;
        player.guardT = 0;
        // Khiên dựng lên: một vòng sáng nhỏ để biết đòn đỡ đã ăn từ lúc nào
        ring(player.x + player.w / 2 + player.face * 14, player.y + 18, "#9fd8ff");
      }
      player.guardT += dt;
      player.stam = Math.max(0, player.stam - GUARD_DRAIN * dt);
      player.stamDelay = GUARD_REGEN_DELAY;
      // Đứng tấn: hãm người lại chứ không cấm hẳn, để không bị kẹt trong bẫy
      player.vx *= Math.exp(-18 * dt);
      if (player.stam <= 0) breakGuard();
    } else {
      player.guarding = false;
      player.guardT = 0;
    }

    if (!player.guarding) {
      player.stamDelay = Math.max(0, player.stamDelay - dt);
      if (player.stamDelay <= 0) player.stam = Math.min(1, player.stam + GUARD_REGEN * dt);
    }
  }

  function breakGuard() {
    player.guarding = false;
    player.guardT = 0;
    player.stam = 0;
    player.breakT = GUARD_BREAK_TIME;
    player.stamDelay = GUARD_REGEN_DELAY;
    say(labels.guardBreakLine, 0.9);
    shake = Math.max(shake, 5);
    puff(player.x + player.w / 2, player.y + 18, "#9fd8ff", 10);
  }

  /**
   * Đòn tới từ phía trước có bị đỡ không.
   *
   * `dir` là hướng đòn hất người chơi đi, nên kẻ tấn công nằm ở phía `-dir`.
   * Chỉ đỡ được đòn từ đúng hướng đang quay mặt — quay lưng lại là ăn đủ.
   */
  function blocks(dir: number) {
    return player.guarding && dir !== 0 && -dir === player.face;
  }

  /** Đỡ trúng nhịp: không tốn thể lực, đẩy lùi kẻ tấn công, đứng hình một chớp */
  function onBlocked(parry: boolean, atX: number) {
    const y = player.y + 18;
    if (parry) {
      say(labels.parryLine, 0.8);
      flash = Math.max(flash, 0.3);
      freeze = reduced ? 0 : 0.08;
      ring(atX, y, LIME);
      puff(atX, y, LIME, 10);
    } else {
      player.stam = Math.max(0, player.stam - GUARD_BLOCK_COST);
      freeze = reduced ? 0 : 0.03;
      puff(atX, y, "#9fd8ff", 6);
      if (player.stam <= 0) breakGuard();
    }
    player.stamDelay = GUARD_REGEN_DELAY;
    player.vx += -player.face * (parry ? 40 : 120);
    shake = Math.max(shake, parry ? 5 : 3);
  }

  /**
   * `unblockable` dành cho bẫy: gai và lưỡi cưa vẫn phải né bằng chân, không
   * thì cả ải rút về việc giữ nút đỡ mà đi xuyên qua mọi thứ.
   */
  function hurtPlayer(dir: number, unblockable = false) {
    if (player.inv > 0 || phase !== "play") return;
    if (!unblockable && blocks(dir)) {
      onBlocked(player.guardT <= PARRY_WINDOW, player.x + player.w / 2 + player.face * 18);
      player.inv = 0.25;
      return;
    }
    player.hp -= 1;
    player.inv = 1.35;
    player.hurtT = 0.35;
    player.vy = -360;
    player.vx = dir * 450;
    player.combo = 0;
    player.comboT = 0;
    player.guarding = false;
    player.guardT = 0;
    player.stamDelay = GUARD_REGEN_DELAY;
    shake = 6;
    flash = 0.25;
    freeze = reduced ? 0 : 0.06;
    puff(player.x + player.w / 2, player.y + player.h / 2, "#ff6b5e", 8);
    if (player.hp <= 0) {
      say(labels.deathLine, 1.4);
      window.setTimeout(() => {
        if (phase === "play" || phase === "paused") loadMap(lv);
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
        x, y, color, kind: "spark", size: 5,
        vx: (Math.random() - 0.5) * 300,
        vy: -Math.random() * 240 - 60,
        life: 0.55, max: 0.55,
      });
    }
  }
  /** Bụi: nở ra, bay chậm, không rơi. Dùng cho bước chân và lúc đáp đất. */
  function dust(x: number, y: number, n: number, spread = 1) {
    for (let i = 0; i < n; i++) {
      parts.push({
        x: x + (Math.random() - 0.5) * 8 * spread,
        y, color: "rgba(255,255,255,.7)", kind: "dust",
        size: 3 + Math.random() * 4,
        vx: (Math.random() - 0.5) * 90 * spread,
        vy: -Math.random() * 40 - 10,
        life: 0.4, max: 0.4,
      });
    }
  }
  /** Tia trắng bắn ra đúng chỗ lưỡi chém ăn vào thân quái */
  function spark(x: number, y: number, face: number) {
    for (let i = 0; i < 7; i++) {
      const a = (Math.random() - 0.5) * 1.6;
      const sp = 260 + Math.random() * 300;
      parts.push({
        x, y, color: "#ffffff", kind: "spark", size: 4,
        vx: Math.cos(a) * sp * face,
        vy: Math.sin(a) * sp,
        life: 0.22, max: 0.22,
      });
    }
  }
  /** Vòng sáng loang ra — đánh dấu chỗ vừa có gì đó nổ */
  function ring(x: number, y: number, color: string) {
    parts.push({ x, y, vx: 0, vy: 0, life: 0.4, max: 0.4, color, kind: "ring", size: 10 });
  }
  function say(text: string, seconds: number) {
    msg = text;
    msgT = seconds;
  }
  function fire(x: number, y: number, vx: number, vy: number) {
    shots.push({ x, y, vx, vy, r: 9, t: 0 });
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
    o.recoil = Math.max(0, o.recoil - dt * 4);
    o.bob += dt * 6;
    o.anim += dt;
    if (o.hurt > 0) return;

    const dx = player.x + player.w / 2 - (o.x + o.w / 2);
    const dy = player.y - o.y;

    if (o.kind === "walker") {
      o.x += o.dir * 0.92 * dt * 60;
      if (o.x < o.a) { o.x = o.a; o.dir = 1; }
      if (o.x > o.b) { o.x = o.b; o.dir = -1; }
      o.y = o.floor - o.h;
      // Nhả bụi mỗi lần chân chạm đất, lấy nhịp từ chính chu kỳ khung hình
      const ph = Math.floor(o.anim * 6);
      if (ph !== o.stepPhase) {
        o.stepPhase = ph;
        if (Math.random() < 0.5) dust(o.x + o.w / 2, o.y + o.h, 1, 0.5);
      }
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
        if (Math.random() < 0.4) dust(o.x + o.w / 2, o.y + o.h, 1, 0.6);
        if (o.dash <= 0) o.cd = 1.3;
      } else if (o.tel > 0) {
        // Rùng mình 0,25s trước khi lao — đủ để người chơi kịp nhảy
        o.tel -= dt;
        if (o.tel <= 0) {
          o.dash = 0.75;
          puff(o.x + o.w / 2, o.y + o.h, HAZARD, 5);
        }
      } else {
        o.cd -= dt;
        if (Math.abs(dx) < 240 && Math.abs(dy) < 70 && o.cd <= 0) {
          o.dir = dx < 0 ? -1 : 1;
          o.tel = 0.25;
        }
      }
      // Không cho lao ra khỏi vùng của nó quá xa
      o.x = Math.max(o.a - 140, Math.min(o.b + 140, o.x));
    } else if (o.kind === "rider") {
      // Rider: nhìn xa nhất, báo đòn rõ nhất, lao nhanh nhất
      o.y = o.floor - o.h;
      if (o.dash > 0) {
        o.dash -= dt;
        o.x += o.dir * 8.2 * dt * 60;
        dust(o.x + o.w / 2 - o.dir * 14, o.y + o.h, 1, 1.2);
        if (o.dash <= 0) {
          o.cd = 1.5;
          o.dir = -o.dir;
        }
      } else if (o.tel > 0) {
        o.tel -= dt;
        if (o.tel <= 0) {
          o.dash = 0.85;
          puff(o.x + o.w / 2, o.y + o.h, "#EE4D2D", 8);
          shake = Math.max(shake, 3);
        }
      } else {
        o.cd -= dt;
        o.x += o.dir * 0.55 * dt * 60;
        if (o.x < o.a) { o.x = o.a; o.dir = 1; }
        if (o.x > o.b) { o.x = o.b; o.dir = -1; }
        if (Math.abs(dx) < 430 && Math.abs(dy) < 90 && o.cd <= 0) {
          o.dir = dx < 0 ? -1 : 1;
          o.tel = 0.5;
        }
      }
      o.x = Math.max(o.a - 420, Math.min(o.b + 420, o.x));
    } else {
      // shooter: đứng im, nhả đạn về phía người chơi
      o.y = o.floor - o.h;
      o.cd -= dt;
      if (o.cd <= 0) {
        o.cd = 2.2;
        o.dir = dx < 0 ? -1 : 1;
        o.recoil = 1;
        fire(o.x + o.w / 2, o.y + o.h / 2, o.dir * 3.4, 0);
        puff(o.x + o.w / 2 + o.dir * 14, o.y + o.h * 0.5, HAZARD, 3);
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
      if (Math.random() < 0.5) dust(b.x + b.w / 2, b.y + b.h, 2, 1.4);
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
          dust(b.x + b.w / 2, b.y + b.h, 10, 2.2);
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
    player.gunCd = Math.max(0, player.gunCd - dt);
    player.shootT = Math.max(0, player.shootT - dt);
    player.comboT = Math.max(0, player.comboT - dt);
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
    player.coyote = Math.max(0, player.coyote - dt);
    player.jumpBuf = Math.max(0, player.jumpBuf - dt);
    msgT = Math.max(0, msgT - dt);
    flash = Math.max(0, flash - dt * 2.6);
    shake *= Math.exp(-9 * dt);

    stepGuard(dt);
    // Giữ nút bắn thì nhả đạn liên tục theo nhịp súng, không phải bấm từng phát
    if (keys.shoot) shoot();

    const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    // Đang đỡ hoặc vừa vỡ đỡ thì mất quyền điều khiển: đó là cái giá của đỡ
    if (dir && !player.guarding && player.breakT <= 0) {
      player.vx += dir * 2300 * dt;
      // Đang chém thì không cho quay người — quay giữa đòn trông như trượt
      if (player.atk <= 0) player.face = dir;
    }
    player.vx *= Math.exp(-12 * dt);
    player.vx = Math.max(-360, Math.min(360, player.vx));
    const moveX = player.vx * dt;
    player.x = Math.max(0, Math.min(WORLD - player.w, player.x + moveX));
    if (player.ground && Math.abs(moveX) > 0.01) {
      // Chu kỳ chạy tính theo quãng đường, không theo thời gian: chạy chậm thì
      // chân bước chậm, không bị hiện tượng trượt chân. 150px một chu kỳ hai
      // sải chân — ở tốc độ tối đa 360px/s là 0,42 giây một chu kỳ, đúng nhịp
      // chạy của người. Đặt ngắn hơn là chân đạp như xe đạp.
      player.runPhase = wrap(player.runPhase + Math.abs(moveX) / 150, 1);
    }

    const wasGround = player.ground;
    const prevBottom = player.y + player.h;
    player.fallSpeed = player.vy;
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
    if (player.ground && !wasGround) {
      // Vừa đáp đất: bóp người một nhịp, nhả bụi theo độ mạnh cú rơi
      const hard = Math.min(1, player.fallSpeed / 700);
      player.landT = 0.06 + hard * 0.1;
      if (hard > 0.25) dust(player.x + player.w / 2, player.y + player.h, 2 + Math.round(hard * 6));
      if (player.jumpBuf > 0) tryJump();
    }
    if (!player.ground && wasGround && player.vy > 0) player.coyote = 0.09;

    let alive = 0;
    for (const o of mobs) {
      if (o.dead) {
        o.deadT += dt;
        continue;
      }
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
        hurtPlayer(player.x < box.x + box.w / 2 ? -1 : 1, true);
      }
    }

    for (const p of pickups) {
      if (p.taken) continue;
      p.bob += dt * 4;
      const box = { x: p.x, y: p.y - 26, w: 24, h: 24 };
      if (!overlap(player, box)) continue;
      p.taken = true;
      ring(p.x + 12, p.y - 14, p.kind === "heal" ? "#ff8f85" : LIME);
      if (p.kind === "heal") {
        player.hp = Math.min(player.mhp, player.hp + 1);
        say(labels.pickupHeal, 1.2);
        puff(p.x + 12, p.y - 14, "#ff6b5e", 12);
      } else if (p.kind === "gun") {
        // Nhặt lại khi còn đạn thì cộng dồn, không xoá số đạn đang có
        player.ammo += GUN_AMMO;
        player.gunName = p.name;
        say(labels.pickupGun.replace("{name}", p.name), 1.6);
        puff(p.x + 12, p.y - 14, "#9fd8ff", 16);
      } else {
        player.tool = TOOL_SECONDS;
        player.toolName = p.name;
        say(labels.pickupTool.replace("{name}", p.name), 1.6);
        puff(p.x + 12, p.y - 14, LIME, 16);
      }
      const info: PickupInfo = {
        kind: p.kind,
        name: p.name,
        desc: p.desc,
        seconds: p.kind === "tool" ? TOOL_SECONDS : 0,
        ammo: p.kind === "gun" ? GUN_AMMO : 0,
      };
      bag.push(info);
      handlers.onPickup?.(info);
      // Dừng hẳn để người chơi đọc xong câu giải nghĩa. Thẻ tự tắt sau vài
      // giây thì vật phẩm nào cũng trôi qua mà không ai kịp đọc.
      if (pauseOnPickup) setPaused(true, "pickup");
    }

    if (boss) {
      stepBoss(boss, dt);
      if (overlap(player, boss)) hurtPlayer(player.x < boss.x ? -1 : 1);
    }

    shots = shots.filter((s) => {
      s.t += dt;
      s.x += s.vx * dt * 60;
      s.y += s.vy * dt * 60;
      if (overlap(player, { x: s.x - s.r, y: s.y - s.r, w: s.r * 2, h: s.r * 2 })) {
        const dir = s.vx > 0 ? 1 : -1;
        // Đỡ trúng nhịp thì đạn bật ngược lại thành đạn của mình. Đây là
        // phần thưởng cho việc bấm đỡ đúng lúc thay vì giữ đỡ suốt trận.
        const parried = blocks(dir) && player.guardT <= PARRY_WINDOW;
        hurtPlayer(dir);
        if (parried) bullets.push({ x: s.x, y: s.y, vx: -s.vx * 60 * 1.4, t: 0 });
        return false;
      }
      return s.x > -30 && s.x < WORLD + 30 && s.y > -30 && s.y < H + 60;
    });

    bullets = bullets.filter((b) => {
      b.t += dt;
      b.x += b.vx * dt;
      if (bulletHits(b, m)) return false;
      return b.t < 1.4 && b.x > cam - 60 && b.x < cam + W + 60;
    });

    slashes = slashes.filter((s) => {
      s.t += dt;
      return s.t < s.dur;
    });

    parts = parts.filter((p) => {
      p.life -= dt;
      if (p.kind === "spark") {
        p.vy += 1260 * dt;
      } else if (p.kind === "dust") {
        p.vx *= Math.exp(-3 * dt);
        p.vy *= Math.exp(-2 * dt);
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      return p.life > 0;
    });

    // Camera nhìn trước một đoạn theo hướng chạy — thấy quái sớm hơn nửa nhịp
    const lead = player.face * 54 * Math.min(1, Math.abs(player.vx) / 300);
    const want = Math.max(0, Math.min(WORLD - W, player.x + player.w / 2 + lead - W / 2));
    cam += (want - cam) * Math.min(1, dt * 6);
    if (phase === "clear") fade += dt;
  }

  /* ── vẽ: nền ─────────────────────────────────────────── */

  /**
   * Lớp xa vẽ bằng code, mỗi ải một dàn bóng đổ riêng theo `deco`. Nền chỉ có
   * tông màu thì ải nào cũng như ải nào — có silhouette thì nhìn một giây là
   * biết đang ở cảng, ở kho hay ở phòng dữ liệu. Khi đã gen được lớp xa vẽ
   * tay (ASSETS.bgFar) thì ảnh thắng, hàm này chỉ còn là dự phòng.
   */
  function drawFar(m: GameMap) {
    const p = m.palette;
    // Lớp giữa (ảnh vẽ tay) phủ dải GY-150 → GY, nên mọi thứ vẽ ở đây chỉ
    // đọc được ở phần cao hơn y = 194. Vì vậy chân của kết cấu đặt ở B, thấp
    // hơn mép lớp giữa một chút, và chỉ phần trên nhô lên trời mới thấy —
    // đúng kiểu đường chân trời phía sau một hàng container.
    const B = GY - 144;
    // Càng xa càng nhạt về phía trời: đó là cách rẻ nhất để có chiều sâu
    const near = mix(p.far, p.sky, 0.18);
    const back = mix(p.far, p.sky, 0.5);
    const glass = mix(p.sky, "#ffffff", 0.55);
    const step = 320;

    g!.save();
    g!.globalAlpha = 0.92;

    for (let i = -1; i < 4; i++) {
      const x = i * step - wrap(cam * 0.25, step);
      const seed = wrap(i + Math.floor((cam * 0.25) / step), 7);

      if (m.deco === "container") {
        // Cảng: tàu container, cần cẩu giàn, chồng container xếp cao
        g!.fillStyle = back;
        // thân tàu, cabin và ống khói — nhô lên trên hàng container
        g!.beginPath();
        g!.moveTo(x + 22, B - 34);
        g!.lineTo(x + 214, B - 34);
        g!.lineTo(x + 196, B + 6);
        g!.lineTo(x + 44, B + 6);
        g!.closePath();
        g!.fill();
        g!.fillRect(x + 150, B - 66, 44, 32);
        g!.fillRect(x + 166, B - 84, 13, 18);
        g!.fillStyle = glass;
        for (let wy = 0; wy < 2; wy++) g!.fillRect(x + 156, B - 60 + wy * 11, 32, 5);

        // cần cẩu giàn: hai chân, dầm ngang, tay chìa ra phía tàu, buồng lái
        const craneH = 126 + seed * 7;
        g!.fillStyle = near;
        g!.fillRect(x + 232, B - craneH, 9, craneH);
        g!.fillRect(x + 296, B - craneH, 9, craneH);
        g!.fillRect(x + 214, B - craneH, 104, 10);
        g!.fillRect(x + 120, B - craneH + 1, 96, 7);
        g!.fillRect(x + 258, B - craneH - 24, 22, 24);
        // xe con treo dây và móc
        g!.fillRect(x + 160, B - craneH + 8, 18, 5);
        g!.fillRect(x + 167, B - craneH + 13, 3, 26);
        g!.fillRect(x + 156, B - craneH + 39, 26, 12);

        // chồng container: đọc rõ nhất khi cao thấp so le
        for (let c = 0; c < 7; c++) {
          const stack = 2 + ((c * 3 + seed) % 3);
          for (let s = 0; s < stack; s++) {
            g!.fillStyle = (c + s) % 2 ? back : near;
            g!.fillRect(x + 6 + c * 44, B - 4 - (s + 1) * 15, 40, 14);
          }
        }
      } else if (m.deco === "crate") {
        // Kho phân loại: vì kèo mái, đèn treo, băng chuyền trên cao, chồng thùng
        g!.fillStyle = back;
        g!.fillRect(x, 62, step, 9);
        for (let t = 0; t < 6; t++) {
          const tx = x + t * 54;
          g!.beginPath();
          g!.moveTo(tx, 71);
          g!.lineTo(tx + 27, 116);
          g!.lineTo(tx + 54, 71);
          g!.closePath();
          g!.fill();
        }
        for (let l = 0; l < 3; l++) {
          g!.fillRect(x + 60 + l * 100, 71, 5, 30);
          g!.beginPath();
          g!.arc(x + 62 + l * 100, 106, 11, 0, Math.PI * 2);
          g!.fill();
        }
        // băng chuyền treo, chạy chéo qua cả bề rộng
        g!.fillStyle = near;
        g!.fillRect(x + 10, B - 116, step - 20, 13);
        for (let s = 0; s < 5; s++) g!.fillRect(x + 40 + s * 60, B - 103, 6, 18);
        // thùng đang trôi trên băng chuyền
        for (let c = 0; c < 4; c++) {
          g!.fillStyle = back;
          const cx = x + wrap(c * 80 + worldTime * 16, step);
          g!.fillRect(cx, B - 132, 18, 16);
        }
        // chồng thùng xếp dưới sàn
        for (let c = 0; c < 6; c++) {
          const ch = 42 + ((c * 23 + seed * 5) % 46);
          g!.fillStyle = c % 2 ? back : near;
          g!.fillRect(x + 12 + c * 52, B - ch, 44, ch + 8);
          g!.fillStyle = mix(p.far, p.ground, 0.25);
          g!.fillRect(x + 16 + c * 52, B - ch + 8, 36, 4);
        }
      } else if (m.deco === "tower") {
        // Sàn điều phối: nhà cao tầng có cửa sổ sáng, mái che hàng, bảng hiệu
        for (let t = 0; t < 4; t++) {
          const th = 116 + ((t * 61 + seed * 13) % 96);
          g!.fillStyle = t % 2 ? back : near;
          g!.fillRect(x + t * 82, B - th, 64, th + 8);
          g!.fillStyle = glass;
          for (let wy = 0; wy < Math.floor(th / 24); wy++) {
            for (let wx = 0; wx < 3; wx++) {
              if ((wx + wy * 2 + t) % 4 === 0) continue;
              g!.fillRect(x + t * 82 + 9 + wx * 18, B - th + 12 + wy * 24, 11, 12);
            }
          }
          // bảng hiệu trên nóc, chỉ là khối, không chữ
          if (t % 2) {
            g!.fillStyle = near;
            g!.fillRect(x + t * 82 + 14, B - th - 16, 36, 14);
          }
        }
        // mái che dãy hàng, nhô lên trên mép lớp giữa
        g!.fillStyle = near;
        for (let c = 0; c < 4; c++) {
          const cx = x + 12 + c * 84;
          g!.beginPath();
          g!.moveTo(cx, B - 34);
          g!.lineTo(cx + 34, B - 62);
          g!.lineTo(cx + 68, B - 34);
          g!.closePath();
          g!.fill();
        }
      } else if (m.deco === "server") {
        // Phòng dữ liệu: máng cáp trên trần, dãy rack, đèn trạng thái nháy
        g!.fillStyle = back;
        g!.fillRect(x, 84, step, 11);
        for (let c = 0; c < 4; c++) {
          g!.fillRect(x + 30 + c * 80, 95, 6, 24);
          // bó cáp buông xuống
          g!.beginPath();
          g!.moveTo(x + 33 + c * 80, 119);
          g!.quadraticCurveTo(x + 60 + c * 80, 150, x + 90 + c * 80, 119);
          g!.lineWidth = 3;
          g!.strokeStyle = back;
          g!.stroke();
        }
        for (let r = 0; r < 4; r++) {
          const rx = x + 16 + r * 78;
          const rh = 104 + ((r * 29 + seed * 6) % 44);
          g!.fillStyle = r % 2 ? near : back;
          g!.fillRect(rx, B - rh, 58, rh + 8);
          g!.fillStyle = mix(p.sky, "#ffffff", 0.3);
          for (let u = 0; u < Math.floor(rh / 16); u++) {
            g!.fillRect(rx + 6, B - rh + 8 + u * 16, 40, 5);
          }
          // đèn nháy lệch pha nhau, đủ để thấy phòng đang "sống"
          for (let u = 0; u < Math.floor(rh / 16); u++) {
            const on = Math.sin(worldTime * 3 + r * 1.7 + u) > 0.2;
            g!.fillStyle = on ? LIME : mix(p.far, p.ground, 0.5);
            g!.fillRect(rx + 49, B - rh + 8 + u * 16, 4, 4);
          }
        }
      } else {
        // Xưởng sản phẩm: bánh răng quay chậm, kệ hàng, bảng điều khiển
        for (let c = 0; c < 3; c++) {
          const cx = x + 54 + c * 108;
          const cy = B - 96 - ((c * 37 + seed * 8) % 44);
          const r = 28 + ((c * 13) % 16);
          g!.fillStyle = c % 2 ? near : back;
          g!.save();
          g!.translate(cx, cy);
          g!.rotate((worldTime * 0.25 + c) * (c % 2 ? 1 : -1));
          g!.beginPath();
          g!.arc(0, 0, r, 0, Math.PI * 2);
          g!.fill();
          for (let t = 0; t < 8; t++) {
            const a = (t / 8) * Math.PI * 2;
            g!.fillRect(Math.cos(a) * r - 5, Math.sin(a) * r - 5, 10, 10);
          }
          g!.restore();
        }
        for (let s = 0; s < 4; s++) {
          const sx = x + 18 + s * 82;
          g!.fillStyle = near;
          g!.fillRect(sx, B - 74, 64, 6);
          g!.fillRect(sx, B - 40, 64, 6);
          g!.fillRect(sx, B - 74, 5, 82);
          g!.fillRect(sx + 59, B - 74, 5, 82);
          g!.fillStyle = s % 2 ? back : near;
          g!.fillRect(sx + 10, B - 68, 20, 26);
          g!.fillRect(sx + 36, B - 34, 20, 26);
        }
      }
    }
    g!.restore();
  }

  function drawBackground(m: GameMap) {
    const p = m.palette;

    // Lớp trời: có ảnh vẽ tay thì kéo phủ khung (nó đứng yên theo camera),
    // chưa có thì dốc màu nhạt dần về chân trời cộng mấy mảng mây trôi chậm.
    const skyImg = ASSETS.bgSky ? img(`bg/m${lv + 1}-sky.png`) : null;
    if (skyImg) {
      g!.drawImage(skyImg, 0, 0, W, H);
    } else {
      const sky = g!.createLinearGradient(0, 0, 0, GY);
      sky.addColorStop(0, mix(p.sky, "#0a0a0a", 0.12));
      sky.addColorStop(0.72, p.sky);
      sky.addColorStop(1, mix(p.sky, "#ffffff", 0.42));
      g!.fillStyle = sky;
      g!.fillRect(0, 0, W, H);

      // Mây chỉ là mảng mờ, không tranh nhìn với quái
      g!.fillStyle = "rgba(255,255,255,.3)";
      for (let i = 0; i < 5; i++) {
        const cw = 150 + i * 34;
        const x = i * 210 - wrap(cam * 0.08 + i * 60, W + cw) + 40;
        const y = 40 + ((i * 47) % 90);
        g!.beginPath();
        g!.ellipse(x, y, cw * 0.5, 15 + (i % 3) * 5, 0, 0, Math.PI * 2);
        g!.ellipse(x + cw * 0.22, y - 9, cw * 0.3, 12 + (i % 2) * 5, 0, 0, Math.PI * 2);
        g!.fill();
      }
    }

    const far = ASSETS.bgFar ? img(`bg/m${lv + 1}-far.png`) : null;
    if (far) {
      // Chân lớp xa đặt CAO hơn mặt đất 90px, tức nằm khuất sau lớp giữa. Vật
      // ở xa thì phải cao hơn trên màn hình mới ra chiều sâu — mà cũng chỉ có
      // cách đó thì cần cẩu với tàu mới nhô lên khỏi bãi container để nhìn
      // thấy. Đặt chân lớp xa ngay mặt đất là gần như bị lớp giữa che sạch.
      const tileW = FAR_H * (far.naturalWidth / far.naturalHeight);
      drawTiled(g!, far, -wrap(cam * 0.25, tileW), GY - FAR_BOTTOM_UP - FAR_H, W + tileW, FAR_H);
    } else {
      drawFar(m);
    }

    const mid = img(`bg/m${lv + 1}-mid.png`);
    if (mid) {
      // Lớp giữa vẽ bằng ảnh thật, lặp ngang liên tục theo camera
      const tileW = MID_H * (mid.naturalWidth / mid.naturalHeight);
      drawTiled(g!, mid, -wrap(cam * 0.55, tileW), GY - MID_H, W + tileW, MID_H);
    }

    // Đất: dốc màu nhẹ cho có khối, thêm vạch kẻ chạy theo camera cho thấy đang di chuyển
    const gr = g!.createLinearGradient(0, GY, 0, H);
    gr.addColorStop(0, p.ground);
    gr.addColorStop(1, mix(p.ground, "#0a0a0a", 0.3));
    g!.fillStyle = gr;
    g!.fillRect(0, GY, W, H - GY);
    g!.fillStyle = p.groundEdge;
    g!.fillRect(0, GY, W, 7);
    // Vạch kẻ chạy theo camera. Từ lúc có nền vẽ tay thì chuyển động đã đọc
    // được qua parallax, nên vạch chỉ còn là gợi ý rất mờ.
    g!.fillStyle = "rgba(255,255,255,.04)";
    for (let i = 0; i < 12; i++) {
      const x = i * 80 - wrap(cam, 80);
      g!.fillRect(x, GY + 16, 44, 3);
    }
    const ground = img(SCENE_SPRITES.ground);
    if (ground) {
      const tileW = (H - GY) * ground.naturalWidth / ground.naturalHeight;
      drawTiled(g!, ground, -wrap(cam, tileW), GY, W + tileW, H - GY);
    }
  }

  /* ── vẽ: thực thể ────────────────────────────────────── */

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

  /** Bóng mềm dưới chân — thứ rẻ nhất để nhân vật không như dán lên nền */
  function drawShadow(cx: number, floorY: number, w: number, alpha = 0.28) {
    g!.fillStyle = `rgba(10,10,10,${alpha})`;
    g!.beginPath();
    g!.ellipse(cx, floorY - 1, w / 2, w / 7, 0, 0, Math.PI * 2);
    g!.fill();
  }

  /**
   * Khung nào đang cần cho quái. walker/flyer đảo khung theo nhịp bước,
   * charger đứng khung 1 tới lúc lao (dash>0) mới sang khung 2, shooter sang
   * khung 2 ngay trước khi bắn — đúng lúc code đang tô đỏ nòng. Có nhiều hơn
   * hai khung thì chạy vòng đủ số khung khai báo trong ASSETS.mobFrames.
   */
  function mobFrame(o: Mob): number {
    const n = mobFrameCount(o.kind);
    const cycle = (count: number, fps: number) =>
      (Math.floor(o.anim * fps) % Math.max(1, count)) + 1;

    if (o.kind === "walker") return cycle(n, 6);
    if (o.kind === "flyer") return cycle(n, 8);

    if (o.kind === "charger" || o.kind === "rider") {
      // Có 4 khung thì tách được: đứng nhấp nhô (1–2), rùng mình (3), lao (4)
      if (n >= 4) return o.dash > 0 ? 4 : o.tel > 0 ? 3 : cycle(2, 3);
      return o.dash > 0 || o.tel > 0 ? Math.min(2, n) : 1;
    }

    // shooter: đứng (1–2), nhắm (3), vừa nhả đạn (4)
    if (n >= 4) return o.recoil > 0.55 ? 4 : o.cd < 0.4 ? 3 : cycle(2, 3);
    return o.cd < 0.4 || o.recoil > 0 ? Math.min(2, n) : 1;
  }

  /**
   * Rider vẽ bằng code khi chưa có ảnh: bóng người gập trên xe, áo cam
   * Shopee, mũ bảo hiểm không mặt — chỉ một vạch kính sáng. Đủ để chơi và
   * đủ để biết nó là ai; có ảnh vẽ tay thì thay ngay bằng ASSETS.riderArt.
   */
  function drawRiderShape(o: Mob) {
    const cx = o.x + o.w / 2;
    const floor = o.y + o.h;
    const f = o.dir;
    const charging = o.tel > 0;
    const dashing = o.dash > 0;
    const ORANGE = "#EE4D2D";

    g!.save();
    g!.translate(cx, floor);
    g!.scale(f, 1);
    if (dashing) g!.scale(1.1, 0.94);

    // vệt gió khi đang lao
    if (dashing) {
      g!.strokeStyle = "rgba(255,255,255,.55)";
      g!.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const y = -8 - i * 7;
        g!.beginPath();
        g!.moveTo(-24 - i * 9, y);
        g!.lineTo(-52 - i * 13, y);
        g!.stroke();
      }
    }

    // bánh xe
    g!.fillStyle = "#141414";
    g!.beginPath();
    g!.arc(-15, -7, 7.5, 0, Math.PI * 2);
    g!.arc(16, -7, 7.5, 0, Math.PI * 2);
    g!.fill();
    g!.strokeStyle = "rgba(255,255,255,.3)";
    g!.lineWidth = 1.4;
    g!.beginPath();
    g!.arc(-15, -7, 3.4, 0, Math.PI * 2);
    g!.arc(16, -7, 3.4, 0, Math.PI * 2);
    g!.stroke();

    // thân xe và thùng hàng sau yên
    g!.fillStyle = "#2A2A28";
    g!.beginPath();
    g!.roundRect(-19, -18, 38, 9, 3);
    g!.fill();
    g!.fillStyle = ORANGE;
    g!.beginPath();
    g!.roundRect(-25, -30, 15, 13, 2);
    g!.fill();
    g!.fillStyle = "rgba(10,10,10,.35)";
    g!.fillRect(-24, -25, 13, 2);

    // đèn pha, sáng bùng lúc rú ga
    const beam = charging ? 0.9 : 0.45;
    g!.fillStyle = `rgba(255,236,170,${beam})`;
    g!.beginPath();
    g!.arc(22, -20, charging ? 5 : 3.6, 0, Math.PI * 2);
    g!.fill();
    if (charging) {
      g!.fillStyle = "rgba(255,236,170,.22)";
      g!.beginPath();
      g!.moveTo(24, -20);
      g!.lineTo(74, -32);
      g!.lineTo(74, -6);
      g!.closePath();
      g!.fill();
    }

    // người: gập về trước, áo cam, tay với tới ghi đông
    g!.fillStyle = ORANGE;
    g!.beginPath();
    g!.moveTo(-12, -22);
    g!.lineTo(-2, -44);
    g!.lineTo(10, -40);
    g!.lineTo(6, -20);
    g!.closePath();
    g!.fill();
    g!.strokeStyle = ORANGE;
    g!.lineWidth = 4;
    g!.lineCap = "round";
    g!.beginPath();
    g!.moveTo(6, -38);
    g!.lineTo(19, -26);
    g!.stroke();
    g!.strokeStyle = "#1E1E1C";
    g!.beginPath();
    g!.moveTo(-8, -24);
    g!.lineTo(-4, -14);
    g!.stroke();

    // mũ bảo hiểm không mặt — khối tối, một vạch kính
    g!.fillStyle = "#17171A";
    g!.beginPath();
    g!.arc(3, -48, 9, 0, Math.PI * 2);
    g!.fill();
    g!.fillStyle = "rgba(10,10,10,.95)";
    g!.beginPath();
    g!.roundRect(2, -52, 11, 7, 2);
    g!.fill();
    g!.fillStyle = charging ? "rgba(255,120,80,.95)" : "rgba(180,200,220,.75)";
    g!.fillRect(4, -50, 8, 1.8);
    g!.restore();
  }

  function drawMob(o: Mob, color: string) {
    // Hoạt ảnh chung: nhún theo bước, nghiêng theo hướng, giãn khi lao
    let sx = 1;
    let sy = 1;
    let rot = 0;
    let dy = 0;

    if (!reduced) {
      if (o.kind === "walker") {
        const ph = o.anim * 6 * Math.PI;
        dy = -Math.abs(Math.sin(ph)) * 2.2;
        sy = 1 + Math.sin(ph) * 0.05;
        sx = 1 - Math.sin(ph) * 0.04;
        rot = o.dir * 0.05;
      } else if (o.kind === "flyer") {
        // Vỗ cánh: bóp ngang thay vì đảo khung, cánh trông có nhịp hơn
        const ph = o.anim * 12;
        sx = 1 + Math.sin(ph) * 0.1;
        sy = 1 - Math.sin(ph) * 0.06;
        rot = Math.sin(ph * 0.34) * 0.06;
      } else if (o.kind === "charger" || o.kind === "rider") {
        if (o.tel > 0) {
          const t = o.tel * 40;
          dy = Math.sin(t) * 1.4;
          sx = 1 + Math.sin(t * 1.3) * 0.06;
          sy = 1 - Math.sin(t * 1.3) * 0.05;
        } else if (o.dash > 0) {
          sx = 1.16;
          sy = 0.9;
        }
      } else if (o.kind === "shooter") {
        sx = 1 + o.recoil * 0.1;
        sy = 1 - o.recoil * 0.08;
      }
    }

    const cx = o.x + o.w / 2 - (o.kind === "shooter" ? o.dir * o.recoil * 5 : 0);
    const floor = o.y + o.h + 3;
    const deadFade = o.dead ? Math.max(0, 1 - o.deadT / 0.45) : 1;
    if (o.dead) {
      // Tan biến: xoay, teo lại, mờ dần. Bản trước quái biến mất đột ngột.
      const t = 1 - deadFade;
      rot += t * 1.4 * o.dir;
      sx *= 1 - t * 0.5;
      sy *= 1 - t * 0.5;
      dy -= t * 22;
    }

    if (o.kind !== "flyer" && !o.dead) drawShadow(o.x + o.w / 2, o.floor, o.w * 1.3, 0.22);

    const useArt = o.kind !== "rider" || ASSETS.riderArt;
    const frame = mobFrame(o);
    const sprite = useArt ? mobSprite(lv, o.kind, frame) : null;
    if (sprite) {
      const metrics = (mobSpriteMetrics as Record<string, {width:number;height:number;frames:Record<string,{x:number;y:number}>}>)[`m${lv + 1}-${o.kind}`];
      const anchor = metrics?.frames[String(frame)];
      const rig = anchor ? {unit:metrics.height / 512, ax:anchor.x / 512, ay:anchor.y / 512} : mobRig(o.kind);
      drawRig(g!, sprite, rig, mobRef(o.kind), cx, floor + dy, {
        flip: o.dir < 0,
        rot, sx, sy,
        alpha: deadFade,
        filter: o.hurt > 0 ? "brightness(2.2) saturate(0.3)" : undefined,
      });
      // Báo đòn: viền sáng nhấp nháy quanh con quái sắp lao
      if (o.tel > 0 && Math.floor(o.tel * 18) % 2 === 0) {
        const ring = img(SCENE_SPRITES.ring);
        if (ring) drawFit(g!, ring, cx, floor + 7, 60, 18);
      }
      return;
    }

    if (o.kind === "rider") {
      g!.save();
      g!.globalAlpha = deadFade;
      if (o.hurt > 0) g!.filter = "brightness(2.4) saturate(0.2)";
      drawRiderShape(o);
      g!.restore();
      return;
    }

    // Dự phòng hình khối, chỉ chạy khi ảnh chưa tải xong
    const body = o.hurt > 0 ? "#ffffff" : color;
    g!.save();
    g!.globalAlpha = deadFade;

    if (o.kind === "flyer") {
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
    g!.roundRect(o.x, o.y + dy, o.w, o.h, o.kind === "charger" ? 4 : 9);
    g!.fill();

    if (o.kind === "charger") {
      g!.fillStyle = o.dash > 0 || o.tel > 0 ? HAZARD : body;
      g!.beginPath();
      const tip = o.dir > 0 ? o.x + o.w + 11 : o.x - 11;
      g!.moveTo(o.dir > 0 ? o.x + o.w : o.x, o.y + 6);
      g!.lineTo(tip, o.y + o.h / 2);
      g!.lineTo(o.dir > 0 ? o.x + o.w : o.x, o.y + o.h - 6);
      g!.fill();
    }
    if (o.kind === "shooter") {
      g!.fillStyle = o.cd < 0.4 ? HAZARD : "rgba(10,10,10,.55)";
      g!.fillRect(o.dir > 0 ? o.x + o.w : o.x - 10, o.y + o.h * 0.42, 10, 6);
    }

    drawFace(o.x, o.y + dy, o.w, o.h);
    g!.restore();
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
    const cycle = t.t % 2.6;
    const on = cycle < 1.1;
    // Nửa giây trước khi phun thì miệng vòi rung và nhả khói — báo trước
    const warn = cycle > 2.1;
    const jet = img(TRAP_SPRITES.pulseJet);
    const vent = img(TRAP_SPRITES.pulseVent);
    if (jet && vent) {
      if (on) {
        // Luồng vọt lên nhanh rồi giữ: cắt bớt chiều cao ở đầu chu kỳ
        const rise = Math.min(1, cycle / 0.12);
        const h = 74 * rise;
        g!.drawImage(jet, 0, 0, jet.naturalWidth, jet.naturalHeight, t.x, t.y - h, 26, h);
      }
      g!.drawImage(vent, t.x - 2 + (warn ? Math.sin(t.t * 60) * 1.2 : 0), t.y - 8, 30, 8);
      if (warn) {
        g!.fillStyle = "rgba(255,255,255,.35)";
        g!.beginPath();
        g!.arc(t.x + 13, t.y - 12 - Math.sin(t.t * 6) * 4, 4, 0, Math.PI * 2);
        g!.fill();
      }
      return;
    }
    g!.fillStyle = on ? HAZARD : "rgba(10,10,10,.35)";
    if (on) g!.fillRect(t.x, t.y - 74, 26, 74);
    g!.fillRect(t.x - 2, t.y - 8, 30, 8);
  }

  /** Màu nhận dạng của ba loại vật phẩm — học một lần là nhìn xa biết ngay */
  const PICKUP_TINT = {
    heal: { glow: "rgba(255,143,133,", body: "#ff8f85", label: "#ffd2ce" },
    tool: { glow: "rgba(212,242,54,", body: LIME, label: LIME },
    gun: { glow: "rgba(159,216,255,", body: "#9fd8ff", label: "#c8e9ff" },
  } as const;

  function drawPickup(p: Pickup) {
    const y = p.y - 26 + Math.sin(p.bob) * 3;
    const tint = PICKUP_TINT[p.kind];
    const glow = tint.glow;

    // Vòng sáng dưới vật phẩm để nó nổi khỏi nền, kể cả nền sáng
    const pulse = 0.5 + Math.sin(p.bob * 1.4) * 0.5;
    g!.fillStyle = `${glow}${0.1 + pulse * 0.12})`;
    g!.beginPath();
    g!.ellipse(p.x + 12, p.y - 12, 20, 8, 0, 0, Math.PI * 2);
    g!.fill();

    const sprite = pickupSprite(lv, p.kind);
    if (sprite) {
      g!.save();
      g!.shadowColor = `${glow}.85)`;
      g!.shadowBlur = 11;
      drawFit(g!, sprite, p.x + 12, y + 28, 36, 36);
      g!.restore();
      drawLabel(p.name, p.x + 12, y - 8, tint.label);
      return;
    }
    if (p.kind === "gun") {
      // Khẩu súng quét vẽ bằng code: thân ngang, tay cầm chúc xuống, đầu nòng
      // sáng nhấp nháy. Chưa có ảnh nhưng vẫn phải đọc ra là "cái súng".
      g!.save();
      g!.translate(p.x + 12, y + 12);
      g!.fillStyle = tint.body;
      g!.beginPath();
      g!.roundRect(-13, -6, 22, 9, 3);
      g!.fill();
      g!.beginPath();
      g!.roundRect(-9, 1, 7, 11, 3);
      g!.fill();
      g!.fillStyle = "#0a0a0a";
      g!.fillRect(-9, -4, 12, 3);
      g!.fillStyle = "#f2ffc4";
      g!.globalAlpha = 0.5 + Math.sin(p.bob * 2.2) * 0.5;
      g!.beginPath();
      g!.roundRect(9, -4.5, 5, 6, 2);
      g!.fill();
      g!.restore();
      drawLabel(p.name, p.x + 12, y - 6, tint.label);
      return;
    }
    g!.fillStyle = tint.body;
    g!.beginPath();
    g!.roundRect(p.x, y, 24, 24, 6);
    g!.fill();
    g!.fillStyle = "#0a0a0a";
    if (p.kind === "tool") {
      g!.fillRect(p.x + 7, y + 6, 4, 12);
      g!.fillRect(p.x + 13, y + 6, 4, 12);
      g!.fillRect(p.x + 7, y + 16, 10, 3);
    } else {
      g!.fillRect(p.x + 10, y + 6, 4, 12);
      g!.fillRect(p.x + 6, y + 10, 12, 4);
    }
    drawLabel(p.name, p.x + 12, y - 6, tint.label);
  }

  /**
   * Vệt chém hình lưỡi liềm.
   *
   * Không stroke một cung tròn — cung tròn stroke ra dải dày đều, trông như
   * cái vòng. Ở đây dựng path hai mép: mép ngoài phình ở giữa, mép trong
   * lõm vào, nên hai đầu nhọn lại đúng kiểu lưỡi trăng.
   */
  function crescentPath(
    cx: number, cy: number, r: number,
    a0: number, a1: number, thick: number,
  ) {
    const steps = 20;
    g!.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const a = a0 + (a1 - a0) * t;
      const rr = r + Math.sin(t * Math.PI) * thick * 0.55;
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      if (i) g!.lineTo(x, y); else g!.moveTo(x, y);
    }
    for (let i = steps; i >= 0; i--) {
      const t = i / steps;
      const a = a0 + (a1 - a0) * t;
      const rr = r - Math.sin(t * Math.PI) * thick * 0.45;
      g!.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    g!.closePath();
  }

  function drawSlash(s: Slash) {
    const p = Math.min(1, s.t / s.dur);
    const e = easeOut(p);
    // Lưỡi quét từ trên chéo xuống trước mặt. Đuôi vệt bị kẹp không cho lùi
    // quá A0 — nếu không, đầu đòn sẽ có một cung quét ngược ra sau đầu.
    const A0 = -1.3;
    const A1 = 1.15;
    const span = 1.45;
    const face = s.face;
    const ang = (a: number) => (face > 0 ? a : Math.PI - a);
    const head = A0 + (A1 - A0) * e;

    const sprite = ASSETS.slashFx
      ? img(`fx/slash-${Math.min(ASSETS.slashFx, 1 + Math.floor(p * ASSETS.slashFx))}.png`)
      : null;
    if (sprite) {
      /**
       * Ảnh vệt chém phải neo ở TÂM CUNG, không phải mép ảnh. Lưỡi liềm trong
       * ảnh cong quanh một tâm nằm khoảng 27% chiều rộng tính từ mép trái và
       * 48% chiều cao — neo vào đó thì cung quét quanh ngực nhân vật; neo vào
       * mép ảnh thì cả vệt văng lên góc trên bên phải, cách người cả thân.
       * Ba số dưới đây dò bằng cách ghép thử ảnh với khung chém rồi soi.
       */
      const size = s.reach * 1.55;
      g!.save();
      g!.globalAlpha = Math.max(0, 1 - p * p);
      g!.translate(s.x, s.y);
      g!.scale(face, 1);
      g!.rotate(head * 0.5);
      g!.drawImage(sprite, -size * 0.27, -size * 0.48, size, size);
      g!.restore();
      return;
    }

    g!.save();
    // "lighter" để ba lớp cộng sáng vào nhau chứ không đè chết lớp dưới
    g!.globalCompositeOperation = "lighter";
    // Ba lớp: hai bóng mờ tụt lại phía sau làm đuôi, lớp cuối là thân lưỡi
    for (let i = 2; i >= 0; i--) {
      const t = e - i * 0.16;
      if (t <= 0) continue;
      const head2 = A0 + (A1 - A0) * t;
      const tail = Math.max(A0, head2 - span);
      if (head2 - tail < 0.12) continue;
      const alpha = (1 - p) * (i === 0 ? 0.95 : i === 1 ? 0.4 : 0.18);
      crescentPath(
        s.x, s.y,
        s.reach * (1 - i * 0.06),
        ang(tail), ang(head2),
        s.thick * (1 - i * 0.18),
      );
      g!.globalAlpha = alpha;
      g!.fillStyle = s.color;
      g!.fill();
      g!.globalAlpha = 1;
    }
    // Mép dẫn: một nét trắng mảnh ở đầu lưỡi, đây là thứ làm nó "sắc"
    g!.globalAlpha = (1 - p) * 0.9;
    g!.strokeStyle = "#ffffff";
    g!.lineWidth = s.heavy ? 3 : 2;
    g!.lineCap = "round";
    g!.beginPath();
    const hr = s.reach;
    g!.arc(s.x, s.y, hr + s.thick * 0.25, ang(head) - 0.28 * face, ang(head) + 0.05 * face, face < 0);
    g!.stroke();
    g!.restore();
  }

  /** Khung hình và biến dạng của nhân vật ở trạng thái hiện tại */
  function playerFrame(): { src: string; rot: number; sx: number; sy: number; dy: number } {
    let src: string;
    let rot = 0;
    let sx = 1;
    let sy = 1;
    let dy = 0;

    if (player.hurtT > 0) {
      src = P_HURT;
      rot = -player.face * 0.12;
    } else if (player.breakT > 0) {
      // Vỡ đỡ: dùng lại khung trúng đòn, người ngả ra sau và run nhẹ
      src = P_HURT;
      rot = -player.face * 0.22;
      dy = 1;
    } else if (player.guarding) {
      // Chưa có khung đỡ riêng: lấy khung đứng, hạ thấp và nghiêng người vào
      // đòn. Cái khiên vẽ bằng code ở drawPlayer mới là thứ đọc ra "đang đỡ".
      src = P_IDLE[0];
      rot = player.face * 0.1;
      sy = 0.95;
      sx = 1.04;
      dy = 1.5;
    } else if (player.shootT > 0) {
      // Bắn: mượn khung vung tay của đòn chém, giữ nguyên tư thế suốt phát bắn
      src = P_ATK[Math.min(P_ATK.length - 1, 1)];
      const kick = player.shootT / 0.2;
      rot = -player.face * kick * 0.06;
      sx = 1 + kick * 0.02;
    } else if (player.atk > 0) {
      // Chia đòn theo tiến độ: vung → tới đích → thu về
      const p = 1 - player.atk / player.atkDur;
      const i = Math.min(P_ATK.length - 1, Math.floor(p * P_ATK.length));
      src = P_ATK[i];
      // Rướn người theo đòn rồi kéo về, không đứng im vẽ hai khung
      const lunge = Math.sin(Math.min(1, p * 1.4) * Math.PI);
      sx = 1 + lunge * 0.05;
      sy = 1 - lunge * 0.04;
      rot = player.face * lunge * 0.07;
    } else if (player.landT > 0) {
      src = P_LAND;
      const t = player.landT / 0.16;
      sx = 1 + t * 0.14;
      sy = 1 - t * 0.16;
    } else if (!player.ground) {
      const rising = player.vy < -40;
      src = rising ? P_RISE : P_FALL;
      // Vươn lên khi bốc, hơi bẹp lại khi rơi nhanh
      const v = Math.max(-1, Math.min(1, player.vy / 600));
      sy = 1 - v * 0.07;
      sx = 1 + v * 0.05;
      rot = player.face * 0.04 * (rising ? -1 : 1);
    } else if (Math.abs(player.vx) > 8) {
      const i = Math.floor(player.runPhase * P_RUN.length) % P_RUN.length;
      src = P_RUN[i];
      /**
       * Nhún người: một lần lên xuống mỗi sải chân, tức hai lần mỗi chu kỳ.
       *
       * Chu kỳ 8 khung xếp theo docs/game-assets.md: 1 chạm đất, 2 hạ thấp
       * nhất, 3 qua chân, 4 bốc cao nhất, rồi 5–8 lặp lại với chân kia. Nên
       * đỉnh nhún nằm ở giữa khung 4 (pha 0,4375) và giữa khung 8 (0,9375);
       * cos chu kỳ 0,5 lệch pha 0,4375 cho đúng hai mốc đó.
       *
       * Ảnh đã được canh về cùng một mặt sàn (normalize --fit none), nên toàn
       * bộ chuyển động dọc phải do code sinh ra. Công thức cũ dùng |sin| tần
       * số đôi nên nhún bốn lần mỗi chu kỳ — nhìn như đạp xe.
       */
      const bounce = Math.cos(4 * Math.PI * (player.runPhase - 0.4375));
      dy = -bounce * 2.1;
      sy = 1 + bounce * 0.03;
      sx = 1 - bounce * 0.025;
      rot = player.face * 0.045 * Math.min(1, Math.abs(player.vx) / 300);
    } else {
      const i = Math.floor(worldTime * 3) % P_IDLE.length;
      src = P_IDLE[i];
      // Thở: chỉ 1% nhưng đứng yên mà không có nó là thấy ngay
      sy = 1 + Math.sin(worldTime * 3.2) * 0.012;
      dy = Math.sin(worldTime * 3.2) * 0.8;
    }

    if (reduced) return { src, rot: 0, sx: 1, sy: 1, dy: 0 };
    return { src, rot, sx, sy, dy };
  }

  function drawPlayer() {
    const frame = playerFrame();
    const sprite = img(frame.src) ?? img(P_IDLE[0]);
    const cx = player.x + player.w / 2;
    const feet = player.y + player.h + 3;

    drawShadow(cx, Math.min(GY, player.y + player.h), player.w * 1.5, player.ground ? 0.3 : 0.16);

    if (sprite) {
      drawRig(g!, sprite, playerRig(), HEAD_PX, cx, feet + frame.dy, {
        flip: player.face < 0,
        rot: frame.rot,
        sx: frame.sx,
        sy: frame.sy,
        filter: player.hurtT > 0 ? "brightness(1.5) saturate(.6)" : undefined,
      });
    } else {
      // Dự phòng hình khối, chỉ thấy trong vài khung hình đầu lúc tải ảnh
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
      // Đang cầm đồ nghề: hào quang mờ quanh người, nhạt dần lúc gần hết giờ
      const left = Math.min(1, player.tool / 2);
      g!.save();
      g!.globalAlpha = left * (0.75 + 0.15 * Math.sin(worldTime * 9));
      const aura = img(SCENE_SPRITES.aura);
      if (aura) drawFit(g!, aura, player.x + player.w / 2, player.y + player.h + 5, 78, 110);
      g!.restore();
    }

    // Khẩu súng trong tay: chỉ vẽ khi còn đạn, và giấu đi lúc đang chém hoặc
    // đang đỡ — hai tay đang bận việc khác thì cầm súng nhìn rất sai.
    if (player.ammo > 0 && player.atk <= 0 && !player.guarding && player.breakT <= 0) {
      const gx = cx + player.face * (player.shootT > 0 ? 16 : 11);
      const gy = player.y + (player.shootT > 0 ? 17 : 21);
      g!.save();
      g!.translate(gx, gy);
      g!.scale(player.face, 1);
      g!.fillStyle = "#3f4a55";
      g!.beginPath();
      g!.roundRect(-6, -3, 17, 6, 2);
      g!.fill();
      g!.fillStyle = "#9fd8ff";
      g!.fillRect(-2, -2, 8, 2);
      g!.fillStyle = "#2b333c";
      g!.beginPath();
      g!.roundRect(-5, 2, 5, 7, 2);
      g!.fill();
      if (player.shootT > 0) {
        // Chớp đầu nòng, to nhất ở khung đầu rồi tắt nhanh
        const k = player.shootT / 0.2;
        g!.globalAlpha = k;
        g!.fillStyle = "#f2ffc4";
        g!.beginPath();
        g!.ellipse(13 + k * 3, 0, 5 + k * 7, 3 + k * 4, 0, 0, Math.PI * 2);
        g!.fill();
      }
      g!.restore();
    }

    // Khiên đỡ: một cung sáng trước mặt. Nhạt dần theo thể lực còn lại, nên
    // nhìn cái khiên là biết còn giữ được bao lâu, không phải liếc lên HUD.
    if (player.guarding) {
      const t = Math.max(0.15, player.stam);
      const parry = player.guardT <= PARRY_WINDOW;
      const sx0 = cx + player.face * 12;
      const sy0 = player.y + 18;
      g!.save();
      g!.translate(sx0, sy0);
      g!.scale(player.face, 1);
      g!.strokeStyle = parry ? LIME : `rgba(159,216,255,${0.35 + t * 0.5})`;
      g!.lineWidth = parry ? 5 : 3;
      g!.beginPath();
      g!.arc(0, 0, 20, -1.15, 1.15);
      g!.stroke();
      g!.globalAlpha = parry ? 0.3 : 0.12 + t * 0.1;
      g!.fillStyle = parry ? LIME : "#9fd8ff";
      g!.beginPath();
      g!.arc(0, 0, 20, -1.15, 1.15);
      g!.lineTo(0, 0);
      g!.closePath();
      g!.fill();
      g!.restore();
    }
  }

  /* ── vẽ: khung hình ──────────────────────────────────── */

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

    // Bệ nhảy: thân tối, mép trên sáng — cố ý KHÔNG lấy màu theo bảng màu ải.
    // Nền vẽ tay chi tiết và nhiều màu, bệ tô theo palette là chìm nghỉm vào
    // tranh; mà đây là thứ người chơi phải nhìn ra trong một phần giây để
    // quyết định có nhảy hay không.
    for (const [px, py, pw] of m.plats) {
      const platform = img(SCENE_SPRITES.platform);
      if (platform) {
        const cap = 12, srcCap = platform.naturalHeight * 0.65;
        g!.drawImage(platform, 0, 0, srcCap, platform.naturalHeight, px, py, cap, 16);
        g!.drawImage(platform, srcCap, 0, platform.naturalWidth - srcCap * 2, platform.naturalHeight, px + cap, py, pw - cap * 2, 16);
        g!.drawImage(platform, platform.naturalWidth - srcCap, 0, srcCap, platform.naturalHeight, px + pw - cap, py, cap, 16);
        continue;
      }
      g!.fillStyle = "rgba(16,16,20,.88)";
      g!.beginPath();
      g!.roundRect(px, py, pw, 13, 5);
      g!.fill();
      g!.fillStyle = "rgba(242,241,236,.82)";
      g!.beginPath();
      g!.roundRect(px + 2, py + 1.5, pw - 4, 3.5, 2);
      g!.fill();
      g!.fillStyle = "rgba(242,241,236,.16)";
      g!.fillRect(px + 4, py + 6, pw - 8, 1);
      // Bóng đổ mỏng dưới bệ cho nó tách khỏi nền, đỡ như dán decal
      g!.fillStyle = "rgba(10,10,10,.3)";
      g!.fillRect(px + 3, py + 13, pw - 6, 4);
    }

    for (const t of traps) drawTrap(t);
    for (const p of pickups) if (!p.taken) drawPickup(p);

    // Cửa ải ở cuối bản đồ, sáng lên khi đã hạ hết quái thường
    const opened = !mobs.some((o) => !o.dead);
    const gate = img(SCENE_SPRITES.gate);
    if (gate) {
      g!.save();
      g!.filter = opened ? "brightness(1.2)" : "saturate(.55)";
      drawFit(g!, gate, WORLD - 47, GY + 3, 66, 108);
      g!.restore();
    } else {
    g!.fillStyle = opened ? "rgba(212,242,54,.5)" : "rgba(255,255,255,.5)";
    g!.fillRect(WORLD - 70, GY - 96, 46, 96);
    g!.fillStyle = m.palette.groundEdge;
    g!.fillRect(WORLD - 64, GY - 88, 34, 88);
    if (opened) {
      g!.globalAlpha = 0.35 + Math.sin(worldTime * 4) * 0.2;
      g!.fillStyle = LIME;
      g!.fillRect(WORLD - 64, GY - 88, 34, 88);
      g!.globalAlpha = 1;
    }
    }

    for (const o of mobs) {
      if (o.dead && o.deadT > 0.45) continue;
      drawMob(o, m.palette.mob);
      // Rider vẽ cao hơn hộp thân nên nhãn phải nhấc lên, không thì đè lên mũ
      if (!o.dead) drawLabel(o.name, o.x + o.w / 2, o.y - (o.kind === "rider" ? 22 : 7));
    }

    if (boss) {
      const by = boss.y + Math.sin(boss.bob) * 2;
      // Trong 0,55s trước đòn, dùng khung "báo đòn" riêng thay vì tô màu đè
      const telegraphing = boss.tel > 0 && Math.floor(boss.tel * 14) % 2 === 0;
      const hitFrame = boss.hurt > 0 && ASSETS.bossFrames >= 3;
      const sprite = bossSprite(lv, hitFrame ? "hit" : telegraphing ? "tel" : "idle");
      drawShadow(boss.x + boss.w / 2, GY, boss.w * 1.5, 0.3);

      // Vòng báo đòn dưới chân trùm — đọc được kể cả khi mắt đang dán vào nhân vật
      if (boss.tel > 0) {
        const t = 1 - boss.tel / 0.6;
        g!.strokeStyle = HAZARD;
        g!.lineWidth = 3;
        g!.globalAlpha = 0.8 * (1 - t * 0.4);
        g!.beginPath();
        g!.ellipse(boss.x + boss.w / 2, GY - 4, 50 + t * 40, 14 + t * 10, 0, 0, Math.PI * 2);
        g!.stroke();
        g!.globalAlpha = 1;
      }

      const telScale = boss.tel > 0 ? 1 + (1 - boss.tel / 0.6) * 0.06 : 1;
      if (sprite) {
        drawRig(g!, sprite, bossRig(), BOSS_PX, boss.x + boss.w / 2, by + boss.h + 2, {
          flip: boss.dir < 0,
          sx: boss.dash > 0 ? 1.1 : telScale,
          sy: boss.dash > 0 ? 0.93 : telScale,
          filter: boss.hurt > 0 && !hitFrame ? "brightness(2) saturate(0.3)" : undefined,
        });
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

    // Đạn: nhân lõi sáng, đuôi mờ kéo lại phía sau
    for (const s of shots) {
      const shot = img(SCENE_SPRITES.shot);
      if (shot) {
        g!.save();
        g!.translate(s.x, s.y);
        g!.rotate(Math.atan2(s.vy, s.vx));
        drawFit(g!, shot, 0, 10, 34, 20);
        g!.restore();
        continue;
      }
      const len = Math.min(26, Math.abs(s.vx) * 5);
      const grad = g!.createLinearGradient(s.x - Math.sign(s.vx) * len, s.y, s.x, s.y);
      grad.addColorStop(0, "rgba(224,86,63,0)");
      grad.addColorStop(1, HAZARD);
      g!.fillStyle = grad;
      g!.beginPath();
      g!.moveTo(s.x - Math.sign(s.vx) * len, s.y - s.r * 0.35);
      g!.lineTo(s.x, s.y - s.r * 0.9);
      g!.lineTo(s.x, s.y + s.r * 0.9);
      g!.lineTo(s.x - Math.sign(s.vx) * len, s.y + s.r * 0.35);
      g!.closePath();
      g!.fill();
      g!.fillStyle = HAZARD;
      g!.beginPath();
      g!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      g!.fill();
      g!.fillStyle = "rgba(255,255,255,.75)";
      g!.beginPath();
      g!.arc(s.x - Math.sign(s.vx) * 2, s.y - 2, s.r * 0.38, 0, Math.PI * 2);
      g!.fill();
    }

    // Tia súng quét: lõi trắng, đuôi xanh kéo dài theo hướng bay. Cố ý khác
    // hẳn màu đạn của quái (đỏ) — nhìn một phần giây phải biết đạn của ai.
    for (const b of bullets) {
      const s = Math.sign(b.vx) || 1;
      const grad = g!.createLinearGradient(b.x - s * 30, b.y, b.x, b.y);
      grad.addColorStop(0, "rgba(159,216,255,0)");
      grad.addColorStop(1, "rgba(159,216,255,.9)");
      g!.fillStyle = grad;
      g!.fillRect(b.x - (s > 0 ? 30 : 0), b.y - 2, 30, 4);
      g!.fillStyle = "#f2ffc4";
      g!.beginPath();
      g!.roundRect(b.x - 4, b.y - 2.5, 9, 5, 2.5);
      g!.fill();
    }

    // Nhấp nháy khi đang bất tử sau lúc trúng đòn
    if (player.inv <= 0 || Math.floor(player.inv * 16) % 2 === 0) drawPlayer();
    for (const s of slashes) drawSlash(s);

    for (const p of parts) {
      const t = Math.max(0, p.life / p.max);
      g!.globalAlpha = t;
      const sprite = img(p.kind === "ring" ? SCENE_SPRITES.ring : p.kind === "dust" ? SCENE_SPRITES.dust : SCENE_SPRITES.hit);
      if (sprite) {
        const size = p.kind === "ring" ? (1 - t) * 68 : p.size * (1.4 - t * .5) * 2;
        drawFit(g!, sprite, p.x, p.y + size / 2, size, size);
        continue;
      }
      if (p.kind === "ring") {
        const r = (1 - t) * 34;
        g!.strokeStyle = p.color;
        g!.lineWidth = 3 * t + 0.5;
        g!.beginPath();
        g!.arc(p.x, p.y, r, 0, Math.PI * 2);
        g!.stroke();
      } else if (p.kind === "dust") {
        g!.fillStyle = p.color;
        g!.beginPath();
        g!.arc(p.x, p.y, p.size * (1.4 - t * 0.5), 0, Math.PI * 2);
        g!.fill();
      } else {
        g!.fillStyle = p.color;
        const s = p.size * (0.5 + t * 0.5);
        g!.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }
    }
    g!.globalAlpha = 1;

    const nearImg = ASSETS.bgNear ? img(`bg/m${lv + 1}-near.png`) : null;
    if (nearImg) {
      // Tiền cảnh phủ trước nhân vật, chạy nhanh hơn camera cho có chiều sâu
      g!.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
      const nh = 120;
      const tileW = nh * (nearImg.naturalWidth / nearImg.naturalHeight);
      drawTiled(g!, nearImg, -wrap(cam * 0.9, tileW), H - nh, W + tileW, nh);
    }
    g!.restore();

    drawHud(m);

    if (flash > 0.01) {
      g!.globalAlpha = Math.min(0.5, flash);
      g!.fillStyle = "#ffffff";
      g!.fillRect(0, 0, W, H);
      g!.globalAlpha = 1;
    }
    if (phase === "clear" && fade < 1) {
      g!.globalAlpha = Math.min(0.75, fade);
      g!.fillStyle = "#0a0a0a";
      g!.fillRect(0, 0, W, H);
      g!.globalAlpha = 1;
    }
    if (phase === "paused") {
      // Bảng hướng dẫn do React vẽ ở trên; canvas chỉ tối xuống và đứng hình
      g!.fillStyle = "rgba(10,10,10,.55)";
      g!.fillRect(0, 0, W, H);
    }
    g!.setTransform(1, 0, 0, 1, 0, 0);
  }

  function drawHud(m: GameMap) {
    for (let i = 0; i < player.mhp; i++) {
      const heart = img(SCENE_SPRITES.heart);
      if (heart) {
        g!.save();
        g!.globalAlpha = i < player.hp ? 1 : .25;
        drawFit(g!, heart, 23 + i * 22, 31, 19, 18);
        g!.restore();
        continue;
      }
      g!.fillStyle = i < player.hp ? "#ff6b5e" : "rgba(242,241,236,.22)";
      g!.beginPath();
      g!.roundRect(14 + i * 20, 14, 15, 14, 4);
      g!.fill();
    }
    /**
     * Thanh thể lực đỡ. Luôn hiện, không chỉ hiện lúc đang đỡ: người chơi
     * phải quyết định CÓ NÊN đỡ hay không trước khi bấm, mà muốn quyết định
     * thì phải thấy còn bao nhiêu.
     */
    const stamW = 112;
    g!.fillStyle = "rgba(10,10,10,.45)";
    g!.beginPath();
    g!.roundRect(13, 35, stamW + 2, 7, 3.5);
    g!.fill();
    // Đỏ khi vỡ đỡ, vàng khi sắp cạn, xanh khi còn thoải mái
    g!.fillStyle =
      player.breakT > 0 ? HAZARD : player.stam < GUARD_MIN_TO_RAISE ? "#ffcf5c" : "#9fd8ff";
    g!.beginPath();
    g!.roundRect(14, 36, Math.max(0, stamW * player.stam), 5, 2.5);
    g!.fill();
    if (player.guarding) {
      // Viền sáng lúc đang giơ khiên, để hai thứ trên màn hình nói cùng một chuyện
      g!.strokeStyle = "rgba(242,255,196,.85)";
      g!.lineWidth = 1;
      g!.strokeRect(13.5, 35.5, stamW + 1, 6);
    }

    let hy = 50;
    if (player.tool > 0) {
      const activeTool = pickupSprite(lv, "tool");
      if (activeTool) drawFit(g!, activeTool, 28, hy + 30, 30, 30);
      g!.fillStyle = "rgba(242,241,236,.2)";
      g!.fillRect(48, hy + 9, 95, 6);
      g!.fillStyle = LIME;
      g!.fillRect(48, hy + 9, 95 * (player.tool / TOOL_SECONDS), 6);
      hy += 34;
    }

    if (player.ammo > 0) {
      // Đạn đếm bằng số chứ không bằng vạch: 14 vạch nhỏ thì đếm không kịp
      g!.save();
      g!.translate(22, hy + 8);
      g!.fillStyle = "#9fd8ff";
      g!.beginPath();
      g!.roundRect(-8, -3, 15, 6, 2);
      g!.fill();
      g!.beginPath();
      g!.roundRect(-6, 2, 5, 6, 2);
      g!.fill();
      g!.restore();
      g!.font = `800 13px ${FONT_DISPLAY}`;
      g!.textAlign = "left";
      g!.fillStyle = player.ammo <= 3 ? "#ffcf5c" : "#c8e9ff";
      g!.fillText(`× ${player.ammo}`, 36, hy + 13);
    }

    // Đếm quái còn lại — không có nó thì không biết còn phải dọn bao nhiêu
    if (!boss) {
      const total = mobs.length;
      const left = mobs.filter((o) => !o.dead).length;
      g!.font = `700 13px ${FONT_DISPLAY}`;
      g!.textAlign = "right";
      g!.fillStyle = "rgba(10,10,10,.5)";
      g!.beginPath();
      g!.roundRect(W - 88, 12, 74, 20, 6);
      g!.fill();
      g!.fillStyle = left ? "#f2f1ec" : LIME;
      g!.fillText(`${total - left}/${total}`, W - 22, 27);
      g!.fillStyle = left ? HAZARD : LIME;
      g!.beginPath();
      g!.arc(W - 78, 22, 4, 0, Math.PI * 2);
      g!.fill();
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
      g!.roundRect(bx, 14, bw * Math.max(0, boss.hp / boss.mhp), 14, 4);
      g!.fill();
      const bossbar = img(SCENE_SPRITES.bossbar);
      if (bossbar) g!.drawImage(bossbar, bx - 12, 6, bw + 24, 30);
      g!.font = `600 12px ${FONT_SANS}`;
      g!.textAlign = "center";
      g!.fillStyle = "#f2f1ec";
      g!.fillText(m.boss, W / 2, 45);
    }

    // Combo: chỉ hiện khi đang có chuỗi, nằm ngay cạnh nhân vật
    if (player.comboT > 0 && player.combo > 0) {
      g!.font = `800 14px ${FONT_DISPLAY}`;
      g!.textAlign = "center";
      g!.globalAlpha = Math.min(1, player.comboT * 3);
      g!.fillStyle = LIME;
      g!.fillText(`x${player.combo + 1}`, player.x + player.w / 2 - cam, player.y - 22);
      g!.globalAlpha = 1;
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

    if (phase === "play") {
      g!.font = `500 10px ${FONT_SANS}`;
      g!.textAlign = "right";
      g!.fillStyle = "rgba(242,241,236,.45)";
      g!.fillText(labels.pauseHint, W - 14, H - 12);
    }
  }

  /* ── vòng lặp và input ───────────────────────────────── */

  function frame(t: number) {
    const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;
    if (freeze > 0) {
      // Hit-stop: vẫn vẽ, chỉ không cho thế giới chạy
      freeze -= dt;
    } else {
      accumulator = Math.min(0.1, accumulator + dt);
      const fixedStep = 1 / 120;
      while (accumulator >= fixedStep) {
        step(fixedStep);
        accumulator -= fixedStep;
      }
    }
    draw();
    raf = requestAnimationFrame(frame);
  }

  /**
   * Hàng J K L là bố cục chuẩn của thể loại này: ngón trỏ chém, ngón giữa
   * bắn, ngón áp út đỡ — tay trái vẫn rảnh cho A D và Space.
   */
  const KEYMAP: Record<string, GameKey> = {
    ArrowLeft: "left", KeyA: "left",
    ArrowRight: "right", KeyD: "right",
    ArrowUp: "jump", KeyW: "jump", Space: "jump",
    KeyJ: "atk", KeyZ: "atk",
    KeyK: "shoot", KeyX: "shoot",
    KeyL: "guard", ShiftLeft: "guard", ShiftRight: "guard",
  };

  function press(k: GameKey) {
    keys[k] = true;
    if (k === "jump") {
      // Ghi nhận cú bấm sớm: chạm đất là nhảy luôn, không bị "ăn" mất phím
      player.jumpBuf = 0.12;
      tryJump();
    }
    if (k === "atk") attack();
    if (k === "shoot") shoot();
  }
  function release(k: GameKey) {
    keys[k] = false;
    if (k === "guard") {
      player.guarding = false;
      player.guardT = 0;
    }
  }

  function setPaused(next: boolean, reason: PauseReason = "manual") {
    if (next && phase === "play") {
      phase = "paused";
      pauseWhy = reason;
      // Nhả hết phím, không thì lúc quay lại nhân vật tự chạy
      keys.left = keys.right = keys.jump = keys.atk = keys.shoot = keys.guard = false;
      player.guarding = false;
      player.guardT = 0;
      handlers.onPause?.(true, reason);
    } else if (!next && phase === "paused") {
      phase = "play";
      last = performance.now();
      accumulator = 0;
      handlers.onPause?.(false, pauseWhy);
      pauseWhy = "manual";
    }
  }

  /** Túi đồ đóng vai một kiểu tạm dừng, không phải một trạng thái riêng */
  function toggleInventory() {
    if (phase === "paused" && pauseWhy === "inventory") setPaused(false);
    else if (phase === "play") setPaused(true, "inventory");
  }

  /**
   * e.code là chuẩn (không phụ thuộc layout) nhưng có bàn phím ảo và bộ nhập
   * tiếng Việt không điền trường này. Rơi về e.key để không mất phím.
   */
  const KEY_ALIAS: Record<string, string> = {
    ArrowLeft: "ArrowLeft", ArrowRight: "ArrowRight", ArrowUp: "ArrowUp",
    a: "KeyA", d: "KeyD", w: "KeyW", j: "KeyJ", z: "KeyZ", x: "KeyX", p: "KeyP",
    k: "KeyK", l: "KeyL", b: "KeyB", Shift: "ShiftLeft",
    " ": "Space", Escape: "Escape",
  };
  const codeOf = (e: KeyboardEvent) =>
    e.code || KEY_ALIAS[e.key] || KEY_ALIAS[e.key?.toLowerCase()] || "";

  function onKeyDown(e: KeyboardEvent) {
    const code = codeOf(e);
    if (code === "KeyP" || code === "Escape") {
      if (phase === "play" || phase === "paused") {
        e.preventDefault();
        setPaused(phase === "play");
      }
      return;
    }
    if (code === "KeyB") {
      if (phase === "play" || phase === "paused") {
        e.preventDefault();
        // Đang dừng vì lý do khác thì B đóng bảng đó luôn, không chồng bảng
        if (phase === "paused" && pauseWhy !== "inventory") setPaused(false);
        else toggleInventory();
      }
      return;
    }
    const k = KEYMAP[code];
    if (!k) return;
    e.preventDefault();
    if (phase === "paused") return;
    press(k);
  }
  function onKeyUp(e: KeyboardEvent) {
    const k = KEYMAP[codeOf(e)];
    if (k) release(k);
  }
  function onPointer() {
    if (phase === "play") attack();
  }
  /** Rời tab giữa lúc chơi thì tự dừng, đừng để bị quái ăn máu oan */
  function onBlur() {
    setPaused(true);
  }

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);
  canvas.addEventListener("pointerdown", onPointer);

  // Bắt đầu tải mọi ảnh có thể cần ngay từ lúc dựng game, không chờ tới lúc
  // dùng — img() chỉ tạo phần tử <img> khi được gọi lần đầu, nên nếu để tới
  // lúc nhảy/chạy mới gọi thì khung hình đầu tiên sẽ không có gì để vẽ.
  // Chỉ tải những file ASSETS khai báo là có thật, tránh 404 rác.
  [...P_IDLE, ...P_RUN, ...P_ATK, P_RISE, P_FALL, P_LAND, P_HURT].forEach(img);
  Object.values(TRAP_SPRITES).forEach(img);
  Object.values(SCENE_SPRITES).forEach(img);
  for (let i = 1; i <= ASSETS.slashFx; i++) img(`fx/slash-${i}.png`);
  maps.forEach((m, i) => {
    img(`boss/b${i + 1}.png`);
    img(`boss/b${i + 1}-tel.png`);
    img(`bg/m${i + 1}-mid.png`);
    if (ASSETS.bgSky) img(`bg/m${i + 1}-sky.png`);
    if (ASSETS.bgFar) img(`bg/m${i + 1}-far.png`);
    if (ASSETS.bossFrames >= 3) img(`boss/b${i + 1}-hit.png`);
    if (ASSETS.bgNear) img(`bg/m${i + 1}-near.png`);
    img(`item/heal-${i + 1}.png`);
    img(`item/tool-${i + 1}.png`);
    if (ASSETS.gunArt) img(`item/gun-${i + 1}.png`);
    const kinds = new Set(m.mobs.map((sp) => sp.kind));
    kinds.forEach((k) => {
      if (k === "rider" && !ASSETS.riderArt) return;
      for (let f = 1; f <= mobFrameCount(k); f++) img(`mob/m${i + 1}-${k}-${f}.png`);
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
    pause() { setPaused(true); },
    togglePause() { setPaused(phase === "play"); },
    isPaused: () => phase === "paused",
    toggleInventory,
    pauseReason: () => pauseWhy,
    setPauseOnPickup(on: boolean) { pauseOnPickup = on; },
    status: (): GameStatus => ({
      mapIndex: lv,
      mobsLeft: mobs.filter((o) => !o.dead).length,
      mobsTotal: mobs.length,
      bossAlive: !!boss,
      bossHpPct: boss ? Math.max(0, boss.hp / boss.mhp) : 0,
      hp: player.hp,
      mhp: player.mhp,
      toolLeft: player.tool,
      toolName: player.tool > 0 ? player.toolName : null,
      ammo: player.ammo,
      gunName: player.ammo > 0 ? player.gunName : null,
      guard: player.stam,
      items: bag.slice(),
    }),
    press,
    release,
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      canvas.removeEventListener("pointerdown", onPointer);
    },
  };
}
