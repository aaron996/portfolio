# Copy draft cho bản mẫu portfolio

Ngày: 09/09/2026. Đầu ra Phase 1, chưa thay nội dung website. Các bảng dưới là copy đích; ghi chú tích hợp/nguồn nội bộ được tách riêng. Khi dựng bản mẫu, chuyển copy vào `content/content.vi.ts` và khai kiểu trong `content/types.ts`.

## 1. Navigation và hero

| Vị trí | Copy | Đích |
|---|---|---|
| Tên | Lương Thế Vinh | `#main` |
| Vai trò | BI & Data Analyst | — |
| Navigation | Công việc · Về tôi · Liên hệ | `#cases` · `#about` · `#contact` |
| Link phụ | Xem CV (PDF) | `/cv.pdf` |
| Eyebrow | Logistics · Thương mại điện tử | — |
| Headline | Từ bài toán vận hành đến sản phẩm dữ liệu | — |
| Mô tả | Tôi xây dashboard và quy trình báo cáo cho đội ngũ vận hành: làm rõ cách tính chỉ tiêu, tổ chức dữ liệu và đối chiếu đầu ra trước khi đưa vào sử dụng. | — |
| CTA chính | Xem công việc tiêu biểu | `#cases` |
| CTA phụ | Trao đổi cùng tôi | `#contact` |

Metadata title: **Lương Thế Vinh — BI & Data Analyst**.

Metadata description: **Dashboard, báo cáo tự động và phân tích vận hành trong logistics, thương mại điện tử. Xem công việc, vai trò và cách giải quyết vấn đề của Lương Thế Vinh.**

## 2. Công việc tiêu biểu — `#cases`

Intro: **Những sản phẩm và phân tích tôi đã thực hiện, từ tổng hợp doanh số đến theo dõi hiệu suất giao nhận.**

### P&G Sales Operations Dashboard

**Interdist · Phụ trách dữ liệu và ứng dụng · Bán thời gian, từ xa**

Gom file doanh số rời vào một hệ thống để quản lý theo dõi kết quả theo vùng, kênh và sản phẩm.

**Phần tôi làm:** Từ làm rõ nghiệp vụ, thiết kế dữ liệu đến xây ứng dụng và xử lý phản hồi sử dụng.

**Điểm đáng xem:** Cách tính doanh thu theo giá hiệu lực và phân bổ target theo lịch cửa hàng.

Ảnh: `case-pg-dashboard.png`, dùng vùng crop đã chỉ định trong content map.

Caption: **Theo dõi doanh số so với target và tìm vùng cần xem lại.**

Nhãn sát ảnh: **Giao diện thật · dữ liệu minh hoạ**.

CTA: **Xem case P&G** → `/case/pg-sales-operations`.

### App điều hành hiệu suất Shopee tại GHN

**Giao Hàng Nhanh · Phụ trách dữ liệu và ứng dụng**

Đưa các bảng theo dõi đúng giờ, leadtime và hiệu suất hub vào một app phục vụ điều hành.

**Phần tôi làm:** Tầng dữ liệu, giao diện báo cáo, phân quyền và các cách chia sẻ đầu ra.

**Kết quả sử dụng:** App đã được team Control Tower SPE nhúng làm tab sức khoẻ vận hành.

Ảnh: `case-kas-shopee-matrix.png`.

Caption: **Xem chỉ số đúng giờ và các hub cần can thiệp trên cùng một màn hình.**

Nhãn sát ảnh: **Giao diện thật · dữ liệu minh hoạ**.

CTA: **Xem case app điều hành** → `/case/kas-shopee-performance`.

## 3. Kết quả và công việc khác

| Công việc | Copy ngắn | Đường dẫn |
|---|---|---|
| Hiệu suất đối tác vận chuyển 3PL | **90,1% → 97,5% pickup on-time của Viettel Post.** Tôi phân tích hiệu suất và phối hợp cải tiến cùng đối tác trong công việc tại Shopee, giai đoạn 2021–2025. | `/case/shopee-3pl-performance` |
| Chuẩn hoá báo cáo Key Account | Xây định nghĩa KPI dùng chung và quy trình sinh báo cáo cho điều hành vùng, team KA khách hàng và vận hành hub. | `/case/kas-reporting-automation` |
| Quy trách nhiệm đơn trễ | Chuyển log ra/vào kho thành dữ liệu để vận hành kiểm lại kho được chọn theo thứ tự ưu tiên của quy tắc. | `/case/sla-attribution` |

