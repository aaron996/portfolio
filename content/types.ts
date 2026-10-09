/* ============================================================================
   types.ts — schema cho portfolio
   ----------------------------------------------------------------------------
   Thay đổi so với bản cũ (và vì sao):

   THÊM
   - CaseStudy.tier        → hierarchy được encode trong data, không nằm trong đầu.
                             Component đọc tier để quyết render sâu tới đâu.
   - CaseStudy.scopeLabel  → thay `kindLabel`. Một trục duy nhất: phạm vi ảnh hưởng.
                             (Bản cũ trộn 2 trục: "Sản phẩm"/"Hệ thống"/"Pipeline SQL"
                              là loại artifact, còn "Kết quả" là loại outcome.)
   - CaseStudy.proves      → câu trả lời cho "case này chứng minh điều gì về tôi".
                             Đây là tín hiệu hierarchy quan trọng nhất: 4 case phải
                             là 4 luận điểm khác nhau, không phải 4 dự án na ná.
   - CaseStudy.keyResult   → 1 con số nổi lên đầu case. Bản cũ để `results` nằm
                             sau `features` + `stack`, tức là outcome đứng sau
                             implementation — sai thứ tự cho người đọc BI.
   - CaseStudy.clientNote  → ghi rõ scope engagement (part-time / từ xa / bao lâu).
                             Chính field này giữ cho case flagship không bị đọc
                             thành "job chính".
   - verified: boolean     → phân biệt số ĐÃ XÁC NHẬN vs ƯỚC TÍNH. Badge thật thà
                             này làm tăng độ tin của toàn trang, không giảm.
   - statBand[].note       → nhãn thời kỳ/nguồn. Fix việc 4 con số ở 4 mốc thời gian
                             khác nhau đứng cạnh nhau mà không ai biết cái nào của ai.
   - sectionLabels.ctaBody → gap phát sinh khi bỏ `intro.body[2]` cũ (ValueProp
                             section dùng câu đó làm tuyên ngôn). body[2] mới mang
                             nghĩa khác (dẫn nhập 4 case), nên ValueProp cần câu riêng.

   BỎ
   - `ai` section          → 3 card của nó đang mô tả lại chính case GHN reporting,
                             và câu "AI-assisted, human-accountable" bị lặp 3 lần
                             (intro.body[2] + ai.intro + process.aiNote). Giữ 1 lần
                             trong process.aiNote, bằng chứng để cho case tự nói.
   - `hero.stats`          → field rỗng, dead code.
   - `CaseStudy.problems`  → trùng gần hết với decisions[].problem. Người đọc phải
                             đọc cùng một vấn đề 2 lần.
   - `CaseStudy.kind`      → đã gộp vào scopeLabel.
   - `Result.value.todo`   → footgun. Chính field này làm chuỗi "TODO: ..." lọt vào
                             cases[0].reflection và sẵn sàng render ra production.
                             Giờ `value` là string phẳng.
   - `hero.liveCard`       → hero theo template dùng dải 4 số (statBand) + hàng logo,
     `hero.ticker`           không còn card nổi và dải ticker. Ba field này nằm trong
     `hero.headlineRotating`  content mà không component nào đọc — sửa chúng không lên
                             trang, nên bỏ hẳn thay vì để làm bẫy.
   - `Figure`              → type chỉ phục vụ hero.liveCard.
   - `sectionLabels.featuredEyebrow` / `otherCasesEyebrow` / `otherCasesHeading`
                           → chỉ FeaturedCase (thiết kế cũ) đọc. Component đã xoá.

   Đợt dọn 10/2026: bỏ các field không còn component nào đọc (statBand, testimonials,
   pipeline, sectionLabels, intro, hero, featuredSlug... và phần lớn `prototype`).
   ========================================================================== */

export type Accent = "navy" | "blue" | "amber" | "lime";

/** Homepage hierarchy: flagship = visible product spread, deep = text row,
 * brief = result strip. Case detail templates are migrated separately. */
export type CaseTier = "flagship" | "deep" | "brief";

export interface Cta {
  label: string;
  href: string;
}

export interface KeyResult {
  value: string;
  label: string;
  /** true = số đã được đối chiếu / có bên thứ ba xác nhận. false = ước tính vận hành. */
  verified: boolean;
  /** "outlier" → Lệch (bạn đồng hành) đứng khoe trên thẻ kết quả. docs/companions.md */
  companion?: "outlier";
}

