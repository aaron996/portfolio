# Kế hoạch sửa design và content portfolio

Ngày: 09/09/2026

Trạng thái: Phase 1–2 hoàn thành local ngày 09/09/2026. Đã dựng homepage và case P&G, so sánh baseline, kiểm desktop/mobile và sửa một batch review. Đang ở mốc xem lại visual trước Phase 3; chưa commit, push hoặc deploy.
Phạm vi: Trang chủ, cả 5 case study, navigation/contact và phần giới thiệu dẫn vào minigame.

## 1. Mục tiêu và quyết định đã chốt

- Đối tượng: 50% nhà tuyển dụng BI/Data Analyst, 50% khách thuê dự án. Không chia trang thành hai nửa hoặc bắt người xem chọn persona.
- Luồng quan trọng: người đọc CV bấm sang portfolio để xem sản phẩm, mức đóng góp và cách suy nghĩ. Portfolio vẫn phải đủ ngữ cảnh cho người vào trực tiếp hoặc nhận link được chuyển tiếp.
- Vai trò của portfolio: trình bày công việc thực tế và cách giải quyết vấn đề; tránh kể lại đầy đủ CV.
- CTA chính: xem công việc tiêu biểu. Liên hệ là bước tiếp theo; CV là link phụ dễ tìm.
- Giữ cả 5 case, URL hiện tại, nguồn bằng chứng, giới hạn sở hữu, nhãn dữ liệu minh hoạ và phân biệt ước tính/kết quả đã xác nhận.
- P&G và app Shopee là hai case nổi bật. 3PL là bằng chứng kết quả ngắn. Reporting KA và SLA vẫn xuất hiện rõ trong danh sách công việc.
- Hướng thiết kế để triển khai bản mẫu: hero tối gọn, vùng dự án và nội dung dài sáng hơi ấm, lime tiết chế. Màu cụ thể và tỷ lệ diện tích sáng/tối sẽ được đánh giá ở bản mẫu, chưa coi là thông số đã duyệt.
- Giảm chữ lặp, giữ chiều sâu chuyên môn qua lớp đọc chi tiết. Không làm mỏng nội dung thành một bộ screenshot và KPI thiếu bối cảnh.

## 2. Dữ liệu đầu vào và giới hạn review

Review hiện tại: `.impeccable/critique/2026-09-09T03-01-49Z__app-page-tsx.md`. Quyết định 50/50 trong plan này thay thế các đề xuất 70/30 ở trao đổi trước.

- Trang chủ được đo cao khoảng 8.929px ở viewport 1656×822; 13.958px ở viewport DOM thực tế 434×938.
- Ảnh đầu tiên của case P&G ở y≈4.870px desktop và y≈7.040px mobile.
- Còn placeholder chân dung và ba testimonial trống trên bản công khai.
- Preview phụ thuộc hover/focus, chỉ hiện từ breakpoint xl và chỉ ba case có ảnh.
- Robot cố định có thể che vùng kết quả trên desktop hẹp.
- Tương phản chữ `mute-3` trên nền tối khoảng 3,68–3,86:1. Menu mobile có rủi ro focus/Escape/breakpoint theo source; chưa tái hiện runtime trong lượt review này.
- Chưa xác thực lại số liệu kinh doanh trong hệ thống nguồn; không coi nhãn `verified` của nội dung là kết quả kiểm chứng mới.
- Không đánh giá toàn bộ gameplay trong kế hoạch này.

## 3. Cấu trúc trang chủ đích