Ghi chú hiển thị sát số 3PL: **Theo hồ sơ công việc; kết quả phối hợp với đối tác. Hai mốc không đại diện cho toàn bộ diễn biến trong kỳ.**

Nhãn link: **Xem case 3PL** · **Xem case Reporting KA** · **Xem case SLA**. Giữ tên công ty và source note cùng số ngay cả trên mobile.

## 4. Cách làm việc — `#pipeline`

1. **Hiểu bài toán.** Trao đổi với người dùng để biết họ cần quyết định gì từ báo cáo.
2. **Chốt định nghĩa.** Làm rõ đơn vị tính, phạm vi dữ liệu và cách xử lý ngoại lệ.
3. **Xây và đối chiếu.** Dựng mô hình, báo cáo và kiểm những chỗ lệch với nguồn đang dùng.
4. **Đưa vào sử dụng.** Bàn giao đầu ra theo cách đội ngũ làm việc và sửa theo phản hồi.

## 5. Về tôi và kinh nghiệm

### Tôi đến với dữ liệu từ phía vận hành — `#about`

Tôi bắt đầu từ chăm sóc khách hàng xuất khẩu và vận hành giao nhận, rồi chuyển sang phân tích dữ liệu. Những công việc đó giúp tôi đặt câu hỏi về một con số trong bối cảnh thực tế: đơn đi qua đâu, ai dùng báo cáo và họ cần xử lý việc gì tiếp theo.

Tôi làm việc cùng người dùng nghiệp vụ và các đội phụ trách hạ tầng để đưa giải pháp vào sử dụng. AI hỗ trợ tôi viết code; phần chốt logic và kiểm chứng đầu ra vẫn do tôi chịu trách nhiệm.

### Kinh nghiệm — `#experience`

| Công ty / thời kỳ | Vai trò | Một điểm chính |
|---|---|---|
| GHN · Từ 2025 | Key Account Solution / Data Analyst | Chuẩn hoá báo cáo và xây công cụ phân tích cho các tài khoản chiến lược. |
| Interdist · Từ T5/2026 | Phụ trách dữ liệu và sản phẩm, bán thời gian từ xa | Xây hệ thống vận hành doanh số P&G song song với công việc tại GHN. |
| Shopee · 2021–2025 | Logistics Management Specialist | Phân tích hiệu suất và phối hợp cải tiến với các đối tác vận chuyển. |
| J&T Express · 2020–2021 | Key Account Specialist | Theo dõi vận hành luồng đơn Shopee và chuẩn hoá báo cáo nội bộ. |
| A.P. Moller Maersk · 2019–2020 | Export Care Business Partner | Phối hợp xử lý hàng xuất khẩu và duy trì master data khách hàng. |

Link: **Xem kinh nghiệm đầy đủ trong CV (PDF)** → `/cv.pdf`.

### Năng lực qua công việc

| Nhóm | Copy / case dẫn chứng |
|---|---|
| Định nghĩa và kiểm tra dữ liệu | SQL, mô hình dữ liệu, đối chiếu KPI và xử lý ngoại lệ. **Reporting KA** · **SLA** |
| Xây sản phẩm báo cáo | Dashboard, business rule, phân quyền và luồng nhập dữ liệu. **P&G** · **App điều hành GHN** |
| Phân tích để phối hợp vận hành | Theo dõi hiệu suất, xác định khâu cần xem lại và làm việc với đối tác. **Hiệu suất 3PL** |

## 6. Liên hệ và khám phá thêm — `#contact`

Heading: **Trao đổi về công việc hoặc dự án**.

Body: **Bạn đang tuyển BI/Data Analyst hoặc cần xây dashboard, chuẩn hoá báo cáo cho đội ngũ? Hãy gửi tôi bối cảnh công việc và điều bạn muốn giải quyết.**

Availability: **Cơ hội BI/Data Analyst · Dự án dữ liệu theo phạm vi rõ ràng**.

- **Gửi email** → `mailto:luongthevinh996@gmail.com`; hiển thị địa chỉ `luongthevinh996@gmail.com`.
- **LinkedIn** → `https://www.linkedin.com/in/vinhluongg/`.
- **Xem CV (PDF)** → `/cv.pdf`.

Khám phá thêm: **Ải Vận Hành — một minigame lấy cảm hứng từ những nơi tôi từng làm việc.**

Link phụ: **Khám phá minigame** → `/game`.

Footer: **Lương Thế Vinh · BI & Data Analyst · TP.HCM**. Link **Email** · **LinkedIn** · **Lên đầu trang**.

## 7. Tóm tắt và phần đọc đầu cho năm case

