import type { SiteContent } from "./types";
import { caseStudies } from "./cases.vi";

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
  prototype: {
    hero: {
      heading: "MAKE SENSE OF DATA, MAKE THINGS WORK",
      headlineLines: ["MAKE SENSE", "OF DATA", "MAKE THINGS", "WORK"],
      primary: { label: "Xem công việc tiêu biểu", href: "#cases" },
    },
    labels: {
      skip: "Đến nội dung chính", navigation: "Điều hướng chính",
    },
    intro: {
      src: "/portfolio/video/intro-teaser.mp4",
      label: "Video giới thiệu portfolio",
      skip: "Bỏ qua intro",
      soundOn: "Bật tiếng",
      soundOff: "Tắt tiếng",
      play: "Xem intro",
      enter: "Vào portfolio",
      countdown: "Tự động vào sau {s} giây",
      replay: "Xem lại intro",
    },
  },
  /* Homepage mới (10/2026): bỏ video nền và object 3D; hero chỉ còn headline,
     người xem tự rê chuột để "make sense of data". Mỗi section giữ ít chữ —
     phần đọc sâu nằm ở trang case. */
  home: {
    nav: { work: "Công việc", contact: "Liên hệ", game: "Chơi game", cv: "CV", cvLabel: "Xem CV (PDF)" },
    sort: {
      hint: "Rê chuột qua các ô để sắp xếp",
      hintTouch: "Kéo ngón tay qua các ô để sắp xếp",
      sortAll: "Sắp xếp ngay",
      reshuffle: "Xáo lại",
      progress: "đã sắp xếp",
      completed: "Đã sắp xếp xong biểu đồ.",
      canvasLabel: "Các ô dữ liệu lộn xộn, rê chuột qua để chúng xếp thành biểu đồ cột",
      /* Bong bóng của mấy ô "lạc" sau khi sắp xong — xem components/home/heroBuddies.ts. */
      confused: "?",
      spotted: "!",
      scrollCue: "Còn nhiều chuyện phía dưới — cuộn xuống",
    },
    work: {
      heading: "Công việc tiêu biểu",
      count: "case",
      hint: "Rê vào một dòng để xem trước",
      chart: {
        slug: "shopee-3pl-performance",
        before: { year: "Mốc đầu", value: 90.1 },
        after: { year: "Mốc sau", value: 97.5 },
        aria: "Pickup đúng hạn của Viettel Post: 90,1% và 97,5%, hai mốc trong giai đoạn làm việc tại Shopee",
      },
    },
    timeline: {
      heading: "Từ vận hành đến dữ liệu",
      hint: "Chọn một chặng trên đường",
      now: "nay",
      sideJob: "song song",
      axisOps: "Vận hành",
      axisData: "Dữ liệu & sản phẩm",
      chartLabel: "Đường đi nghề nghiệp từ 2019 đến nay, đi dần từ vận hành sang dữ liệu và sản phẩm",
      /* level là vị trí tự đánh giá trên trục vận hành → dữ liệu, không in ra số. */
      items: [
        { company: "A.P. Moller Maersk", short: "Maersk", start: 2019, end: 2020, level: 0.08, role: "Export Care Business Partner", note: "Hàng xuất khẩu và master data khách hàng." },
        { company: "J&T Express", short: "J&T", start: 2020, end: 2021, level: 0.3, role: "Key Account Specialist", note: "Phối hợp với Shopee theo dõi luồng đơn và xử lý vấn đề vận hành." },
        { company: "Shopee", short: "Shopee", start: 2021, end: 2025, level: 0.52, role: "Logistics Management Specialist", note: "Phân tích KPI và phối hợp cải thiện hiệu suất đối tác vận chuyển." },
        { company: "Giao Hàng Nhanh", short: "GHN", start: 2025, end: null, level: 0.8, role: "Key Account Solution / Data Analyst", note: "Phụ trách tài khoản thương mại điện tử, phân tích dữ liệu và xây công cụ theo dõi vận hành cho quản lý." },
        { company: "Interdist", short: "Interdist", start: 2026, end: null, level: 0.97, parallel: true, role: "Dữ liệu & sản phẩm · bán thời gian", note: "Phụ trách hệ thống quản lý doanh số: làm rõ yêu cầu, tổ chức dữ liệu, xây ứng dụng và hỗ trợ sử dụng. Song song với GHN." },
      ],
    },
    about: {
      lead: "Một con số chỉ có nghĩa khi trả lời được",
      questions: [
        { q: "Doanh số đang ở đâu so với chỉ tiêu?", slug: "pg-sales-operations" },
        { q: "Đơn vị nào cần chú ý hôm nay?", slug: "kas-shopee-performance" },
        { q: "Phối hợp thế nào để cải thiện hiệu suất?", slug: "shopee-3pl-performance" },
      ],
      footnote: "AI hỗ trợ viết code; logic nghiệp vụ và đầu ra được kiểm tra trước khi sử dụng.",
      aside: "Ngoài công việc, có một game nhỏ.",
      asideCta: "Thử Ải Vận Hành",
    },
    contact: {
      heading: "Cùng làm rõ con số của bạn?",
      copy: "Chép email",
      copied: "Đã chép",
      linkedin: "LinkedIn",
      linkedinCta: "Nhắn tin",
      cv: "CV (PDF)",
      cvCta: "Tải về",
      gameTitle: "Hoặc vào ải trước đã",
      gameCta: "Chơi Ải Vận Hành",
    },
    footer: { replay: "Xem lại intro", top: "Lên đầu trang" },
    fight: {
      aName: "Chấm", bName: "Lệch", go: "Đấu!", clang: "Keng!", smash: "Rầm!", ping: "Ping!", bong: "Boong!",
      spray: "Xììì…", ko: "K.O.", shutter: "Tách!", win: "{name} vô địch!", rematch: "Xem đấu lại",
      neon: "FIGHT NIGHT", bar: "BAR", exit: "EXIT",
      cheers: ["Hú!", "Ồ!", "Đánh đi!", "Woa!", "Lên!"],
    },
    companions: { hide: "Ẩn bạn đồng hành", show: "Hiện bạn đồng hành", tired: "…" },
  },

  /* Các trang case dùng chung một template theo theme giấy. */
  casePage: {
    back: "Tất cả công việc",
    client: "Khách hàng",
    role: "Vai trò",
    period: "Thời gian",
    context: "Bối cảnh",
    decisions: "Cách giải quyết",
    why: "Vì sao khó",
    decision: "Cách làm",
    features: "Chức năng chính",
    flow: "Luồng dữ liệu",
    media: "Hệ thống trông như thế nào",
    demoData: "Dữ liệu minh hoạ — không phải số liệu kinh doanh thật",
    results: "Kết quả và phạm vi sử dụng",
    owned: "Phạm vi phụ trách",
    notOwned: "Phần phối hợp và giới hạn trách nhiệm",
    stack: "Công nghệ",
    reflection: "Nhìn lại",
    next: "Case tiếp theo",
    others: "Case khác",
    unverified: "Ước tính",
    unverifiedTitle: "Chưa đo hoặc đối chiếu để xác nhận mức thay đổi thực tế",
    progress: "Tiến độ đọc",
    lightbox: { open: "Phóng to ảnh", close: "Đóng ảnh", peek: "Ồ!" },
  },

  /* Trang 404: con trỏ là đèn pin, rọi trúng giữa trang thì lộ ra Null. */
  notFound: {
    code: "404",
    hint: "Rê chuột để rọi đèn",
    hintTouch: "Chạm và kéo để rọi đèn",
    found: "Trang này là NULL.",
    body: "Đường dẫn không trỏ tới đâu cả — Null đứng đây từ đầu mà không ai thấy.",
    lights: "Bật đèn",
    home: "Về trang chủ",
    work: "Xem công việc",
    spotted: "!",
  },

  meta: {
    name: "Lương Thế Vinh",
    title: "Lương Thế Vinh — BI & Data Analyst",
    description:
      "Lương Thế Vinh: kinh nghiệm vận hành logistics và thương mại điện tử, phân tích dữ liệu và xây ứng dụng phục vụ quản lý tại GHN và Interdist.",
    ogImage: "/og.png",
    url: "https://vinhluong-here.vercel.app", // URL Vercel đang chạy (Vinh chốt không mua domain riêng)
    locale: "vi_VN",
  },

  cases: caseStudies,

  contact: {
    heading: "Bạn đang có một con số không ai dám bảo vệ?",
    /* Thêm một câu cho nửa client consulting — trước đây body chỉ nói với nhà tuyển dụng. */
    body: "Nếu team bạn cần một người hiểu nghiệp vụ đủ sâu để định nghĩa đúng con số, và đủ tay nghề để tự dựng hệ thống sinh ra con số đó — mình rất muốn trao đổi. Mình cũng nhận dự án data product theo phạm vi rõ ràng, làm từ xa.",
    email: "luongthevinh996@gmail.com",
    linkedin: "https://www.linkedin.com/in/vinhluongg/",
    cvHref: "/cv.pdf",
  },

  /* ─────────────────────────────────────────────────────────────
     MINIGAME — side-scroller 5 ải, ở route /game.
     Muốn sửa tên quái, tên trùm, câu chốt hay bảng màu thì sửa ở
     đây, không cần đụng vào engine trong components/game/.
     ───────────────────────────────────────────────────────────── */
  game: {
    eyebrow: "MINIGAME · DỰNG BẰNG AI-ASSISTED CODING",
    heading: "Ải Vận Hành",
    intro:
      "Năm bản đồ là năm nơi mình từng làm việc. Khám phá đường đi, xử lý nhiệm vụ và hạ trùm mỗi bản đồ để nhận hai kỹ năng. Hết năm ải là xong sáu năm.",
    note:
      "Game này mình dựng bằng AI-assisted coding. Phần khó không nằm ở code — nó nằm ở chỗ quyết định cái gì đáng đưa vào và cái gì nên bỏ.",
    backHome: "Về trang chủ",
    controlsHint:
      "← → di chuyển · ↑/Space nhảy · ↓/S xuống bệ · J chém · K bắn · L đỡ · B túi đồ · P tạm dừng",
    display: {
      expand: "Mở rộng", collapse: "Thu nhỏ", touchLabel: "Nút cảm ứng",
      touchAuto: "Tự động", touchOn: "Luôn hiện", touchOff: "Ẩn",
      hp: "Máu", guard: "Đỡ", ammo: "Đạn", noGun: "Chưa có súng",
      remaining: "Còn {n}/{total} quái", remainingTarget: "Còn {name} {direction}", toolTime: "Đồ nghề: {n}s",
      volleyTouch: "ĐỠ đúng lúc đạn chạm để phản đạn",
      traversalProgress: "{floor} · {n}/{total} chặng",
      traversalCheckpoint: "Chặng đã lưu: {name}",
      canvasLabel: "Màn chơi {name}",
      mapLabel: "Ải {n} · {name}",
      left: "Sang trái", right: "Sang phải", jump: "Nhảy", block: "Đỡ", shoot: "Bắn", attack: "Chém",
    },
    dropLabel: "Nhảy xuống bệ thấp",
    rushHint: "Quái báo đỏ: nhảy qua hoặc đỡ phía trước. Vòng xanh: quái đang nghỉ, áp sát chém!",
    startLabel: "Bắt đầu",
    soundOnLabel: "Bật âm",
    soundOffLabel: "Tắt âm",
    continueLabel: "Tiếp tục ải {n}",
    newRunLabel: "Chơi lại từ đầu",
    savedRunLabel: "Đã mở tới ải {n}",
    checkpointLabel: "Checkpoint trước trùm",
    tutorial: {
      skip: "Bỏ qua hướng dẫn",
      move: "Giữ → / D hoặc nút sang phải để tiến tới bệ.",
      jump: "Bấm ↑ / Space hoặc NHẢY khi đang đứng trên đất.",
      attack: "Đến gần quái, bấm J hoặc CHÉM để đánh trúng nó.",
      guard: "Đứng trên đất, giữ L hoặc ĐỠ một nhịp.",
      done: "Xong rồi. Dọn đường tới trùm.",
    },
    nextLabel: "Vào ải {n} →",
    clearHeading: "Hạ trùm ải {n}",
    bossAppear: "{boss} xuất hiện!",
    deathLine: "Ngã rồi. Đứng dậy đi.",
    skillProgress: "Kỹ năng {n}/{total}",
    pickupTool: "Nhặt được {name}",
    pickupHeal: "Hồi một máu",
    pickupGun: "Nạp đạn: {name}",
    pickupKindLabel: {
      heal: "Hồi máu",
      tool: "Đồ nghề · 12 giây",
      gun: "Vũ khí tầm xa · phím K",
    },
    noAmmo: "Hết đạn — J để chém",
    noAmmoTouch: "Hết đạn — bấm CHÉM",
    parryLine: "Đỡ chuẩn!",
    reflectLine: "Phản đạn! Trúng trùm sẽ trừ máu",
    volleyHint: "L đúng lúc đạn chạm → phản đạn gây sát thương",
    slamHint: "NHẢY KHI DẬM",
    guardBreakLine: "Vỡ đỡ!",
    pickupPanel: {
      heading: "Vừa nhặt được",
      dontPauseLabel: "Đừng dừng game khi nhặt vật phẩm nữa",
      inventoryHint: "Bấm B bất cứ lúc nào để xem lại những gì đang cầm.",
      resumeLabel: "Chơi tiếp",
    },
    inventory: {
      heading: "Túi đồ",
      hpLabel: "Máu",
      guardLabel: "Thể lực đỡ",
      toolLabel: "Đồ nghề",
      gunLabel: "Vũ khí tầm xa",
      toolLeft: "còn {n} giây",
      ammoLeft: "còn {n} viên",
      noneLabel: "Chưa có",
      emptyLabel: "Chưa nhặt được gì trong ải này.",
      itemsHeading: "Đã nhặt trong ải này",
      closeLabel: "Đóng túi đồ",
    },
    pauseHint: "P tạm dừng · B túi đồ",
    curtain: { line: "Mời vào!" },
    cutscene: {
      nextLabel: "Tiếp", beginLabel: "Vào bãi", skipLabel: "Bỏ qua",
      replayLabel: "Xem lại đoạn truyện ải này", counterLabel: "{current}/{total}",
      scenes: {
        map1Intro: {
          id: "map-1-intro", kicker: "2019 · A.P. MOLLER MAERSK",
          title: "Một ký tự, một cổng hàng khác.", backdrop: "port", focus: "mission",
          cards: [
            { speaker: "Ca ở bãi", text: "Một chứng từ lệch một ký tự cũng đủ đưa hàng sang cổng khác." },
            { speaker: "Việc cần làm", text: "Đọc bằng mắt không đủ nhanh. Đối chiếu đúng mã trước khi chuyến tiếp theo tới." },
          ],
        },
        map1Boss: {
          id: "map-1-boss", kicker: "ĐỐI CHIẾU CHƯA XONG", title: "Trùm Sai Mã Container",
          backdrop: "port", focus: "boss",
          cards: [
            { speaker: "Hệ thống", text: "Ba mã nhìn giống nhau. Chỉ một mã khớp chứng từ.", emphasis: "CT-018" },
            { speaker: "Cảnh báo", text: "Khóa sai mã đã mở. Đừng đứng dưới chân nó khi container dậm xuống." },
          ],
        },
        map1Outro: {
          id: "map-1-outro", kicker: "MÃ VỎ ĐÃ KHỚP", title: "Đúng mã chưa chắc đúng tuyến.",
          backdrop: "port", focus: "world",
          cards: [
            { speaker: "Kết quả", text: "Lô hàng ra đúng cổng. Cảnh báo ở bãi tắt." },
            { speaker: "Chặng tiếp", text: "Nhưng ở kho kế tiếp, một kiện đúng mã vẫn có thể đi sai tuyến." },
          ],
        },
      },
    },
    pause: {
      heading: "Tạm dừng",
      controlsHeading: "Điều khiển",
      controls: [
        { keys: "← →  ·  A D", label: "Di chuyển" },
        { keys: "↑  ·  W  ·  Space", label: "Nhảy — bấm sớm lúc đang rơi vẫn được ghi nhận" },
        { keys: "↓  ·  S", label: "Thả xuống bệ thấp — nhả rồi bấm lại để xuống tiếp; không xuyên mặt đất" },
        { keys: "J  ·  Z", label: "Chém — ba nhát liền nhau thành combo, nhát thứ ba mạnh nhất" },
        { keys: "K  ·  X", label: "Bắn — cần súng quét nhặt dọc đường, giữ nút thì bắn liên tục" },
        { keys: "L  ·  Shift", label: "Giữ để đỡ — chặn đòn từ phía trước, tốn thể lực. Đỡ ngay lúc đòn tới thì không tốn gì và bật ngược đạn về" },
        { keys: "B", label: "Túi đồ — xem đang cầm gì, còn bao nhiêu đạn" },
        { keys: "Bấm vào màn chơi", label: "Cũng là chém, dùng khi chơi bằng chuột" },
        { keys: "P  ·  Esc", label: "Tạm dừng và mở lại bảng này" },
      ],
      /** Thay cho bảng phím trên màn hình hẹp — ở đó chơi bằng nút ảo */
      mobileControls: "◀ ▶ di chuyển · ▲ nhảy · ▼ xuống bệ thấp. CHÉM, BẮN và ĐỠ ở bên phải; 🎒 mở túi đồ. ĐỠ ngay khi đạn chạm phía trước để phản đạn.",
      objectiveHeading: "Mục tiêu ải này",
      tipHeading: "Mẹo",
      progressMobs: "Còn {left}/{total} quái thường phải dọn",
      progressBoss: "Quái thường đã sạch — trùm đang chờ ở cuối bản đồ",
      resumeLabel: "Chơi tiếp",
      restartLabel: "Chơi lại ải này",
    },
    finish: {
      heading: "Hết ải",
      body: "Mười kỹ năng, sáu năm, năm con trùm. Không cái nào tự rơi xuống.",
      cta: "Xem case study thật →",
    },

    maps: [
      /* Ải 1 — dạy chơi. Bệ rộng, thấp, một bãi gai duy nhất. */
      {
        year: "2019",
        place: "A.P. Moller Maersk",
        name: "Cảng Cát Lái",
        mission: {
          mode: "match",
          brief: "Chứng từ ghi CT-018. Tìm đúng mã trên bãi để gỡ khóa trùm; hai mã còn lại lệch một ký tự.",
          action: "Đối chiếu", locked: "Mã chưa khớp chứng từ CT-018.",
          exposed: "Mã đã khớp — đánh trùm trước khi lô tiếp theo tới!",
          result: "Mã vỏ đã khớp chứng từ. Bãi hết cảnh báo, lô hàng ra đúng cổng. Nhưng ở kho kế tiếp, đúng mã vẫn chưa đủ nếu kiện vào sai tuyến.",
          nodes: [{ id: "wrong-one", name: "CT-081", x: 1600, y: 344 }, { id: "correct", name: "CT-018", x: 1760, y: 344 }, { id: "wrong-two", name: "CT-019", x: 1920, y: 344 }],
          sequence: ["correct"], exposureSeconds: 12,
        },
        boss: "Trùm Sai Mã Container",
        bossKind: "slam",
        line: "Hai lô lệch một ký tự. Không ai chết, nhưng hàng đi nhầm nước.",
        objective:
          "Dọn hết chứng từ lệch dọc cầu cảng, rồi hạ Trùm Sai Mã Container ở cuối bãi.",
        tip: "Container nén thân trước khi dậm: nhảy khi chân chạm sàn để vượt sóng. Trong vòng xanh hồi sức, áp sát đối chiếu mã hoặc chém. Quái bay cần nhảy chém mới tới.",
        tipTouch: "Container nén thân trước khi dậm: nhảy khi chân chạm sàn để vượt sóng. Trong vòng xanh hồi sức, áp sát đối chiếu mã hoặc chém. Quái bay cần nhảy chém mới tới.",
        skills: ["Master data", "Đối chiếu chứng từ"],
        palette: {
          sky: "#A9DCF0", far: "#7BB9D4", mid: "#4E8FAE",
          ground: "#0D4158", groundEdge: "#115572",
          mob: "#FAF6E8", boss: "#E0563F",
        },
        deco: "container",
        plats: [[300,268,150],[560,262,140],[840,266,160],[1120,258,150],[1400,264,150],[1680,256,160],[1930,262,140]],
        mobs: [
          { kind: "walker", name: "Chứng từ lệch", x: 430 },
          { kind: "walker", name: "Chứng từ lệch", x: 700 },
          { kind: "walker", name: "Chứng từ lệch", x: 920, y: 266, range: 60 },
          { kind: "walker", name: "Chứng từ lệch", x: 1180 },
          { kind: "flyer", name: "Sai một ký tự", x: 1450, y: 196 },
          { kind: "walker", name: "Chứng từ lệch", x: 1740 },
          { kind: "flyer", name: "Sai một ký tự", x: 1980, y: 186 },
        ],
        traps: [{ kind: "spike", x: 1010, w: 70 }],
        pickups: [
          {
            kind: "heal", x: 900, y: 266, name: "Ly cà phê",
            desc: "Hồi một máu. Ca ở cảng bắt đầu lúc năm giờ sáng — không có nó thì không có ca nào.",
          },
          {
            kind: "tool", x: 1740, y: 256, name: "Máy quét mã vỏ",
            desc: "12 giây chém nhanh hơn, xa hơn, sát thương gấp đôi. Quét mã vỏ container thay vì đọc bằng mắt: sai số về gần không.",
          },
          {
            kind: "gun", x: 600, y: 262, name: "Súng quét mã vỏ",
            desc: "Vũ khí tầm xa, bấm K để bắn, 14 viên. Đạn bay thẳng ngang tầm ngực, không chếch lên được — để dành cho thứ đứng cùng tầm với mình ở đầu bên kia cầu cảng.",
          },
        ],
      },

      /* Ải 2 — kho ba tầng, cầu nâng và đường vòng; tiến triển theo tuyến. */
      {
        year: "2020",
        place: "J&T Express",
        name: "Kho Phân Loại",
        traversal: {
          width: 1100, top: -440,
          nodes: [
            { id: "power", name: "Bật điện", x: 350, y: 184,
              hint: "Leo hai bậc bên trái tới bảng điện.", result: "Có điện — cầu nâng chạy giữa tầng 1 và 2. Đã lưu chặng." },
            { id: "a", name: "Nối nhánh A", x: 850, y: 44,
              hint: "Đón cầu nâng ở giữa kho, lên tầng 2 rồi đi sang phải.", result: "Nhánh A đã thông — nguồn bắn tầng 2 dừng. Leo các bậc bên phải lên tầng 3." },
            { id: "b", name: "Nối nhánh B", x: 220, y: -256,
              hint: "Leo các bậc bên phải rồi đi sang trái trên tầng 3.", result: "Nhánh B đã thông — mở lối xuống bên trái. Bấm xuống để xuống từng bậc." },
            { id: "dispatch", name: "Chạy cổng ra", x: 950, y: 344,
              hint: "Xuống các chiếu nghỉ bên trái, trở về cổng ở tầng 1.", result: "Hai tuyến đã thông — lõi máy lộ ra. Đỡ đúng nhịp để phản đạn hoặc áp sát chém!" },
          ],
          lift: { x: 470, width: 120, bottom: 344, top: 44, speed: 90 },
          shortcut: [[140,-176,140],[140,-96,140],[140,-16,140],[140,64,140],[140,144,140],[140,224,140]],
          tiers: [{ y: 344, name: "01 · NHẬP HÀNG" }, { y: 44, name: "02 · PHÂN TUYẾN" }, { y: -256, name: "03 · ĐẦU RA" }],
        },
        boss: "Băng Chuyền Kẹt",
        bossKind: "parcel",
        line: "Ba trăm nghìn đơn một ngày. Băng chuyền không chờ ai.",
        objective:
          "Bật điện, đi cầu nâng nối nhánh A và B trên hai tầng, rồi quay về cổng ra để xử lý lõi máy. Không cần dọn hết quái.",
        tip: "Cầu nâng dừng ở mỗi đầu để bạn bước lên. Nhảy để rời cầu; bấm xuống để xuyên bệ. Mỗi công tắc lưu chặng. Quay mặt về đạn và đỡ đúng lúc để phản đạn vào lõi máy.",
        tipTouch: "Cầu nâng dừng ở mỗi đầu để bạn bước lên. Nhảy để rời cầu; bấm xuống để xuyên bệ. Mỗi công tắc lưu chặng. Quay mặt về đạn và đỡ đúng lúc để phản đạn vào lõi máy.",
        skills: ["Vận hành quy mô lớn", "Chuẩn hoá chỉ số"],
        palette: {
          sky: "#FFDFAF", far: "#F0BE7E", mid: "#CF8B45",
          ground: "#22232A", groundEdge: "#2D2E36",
          mob: "#FFF3DC", boss: "#C0392B",
        },
        deco: "crate",
        plats: [[140,264,140],[280,184,140],[360,44,110],[590,44,310],[900,-36,140],[760,-116,140],[900,-196,140],[140,-256,800]],
        mobs: [
          { kind: "walker", name: "Kiện lạc tuyến", x: 680, range: 70 },
          { kind: "walker", name: "Kiện chắn tầng", x: 650, y: 44, range: 55 },
          { kind: "shooter", name: "Nguồn kẹt nhánh A", x: 780, y: 44, range: 25 },
          { kind: "flyer", name: "Kiện rơi tầng trên", x: 960, y: -100, range: 45 },
          { kind: "walker", name: "Kiện lạc đầu ra", x: 540, y: -256, range: 65 },
          { kind: "shooter", name: "Nguồn kẹt nhánh B", x: 330, y: -256, range: 20 },
        ],
        traps: [{ kind: "pulse", x: 710, y: 44 }],
        pickups: [
          {
            kind: "heal", x: 620, y: 44, name: "Bữa trưa ca đêm",
            desc: "Hồi một máu. Ca đêm ở kho ăn lúc hai giờ sáng, ăn xong chạy tiếp tới sáng.",
          },
          {
            kind: "tool", x: 650, y: -256, name: "Súng bắn mã",
            desc: "12 giây chém nhanh hơn, xa hơn, sát thương gấp đôi. Ba trăm nghìn đơn một ngày thì tốc độ quét là tốc độ cả kho.",
          },
          {
            kind: "gun", x: 200, y: 264, name: "Súng bắn mã vạch",
            desc: "Vũ khí tầm xa, bấm K để bắn, 14 viên. Bắn kiện văng ra từ đầu bên kia lối đi, không phải chờ nó lao tới mới chém được.",
          },
        ],
      },

      /* Ải 3 — nhảy nhiều. Bệ nhỏ rải rác, dưới đất có ba miệng phun. */
      {
        year: "2021",
        place: "Shopee",
        name: "Sàn Điều Phối",
        mission: {
          mode: "timing",
          brief: "Ca dồn theo nhịp 6 giây. Tới điểm điều phối, chờ tín hiệu MỞ TUYẾN rồi bấm trong 2 giây để san tải trước đợt quá tải.",
          action: "San tải", locked: "Chưa tới nhịp mở tuyến — chờ tín hiệu trên HUD.",
          waiting: "Đang gom ca · mở tuyến sau {n}s", ready: "MỞ TUYẾN · bấm San tải ngay",
          exposed: "San tải kịp lúc — trùm dừng lao, tranh thủ đánh!",
          result: "Ca được chia trước khi quá tải, sàn tắt báo động. Đơn vẫn có thể trễ ở chặng sau; phòng dữ liệu sẽ lần theo điểm bàn giao để biết vì sao.",
          nodes: [{ id: "balance", name: "Điều phối", x: 1900, y: 344 }],
          sequence: ["balance"], exposureSeconds: 10,
        },
        boss: "Trùm 90,1%",
        bossKind: "dash",
        line: "Con trùm này có thật. Hạ được nó mất hơn một năm, không phải một phút.",
        objective:
          "Dọn hết đơn trễ, hub báo đỏ và hai rider giao gấp, rồi hạ Trùm 90,1% ở cuối sàn.",
        tip: "Rider báo hướng bằng mũi tên đỏ trước khi lao. Nhảy qua hoặc quay mặt đỡ cú tông; vòng xanh dưới chân là lúc nó đang nghỉ, áp sát chém được.",
        tipTouch: "Rider báo hướng bằng mũi tên đỏ trước khi lao. Nhảy qua hoặc quay mặt đỡ cú tông; vòng xanh dưới chân là lúc nó đang nghỉ, áp sát chém được.",
        skills: ["Quản trị đối tác", "KPI on-time"],
        palette: {
          sky: "#FFCDB4", far: "#FBA981", mid: "#EE7A4D",
          ground: "#4D4748", groundEdge: "#645D5E",
          mob: "#FFEDD8", boss: "#7A2E9D",
        },
        deco: "tower",
        plats: [[320,250,90],[500,200,80],[680,250,80],[860,190,90],[1060,246,80],[1240,192,90],[1440,248,80],[1640,196,90],[1840,250,100],[2030,200,90]],
        mobs: [
          { kind: "flyer", name: "Đơn trễ pickup", x: 420, y: 210 },
          { kind: "shooter", name: "Hub báo đỏ", x: 700, y: 250 },
          { kind: "flyer", name: "Đơn trễ pickup", x: 900, y: 150 },
          { kind: "walker", name: "Đơn dồn ca", x: 1150 },
          { kind: "shooter", name: "Hub báo đỏ", x: 1280, y: 192 },
          { kind: "flyer", name: "Đơn trễ pickup", x: 1520, y: 200 },
          { kind: "walker", name: "Đơn dồn ca", x: 1780 },
          { kind: "shooter", name: "Hub báo đỏ", x: 1880, y: 250 },
          /* Rider chỉ có ở ải Shopee. Vùng tuần rộng vì nó lao hết đà mới quay lại. */
          { kind: "rider", name: "Rider giao gấp", x: 1080, range: 130 },
          { kind: "rider", name: "Rider giao gấp", x: 1700, range: 150 },
        ],
        traps: [
          { kind: "pulse", x: 620 },
          { kind: "pulse", x: 1000 },
          { kind: "pulse", x: 1560 },
          { kind: "spike", x: 1340, w: 80 },
        ],
        pickups: [
          {
            kind: "heal", x: 900, y: 190, name: "Nghỉ giữa ca",
            desc: "Hồi một máu. Mười lăm phút giữa ca cao điểm, đủ để ngồi xuống một lần.",
          },
          {
            kind: "tool", x: 1680, y: 196, name: "Dashboard realtime",
            desc: "12 giây chém nhanh hơn, xa hơn, sát thương gấp đôi. Thấy hub đỏ ngay lúc nó đỏ, không phải sáng mai mới biết.",
          },
          {
            kind: "gun", x: 1080, y: 246, name: "Súng quét mã đơn",
            desc: "Vũ khí tầm xa, bấm K để bắn, 14 viên. Hạ hub báo đỏ từ ngoài tầm đạn của nó — cách rẻ nhất để không mất máu.",
          },
        ],
      },

      /* Ải 4 — nhiều bẫy nhất. Quái đứng bắn từ xa, dưới đất đầy gai. */
      {
        year: "2025",
        place: "Giao Hàng Nhanh",
        name: "Phòng Dữ Liệu",
        mission: {
          mode: "trace",
          brief: "Đơn trễ qua nhiều kho. Lần ngược dấu vết: đơn hàng → bàn giao → kho nhận.",
          action: "Truy nguồn",
          locked: "Chưa đủ dấu vết — truy nguồn để mở điểm yếu.",
          exposed: "Đã xác định kho nhận — áp sát chém hoặc phản đạn!",
          result: "Chuỗi bàn giao đã nối đủ. Đơn trễ có nơi chịu trách nhiệm; cảnh báo trong phòng dữ liệu tắt. Bước tiếp theo: đưa cách kiểm tra này vào sản phẩm, để lỗi bị chặn từ đầu.",
          nodes: [
            { id: "order", name: "Đơn hàng", x: 1600, y: 344 },
            { id: "handoff", name: "Bàn giao", x: 1760, y: 344 },
            { id: "warehouse", name: "Kho nhận", x: 1920, y: 344 },
          ],
          sequence: ["order", "handoff", "warehouse"],
          exposureSeconds: 10,
        },
        boss: "Đơn Vô Chủ",
        bossKind: "cast",
        line: "Đơn trễ mà không kho nào nhận. Phải chỉ đúng tên nó mới chịu ngã.",
        objective:
          "Dọn hết query lỗi và join nhân dòng giữa rừng gai, rồi hạ Đơn Vô Chủ.",
        tip: "Đạn bay ngang tầm ngực. Nhảy sớm một nhịp thì đạn lọt dưới chân — hoặc đứng yên quay mặt về phía nó, bấm L đúng lúc để bật đạn ngược lại.",
        tipTouch: "Đạn bay ngang tầm ngực. Nhảy sớm một nhịp thì đạn lọt dưới chân — hoặc đứng yên quay mặt về phía nó, bấm ĐỠ đúng lúc để bật đạn ngược lại.",
        skills: ["SQL / Trino", "Quy trách nhiệm"],
        palette: {
          sky: "#C8CCF2", far: "#9BA2DE", mid: "#6C74BE",
          ground: "#18264D", groundEdge: "#203264",
          mob: "#E8EAFF", boss: "#2C3E75",
        },
        deco: "server",
        plats: [[360,262,130],[640,206,120],[900,262,140],[1180,206,130],[1460,262,140],[1740,206,130],[1980,262,140]],
        mobs: [
          { kind: "shooter", name: "Query lỗi", x: 420, y: 262 },
          { kind: "charger", name: "Join nhân dòng", x: 700 },
          { kind: "shooter", name: "Query lỗi", x: 960, y: 262 },
          { kind: "walker", name: "Cột thiếu", x: 1240, y: 206, range: 50 },
          { kind: "charger", name: "Join nhân dòng", x: 1400 },
          { kind: "shooter", name: "Query lỗi", x: 1520, y: 262 },
          { kind: "walker", name: "Cột thiếu", x: 1800, y: 206, range: 50 },
          { kind: "charger", name: "Join nhân dòng", x: 2020 },
        ],
        traps: [
          { kind: "spike", x: 560, w: 70 },
          { kind: "spike", x: 840, w: 70 },
          { kind: "saw", x: 1080, w: 240 },
          { kind: "spike", x: 1660, w: 80 },
          { kind: "pulse", x: 1900 },
        ],
        pickups: [
          {
            kind: "heal", x: 700, y: 206, name: "Nghỉ năm phút",
            desc: "Hồi một máu. Query chạy mười phút thì con người được nghỉ năm phút.",
          },
          {
            kind: "tool", x: 1800, y: 206, name: "Câu SQL đúng",
            desc: "12 giây chém nhanh hơn, xa hơn, sát thương gấp đôi. Một câu query đúng thay được cả buổi tranh nhau ai làm trễ.",
          },
          {
            kind: "gun", x: 1200, y: 206, name: "Con trỏ truy vấn",
            desc: "Vũ khí tầm xa, bấm K để bắn, 14 viên. Chỉ đúng dòng cần bắn từ đầu bên kia phòng, khỏi lội qua rừng gai.",
          },
        ],
      },

      /* Ải 5 — tổng hợp. Đủ bốn loại quái, đủ ba loại bẫy. */
      {
        year: "2026",
        place: "Interdist",
        name: "Xưởng Sản Phẩm",
        mission: {
          mode: "rules",
          brief: "Chặn lỗi trước khi nhập: bật kiểm tra thiếu mã và trùng mã, thứ tự tùy bạn. Chọn Bỏ kiểm tra sẽ xóa các quy tắc vừa bật.",
          action: "Đặt quy tắc", locked: "Bỏ kiểm tra làm lỗi quay lại. Cần cả hai quy tắc bảo vệ.",
          exposed: "Hai quy tắc đã chặn lỗi — lớp bảo vệ trùm bị gỡ hẳn!",
          result: "Lỗi thiếu mã và trùng mã bị chặn trước cửa xưởng. Từ sửa một chứng từ đến dựng quy tắc cho cả luồng: ca này đã có cách tự bảo vệ.",
          nodes: [{ id: "required", name: "Chặn thiếu mã", x: 1600, y: 344 }, { id: "unique", name: "Chặn trùng mã", x: 1780, y: 344 }, { id: "bypass", name: "Bỏ kiểm tra", x: 1940, y: 344 }],
          sequence: ["required", "unique"], exposureSeconds: 60,
        },
        boss: "CATEGORY.SKU",
        bossKind: "hybrid",
        line: "Con trùm cuối là một cái tên cột. Tách sai một dấu chấm là vỡ cả bảng.",
        objective:
          "Đủ bốn loại quái, đủ ba loại bẫy. Dọn sạch xưởng rồi hạ CATEGORY.SKU.",
        tip: "Chém ba nhát liền nhau thì nhát thứ ba mạnh gấp đôi. Giữ nhịp, đừng bấm loạn — và để dành đạn súng cho trùm cuối.",
        tipTouch: "Chém ba nhát liền nhau thì nhát thứ ba mạnh gấp đôi. Giữ nhịp, đừng bấm loạn — và để dành đạn súng cho trùm cuối.",
        skills: ["Data modeling", "Ship sản phẩm"],
        palette: {
          sky: "#C6EBD9", far: "#93D6B8", mid: "#5FB18E",
          ground: "#6A4727", groundEdge: "#8A5C33",
          mob: "#EFFBF4", boss: "#1F6E52",
        },
        deco: "gear",
        plats: [[300,258,120],[520,198,100],[740,252,110],[960,190,110],[1200,246,120],[1420,186,110],[1660,250,120],[1900,196,110],[2070,258,110]],
        mobs: [
          { kind: "walker", name: "File Excel rời", x: 400 },
          { kind: "charger", name: "Dòng lỗi định dạng", x: 660 },
          { kind: "flyer", name: "Số lệch", x: 800, y: 200 },
          { kind: "shooter", name: "Cột trùng tên", x: 1010, y: 190 },
          { kind: "walker", name: "File Excel rời", x: 1260, y: 246, range: 50 },
          { kind: "charger", name: "Dòng lỗi định dạng", x: 1520 },
          { kind: "flyer", name: "Số lệch", x: 1700, y: 180 },
          { kind: "shooter", name: "Cột trùng tên", x: 1950, y: 196 },
        ],
        traps: [
          { kind: "spike", x: 580, w: 70 },
          { kind: "saw", x: 860, w: 220 },
          { kind: "pulse", x: 1340 },
          { kind: "spike", x: 1600, w: 70 },
          { kind: "saw", x: 1780, w: 200 },
        ],
        pickups: [
          {
            kind: "heal", x: 1000, y: 190, name: "Cà phê lần ba",
            desc: "Hồi một máu. Ly thứ ba trong ngày, chỗ này ai cũng biết vị của nó.",
          },
          {
            kind: "tool", x: 1460, y: 186, name: "Data contract",
            desc: "12 giây chém nhanh hơn, xa hơn, sát thương gấp đôi. Thoả thuận trước tên cột và kiểu dữ liệu, đỡ phải sửa sau khi vỡ.",
          },
          {
            kind: "gun", x: 760, y: 252, name: "Súng dán nhãn SKU",
            desc: "Vũ khí tầm xa, bấm K để bắn, 14 viên. Ải cuối có đủ bốn loại quái — để dành đạn cho hai con đứng bắn ở trên bệ cao.",
          },
        ],
      },
    ],
  },
};
