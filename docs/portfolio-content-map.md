# Phase 1 — Content map và kiểm kê bằng chứng

Ngày biên tập: 09/09/2026. Baseline source: `040b242`; plan: `e6209ec` trên `codex/portfolio-redesign-plan`. Đã đọc schema, content, homepage và các consumer liên quan; xem trực tiếp cả tám PNG và đọc kích thước từ header PNG. Không truy cập hệ thống khách hàng để xác thực lại claim.

`keep`: giữ; `rewrite`: viết gọn; `move`: chuyển vị trí/lớp đọc; `hide`: không render trong bản mẫu, chưa xoá nguồn. Copy đích nằm ở [portfolio-copy-draft.md](portfolio-copy-draft.md). Đây là tài liệu biên tập, không phải xác nhận claim production.

## Homepage và nhóm trường

| Section / trường hiện có | Xử lý | Đích và lý do |
|---|---|---|
| `meta.name/roleLabel/url/locale/ogImage` | keep | Giữ định danh, URL và ảnh OG; visual OG xem lại Phase 2 |
| `meta.title/description` | rewrite | Mô tả vai trò + domain + loại sản phẩm; bỏ lặp lời bảo đảm |
| `nav`, `sectionLabels.navCta` | rewrite | Công việc / Về tôi / Liên hệ; CV riêng; giữ anchor cũ trong section |
| `hero.eyebrow/headline/subline/*Cta` | rewrite | Tiếng Việt, domain rõ; CTA công việc/liên hệ, không hứa đặt lịch |
| `logos` / LogoRail | move | Công ty gắn vào case và timeline; không có dải riêng |
| `statBand` | move/hide | 97,5% về 3PL; 300k về chi tiết kinh nghiệm nếu cần; 4 hệ thống/6+ năm không làm dải KPI. StatBand không được mount ở `app/page.tsx` baseline |
| `sectionLabels.cases*`, `intro.body[2]` | rewrite | Mô tả công việc; bỏ hướng dẫn hover và lời giới thiệu năm luận điểm dài |
| `featuredSlug`, `cases[].tier` | rewrite khi tích hợp | Dùng `tier` làm nguồn hierarchy: P&G + app GHN là flagship, KA/SLA deep, 3PL brief. Bỏ `featuredSlug` sau khi rà consumer, không tạo danh sách featured thứ hai |
| `pipeline.eyebrow/heading/intro/steps` | rewrite | Bốn bước, mỗi bước một câu |
| `pipeline.steps[].tool/owner/constraint`, `tradeoff` | move | Kiến trúc GHN trong case app/KA, gắn đúng chủ sở hữu. Không khẳng định kiến trúc này áp dụng cho mọi case |
| `pipeline.aiNote` | rewrite/move | Một câu ở cách cộng tác: AI hỗ trợ code, người chịu trách nhiệm logic/đối chiếu |
| `intro.eyebrow/heading/body[0..1]` | rewrite | Hai đoạn xuất phát điểm và cộng tác |
| `intro.boundary/fit/notFit` | move/hide | Giới hạn kỹ thuật vào ownership của case; không render hai danh sách đối lập |
| Chân dung hardcode trong About | hide | Layout không cần ảnh; không dựng ảnh thay thế |
| `skills[].title/items` | rewrite | Ba nhóm năng lực, mỗi nhóm dẫn tới case cụ thể; công cụ chi tiết ở case/CV |
| `experience[].company/role` | keep | Giữ vai trò/công ty, làm rõ Interdist bán thời gian |
| `experience[].period/summary/highlights` | rewrite/move | Một câu mỗi vị trí. Dùng mốc bắt đầu thay “nay” khi chưa xác thực trạng thái. Thành tích chi tiết về case/CV |
| `testimonials.*` | hide | Không có quote thật; không đưa lý do để trống lên website |
| `sectionLabels.ctaHeading/ctaBody` / ValueProp | hide | Thông điệp lặp hero; không cần section riêng |
| `contact.heading/body/availability` | rewrite | Lời mời vị trí BI/Data Analyst và dự án ngang nhau |
| `contact.email/linkedin/cvHref` | keep | Giữ nguyên ba đích liên hệ; CV dùng nhãn “Xem CV (PDF)” nếu chỉ mở link |
| `game.*` | keep | Toàn bộ game content giữ nguyên; viết entry phụ riêng cho homepage, chưa tích hợp |
| Footer / nhãn hardcode ở component | rewrite/move | Đưa Email, LinkedIn, CV, lên đầu trang, vị trí, menu, skip link và nhãn ảnh vào content khi tích hợp |

## Nhóm trường chung của cả năm case

