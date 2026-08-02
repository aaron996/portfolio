import type { SiteContent } from "./types";

export const content: SiteContent = {
  meta: {
    name: "Lương Thế Vinh",
    roleLabel: "Data & Business Analytics",
    title: "Lương Thế Vinh — BI & Data Analyst",
    description:
      "Tôi biến quy trình báo cáo thủ công thành hệ thống dữ liệu chạy đúng mỗi tuần. 6 năm trong logistics và thương mại điện tử: Shopee, GHN, J&T Express, Maersk.",
    ogImage: "/og.png",
    url: "https://TODO-thay-domain.com",
    locale: "vi_VN",
  },

  nav: [
    { label: "Case study", href: "#featured" },
    { label: "AI", href: "#ai" },
    { label: "Dự án", href: "#projects" },
    { label: "Năng lực", href: "#skills" },
    { label: "Kinh nghiệm", href: "#experience" },
  ],

  hero: {
    eyebrow: "BI / DATA ANALYST · AI-ASSISTED BUILDER · HỒ CHÍ MINH",
    headline: ["Analyst tự build được", "sản phẩm dữ liệu"],
    subline:
      "Tôi dùng AI để đi từ nghiệp vụ tới hệ thống chạy thật — nhưng con số thì tôi tự định nghĩa, tự đối chiếu và tự chịu trách nhiệm khi nó sai. Sáu năm trong vận hành logistics và thương mại điện tử.",
    primaryCta: { label: "Xem case study", href: "#featured" },
    secondaryCta: { label: "Tải CV", href: "/cv.pdf" },
    stats: [],
    liveCard: {
      label: "Sản phẩm đang chạy production",
      figures: [
        { value: "41", label: "cửa hàng" },
        { value: "176", label: "SKU đang quản lý" },
      ],
    },
    ticker: [
      "SQL / Trino",
      "Iceberg lakehouse",
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

  statBand: [
    { value: "6", suffix: "+", label: "năm vận hành & phân tích" },
    { value: "97.5", suffix: "%", label: "pickup on-time, từ 90.1% (VTP)" },
    { value: "4", label: "hệ thống dữ liệu đã ship" },
    { value: "300", suffix: "k", label: "đơn/ngày từng vận hành" },
  ],

  intro: {
    heading: "Tôi đứng giữa nghiệp vụ và dữ liệu",
    body: [
      "Tôi bắt đầu từ vận hành, không phải từ kỹ thuật. Sáu năm ngồi trong logistics và thương mại điện tử dạy tôi một thứ mà không khoá học nào dạy được: biết khi nào một con số trông thì đúng nhưng thật ra sai, và sai ở khâu nào.",
      "Công việc của tôi là dịch vấn đề vận hành thành định nghĩa dữ liệu rõ ràng — chỉ tiêu này tính trên grain nào, đơn nào được tính, ngoại lệ xử lý ra sao — rồi biến định nghĩa đó thành pipeline và báo cáo chạy đều đặn mà người dùng tin được.",
      "Tôi dùng AI để viết code nhanh hơn. Nhưng phần khó không nằm ở code: nó nằm ở việc quyết định business rule nào đúng, kiểm chứng đầu ra với dữ liệu thật, và chịu trách nhiệm khi báo cáo lệch.",
    ],
    boundary:
      "Tôi không định vị mình là software engineer. Tôi là người xây hệ thống dữ liệu cho bài toán vận hành mình hiểu rõ.",
  },

  featuredSlug: "pg-sales-operations",

  cases: [
    /* ─────────────────────────────────────────────────────────────
       CASE 1 — Trụ chính. Đây là case duy nhất bạn sở hữu end-to-end.
       ───────────────────────────────────────────────────────────── */
    {
      slug: "pg-sales-operations",
      kind: "product",
      kindLabel: "Sản phẩm",
      title: "P&G Sales Operations Dashboard",
      client: "Interdist",
      role: "Data Product Owner — sở hữu từ nghiệp vụ, data model, đến sản phẩm vận hành thật",
      period: "T5/2026 – nay",
      oneLiner:
        "Hệ thống nội bộ gom doanh số từ các file Excel rời rạc thành một nguồn dữ liệu duy nhất, có phân quyền, có audit trail, và tự sinh báo cáo cho quản lý.",
      accent: "navy",

      context: [
        "Interdist phụ trách hoạt động phân phối cho P&G qua nhiều kênh và vùng. Số liệu doanh số về dưới dạng file Excel rời rạc, mỗi nguồn một định dạng.",
        "Việc tổng hợp theo vùng, kênh, sản phẩm và chỉ tiêu là công việc tay lặp lại mỗi kỳ. Quản lý cần xem tiến độ target nhanh, nhưng lại không dám tin số nếu không có người kiểm lại.",
        "Tôi tham gia ban đầu ở mảng dashboard, sau đó nhận trọn phần dữ liệu: từ định nghĩa chỉ tiêu, thiết kế bảng, đến xây và vận hành hệ thống.",
      ],

      problems: [
        "Dữ liệu đầu vào không đồng nhất: ngày tháng, định dạng số, mã SKU và cấu trúc file đều khác nhau giữa các nguồn.",
        "Không có một nguồn sự thật duy nhất — mỗi người tổng hợp một kiểu, ra số khác nhau, và không ai truy được số nào đúng.",
        "Chỉ tiêu tháng không thể chia đều cho số ngày; cửa hàng có lịch hoạt động khác nhau và có ngoại lệ theo ngày.",
        "Giá bán thay đổi theo kênh, theo cửa hàng và theo khoảng thời gian hiệu lực — dùng sai giá là sai doanh thu.",
        "Cần kiểm soát ai được sửa gì, và lưu vết mọi thay đổi ảnh hưởng tới con số báo cáo.",
      ],

      ownership: {
        owned: [
          "Phỏng vấn nghiệp vụ và chốt định nghĩa chỉ tiêu",
          "Thiết kế lược đồ dữ liệu (fact doanh số, các bảng dimension cửa hàng / sản phẩm / giá / target)",
          "Business rule: tách SKU, phân bổ target, chọn giá hiệu lực",
          "Xây toàn bộ ứng dụng (AI-assisted): frontend, backend, cơ sở dữ liệu, phân quyền",
          "Kiểm chứng đầu ra bằng dữ liệu thật trước khi phát hành",
          "Vận hành và xử lý phản hồi người dùng sau khi lên production",
        ],
        notOwned: [],
      },

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
            "Chuẩn hoá những gì có quy tắc chắc chắn; còn lại thì từ chối import và báo lỗi cụ thể tới dòng, tới cột. Số sai bị chặn ở biên, không cho chảy vào cơ sở dữ liệu.",
          term: "Validation ở biên (data contract) thay vì sửa ngầm",
        },
        {
          problem: "Giá khác nhau theo kênh, cửa hàng và khoảng thời gian",
          why: "Nếu tính doanh thu bằng giá hiện tại, thì mỗi lần đổi giá là toàn bộ lịch sử doanh thu tự thay đổi theo. Báo cáo tháng trước in ra hôm nay sẽ khác báo cáo in tháng trước.",
          decision:
            "Lưu giá kèm khoảng hiệu lực. Doanh thu luôn tính theo giá đúng tại thời điểm phát sinh giao dịch, không phải giá hiện hành.",
          term: "Effective-dated dimension (tương đương SCD Type 2)",
        },
        {
          problem: "Phân bổ chỉ tiêu tháng thành chỉ tiêu ngày",
          why: "Chia đều cho 30 ngày là sai. Cửa hàng có lịch hoạt động riêng, có ngày nghỉ, có ngoại lệ. Chia sai thì tiến độ hằng ngày trở nên vô nghĩa và quản lý mất niềm tin vào dashboard.",
          decision:
            "Phân bổ theo lịch hoạt động thực của từng cửa hàng, cho phép ghi đè ngoại lệ theo ngày. Mọi điều chỉnh đều có bản xem trước tác động, ghi audit trail, và hoàn tác được.",
          term: "Target allocation theo calendar dimension",
        },
        {
          problem: "Ai được sửa gì, và làm sao truy lại khi số lệch",
          why: "Một hệ thống báo cáo mà ai cũng sửa được thì không phải nguồn sự thật, chỉ là một file Excel đắt tiền hơn.",
          decision:
            "Đăng nhập Google, phân quyền ba mức admin / user / pending. Mọi thao tác ảnh hưởng tới con số đều được ghi log kèm người thực hiện và thời điểm.",
          term: "Quản trị dữ liệu ở mức tối thiểu nhưng đủ dùng",
        },
      ],

      features: [
        {
          title: "Import & chuẩn hoá Excel",
          description:
            "Tải file lên, hệ thống kiểm tra và báo lỗi cụ thể trước khi ghi. Không có dữ liệu nào vào DB mà chưa qua kiểm tra.",
          icon: "file-spreadsheet",
        },
        {
          title: "Dashboard KPI",
          description: "Chỉ tiêu, tiến độ target, xu hướng theo thời gian, bảng chi tiết theo vùng và kênh.",
          icon: "chart-bar",
        },
        {
          title: "Quản lý master data",
          description: "Cửa hàng, sản phẩm/SKU, bảng giá theo khoảng hiệu lực, supervisor và chỉ tiêu.",
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

      stack: [
        { group: "Dữ liệu", items: ["PostgreSQL (Supabase)", "SQL", "Thiết kế lược đồ fact/dimension"] },
        { group: "Ứng dụng", items: ["React 19", "TypeScript", "Vite", "Tailwind CSS", "Express"] },
        { group: "Xử lý & hiển thị", items: ["XLSX parsing", "Recharts"] },
        { group: "Nền tảng", items: ["Google OAuth", "Vercel", "Automated tests cho business rules"] },
      ],

      results: [
        {
          label: "Thời gian tổng hợp một kỳ báo cáo",
          value: { value: "~40–60 giờ / tháng", todo: "" },
          method:
            "Ước tính thận trọng dựa trên quy trình của 3–4 PIC: thay thế thao tác tổng hợp Excel thủ công, giảm phụ thuộc vào công thức lặp lại, và tập trung dữ liệu giá / chỉ tiêu / mapping cửa hàng. Đây là ước tính vận hành, sẽ được xác thực thêm bằng theo dõi thời gian sử dụng thực tế.",
        },
        {
          label: "Người dùng thường xuyên",
          value: { value: "6–10 người", todo: "" },
          method: "Tài khoản đang hoạt động thường xuyên trên hệ thống",
        },
        {
          label: "Phạm vi dữ liệu đang quản lý",
          value: { value: "41 cửa hàng · 176 SKU · 6 vùng · 2 kênh", todo: "" },
          method: "Thống kê từ master data. Hệ thống đang được mở rộng cho các khách hàng khác của Interdist.",
        },
      ],

      reflection: [
        "Sai lầm lớn nhất ở giai đoạn đầu là tôi build dashboard trước khi chốt xong định nghĩa chỉ tiêu. Kết quả là phải làm lại phần tính toán khi nghiệp vụ nói lại cho rõ. Từ đó tôi luôn viết định nghĩa ra giấy và cho người dùng xác nhận trước khi động vào code.",
        "TODO: thêm một điều bạn sẽ làm khác đi nếu làm lại. Mục này khiến người phỏng vấn tin bạn hơn là một danh sách toàn thành tựu.",
      ],

      media: [
        {
          id: "hero-shot",
          kind: "image",
          brief: "Ảnh dashboard chính, đã thay toàn bộ số bằng dữ liệu demo. Che tên cửa hàng và tên người dùng thật.",
          src: null,
          alt: "Màn hình dashboard KPI với biểu đồ xu hướng và bảng chi tiết theo vùng",
          isDemoData: true,
        },
        {
          id: "import-flow",
          kind: "image",
          brief: "Màn hình import Excel đang hiển thị lỗi validation cụ thể — đây là ảnh kể chuyện tốt nhất, vì nó cho thấy hệ thống biết từ chối dữ liệu sai.",
          src: null,
          alt: "Màn hình import hiển thị danh sách lỗi theo dòng",
          isDemoData: true,
        },
        {
          id: "target-preview",
          kind: "image",
          brief: "Màn hình preview khi điều chỉnh target, thấy rõ trước/sau và nút hoàn tác.",
          src: null,
          alt: "Bản xem trước tác động của việc điều chỉnh chỉ tiêu",
          isDemoData: true,
        },
        {
          id: "demo-video",
          kind: "video",
          brief:
            "Video 60–90 giây: import một file lỗi → hệ thống báo lỗi → sửa → import lại → số lên dashboard → xuất báo cáo. Kể đúng một mạch, không cần voiceover.",
          src: null,
          alt: "Video demo luồng sử dụng chính",
          isDemoData: true,
        },
      ],
    },

    {
      slug: "kas-reporting-automation",
      kind: "system",
      kindLabel: "Hệ thống",
      title: "Báo cáo tự động cho Key Account",
      client: "Giao Hàng Nhanh (GHN)",
      role: "Thiết kế và xây dựng — từ SQL model tới pipeline sinh báo cáo",
      period: "2025 – nay",
      oneLiner:
        "Chuẩn hoá định nghĩa KPI cho toàn team và tự sinh báo cáo tuần từ dữ liệu thô, thay cho quy trình soạn tay từng file.",
      accent: "blue",
      context: [
        "Team Key Account phục vụ các tài khoản lớn (Shopee, TikTok Shop) với báo cáo hiệu suất định kỳ hằng tuần và hằng tháng.",
        "Mỗi người trong team tự viết query, tự dựng bảng, tự soạn file. Kết quả là cùng một chỉ tiêu nhưng mỗi báo cáo ra một con số, và không ai truy được vì sao lệch.",
      ],
      problems: [
        "Định nghĩa KPI không thống nhất: cùng tên chỉ tiêu nhưng khác điều kiện lọc, khác mốc thời gian, khác cách xử lý đơn ngoại lệ.",
        "Soạn báo cáo thủ công tốn nhiều giờ mỗi tuần và chất lượng phụ thuộc vào người làm.",
        "Không có cách nào kiểm tra nhanh xem một con số bất thường là do dữ liệu hay do người viết query.",
      ],
      ownership: {
        owned: [
          "Chốt định nghĩa KPI dùng chung cho toàn team",
          "Xây SQL model trên Trino / Iceberg làm nguồn duy nhất",
          "Đóng gói quy tắc nghiệp vụ thành agent skill để LLM sinh đúng query và đúng báo cáo",
          "Tự động hoá vòng chạy định kỳ và phân phối báo cáo",
        ],
        notOwned: [],
      },
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
      decisions: [
        {
          problem: "Mỗi người prompt một kiểu, ra một số",
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
      ],
      features: [
        {
          title: "SQL model dùng chung",
          description: "Một nguồn định nghĩa KPI duy nhất trên Trino, thay cho query rời rạc của từng người.",
          icon: "database",
        },
        {
          title: "Agent skill sinh báo cáo",
          description: "Từ dữ liệu thô ra báo cáo DOCX/HTML đúng template, đúng cách tính, đúng thuật ngữ.",
          icon: "sparkles",
        },
        {
          title: "Phân phối tự động",
          description: "Vòng chạy định kỳ gửi thẳng tới stakeholder; người chỉ can thiệp khi có cảnh báo bất thường.",
          icon: "send",
        },
      ],
      stack: [
        { group: "Dữ liệu", items: ["Trino SQL", "Iceberg lakehouse", "Metabase"] },
        { group: "Tự động hoá", items: ["LLM agent skills", "n8n", "Google Apps Script"] },
      ],
      results: [
        {
          label: "Thời gian soạn một báo cáo",
          value: { value: "từ hàng giờ xuống vài phút", todo: "" },
          method: "So sánh quy trình soạn tay trước đây với pipeline hiện tại",
        },
        {
          label: "Tính nhất quán",
          value: { value: "một định nghĩa KPI cho toàn team", todo: "" },
          method: "Thay cho tình trạng mỗi người một cách tính",
        },
      ],
      reflection: [
        "Bài học lớn nhất: vấn đề không phải là viết query nhanh hơn, mà là làm sao để mọi người viết ra cùng một con số. Chuẩn hoá ngữ cảnh có giá trị hơn chuẩn hoá công cụ.",
      ],
      media: [
        {
          id: "kas-report-sample",
          kind: "image",
          brief:
            "Một trang báo cáo tuần do pipeline sinh ra, đã thay hết số thật bằng dữ liệu demo và che tên khách hàng.",
          src: null,
          alt: "Trang báo cáo tuần với bảng KPI và biểu đồ",
          isDemoData: true,
        },
      ],
    },

    /* ─────────────────────────────────────────────────────────────
       CASE 3 — Pipeline SQL. Đây là chỗ tư duy business rule sắc nhất.
       ───────────────────────────────────────────────────────────── */
    {
      slug: "sla-attribution",
      kind: "system",
      kindLabel: "Pipeline SQL",
      title: "Quy trách nhiệm đơn vi phạm SLA",
      client: "Giao Hàng Nhanh (GHN)",
      role: "Thiết kế rule engine và xây toàn bộ pipeline",
      period: "2025 – nay",
      oneLiner:
        "Rule engine trên log ra/vào kho, chỉ đúng kho hoặc chặng hành trình gây trễ — để vận hành khắc phục đúng chỗ thay vì đổ lỗi vòng quanh.",
      accent: "amber",
      context: [
        "Một đơn trễ đi qua nhiều kho và nhiều chặng. Khi khách hàng khiếu nại, câu hỏi đầu tiên luôn là: trễ ở đâu, ai chịu trách nhiệm.",
        "Trước đó câu trả lời phụ thuộc vào việc ai tra tay nhanh hơn, và thường kết thúc bằng tranh cãi giữa các bộ phận.",
      ],
      problems: [
        "Nhiều quy tắc có thể cùng chỉ ra một đơn là vi phạm, nhưng chỉ được chọn một kho chịu trách nhiệm.",
        "Log ra/vào kho có nhiễu: quét trùng, quét thiếu, thứ tự không chuẩn.",
        "Kết quả phải giải thích được cho vận hành, nếu không thì không ai chấp nhận.",
      ],
      ownership: {
        owned: [
          "Phỏng vấn vận hành để rút ra quy tắc quy trách nhiệm và thứ tự ưu tiên giữa chúng",
          "Thiết kế cách dựng episode nhập/xuất kho từ log thô",
          "Xây pipeline Trino và bộ ca hồi quy để bảo vệ logic khi mở rộng rule",
        ],
        notOwned: [],
      },
      flow: null,
      decisions: [
        {
          problem: "Nhiều quy tắc cùng đúng trên một đơn",
          why: "Nếu để rule nào khớp trước thì thắng, kết quả sẽ đổi theo thứ tự dữ liệu — cùng một đơn chạy lại có thể ra kho khác. Vận hành sẽ không bao giờ tin.",
          decision:
            "Định nghĩa thứ tự ưu tiên rõ ràng giữa các rule và áp dụng nhất quán. Một đơn chỉ có đúng một kho chịu trách nhiệm, và kết quả tái lập được.",
          term: "Rule priority — kết quả xác định, không phụ thuộc thứ tự dữ liệu",
        },
        {
          problem: "Log kho có nhiễu",
          why: "Quét trùng làm một lần nhập kho trông như hai; quét thiếu làm đơn trông như chưa bao giờ rời kho. Cả hai đều dẫn tới quy sai trách nhiệm.",
          decision:
            "Gom log thành các episode nhập/xuất có ý nghĩa nghiệp vụ trước khi áp rule, thay vì chạy rule thẳng trên từng dòng log.",
          term: "Chuẩn hoá event thành episode trước khi suy luận",
        },
        {
          problem: "Làm sao biết rule mới không phá rule cũ",
          why: "Mỗi lần thêm quy tắc là một lần rủi ro các kết quả cũ âm thầm đổi — và không ai phát hiện cho tới khi bị phản ánh.",
          decision:
            "Giữ một bộ ca hồi quy gồm các đơn đã được vận hành xác nhận kết quả đúng. Rule mới phải chạy qua bộ này trước khi áp dụng.",
          term: "Regression cases cho business logic",
        },
      ],
      features: [],
      stack: [{ group: "Dữ liệu", items: ["Trino SQL", "Iceberg", "inside_package_history"] }],
      results: [
        {
          label: "Kết quả cho vận hành",
          value: { value: "mỗi đơn trễ chỉ về đúng một kho", todo: "" },
          method: "Thay cho tranh luận thủ công giữa các bộ phận",
        },
      ],
      reflection: [
        "Phần khó nhất không phải SQL mà là chốt thứ tự ưu tiên giữa các quy tắc — đó là quyết định nghiệp vụ, không phải quyết định kỹ thuật, và nó cần vận hành đồng ý chứ không thể tự quyết.",
      ],
      media: [],
    },

    /* ─────────────────────────────────────────────────────────────
       CASE 4 — Kết quả. Case duy nhất có con số cứng đã được xác nhận.
       ───────────────────────────────────────────────────────────── */
    {
      slug: "shopee-3pl-performance",
      kind: "outcome",
      kindLabel: "Kết quả",
      title: "Hiệu suất đối tác vận chuyển",
      client: "Shopee",
      role: "Phân tích hiệu suất 3PL và điều phối cải tiến cùng đối tác",
      period: "2021 – 2025",
      oneLiner:
        "Hệ thống theo dõi KPI 3PL và cơ chế làm việc với đối tác: pickup on-time VTP từ 90.1% lên 97.5%, contact rate giảm 15–20% mỗi đơn.",
      accent: "navy",
      context: [
        "Shopee giao phần lớn sản lượng cho các đối tác vận chuyển bên thứ ba: Vietnam Post, Viettel Post, J&T.",
        "Hiệu suất đối tác ảnh hưởng trực tiếp tới trải nghiệm người mua, nhưng dữ liệu nằm rải rác và chu kỳ phản hồi tới đối tác quá chậm để kịp điều chỉnh.",
      ],
      problems: [
        "Không có bức tranh KPI thời gian thực dùng chung giữa Shopee và đối tác — mỗi bên nhìn một bộ số.",
        "Khi hiệu suất tụt, mất nhiều ngày mới xác định được nguyên nhân nằm ở khu vực nào.",
        "Luồng trạng thái vận chuyển gây khó hiểu cho người mua, đẩy contact rate lên cao.",
      ],
      ownership: {
        owned: [
          "Xây dashboard KPI tự động bằng SQL và Google Sheets cho cả nội bộ lẫn đối tác",
          "Thiết lập nhịp làm việc định kỳ với đối tác dựa trên cùng một bộ số",
          "Phân tích và thiết kế lại luồng trạng thái vận chuyển hiển thị cho người mua",
        ],
        notOwned: ["Vận hành giao nhận thực tế thuộc về đối tác — vai trò của tôi là phân tích và điều phối"],
      },
      flow: null,
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
      features: [],
      stack: [{ group: "Công cụ", items: ["SQL", "Google Sheets", "Google Apps Script"] }],
      results: [
        {
          label: "Pickup on-time (VTP)",
          value: { value: "90.1% → 97.5%", todo: "" },
          method: "Theo dõi KPI hằng tuần và làm việc có cấu trúc với đối tác",
        },
        {
          label: "Contact rate mỗi đơn",
          value: { value: "giảm 15–20%", todo: "" },
          method: "Sau khi thiết kế lại luồng trạng thái vận chuyển",
        },
        {
          label: "Khối lượng thủ công của team",
          value: { value: "giảm khoảng 30%", todo: "" },
          method: "Nhờ công cụ báo cáo tự động bằng Google Apps Script",
        },
      ],
      reflection: [
        "Con số 97.5% không đến từ một phân tích xuất sắc nào cả. Nó đến từ việc lặp lại một nhịp làm việc đủ lâu: cùng nhìn một bộ số, chỉ ra khu vực cụ thể, theo tới khi khắc phục xong.",
      ],
      media: [],
    },
  ],

  ai: {
    heading: "AI-assisted, human-accountable",
    intro:
      "AI rút ngắn đường từ requirement tới code chạy được. Phần thuộc về tôi — và cũng là phần khó — là đóng khung vấn đề, chốt business rule, kiểm chứng đầu ra, và chịu trách nhiệm khi số sai.",
    cards: [
      {
        label: "Context engineering",
        title: "Agent skill cho team",
        body: "Đóng gói định nghĩa KPI, schema và quy tắc nghiệp vụ thành skill để LLM sinh đúng query và đúng báo cáo — thay vì mỗi người prompt một kiểu, ra một số.",
      },
      {
        label: "Guardrail",
        title: "Test cho business rule",
        body: "Mọi rule AI viết ra đều phải qua test phủ ca oái oăm trong dữ liệu thật, và đối chiếu song song với cách tính cũ. Chưa giải thích được chỗ lệch thì chưa phát hành.",
      },
      {
        label: "Automation",
        title: "Pipeline không cần người trực",
        body: "n8n, Google Apps Script và agent workflow đưa dữ liệu thô thành báo cáo tuần chuẩn hoá, gửi thẳng tới stakeholder. Người chỉ can thiệp khi hệ thống báo bất thường.",
      },
    ],
  },

  process: {
    heading: "Cách tôi làm việc",
    intro:
      "Không có bước nào ở đây là kỹ thuật thuần. Phần lớn thời gian là hiểu cho đúng trước khi xây, và kiểm cho kỹ sau khi xây.",
    steps: [
      {
        title: "Quan sát nỗi đau vận hành",
        body: "Ngồi cạnh người đang làm tay. Xem họ mở file nào, copy cột nào, sửa gì bằng mắt. Đây là nơi phát hiện những quy tắc không ai viết ra.",
      },
      {
        title: "Định nghĩa quy tắc",
        body: "Viết ra bằng chữ: chỉ tiêu tính trên grain nào, đơn nào được tính, ngoại lệ xử lý ra sao. Cho người dùng đọc và xác nhận trước khi động vào code.",
      },
      {
        title: "Dựng bản thử",
        body: "Làm nhanh một bản đủ để nhìn thấy, không đủ để dùng. Mục tiêu là để người dùng chỉ ra chỗ tôi hiểu sai, càng sớm càng rẻ.",
      },
      {
        title: "Xây với AI hỗ trợ",
        body: "AI giúp tôi đi từ requirement tới code chạy được nhanh hơn nhiều lần. Nhưng nó không quyết định thay tôi business rule nào đúng.",
      },
      {
        title: "Đối chiếu với dữ liệu thật",
        body: "Chạy song song với cách tính cũ, tìm chỗ lệch, và giải thích được từng chỗ lệch. Báo cáo chưa đối chiếu được thì chưa được phát hành.",
      },
      {
        title: "Lặp cùng người dùng",
        body: "Sản phẩm nội bộ không có ngày ra mắt. Nó chỉ có tuần thứ nhất, tuần thứ hai, và những gì người dùng phàn nàn ở tuần thứ ba.",
      },
    ],
    aiNote:
      "Tôi dùng AI-assisted coding để rút ngắn khoảng cách từ ý tưởng tới sản phẩm chạy được. Phần thuộc về tôi — và cũng là phần khó — là đóng khung vấn đề, chốt business rule, kiểm chứng đầu ra và chịu trách nhiệm khi số sai.",
  },

  skills: [
    {
      title: "Phân tích & truy vấn",
      items: ["SQL (Trino/Presto, PostgreSQL)", "Python", "Excel / Google Sheets nâng cao", "Phân tích nguyên nhân gốc"],
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
      title: "Chất lượng dữ liệu",
      items: ["Validation ở biên", "Đối chiếu số liệu", "Test cho business rule", "Audit trail & phân quyền"],
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
      role: "Key Account Specialist",
      period: "2025 – nay",
      summary:
        "Phụ trách dữ liệu và hiệu suất vận hành cho các tài khoản chiến lược (Shopee, TikTok Shop).",
      highlights: [
        "Xây pipeline SQL trên Trino quy trách nhiệm từng đơn vi phạm SLA về đúng kho hoặc chặng hành trình gây ra, giúp vận hành khắc phục đúng chỗ.",
        "Thiết kế hệ thống sinh báo cáo tự động từ dữ liệu thô, chuẩn hoá chất lượng báo cáo trong toàn team.",
        "Theo dõi sản lượng so với forecast/AOP và tuân thủ SLA, đưa khuyến nghị dựa trên dữ liệu được cả khách hàng lẫn vận hành áp dụng.",
        "Tự động hoá các quy trình lặp lại bằng n8n và Google Apps Script.",
      ],
    },
    {
      company: "Interdist",
      role: "Xây hệ thống quản lý doanh số nội bộ",
      period: "2026 – nay",
      summary:
        "Làm việc từ xa, bán thời gian, song song với GHN. Sở hữu toàn bộ phần dữ liệu và sản phẩm của hệ thống vận hành doanh số.",
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
        "Đưa pickup on-time của VTP từ 90.1% lên 97.5% thông qua theo dõi dữ liệu chặt và phối hợp có cấu trúc với đối tác.",
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
    body: "Nếu team bạn cần một người hiểu nghiệp vụ đủ sâu để định nghĩa đúng con số, và đủ tay nghề để tự dựng hệ thống sinh ra con số đó — mình rất muốn trao đổi.",
    email: "luongthevinh996@gmail.com",
    linkedin: "https://www.linkedin.com/in/vinhluongg/",
    cvHref: "/cv.pdf",
    availability: "ĐANG TÌM VỊ TRÍ BI / DATA ANALYST · DATA PRODUCT",
  },
};
