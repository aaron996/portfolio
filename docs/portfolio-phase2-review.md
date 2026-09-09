# Phase 2 — Bản mẫu homepage và P&G

Ngày: 09/09/2026. Triển khai local từ baseline `040b242`, theo copy Phase 1 và hướng visual đã chốt trong plan. Chưa commit, push, merge hoặc deploy. Bốn case còn lại giữ template cũ; các phần theme, navigation và primitive ở đây là phạm vi cần thiết cho bản mẫu, chưa phải hoàn thành Phase 3–6.

## Bản mẫu

- Homepage: hero xanh đen gọn, nền giấy ấm cho công việc/nội dung, CTA lime. Hai sản phẩm có ảnh luôn hiện, 3PL là khối hai mốc kết quả, KA/SLA là hàng nội dung không cần ảnh.
- Có đủ năm URL case, bốn bước làm việc, giới thiệu gọn, timeline mỗi vị trí một điểm chính, năng lực gắn case, lời mời việc làm/dự án cân bằng, CV và game là link phụ.
- P&G: context/vai trò → ảnh dashboard → hai quyết định giá/target → kết quả có nhãn ước tính/phương pháp → sở hữu/giới hạn → chi tiết mở bằng bàn phím → bài học/case liên quan.
- Ảnh mở bằng native dialog, Escape đóng và trả focus, giữ nguyên crop trong cả trang và viewer. Asset PNG gốc không bị sửa; crop thể hiện bằng khung layout. Đây không phải biện pháp xoá danh tính khỏi file public; trước phát hành cần quyết định bản asset đã crop hoặc xác nhận danh tính demo.
- Theme chỉ áp dụng dưới `.portfolio-v2`. Grain không phủ các trang mẫu. CursorLight và SensorBot 3D cố định ở góc phải dưới vẫn hoạt động cho thiết bị có chuột thật; bot theo vị trí chuột nhưng không bắt thao tác. Engine, save, sprite và nội dung game không thay đổi.

## So sánh cùng viewport

Baseline homepage được tái dựng bằng `app/page.tsx` tại HEAD và các component cũ trong route local tạm, chờ font/hiệu ứng ổn định trước khi chụp. Route tạm đã xoá trước build cuối. `tier` thay đổi không tác động CaseGrid cũ vì component không đọc nó. Baseline screenshot homepage ban đầu chụp quá sớm đã được thay bằng capture ổn định.

| Đo lường | Baseline | Phase 2 |
|---|---:|---:|
| Chiều cao homepage, 1440×900 | 8.937px | 4.102px |
| Chiều cao homepage, 390×844 | 14.366px | 5.975px |
| Text trong `main`, tách theo whitespace | 2.043 | 713 |
| Ảnh nổi bật đầu homepage, desktop | Phụ thuộc hover/focus, không có khung ảnh thường trực | y≈540px |
| Ảnh nổi bật đầu homepage, mobile | Preview bị ẩn dưới breakpoint xl | y≈727px |
| Ảnh đầu case P&G, desktop/mobile | Nằm sau context, decisions, features và flow | y≈507px / 627px |

Mức giảm text khoảng 65% là số đo source text DOM: clone `main`, loại `script/style/dialog`, chuẩn hoá whitespace rồi đếm. Không coi đây là số từ tiếng Việt, không tính chữ bên trong screenshot. Layout mới có footer nằm trong main còn baseline footer ở ngoài, nên phép đo mới tính thêm footer; chênh lệch này không làm phóng đại mức giảm. Mục tiêu mềm 40–50% đã được vượt qua bằng cắt phần lặp và chuyển chiều sâu về case, không thu nhỏ body text.

## Kiểm tra

