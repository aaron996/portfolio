# Review bản triển khai interaction và visual portfolio

Ngày: 09/09/2026. Phạm vi: checkout hiện tại, đối chiếu `portfolio-interaction-visual-fix-plan.md` và báo cáo hoàn thành của agent.

**Kết luận: cần sửa trước khi nghiệm thu toàn bộ plan.** Build và tests pass, layout có cải thiện, nhưng interaction chính có lỗi runtime, một nhãn kết quả sai nghiệp vụ, typography bị ghi đè và phần scroll animation chưa được triển khai.

Review chỉ đọc source và chạy kiểm tra; không sửa code ứng dụng. Có tạo script/ảnh kiểm tra trong `output/playwright/`. Checkout có dirty/untracked files từ nhiều lượt trước; không có commit riêng của agent để quy toàn bộ diff về một tác giả. Những thiếu sót kế thừa được ghi riêng.

## Findings cần xử lý

### R1 — P1: Nhãn kết quả 3PL đổi sai cả chỉ tiêu lẫn phạm vi

- Source: `components/portfolio/OtherWorkSection.tsx:31–34`.
- Hiện ghi “Tỷ lệ giao đúng hạn toàn mạng lưới Shopee”, aria-label cũng gọi “Tỷ lệ đúng hạn”.
- Dữ liệu gốc `content/content.vi.ts:1016–1021,1058` là **pickup on-time của Viettel Post**, không phải delivery on-time và không phải toàn mạng Shopee.
- Ảnh `output/playwright/review-other-390.png` cho thấy tiêu đề mới và ghi chú nguồn ngay dưới tự mâu thuẫn.
- Tác động: số 90,1% → 97,5% không đổi nhưng ý nghĩa bị thay đổi. Không thể nghiệm thu tuyên bố “bảo toàn100% dữ liệu” chỉ bằng kiểm tra con số.
- Sửa: lấy nhãn chỉ tiêu/phạm vi từ content, dùng “Tỷ lệ lấy hàng đúng hạn của Viettel Post” hoặc giữ “Pickup on-time của Viettel Post”; sửa cả accessible name. Không tự đổi dữ liệu hay kết quả gốc.
- Retest: đối chiếu homepage, case3PL, aria-label và ghi chú nguồn cùng một định nghĩa.

### R2 — P2: Pointer-tilt ngừng hoạt động sau khi rig settle

- Source: `components/portfolio/HeroObjects.tsx:32–39`; `HeroObjectRig.tsx:42–44,74–81`.
- Pointermove chỉ cập nhật ref. Canvas demand chỉ được invalidate khi active/pressed/reducedMotion đổi hoặc rig đang settle. Sau khi đứng yên, pointer tiếp tục chạy bên trong cùng Link không đánh thức canvas.
- Tái hiện desktop1280×800: hover bàn phím, chờ2giây, dịch chuột từ25% sang75% chiều ngang trong cùng link. Đếm draw calls của chính Canvas object qua instrument WebGL: **3648 trước và3648 sau**, không có render mới.
- Tác động: model phản hồi lúc mới enter nhưng không liên tục nghiêng theo chuột như báo cáo.
- Sửa: nối pointer target update với invalidate của Canvas (coalesce bằng RAF khi cần); tiếp tục dùng ref, không setState mỗi pointermove, không đổi frameloop thành always để che lỗi.
- Retest: chờ settle rồi di chuột trong cùng object ít nhất3lần; transform thay đổi và trở lại idle khi leave; reduced motion không tilt.

### R3 — P2: Hit region không khớp hình, góc container dẫn sang game

- Source: `app/portfolio.css:290–293,310–345`.
- Link zones là những hình chữ nhật hardcode theo breakpoint, không project model bounds/camera như plan. Ở1440×900, container Link kết thúc y≈353; bàn phím Link bắt đầu y≈363, trong khi hình container kéo xuống≈365.
- Tái hiện: `elementFromPoint(1243,356)` và `(1243,360)` không thuộc anchor. Điểm `(1243,364)` ở góc dưới hình container thuộc `/game`; click thật đã mở `http://localhost:3106/game`.
- Tác động: một phần container không bấm được, phần khác điều hướng sai object. Mô hình Meshy có bounds khác càng dễ lệch.
- Sửa: đồng bộ hit regions từ projected bounding boxes/cấu hình model-camera, padding có giới hạn, không chồng hai link; tính envelope cả hover lift/tilt. Giữ native Link.
- Retest: hover/click center và bốn mép model tại mọi breakpoint, idle/active, sau resize. Khoảng trống giữa hai vật thể không được kích hoạt nhầm.
- Ảnh liên quan: `output/playwright/review-hero-1440.png`. Tại860×700 đèn còn che một phần nhãn gaming (`review-hero-860.png`); giữ vị trí đèn và bố trí lại phần chữ/scene quanh nó.