| Thứ tự | Phần | Nội dung và hành vi |
|---|---|---|
| 1 | Navigation + hero | Tên, BI/Data Analyst, domain logistics/ecommerce; headline ngắn; một đoạn mô tả; CTA xem công việc và liên hệ. Link CV phụ. Hero không có min-height buộc chiếm trọn màn hình |
| 2 | Công việc tiêu biểu | P&G và app Shopee có ảnh thật hiển thị trực tiếp, bài toán ngắn, vai trò và một bằng chứng quan trọng; toàn bộ đường vào case hoạt động bằng chuột, bàn phím và cảm ứng |
| 3 | Kết quả và công việc khác | 3PL dạng khối kết quả ngắn có mốc/phạm vi; reporting KA và SLA dạng hàng dễ đọc. Cả 5 case đều có tên và link trên trang chủ |
| 4 | Cách làm việc | Bốn bước: hiểu bài toán → chốt định nghĩa → xây và đối chiếu → đưa vào sử dụng. Mỗi bước một câu; ràng buộc kiến trúc nằm trong case phù hợp |
| 5 | Về tôi + kinh nghiệm | Một đoạn về xuất phát điểm vận hành, một đoạn về cách cộng tác; timeline ngắn, mỗi vị trí một điểm chính. Kỹ năng gom theo năng lực, có liên hệ tới case. CV để xem đầy đủ |
| 6 | Liên hệ + khám phá thêm | Lời mời trao đổi cơ hội việc làm và dự án có trọng lượng ngang nhau; email, LinkedIn, CV. Minigame là đường dẫn phụ gắn với hành trình nghề nghiệp |

Navigation đề xuất: Công việc · Về tôi · Liên hệ; CV là link riêng. Quy trình có thể đi cùng Về tôi thay vì chiếm thêm mục. Khi triển khai vẫn giữ các anchor cũ có ý nghĩa (`#cases`, `#pipeline`, `#about`, `#experience`, `#contact`) hoặc chuyển tới section tương ứng để link đã chia sẻ tiếp tục dùng được.

Không dùng dải logo và stat band như hai section lớn riêng nếu chỉ lặp thông tin đã có. Gắn công ty, thời kỳ và số liệu vào đúng ngữ cảnh case/timeline.

## 4. Nguyên tắc biên tập

- Mỗi section trả lời một câu hỏi khác nhau. Thông điệp chốt chỉ tiêu và chịu trách nhiệm với dữ liệu chỉ cần một lần ở cấp giới thiệu; case chứng minh bằng hành động cụ thể.
- Viết đủ: vấn đề → phần tôi làm → đầu ra → kết quả/giới hạn. Đưa công nghệ xuống sau câu chuyện công việc.
- Tránh slogan nhiều vế, diễn giải tự biện hộ và bảo đảm tuyệt đối như “không bao giờ lệch”. Viết cơ chế tính/kiểm soát đã có bằng chứng.
- Số lượng giao dịch/người dùng/cửa hàng là quy mô; không trình bày chúng như tác động tiết kiệm thời gian hoặc lợi ích tài chính.
- Ước tính như 40–60 giờ/tháng, giảm ~70% thời gian làm tay giữ nhãn và phương pháp. Không đưa thành headline đã kiểm chứng.
- Các giá trị “hiện tại/đang chạy” phải có mốc kiểm chứng nếu có; nếu chưa có mốc, dùng ngôn ngữ lịch sử phù hợp hoặc ghi cần cập nhật. Không tự suy ra ngày đếm dữ liệu.
- Ẩn testimonial khi không có trích dẫn thật được phép công khai. Không đưa lời giải thích về việc để trống lên website.
- Chân dung là tùy chọn: nếu chưa có ảnh phù hợp, dùng bố cục không cần ảnh. Không chặn redesign để chờ ảnh và không tạo chân dung thay thế.
- “Xem 5 hệ thống đang chạy thật” đổi thành “Xem công việc tiêu biểu” hoặc cách gọi đúng số case; bỏ lời hứa đặt lịch nếu chỉ dẫn tới email.
- Thu gọn “Tôi không phù hợp khi”; giới hạn chuyên môn và sở hữu nằm trong ngữ cảnh case khi cần.
- Mục tiêu mềm: giảm 40–50% chữ hiển thị mặc định ở homepage so với baseline cùng cách đo. Không giảm cỡ chữ hoặc giấu thông tin quan trọng để đạt tỷ lệ.

## 5. Template và nội dung của 5 case

