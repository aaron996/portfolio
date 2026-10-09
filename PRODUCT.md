# Portfolio Lương Thế Vinh

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Portfolio phục vụ ngang nhau hai nhóm: nhà tuyển dụng BI/Data Analyst và khách thuê dự án dữ liệu. Người đọc thường đến từ CV để xem sản phẩm, phần đóng góp và cách giải quyết vấn đề. Không chia thành hai luồng theo persona và không kể lại đầy đủ CV.

Người vào trực tiếp cần nhận diện được tác giả, lĩnh vực logistics/thương mại điện tử và các công việc đã làm. Mục tiêu người đọc là đánh giá năng lực qua bằng chứng, hiểu phạm vi sở hữu và tìm cách liên hệ.

## Product Purpose

Giúp người đọc hiểu cách Vinh biến bài toán vận hành thành định nghĩa chỉ tiêu, mô hình dữ liệu và sản phẩm dùng được. Thành công là người đọc tìm được công việc liên quan, hiểu quyết định đứng sau kết quả, phân biệt số đã xác nhận với ước tính và có đủ thông tin để liên hệ hoặc đọc CV.

Portfolio tập trung vào công việc thực tế. Minigame là trải nghiệm bổ sung về đường đi nghề nghiệp và khả năng dựng sản phẩm bằng AI-assisted coding; thông tin nghề nghiệp và case vẫn đọc được độc lập với game và các hiệu ứng tương tác.

## Positioning

Nội dung nối kinh nghiệm vận hành logistics/thương mại điện tử với việc tự chốt logic dữ liệu, dựng hệ thống và kiểm chứng đầu ra. Case mô tả cả quyết định, phần đóng góp và giới hạn, không chỉ liệt kê công cụ hoặc trình bày ảnh dashboard.

Bằng chứng cụ thể gồm hệ thống quản lý doanh số Interdist, ứng dụng theo dõi vận hành KAS GHN và hiệu suất đối tác vận chuyển tại Shopee. KAS GHN là công cụ nội bộ được lãnh đạo sử dụng hằng ngày để xem chỉ số, theo xác nhận của chủ portfolio. Giữ rõ công việc tại GHN và vai trò từng làm tại Shopee.

## Operating Context

- Website dùng được trong browser trên desktop và mobile; người đọc có thể xem nhanh ở homepage hoặc đọc sâu trong case.
- CV PDF, email và LinkedIn là các tài liệu/kênh liên hệ hiện có. Liên hệ qua link và chức năng chép email; repo hiện không có form gửi yêu cầu, CMS hay luồng đăng nhập.
- Timeline, nhãn và nội dung chung ở `content/content.vi.ts`; ba case ở `content/cases.vi.ts`, được import vào cùng đối tượng content. Schema ở `content/types.ts`; component quyết định cách hiển thị.
- Repo dùng Next.js App Router, TypeScript, React và Tailwind CSS. Route case sinh từ content, không lấy nội dung từ một backend CMS.
- Intro lưu trạng thái đã xem trong session. Game lưu tiến độ và một số thiết lập trên browser; đây không phải dữ liệu tài khoản hay đồng bộ giữa thiết bị.

## Capabilities and Constraints

### Cấu trúc và nội dung hiện tại

- `/`: intro có bỏ qua/xem lại; hero sắp ô dữ liệu; danh sách ba case có mô tả ngắn, vai trò và xem trước; timeline năm nơi làm việc; các câu hỏi dẫn tới case; footer liên hệ, CV, minigame và điều khiển bạn đồng hành.
- `/case/[slug]`: ba case dùng chung `components/case/CaseArticle.tsx`. Nội dung gồm phạm vi, vai trò, bằng chứng, quyết định, kết quả, phần sở hữu và giới hạn; chỉ render các phần có dữ liệu. Ảnh mở trong dialog để xem rõ hơn.
- `/game`: minigame “Ải Vận Hành”, năm bản đồ gắn với năm nơi làm việc, có điều khiển bàn phím/cảm ứng, tạm dừng, túi đồ và lưu tiến độ local.
- Route không tồn tại dùng trang 404 tương tác với lối quay về homepage/công việc.

Ba URL case đang trình bày:

- `/case/pg-sales-operations`
- `/case/kas-shopee-performance`
- `/case/shopee-3pl-performance`

Reporting KA và SLA đã được gỡ theo yêu cầu ngày 09/10/2026, kể cả link homepage và điều hướng case. Các URL này trả 404. Slug `kas-shopee-performance` giữ để liên kết đã chia sẻ vẫn mở được case KAS GHN, không dùng để xác định tên/phạm vi sản phẩm.

Các anchor homepage hiện có là `#top`, `#main`, `#hero`, `#cases`, `#experience`, `#contact`. Các mốc `#pipeline`, `#about` và cấu trúc “bốn bước làm việc” của bản Phase 2 cũ không còn trong homepage hiện tại.

### Ranh giới thay đổi

Giữ CV, domain và slug hiện có khi sửa UX/UI. Thêm backend, form, CMS, đổi định vị, sửa gameplay/art hoặc deploy là phạm vi cần được yêu cầu riêng, không tự suy ra từ một lượt chỉnh giao diện hay cập nhật tài liệu.