export interface Decision {
  /** Tình huống nghiệp vụ, không phải task kỹ thuật. */
  problem: string;
  /** Vì sao cách làm hiển nhiên lại sai. Đây là phần chứng minh tư duy. */
  why: string;
  decision: string;
  /** Tên gọi chuẩn của pattern — tín hiệu cho người đọc có nền data. */
  term: string;
  /** "dedupe" → tới đoạn này thì Trùng bị gộp vào Chấm. docs/companions.md */
  companion?: "dedupe";
}

export interface Feature {
  title: string;
  description: string;
  icon: string;
}

export interface StackGroup {
  group: string;
  items: string[];
}

export interface Result {
  label: string;
  value: string;
  /** Cách con số này được tính ra. Bắt buộc — số không có method là số không đáng tin. */
  method: string;
  verified: boolean;
}

export interface FlowNode {
  id: string;
  label: string;
  sublabel?: string;
}

export interface FlowEdge {
  from: string;
  to: string;
}

export interface Flow {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface Media {
  id: string;
  kind: "image";
  /** Ghi chú cho chính mình khi chụp ảnh. Không render. */
  brief: string;
  src: string;
  /** Kích thước ảnh gốc để giữ chỗ trước khi ảnh tải xong. */
  width: number;
  height: number;
  alt: string;
  isDemoData: boolean;
  /**
   * Ảnh chiếm hết chiều ngang thay vì nằm trong lưới 2 cột.
   * Dùng cho ảnh bảng số dày: ở nửa chiều ngang thì chữ trong bảng nhỏ tới mức
   * chỉ còn là hoa văn, tức là ảnh mất hết công dụng làm bằng chứng.
   */
  wide?: boolean;
  /** Chú thích hiển thị dưới ảnh, ví dụ "Minh hoạ hệ thống" */
  caption?: string;
}

export interface CaseStudy {
  /** Mô tả ngắn và vai trò dùng ở danh sách case trên homepage. */
  homepage?: { title: string; summary: string; role: string; evidence: string; cta: string };
  slug: string;
  tier: CaseTier;

  /** Một trục duy nhất: phạm vi ảnh hưởng. VD "Hệ thống dùng chung · toàn team KA". */
  scopeLabel: string;
  /** Phạm vi đóng góp hoặc sử dụng nổi bật, render dưới title. */
  proves: string;

  title: string;
  client: string;
  /** Scope engagement, nếu cần nói rõ. VD "Bán thời gian, từ xa, song song với GHN". */
  clientNote?: string;
  role: string;
  period: string;
  oneLiner: string;
  accent: Accent;

  keyResult: KeyResult;
  context: string[];
  decisions: Decision[];
  ownership: { owned: string[]; notOwned: string[] };
  results: Result[];
  reflection: string[];
  stack: StackGroup[];