### Template chung

1. Link quay lại danh sách, tiêu đề, tóm tắt bài toán, vai trò, thời kỳ và bằng chứng chính.
2. Ảnh sản phẩm lớn hoặc ví dụ minh hoạ phù hợp với loại case. Chú thích giải thích người dùng nhìn gì/quyết định gì; nhãn demo sát ảnh.
3. Bối cảnh ngắn và 2–3 quyết định tiêu biểu với vấn đề, lựa chọn, lý do.
4. Chi tiết kỹ thuật tùy chọn, có mục lục cho case dài; không giấu vai trò, kết quả, nguồn và giới hạn sau accordion.
5. Kết quả có phương pháp/nguồn/mốc; phạm vi tự làm và phối hợp; một bài học cụ thể.
6. Case liên quan và liên hệ gọn.

Không ép case ngắn có toàn bộ section. Dùng cùng hệ thống typography/spacing, nhưng để loại bằng chứng quyết định bố cục.

| Case | Nội dung ưu tiên | Nội dung đọc sâu / lưu ý |
|---|---|---|
| P&G | Dashboard; bài toán tổng hợp doanh số; sở hữu sản phẩm; giá hiệu lực và phân bổ target | Parsing SKU, staging, schema, phân quyền. Không dùng số giao dịch thay cho impact. Phân biệt ứng dụng nội bộ Interdist với vai trò tại P&G |
| App Shopee | Ảnh điều hành; việc được Control Tower SPE nhúng lại; cách xuất ảnh vào group giúp phù hợp hành vi người dùng | Pipeline, đồng bộ và ràng buộc hạ tầng. Ghi rõ đây là sản phẩm trong công việc GHN, tránh hiểu thành sản phẩm của Shopee |
| Reporting KA | Quy trình trước/sau; định nghĩa KPI dùng chung; nhóm sử dụng đầu ra | Validation, định danh seller, đổi engine, tự động hoá; giữ ~70% là ước tính |
| SLA | Một hành trình đơn minh hoạ và cách chọn kho chịu trách nhiệm | Quy tắc ưu tiên, chuẩn hoá log, ngày lịch/48 giờ. Không lấy screenshot case khác; không public dữ liệu nhạy cảm |
| 3PL | Baseline 90,1% → 97,5%, phạm vi, thời kỳ, vai trò phân tích và điều phối | Ghi chú hình thức xác nhận nếu có thể công khai. Chỉ hai mốc thì dùng so sánh hai mốc; không dựng đường trend có dữ liệu trung gian tự tạo |

Sơ đồ luồng phải phản ánh quan hệ thật. `FlowDiagram` hiện chỉ nhận `nodes`; nếu giữ sơ đồ kiến trúc có nhánh, bổ sung cách render `edges` hoặc viết lại thành sơ đồ quan hệ đúng. Không đánh số tuyến tính cho một nhánh phụ thuộc.

## 6. Phases và đầu ra

### Phase 1 — Biên tập và kiểm kê bằng chứng

- [x] Lập bảng keep/rewrite/move/hide cho từng section và từng nhóm trường trong content.
- [x] Viết nội dung homepage ngắn và bản tóm tắt cho cả 5 case; chọn decision tiêu biểu theo ý nghĩa, không cắt tự động theo index.
- [x] Kiểm tra ảnh hiện có trong `public/case-*.png`, crop/khung hiển thị và caption phù hợp.
- [x] Kiểm tra claim, ước tính, vai trò và nhãn công ty; đánh dấu dữ kiện cần nguồn bổ sung.
- [x] Viết ngắn product context từ các quyết định đã chốt; khi bước vào triển khai lưu PRODUCT.md. Không hỏi lại tỷ lệ 50/50.

Đầu ra: [content map và kiểm kê bằng chứng](portfolio-content-map.md), [copy draft](portfolio-copy-draft.md), [PRODUCT.md](../PRODUCT.md) để gắn trực tiếp vào bản mẫu. Không cần thêm ảnh hoặc xác nhận số mới để xử lý phần đã có đủ bằng chứng.