Game có quy tắc asset riêng trong [docs/game-assets.md](docs/game-assets.md), đặc biệt mục 12. Thiết kế thị giác hiện tại được ghi trong [DESIGN.md](DESIGN.md); PRODUCT.md giữ thông tin sản phẩm và không đặt palette, typography hoặc công thức bố cục.

## Brand Commitments

Tên tác giả là Lương Thế Vinh. Ngôn ngữ nội dung chính là tiếng Việt; headline “MAKE SENSE OF DATA, MAKE THINGS WORK” hiện có bằng tiếng Anh. Giọng nội dung ngắn, cụ thể, thực tế và nói rõ phần Vinh chịu trách nhiệm. Mô tả công việc và sản phẩm trực tiếp; không bắt buộc dùng ngôi thứ nhất hoặc lặp “Tôi” ở mỗi đoạn.

Chấm, Trùng và Lệch là ba bạn đồng hành hiện có, với kịch bản trong [docs/companions.md](docs/companions.md). Người xem có thể tắt/bật; chúng không thay thế thông tin hoặc thao tác cần thiết để đọc case và liên hệ.

## Evidence on Hand

- `content/content.vi.ts` và `content/cases.vi.ts`: ba case, timeline, nhãn và nội dung game. Các field như `verified`, `method`, `ownership` và `isDemoData` thể hiện nguồn/phạm vi/giới hạn khi có.
- `public/case-pg-*.png`: ảnh dashboard, import preview và target preview của hệ thống Interdist/P&G.
- `public/case-kas-shopee-*.png` và `public/case-kas-monitor.png`: ảnh app điều hành và giám sát báo cáo tại GHN.
- `public/portfolio/visuals/cases/sla/sla-event-trace.webp`: minh hoạ tuyến event cho case quy trách nhiệm đơn trễ.
- `public/cv.pdf`, video intro và asset game: các tài liệu/media đã có trong repo.
- Các tài liệu Phase 2 như [content map](docs/portfolio-content-map.md) và [review](docs/portfolio-phase2-review.md) là hồ sơ lịch sử của lần dựng trước, không phải mô tả giao diện hiện tại. Khi có khác biệt, kiểm tra source và content đang dùng.

### Bằng chứng và cách diễn đạt

- Hệ thống doanh số là ứng dụng nội bộ của Interdist; KAS GHN là ứng dụng theo dõi vận hành được xây trong công việc tại GHN.
- Giữ phạm vi tự làm/phối hợp và quyền quyết định của vận hành, Data Platform, BI, đối tác.
- Ảnh ứng dụng dùng dữ liệu minh hoạ có nhãn sát ảnh. Screenshot chứng minh giao diện, không tự xác nhận số kinh doanh, bảo mật hay hành vi production.
- Ước tính giữ phương pháp và nhãn. Số quy mô không được viết thành tác động; không tự bổ sung ngày đếm, số liệu, chân dung hoặc lời chứng thực.
- Không render testimonial trống hoặc placeholder chân dung. Không cần chờ ảnh mới để nội dung đọc được.
- Phân biệt kiểm tra source, fixture/test local, browser local, thiết bị thật và production. Trạng thái phát hành cần xác minh riêng; không lấy ghi chú “chưa deploy” của một phase cũ làm kết luận về toàn website hôm nay.

## Product Principles

1. Công việc và bằng chứng giúp cả nhà tuyển dụng lẫn khách dự án đánh giá cùng một năng lực; không tạo hai câu chuyện nghề nghiệp khác nhau.
2. Một con số cần có định nghĩa, nguồn/phương pháp và phạm vi để người đọc hiểu đúng. Mức độ xác nhận quan trọng hơn cách diễn đạt gây ấn tượng.
3. Giữ rõ phần tự làm, phần phối hợp và giới hạn; không biến screenshot hoặc quy mô dữ liệu thành tuyên bố tác động chưa kiểm chứng.
4. Tương tác giúp khám phá công việc nhưng không được cản đọc nội dung, mở case, xem CV hoặc liên hệ.
5. Chữ hiển thị, caption và nhãn trợ năng thuộc `content/`; sửa component không tự bổ sung tuyên bố nghiệp vụ.

## Accessibility & Inclusion

Hỗ trợ đọc và thao tác bằng keyboard/touch; giữ focus rõ và một skip link tới nội dung chính trên mỗi route. Những control được chỉnh cần vùng chạm tối thiểu 44px. Dialog cần đóng được bằng Escape, quản lý focus và trả focus về vị trí phù hợp.

Tôn trọng reduced motion, không để hiệu ứng chạy vô ích khi nội dung khuất/tab ẩn và không phát live announcement theo từng phần trăm hoặc từng lần rê chuột. Các phương án xem trước bằng hover phải có thông tin/tác vụ tương ứng khi dùng keyboard hoặc màn nhỏ.

Đây là yêu cầu sản phẩm, không phải tuyên bố đã đạt chứng nhận WCAG hay đã kiểm mọi screen reader/thiết bị. TypeScript và production build không thay thế kiểm tra trải nghiệm sử dụng.