  /** Chỉ tier "flagship". Sản phẩm mới cần feature list; pipeline/rule engine thì không. */
  features?: Feature[];
  flow?: Flow | null;
  /**
   * Heading cho phần flow của RIÊNG case này.
   * Bản cũ hardcode "Từ file rời rạc tới một nguồn sự thật" trong component và dùng
   * cho MỌI case — sai với 3 trong 4 case.
   */
  flowHeading?: string;
  media?: Media[];
}

/* ── Minigame ──────────────────────────────────────────────
   Side-scroller 5 ải. Mỗi ải là một nơi từng làm việc.
   Toàn bộ chữ và bảng màu của game nằm ở đây, không hardcode
   trong engine. Sửa ải mới = thêm một phần tử vào `maps`. */

/** Quái thường. Mỗi loại một kiểu hành xử, không chỉ khác tên. */
export type MobKind =
  /** Đi tuần qua lại trên mặt phẳng */
  | "walker"
  /** Bay lơ lửng, nhấp nhô, không rơi */
  | "flyer"
  /** Đứng im tới khi người chơi lại gần thì lao vào */
  | "charger"
  /** Đứng im, bắn đạn về phía người chơi */
  | "shooter"
  /**
   * Rider: thấy người chơi từ rất xa, rú ga báo trước rồi lao ngang với tốc
   * độ gấp đôi charger và chạy hết đà mới quay lại. Nguy hiểm nhất trong
   * nhóm quái thường — đổi lại có 0,5 giây báo đòn để nhảy tránh.
   */
  | "rider";

/** Bẫy tĩnh của bản đồ. Chạm là mất máu, không đánh được. */
export type TrapKind =
  /** Bãi gai nằm yên */
  | "spike"
  /** Lưỡi cưa chạy qua lại trong một đoạn */
  | "saw"
  /** Luồng phun lên theo chu kỳ, có lúc tắt để đi qua */
  | "pulse";

/** Vật phẩm nhặt dọc đường, thường đặt ở bệ khó với */
export type PickupKind =
  /** Hồi một máu */
  | "heal"
  /** Đồ nghề: 12 giây đánh nhanh hơn, tầm xa hơn, mạnh gấp đôi */
  | "tool"
  /**
   * Súng quét: nạp đạn cho đòn tầm xa bấm bằng K. Đây là vũ khí thứ hai, cầm
   * mãi cho tới khi bắn hết đạn — không phải buff hết giờ như `tool`.
   */
  | "gun";

/** Đòn của trùm — mỗi bản đồ một kiểu, để năm trận không giống nhau */
export type BossKind =
  /** Giậm đất, bắn hai luồng chạy hai bên */
  | "slam"
  /** Bắn một loạt ba quả về phía người chơi */
  | "volley"
  /** Nhắm rồi lao ngang thật nhanh */
  | "dash"
  /** Máy băng chuyền đẩy kiện thấp theo hướng đã khóa */
  | "parcel"
  /** Kiện dữ liệu tụ dấu vết rồi phóng một gói có hướng */
  | "cast"
  /** Luân phiên húc và dậm, không nối đòn trong recovery */
  | "hybrid";

export interface GameMobSpawn {
  kind: MobKind;
  /** Tên hiện trên đầu con quái */
  name: string;
  x: number;
  /** Cao độ mặt sàn con quái đứng. Bỏ trống là đứng dưới đất. */
  y?: number;
  /** Nửa quãng đường đi tuần, mặc định 70 */
  range?: number;
}

export interface GameTrap {
  kind: TrapKind;
  x: number;
  /** Cao độ mặt sàn đặt bẫy. Bỏ trống là dưới đất. */
  y?: number;
  /** Bề ngang. Với `saw` là cả đoạn chạy qua lại. */
  w?: number;
}

export interface GamePickup {
  kind: PickupKind;
  x: number;
  y: number;
  /** Tên đồ nghề, hiện lúc nhặt được */
  name: string;
  /**
   * Một câu giải nghĩa: vật phẩm này làm gì trong game, và nó ứng với cái gì
   * ở nghề thật. Hiện trong thẻ nhỏ lúc nhặt được — không có câu này thì
   * người chơi nhặt xong vẫn không biết mình vừa được gì.
   */
  desc: string;
}

export interface GameMap {
  /** Optional vertical route. Coordinates share the existing ground line y=344. */
  traversal?: {
    width: number;
    top: number;
    nodes: { id: string; name: string; x: number; y: number; hint: string; result: string }[];
    lift: { x: number; width: number; bottom: number; top: number; speed: number };
    shortcut: [number, number, number][];
    tiers: { y: number; name: string }[];
  };
  mission?: import("@/components/game/chapterMission").ChapterMission;
  year: string;
  place: string;
  /** Tên bản đồ hiện trên HUD */
  name: string;
  /** Tên trùm cuối bản đồ */
  boss: string;
  bossKind: BossKind;
  /** Câu chốt hiện sau khi hạ trùm — chỗ duy nhất game kể chuyện nghề */
  line: string;
  /** Mục tiêu ải, hiện ở bảng tạm dừng. Một câu, nói rõ phải làm gì để qua ải. */
  objective: string;
  /** Mẹo riêng của ải, hiện ở bảng tạm dừng dưới mục tiêu */
  tip: string;
  tipTouch: string;
  /** Hai kỹ năng rơi ra khi hạ trùm */
  skills: [string, string];
  palette: {
    sky: string;
    far: string;
    mid: string;
    ground: string;
    groundEdge: string;
    mob: string;
    boss: string;
  };
  /** Hình khối trang trí ở lớp giữa */
  deco: "container" | "crate" | "tower" | "server" | "gear";
  /** Bệ nhảy: [x, y, rộng]; mặc định rộng 2200px, traversal có giới hạn riêng */
  plats: [number, number, number][];
  mobs: GameMobSpawn[];
  traps: GameTrap[];
  pickups: GamePickup[];
}

/** Một scene kể chuyện ngắn phủ lên canvas; không thay đổi luật engine. */
export interface GameCutscene {
  id: string;
  kicker: string;
  title: string;
  cards: { speaker?: string; text: string; emphasis?: string }[];
  backdrop: "port";
  focus: "mission" | "boss" | "world";
}

export interface GameContent {
  eyebrow: string;
  heading: string;
  intro: string;
  /** Ghi chú thành thật về việc đây là bản nháp */
  note: string;
  controlsHint: string; backHome: string;
  display: {
    expand: string; collapse: string; touchLabel: string;
    touchAuto: string; touchOn: string; touchOff: string;
    hp: string; guard: string; ammo: string; noGun: string;
    remaining: string; remainingTarget: string; toolTime: string; volleyTouch: string;
    traversalProgress: string; traversalCheckpoint: string;
    canvasLabel: string; mapLabel: string;
    left: string; right: string; jump: string; block: string; shoot: string; attack: string;
  };
  dropLabel: string;
  rushHint: string;
  startLabel: string;
  soundOnLabel: string;
  soundOffLabel: string;
  continueLabel: string;
  newRunLabel: string;
  savedRunLabel: string;
  checkpointLabel: string;
  tutorial: {
    skip: string;
    move: string;
    jump: string;
    attack: string;
    guard: string;
    done: string;
  };
  /** Có {n} — số thứ tự ải kế tiếp */
  nextLabel: string;
  /** Có {n} — số thứ tự ải vừa qua */
  clearHeading: string;
  /** Có {boss} */
  bossAppear: string;
  deathLine: string;
  skillProgress: string;
  /** Có {name} — hiện khi nhặt được đồ nghề */
  pickupTool: string;
  pickupHeal: string;
  /** Có {name} — hiện khi nhặt được súng quét */
  pickupGun: string;
  /** Nhãn trên thẻ giải nghĩa vật phẩm, phân biệt ba loại */
  pickupKindLabel: { heal: string; tool: string; gun: string };
  /** Bấm K mà hết đạn */
  noAmmo: string;
  noAmmoTouch: string;
  /** Đỡ trúng nhịp — chặn đòn mà không tốn thể lực */
  parryLine: string;
  /** Phản đạn trúng nhịp với đạn của trùm */
  reflectLine: string;
  /** Gợi ý ngắn luôn hiện khi đánh trùm bắn loạt */
  volleyHint: string;
  /** Báo ngắn khi container chuẩn bị dậm đất */
  slamHint: string;
  /** Giữ đỡ tới cạn thể lực thì vỡ đỡ, đứng chịu trận một nhịp */
  guardBreakLine: string;
  /**
   * Bảng bật lên khi nhặt được vật phẩm. Game dừng hẳn để người chơi đọc
   * xong câu giải nghĩa — có tích chọn để thôi dừng ở những lần sau.
   */
  pickupPanel: {
    heading: string;
    /** Nhãn ô tích "đừng dừng game nữa", lưu vào máy người chơi */
    dontPauseLabel: string;
    /** Câu nhắc phím mở túi đồ, hiện dưới ô tích */
    inventoryHint: string;
    resumeLabel: string;
  };
  /** Bảng túi đồ, mở bằng phím B */
  inventory: {
    heading: string;
    hpLabel: string;
    guardLabel: string;
    toolLabel: string;
    gunLabel: string;
    /** Có {n} — số giây buff còn lại */
    toolLeft: string;
    /** Có {n} — số viên đạn còn lại */
    ammoLeft: string;
    /** Chưa cầm đồ nghề / chưa có súng */
    noneLabel: string;
    /** Chưa nhặt được gì trong ải này */
    emptyLabel: string;
    itemsHeading: string;
    closeLabel: string;
  };
  /** Bảng tạm dừng: hướng dẫn điều khiển + mục tiêu ải hiện tại */
  pause: {
    heading: string;
    controlsHeading: string;
    /** Mỗi dòng một hàng phím và việc nó làm */
    controls: { keys: string; label: string }[];
    /** Thay cho bảng phím trên màn hình hẹp — ở đó chơi bằng nút ảo */
    mobileControls: string;
    objectiveHeading: string;
    tipHeading: string;
    /** Có {left} và {total} */
    progressMobs: string;
    progressBoss: string;
    resumeLabel: string;
    restartLabel: string;
  };
  /** Gợi ý phím tạm dừng, hiện ở góc màn chơi */
  pauseHint: string;
  /** Màn Chấm kéo rèm khi bấm thẻ game ở trang chủ (components/companions/gameCurtain.ts). */
  curtain: { line: string };
  cutscene: {
    nextLabel: string;
    beginLabel: string;
    skipLabel: string;
    replayLabel: string;
    counterLabel: string;
    scenes: { map1Intro: GameCutscene; map1Boss: GameCutscene; map1Outro: GameCutscene };
  };
  finish: { heading: string; body: string; cta: string };
  maps: GameMap[];
}

/** Homepage bản "ít chữ, nhiều tương tác": hero sắp ô dữ liệu, danh sách công việc
 *  có xem trước, dòng thời gian. Chữ dùng chung (tên, headline, case) vẫn lấy từ
 *  `prototype`, `meta`, `cases`. */
export interface HomeContent {
  nav: { work: string; contact: string; game: string; cv: string; cvLabel: string };
  sort: {
    hint: string; hintTouch: string; sortAll: string; reshuffle: string;
    progress: string; completed: string; canvasLabel: string; confused: string; spotted: string;
    /** Lời nhắc hiện sau khi màn chào xong và trang được mở khoá cuộn. */
    scrollCue: string;
    /** Bong bóng của Lệch khi người xem cố cuộn lúc màn chào đang diễn. */
    hush: string;
  };
  work: {
    heading: string; count: string; hint: string;
    /** Case không có ảnh thì xem trước bằng con số kết quả; slug nào vẽ slope chart. */
    chart: { slug: string; before: { year: string; value: number }; after: { year: string; value: number }; aria: string };
  };
  timeline: {
    heading: string; hint: string; now: string; sideJob: string;
    axisOps: string; axisData: string; chartLabel: string;
    /** `level` 0–1: Vinh tự đặt vị trí công việc trên trục vận hành → dữ liệu & sản phẩm.
     *  Là cách kể chuyện, không phải số đo — biểu đồ không in giá trị này ra. */
    items: { company: string; short: string; start: number; end: number | null; level: number; parallel?: boolean; role: string; note: string }[];
  };
  about: {
    lead: string;
    /** Mỗi câu hỏi dẫn tới case trả lời nó. */
    questions: { q: string; slug: string }[];
    footnote: string; aside: string; asideCta: string;
  };
  contact: { heading: string; copy: string; copied: string; linkedin: string; linkedinCta: string; cv: string; cvCta: string; gameTitle: string; gameCta: string };
  footer: { replay: string; top: string };
  /** Cảnh đấu lồng sắt ở footer: Chấm đấu Lệch bằng đồ khán giả ném vào, Trùng chụp ảnh —
      xem components/companions/fight.ts. `win` có `{name}` là tên bên thắng; `neon`/`bar`/`exit`
      là biển đèn trong club; `cheers` là tiếng hò của khán giả, bốc ngẫu nhiên. */
  fight: {
    aName: string; bName: string; go: string; clang: string; smash: string; ping: string; bong: string;
    spray: string; ko: string; shutter: string; win: string; rematch: string;
    neon: string; bar: string; exit: string; cheers: string[];
  };
  /** Nút bật/tắt ba bạn đồng hành ở footer. */
  companions: { hide: string; show: string; tired: string };
}

/** Nhãn của trang case (/case/[slug]) — bản theo theme giấy, dùng chung cho mọi case. */
export interface CasePageContent {
  back: string;
  client: string; role: string; period: string;
  context: string;
  decisions: string; why: string; decision: string;
  features: string;
  flow: string;
  media: string; demoData: string;
  results: string;
  owned: string; notOwned: string;
  stack: string;
  reflection: string;
  next: string; others: string;
  unverified: string; unverifiedTitle: string;
  progress: string;
  /** Phóng ảnh: nút mở, nút đóng, bong bóng của Chấm lúc thò đầu (tối đa hai từ). */
  lightbox: { open: string; close: string; peek: string };
}

/** Trang 404: ba bạn đồng hành cầm đèn đi tìm, lộ ra Null. docs/companions.md */
export interface NotFoundContent {
  code: string;
  hint: string; hintTouch: string;
  found: string; body: string;
  lights: string;
  home: string; work: string;
  spotted: string;
}

export interface SiteContent {
  prototype: PortfolioPrototype;
  home: HomeContent;
  casePage: CasePageContent;
  notFound: NotFoundContent;
  meta: {
    name: string;
    title: string;
    description: string;
    ogImage: string;
    url: string;
    locale: string;
  };

  cases: CaseStudy[];

  contact: {
    heading: string;
    body: string;
    email: string;
    linkedin: string;
    cvHref: string;
  };

  game: GameContent;
}

export interface PortfolioPrototype {
  hero: {
    heading: string; primary: Cta;
    headlineLines: [string, string, string, string];
  };
  labels: { skip: string; navigation: string };
  /** Video intro phủ toàn màn hình khi mở trang chủ (một lần mỗi phiên). `countdown` chứa {s} = số giây còn lại. */
  intro: {
    src: string; label: string; skip: string; soundOn: string; soundOff: string;
    play: string; enter: string; countdown: string; replay: string;
  };
}
