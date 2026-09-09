# Recheck sau batch fix R1–R8

Ngày 09/09/2026. Review code hiện tại và production build local cổng3107. Không sửa ứng dụng. Kết luận: **5 finding cũ đã giải quyết trong phạm vi retest, 3 finding còn một phần; thêm regression tải JavaScript đầu trang.**

## Trạng thái findings cũ

| ID | Kết quả | Bằng chứng |
|---|---|---|
| R1 KPI3PL | Resolved | Nhãn và aria-label đã ghi pickup on-time của Viettel Post, cùng định nghĩa với content |
| R2 Pointer sau settle | Resolved về hành vi | Hover, chờ2s, move trong cùng object: draw calls5472→11970; trước fix không tăng. Có regression bundle bên dưới |
| R3 Hit regions | Partial | Điểm cũ1440×900 (1243,364) nay tới experience đúng; mép container tablet/mobile vẫn ngoài anchor. Vẫn hardcode CSS, chưa nối projected bounds |
| R4 Typography | Partial | Computed font đã là Space Grotesk; font-size component vẫn bị selector heading chung ghi đè |
| R5 P&G layout | Resolved | Mobile390px lead một cột350px; result/ownership layout grid đã khôi phục; ảnh đã xem |
| R6 Motion | Partial | SectionReveal đã được sử dụng, SSR fallback có nội dung. Đường process chưa được animate và hiện bị ẩn toàn bộ do wrapper regression; timeline cũng mất đường nối |
| R7 Pointer cancel | Resolved trong event retest | Touch enter/down/cancel không còn pf-pressed; keySink đã gate reducedMotion. Chưa thay thế physical-touch test |
| R8 No-JS | Resolved trong case retest | Case Shopee JS-off: decision articles dưới opacity0 giảm4→0. Reduced-motion homepage không có node inline opacity0 trong mẫu kiểm |

## Các sửa bắt buộc còn lại

### 1. P2 — Vùng bấm chỉ được nới CSS, chưa giải quyết theo geometry

Source `app/portfolio.css:326–390`, `components/portfolio/HeroObjects.tsx`.

- 860×700: hình container xuống khoảngy243, link kết thúc≈237.98. `elementFromPoint(709,240)` tại mép dưới hình trả về không có anchor. Ngay dưới đóy244 lại thuộc `/game`.
- 390×844: `(199,459)` tại góc dưới container không có anchor; `(201,454)` mới thuộc experience. Link kết thúcy455.72 trong khi hình còn kéo xuống≈461.
- Không khẳng định điểm tablet y244 vẫn nằm trong model; lỗi chắc chắn là mép model có khoảng không bấm được và link kế bên bắt đầu sát ngay dưới. Lỗi điều hướng nhầm cũ tại1440 đã được sửa.
- `recheck-hero-860.png` còn cho thấy nhãn container nằm trên thân hình; `recheck-hero-390.png` nhãn bị kéo về bên trái do selector `.pf-container-link .pf-object-label`/`.pf-keyboard-link .pf-object-label` specificity cao hơn rule mobile.

Sửa: tính hit regions từ bounds project qua camera hoặc cấu hình model/camera chung có kiểm chứng mọi pose; dành envelope cho lift/tilt, tách nhãn khỏi silhouette. Không tiếp tục vá một tọa độ test duy nhất. Kiểm lại idle/hover, mép object, resize và các breakpoint trước khi coi sẵn sàng Meshy.

### 2. P2 — Reveal wrapper làm mất đường nối process và experience

Source `components/portfolio/ProcessSection.tsx:23–25`, `ExperienceSection.tsx:29`, `app/portfolio.css:134,160`.

- Trước đây item là anh em; nay mỗi item nằm một mình trong div SectionReveal. Vì thế **mọi** `.pf-process-step` và `.pf-timeline-item` đều là last-child của parent riêng.
- Rule `.pf-process-step:last-child .pf-rail-line {display:none}` ẩn cả4rail. Rule timeline tương tự ẩn cả5line.
- Browser1440×900, đã scroll vào viewport và chờ1.4s: opacity4wrapper đều1, rails4/4 `none`, timeline5/5 `none`. Đây không phải capture giữa animation.
- `ol.pf-process-grid` hiện có4DIV trực tiếp rồi mới đếnLI, không còn đúng cấu trúc ordered list.
- Rail chỉ có CSS nền/height, chưa có transition/animation scale theo plan.

Sửa: để LI là con trực tiếp của OL, đặt reveal vào trong hoặc cho primitive hỗ trợ render li đúng semantics. Đánh dấu last item ở đúng cấp wrapper/index; sửa timeline tương tự. Dựng animation rail một lần và kiểm reduced motion; không chỉ khôi phục một đường tĩnh rồi báo toàn bộ motion xong.

Ảnh đã xem: `output/playwright/recheck-process-settled.png`, `recheck-experience-settled.png`.

### 3. P2 — Đã sửa font-family nhưng chưa sửa độ ưu tiên font-size

Source `app/portfolio.css:35–49,84`.

- `.portfolio-v2 h3 {font-size:1.25rem}` vẫn thắng `.pf-showcase-title {font-size:clamp(1.4rem,2.2vw,1.85rem)}`.
- Computed style desktop1440: Space Grotesk đúng, **20px** thay vì cỡ component tối đa29.6px. Heading component khác có cùng rủi ro.