### Phase 2 — Bản mẫu trang chủ và một case

- [x] Dựng một hướng hoàn chỉnh: hero tối gọn, nền sáng cho dự án/nội dung, lime có vai trò rõ.
- [x] Dùng P&G làm case mẫu vì có ảnh, decisions, features, flow và kết quả; kiểm tra thêm tình huống case không có ảnh ở mức cấu trúc.
- [x] Thể hiện ảnh luôn nhìn thấy, thứ bậc 2 case nổi bật + 3 case bổ sung, contact 50/50 và link CV phụ.
- [x] Dùng tiếng Việt và nội dung thật để kiểm line-wrap, không dùng lorem ipsum.
- [x] Xem desktop và mobile trong một lượt có giới hạn, gom sửa phát hiện vào một batch.

Đầu ra: homepage + case P&G có thể xem được, kèm bản so sánh với baseline. Đây là mốc xem lại visual trước khi nhân rộng; có thể chỉnh khi người dùng phản hồi, không tiếp tục xin lại các quyết định đã chốt.

Bàn giao: [so sánh, ảnh và checks](portfolio-phase2-review.md), [hướng bản mẫu](portfolio-phase2-direction.md), [DESIGN.md bản mẫu](../DESIGN.md). Case không ảnh được kiểm ở cấu trúc hàng KA/SLA trên homepage; bốn trang case cũ vẫn truy cập được. Flow và toàn bộ feature inventory P&G sẽ chuyển sang template mới ở Phase 4. Chưa đánh dấu hoàn thành Phase 3–6 từ các primitive đã dùng cho bản mẫu.

### Phase 3 — Hệ thống giao diện và trang chủ

- [ ] Tạo token semantic cho nền, chữ, viền, link, accent và focus của portfolio; kiểm tương phản trên cả vùng sáng/tối.
- [ ] Scope theme theo surface. Không đảo ý nghĩa toàn bộ `ink/paper` trong global CSS vì `/game` đang dùng chung chúng.
- [ ] Giữ font hiện có nếu bản mẫu đạt yêu cầu; giảm độ lớn, in hoa và mật độ heading trước khi thêm font mới.
- [ ] Lắp cấu trúc homepage, thay hover-only preview bằng ảnh/vùng preview có chỗ riêng.
- [ ] Thu gọn pipeline/About/Experience; bỏ ValueProp nếu chỉ lặp hero, không render testimonial trống.
- [ ] Giới hạn SensorBot ở hero hoặc vùng riêng, không fixed theo toàn trang/case. Giới hạn CursorLight/grain để không phủ vùng đọc sáng.
- [ ] Ghi DESIGN.md và hướng dẫn ngắn cho homepage/case sau khi chốt bản mẫu.

### Phase 4 — Áp dụng cho cả 5 case

- [ ] Hoàn thiện template theo Phase 2; mỗi case có phần tóm tắt và bằng chứng phù hợp.
- [ ] Chuyển narrative kỹ thuật xuống lớp đọc sâu, giữ semantics heading và link mục lục.
- [ ] Hoàn thiện cách xem ảnh lớn bằng link hoặc dialog accessible; ảnh có kích thước nội tại/tỷ lệ khung, alt và caption.
- [ ] Lazy-load ảnh dưới fold; không lazy-load ảnh chính trong viewport đầu nếu làm chậm bằng chứng.
- [ ] Sửa sơ đồ quan hệ, kiểm cả case ngắn/không ảnh và link các case liên quan.

### Phase 5 — Navigation, liên hệ và giới hạn ảnh hưởng tới game