| Nhóm | Xử lý / nơi đọc |
|---|---|
| `slug/accent` | keep; slug bất biến, accent chỉ ánh xạ semantic khi dựng theme |
| `title/client/clientNote/role/period/scopeLabel` | rewrite gọn, luôn hiện trên đầu case; không giấu quyền sở hữu |
| `proves/oneLiner/context` | rewrite; gộp luận điểm lặp vào summary, context ngắn dưới ảnh |
| `keyResult` | rewrite theo evidence register dưới; không đồng nhất `verified:false` với mọi loại “chưa xác thực” |
| `decisions[].problem/why/decision/term` | rewrite/move; chọn theo vấn đề nghiệp vụ trong bảng sau, phần còn lại đọc sâu |
| `ownership.owned/notOwned` | keep/rewrite; giữ toàn bộ giới hạn, luôn hiện trong case |
| `results[].label/value/method/verified` | keep/rewrite; giữ phương pháp/nguồn/mốc sát số. Claim thiếu nguồn công khai dùng cách viết có quy thuộc hoặc chưa đưa lên headline |
| `reflection` | rewrite; một bài học cụ thể, giữ tự phát hiện lỗi/giới hạn khi có ý nghĩa |
| `features/stack` | move; capability chính cạnh minh hoạ, danh sách kỹ thuật ở phần đọc sâu |
| `flowHeading/flow.nodes/flow.edges` | move/review; render đúng quan hệ, không biến nhánh quyền truy cập thành một bước dữ liệu tuyến tính |
| `media.id/kind/src/isDemoData/wide` | keep | Thêm caption và kích thước nội tại theo bảng ảnh; `brief` là note nội bộ |
| `media.alt` | rewrite khi cần | Tả thứ thực sự nhìn thấy; caption giải thích quyết định |
| `homepageDecisionCount` | hide/remove khi tích hợp | Không slice theo index. Homepage dùng summary; decisions ở case chọn theo chủ đề |

## Quyết định tiêu biểu và đường đọc sâu

| Case | Hiện sớm trong case | Đọc sâu, vẫn giữ trong nội dung | Lý do chọn |
|---|---|---|---|
| P&G | Giá theo hiệu lực; phân bổ target theo lịch | Parsing SKU, staging, actual tính từ fact, phân quyền/audit, stack | Hai quyết định nối trực tiếp với cách người quản lý đọc doanh thu/tiến độ; không chọn hai decision đầu mảng |
| App GHN | Copy ảnh vào group; chuyển từ đọc CSV sang đồng bộ trong Workspace | Allowlist/access log, pipeline, vận hành và giới hạn nhúng | Một quyết định phục vụ thói quen, một quyết định giải quyết ràng buộc thực tế |
| Reporting KA | KPI dùng chung; đối chiếu trước phát hành; định danh seller | Skill AI, đổi engine theo sheet, lịch phân phối, stack | Thể hiện khả năng làm số nhất quán và tìm lỗi, thay vì lấy AI làm luận điểm chính |
| SLA | Thứ tự ưu tiên; dựng episode; ngày lịch/48 giờ | Chạy bốn rule không lọc nhãn; audit 22h30 ở luồng phân tích riêng; tự phát hiện join nhân dòng | Giữ reasoning nghiệp vụ nhưng không nhập KAS-136 thành một bước của KAS-77 |
| 3PL | Cùng dashboard/định nghĩa KPI và nhịp phối hợp | Cải tiến trạng thái/contact rate khi có đủ phương pháp nguồn | Case kết quả ngắn, không gán toàn bộ cải thiện vận hành cho dashboard |

## Evidence register

Nguồn dưới đây là nội dung/comment hiện có trong `content/content.vi.ts`, không phải truy vấn mới. Ngày review 09/09/2026 không phải ngày đếm dữ liệu. Không dùng ngày trong screenshot demo làm mốc kinh doanh.