- TypeScript `npx tsc --noEmit`: đạt.
- Production build `npm run build`: đạt ở bản cuối sau batch sửa review, sinh đủ 10 trang. `git diff --check` đạt.
- Playwright: homepage và P&G tại 390×844, 768×1024, 1280×800, 1440×900 không tràn ngang. Kích thước DOM khớp kích thước yêu cầu.
- Năm case và `/cv.pdf` trả HTTP 200. Link email/LinkedIn giữ đúng đích trong content; không gửi tin và không xác thực tài khoản ngoài.
- Keyboard: Enter mở ảnh; dialog nhận focus và khoá scroll; Escape đóng, trả focus và giải phóng scroll. Enter mở mục đọc sâu. Reduced motion giữ heading hiển thị.
- `/game`: entry có nút bắt đầu, bấm bắt đầu có canvas. Đây là smoke test khởi đầu, không phải kiểm toàn bộ gameplay.
- Không có `pageerror` trong bộ kiểm production. Detector Impeccable chạy một lần, trả `[]`; đây là kiểm cơ học, không thay visual review.
- Tương phản token: chữ chính/nền 13,20:1; chữ phụ/nền giấy 5,77:1; chữ phụ/nền phụ 5,37:1; chữ đoạn/nền tối 11,16:1; lime/nền tối 12,37:1. Chưa coi đây là audit mọi trạng thái Phase 6.
- Lượt xác nhận cuối trên production local: homepage/P&G không tràn ngang ở 1440×900 và 390×844; ảnh dialog chính và ảnh trong phần đọc sâu tải thành công; route baseline tạm trả 404.
- Reviewer độc lập yêu cầu một batch gồm focus contact, thứ tự title/metadata và icon controls. Đã sửa focus contact sang lime, đưa metadata sau title ở featured/3PL và dùng SVG chung. Lượt chấm lại chấp nhận cả ba sửa, không thấy regression trong chín capture cuối; đây không phải phê duyệt visual thay người dùng.

## Ảnh so sánh local

| Trang | Desktop | Mobile |
|---|---|---|
| Homepage baseline | [Ảnh](../output/playwright/baseline-home-desktop.png) | [Ảnh](../output/playwright/baseline-home-mobile.png) |
| Homepage Phase 2 | [Ảnh](../output/playwright/final-home-desktop.png) · [Toàn trang](../output/playwright/final-home-desktop-full.png) | [Ảnh](../output/playwright/final-home-mobile.png) · [Toàn trang](../output/playwright/final-home-mobile-full.png) |
| P&G Phase 2 | [Ảnh](../output/playwright/final-pg-desktop.png) · [Toàn trang](../output/playwright/final-pg-desktop-full.png) | [Ảnh](../output/playwright/final-pg-mobile.png) · [Toàn trang](../output/playwright/final-pg-mobile-full.png) |

Ảnh/script trong `output/playwright` là artifact local bị gitignore; tài liệu không hứa chúng có sẵn khi clone repo. Capture `final-*` lấy từ production local sau batch sửa review. [Focus vùng liên hệ](../output/playwright/final-contact-focus.png) đã được chụp khi vị trí cuộn ổn định. [DESIGN.md](../DESIGN.md) ghi hệ thống của bản mẫu, chưa coi là palette đã được người dùng duyệt.

## Ranh giới còn lại

Phase 3 sẽ hợp nhất schema/token/primitives và tài liệu sau phản hồi visual. `featuredSlug` là field legacy không điều khiển bản mẫu; hierarchy mới đọc `tier`. Phase 4 triển khai sâu và thống nhất năm case, gồm flow edges/ảnh/features phù hợp. P&G bản mẫu có hai quyết định và các phần kỹ thuật đọc sâu; sơ đồ flow và toàn bộ feature inventory chưa được chuyển sang template mới. Phase 5–6 xử lý navigation thống nhất với case cũ, kiểm zoom 200%, route/breakpoint/focus toàn diện và bàn giao phát hành. Không coi việc dùng navigation luôn hiện trong bản mẫu là đã sửa menu modal của template cũ.