- [ ] Menu mobile có Escape, chuyển/khôi phục focus, ngăn focus đi vào nền và giải phóng scroll lock khi đổi breakpoint/route/unmount.
- [ ] Active navigation, anchor offset, skip link và focus indicator dùng được trên mọi tone nền.
- [ ] Email/LinkedIn/CV có nhãn đúng hành vi; không tự thêm scheduler hoặc form backend.
- [ ] Thu gọn lời giới thiệu `/game` bị lặp nếu đụng tới entry; không sửa engine, combat, save, sprite hay art trong batch portfolio này.
- [ ] Nếu việc bỏ intro lặp yêu cầu sửa OpsGame, chỉ giới hạn phần văn bản/props của entry, kiểm tài liệu game áp dụng trước khi sửa. Ưu tiên giữ nguyên nội dung bên trong game và bỏ bản lặp ở wrapper.

### Phase 6 — Kiểm thử và bàn giao

- [ ] Chạy TypeScript và production build theo quy ước repo; không chạy `next lint` vì repo chưa có cấu hình.
- [ ] Kiểm trình duyệt ở 390×844, 768×1024, 1280×800, 1440×900; ghi viewport DOM thực tế nếu khác kích thước yêu cầu.
- [ ] Kiểm tất cả 5 URL case, CV, email/LinkedIn, điều hướng từ case về homepage và direct landing từ URL.
- [ ] Kiểm mobile menu bằng keyboard, đổi breakpoint khi menu đang mở, reduced motion, zoom 200%, text wrapping và horizontal overflow.
- [ ] Smoke test `/game` entry và bắt đầu game để phát hiện CSS shared làm hỏng UI; không báo toàn bộ gameplay đã được kiểm.
- [ ] Chạy detector một lần trên UI đã sửa; kết hợp nhận định trực quan và content review, không coi detector sạch là hoàn tất audit.
- [ ] Một vòng desktop/mobile tổng hợp, sửa một batch, tối đa một vòng xác nhận lại nếu có thay đổi. Chỉ mở rộng kiểm tra khi phát hiện rủi ro cụ thể.
- [ ] Cập nhật README/mô tả cấu trúc để không còn hướng dẫn cũ; bàn giao danh sách thay đổi, ảnh/bản xem, checks và giới hạn.

## 7. Tiêu chí nghiệm thu

| Hạng mục | Điều kiện đạt |
|---|---|
| Định vị | Người đến trực tiếp thấy tên, vai trò, domain và loại công việc; người từ CV tới thấy nội dung bổ sung, không gặp CV lặp dài |
| Cân bằng đối tượng | Dự án ở trung tâm, lời mời tuyển dụng/hợp tác rõ và cân bằng; không có persona gate |
| Bằng chứng sớm | Bắt đầu thấy ảnh/bằng chứng case nổi bật trong hai màn hình đầu homepage; bằng chứng chính của case trong hai màn hình đầu ở các viewport kiểm thử |
| Chiều sâu | Cả 5 case còn truy cập được, giữ quyết định nghiệp vụ và phạm vi đóng góp; nội dung sâu có đường mở rõ |
| Nội dung | Không placeholder/chỗ chờ trích dẫn; không claim 5/4 mâu thuẫn; không số mới hoặc timeline tự tạo; ước tính có nhãn |
| Nhịp đọc | Phần dự án và narrative có nền sáng, headings có cấp độ rõ; chữ quan trọng không dùng token chìm |
| Accessibility | Chữ thường tối thiểu 4,5:1, chữ lớn 3:1; focus rõ; thao tác chính bằng keyboard/touch; reduced motion không mất nội dung |
| Ảnh/hiệu ứng | Không robot/preview che thông tin; ảnh không méo, có kích thước dự phòng, xem chi tiết được |
| Điều hướng | Giữ URL case, CV và hash links cần thiết; menu không để scroll lock sau khi đóng/đổi breakpoint |
| Regression | `/game` giữ giao diện chơi và hoạt động khởi đầu; global effects không phủ vùng đọc sáng |
| Build | TypeScript và production build đạt; lỗi môi trường nếu có được báo riêng, không gộp thành pass |

“Trong hai màn hình đầu” là mục tiêu bố cục, không đạt bằng thu nhỏ chữ, cắt nội dung bằng overflow hoặc ép ảnh thành thumbnail không đọc được.