| Claim | Nguồn hiện có / loại | Xử lý trong draft | Cần bổ sung để viết mạnh hơn |
|---|---|---|---|
| P&G 85.563 giao dịch; 12.476 tổng hợp ngày; 569 target; 41 cửa hàng; 176 SKU; 6 vùng; 2 kênh; 8 tài khoản | `pg-sales-operations.results`, ghi Postgres production/master data; thiếu ngày đếm | Giữ trong sổ nguồn; headline dùng sản phẩm/quy trình, chưa đưa thành số “hiện tại” | Ngày snapshot, điều kiện đếm/profile hoạt động, phạm vi dự án |
| P&G ~40–60 giờ/tháng | Ước tính từ công việc 3–4 PIC, chưa time-tracking | Đọc trong results với nhãn ước tính và nguyên phương pháp | Đo trước/sau cùng phạm vi công việc |
| RLS toàn bộ 22 bảng; “không thể lách API”; “không bao giờ lệch” | Claim source, không có security test mới | Viết cơ chế phân quyền/tính actual từ fact; bỏ bảo đảm tuyệt đối | Evidence test chính sách theo vai trò; snapshot schema nếu nêu số bảng |
| App nhúng Control Tower SPE | Comment KAS-192; results nói team khác nhúng lại | “Đã được team Control Tower SPE nhúng…”; ghi nguồn mô tả công việc, không gọi live demo | Link/trích bằng chứng được phép công khai; không cần truy cập mới để làm bản mẫu |
| App 4 tab | Comment repo đối chiếu 24/08/2026; ảnh cho thấy bốn tab | Có thể nêu bốn tab kèm mốc source 24/08/2026 trong case | Nếu nói hiện tại cần kiểm lại app; không khôi phục ba report đã bỏ |
| App ~12–14 ngày công | Ước tính hạng mục khi mở task | Chuyển ghi chú effort đọc sâu, không phải impact/time saved | Phương pháp quy đổi chi tiết nếu muốn đưa lại |
| Reporting KA giảm ~70% | Tự ước lượng quy trình soạn tay/pipeline; chưa time-tracking | Giữ nhãn ước tính và phương pháp ở case; homepage không lấy làm headline | Đo thời gian cùng phạm vi trước/sau |
| KA 5 loại báo cáo, ba nhóm dùng | `results`, mô tả workflow/đếm loại; chưa có ngày | Homepage dùng nhóm dùng; không khẳng định trạng thái đang chạy | Mốc và danh mục năm loại nếu nêu số |
| SLA bốn rule, hai nhóm; “mọi đơn đúng một kho” | `sla-attribution`, comment KAS-77; OE chốt rule/ngưỡng | Chọn kho theo ưu tiên khi đủ dữ kiện và có vi phạm phù hợp; không hứa bao phủ mọi đơn | Evidence ca không khớp rule/log thiếu/NULL; không tự điền threshold |
| SLA audit 22h30 | Comment KAS-136, luồng riêng | Đọc sâu, ghi rõ phân tích riêng; không ghép vào sơ đồ rule chính | Nguồn được phép công khai nếu dùng ví dụ thực |
| 3PL 90,1% → 97,5% | `keyResult/results`, thời kỳ công việc 2021–2025; `proves` nói Shopee/đối tác xác nhận | Giữ hai mốc với scope Viettel Post, quy thuộc hồ sơ công việc; không vẽ trend trung gian | Ngày/kỳ của mỗi mốc, mẫu số, tài liệu xác nhận được phép công khai |
| Contact rate giảm 15–20% | Source gắn cải tiến luồng trạng thái, thiếu baseline/kỳ đo | Không làm headline; giữ ở sổ nguồn đến khi có phương pháp rõ | Định nghĩa contact rate, kỳ/mẫu số và phân biệt tương đối/điểm % |
| 3PL giảm khoảng 30% việc tay | Ước tính nhờ Apps Script | Chỉ đọc sâu nếu giữ nhãn ước tính; không suy thành giờ/tiền | Cách ước lượng |
| 300k đơn/ngày J&T; 6+ năm; “nay” | Career content, kỳ 2020–2021 và 2019 trở đi | Timeline một câu không cần số quy mô; mốc bắt đầu cho GHN/Interdist | Trạng thái công việc hiện tại nếu muốn dùng “nay” |
| Chân dung/testimonials | Placeholder source; chưa có quote/ảnh phù hợp | Ẩn khỏi bản mẫu | Tài sản thật được phép công khai, không chặn Phase 2 |

## Tám ảnh hiện có

Tất cả có `isDemoData:true`. Giữ nhãn **Giao diện thật · dữ liệu minh hoạ** sát từng ảnh, kể cả ảnh được crop. Không lấy số trong ảnh làm kết quả. Không cần sửa PNG trong Phase 1.

