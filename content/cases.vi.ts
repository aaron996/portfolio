import type { CaseStudy } from "./types";

export const caseStudies: CaseStudy[] = [
  {
    slug: "pg-sales-operations",
    tier: "flagship",
    homepage: {
      title: "Hệ thống quản lý doanh số Interdist",
      summary: "Tập hợp dữ liệu bán hàng, quản lý chỉ tiêu và tạo báo cáo trong cùng một ứng dụng.",
      role: "Interdist · Dữ liệu & sản phẩm · Bán thời gian",
      evidence: "Nhập liệu, theo dõi kết quả và quản trị dữ liệu",
      cta: "Xem case Interdist",
    },
    scopeLabel: "Dữ liệu, ứng dụng và quy trình sử dụng",
    title: "Hệ thống quản lý doanh số Interdist",
    proves: "Phụ trách xây hệ thống từ yêu cầu nghiệp vụ đến ứng dụng, hướng dẫn sử dụng và bàn giao.",
    client: "Interdist",
    clientNote: "Bán thời gian, làm từ xa, song song với công việc chính tại GHN",
    role: "Làm rõ nhu cầu, tổ chức dữ liệu, xây ứng dụng và hỗ trợ triển khai",
    period: "T5/2026 - nay",
    oneLiner: "Ứng dụng nội bộ phục vụ theo dõi doanh số P&G: nhận file bán hàng, kiểm tra dữ liệu, tính mức đạt chỉ tiêu và xuất báo cáo theo vùng, kênh, cửa hàng và sản phẩm.",
    accent: "navy",
    keyResult: {
      value: "Một hệ thống cho cả luồng báo cáo doanh số",
      label: "Từ file bán hàng đến báo cáo quản lý, có công cụ cập nhật giá, chỉ tiêu và cửa hàng",
      verified: true,
    },
    context: [
      "Dữ liệu bán hàng, bảng giá, chỉ tiêu và danh sách cửa hàng được quản lý qua nhiều file. Mỗi kỳ báo cáo cần ghép các nguồn này để biết vùng nào đạt chỉ tiêu, cửa hàng nào cần theo dõi và sản phẩm nào đang bán tốt.",
      "Nhu cầu vì vậy gồm cả theo dõi kết quả lẫn quản lý dữ liệu đầu vào. Người phụ trách cần tự cập nhật file và cấu hình trong app, đồng thời truy lại các lần thay đổi khi số liệu có chênh lệch.",
    ],
    decisions: [
      {
        problem: "Quản lý dữ liệu cùng nơi xem báo cáo",
        why: "Doanh số thay đổi mỗi ngày; giá, chỉ tiêu và phân công cửa hàng cũng thay đổi theo từng kỳ. Nếu mọi cập nhật đều cần sửa code, đội sử dụng sẽ khó tự vận hành hệ thống.",
        decision: "Đưa nhập file, quản lý giá, chỉ tiêu, cửa hàng, sản phẩm và phân công vào cùng ứng dụng. Người có quyền có thể cập nhật dữ liệu, xem lịch sử nhập và xuất lại file để đối chiếu.",
        term: "Quản trị dữ liệu ngay trong ứng dụng",
      },
      {
        problem: "Một thay đổi cấu hình có thể làm báo cáo ra số khác",
        why: "Giá phải khớp thời điểm bán hàng. Chỉ tiêu ngày cần phản ánh lịch bán của từng cửa hàng. Dùng một cách tính chung cho mọi kỳ dễ làm sai doanh thu hoặc mức đạt chỉ tiêu.",
        decision: "Quản lý giá theo thời gian hiệu lực và phân bổ chỉ tiêu tháng theo lịch bán hàng. Các điều chỉnh chỉ tiêu ngày có bản xem trước tác động, lịch sử thay đổi và cơ chế hoàn tác theo lô.",
        term: "Quy tắc tính số có thể kiểm tra lại",
      },
      {
        problem: "Nhập nhầm file có thể thay cả một kỳ dữ liệu",
        why: "File mới có thể chứa mã không khớp, sai ngày hoặc sai phạm vi cửa hàng. Cần biết phần dữ liệu nào sẽ bị thay trước khi xác nhận.",
        decision: "Kiểm tra file và hiển thị phạm vi, số liệu trước và sau khi nhập. Tách bước xem trước khỏi bước ghi dữ liệu; các lỗi được trả về để người dùng sửa và kiểm tra lại.",
        term: "Xem trước và xác nhận phạm vi thay đổi",
      },
    ],
    ownership: {
      owned: [
        "Làm việc với người sử dụng để xác định cần xem gì, cách tính số và quy trình cập nhật dữ liệu.",
        "Tổ chức dữ liệu bán hàng, giá, chỉ tiêu, cửa hàng và sản phẩm để các báo cáo dùng chung cách tính.",
        "Xây ứng dụng, gồm dashboard, nhập và xuất file, công cụ quản trị dữ liệu và phân quyền tài khoản.",
        "Kiểm tra đầu ra, xử lý phản hồi, viết hướng dẫn và chuẩn bị tài liệu bàn giao kỹ thuật.",
      ],
      notOwned: [
        "Dữ liệu nguồn và quyết định kinh doanh do Interdist cung cấp, xác nhận.",
      ],
    },
    results: [
      { label: "Theo dõi kinh doanh", value: "Doanh số, chỉ tiêu và mức đạt trên cùng hệ thống", method: "Có bộ lọc theo kỳ, vùng và kênh; xem chi tiết theo cửa hàng và sản phẩm. Quy mô dữ liệu thay đổi theo từng kỳ nhập.", verified: true },
      { label: "Quy trình sử dụng", value: "Nhập file, quản lý dữ liệu và xuất báo cáo ngay trong app", method: "Người có quyền có thể cập nhật giá, chỉ tiêu và danh mục, kiểm tra lịch sử nhập rồi xuất báo cáo theo phạm vi đang xem.", verified: true },
      { label: "Thời gian tổng hợp", value: "Ước tính giảm khoảng 40-60 giờ/tháng", method: "Ước tính từ công việc tổng hợp của 3-4 người phụ trách. Chưa có đo thời gian trước và sau để xác nhận mức giảm thực tế.", verified: false },
    ],
    reflection: [
      "Ở giai đoạn đầu, dashboard được dựng trước khi cách tính chỉ tiêu được thống nhất đầy đủ, dẫn tới phải làm lại phần tính toán. Kinh nghiệm rút ra là xác nhận định nghĩa và ví dụ dữ liệu trước khi xây màn hình.",
      "Cần đo thời gian của một kỳ tổng hợp ngay từ đầu. Thiếu mốc so sánh khiến phần tiết kiệm công sức vẫn chỉ là ước tính dù hệ thống đã có đầu ra cụ thể.",
    ],
    features: [
      { title: "Theo dõi doanh số", description: "Xem kết quả, xu hướng và mức đạt chỉ tiêu; tìm vùng, cửa hàng hoặc sản phẩm cần kiểm tra thêm.", icon: "chart" },
      { title: "Cập nhật dữ liệu", description: "Nhập và xuất Excel/CSV, xem trước phạm vi thay đổi và truy lại lịch sử nhập file.", icon: "file-spreadsheet" },
      { title: "Quản lý thông tin bán hàng", description: "Cập nhật giá, chỉ tiêu, lịch bán, danh sách cửa hàng, sản phẩm và phân công người phụ trách.", icon: "settings" },
      { title: "Báo cáo và tài khoản", description: "Xuất báo cáo để chia sẻ; cấp quyền sử dụng và quản trị theo vai trò.", icon: "users" },
    ],
    flowHeading: "Từ file bán hàng đến báo cáo quản lý",
    flow: {
      nodes: [
        { id: "file", label: "File bán hàng", sublabel: "Excel / CSV" },
        { id: "check", label: "Kiểm tra và xem trước", sublabel: "phạm vi và chênh lệch dữ liệu" },
        { id: "data", label: "Dữ liệu đã xác nhận", sublabel: "kết hợp giá, chỉ tiêu và thông tin cửa hàng" },
        { id: "view", label: "Dashboard và báo cáo", sublabel: "theo kỳ, vùng, kênh và sản phẩm" },
      ],
      edges: [{ from: "file", to: "check" }, { from: "check", to: "data" }, { from: "data", to: "view" }],
    },
    stack: [
      { group: "Ứng dụng", items: ["React", "TypeScript", "Vite", "Tailwind CSS"] },
      { group: "Dữ liệu", items: ["SQL", "PostgreSQL / Supabase", "Excel / CSV"] },
      { group: "Triển khai", items: ["Vercel", "Google OAuth", "AI-assisted coding"] },
    ],
    media: [
      { id: "hero-shot", kind: "image", brief: "Giao diện dashboard với dữ liệu minh hoạ.", src: "/case-pg-dashboard.png", width: 1838, height: 907, alt: "Dashboard doanh số với KPI, xu hướng và chi tiết theo vùng", isDemoData: true, caption: "Theo dõi doanh số và mức đạt chỉ tiêu theo vùng. Giao diện thật, dữ liệu minh hoạ." },
      { id: "import-flow", kind: "image", brief: "Bản xem trước khi thay dữ liệu bán hàng.", src: "/case-pg-import-preview.png", width: 780, height: 595, alt: "Bản xem trước so sánh dữ liệu hiện có và sau khi nhập file", isDemoData: true, caption: "Kiểm tra phạm vi và chênh lệch trước khi xác nhận nhập file. Dữ liệu minh hoạ." },
      { id: "target-preview", kind: "image", brief: "Điều chỉnh chỉ tiêu ngày và xem tác động.", src: "/case-pg-target-preview.png", width: 1086, height: 611, alt: "Lịch điều chỉnh chỉ tiêu ngày với bảng so sánh trước và sau", isDemoData: true, caption: "Xem tác động của điều chỉnh chỉ tiêu trước khi lưu. Dữ liệu minh hoạ." },
    ],
  },
  {
    // Giữ slug cũ để các liên kết đã chia sẻ vẫn mở đúng case.
    slug: "kas-shopee-performance",
    tier: "flagship",
    homepage: {
      title: "Ứng dụng theo dõi vận hành KAS GHN",
      summary: "Giúp lãnh đạo theo dõi chỉ số hằng ngày và đi từ tổng quan xuống vùng, hub cần chú ý.",
      role: "Giao Hàng Nhanh · Dữ liệu & ứng dụng",
      evidence: "Được lãnh đạo sử dụng hằng ngày",
      cta: "Xem case KAS GHN",
    },
    scopeLabel: "Công cụ theo dõi vận hành hằng ngày",
    title: "Ứng dụng theo dõi vận hành KAS GHN",
    proves: "Được lãnh đạo sử dụng hằng ngày để xem chỉ số và theo dõi tình hình vận hành.",
    client: "Giao Hàng Nhanh (GHN)",
    clientNote: "Xây dựng trong công việc chính, theo nhu cầu quản lý và điều hành",
    role: "Xây ứng dụng, tổ chức dữ liệu phục vụ báo cáo và duy trì công cụ sau triển khai",
    period: "2026 - nay",
    oneLiner: "Tổng hợp chỉ số lấy hàng, giao hàng và đơn chưa hoàn thành trong một ứng dụng nội bộ. Người dùng có thể xem xu hướng, tìm hub cần ưu tiên rồi mở chi tiết để kiểm tra và trao đổi với vận hành.",
    accent: "blue",
    keyResult: { value: "Lãnh đạo sử dụng hằng ngày", label: "Xem chỉ số, theo dõi biến động và mở chi tiết vùng/hub", verified: true },
    context: [
      "Theo dõi vận hành mỗi ngày cần cả bức tranh tổng thể lẫn chi tiết tại từng đơn vị. Một tỷ lệ toàn quốc có thể che mất vùng đang giảm hiệu suất hoặc hub đang phát sinh nhiều đơn trễ.",
      "Ứng dụng tập hợp các bảng theo dõi vào cùng một nơi, giúp người quản lý chuyển từ chỉ số tổng quan sang khu vực cần kiểm tra. Kết quả cũng cần chia sẻ được trong cuộc họp và group trao đổi hằng ngày.",
    ],
    decisions: [
      {
        problem: "Xem nhanh tình hình, rồi biết cần kiểm tra ở đâu",
        why: "Chỉ số tổng hợp cho biết hiệu suất chung, nhưng người quản lý còn cần biết đơn vị nào đang dưới chỉ tiêu và lượng đơn bị ảnh hưởng.",
        decision: "Đặt KPI, xu hướng và danh sách hub cần ưu tiên ở trang tổng quan. Từ đó mở chi tiết theo miền, vùng và hub, dùng cùng phạm vi khách hàng, ngày và loại hub đã chọn.",
        term: "Từ tổng quan đến chi tiết phục vụ điều hành",
      },
      {
        problem: "Số liệu cần đi cùng luồng trao đổi của người dùng",
        why: "Kết quả được bàn trong họp và group chat. Việc chụp, cắt và ghép bảng thủ công làm chậm quá trình chia sẻ, nhất là khi bảng dài.",
        decision: "Bổ sung chế độ toàn màn hình và copy bảng thành ảnh để dán vào group. Khi cần đối chiếu số thô, có thể xuất CSV theo bộ lọc.",
        term: "Chia sẻ kết quả ngay từ màn hình đang xem",
      },
      {
        problem: "Nguồn nội bộ bị chặn chia sẻ ra ngoài",
        why: "Đường đọc CSV công khai từ Google Sheet ngừng hoạt động khi chính sách Workspace chặn chia sẻ. App cần một cách nhận dữ liệu phù hợp với quyền truy cập của nguồn.",
        decision: "Dùng Apps Script tại file nguồn để đồng bộ sang cơ sở dữ liệu phục vụ app. Giữ nơi cập nhật dữ liệu hiện có, đồng thời tách việc đồng bộ khỏi việc người dùng mở báo cáo.",
        term: "Đồng bộ nguồn và phục vụ báo cáo ở hai bước riêng",
      },
    ],
    ownership: {
      owned: [
        "Chuyển nhu cầu theo dõi của quản lý thành màn hình tổng quan, bảng chi tiết và bộ lọc.",
        "Xây luồng đồng bộ, tổ chức dữ liệu phục vụ app và kiểm tra cách tổng hợp chỉ số.",
        "Xây giao diện, xác thực, phân quyền, nhật ký truy cập và công cụ xuất/chia sẻ báo cáo.",
        "Duy trì ứng dụng, xử lý phản hồi và mở rộng chức năng theo nhu cầu vận hành.",
      ],
      notOwned: [
        "Định nghĩa KPI gốc và dữ liệu nguồn thuộc quy trình chung của GHN.",
        "Quyết định điều hành và xử lý các đơn vị thuộc trách nhiệm của quản lý, vận hành.",
      ],
    },
    results: [
      { label: "Sử dụng thực tế", value: "Lãnh đạo theo dõi chỉ số hằng ngày", method: "Phục vụ xem tình hình vận hành và mở chi tiết vùng/hub trong công việc hằng ngày. Chưa có thống kê riêng về số người dùng và tần suất truy cập để công bố.", verified: true },
      { label: "Phạm vi theo dõi", value: "Lấy hàng, giao hàng và đơn chưa hoàn thành", method: "Có KPI tổng quan, chi tiết vùng/hub, chỉ số ca 1 theo tuyến và bảng xếp hạng hiệu suất. Leadtime và Insight còn đang phát triển.", verified: true },
      { label: "Mở rộng công cụ", value: "Rà soát đơn nghi vấn COD và theo dõi xử lý", method: "Module COD có danh sách cần xác minh, thông tin hỗ trợ rà soát và trạng thái xử lý. Danh sách nghi vấn là đầu vào kiểm tra, không phải kết luận vi phạm.", verified: true },
    ],
    reflection: [
      "Trang tổng quan cần dẫn người xem tới vùng hoặc hub cần kiểm tra. Chỉ hiển thị tỷ lệ chung chưa đủ cho một cuộc trao đổi điều hành.",
      "Copy ảnh và chế độ trình chiếu giúp kết quả được dùng ngay trong các cuộc họp, group chat. Khi công cụ được dùng hằng ngày, độ ổn định của đồng bộ và cách thông báo thay đổi cũng trở thành một phần công việc.",
    ],
    features: [
      { title: "Tổng quan điều hành", description: "KPI, xu hướng và hub cần ưu tiên trong phạm vi đang chọn.", icon: "chart" },
      { title: "Tra cứu theo đơn vị", description: "Mở từ toàn quốc xuống miền, vùng và hub; so sánh chỉ số giữa các kỳ.", icon: "search" },
      { title: "Trình chiếu và chia sẻ", description: "Xem toàn màn hình, copy bảng thành ảnh và xuất CSV để trao đổi hoặc đối chiếu.", icon: "image" },
      { title: "Rà soát và theo dõi", description: "Bảng xếp hạng hiệu suất và module kiểm tra đơn nghi vấn COD, có theo dõi trạng thái xử lý.", icon: "list" },
    ],
    flowHeading: "Từ nguồn dữ liệu đến theo dõi vận hành",
    flow: {
      nodes: [
        { id: "source", label: "Dữ liệu nguồn nội bộ" },
        { id: "sync", label: "Đồng bộ dữ liệu phục vụ app" },
        { id: "overview", label: "KPI và xu hướng tổng quan" },
        { id: "detail", label: "Chi tiết vùng/hub", sublabel: "kiểm tra và chia sẻ theo phạm vi đang xem" },
      ],
      edges: [{ from: "source", to: "sync" }, { from: "sync", to: "overview" }, { from: "overview", to: "detail" }],
    },
    stack: [
      { group: "Ứng dụng", items: ["React", "Vite", "AI-assisted coding"] },
      { group: "Dữ liệu", items: ["SQL", "Supabase", "Google Apps Script"] },
      { group: "Triển khai", items: ["Vercel", "Google OAuth"] },
    ],
    media: [
      { id: "matrix-overview", kind: "image", brief: "Ảnh minh hoạ giao diện ở phiên bản trước.", src: "/case-kas-shopee-matrix.png", width: 1800, height: 1000, alt: "KPI và bảng tỷ lệ đúng giờ theo miền, vùng trong ứng dụng KAS GHN", isDemoData: true, wide: true, caption: "KPI và chi tiết theo miền, vùng. Ảnh phiên bản trước của app, dữ liệu minh hoạ." },
      { id: "hub-drill", kind: "image", brief: "Bảng chi tiết vùng/hub và nút copy ảnh.", src: "/case-kas-shopee-hub-drill.png", width: 1800, height: 960, alt: "Bảng mở rộng tới từng hub với nút copy bảng thành ảnh", isDemoData: true, wide: true, caption: "Mở chi tiết tới từng hub và copy bảng để chia sẻ. Ảnh phiên bản trước, dữ liệu minh hoạ." },
      { id: "access-log", kind: "image", brief: "Nhật ký truy cập và người đang online.", src: "/case-kas-shopee-access-log.png", width: 1800, height: 1090, alt: "Trang quản trị hiển thị tài khoản truy cập, số lượt và người đang online", isDemoData: true, caption: "Theo dõi tài khoản và lượt truy cập. Ảnh phiên bản trước, dữ liệu minh hoạ." },
    ],
  },
  {
    slug: "shopee-3pl-performance",
    tier: "brief",
    homepage: {
      title: "Hiệu suất đối tác vận chuyển tại Shopee",
      summary: "Theo dõi KPI và phối hợp với đối tác để xác định khu vực cần cải thiện, theo sát hành động.",
      role: "Shopee · Phân tích & điều phối",
      evidence: "Pickup đúng hạn của Viettel Post: 90,1% → 97,5%",
      cta: "Xem case 3PL",
    },
    scopeLabel: "Phân tích hiệu suất và phối hợp cải tiến",
    title: "Hiệu suất đối tác vận chuyển tại Shopee",
    proves: "Kết hợp báo cáo KPI với nhịp làm việc định kỳ cùng đối tác vận chuyển.",
    client: "Shopee",
    role: "Phân tích KPI, xây báo cáo và điều phối cải tiến cùng đối tác",
    period: "2021 - 2025",
    oneLiner: "Theo dõi hiệu suất vận chuyển, xác định khu vực cần cải thiện và phối hợp với đối tác để triển khai hành động. Pickup đúng hạn của Viettel Post tăng từ 90,1% lên 97,5% trong giai đoạn được báo cáo.",
    accent: "lime",
    keyResult: { value: "90,1% → 97,5%", label: "Pickup đúng hạn của Viettel Post trong giai đoạn làm việc tại Shopee", verified: true, companion: "outlier" },
    context: [
      "Shopee làm việc với nhiều đối tác vận chuyển. Theo dõi hiệu suất cần thống nhất cách đo, nhìn được khác biệt giữa các khu vực và có nhịp phản hồi đủ đều để xử lý vấn đề.",
    ],
    decisions: [
      {
        problem: "Hai bên cần thống nhất số liệu trước khi bàn hành động",
        why: "Khác cách tính KPI hoặc khác phạm vi dữ liệu khiến cuộc họp mất thời gian đối chiếu và khó xác định khu vực cần ưu tiên.",
        decision: "Xây dashboard dùng chung định nghĩa KPI cho nội bộ và đối tác. Duy trì nhịp trao đổi định kỳ, xác định hành động theo khu vực và theo dõi tới khi xử lý.",
        term: "Báo cáo đi cùng cơ chế phối hợp",
      },
      {
        problem: "Trạng thái vận chuyển chưa giải thích rõ tình hình đơn hàng",
        why: "Người mua cần hiểu đơn đang ở đâu và khi nào dự kiến nhận được. Các trạng thái khó hiểu làm phát sinh yêu cầu hỗ trợ.",
        decision: "Phân tích những trạng thái gây thắc mắc và phối hợp điều chỉnh luồng hiển thị thông tin vận chuyển cho người mua.",
        term: "Dùng dữ liệu phản hồi để điều chỉnh thông tin",
      },
    ],
    ownership: {
      owned: [
        "Xây báo cáo KPI bằng SQL và Google Sheets cho nội bộ, đối tác.",
        "Phân tích hiệu suất theo khu vực và thiết lập nhịp trao đổi, theo dõi hành động với đối tác.",
        "Phân tích và phối hợp cải tiến thông tin trạng thái vận chuyển cho người mua.",
      ],
      notOwned: ["Vận hành lấy và giao hàng do đối tác thực hiện. Kết quả cải thiện có đóng góp của các bên tham gia."],
    },
    results: [
      { label: "Pickup đúng hạn của Viettel Post", value: "90,1% → 97,5%", method: "Hai mốc theo số liệu công việc trong giai đoạn tại Shopee, gắn với hoạt động theo dõi KPI và phối hợp cải tiến. Nội dung hiện có chưa kèm kỳ đo cụ thể và tài liệu đối chiếu công khai.", verified: true },
      { label: "Khối lượng làm tay", value: "Ước tính giảm khoảng 30%", method: "Ước tính nhờ công cụ báo cáo tự động bằng Google Apps Script; chưa có đo thời gian riêng để xác nhận mức giảm.", verified: false },
    ],
    reflection: ["Cải thiện hiệu suất cần theo dõi liên tục: thống nhất số liệu, chọn khu vực cần xử lý và theo sát hành động với đối tác. Dashboard hỗ trợ nhịp làm việc đó."],
    flow: null,
    stack: [{ group: "Công cụ", items: ["SQL", "Google Sheets", "Google Apps Script"] }],
  },
];
