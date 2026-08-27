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

   CHƯA ĐƯỢC ĐỌC BỞI COMPONENT NÀO (giữ lại có ý thức, không phải bỏ sót)
   - `featuredSlug`        → CaseGrid render cả 5 case cùng một kích cỡ nên chưa cần
                             biết case nào là flagship.
   - `CaseStudy.tier`      → cùng lý do: hierarchy 3 kích cỡ chưa được cài lại sau
                             đợt rebuild theo template. Dữ liệu giữ nguyên cho lần sau.
   Nếu sửa hai field này mà không thấy gì đổi trên trang thì đó là đúng như mô tả,
   không phải lỗi build.
   ========================================================================== */

export type Accent = "navy" | "blue" | "amber" | "lime";

/**
 * Điều khiển layout của case. Component render theo tier:
 *
 *  flagship → trang đầy đủ: keyResult → context → decisions → features →
 *             flow → media → ownership → results → reflection → stack
 *  deep     → trang đầy đủ NHƯNG không features grid, không media bắt buộc.
 *             Sức nặng dồn vào `decisions`.
 *  brief    → trang ngắn: keyResult → context → decisions → results.
 *             Không flow, không features, không media.
 *
 * Trên trang chủ: flagship chiếm 1 block lớn, deep là 2 card ngang,
 * brief là 1 dải kết quả (result strip) — 3 kích cỡ khác nhau = hierarchy nhìn thấy được.
 */
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
}

export interface Decision {
  /** Tình huống nghiệp vụ, không phải task kỹ thuật. */
  problem: string;
  /** Vì sao cách làm hiển nhiên lại sai. Đây là phần chứng minh tư duy. */
  why: string;
  decision: string;
  /** Tên gọi chuẩn của pattern — tín hiệu cho người đọc có nền data. */
  term: string;
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
  alt: string;
  isDemoData: boolean;
  /**
   * Ảnh chiếm hết chiều ngang thay vì nằm trong lưới 2 cột.
   * Dùng cho ảnh bảng số dày: ở nửa chiều ngang thì chữ trong bảng nhỏ tới mức
   * chỉ còn là hoa văn, tức là ảnh mất hết công dụng làm bằng chứng.
   */
  wide?: boolean;
}

export interface CaseStudy {
  slug: string;
  tier: CaseTier;

  /** Một trục duy nhất: phạm vi ảnh hưởng. VD "Hệ thống dùng chung · toàn team KA". */
  scopeLabel: string;
  /** Case này chứng minh điều gì về tôi. Render dưới title, trên oneLiner. */
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

  /**
   * Số decision hiển thị trên TRANG CHỦ cho case flagship (phần còn lại chỉ có ở
   * trang chi tiết). Bản cũ in cả 5 decision + results ngay trang chủ, khiến case
   * flagship dài gấp ~40 lần mỗi case khác — đó là nguồn gốc thật của việc trang
   * bị đọc thành "nghiêng về một khách hàng".
   */
  homepageDecisionCount?: number;
}

export interface SiteContent {
  meta: {
    name: string;
    roleLabel: string;
    title: string;
    description: string;
    ogImage: string;
    url: string;
    locale: string;
  };

  nav: Cta[];

  hero: {
    eyebrow: string;
    headline: string[];
    subline: string;
    primaryCta: Cta;
    secondaryCta: Cta;
  };

  /** Hàng "Đã làm trong" dưới hero. Chưa có file logo nên render dạng chữ. */
  logos: string[];

  /**
   * Các chuỗi trước đây HARDCODE trong component. Đưa vào content vì chúng là
   * quyết định biên tập, không phải quyết định layout.
   *
   * QUY TẮC: mọi chuỗi hiển thị cho người đọc phải nằm ở file content, không
   * nằm trong .tsx. Đợt rebuild theo template đã hardcode lại một loạt heading
   * và danh sách vào component, khiến sửa content không lên trang — đó là lỗi
   * cần tránh lặp lại.
   */
  sectionLabels: {
    /** Nhãn nút CTA trên nav (và trong menu mobile). */
    navCta: string;
    casesEyebrow: string;
    casesHeading: string;
    experienceEyebrow: string;
    experienceHeading: string;
    ctaHeading: string;
    /** Tuyên ngôn ngắn dưới ctaHeading, ở section nền lime. */
    ctaBody: string;
  };

  /** Ba ô trích dẫn để trống có chủ ý — xem `note`. */
  testimonials: {
    eyebrow: string;
    heading: string;
    note: string;
    /** Số ô trống render ra. */
    slots: number;
  };

  statBand: {
    value: string;
    suffix?: string;
    label: string;
    /** Nhãn thời kỳ / nguồn. Bắt buộc khi số không thuộc công việc hiện tại. */
    note?: string;
  }[];

  /** Section "Về tôi". `heading` là heading duy nhất của section này. */
  intro: {
    eyebrow: string;
    heading: string;
    body: string[];
    /** Giới hạn tự nhận. Xuất hiện đúng 1 lần trên toàn site. */
    boundary: string;
    /** Khi nào nên gọi mình. */
    fit: string[];
    /** Khi nào KHÔNG nên — nói ra thì tăng độ tin, không giảm. */
    notFit: string[];
  };

  featuredSlug: string;
  cases: CaseStudy[];

  /**
   * Đường đi thật của một dashboard, thay cho `process` chung chung ở bản cũ.
   * Hai field quyết định giá trị của section này:
   *  - `owner`      → mắt nào do người khác nắm, tức Vinh phải thiết kế trong
   *                   năng lực và lịch của một team khác.
   *  - `constraint` → ràng buộc tổ chức tạo ra mắt đó. Đây là thứ KHÔNG fake được;
   *                   không ai bịa ra được nếu chưa sống trong tổ chức đó.
   */
  pipeline: {
    eyebrow: string;
    heading: string;
    intro: string;
    steps: {
      label: string;
      tool: string;
      owner: string;
      constraint?: string;
      body: string;
    }[];
    /** Tự nhận điểm yếu kiến trúc. Giấu thì mất điểm với kỹ sư dữ liệu; nói ra thì thành bằng chứng phán đoán. */
    tradeoff: string;
    /** Chỗ DUY NHẤT nói về AI-assisted. Đừng lặp lại ở hero/intro/case. */
    aiNote: string;
  };

  skills: { title: string; items: string[] }[];

  experience: {
    company: string;
    role: string;
    period: string;
    summary: string;
    highlights: string[];
  }[];

  contact: {
    heading: string;
    body: string;
    email: string;
    linkedin: string;
    cvHref: string;
    availability: string;
  };
}