### R4 — P2: CSS specificity làm mất font role ở phần dưới hero

- Source: `app/portfolio.css:28,65` và các selector heading section tương tự.
- `.portfolio-v2 h3` có specificity cao hơn `.pf-showcase-title`, nên font family và font size chung thắng các khai báo component. Trường hợp h2 tương tự.
- Browser computed font của `.pf-showcase-title` trên toàn bộ7width đã kiểm là **Archivo**, không phải Space Grotesk. Khai báo/load font chung không chứng minh font đã được áp đúng.
- Sửa: đặt default heading trong layer/selector specificity thấp, hoặc khai báo component selector có scope tương ứng. Kiểm cả font family, size và weight; không rải `!important`.
- Retest: computed styles của hero, showcase, process, timeline, skills và case đúng vai trò; body và game không bị đổi global font ngoài ý muốn.

### R5 — P2: CSS rewrite làm mất bố cục P&G hiện hữu

- Source: `app/portfolio.css:187,266`; `components/portfolio/PgCase.tsx:23–26`.
- Mobile390px: `.pf-case-lead` vẫn grid hai cột rộng≈197.7px và136.3px. Rule mobile chỉ đổi gap, không về một cột. Ảnh `output/playwright/review-pg-mobile.png` cho thấy hai đoạn dài bị bó hẹp.
- `.pf-case-two-col` vẫn dùng trong result/ownership/lesson nhưng không còn rule định nghĩa trong CSS. Browser trả `display:block`, kể cả desktop. Ảnh `review-pg-result.png` cho thấy nội dung dồn về một phía.
- Đây là regression so với source trước lượt triển khai: các selector này từng nằm trong nhóm grid chung với about/experience và có reset mobile.
- Sửa: khôi phục layout riêng cho case; desktop grid phù hợp, mobile một cột; giữ khoảng cách giữa result/nguồn/ownership.
- Retest: P&G desktop/mobile + các section kết quả, ownership, lesson. Không chỉ kiểm `scrollWidth`, vì bố cục có thể hỏng mà vẫn không overflow.

### R6 — P2: Phần motion dưới hero trong plan còn thiếu

- Source: FeaturedWork, ProcessSection, AboutSection, ExperienceSection, SkillsSection, PortfolioShell và `app/portfolio.css`.
- Các section đã có cấu trúc/viền mới nhưng không có reveal primitive, viewport observer hay CSS entrance animation. Process rail là đường tĩnh; mobile còn `display:none` thay vì timeline dọc.
- Các hover transition màu/viền/arrow có tồn tại. Chúng không thay thế yêu cầu reveal theo nhóm, đường process xuất hiện một lần và nhịp chuyển động khi cuộn.
- Sửa: triển khai motion theo mục6 của plan; progressive enhancement, content mặc định đọc được, reduced-motion variant, hover chỉ pointer fine. Không chỉ bọc mọi node bằng legacy Reveal đang ẩn nội dung SSR.
- Retest: quay clip một lượt cuộn homepage, lặp scroll để chứng minh không replay; reduced motion và JS-off vẫn đọc được. Screenshot tĩnh không thể nghiệm thu motion.

## Thiếu sót bổ sung / giới hạn cần xử lý

### R7 — P2: Pointer cancel để lại trạng thái pressed

- Source: `components/portfolio/HeroObjects.tsx:65–69,87–91` có down/up/leave nhưng thiếu `onPointerCancel`.
- Dispatch chuỗi touch pointerenter → pointerdown → pointercancel cho link keyboard vẫn còn class `pf-pressed`.
- Đây là kiểm event mô phỏng, chưa phải gesture trên điện thoại thật. Với touch scroll/cancel cần dọn pressed/active và kiểm pointerleave/lost capture; gate hover movement theo pointer type/capability.
- Sửa cả reduced-motion cho geometry keycap: KeyboardModel đang set keySinkY theo pressed độc lập với rig reduced-motion.

### R8 — P2, kế thừa nhưng chưa đạt plan: Nội dung case biến mất khi JS tắt

