import type { SiteContent } from "./types";

/**
 * ⚠️ Chỗ cần Vinh điền trước khi deploy.
 * Cố tình render ra chữ chói mắt để KHÔNG lỡ ship như chuỗi "TODO:" ở bản cũ.
 * Tìm hết bằng: grep -n "NEEDS_INPUT" content.vi.ts
 *
 * Hiện KHÔNG còn chỗ nào dùng — giữ helper lại vì đây là quy ước của dự án cho
 * lần tới có dữ liệu chưa xác thực. Đừng xoá nhãn bằng cách điền số ước chừng.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NEEDS_INPUT = (hint: string) => `⚠️ NEEDS_INPUT: ${hint}`;

export const content: SiteContent = {
  meta: {
    name: "Lương Thế Vinh",
    roleLabel: "BI & Data Analyst",
    title: "Lương Thế Vinh — BI & Data Analyst",
    description:
      "Tôi chốt định nghĩa chỉ tiêu, dựng data model, rồi tự ship hệ thống sinh ra con số đó. Sáu năm vận hành logistics và thương mại điện tử: Shopee, GHN, J&T Express, Maersk.",
    ogImage: "/og.png",
    url: "https://REPLACE-ME.com", // ⚠️ thay domain thật trước khi deploy (ảnh hưởng OG tag)
    locale: "vi_VN",
  },

  /* Nav cũ có cả "Case study" (#featured) và "Dự án" (#projects) — người đọc không
     biết hai cái đó khác gì nhau. Giờ chỉ còn một mục #cases, hierarchy nằm trong
     chính danh sách case. */
  nav: [
    { label: "Case", href: "#cases" },
    { label: "Cách làm việc", href: "#pipeline" },
    { label: "Năng lực", href: "#skills" },
    { label: "Kinh nghiệm", href: "#experience" },
    { label: "Liên hệ", href: "#contact" },
  ],

  hero: {
    /* Bỏ "AI-ASSISTED BUILDER" khỏi eyebrow: AI là phương tiện, không phải danh tính,
       và nó đã được nói ở process.aiNote. Thêm domain vì đó mới là thứ khiến bạn
       khác biệt với một BI analyst chung chung. */
    eyebrow: "BI / DATA ANALYST · LOGISTICS & E-COMMERCE · HỒ CHÍ MINH",
    headline: ["Analyst tự build được"],
    /* Bản render đang luân phiên "dashboard vận hành" ⇄ "sản phẩm dữ liệu".
       Mình bỏ "dashboard vận hành" — nó tự hạ cấp bạn xuống người làm dashboard,
       đúng cái định vị bạn đang cố thoát ra. Ba từ thay thế đều leo thang về quyền
       sở hữu: sản phẩm → hệ thống → con số có người chịu trách nhiệm. */
    headlineRotating: ["sản phẩm dữ liệu", "hệ thống báo cáo", "con số dám bảo vệ"],
    subline:
      "Sáu năm trong vận hành logistics và thương mại điện tử. Tôi chốt định nghĩa chỉ tiêu, dựng data model, rồi tự ship hệ thống sinh ra con số — và chịu trách nhiệm khi nó sai.",
    primaryCta: { label: "Xem case", href: "#cases" },
    secondaryCta: { label: "Tải CV", href: "/cv.pdf" },

    /* SỬA QUAN TRỌNG: liveCard cũ hiển thị 41 cửa hàng · 176 SKU (Interdist).
       Đó là con số ĐẦU TIÊN người đọc thấy, và nó là scale nhỏ nhất trong CV bạn.
       Con số nhận diện phải đến từ GHN — job chính, quy mô lớn nhất.
       Số Interdist đã chuyển xuống cases[0].keyResult, nơi nó đúng ngữ cảnh. */
    liveCard: {
      label: "Đang phụ trách",
      figures: [
        {
          value: "300–500K",
          label: "đơn/ngày — tổng sản lượng GHN, nơi tôi phụ trách tài khoản Shopee Express & Bulky",
        },
        { value: "4", label: "hệ thống dữ liệu đang chạy thật" },
      ],
      /* Caption cũ ghi "Số liệu từ hệ thống P&G Sales Operations đang vận hành tại
         Interdist" — tức dòng chú thích ngay dưới màn hình đầu tiên nói với người đọc
         rằng thành tựu tiêu biểu của bạn thuộc về một engagement bán thời gian 3 tháng. */
      caption: "Phạm vi công việc chính tại GHN. Chi tiết từng hệ thống ở phần case bên dưới.",
    },

    ticker: [
      "SQL / Trino",
      "Iceberg lakehouse",
      "StarRocks",
      "PostgreSQL",
      "Python",
      "Metabase",
      "Power BI",
      "React · TypeScript",
      "Supabase",
      "n8n",
      "Google Apps Script",
    ],
  },

  /* statBand cũ trộn 3 mốc thời gian mà không nói ra: 97.5% là Shopee 2021,
     300k đơn/ngày là J&T 2020, đứng cạnh "4 hệ thống đã ship" (hiện tại).
     Người đọc gộp hết thành một khối mơ hồ. `note` làm rõ từng số thuộc về đâu —
     và nghịch lý là ghi rõ "2021–2025" lại làm con số đáng tin hơn, không kém hơn. */
  statBand: [
    { value: "6", suffix: "+", label: "năm vận hành & phân tích dữ liệu" },
    {
      value: "97.5",
      suffix: "%",
      label: "pickup on-time, từ 90.1%",
      note: "Shopee × Viettel Post · 2021–2025 · đã xác nhận",
    },
    { value: "4", label: "hệ thống dữ liệu đang chạy production", note: "GHN · Interdist · hiện tại" },
    { value: "300", suffix: "k", label: "đơn/ngày từng vận hành", note: "J&T Express × Shopee · 2020–2021" },
  ],

  intro: {
    heading: "Tôi đứng giữa nghiệp vụ và dữ liệu",
    body: [
      "Tôi bắt đầu từ vận hành, không phải từ kỹ thuật. Sáu năm ngồi trong logistics và thương mại điện tử dạy tôi một thứ mà không khoá học nào dạy được: biết khi nào một con số trông thì đúng nhưng thật ra sai, và sai ở khâu nào.",
      "Công việc của tôi là dịch vấn đề vận hành thành định nghĩa dữ liệu rõ ràng — chỉ tiêu này tính trên grain nào, đơn nào được tính, ngoại lệ xử lý ra sao — rồi biến định nghĩa đó thành pipeline và báo cáo mà người dùng dám tin.",
      /* Câu này là "bản đồ cho người đọc". Nó là thứ bản cũ thiếu: 4 case trước đây
         là 4 dự án na ná nhau; giờ chúng được khai báo thẳng là 4 luận điểm khác nhau,
         nên người đọc biết vì sao phải đọc cả bốn. */
      "Bốn case dưới đây chứng minh bốn điều khác nhau: một sản phẩm tôi ship end-to-end một mình, một hệ thống tôi chuẩn hoá cho cả team, một rule engine tôi dựng ra từ tranh chấp giữa các bộ phận, và một con số kết quả đã được đối tác xác nhận.",
    ],
    boundary:
      "Tôi không định vị mình là software engineer. Tôi là người xây hệ thống dữ liệu cho bài toán vận hành mình hiểu rõ.",
  },

  /* Bốn chuỗi này trước đây hardcode trong component. Thay đổi quan trọng nhất là
     "Dự án khác" → công việc chính của bạn không phải "khác". */
  sectionLabels: {
    featuredEyebrow: "Case tiêu biểu ·",
    otherCasesEyebrow: "Ba case còn lại",
    otherCasesHeading: "Ba bài toán, ba loại bằng chứng",
    ctaHeading: "Tôi biến dữ liệu phức tạp thành hành động rõ ràng",
    /* Field mới, không có trong bản gốc gửi qua — bản gốc dùng intro.body[2] cho
       chỗ này, nhưng body[2] mới mang nghĩa khác (dẫn nhập 4 case). Câu dưới đây
       ghép lại từ boundary + tinh thần "chịu trách nhiệm khi số sai" lặp lại xuyên
       suốt các decision, không phải claim mới. */
    ctaBody:
      "Tôi không chỉ viết được query nhanh. Tôi biết chỉ tiêu nào đúng, số nào sai ở đâu, và đứng sau con số đó khi có người hỏi lại.",
  },

  featuredSlug: "pg-sales-operations",

  cases: [
    /* ═══════════════════════════════════════════════════════════════════════
       FLAGSHIP — Interdist. Đọc đầu tiên vì đây là case duy nhất trả lời được
       "thuê anh thì anh làm được gì cho tôi" (quan trọng với nửa client consulting").
       Nhưng `clientNote` nói rõ đây là engagement bán thời gian, để nó KHÔNG bị
       đọc thành job chính của bạn.
       ═══════════════════════════════════════════════════════════════════════ */
    {
      slug: "pg-sales-operations",
      tier: "flagship",
      scopeLabel: "Sản phẩm end-to-end · 1 người",
      proves: "Tôi ship được một sản phẩm dữ liệu chạy thật — từ phỏng vấn nghiệp vụ tới production — một mình.",
      title: "P&G Sales Operations Dashboard",
      client: "Interdist",
      clientNote: "Bán thời gian, làm từ xa, song song với công việc chính ở GHN",
      role: "Sở hữu toàn bộ phần dữ liệu và sản phẩm: nghiệp vụ → data model → ứng dụng → vận hành",
      period: "T5/2026 – nay",
      oneLiner:
        "Hệ thống nội bộ gom doanh số từ các file Excel rời rạc thành một nguồn dữ liệu duy nhất, có phân quyền, có audit trail, và tự sinh báo cáo cho quản lý.",
      accent: "navy",

      /* Số lấy trực tiếp từ Postgres production (xem note cuối file).
         "85.563 giao dịch" mạnh hơn "41 cửa hàng" rất nhiều: nó nói lên khối lượng
         dữ liệu hệ thống đang gánh, không chỉ phạm vi master data. */
      keyResult: {
        value: "85.563 giao dịch doanh số",
        label: "41 cửa hàng · 176 SKU · 8 tài khoản người dùng · đang chạy production",
        verified: true,
      },

      /* Rút từ 3 đoạn xuống 2. Đoạn "tôi tham gia ban đầu ở mảng dashboard, sau đó
         nhận trọn phần dữ liệu" đã chuyển vào `role` — nó là thông tin về vai trò,
         không phải về bối cảnh. */
      context: [
        "Interdist phụ trách phân phối cho P&G qua nhiều kênh và vùng. Số liệu doanh số về dưới dạng file Excel rời rạc, mỗi nguồn một định dạng, và việc tổng hợp theo vùng / kênh / sản phẩm là công việc tay lặp lại mỗi kỳ.",
        "Quản lý cần xem tiến độ target nhanh, nhưng không dám tin số nếu chưa có người kiểm lại — vì mỗi người tổng hợp một kiểu và không ai truy được số nào đúng.",
      ],

      /* `problems[]` cũ đã bỏ: 5 gạch đầu dòng ở đó trùng gần hết với
         decisions[].problem bên dưới. Người đọc phải đọc cùng một vấn đề 2 lần. */
      decisions: [
        {
          problem: "Tách category và SKU từ tiêu đề cột dạng CATEGORY.SKU",
          why: "Bản thân mã SKU cũng chứa dấu chấm. Tách naive theo mọi dấu chấm sẽ sinh ra hàng loạt SKU sai — và mỗi SKU sai là một dòng doanh số bị tách khỏi sản phẩm gốc, làm phân mảnh toàn bộ số liệu mà không ai phát hiện.",
          decision:
            "Chỉ tách tại dấu chấm đầu tiên, phần còn lại giữ nguyên làm SKU. Viết test tự động phủ các mẫu tên thật, bao gồm cả các ca oái oăm nhất trong dữ liệu lịch sử.",
          term: "Khoá của dimension sản phẩm — sai khoá là hỏng toàn bộ bảng fact",
        },
        {
          problem: "Dữ liệu Excel bẩn: định dạng số, ngày tháng, ô thiếu",
          why: "Cám dỗ lớn nhất là 'tự sửa cho xong'. Nhưng sửa im lặng nghĩa là một hôm nào đó báo cáo lệch mà không ai biết bắt đầu tìm từ đâu.",
          decision:
            "File lên trước vào bảng staging riêng, kiểm tra từng dòng ở đó, rồi mới được đẩy sang bảng giao dịch thật. Cái gì có quy tắc chắc chắn thì chuẩn hoá; còn lại từ chối import và báo lỗi cụ thể tới dòng, tới cột. Số sai bị chặn ở biên, không bao giờ chạm tới bảng fact.",
          term: "Staging rồi mới promote — data contract thay vì sửa ngầm",
        },
        {
          problem: "Giá khác nhau theo kênh, cửa hàng và khoảng thời gian",
          why: "Nếu tính doanh thu bằng giá hiện tại, thì mỗi lần đổi giá là toàn bộ lịch sử doanh thu tự thay đổi theo. Báo cáo tháng trước in ra hôm nay sẽ khác báo cáo in tháng trước.",
          decision:
            "Lưu giá kèm khoảng hiệu lực, và định nghĩa rõ thứ tự ưu tiên: dòng giá riêng của cửa hàng ghi đè dòng giá mặc định toàn hệ thống. Doanh thu luôn tính theo giá đúng tại thời điểm phát sinh giao dịch, không phải giá hiện hành.",
          term: "Effective-dated dimension (tương đương SCD Type 2), có precedence rõ ràng",
        },
        {
          problem: "Phân bổ chỉ tiêu tháng thành chỉ tiêu ngày",
          why: "Chia đều cho 30 ngày là sai. Cửa hàng có lịch hoạt động riêng, có ngày nghỉ, có ngoại lệ. Chia sai thì tiến độ hằng ngày trở nên vô nghĩa và quản lý mất niềm tin vào dashboard.",
          decision:
            "Hai tầng: trọng số theo thứ trong tuần cho từng cửa hàng từng tháng, và ngoại lệ theo đúng một ngày cụ thể ghi đè lên trọng số đó. Mọi điều chỉnh đi theo lô — có bản xem trước tác động, có audit trail, và hoàn tác được cả lô.",
          term: "Target allocation hai tầng: weekday weight + date override",
        },
        {
          /* Quyết định này đọc ra được từ chính comment bạn viết trong schema
             (`monthly_targets`: "Actuals should be computed from fact, not stored here").
             Nó là kỷ luật mô hình hoá, và là thứ phân biệt người thiết kế data model
             với người dựng bảng cho xong. */
          problem: "Có nên lưu số thực đạt cạnh chỉ tiêu cho tiện truy vấn không",
          why: "Lưu số dẫn xuất cạnh số gốc nghĩa là tạo ra hai nguồn sự thật cho cùng một con số. Chỉ cần một lần import muộn hoặc một lần sửa lịch sử là hai nơi lệch nhau — và lúc đó không ai biết nơi nào đúng.",
          decision:
            "Bảng chỉ tiêu chỉ lưu chỉ tiêu. Số thực đạt luôn được tính từ bảng giao dịch tại thời điểm đọc, không bao giờ lưu song song. Chậm hơn một chút, nhưng không bao giờ lệch.",
          term: "Không lưu số dẫn xuất — derived metric tính tại thời điểm đọc",
        },
        {
          problem: "Ai được sửa gì, và làm sao truy lại khi số lệch",
          why: "Một hệ thống báo cáo mà ai cũng sửa được thì không phải nguồn sự thật, chỉ là một file Excel đắt tiền hơn.",
          decision:
            "Đăng nhập Google, phân quyền ba mức admin / user / pending. Mọi thao tác ảnh hưởng tới con số đều được ghi log kèm người thực hiện và thời điểm.",
          term: "Quản trị dữ liệu ở mức tối thiểu nhưng đủ dùng",
        },
      ],

      ownership: {
        owned: [
          "Phỏng vấn nghiệp vụ và chốt định nghĩa chỉ tiêu",
          "Thiết kế lược đồ dữ liệu (fact doanh số, dimension cửa hàng / sản phẩm / giá / target)",
          "Business rule: tách SKU, phân bổ target, chọn giá hiệu lực",
          "Xây toàn bộ ứng dụng (AI-assisted): frontend, backend, cơ sở dữ liệu, phân quyền",
          "Kiểm chứng đầu ra bằng dữ liệu thật trước khi phát hành",
          "Vận hành và xử lý phản hồi người dùng sau khi lên production",
        ],
        notOwned: [
          "Hạ tầng và bảo mật cấp doanh nghiệp của Interdist — tôi làm việc trong khuôn khổ có sẵn",
        ],
      },

      results: [
        {
          label: "Thời gian tổng hợp một kỳ báo cáo",
          value: "~40–60 giờ / tháng được giải phóng",
          method:
            "Ước tính thận trọng dựa trên quy trình của 3–4 PIC: thay thế thao tác tổng hợp Excel thủ công, giảm phụ thuộc công thức lặp lại, tập trung dữ liệu giá / chỉ tiêu / mapping cửa hàng. Sẽ được xác thực thêm bằng theo dõi thời gian sử dụng thực tế.",
          verified: false,
        },
        {
          label: "Khối lượng dữ liệu đang gánh",
          value: "85.563 giao dịch · 12.476 bản tổng hợp ngày · 569 dòng chỉ tiêu tháng",
          method: "Nguồn: Postgres production của hệ thống Interdist, đếm trực tiếp. Bảng tổng hợp ngày được dẫn xuất từ bảng giao dịch, không nhập tay.",
          verified: true,
        },
        {
          label: "Người dùng",
          value: "8 tài khoản",
          method: "Nguồn: Postgres production của hệ thống Interdist — số profile đang hoạt động, phân ba cấp quyền",
          verified: true,
        },
        {
          label: "Phạm vi master data",
          value: "41 cửa hàng · 176 SKU · 6 vùng · 2 kênh",
          method: "Nguồn: master data trên hệ thống Interdist. Hệ thống đang được mở rộng cho các khách hàng khác của Interdist.",
          verified: true,
        },
        {
          label: "Kiểm soát truy cập",
          value: "Row Level Security bật trên toàn bộ 22 bảng",
          method: "Nguồn: cấu hình RLS trên hệ thống Interdist. Phân quyền được thực thi ở tầng cơ sở dữ liệu, không chỉ ở tầng giao diện — người dùng không thể lách qua API để đọc dữ liệu ngoài phạm vi.",
          verified: true,
        },
      ],

      /* Đã XOÁ chuỗi "TODO: thêm một điều bạn sẽ làm khác đi..." — nó nằm trong
         mảng render ra UI và sẽ ship thẳng lên production.
         Vẫn nên có reflection thứ hai, nhưng phải là chuyện thật của bạn: xem note
         mình gửi kèm. */
      reflection: [
        "Sai lầm lớn nhất ở giai đoạn đầu là tôi build dashboard trước khi chốt xong định nghĩa chỉ tiêu. Kết quả là phải làm lại phần tính toán khi nghiệp vụ nói lại cho rõ. Từ đó tôi luôn viết định nghĩa ra giấy và cho người dùng xác nhận trước khi động vào code.",
      ],

      features: [
        {
          title: "Import & chuẩn hoá Excel",
          description: "Kiểm tra và báo lỗi cụ thể trước khi ghi. Không dữ liệu nào vào DB mà chưa qua kiểm tra.",
          icon: "file-spreadsheet",
        },
        {
          title: "Dashboard KPI",
          description: "Tiến độ target, xu hướng theo thời gian, bảng chi tiết theo vùng và kênh.",
          icon: "chart-bar",
        },
        {
          title: "Quản lý master data",
          description: "Cửa hàng, SKU, bảng giá theo khoảng hiệu lực, supervisor và chỉ tiêu.",
          icon: "database",
        },
        {
          title: "Phân bổ & điều chỉnh target",
          description: "Rải chỉ tiêu tháng xuống ngày theo lịch hoạt động, có preview, audit trail và hoàn tác.",
          icon: "target",
        },
        {
          title: "Xuất báo cáo",
          description: "Sinh báo cáo HTML/PNG và soạn sẵn nội dung gửi Telegram cho quản lý.",
          icon: "send",
        },
        {
          title: "Phân quyền & nhật ký",
          description: "Google OAuth, ba cấp quyền, ghi vết mọi thao tác ảnh hưởng tới số liệu.",
          icon: "shield-check",
        },
      ],

      /* Trang chủ chỉ in 2 decision mạnh nhất; 3 cái còn lại nằm ở trang chi tiết.
         Bản cũ in cả 5 (thực tế render 2-3 lần) ngay trang chủ. */
      homepageDecisionCount: 2,
      flowHeading: "Từ file Excel rời rạc tới một nguồn sự thật",
      flow: {
        nodes: [
          { id: "excel", label: "Excel doanh số", sublabel: "nhiều nguồn, nhiều định dạng" },
          { id: "validate", label: "Kiểm tra & chuẩn hoá", sublabel: "chặn số sai ở biên" },
          { id: "db", label: "Cơ sở dữ liệu trung tâm", sublabel: "Supabase / Postgres" },
          { id: "master", label: "Target, giá, cửa hàng", sublabel: "master data có hiệu lực theo thời gian" },
          { id: "kpi", label: "KPI · biểu đồ · bảng chi tiết" },
          { id: "report", label: "Báo cáo HTML / PNG / Telegram" },
        ],
        edges: [
          { from: "excel", to: "validate" },
          { from: "validate", to: "db" },
          { from: "master", to: "db" },
          { from: "db", to: "kpi" },
          { from: "kpi", to: "report" },
        ],
      },

      stack: [
        { group: "Dữ liệu", items: ["PostgreSQL (Supabase)", "SQL", "Thiết kế lược đồ fact/dimension"] },
        { group: "Ứng dụng", items: ["React 19", "TypeScript", "Vite", "Tailwind CSS", "Express"] },
        { group: "Xử lý & hiển thị", items: ["XLSX parsing", "Recharts"] },
        { group: "Nền tảng", items: ["Google OAuth", "Vercel", "Automated tests cho business rules"] },
      ],

      media: [
        {
          id: "hero-shot",
          kind: "image",
          brief: "Ảnh dashboard chính, đã thay toàn bộ số bằng dữ liệu demo. Che tên cửa hàng và tên người dùng thật.",
          src: "/case-pg-dashboard.png",
          alt: "Màn hình dashboard KPI với biểu đồ xu hướng và bảng chi tiết theo vùng",
          isDemoData: true,
        },
        {
          id: "import-flow",
          kind: "image",
          brief:
            "Màn hình xem trước khi import/replace — hệ thống hiện rõ số dòng sẽ thay, giữ nguyên, thêm mới trước khi người dùng xác nhận.",
          src: "/case-pg-import-preview.png",
          alt: "Modal xem trước batch replace: so sánh dữ liệu hiện có và sau khi import, kèm lựa chọn cách xử lý dòng trùng",
          isDemoData: true,
        },
        {
          id: "target-preview",
          kind: "image",
          brief: "Màn hình chỉnh target theo từng ngày trong lịch, thấy rõ số trước/sau và tác động dồn về target cả tháng.",
          src: "/case-pg-target-preview.png",
          alt: "Lịch chỉnh target theo ngày với bảng so sánh số trước và sau điều chỉnh",
          isDemoData: true,
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════════
       DEEP #1 — GHN. Bản cũ để case này mỏng hơn Interdist rất nhiều, dù nó là
       job chính. Đã dồn thêm sức nặng: thêm decision thứ 3 (lấy từ section `ai`
       đã bỏ), và bỏ `features` để toàn bộ chú ý dồn vào `decisions`.
       ═══════════════════════════════════════════════════════════════════════ */
    {
      slug: "kas-reporting-automation",
      tier: "deep",
      scopeLabel: "Hệ thống dùng chung · toàn team Key Account",
      proves: "Tôi chuẩn hoá được định nghĩa KPI cho cả một team — không chỉ cho báo cáo của riêng mình.",
      title: "Chuẩn hoá & tự động hoá báo cáo Key Account",
      client: "Giao Hàng Nhanh (GHN)",
      clientNote: "Công việc chính, toàn thời gian",
      role: "Thiết kế và xây dựng — từ định nghĩa KPI, SQL model, tới pipeline sinh và phân phối báo cáo",
      period: "2025 – nay",
      oneLiner:
        "Một nguồn định nghĩa KPI duy nhất cho toàn team, và pipeline tự sinh báo cáo tuần từ dữ liệu thô — thay cho việc mỗi người tự viết query, tự dựng bảng, tự soạn file.",
      accent: "blue",

      /* Không dùng số nữa vì bạn chưa có số cứng. Thay bằng ĐỘ RỘNG stakeholder —
         thứ này verify được từ chính log task của bạn, và với người tuyển BI thì
         "báo cáo của tôi được giám đốc vùng và team KA của khách hàng dùng" mạnh hơn
         một con số giờ tiết kiệm không ai kiểm được. */
      keyResult: {
        value: "Giám đốc vùng · team KA khách hàng · vận hành hub",
        label: "cùng một nguồn định nghĩa KPI phục vụ cả ba nhóm, mỗi nhóm một định dạng",
        verified: true,
      },

      context: [
        "Team Key Account phục vụ các tài khoản lớn (Shopee Express, Shopee Bulky, TikTok Shop) với báo cáo hiệu suất định kỳ hằng tuần và hằng tháng.",
        "Mỗi người tự viết query, tự dựng bảng, tự soạn file. Kết quả là cùng một chỉ tiêu nhưng mỗi báo cáo ra một con số, và không ai truy được vì sao lệch.",
      ],

      decisions: [
        {
          problem: "Cùng tên chỉ tiêu, khác điều kiện lọc, khác mốc thời gian, khác cách xử lý đơn ngoại lệ",
          why: "Khi định nghĩa KPI sống trong đầu từng người thay vì trong một nơi, thì mọi cuộc họp đều bắt đầu bằng việc đối chiếu số chứ không phải bàn hành động. Và không ai sai — vì không có bản gốc để so.",
          decision:
            "Xây SQL model trên Trino / Iceberg làm nguồn định nghĩa duy nhất: một chỉ tiêu, một điều kiện lọc, một mốc thời gian. Báo cáo của cả team đọc từ đó thay vì từ query riêng.",
          term: "Semantic layer — một định nghĩa KPI cho toàn team",
        },
        {
          problem: "Mỗi người prompt LLM một kiểu, ra một số",
          why: "Khi ai cũng dùng LLM để viết query, sai lệch không giảm mà tăng — vì giờ mỗi người có một trợ lý riêng, hiểu nghiệp vụ theo một cách riêng.",
          decision:
            "Đóng gói định nghĩa KPI, schema bảng và quy tắc nghiệp vụ thành skill dùng chung. LLM không tự đoán nữa mà đọc từ một nguồn duy nhất — cùng câu hỏi, cùng câu trả lời, bất kể ai hỏi.",
          term: "Context engineering — chuẩn hoá ngữ cảnh thay vì chuẩn hoá prompt",
        },
        {
          problem: "Tin được báo cáo do AI sinh ra tới đâu",
          why: "Một báo cáo sai gửi tới khách hàng lớn thì thiệt hại không nằm ở con số, mà ở niềm tin — và niềm tin mất rồi rất khó lấy lại.",
          decision:
            "Mọi rule đều chạy song song với cách tính cũ và phải giải thích được từng chỗ lệch trước khi phát hành. Chưa đối chiếu xong thì chưa gửi.",
          term: "Đối chiếu song song (parallel run) trước khi thay thế quy trình cũ",
        },
        {
          /* Lấy từ KAS-149 / KAS-148. Đây là loại quyết định mà người tuyển BI tìm nhất:
             định nghĩa khoá và kiểm coverage TRƯỚC khi báo cáo, không phải sau. */
          problem: "Lấy gì làm định danh cho một seller",
          why: "Báo cáo theo seller chỉ đúng khi mỗi seller là đúng một thực thể. Nếu chọn khoá mà không kiểm coverage trước, thì một seller có thể bị đếm thành hai, hoặc hai seller gộp thành một — và sai lệch này không lộ ra ở tổng, chỉ lộ ra khi khách hàng soi từng dòng.",
          decision:
            "Chốt một khoá định danh duy nhất, xác nhận tỷ lệ coverage trên dữ liệu thật, và verify riêng điều kiện lọc phân định luồng đơn trước khi cho phép bất kỳ báo cáo nào chạy trên nó.",
          term: "Entity resolution — chốt khoá và đo coverage trước khi báo cáo",
        },
        {
          /* Lấy từ KAS-159 / KAS-164: chuyển data job GXT Dashboard sang StarRocks. */
          problem: "Hạ tầng truy vấn đổi engine, hàng loạt data job đang trỏ vào chỗ cũ",
          why: "Đổi engine mà bê nguyên query sang là cách nhanh nhất để có một dashboard vẫn chạy nhưng ra số khác — vì cú pháp chạy được không có nghĩa là ngữ nghĩa giữ nguyên.",
          decision:
            "Chuyển từng sheet một, và mỗi sheet đều đối chiếu số cũ với số mới trước khi cắt nguồn. Sheet nào chưa khớp thì chưa chuyển.",
          term: "Migration theo lô có đối chiếu, không cutover một lần",
        },
        {
          /* Decision này lấy từ section `ai` đã bỏ (card "Pipeline không cần người trực").
             Nó thuộc về đây, chứ không phải một section riêng nói về AI. */
          problem: "Báo cáo vẫn phải chờ có người bấm chạy",
          why: "Một pipeline cần người trực thì nó chưa phải hệ thống, chỉ là một script có chủ. Tuần nào người đó nghỉ là tuần đó báo cáo trễ, và cả team quay lại làm tay.",
          decision:
            "Vòng chạy định kỳ qua n8n và Google Apps Script gửi thẳng tới stakeholder. Người chỉ can thiệp khi hệ thống chủ động báo bất thường — không phải khi có người nhớ ra.",
          term: "Automation có cảnh báo, không phải automation im lặng",
        },
      ],

      ownership: {
        owned: [
          "Chốt định nghĩa KPI dùng chung cho toàn team, gồm cả định danh seller và điều kiện phân luồng đơn",
          "Xây SQL model trên Trino / Iceberg làm nguồn duy nhất",
          "Đóng gói quy tắc nghiệp vụ thành agent skill để LLM sinh đúng query và đúng báo cáo",
          "Xây web app theo dõi sản lượng multi-KPI (actual vs forecast vs AOP, theo client và theo tỉnh), thay cho các file Excel/HTML rời rạc",
          "Chuyển data job của dashboard sang engine truy vấn mới, đối chiếu từng sheet trước khi cắt nguồn",
          "Tự động hoá vòng chạy định kỳ và phân phối báo cáo",
        ],
        notOwned: [
          "Hạ tầng lakehouse do team Data Platform vận hành — tôi là người tiêu thụ và mô hình hoá trên đó",
        ],
      },

      results: [
        {
          label: "Thời gian soạn một báo cáo",
          value: "từ hàng giờ xuống vài phút",
          method: "So sánh quy trình soạn tay trước đây với pipeline hiện tại",
          verified: false,
        },
        {
          label: "Tính nhất quán",
          value: "một định nghĩa KPI cho toàn team",
          method: "Thay cho tình trạng mỗi người một cách tính, không truy được nguồn lệch",
          verified: true,
        },
        {
          label: "Nhóm người dùng",
          value: "điều hành vùng · KAM/KAC khách hàng · các team vận hành khác",
          method:
            "Cùng một SQL model chuẩn hoá phục vụ ba định dạng đầu ra khác nhau: báo cáo tuần DOCX, dashboard theo dõi hằng ngày, và bản gửi group điều hành.",
          verified: true,
        },
        {
          label: "Số loại báo cáo đã chuẩn hoá",
          value: "5 loại báo cáo",
          method: "Đếm trực tiếp số loại báo cáo định kỳ đang chạy qua pipeline này",
          verified: true,
        },
      ],

      reflection: [
        "Bài học lớn nhất: vấn đề không phải là viết query nhanh hơn, mà là làm sao để mọi người viết ra cùng một con số. Chuẩn hoá ngữ cảnh có giá trị hơn chuẩn hoá công cụ.",
      ],

      flowHeading: "Từ một định nghĩa KPI tới ba loại đầu ra",
      flow: {
        nodes: [
          { id: "raw", label: "Dữ liệu vận hành thô", sublabel: "Iceberg lakehouse" },
          { id: "model", label: "SQL model chuẩn hoá", sublabel: "Trino — định nghĩa KPI dùng chung" },
          { id: "skill", label: "Agent skill", sublabel: "đóng gói schema và quy tắc nghiệp vụ" },
          { id: "out", label: "Báo cáo DOCX / HTML", sublabel: "định dạng thống nhất toàn team" },
          { id: "send", label: "Phân phối tự động", sublabel: "n8n · Google Apps Script" },
        ],
        edges: [
          { from: "raw", to: "model" },
          { from: "model", to: "skill" },
          { from: "skill", to: "out" },
          { from: "out", to: "send" },
        ],
      },

      stack: [
        { group: "Dữ liệu", items: ["Trino SQL", "Iceberg lakehouse", "Metabase"] },
        { group: "Tự động hoá", items: ["LLM agent skills", "n8n", "Google Apps Script"] },
      ],

      media: [
        {
          id: "kas-monitor",
          kind: "image",
          brief:
            "Dashboard giám sát Vol/Forecast/Capacity theo tỉnh, cập nhật theo ngày — một cách dùng khác của cùng SQL model chuẩn hoá. Đã thay hết số thật bằng dữ liệu demo và che tên đăng nhập.",
          src: "/case-kas-monitor.png",
          alt: "Dashboard theo dõi sản lượng, dự báo và năng lực theo tỉnh, cập nhật theo ngày",
          isDemoData: true,
        },
      ],
    },

    /* ═══════════════════════════════════════════════════════════════════════
       DEEP #2 — GHN. Case có tư duy business rule sắc nhất. Không features —
       sức nặng dồn hết vào decisions.

       ĐÃ THU HẸP PHẠM VI: bản trước gộp cả nhánh tiền (đền bù × truy thu, gửi
       CRC — KAS-131, KAS-166, KAS-91, KAS-71) vào cùng case. Bỏ hẳn nhánh đó,
       vì (a) số tiền là dữ liệu nhạy cảm không public được, (b) gộp hai luận
       điểm vào một case làm loãng cả hai. Case giờ neo vào đúng một việc:
       rule engine quy trách nhiệm kho (KAS-77) — cộng một quyết định từ
       KAS-136, luồng công việc riêng nhưng cùng miền "quy trách nhiệm trễ".

       Slug đổi lại thành `sla-attribution` cho khớp bảng case trong CLAUDE.md;
       hậu tố `-recovery` chính là phần truy thu vừa bỏ.
       ═══════════════════════════════════════════════════════════════════════ */
    {
      slug: "sla-attribution",
      tier: "deep",
      scopeLabel: "Business logic · từ log thô tới một kho chịu trách nhiệm",
      proves:
        "Tôi biến tranh chấp giữa các bộ phận thành một quy tắc chạy được — và nói ra khi định nghĩa của người khác có lỗ.",
      title: "Đơn trễ này là lỗi của kho nào",
      client: "Giao Hàng Nhanh (GHN)",
      clientNote: "Công việc chính, toàn thời gian",
      role: "Thiết kế rule engine quy trách nhiệm và xây pipeline trên log ra/vào kho",
      period: "2025 – nay",
      oneLiner:
        "Rule engine đọc log ra/vào kho của từng đơn bị khiếu nại quá hạn, rồi chỉ ra đúng một kho chịu trách nhiệm — thay cho việc mỗi bộ phận tự tra tay rồi tranh luận xem ai sai.",
      accent: "amber",

      keyResult: {
        value: "4 quy tắc · mọi đơn · đúng một kho",
        label: "quy tắc do vận hành chốt · cùng một đơn chạy lại luôn ra cùng kết quả",
        verified: true,
      },

      context: [
        "Một đơn quá hạn đi qua nhiều kho: kho lấy, kho luân chuyển, kho giao, và có thể cả kho trả. Khi khách hàng mở khiếu nại đền bù, câu phải trả lời là kho nào đã giữ hàng quá lâu — và câu trả lời đó dẫn tới chế tài thật với một bưu cục thật.",
        "Trước đó, câu trả lời phụ thuộc vào bộ phận nào tra log nhanh hơn và lập luận thuyết phục hơn. Cùng một đơn, hai người tra có thể ra hai kho khác nhau — nên kết luận nào cũng bị phản bác được, và cuộc họp nào cũng quay lại từ đầu.",
      ],

      decisions: [
        {
          problem: "Nhiều quy tắc cùng đúng trên một đơn, nhưng chỉ được chọn một kho",
          why: "Nếu để rule nào khớp trước thì thắng, kết quả sẽ đổi theo thứ tự dữ liệu — cùng một đơn chạy lại có thể ra kho khác. Mà đầu ra này dẫn tới chế tài với một bưu cục cụ thể, nên chỉ cần một lần kết quả không tái lập được là mất luôn niềm tin của vận hành.",
          decision:
            "Định nghĩa thứ tự ưu tiên rõ ràng giữa các quy tắc và áp dụng nhất quán. Bốn quy tắc được chốt cùng vận hành, mỗi quy tắc gắn với một khâu cụ thể và một ngưỡng tồn cụ thể. Một đơn chỉ có đúng một kho chịu trách nhiệm.",
          term: "Rule priority — kết quả xác định, không phụ thuộc thứ tự dữ liệu",
        },
        {
          /* Quyết định sắc nhất của case. Nó không đến từ kỹ thuật mà từ việc
             nhận ra: nhãn khiếu nại do khách chọn, vi phạm thật do dữ liệu chỉ ra,
             và hai thứ đó không buộc phải trùng nhau. */
          problem: "Có nên chỉ chạy các quy tắc thuộc đúng nhóm khiếu nại của đơn đó",
          why: "Cách tự nhiên nhất là đơn bị khiếu nại 'quá hạn giao' thì chỉ chạy các quy tắc nhóm giao. Nhưng nhóm khiếu nại do phía khách chọn, còn vi phạm thật nằm ở chỗ dữ liệu chỉ ra — hai thứ đó không buộc phải trùng nhau. Chạy hẹp theo nhóm nghĩa là mọi ca lệch nhóm đều lặng lẽ trả về 'không tìm thấy vi phạm', và không ai biết mình đang bỏ sót.",
          decision:
            "Chạy cả bốn quy tắc trên mọi đơn, bất kể đơn đó thuộc nhóm khiếu nại nào, rồi đếm số quy tắc cùng vi phạm trên từng đơn. Nhờ vậy bắt được đúng loại ca mà cách làm hẹp bỏ sót: đơn khiếu nại 'quá hạn giao' nhưng vi phạm thật nằm ở khâu trả hàng.",
          term: "Đánh giá vét cạn thay vì lọc theo nhãn đầu vào",
        },
        {
          problem: "Log ra/vào kho có nhiễu: quét trùng, quét thiếu, thứ tự không chuẩn",
          why: "Quét trùng làm một lần nhập kho trông như hai; quét thiếu làm đơn trông như chưa bao giờ rời kho. Cả hai đều dẫn tới quy sai trách nhiệm — và quy sai một lần là mất luôn sự hợp tác của kho đó.",
          decision:
            "Gom log thành các episode nhập/xuất có ý nghĩa nghiệp vụ trước khi áp rule, thay vì chạy rule thẳng trên từng dòng log.",
          term: "Chuẩn hoá event thành episode trước khi suy luận",
        },
        {
          problem: "'Tồn quá 2 ngày' nên đếm theo ngày trên lịch hay theo 48 giờ trôi qua",
          why: "Hai cách đếm cho ra hai tập kho vi phạm khác nhau, và phần lệch rơi đúng vào các ca sát ngưỡng — tức các ca dễ bị phản bác nhất. Đây là loại chi tiết không ai hỏi tới lúc thiết kế, nhưng là chỗ đầu tiên bị chất vấn khi một bưu cục không đồng ý với kết luận.",
          decision:
            "Đếm theo ngày trên lịch, vì kho vận hành theo ngày và theo chuyến luân chuyển trong ngày, không theo đồng hồ bấm giây từ lúc quét. Chọn xong thì ghi thẳng vào định nghĩa chỉ tiêu, để lần sau không ai phải đoán lại.",
          term: "Grain của ngưỡng thời gian — calendar day, không phải elapsed hours",
        },
        {
          /* KAS-136 — luồng công việc riêng, cùng miền "quy trách nhiệm trễ".
             Đây là decision duy nhất trong cả bốn case thể hiện việc phản biện
             định nghĩa của một bộ phận khác, và đúng. Giữ nó ở đây vì nó thuộc
             cùng câu hỏi nghiệp vụ: ai chịu trách nhiệm cho một đơn trễ. */
          problem:
            "Vận hành kết luận seller bàn giao trễ nên đơn về kho giao trễ — dựa trên một định nghĩa thiếu ràng buộc",
          why: "Chỉ tiêu họ dùng đo 'đơn vào kho trung chuyển trước 22h30', nhưng không ràng buộc đó phải cùng ngày với lúc lấy hàng. Một đơn lấy hôm nay, vào kho trung chuyển 22h00 hôm sau vẫn được tính là đạt. Định nghĩa lỏng như vậy làm chỉ tiêu trông cao hơn thực tế, và mọi kết luận rút ra từ nó đều chỉ về phía seller.",
          decision:
            "Không phản bác bằng lời. Dựng lại chỉ tiêu theo cả hai định nghĩa — bản lỏng họ đang dùng và bản chặt có ràng buộc cùng ngày — rồi đặt cạnh nhau trên cùng tệp dữ liệu để khoảng lệch tự nói. Song song tách riêng ba khâu bàn giao / trung chuyển / giao để thấy khâu nào thật sự đóng góp vào trễ, chạy cho cả tệp seller VIP và toàn bộ seller.",
          term: "Audit định nghĩa chỉ tiêu — một ngưỡng thời gian cần ràng buộc grain ngày",
        },
      ],

      ownership: {
        owned: [
          "Phỏng vấn vận hành để diễn giải bốn quy tắc quy trách nhiệm thành logic chạy được, và chốt thứ tự ưu tiên giữa chúng",
          "Thiết kế cách dựng episode nhập/xuất kho từ log thô",
          "Xây pipeline Trino sinh một dòng kết quả cho mỗi đơn, kèm số ngày tồn từng khâu và số quy tắc cùng vi phạm",
          "Dựng lại chỉ tiêu trung chuyển theo hai định nghĩa để đối chiếu, và đóng gói cách phân tích thành quy trình dùng lại được",
        ],
        notOwned: [
          "Bốn quy tắc và các ngưỡng tồn do vận hành (OE) chốt — tôi đề xuất cách diễn giải chúng thành dữ liệu và chỉ ra chỗ định nghĩa còn hở",
          "Quyết định chế tài với kho vi phạm thuộc về vận hành — tôi cung cấp cơ sở dữ liệu để họ quyết",
        ],
      },

      results: [
        {
          label: "Kết quả cho vận hành",
          value: "mỗi đơn quá hạn chỉ về đúng một kho",
          method:
            "Thay cho tranh luận thủ công giữa các bộ phận. Cùng một đơn chạy lại luôn ra cùng một kết quả, nên kết luận không bị lật lại vì thứ tự dữ liệu.",
          verified: true,
        },
        {
          label: "Phạm vi quy tắc",
          value: "4 quy tắc · 2 nhóm khiếu nại · chạy trên mọi đơn",
          method:
            "Quá hạn giao và quá hạn trả, mỗi nhóm hai quy tắc gắn với một khâu và một ngưỡng tồn riêng. Cả bốn quy tắc đều do vận hành (OE) xác nhận trước khi áp dụng.",
          verified: true,
        },
        {
          label: "Đầu ra cho mỗi đơn",
          value: "1 dòng · kho vi phạm từng quy tắc · số ngày tồn · số quy tắc cùng vi phạm",
          method:
            "Đủ chi tiết để vận hành tự kiểm lại kết luận trên từng đơn cụ thể, thay vì phải tin vào một con số tổng.",
          verified: true,
        },
        {
          label: "Lỗi định nghĩa đã phát hiện",
          value: "một ngưỡng thời gian thiếu ràng buộc ngày",
          method:
            "Chỉ tiêu 'vào kho trung chuyển trước 22h30' không ràng buộc cùng ngày lấy hàng, làm chỉ tiêu trông cao hơn thực tế. Đã dựng bản định nghĩa chặt để đặt cạnh bản đang dùng.",
          verified: true,
        },
      ],

      reflection: [
        "Phần khó nhất không phải SQL mà là chốt thứ tự ưu tiên giữa các quy tắc — đó là quyết định nghiệp vụ, không phải quyết định kỹ thuật, và nó cần vận hành đồng ý chứ không thể tự quyết.",
        "Khi kết luận của một pipeline dẫn tới chế tài với một bưu cục cụ thể, 'gần đúng' không còn là lựa chọn. Tôi học được cách trình bày kết quả ở mức từng đơn để chính người bị kết luận kiểm lại được — và học được rằng khi định nghĩa của bộ phận khác có lỗ, cách hiệu quả nhất là dựng cả hai bản định nghĩa rồi để khoảng lệch tự nói, chứ không phải tranh luận.",
        "Giữa lúc phân tích, tôi tự tìm ra một lỗi nhân dòng trong query của mình. Nó nhắc rằng người đi chỉ ra lỗi định nghĩa của người khác thì càng phải kiểm số của chính mình trước.",
      ],

      flowHeading: "Từ một dòng log tới một kho chịu trách nhiệm",
      flow: {
        nodes: [
          { id: "log", label: "Log ra/vào kho", sublabel: "dữ liệu thô, có nhiễu" },
          { id: "episode", label: "Episode nhập/xuất", sublabel: "chuẩn hoá event trước khi suy luận" },
          { id: "rule", label: "4 quy tắc chạy trên mọi đơn", sublabel: "không lọc theo nhãn khiếu nại" },
          { id: "pick", label: "Thứ tự ưu tiên", sublabel: "1 đơn → 1 kho chịu trách nhiệm" },
          { id: "out", label: "Bảng chi tiết theo đơn", sublabel: "vận hành tự kiểm lại được" },
        ],
        edges: [
          { from: "log", to: "episode" },
          { from: "episode", to: "rule" },
          { from: "rule", to: "pick" },
          { from: "pick", to: "out" },
        ],
      },
      stack: [{ group: "Dữ liệu", items: ["Trino SQL", "Iceberg", "log ra/vào kho"] }],
    },

    /* ═══════════════════════════════════════════════════════════════════════
       BRIEF — Shopee. Case duy nhất có con số cứng đã được bên thứ ba xác nhận.
       Tier "brief" nên trang ngắn: keyResult → context → decisions → results.
       Không flow, không features, không media. Chính sự NGẮN này tạo hierarchy:
       nó đọc như một dải kết quả, không phải case study thứ tư.
       ═══════════════════════════════════════════════════════════════════════ */
    {
      slug: "shopee-3pl-performance",
      tier: "brief",
      scopeLabel: "Kết quả đã kiểm chứng · 4 năm",
      proves: "Con số cứng nhất trong portfolio này — đã được cả Shopee và đối tác vận chuyển xác nhận.",
      title: "Hiệu suất đối tác vận chuyển 3PL",
      client: "Shopee",
      role: "Phân tích hiệu suất 3PL và điều phối cải tiến cùng đối tác",
      period: "2021 – 2025",
      oneLiner:
        "Hệ thống theo dõi KPI 3PL và cơ chế làm việc với đối tác: pickup on-time Viettel Post từ 90.1% lên 97.5%, contact rate giảm 15–20% mỗi đơn.",
      accent: "lime",

      keyResult: {
        value: "90.1% → 97.5%",
        label: "pickup on-time của Viettel Post, theo dõi trong 4 năm",
        verified: true,
      },

      context: [
        "Shopee giao phần lớn sản lượng cho các đối tác vận chuyển bên thứ ba: Vietnam Post, Viettel Post, J&T. Hiệu suất đối tác ảnh hưởng trực tiếp tới trải nghiệm người mua.",
        "Nhưng dữ liệu nằm rải rác, mỗi bên nhìn một bộ số, và chu kỳ phản hồi tới đối tác quá chậm để kịp điều chỉnh.",
      ],

      decisions: [
        {
          problem: "Đối tác và Shopee tranh luận trên hai bộ số khác nhau",
          why: "Không thể cải thiện thứ mà hai bên còn chưa thống nhất cách đo. Mỗi cuộc họp trôi qua trong việc đối chiếu số thay vì bàn cách khắc phục.",
          decision:
            "Cho đối tác nhìn chung một dashboard với cùng định nghĩa KPI. Cuộc họp chuyển từ tranh luận số liệu sang bàn hành động cụ thể theo khu vực.",
          term: "Nguồn sự thật chung giữa các bên",
        },
        {
          problem: "Contact rate cao vì người mua không hiểu đơn đang ở đâu",
          why: "Mỗi cuộc gọi tới tổng đài là một chi phí, và phần lớn xuất phát từ việc trạng thái hiển thị không trả lời được câu hỏi đơn giản nhất: bao giờ hàng tới.",
          decision:
            "Phân tích các trạng thái gây thắc mắc nhiều nhất và thiết kế lại luồng hiển thị quanh câu hỏi đó, thay vì mô tả quy trình nội bộ.",
          term: "Thiết kế chỉ số quanh câu hỏi của người dùng cuối",
        },
      ],

      ownership: {
        owned: [
          "Xây dashboard KPI tự động bằng SQL và Google Sheets cho cả nội bộ lẫn đối tác",
          "Thiết lập nhịp làm việc định kỳ với đối tác dựa trên cùng một bộ số",
          "Phân tích và thiết kế lại luồng trạng thái vận chuyển hiển thị cho người mua",
        ],
        notOwned: ["Vận hành giao nhận thực tế thuộc về đối tác — vai trò của tôi là phân tích và điều phối"],
      },

      results: [
        {
          label: "Pickup on-time (Viettel Post)",
          value: "90.1% → 97.5%",
          method: "Theo dõi KPI hằng tuần và làm việc có cấu trúc với đối tác",
          verified: true,
        },
        {
          label: "Contact rate mỗi đơn",
          value: "giảm 15–20%",
          method: "Sau khi thiết kế lại luồng trạng thái vận chuyển",
          verified: true,
        },
        {
          label: "Khối lượng thủ công của team",
          value: "giảm khoảng 30%",
          method: "Nhờ công cụ báo cáo tự động bằng Google Apps Script",
          verified: false,
        },
      ],

      reflection: [
        "Con số 97.5% không đến từ một phân tích xuất sắc nào cả. Nó đến từ việc lặp lại một nhịp làm việc đủ lâu: cùng nhìn một bộ số, chỉ ra khu vực cụ thể, theo tới khi khắc phục xong.",
      ],

      flow: null,
      stack: [{ group: "Công cụ", items: ["SQL", "Google Sheets", "Google Apps Script"] }],
    },
  ],

  /* Section `ai` đã bị XOÁ (3 card của nó mô tả lại chính case GHN reporting, và câu
     về AI bị lặp 3 lần trên site cũ). Section `process` cũ — 6 bước kiểu "quan sát nỗi
     đau vận hành / dựng bản thử / lặp cùng người dùng" — cũng bỏ: analyst nào cũng viết
     được y hệt nên nó không chứng minh gì.

     Thay bằng đường đi THẬT của một dashboard tại GHN, với ràng buộc ghi rõ ở mỗi mắt.
     Luận điểm: Vinh ship được sản phẩm chạy thật mà KHÔNG sở hữu một mẩu hạ tầng nào —
     không quyền ghi warehouse, không server, không DevOps. Thứ không fake được ở đây là
     các RÀNG BUỘC; không ai bịa ra được chúng nếu chưa sống trong tổ chức đó. */
  pipeline: {
    heading: "Đường đi của một dashboard, từ yêu cầu tới production",
    intro:
      "Tôi không sở hữu hạ tầng nào trong chuỗi này: không có quyền ghi vào lakehouse, không tự tạo được job định kỳ, không được cấp server. Mỗi mắt dưới đây là một đường hợp lệ tìm ra trong ràng buộc sẵn có — và chính các ràng buộc đó định hình kiến trúc, chứ không phải sở thích kỹ thuật của tôi.",
    steps: [
      {
        label: "Chốt lại câu hỏi",
        tool: "Trao đổi với stakeholder",
        owner: "Tôi",
        body: "Yêu cầu ban đầu gần như luôn là \"cho tôi cái dashboard\". Việc đầu tiên là quy nó về một câu hỏi trả lời được: đo trên grain nào, đơn nào được tính, ngưỡng nào thì gọi là bất thường. Chưa chốt xong phần này thì mọi thứ phía sau đều phải làm lại.",
      },
      {
        label: "Tự viết query, tự kiểm output",
        tool: "Trino · Iceberg lakehouse",
        owner: "Tôi",
        constraint: "Chỉ có quyền đọc lakehouse",
        body: "Tôi không chờ ai viết query hộ. Viết xong thì chạy song song với nguồn số đang dùng và phải giải thích được từng chỗ lệch. Số chưa khớp thì không có bước tiếp theo — đây là chỗ tôi dừng nhiều lần nhất.",
      },
      {
        label: "Nhờ team BI dựng job định kỳ",
        tool: "Cronjob → Google Sheets",
        owner: "Team BI",
        constraint: "Quyền tạo job định kỳ thuộc team khác",
        body: "Tôi không tự tạo được job, nên query phải viết sao cho team BI dựng được ngay và chạy ổn định mà không cần tôi giải thích lại, và phải xếp được vào lịch của họ. Thiết kế trong năng lực và thời gian của một team khác là ràng buộc thật, không phải chi tiết phụ.",
      },
      {
        label: "Đồng bộ sang cơ sở dữ liệu ứng dụng",
        tool: "Google Apps Script → Supabase",
        owner: "Tôi",
        constraint: "Kênh chia sẻ file trực tiếp bị chặn theo chính sách; đích đến đã được phê duyệt",
        body: "Script chạy theo lịch, chuẩn hoá kiểu dữ liệu và chặn dòng lỗi ngay tại biên thay vì để số sai chảy vào ứng dụng. Đây là mắt tôi phải thiết kế cẩn thận nhất, vì nó là chỗ duy nhất dữ liệu đi qua ranh giới hệ thống.",
      },
      {
        label: "Mô hình hoá lại cho ứng dụng",
        tool: "PostgreSQL (Supabase) · RLS",
        owner: "Tôi",
        body: "Dữ liệu báo cáo và dữ liệu ứng dụng cần hai mô hình khác nhau. Ở đây tôi dựng lại schema theo cách ứng dụng đọc, và bật Row Level Security để phân quyền được thực thi ở tầng cơ sở dữ liệu chứ không chỉ ở giao diện.",
      },
      {
        label: "Dựng ứng dụng",
        tool: "React · TypeScript",
        owner: "Tôi",
        body: "Filter theo client, vùng và loại hub; panel tự đẩy các trường hợp cần can thiệp lên trước; nút xuất ảnh cho từng mục vì đích thật của báo cáo là group điều hành, không phải màn hình.",
      },
      {
        label: "Deploy và vận hành",
        tool: "Vercel · phân quyền theo vai trò",
        owner: "Tôi",
        body: "Lên production, cấp quyền theo vai trò, rồi sửa theo phản hồi thật. Sản phẩm nội bộ không có ngày ra mắt — chỉ có tuần thứ nhất, tuần thứ hai, và những gì người dùng phàn nàn ở tuần thứ ba.",
      },
    ],
    /* Tự nhận điểm yếu kiến trúc. Kỹ sư dữ liệu nào đọc cũng thấy ngay, nên giấu đi thì
       mất điểm thật; nói ra thì nó thành bằng chứng về khả năng phán đoán. */
    tradeoff:
      "Chuỗi này là đồ ghép, và tôi biết điều đó. Google Sheets ở giữa là điểm dễ vỡ, Apps Script không có retry và không tự báo khi job chết, mỗi mắt nối thêm là thêm một chỗ có thể lệch số. Tôi chọn nó vì đó là đường hợp lệ duy nhất trong quyền hạn mình có. Nếu được cấp quyền ghi vào warehouse, tôi đã bỏ hai mắt giữa và cho ứng dụng đọc thẳng từ một bảng được quản lý.",
    aiNote:
      "Tôi dùng AI-assisted coding để rút ngắn khoảng cách từ ý tưởng tới sản phẩm chạy được. Phần thuộc về tôi — và cũng là phần khó — là đóng khung vấn đề, chốt business rule, kiểm chứng đầu ra và chịu trách nhiệm khi số sai.",
  },

  skills: [
    {
      title: "Phân tích & truy vấn",
      items: [
        "SQL (Trino/Presto, StarRocks, PostgreSQL)",
        "Python",
        "Excel / Google Sheets nâng cao",
        "Phân tích nguyên nhân gốc",
      ],
    },
    {
      title: "Mô hình hoá dữ liệu",
      items: [
        "Thiết kế fact / dimension",
        "Định nghĩa grain và khoá",
        "Dimension có hiệu lực theo thời gian",
        "Chuẩn hoá định nghĩa KPI dùng chung",
      ],
    },
    {
      title: "BI & báo cáo",
      items: ["Metabase", "Power BI", "Looker Studio", "Thiết kế dashboard cho cấp quản lý", "Báo cáo định kỳ tự động"],
    },
    {
      title: "Chất lượng & đối chiếu dữ liệu",
      items: [
        "Validation ở biên (staging rồi promote)",
        "Đối chiếu song song khi thay quy trình",
        "Đối chiếu số tiền hai chiều",
        "Entity resolution & kiểm coverage khoá",
        "Test cho business rule",
        "Audit trail, RLS & phân quyền",
      ],
    },
    {
      title: "Tự động hoá",
      items: ["n8n", "Google Apps Script", "LLM agent workflow", "AI-assisted development"],
    },
    {
      title: "Nghiệp vụ",
      items: [
        "Vận hành logistics & thương mại điện tử",
        "Quản lý SLA và escalation",
        "Dự báo sản lượng",
        "Làm việc với stakeholder và đối tác",
      ],
    },
  ],

  experience: [
    {
      company: "Giao Hàng Nhanh (GHN)",
      role: "Key Account Solution / Data Analyst",
      period: "2025 – nay",
      summary:
        "Phụ trách dữ liệu, hiệu suất vận hành và đối chiếu tài chính cho các tài khoản chiến lược (Shopee Express, Shopee Bulky, TikTok Shop). Làm việc trực tiếp với điều hành vùng, team KA của khách hàng và bộ phận kiểm soát nội bộ.",
      highlights: [
        "Xây pipeline SQL trên Trino quy trách nhiệm từng đơn vi phạm SLA về đúng kho gây ra — bốn quy tắc do vận hành chốt, chạy vét cạn trên mọi đơn, kết quả tái lập được. Đầu ra được dùng tiếp cho khâu đối chiếu tài chính với bộ phận kiểm soát nội bộ.",
        "Chuẩn hoá định nghĩa KPI cho toàn team — gồm cả định danh seller và điều kiện phân luồng đơn — và xây pipeline sinh báo cáo tự động từ dữ liệu thô.",
        "Xây web app theo dõi sản lượng multi-KPI (actual vs forecast vs AOP, theo client và theo tỉnh), thay cho các file Excel/HTML rời rạc.",
        "Chuyển data job của dashboard sang engine truy vấn mới theo từng lô, đối chiếu số cũ với số mới trước khi cắt nguồn.",
        "Dựng báo cáo điều hành theo vùng/hub cho giám đốc vùng, phân phối tự động qua n8n và Google Apps Script.",
        "Hỗ trợ các team khác (vận hành, chăm sóc khách hàng) dựng báo cáo và trực quan hoá backlog trên cùng nguồn dữ liệu chuẩn hoá.",
      ],
    },
    {
      company: "Interdist",
      role: "Sở hữu dữ liệu & sản phẩm (bán thời gian, từ xa)",
      period: "T5/2026 – nay",
      summary:
        "Làm song song với GHN, khoảng 18 giờ/tuần. Sở hữu toàn bộ phần dữ liệu và sản phẩm của hệ thống vận hành doanh số P&G.",
      highlights: [
        "Chuyển quy trình tổng hợp doanh số từ các file Excel rời rạc sang một cơ sở dữ liệu trung tâm có kiểm soát chất lượng.",
        "Thiết kế lược đồ dữ liệu và business rule: giá theo khoảng hiệu lực, phân bổ chỉ tiêu theo lịch hoạt động cửa hàng.",
        "Xây và vận hành sản phẩm một mình, từ frontend tới cơ sở dữ liệu và phân quyền.",
      ],
    },
    {
      company: "Shopee",
      role: "Logistics Management Specialist",
      period: "2021 – 2025",
      summary: "Phân tích hiệu suất đối tác vận chuyển (Vietnam Post, Viettel Post, J&T).",
      highlights: [
        "Đưa pickup on-time của Viettel Post từ 90.1% lên 97.5% thông qua theo dõi dữ liệu chặt và phối hợp có cấu trúc với đối tác.",
        "Thiết kế lại luồng trạng thái vận chuyển dựa trên phân tích dữ liệu, giảm 15–20% contact rate trên mỗi đơn.",
        "Xây dashboard SQL + Google Sheets tự động cho cấp quản lý và đối tác.",
      ],
    },
    {
      company: "J&T Express",
      role: "Key Account Specialist",
      period: "2020 – 2021",
      summary: "Vận hành luồng đơn khối lượng lớn cùng bộ phận logistics của Shopee (~300.000 đơn/ngày).",
      highlights: [
        "Dựng dashboard và báo cáo nội bộ chuẩn hoá chỉ số cho đội vận hành.",
        "Dùng dữ liệu để theo dõi các sáng kiến và thiết kế giải pháp giao hàng.",
      ],
    },
    {
      company: "A.P. Moller Maersk",
      role: "Export Care Business Partner",
      period: "2019 – 2020",
      summary: "Đối tác vận hành cho khách hàng xuất khẩu, phối hợp với đại lý nước ngoài và các bộ phận nội bộ.",
      highlights: ["Duy trì độ chính xác master data khách hàng để tối ưu hệ thống nội bộ và trải nghiệm end-to-end."],
    },
  ],

  contact: {
    heading: "Cùng trao đổi nhé",
    /* Thêm một câu cho nửa client consulting — trước đây body chỉ nói với nhà tuyển dụng. */
    body: "Nếu team bạn cần một người hiểu nghiệp vụ đủ sâu để định nghĩa đúng con số, và đủ tay nghề để tự dựng hệ thống sinh ra con số đó — mình rất muốn trao đổi. Mình cũng nhận dự án data product theo phạm vi rõ ràng, làm từ xa.",
    email: "luongthevinh996@gmail.com",
    linkedin: "https://www.linkedin.com/in/vinhluongg/",
    cvHref: "/cv.pdf",
    availability: "ĐANG TÌM VỊ TRÍ BI / DATA ANALYST · NHẬN DỰ ÁN DATA PRODUCT",
  },
};
