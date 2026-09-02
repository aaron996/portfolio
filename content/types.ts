/**
 * Kiểu dữ liệu cho toàn bộ nội dung website.
 * Mỗi ngôn ngữ là một file riêng (content.vi.ts, content.en.ts)
 * cùng thoả mãn type SiteContent này.
 */

export type CaseKind = "product" | "system" | "outcome";

/** Đánh dấu nội dung chưa xác thực. Component sẽ render badge cảnh báo
 *  để không bao giờ vô tình publish số liệu chưa kiểm chứng. */
export type Draft<T> = { value: T; todo: string };

export interface NavItem {
  label: string;
  href: string;
}

export interface SiteMeta {
  name: string;
  /** Nhãn vai trò hiển thị ở hero, dạng eyebrow */
  roleLabel: string;
  title: string;
  description: string;
  ogImage: string;
  url: string;
  locale: string;
}

export interface Hero {
  eyebrow: string;
  headline: string[];
  subline: string;
  primaryCta: NavItem;
  secondaryCta: NavItem;
  stats: { value: string; label: string; note?: string }[];
  /** Thẻ nổi bên phải hero — bằng chứng sản phẩm đang chạy thật */
  liveCard: { label: string; figures: { value: string; label: string }[] };
  /** Dải công nghệ chạy ngang đáy hero */
  ticker: string[];
}

export interface StatBand {
  value: string;
  suffix?: string;
  label: string;
}

export interface AiSection {
  heading: string;
  intro: string;
  cards: { label: string; title: string; body: string }[];
}

export interface Intro {
  heading: string;
  body: string[];
  /** Nói rõ mình KHÔNG phải gì — tránh kỳ vọng sai từ recruiter */
  boundary: string;
}

export interface FlowNode {
  id: string;
  label: string;
  sublabel?: string;
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}

export interface Decision {
  /** Tiêu đề ngắn, dạng vấn đề */
  problem: string;
  /** Vì sao nó khó — viết cho người không rành kỹ thuật hiểu được */
  why: string;
  /** Mình đã quyết định làm gì */
  decision: string;
  /** Từ vựng chuyên môn tương ứng, để recruiter kỹ thuật nhận ra ngay */
  term?: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: string;
}

export interface MediaSlot {
  id: string;
  kind: "image" | "video";
  /** Mô tả nội dung cần chụp/quay — hướng dẫn cho chính mình khi thay ảnh */
  brief: string;
  src: string | null;
  alt: string;
  /** true nếu ảnh dùng dữ liệu demo, sẽ hiện nhãn "Dữ liệu minh hoạ" */
  isDemoData: boolean;
}

export interface ResultMetric {
  label: string;
  value: Draft<string>;
  method: string;
}

export interface CaseStudy {
  slug: string;
  kind: CaseKind;
  kindLabel: string;
  title: string;
  client: string;
  /** Ghi rõ phạm vi sở hữu — chống hiểu nhầm về mức đóng góp */
  role: string;
  period: string;
  oneLiner: string;
  accent: "navy" | "blue" | "amber";

  context: string[];
  problems: string[];
  ownership: { owned: string[]; notOwned: string[] };
  flow: { nodes: FlowNode[]; edges: FlowEdge[] } | null;
  decisions: Decision[];
  features: Feature[];
  stack: { group: string; items: string[] }[];
  results: ResultMetric[];
  reflection: string[];
  media: MediaSlot[];
}

export interface SkillGroup {
  title: string;
  items: string[];
}

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  summary: string;
  highlights: string[];
}

export interface Process {
  heading: string;
  intro: string;
  steps: { title: string; body: string }[];
  aiNote: string;
}

export interface Contact {
  heading: string;
  body: string;
  email: string;
  linkedin: string;
  cvHref: string;
  availability: string;
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
  | "shooter";

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
  | "tool";

/** Đòn của trùm — mỗi bản đồ một kiểu, để năm trận không giống nhau */
export type BossKind =
  /** Giậm đất, bắn hai luồng chạy hai bên */
  | "slam"
  /** Bắn một loạt ba quả về phía người chơi */
  | "volley"
  /** Nhắm rồi lao ngang thật nhanh */
  | "dash";

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
}

export interface GameMap {
  year: string;
  place: string;
  /** Tên bản đồ hiện trên HUD */
  name: string;
  /** Tên trùm cuối bản đồ */
  boss: string;
  bossKind: BossKind;
  /** Câu chốt hiện sau khi hạ trùm — chỗ duy nhất game kể chuyện nghề */
  line: string;
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
  /** Bệ nhảy: [x, y, rộng] trong toạ độ thế giới rộng 2200px */
  plats: [number, number, number][];
  mobs: GameMobSpawn[];
  traps: GameTrap[];
  pickups: GamePickup[];
}

export interface GameContent {
  eyebrow: string;
  heading: string;
  intro: string;
  /** Ghi chú thành thật về việc đây là bản nháp */
  note: string;
  controlsHint: string;
  startLabel: string;
  /** Có {n} — số thứ tự ải kế tiếp */
  nextLabel: string;
  /** Có {n} — số thứ tự ải vừa qua */
  clearHeading: string;
  /** Có {boss} */
  bossAppear: string;
  deathLine: string;
  skillsLabel: string;
  /** Có {name} — hiện khi nhặt được đồ nghề */
  pickupTool: string;
  pickupHeal: string;
  finish: { heading: string; body: string; cta: string };
  maps: GameMap[];
}

export interface SiteContent {
  meta: SiteMeta;
  nav: NavItem[];
  hero: Hero;
  statBand: StatBand[];
  intro: Intro;
  /** slug của case được trình bày đầy đủ ngay trên trang chủ */
  featuredSlug: string;
  cases: CaseStudy[];
  ai: AiSection;
  process: Process;
  skills: SkillGroup[];
  experience: ExperienceItem[];
  contact: Contact;
  game: GameContent;
}