Các case giữ ownership và nguồn kết quả ngoài accordion. Copy dưới đây thay phần dẫn dài; narrative chưa được chọn chuyển sang đọc sâu theo content map, không xoá dữ kiện.

### `/case/pg-sales-operations`

**P&G Sales Operations Dashboard**

**Interdist · Bắt đầu T5/2026 · Bán thời gian, từ xa**

**Bài toán:** Doanh số về từ nhiều file Excel, khiến việc tổng hợp và theo dõi target phải lặp lại qua từng kỳ. Tôi xây ứng dụng nội bộ để đưa dữ liệu, quy tắc tính và báo cáo vào cùng một quy trình.

**Vai trò:** Phụ trách nghiệp vụ, mô hình dữ liệu, ứng dụng và vận hành sản phẩm; sử dụng AI hỗ trợ lập trình. Hạ tầng và bảo mật cấp doanh nghiệp thuộc khuôn khổ của Interdist.

**Đầu ra chính:** Dashboard doanh số, quy trình nhập có kiểm tra, giá theo thời gian hiệu lực và target theo lịch cửa hàng.

Ảnh chính và nhãn demo theo mục 2; hình minh hoạ không xác nhận số liệu kinh doanh.

**Hai quyết định tiêu biểu**

- **Tính doanh thu theo giá của giao dịch.** Giá thay đổi theo kênh, cửa hàng và thời kỳ. Tôi lưu khoảng hiệu lực và thứ tự ưu tiên giá riêng của cửa hàng so với giá mặc định để áp dụng đúng quy tắc khi tính doanh thu.
- **Phân bổ target theo lịch cửa hàng.** Tôi dùng trọng số theo thứ và ngoại lệ theo ngày, kèm preview trước khi áp dụng một lô điều chỉnh. Người dùng thấy tác động lên chỉ tiêu thay vì chia đều tháng theo một số ngày cố định.

**Kết quả và giới hạn:** Quy trình tổng hợp được đưa vào ứng dụng. Mức tiết kiệm **ước tính 40–60 giờ/tháng**, dựa trên thao tác tổng hợp của 3–4 PIC, công thức lặp và việc tập trung giá/target/mapping cửa hàng; chưa đo bằng time-tracking.

**Bài học:** Chốt quy tắc giá và target cùng người dùng trước khi mở rộng báo cáo giúp việc kiểm lại con số có điểm bắt đầu rõ ràng.

Đọc sâu: **Kiểm tra file và tách SKU** · **Mô hình actual/target** · **Phân quyền và lịch sử thay đổi** · **Phạm vi tôi phụ trách**. Giữ các source note chi tiết trong results khi tích hợp; chưa đưa số snapshot thiếu ngày lên đầu case.

### `/case/kas-shopee-performance`

**App điều hành hiệu suất Shopee tại GHN**

**Giao Hàng Nhanh · Bắt đầu 2026 · Công việc toàn thời gian**

**Bài toán:** Điều hành cần xem chỉ số đúng giờ và leadtime theo nhiều lát cắt. Tôi đưa các bảng rời vào một app để xem theo vùng, hub và chặng giao nhận.

**Vai trò:** Xây tầng dữ liệu, báo cáo, giao diện và kiểm soát truy cập theo yêu cầu của quản lý. Các định nghĩa ontime là chuẩn của công ty; Control Tower SPE do team khác sở hữu.

**Kết quả chính:** App đã được team Control Tower SPE nhúng làm tab sức khoẻ vận hành. Nguồn: mô tả công việc KAS-192 trong hồ sơ portfolio.

**Hai quyết định tiêu biểu**

- **Đưa bảng tới group điều hành.** Người dùng trao đổi bằng ảnh trong group. Tôi bổ sung copy bảng thành ảnh, trình chiếu toàn màn hình và xuất CSV để hỗ trợ cách làm việc đó.
- **Đổi cách đồng bộ khi chính sách chia sẻ thay đổi.** Khi browser không đọc được CSV của Sheet bị giới hạn chia sẻ, tôi chuyển sang Apps Script chạy dưới quyền người sở hữu Sheet, đẩy dữ liệu có cấu trúc sang cơ sở dữ liệu ứng dụng.

**Phạm vi đầu ra:** Bốn tab gồm chỉ số ontime theo miền/vùng/hub, %Ca 1 theo lane, leadtime từng chặng và Insight. Theo ghi nhận đối chiếu repo ngày 24/08/2026 trong hồ sơ portfolio.