| File trong `public/` | Kích thước | Nơi dùng / khung | Caption đích và ghi chú sau khi xem |
|---|---|---|---|
| `case-pg-dashboard.png` | 1838×907 | Homepage P&G + ảnh đầu case; toàn ảnh contain, tỷ lệ gốc | “Theo dõi doanh số so với target và tìm vùng cần xem lại.” Ảnh có avatar/tên Minh Anh ở sidebar và widget cạnh phải; chưa có nguồn xác nhận danh tính demo. Bản mẫu dùng viewport crop phần nội dung x=200..1810, y=0..850, giữ bộ lọc/KPI/biểu đồ; không hiện sidebar/avatar và widget. Link ảnh lớn cũng phải dùng cùng crop đã xuất khi triển khai hoặc chờ xác nhận danh tính demo |
| `case-pg-import-preview.png` | 780×595 | Chi tiết staging/import; contain, không crop modal | “Xem phạm vi và chênh lệch dữ liệu trước khi xác nhận thay thế.” Dòng label trên số 1.612 bị cắt sẵn trong nguồn; không dùng làm hero, có thể chụp lại khi có môi trường demo |
| `case-pg-target-preview.png` | 1086×611 | Cạnh decision target; toàn chiều rộng | “Điều chỉnh target ngày và xem tác động trước khi áp dụng.” Giữ lịch, cột điều chỉnh và preview bên dưới trong cùng khung |
| `case-kas-shopee-matrix.png` | 1800×1000 | Homepage app GHN + đầu case; contain | “Xem chỉ số đúng giờ và các hub cần can thiệp trên cùng một màn hình.” Tên hub có Demo, bảng xuống tới mép ảnh; đây là phần nhìn thấy của bảng, không gọi là bảng đầy đủ |
| `case-kas-shopee-hub-drill.png` | 1800×960 | Decision copy ảnh; rộng | “Mở từ vùng xuống hub và copy bảng thành ảnh để trao đổi trong group.” Giữ nút Copy Ảnh, header và các dòng hub; không ép vào thumbnail vuông |
| `case-kas-shopee-insight.png` | 1800×940 | Đọc sâu; rộng | “Gợi ý chỉ số và hub cần kiểm tra thêm; tương quan theo thời gian chưa xác nhận nguyên nhân.” Không crop mất ghi chú tương quan trong ảnh |
| `case-kas-shopee-access-log.png` | 1800×1090 | Đọc sâu quyền truy cập; contain | “Theo dõi lượt truy cập và tài khoản đang hoạt động.” Các email hiển thị dạng demo. Không viết ảnh chứng minh ai đã xem phiên bản báo cáo nào; ảnh không cho thấy version audit |
| `case-kas-monitor.png` | 1616×902 | Reporting KA, ảnh phụ sau before/after | “Đối chiếu sản lượng, dự báo và năng lực theo tỉnh.” Email demo; ngày hiển thị ở ô lọc và mô tả khác cách định dạng, không suy ngày xác thực. Không dùng làm ảnh SLA |

SLA không có ảnh: dùng ví dụ cấu trúc “log → episode → đánh giá quy tắc → chọn theo ưu tiên → chi tiết để kiểm lại”, nhãn minh hoạ, không tạo mã đơn/ngưỡng/thời gian giả như dữ kiện thật. 3PL dùng hai mốc số với nguồn/phạm vi; không cần screenshot thay thế.

Mobile: giữ tỷ lệ ảnh, cho mở lớn; caption tóm tắt ý nghĩa khi bảng chữ nhỏ. Crop P&G phải tạo bản dẫn xuất dùng chung cho thumbnail và ảnh lớn ở Phase 2; không crop bằng `object-fit:cover` tùy tiện. Chưa kiểm crop trong browser hoặc xác nhận riêng tư đầy đủ ở Phase 1.

## Handoff schema và kiểm tra

- Copy draft là tài liệu biên tập; khi tích hợp chỉ `content/content.vi.ts` cấp nội dung cho component. Không để Markdown thành nguồn runtime thứ hai.
- Tái sử dụng `tier` cho hierarchy. Decisions cần ID ngữ nghĩa hoặc lựa chọn rõ theo chủ đề; bỏ cơ chế slice theo số lượng.
- `Media` cần caption/width/height. `Result` cần tách loại evidence (ước tính, snapshot quy mô, kết quả báo cáo) và mốc tùy chọn; không dùng một boolean để vừa nói “ước tính” vừa nói “thiếu nguồn”.
- Bổ sung copy labels dùng chung vào schema trước khi sửa JSX. Không xoá field legacy trước khi rà consumer.
- Phase 1 kiểm đủ 5 slug, 8 ảnh, 6 phần homepage, nhóm trường schema, nguồn/giới hạn và link nội bộ. Không sửa source runtime nên không chạy build/browser; đó là gate Phase 2–6.
- Chưa công bố tỷ lệ giảm chữ. Phase 2 đo textContent vùng main ở cùng viewport, cùng trạng thái mặc định, bỏ script/style và text trong ảnh; chuẩn hoá whitespace rồi đếm token cách nhau bởi khoảng trắng. Giữ baseline trước khi đổi UI và đo lại cùng phương pháp.