Sửa: hạ specificity toàn bộ default typography, không chỉ font-family; hoặc scope đúng các declaration size/line-height component. Kiểm computed family/size/weight theo role, không chỉ load font.

### 4. P2 mới — First Load JS homepage tăng115→389kB

Source `components/portfolio/HeroObjects.tsx:14`: mới static import `invalidate` từ `@react-three/fiber` ngoài dynamic scene.

- Build lượt trước: `/` First Load JS115kB, route size3.13kB.
- Build lần này: `/` First Load JS389kB, route size241kB. Tăng≈274kB, khoảng3.4lần tải đầu theo báo cáo Next.
- Static import R3F bypass ranh giới lazy3D là nguyên nhân nghi ngờ trực tiếp từ source; chưa dùng bundle analyzer để quy từng byte cho riêng import đó. SectionReveal/Motion mới cũng cần tính trong bundle diff.

Sửa: scene dynamic cung cấp callback invalidate qua ref/onReady cho DOM overlay; gọi invalidation đúng canvas, không cần import fiber trong component tải đầu. Giữ refs và demand rendering. Rebuild so sánh First Load JS; không cần ép đúng115kB nếu Motion có chi phí hợp lý, nhưng giải thích phần tăng và giữ3D tách lazy.

## Kiểm tra đã chạy lại

- Production build pass, exit0; game tests52/52 pass; git diff --check exit0, chỉ cảnh báoLF/CRLF.
- Homepage widths1440,1265,1024,860,768,390,360 không overflow/pageerror; pointer riêng1280×800.
- Cả5caseHTTP200 trên390px, không overflow. P&G lead mobile một cột và grid result đã xác nhận.
- Container Enter →/#experience; keyboard →/game; điểm click sai cũ giờ đúng; dialog Escape/focus return pass.
- Game bắt đầu và nhận input smoke không pageerror; không phải full playtest.
- No-JS case Shopee decision visible; pointercancel state được dọn; reduced-motion mẫu homepage không bị ẩn.

Ảnh section lấy tự động trong lượt matrix có thể chụp giữa reveal, không dùng để kết luận thiếu content. Findings đường nối chỉ dùng capture `*-settled.png` sau chờ và đo opacity1.

Các giới hạn còn nguyên: chưa full content parity5case, physical mobile, toàn bộ contrast, WebGL failure, cross-browser, production deploy. Không mở lại findings đã đóng nếu không có bằng chứng mới.

Đề nghị giao lại agent đúng4nhóm trên, sửa một batch rồi retest có mục tiêu. Giữ đèn fixed, slogan, màu và geometry hiện hữu. Không làm lại thiết kế toàn site.

## Kết quả sửa trực tiếp — 2026-09-09

Đã xử lý cả bốn nhóm trên trong checkout hiện tại:

- Vùng bấm lấy từ bounding box geometry chiếu qua camera, bao gồm biên tilt/lift/press; chỉ cập nhật khi camera/kích thước đổi, không chạy setState mỗi frame. Callback bounds bỏ qua giá trị trùng, camera options giữ reference ổn định. Tách hai vật thể theo chiều dọc để nhãn container không phủ bàn phím; bố trí lại cụm vật thể ở laptop thấp, giữ đèn fixed.
- Scene lazy cung cấp invalidate riêng canvas qua callback/ref. Component DOM không còn import runtime từ R3F. First Load JS homepage: 389 kB → 152 kB; route size 3.56 kB. Motion vẫn là phần tải đầu cần cho reveal, không ép trở về baseline 115 kB trước khi thêm reveal.
- SectionReveal hỗ trợ LI trực tiếp trong OL. Selector last-child đặt đúng cấp wrapper. Process có 3 đường nối, timeline có 4 đường; rail scale một lần khi vào viewport, reduced-motion/no-JS hiển thị tĩnh.
- Typography mặc định dùng :where để component thắng cascade; showcase desktop 1440 đo được Space Grotesk, 29.6 px.

Nghiệm thu trên production local http://localhost:3108/:

- Build pass, đủ 10 static routes. Game tests 52/52 pass trong lượt sửa; không sửa engine/game. git diff --check exit 0 (cảnh báo LF/CRLF).
- Chromium: 1440×900, 1265×712, 1024×768, 860×700, 768×1024, 390×844, 360×800 không tràn ngang/pageerror. Đã xem ảnh desktop/laptop/mobile và process sau khi reveal kết thúc.
- Lượt cuối đo mép dưới-phải vùng bấm và tâm nhãn của cả hai link tại cả 7 chiều rộng: đúng href. Touch emulation 390px: một tap bàn phím tới /game. Container click góc cũ và Enter đều tới /#experience.
- Pointer sau settle tiếp tục render khi di chuyển: draw counter 7980 → 15846. Pointercancel dọn pressed; dialog Escape trả focus. Reduced-motion không có nội dung ẩn. No-JS case Shopee: 0 decision bị ẩn.
- Cả 5 case HTTP 200 và không overflow trên 390px. P&G lead một cột 350px; result vẫn grid. Game khởi động và nhận ArrowRight, không pageerror.

Evidence scripts/ảnh: output/playwright/finalfix-*.js và finalfix-*.png (local, ignored). Cảnh báo THREE.Clock deprecation vẫn đến từ dependency; không có runtime error trong lượt nghiệm thu. Đây là kiểm Chromium desktop + touch emulation, chưa phải physical-mobile/cross-browser/full-game playtest hay production deploy. Không commit/push/deploy.