**Giới hạn:** Quyền tạo job nguồn và hạ tầng thuộc các đội phụ trách. App có giới hạn truy cập; các ảnh ở đây dùng dữ liệu minh hoạ. Việc được nhúng lại thể hiện sản phẩm được sử dụng, chưa định lượng tác động tiết kiệm thời gian.

**Bài học:** Khi app trở thành một phần trong hệ thống của team khác, cần chốt cách thông báo thay đổi và trách nhiệm giữ ổn định.

Đọc sâu: **Luồng đồng bộ và ràng buộc hạ tầng** · **Quyền truy cập** · **Các màn hình báo cáo**. Lưu ý biên tập: access log không được diễn đạt thành khả năng truy lại phiên bản dữ liệu nếu chưa có bằng chứng.

### `/case/kas-reporting-automation`

**Chuẩn hoá và tự động hoá báo cáo Key Account**

**Giao Hàng Nhanh · Bắt đầu 2025 · Công việc toàn thời gian**

**Bài toán:** Cùng một KPI nhưng điều kiện lọc và mốc thời gian khác nhau khiến các báo cáo khó đối chiếu. Tôi xây định nghĩa dùng chung và quy trình tạo báo cáo cho các nhóm sử dụng.

**Vai trò:** Chốt logic KPI, xây SQL model và tự động hoá đầu ra. Team Data Platform vận hành lakehouse; tôi khai thác và mô hình hoá trên hạ tầng đó.

**Đầu ra chính:** Một nguồn định nghĩa KPI phục vụ điều hành vùng, team KA khách hàng và vận hành hub qua báo cáo định kỳ, dashboard và bản gửi group.

**Trước → sau:** Mỗi người tự viết query, dựng bảng và soạn file → báo cáo đọc từ định nghĩa chung, có đối chiếu trước khi thay quy trình và lịch phân phối đầu ra.

**Ba quyết định tiêu biểu**

- **Chốt KPI ở SQL model.** Đưa điều kiện lọc và mốc thời gian vào một nguồn để các báo cáo không tự diễn giải lại.
- **Đối chiếu trước khi phát hành.** Chạy cách tính mới cùng cách đang dùng và giải thích những chỗ lệch trước khi thay thế.
- **Kiểm tra định danh seller.** Chọn khoá thực thể và kiểm coverage, điều kiện phân luồng trước khi tổng hợp theo seller.

**Kết quả và giới hạn:** **Ước tính giảm khoảng 70% thời gian soạn tay**, theo so sánh của người trực tiếp làm giữa quy trình cũ và pipeline; chưa có time-tracking thực tế. Giá trị còn nằm ở việc các nhóm đọc cùng định nghĩa, không chỉ ở tốc độ tạo file.

**Bài học:** Chuẩn hoá định nghĩa và điều kiện kiểm tra giúp xử lý chênh lệch giữa báo cáo có hệ thống hơn.

Ảnh phụ: `case-kas-monitor.png`, caption/nhãn demo từ content map. Đọc sâu: **Ngữ cảnh dùng chung cho AI** · **Chuyển engine có đối chiếu** · **Lịch chạy và phân phối**.

### `/case/sla-attribution`

**Đơn trễ này thuộc trách nhiệm của kho nào?**

**Giao Hàng Nhanh · Bắt đầu 2025 · Công việc toàn thời gian**

**Bài toán:** Một đơn đi qua nhiều kho; tra từng dòng log dễ dẫn tới kết luận khác nhau. Tôi xây pipeline tổ chức lại log và áp dụng quy tắc ưu tiên để vận hành kiểm lại cơ sở chọn kho.

**Vai trò:** Diễn giải quy tắc thành dữ liệu, dựng episode nhập/xuất và đầu ra chi tiết theo đơn. Vận hành chốt bốn quy tắc, ngưỡng và quyết định chế tài.

**Đầu ra chính:** Bảng theo đơn kèm kho vi phạm từng quy tắc, số ngày tồn và số quy tắc cùng vi phạm. Việc chọn kho dựa trên thứ tự ưu tiên đã chốt; không mặc định mọi đơn thiếu log đều có kết luận.

Minh hoạ cấu trúc, không dùng dữ liệu đơn thật: **Log ra/vào → Episode nhập/xuất → Đánh giá quy tắc → Chọn theo ưu tiên → Chi tiết để kiểm lại**.

**Ba quyết định tiêu biểu**