- Source: `components/ui/Reveal.tsx:22–24`, gọi từ `app/case/[slug]/page.tsx:104` và feature blocks.
- Context browser `javaScriptEnabled:false` tại `/case/kas-shopee-performance` có4article decision nằm dưới parent opacity0. HTML có nội dung nhưng người dùng không nhìn thấy.
- Helper này đã tồn tại trước lượt agent; không quy là lỗi mới. Tuy nhiên plan đã yêu cầu xử lý SSR/no-JS khi tái sử dụng, nên chưa thể đánh dấu phase4/5 hoàn thành.
- Sửa progressive enhancement của reveal, kiểm hydration/reduced-motion, không ẩn các decision trước khi biết enhancement sẵn sàng.

## Những phần đã xác nhận đạt

- `npm run build`: pass, exit0, tạo đủ5case URLs. Log Next có10 đơn vị prerender; không diễn giải thành10 URL người dùng nếu chỉ liệt kê `/`, `/game`, `/_not-found` và5case.
- `npm run test:game`:52tests,52pass,0fail.
- `git diff --check`: exit0, chỉ cảnh báo line ending LF/CRLF.
- Homepage7viewport1440×900,1265×712,1024×768,860×700,768×1024,390×844,360×800: không horizontal overflow, không pageerror trong lượt chạy. Pointer test riêng tại1280×800.
- Cả5case trả HTTP200 tại390×844, không horizontal overflow. Điều này không chứng minh layout và mọi nội dung đều đúng.
- Link keyboard → game; container focus+Enter → `/#experience`.
- ProjectImage dialog mở được, Escape đóng và focus trả về trigger.
- Game entry bắt đầu được, canvas/HUD hiển thị, gửi ArrowRight không phát sinh pageerror. Chỉ smoke input, chưa xác nhận tiến trình gameplay hoặc playtest đầy đủ.
- Showcase đã đổi thành hai khối luân phiên, result/dossier có khung, about/experience/skills/contact đã tách component. Không cần bỏ toàn bộ bản này để làm lại.
- Đèn vẫn tồn tại fixed; không thấy thay source SensorBot trong tracked diff. Có che nhãn ở860px cần xử lý bằng bố cục surrounding content.

## Đối chiếu báo cáo hoàn thành

| Tuyên bố | Kết luận review |
|---|---|
| Rig đã tách khỏi geometry | Đúng về cấu trúc, còn lỗi đánh thức frame |
| Tilt theo pointer mượt liên tục | Không đạt sau settle; R2 |
| Model/nhãn click tới đúng đích | Một phần đạt; mép container dẫn game; R3 |
| Enter/Spacebar đều điều hướng link | Enter đã kiểm pass. Không có handler Spacebar riêng; native anchor không mặc định activate bằng Space. Đây không phải lỗi semantics cần đổi anchor thành button, nhưng báo cáo không nên khẳng định Spacebar đã kiểm |
| Escape/Spacebar phát sáng | Source emissive áp vào keycap row0/col0 vàrow2/col11; spacebar row3/col2 không nằm trong accent condition. Chỉ báo đúng phần đã làm |
| Toàn bộ5case cùng visual system | Đã dùng chung outer shell/fonts variables, body4case vẫn dùng Section/ink/mute legacy; P&G còn regression R5 |
| Bảo toàn100% dữ liệu | Chưa thể xác nhận; R1 đã cho thấy label sai nghĩa |
| Sẵn sàng thay GLB không sửa interaction | Rig đã tách, nhưng hardcoded hit regions vẫn phụ thuộc silhouette hiện tại; cần R3 trước |
| Nghiệm thu kỹ thuật xong | Build/tests đúng; runtime/fallback/motion còn các lỗi và thiếu sót nêu trên |

## Thứ tự sửa đề nghị và bằng chứng phải giao lại

1. R1 sửa sai nghiệp vụ trước.
2. R2–R3 vàR7: interaction đúng, hit regions đúng, cancel/reduced motion đúng.
3. R4–R5: typography và case layout; xử lý khoảng an toàn quanh lamp ở860px.
4. R6 vàR8: hoàn thiện motion + fallback, không giấu chữ khi JS chưa sẵn sàng.
5. Chạy build/tests phù hợp, capture cùng viewport, clip hover-settle-move-click và scroll; giao kết quả mỗi finding resolved/partial/unresolved. Không báo pass toàn bộ chỉ từ build.

Chưa kiểm exhaustively: contrast tất cả trạng thái, physical mobile gestures, cross-browser, performance trên thiết bị thật, full content parity từng field của5case, lỗi tải Meshy/GLB mới, production deployment. Không lấy phần chưa kiểm làm bằng chứng pass hoặc kết luận lỗi.

Preview review build: `http://localhost:3106/` tại thời điểm kiểm. Test scripts: `output/playwright/agent-review.js`, `agent-review-cases.js`, `agent-review-final.js`. Ảnh bằng chứng tiền tố `output/playwright/review-`.