## 8. File dự kiến ảnh hưởng

| Nhóm | File |
|---|---|
| Nội dung/schema | `content/content.vi.ts`, `content/types.ts` — mọi chữ hiển thị, kể cả aria-label mới, nằm trong content theo quy ước repo |
| Trang chủ | `app/page.tsx`, `components/Hero.tsx`, `CaseGrid.tsx`, `PipelineSection.tsx`, `About.tsx`, `Experience.tsx`, `Testimonials.tsx`, `ValueProp.tsx`, `StatBand.tsx`, `LogoRail.tsx` |
| Hệ thống thiết kế | `app/globals.css`, `app/layout.tsx`, `components/ui/Section.tsx` và primitives cần thiết |
| Case | `app/case/[slug]/page.tsx`, `components/ui/MediaPlaceholder.tsx`, `FlowDiagram.tsx`, `DraftBadge.tsx` |
| Điều hướng/liên hệ | `components/Nav.tsx`, `Contact.tsx`, `Footer.tsx` |
| Trang trí | `components/ui/SensorBotCanvas.tsx`, `SensorBot.tsx`, `CursorLight.tsx`, `HeroGrid.tsx` khi cần scope/placement |
| Game entry | `app/game/page.tsx`, chỉ wrapper/copy khi cần |
| Tài liệu | `PRODUCT.md`, `DESIGN.md`, brief trang chủ/case khi triển khai, `README.md`, plan này |

Không xóa file/component chỉ vì không render nữa trước khi kiểm import và consumer. Schema đang có `tier`/`featuredSlug` chưa được dùng đầy đủ: quyết định tái sử dụng hoặc thay bằng trường featured rõ ràng, cập nhật comment để không tạo hai nguồn điều khiển thứ bậc.

## 9. Cách tổ chức thực hiện

- Phase 1 → 2 → 3 → 4 → 5 → 6 theo thứ tự phụ thuộc. Một người/agent giữ quyền sở hữu cấu trúc, schema, visual và integration.
- Gợi ý cấu hình khi triển khai: GPT-5.6 Sol, reasoning High cho content + UI + template + regression; GPT-6 Astra High hữu ích nếu bản mẫu cần thay đổi lớn về hướng thiết kế. Đây là khuyến nghị, không phải model đã được chuyển.
- Chưa cần nhiều task hoặc agent chỉnh file song song vì content/schema, CSS và template dùng chung. Chỉ tách reviewer độc lập sau khi có bản hoàn chỉnh nếu được cho phép hoặc workflow áp dụng yêu cầu.
- Không commit, push, merge hoặc deploy trong bước lập plan. Khi được yêu cầu triển khai, làm local trước và báo rõ trạng thái bàn giao.

## 10. Điểm còn mở, không chặn bắt đầu

- Chân dung/testimonials: mặc định layout không cần ảnh và ẩn testimonial. Có dữ liệu thật thì bổ sung sau.
- Mốc kiểm chứng các con số đang ghi “hiện tại”: chỉ thêm khi có nguồn; không truy cập hệ thống khách hàng ngoài phạm vi để tự cập nhật.
- Palette, mức độ xuất hiện robot và crop ảnh: chốt bằng bản mẫu Phase 2 trong phạm vi hướng đã thống nhất.
- Ngôn ngữ: giữ tiếng Việt; không thêm một bản tiếng Anh hoặc locale switch trong batch này.
- Ảnh OG hiện tại: kiểm có phản ánh sai định vị hoặc quá khác visual mới không; cập nhật từ tài sản hiện có nếu cần, giữ metadata URL và đường dẫn CV.

## 11. Ngoài phạm vi

Thay đổi CV PDF, job search, viết lại dữ kiện nghề nghiệp, xác thực hệ thống production khách hàng, tạo quote/portrait/số liệu giả, thêm CMS/auth/analytics/form backend, đổi domain/slug, thay engine hoặc art game, deploy lên production.