- **Chốt ưu tiên giữa các rule.** Khi nhiều quy tắc cùng khớp, chọn theo thứ tự đã thống nhất với vận hành để kết luận không phụ thuộc thứ tự dòng dữ liệu.
- **Chuẩn hoá log trước khi áp rule.** Gom các lần nhập/xuất có ý nghĩa nghiệp vụ thành episode để xử lý quét trùng, thiếu và thứ tự bất thường.
- **Ghi rõ cách đếm thời gian.** Phân biệt ngày trên lịch với 48 giờ trôi qua trong định nghĩa ngưỡng; các ca sát ngưỡng cần được kiểm theo đúng cách đã chọn.

**Kết quả và giới hạn:** Đầu ra cho phép vận hành kiểm lại kết luận ở từng đơn. Case mô tả logic quy trách nhiệm; chưa đưa ra tỷ lệ bao phủ hoặc độ chính xác cho mọi dạng log.

**Bài học:** Thứ tự ưu tiên là quyết định nghiệp vụ cần thống nhất. Trong quá trình phân tích, tôi cũng phát hiện lỗi join nhân dòng trong query của mình và phải kiểm lại số trước khi kết luận.

Đọc sâu: **Đánh giá rule không phụ thuộc nhãn khiếu nại** · **Phân tích riêng: ngưỡng 22h30 thiếu điều kiện cùng ngày**. Không nhập hai luồng phân tích thành một pipeline.

### `/case/shopee-3pl-performance`

**Hiệu suất đối tác vận chuyển 3PL**

**Shopee · 2021–2025 · Logistics Management Specialist**

**Bài toán:** Nội bộ và đối tác nhìn các bộ số khác nhau, làm chậm việc thống nhất hành động theo khu vực. Tôi xây dashboard KPI và duy trì nhịp phân tích, phối hợp cùng đối tác.

**Kết quả chính:** **Pickup on-time Viettel Post: 90,1% → 97,5%.**

**Nguồn và phạm vi:** Hai mốc theo hồ sơ công việc trong giai đoạn tại Shopee 2021–2025. Hồ sơ ghi nhận đã được Shopee và đối tác xác nhận; bản portfolio chưa kèm tài liệu xác nhận công khai hoặc ngày cụ thể của từng mốc. Đây là kết quả phối hợp, không quy toàn bộ cải thiện cho dashboard hay một cá nhân.

**Phần tôi làm:** Xây dashboard bằng SQL và Google Sheets, thống nhất cách đọc KPI, phân tích theo khu vực và làm việc định kỳ với đối tác. Vận hành giao nhận do đối tác thực hiện.

**Quyết định tiêu biểu:** Cho hai bên xem cùng dashboard và định nghĩa KPI để chuyển trao đổi sang những khu vực cần hành động và theo dõi việc khắc phục.

**Bài học:** Cải thiện đến từ nhịp theo dõi và phối hợp duy trì qua thời gian. Hai mốc đủ mô tả kết quả đầu/cuối; không đủ để dựng xu hướng theo tháng.

Ghi chú biên tập nội bộ: claim contact rate 15–20% và giảm khoảng 30% việc tay vẫn được lưu trong evidence register; không đưa vào bản đọc đầu khi chưa có phương pháp đầy đủ. Không dùng ảnh app GHN để minh hoạ kết quả ở Shopee.

## 8. Nhãn dùng chung khi tích hợp

| Field dự kiến | Copy |
|---|---|
| `ui.skipToContent` | Đến nội dung chính |
| `ui.openMenu` / `ui.closeMenu` | Mở menu / Đóng menu |
| `ui.backToCases` | Về danh sách công việc |
| `ui.role` / `ui.period` / `ui.scope` | Vai trò / Thời kỳ / Phạm vi |
| `ui.decisions` / `ui.details` | Quyết định tiêu biểu / Đọc sâu |
| `ui.results` / `ui.source` / `ui.estimate` | Kết quả và giới hạn / Nguồn và phương pháp / Ước tính |
| `ui.ownership` / `ui.collaboration` | Phần tôi phụ trách / Phần phối hợp và giới hạn |
| `ui.demoData` / `ui.illustration` | Giao diện thật · dữ liệu minh hoạ / Minh hoạ cấu trúc |
| `ui.enlargeImage` / `ui.closeImage` | Xem ảnh lớn / Đóng ảnh |
| `ui.relatedCases` / `ui.contact` | Công việc liên quan / Trao đổi cùng tôi |

Case liên quan: P&G → app GHN + Reporting KA; app GHN → P&G + SLA; Reporting KA → SLA + app GHN; SLA → Reporting KA + 3PL; 3PL → app GHN + SLA. Link giữ nguyên slug. Contact cuối case dùng cùng lời mời ở mục 6, không tạo CTA “đặt lịch”.
