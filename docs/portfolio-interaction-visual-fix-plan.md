# Plan fix portfolio — interaction 3D và phần nội dung sau hero

Ngày: 09/09/2026. Trạng thái: **plan bàn giao để coding agent triển khai**, chưa phải thay đổi đã được thực hiện.

## 1. Mục tiêu và cách dùng tài liệu

Làm portfolio có cá tính xuyên suốt: người xem tương tác trực tiếp với đồ vật ở hero, nhìn ra thứ bậc giữa các dự án, cảm nhận được từng chương nội dung qua bố cục, màu, khung và chuyển động. Nội dung chuyên môn vẫn dễ đọc, screenshot và bằng chứng vẫn là trọng tâm.

Đối tượng đã chốt: nhà tuyển dụng BI/Data Analyst và khách thuê dự án, trọng lượng ngang nhau. Luồng chính: hero → công việc → case → liên hệ. Luồng phụ có chủ đích: bàn phím → `/game`.

Đọc file này trước các tài liệu design cũ. Những quyết định người dùng chốt bên dưới là ràng buộc; các thông số thiết kế và animation còn lại là đề xuất triển khai cụ thể, được điều chỉnh khi kiểm tra trên trình duyệt nếu vẫn giữ ý đồ.

Không cần hỏi lại những điều đã chốt. Làm theo phase, có đầu ra xem được sau mỗi phase, giữ một người chịu trách nhiệm chung về visual system. Không tạo nhiều agent cùng sửa CSS hoặc homepage. Nếu agent khác làm review, giao review độc lập sau khi có ảnh và hành vi đã chạy.

## 2. Quyết định không được làm mất

- Headline giữ nguyên: **MAKE SENSE OF DATA. MAKE THINGS WORK.**
- Giữ nền tối xuyên portfolio. Lime là màu nhận diện/hành động; xanh Maersk là màu container và điểm nhấn phụ. Không chuyển toàn site sang nền sáng.
- Giữ vai font khác nhau. Hero đã dùng Archivo Black + Space Grotesk; IBM Plex Mono cho nhãn nhỏ. Không đưa cả portfolio trở lại một kiểu chữ đều đều.
- **Đèn SensorBot fixed ở góc phải, đầu đèn hướng theo con trỏ.** Không chuyển nó thành đồ trang trí nằm trong hero; không thay bằng glow tròn đơn thuần. Giữ khả năng soi khi cuộn trang.
- Đèn hiện chỉ render từ chiều rộng 860px. Đây là hành vi hiện hữu, không phải quyết định mới rằng phải bổ sung đèn trên điện thoại. Giữ trong batch này; không nhân bản đèn ở từng section.
- Hai asset: container xanh Maersk `#42B0D5` và bàn phím cơ thu gọn đại diện chơi/làm game. Không thêm máy quét mã; công việc GHN/Shopee của người dùng chủ yếu là văn phòng.
- **Bấm trực tiếp vào hình bàn phím phải mở `/game` ngay**, không chỉ bấm được dòng chữ bên dưới; không có bước bấm lần đầu để bật hover rồi lần thứ hai mới đi.
- Người dùng sẽ gen model thật bằng Meshy sau. Dùng procedural models hiện tại để hoàn thiện interaction, không chờ GLB, không tự gọi dịch vụ gen asset.
- Giữ 5 case, URL/anchor, nội dung về đóng góp, nhãn dữ liệu minh hoạ, nguồn và giới hạn của kết quả. Không bịa số, testimonial, công ty tuyển dụng hay ảnh chân dung.
- Không sửa engine/gameplay/save/audio của game. Chỉ kiểm tra đường vào và tránh ảnh hưởng CSS/input.
- Không commit, push, merge hay deploy nếu người dùng chưa yêu cầu riêng.

### Những hướng cũ đã hết hiệu lực

`docs/portfolio-redesign-plan.md` vẫn có mô tả nền sáng ấm, giảm headline trước khi thêm font, giới hạn SensorBot trong hero/bỏ fixed. **Không thực hiện các dòng đó.** Chúng bị thay thế bởi quyết định trực tiếp của người dùng và bản hero hiện tại.

`DESIGN.md`, `.impeccable/design.json`, `docs/portfolio-phase2-direction.md` có thể mô tả bản mẫu trước các phản hồi này. Dùng source hiện tại + file này làm căn cứ cho phạm vi fix. Khi hoàn thành, cập nhật tài liệu để không còn hai hướng mâu thuẫn; không đánh dấu các phase chưa làm là đã xong.

## 3. Baseline đã đọc trong checkout

Checkout hiện tại: `C:/Users/admin/.codex/worktrees/459b/portfolio`. Có nhiều file modified/untracked từ các phase trước; branch name đang trống (detached HEAD). Agent nhận việc phải kiểm tra `git status --short`, `git worktree list`, HEAD trước khi sửa. Không reset/clean hoặc tạo worktree từ main rồi làm mất bản hero chưa commit. Nếu làm ở máy/checkout khác, phải mang theo cả file untracked liên quan, không chỉ một git diff của tracked files.

| Source | Hiện trạng / ý nghĩa khi sửa |
|---|---|
| `components/portfolio/PortfolioHome.tsx` | Homepage mới; 2 flagship cùng một grid 1:1, kết quả/other work, process, about, experience, skills, contact. Phần lớn section là markup tĩnh |
| `components/portfolio/HeroExperiment.tsx` | Headline và 3 font hero; các CSS variables font hiện chỉ bọc hero |
| `components/portfolio/HeroObjects.tsx` | Chỉ Link nhãn container/keyboard cập nhật state hover/focus; chưa có vùng Link phủ hình |
| `components/portfolio/HeroObjectsScene.tsx` | Một R3F Canvas, orthographic camera, procedural geometry, demand render; state active chỉ xoay nhẹ group khoảng 0.12 rad |
| `app/portfolio.css` | `.pf-objects-canvas` có `pointer-events: none`; nhiều section chung nhịp padding và tone xanh tối gần nhau. Có viền ở một số ảnh/hàng nhưng chưa đủ phân cấp |
| `components/portfolio/ProjectImage.tsx` | Nút xem ảnh và native dialog đã tồn tại; phải giữ Escape, focus return, scroll unlock |
| `components/portfolio/PortfolioShell.tsx` | Nav/contact dùng chung homepage và case P&G; sửa phải kiểm cả hai |
| `components/portfolio/PgCase.tsx` | Chỉ P&G đang dùng template portfolio mới |
| `app/case/[slug]/page.tsx` | 4 case còn lại vẫn dùng layout legacy, không được giả định toàn bộ case đã thống nhất |
| `components/ui/SensorBot.tsx`, `SensorBotCanvas.tsx`, `CursorLight.tsx` | Đèn fixed, GLB và ánh sáng hiện hữu. Đây là hành vi cần bảo toàn |
| `components/ui/Reveal.tsx` | Có helper Motion nhưng render ban đầu opacity 0, y16; không bọc toàn site bằng helper này mà chưa xử lý no-JS/hydration/reduced-motion |
| `content/content.vi.ts`, `content/types.ts` | Nguồn copy/links/case data; thêm nhãn interaction ở đây |

Stack đang có Next.js App Router, React, `motion`, Three.js, R3F, drei. Không cần thêm GSAP, smooth-scroll engine hay thư viện animation thứ hai.

Baseline gần nhất: production build pass; 5 viewport không overflow/pageerror; nhãn container tới experience và nhãn bàn phím tới game đã chạy. **Chưa có bằng chứng bấm model thật**, vì hiện chưa triển khai. Preview lần trước là `http://localhost:3105/`; kiểm tra server còn sống trước khi sử dụng. Ảnh baseline: `output/playwright/hero-{1440,1280,1265,768,390}.png`; đây chỉ là ảnh hero, cần chụp baseline phần dưới trước khi thay đổi.

## 4. Hướng visual chung cho phần còn lại

Giữ cảm giác một người làm data, xây sản phẩm và thích game: chữ có trọng lượng, bề mặt tối có lớp, đường viền thể hiện cấu trúc, vài chi tiết pixel và vật thể có phản hồi. Không biến mọi section thành hộp giống nhau hoặc chỉ tăng glow.

### Typography, màu và khung

- Archivo Black: headline hero và một vài tiêu đề chuyển chương ngắn; không dùng cho đoạn dài.
- Space Grotesk: heading section, tên project và phần giới thiệu ngắn. Inter hiện có vẫn dùng cho nội dung case dài nếu đọc tốt.
- IBM Plex Mono: số thứ tự section, thời kỳ, loại bằng chứng, caption ngắn. Nhãn chức năng tối thiểu 12px; không dùng mono cho toàn bộ body tiếng Việt.
- Đưa khai báo font cần dùng chung ra module riêng, gắn variables vào wrapper portfolio. Không load lại cùng font ở mỗi card; không đổi font global của `/game`.

Các giá trị khởi điểm dưới đây phải được đo tương phản sau khi phối thực tế:

| Vai trò | Token đề xuất | Cách dùng |
|---|---|---|
| Nền sâu | `--pf-dark: #0c110e` | Hero, khoảng nghỉ, contact |
| Nền nội dung | `--pf-ground: #132119` | Khu vực đọc |
| Panel nổi hơn nền | `--pf-elevated: #1b2a22` | Khung project và công cụ |
| Bề mặt nhấn | `--pf-soft: #23382c` | Một khối kết quả/process, không tô cả trang |
| Viền thường / nhấn | `--pf-line: #4b5d4d`, `--pf-line-strong: #6a806d` | Khung 1px và rail 2px tại điểm quan trọng |
| Chữ chính / phụ | `#f2f5ec` / `#c2cdbb` | Không hạ opacity cả panel khiến chữ nhạt |
| Hành động chính | `--pf-accent: #d4f236` | CTA, focus, trạng thái được trỏ |
| Nhấn phụ | `--pf-blue: #42b0d5` | Container, một số đường dẫn/chi tiết logistics |

Khung project radius 12–16px, ô thông tin 8px, CTA chính dạng pill. Heading và body có khoảng trống rõ. Viền phải thấy ở trạng thái nghỉ; hover chỉ nhấn thêm. Giới hạn glow ở phần trang trí, không wash-out nội dung. Không recolor screenshot sản phẩm theo theme.

### Bố cục đích theo thứ tự đọc

| Section | Thay đổi cấu trúc | Chi tiết tương tác / visual |
|---|---|---|
| Hero | Giữ poster và lamp, làm hai đồ vật có vùng tương tác riêng | Theo mục 5; không cho scene lấn headline/CTA |
| Công việc tiêu biểu | Hai project thành hai khối showcase rộng xếp liên tiếp; desktop P&G ảnh trái khoảng 60%, copy phải; Shopee đảo phía. Mobile giữ thứ tự DOM dễ đọc: tên/ngữ cảnh → ảnh → bằng chứng/CTA | Khung nổi, thanh metadata gọn, viền và background thay nhẹ khi hover/focus bên trong. Ảnh thật luôn hiện |
| Kết quả 3PL | Một khối riêng ngang, cấu trúc hai mốc kết quả và ngữ cảnh ở cạnh | Chữ số tabular, divider rõ. Giữ nguyên baseline/after và ghi chú nguồn; không counter từ 0, không vẽ trend giả |
| Reporting KA + SLA | Hai hàng dossier có số thứ tự, tên, tóm tắt, loại bằng chứng và link | Viền bao nhóm + separator; hover/focus đổi nền, arrow dịch nhẹ. Không làm accordion che nội dung chính |
| Cách làm việc | Bốn bước kết nối bằng một đường mảnh; desktop 4 cột, mobile timeline dọc | Node/số bước nổi bật, đường nối reveal một lần khi vào viewport. Mọi câu luôn đọc được; không cần bấm từng bước |
| Về tôi | Bố cục bất đối xứng: tiêu đề có trọng lượng + đoạn chân dung nghề nghiệp, một note ngắn về chơi/làm game từ nội dung đã xác nhận | Khung viền mở hoặc rail cạnh đoạn chính; ít hiệu ứng hơn vùng showcase để có nhịp nghỉ |
| Kinh nghiệm | Timeline có period bên trái, node và company/role/body bên phải; mobile cùng một cột | Không làm job card nổi lơ lửng. Màu blue/lime ở node có quy tắc; không phát minh active job hiện tại |
| Năng lực | Ba panel có tên năng lực, mô tả ngắn và link tới bằng chứng | Panel có viền thật, góc/index mono, focus/hover nhấn link. Không thanh % kỹ năng hay logo wall vô nghĩa |
| Liên hệ + game | Khối kết trang lớn, email/LinkedIn/CV rõ; lời mời chơi game là một hàng phụ riêng có viền | Nút/email có feedback; không thêm backend form/scheduler. Đường vào game ở cuối trang đồng nhất với bàn phím |

Đảm bảo phần đầu công việc xuất hiện ngay sau hero, không thêm một màn intro trung gian. Nhịp dọc thay đổi bằng mật độ và cấu trúc, không chỉ đổ thêm whitespace. Tất cả 5 case phải tìm thấy được trên homepage.

## 5. Interaction 3D — yêu cầu triển khai cụ thể

### 5.1 Vùng bấm và semantics

Chọn **một Canvas chung + hai vùng Link HTML khớp hai object**. Mỗi Link gồm vùng phủ hình và nhãn của đúng object, một tab stop mỗi object. Canvas vẫn là visual aria-hidden; người dùng bàn phím/screen reader làm việc với Link thật.

- `keyboard.href = /game`, accessible name “Chơi game”; container tới `/#experience`, accessible name “Xem kinh nghiệm logistics”. Container đích này kế thừa hành vi hiện tại.
- Đừng phủ một link khổng lồ lên toàn scene: container/keyboard có hit region riêng, không lấn chữ hay khoảng rỗng lớn. Không nested anchor.
- Đồng bộ hit region với camera/bounds thật: project bounding box của group sang tọa độ viewport Canvas sau load/resize, quy đổi về tọa độ wrapper. Có padding nhỏ cho touch và dự phòng biên độ tilt/lift; giới hạn vùng theo từng object để không chồng nhau. Không lấy một bộ px duy nhất cho mọi breakpoint.
- Đặt DOM nhãn trong cùng link hoặc gắn aria-labelledby hợp lệ; hiển thị underline/arrow/cursor pointer để người xem hiểu có thể bấm. Không phụ thuộc tooltip mới biết là link.
- Pointer của Link chuẩn hoá thành x/y trong [-1,1] để model nghiêng theo vị trí chuột. Dùng refs/motion values cho dữ liệu mỗi frame; chỉ set React state khi đổi object/state, không mỗi pointermove.
- Link HTML giữ hành vi browser: click thường, Enter, Ctrl/Cmd-click, mở tab mới. Không chặn navigation để chạy animation xong; không bắt phím Enter ở window.
- Pointer xuống có feedback, pointerup click bình thường điều hướng. Touch kéo để scroll phải không kích hoạt navigation nhầm; dùng hành vi native anchor, không navigate ở pointerdown. Không OrbitControls/drag camera.
- Loading/WebGL error: nhãn Link vẫn thấy và bấm được, giữ kích thước khối để tránh nhảy layout. Hit area chưa đo xong không phủ một vùng sai; cung cấp layout fallback rõ ràng trước khi scene sẵn sàng.

Nếu dùng raycast thay overlay thì vẫn phải có Link HTML focusable tương đương và đúng mở tab mới; không chấp nhận chỉ `mesh.onClick(router.push)` làm toàn bộ UX. Overlay là hướng ưu tiên trong batch này để giảm phức tạp.

### 5.2 Bàn phím

| State | Hành vi |
|---|---|
| Idle | Giữ góc trưng bày hiện tại, không quay/nhún liên tục |
| Pointer enter | Nâng nhẹ khoảng 0.08–0.12 scene units; lime ở các phím accent sáng hơn; một gợn nhấn phím ngắn qua vài keycap, chạy một lần mỗi lượt enter |
| Pointer move | Tilt x/y tối đa khoảng 5–6 độ theo con trỏ, không xoay đảo mặt; keycap gần pointer có thể lún nhẹ nếu đã có định danh key, không phải điều kiện chặn việc giao interaction cơ bản |
| Pointer leave | Trở về góc gốc từ trạng thái hiện tại, huỷ gợn chưa chạy; không chồng hàng loạt timeout |
| Pointer press | Cụm phím/spacebar lún nhẹ, phản hồi 100–160ms; click vẫn đi `/game` ngay |
| Keyboard focus | Viền focus rõ quanh vùng hình/nhãn, nhãn nổi bật; không ép diễn hoạt intro. Enter mở game |
| Touch | Một tap mở game; không giữ hover giả sau tap |
| Reduced motion | Bỏ tilt/lift/gợn phím; giữ màu accent, focus và navigation |

Nhãn hiển thị đề xuất: “Chơi game ↗”, phụ “Một góc chơi & làm game của tôi” nếu đủ chỗ. Không thêm âm thanh mặc định hay gõ chữ giả.

### 5.3 Container

| State | Hành vi |
|---|---|
| Idle | Giữ xanh Maersk, góc nhìn đủ thấy thành và cửa |
| Pointer enter/move | Nâng nhẹ, quay theo pointer tối đa khoảng 4 độ; highlight cyan ở cạnh/gân giúp cảm nhận chất liệu |
| Pointer leave | Damped return về transform ban đầu; không snap |
| Click / Enter | Tới kinh nghiệm, anchor vẫn hoạt động nếu JS lỗi; reduced motion dùng scroll tức thì |
| Focus / touch | Cùng quy tắc Link với bàn phím, không cần hover để hiểu hoặc dùng |

Không cần làm cửa mở trong phase này: model hiện chưa có contract cửa tách riêng, và không có nội dung bên trong để giải thích hành vi đó. Tính tương tác đến từ object đáp lại vị trí con trỏ, phản hồi vật liệu và đường dẫn có ý nghĩa.

### 5.4 Kiến trúc để thay Meshy sau

- Tách model geometry khỏi interaction rig: `HeroObjectRig` nhận id, bounds, rest transform, interaction state/ref; con của nó là model hiện tại hoặc GLB sau này.
- Các thông số mỗi model: id, href/label từ content, restRotation, visualScale, hoverTiltLimit, hoverLift, focus anchor/bounds. Đặt một nguồn cấu hình chung cho scene và hit regions.
- Animation keycap là enhancement của procedural keyboard. Nếu GLB sau là một mesh, rig vẫn tilt/lift và Link vẫn chạy; không coi thiếu keycap nodes là lỗi.
- Khi thay GLB: normalize scale/pivot/bounds rồi hiệu chỉnh camera/hit regions. Không phụ thuộc vào tên node Meshy chưa tồn tại.
- Giữ 1 Canvas cho hai object, `frameloop="demand"`, invalidate khi target thay đổi và trong lúc chưa settle. Dừng loop khi sai số dưới epsilon, khi tab ẩn/scene ra ngoài viewport; reset delta lớn lúc quay lại.
- Không đổi toàn trang thành client component. Chỉ object rig, reveal/interaction primitives cần client boundary.

## 6. Motion system cho homepage và case

Một ngôn ngữ motion nhất quán, chuyển động hỗ trợ feedback và thứ tự đọc. Dùng CSS transition cho hover/press; Motion có sẵn cho reveal và spring; Three refs cho object pose. Reuse easing hiện có `[0.22, 1, 0.36, 1]` nếu giữ Reveal, đưa về token chung; không rải nhiều hệ easing.

| Khu vực | Trigger / animation | Budget khởi điểm |
|---|---|---|
| CTA/link | Hover/focus đổi viền/màu; arrow translate 3–4px; press scale nhẹ | Hover 160–200ms, press 120ms |
| Project showcase | Reveal một lần cả khối, opacity + translateY 12–16px; text/ảnh có stagger ngắn | 320–450ms, stagger 50ms, cả nhóm tối đa khoảng 600ms |
| Khung project | Hover hoặc focus-within: viền nhấn, elevation/lift tối đa 3px ở desktop | 180–220ms; screenshot không tilt, số liệu không chuyển động |
| Dossier/skills | Background/border highlight, arrow feedback | 160–200ms; không reflow |
| Process | Đường nối scaleX/scaleY từ gốc đúng hướng, từng node hiện theo thứ tự | Một lần 400–500ms; nội dung text không bị ẩn chờ đường chạy |
| About/timeline | Reveal nhóm nhẹ, không từng dòng/chữ | 280–350ms, không replay mỗi lần scroll |
| Contact | Một reveal khối, hover/press cho email và link | Không glow pulse vô hạn |
| 3D | Damped/spring response có thể đổi target giữa chừng | Hướng spring: mass1, stiffness100, damping10; clamp overshoot vào envelope an toàn |

- Không dùng `transition: all`; không animate layout properties để giả lift. Không scroll hijacking, custom cursor thay pointer, marquees, typewriter, autoplay scene hay random particles.
- Hover movement chỉ với `(hover: hover) and (pointer: fine)`. Focus phải tương đương về thông tin nhưng không cần chuyển động. Reduced motion tắt transform/reveal dịch chuyển, giữ chữ hiển thị và phản hồi tức thì hoặc fade ngắn.
- Server render phải có nội dung đọc được. Không cho toàn bộ homepage `opacity:0` trước hydration. Nếu tái dùng Reveal, sửa/bao nó để progressive enhancement có fallback; tránh sửa shared helper gây regression 4 legacy cases ngoài ý muốn.
- Không counter-animate kết quả kinh doanh. Không animate screenshot/dashboard data vì dễ tạo cảm giác là dữ liệu live.
- Đèn đã có render loop riêng. Đánh giá chi phí tăng thêm của scene mới so với baseline; không hứa cả trang 0 frames idle trong khi lamp vẫn hoạt động.

## 7. Các phase triển khai và đầu ra bắt buộc

### Phase 0 — Giữ baseline và dọn mâu thuẫn tài liệu

1. Kiểm tra checkout, dirty files, routes, dependency scripts; lưu diff/ảnh baseline ngoài source cần bảo toàn.
2. Chụp desktop/mobile từng section, không chỉ full-page thumbnail. Kiểm tra viewport thực tế trong browser.
3. Ghi danh sách ràng buộc mục 2 vào ghi chú triển khai; đánh dấu các chỉ dẫn cũ xung đột là superseded, giữ lịch sử.

**Xong khi:** có baseline và danh sách file/phạm vi; không mất code đang untracked. Đây không phải một phase redesign mới hay cuộc bỏ phiếu lại slogan/màu.

### Phase 1 — Interaction hero hoàn chỉnh

1. Làm Link hit regions + rig độc lập geometry.
2. Làm hover/tilt/press/return theo mục 5, giữ các pose trong khoảng không chạm lamp/headline.
3. Bàn phím tới game, container tới experience; kiểm touch/keyboard/loading/error.
4. Kiểm riêng laptop thấp 1265×712 và width860–1024 vì đèn xuất hiện từ860.

**Files chính:** HeroObjects, HeroObjectsScene, HeroExperiment nếu cần cấu trúc, content types/copy, CSS scoped; có thể thêm HeroObjectRig/config.

**Xong khi:** rê chuột trên chính hình có phản hồi, click hình bàn phím đi game, không cần tìm nhãn; keyboard/touch có hành vi đúng; đèn vẫn fixed và soi theo chuột khi scroll.

### Phase 2 — Visual tokens + công việc/đầu ra

1. Chia font role ra toàn wrapper portfolio, thống nhất tokens nền/viền/focus/motion.
2. Recompose hai flagship thành showcase luân phiên, giữ image viewer độc lập với link case.
3. Tạo khối kết quả3PL và nhóm dossier KA/SLA có thứ bậc rõ.
4. Thêm hover/reveal theo primitive tái sử dụng, không copy animation từng nơi.

**Files chính:** PortfolioHome, ProjectImage, app/portfolio.css; đề xuất tách FeaturedWork, OtherWork và motion wrapper nhỏ để tránh một component quá dài.

**Xong khi:** ảnh/copy/bằng chứng/CTA có nhóm rõ, viền thấy ngay lúc idle, cả5case còn link; mở ảnh không đồng thời điều hướng case. Không bọc article có nút dialog trong một anchor toàn card.

### Phase 3 — Process, about, experience, skills, contact

1. Áp bố cục từng section ở mục4, giữ copy có nguồn.
2. Nối motif pixel/line/index với hero bằng vài điểm có chủ đích, tránh trang nào cũng cùng grid.
3. Dùng motion mục6, kiểm nội dung hiển thị khi JS chậm/tắt và reduced motion.
4. Đồng bộ nav/anchor focus/scroll offset, footer game link và khối contact.

**Files chính:** PortfolioHome, PortfolioShell, CSS; tách ProcessSection/ExperienceSection nếu giúp rõ trách nhiệm, không tạo abstraction phức tạp cho một đoạn text.

**Xong khi:** dưới hero có ít nhất các nhịp khác nhau rõ ràng: showcase → kết quả/dossier → quy trình → đoạn đọc/timeline → lời mời liên hệ. Không được coi phase xong chỉ vì đã gắn Reveal quanh markup cũ.

### Phase 4 — Đồng bộ visual các case

Đây là phần còn lại của portfolio, thực hiện sau homepage; không đánh đồng với sửa gameplay.

1. P&G: dùng font/khung/evidence callout cùng homepage; giữ chiều rộng đọc khoảng60–75ch và các decision/source/limit hiện có.
2. Bốn case legacy: áp cùng shell, typography, framing, focus và nhịp section. Kiểm kê và ánh xạ từng block trước khi chuyển template; không bỏ feature/flow/nguồn chỉ để khớp schema P&G.
3. Screenshot/caption/demo label luôn đi cùng; case ít ảnh dùng cấu trúc text/diagram thật, không lấy ảnh case khác.
4. Giữ URL, metadata, related links, anchor có người dùng. Nếu chỉ đồng bộ visual mà chưa hoàn tất migration content sâu thì báo rõ phần nào còn legacy; không báo cả5case xong.

**Files chính:** PgCase, app/case/[slug]/page.tsx, PortfolioShell, các primitive dùng chung và CSS. Giữ tách scope với game/global tokens.

**Xong khi:** đi từ homepage vào bất kỳ case nào không đổi sang một phong cách không liên quan, nội dung cũ không bị mất, điều hướng về đúng section hoạt động.

### Phase 5 — Kiểm thử, review và bàn giao

Chạy các check mục8. Chụp theo batch, sửa lỗi material cùng một lượt; tránh vòng polish vô hạn. Nếu có reviewer, giao ảnh thật + các ràng buộc đã chốt, yêu cầu review cả tương tác qua video/check log, không suy ra motion tốt từ screenshot.

Đầu ra: code local, preview URL hoạt động, report so với baseline theo section, checks đã chạy/chưa chạy, các giới hạn asset Meshy và phần còn pending. Cập nhật design docs theo code thực tế; không tự phát hành.

**Thứ tự ưu tiên nếu cần chia lần giao:** Phase1 trước → Phase2–3 thành một bản homepage hoàn chỉnh → Phase4 → Phase5 toàn bộ. Có thể bàn giao từng mốc, nhưng chỉ đánh dấu phần đã hoàn thành. Không dừng ở hero rồi gọi đó là fix toàn app.

## 8. Ma trận nghiệm thu

| Nhóm | Kiểm tra bắt buộc |
|---|---|
| Desktop/tablet/mobile | 1440×900,1280×800,1265×712,1024×768,860×700,768×1024,390×844,360×800; ghi DOM viewport thực tế |
| Hit regions | Hover/click chính giữa và sát mép hình bàn phím/container ở mỗi breakpoint; hover giữa hai hình không kích nhầm; resize không làm lệch vùng bấm |
| Routes | Click keyboard → `/game`; browser back về portfolio dùng tiếp được; container → experience; cả5case200; email/LinkedIn/CV đúng đích |
| Keyboard | Tab đến từng object theo thứ tự đọc; focus ring rõ; Enter tới đúng URL; Ctrl/Cmd-click mở tab; không double navigation; modal Escape và focus return |
| Touch | Một tap bàn phím mở game, kéo dọc trên vùng object vẫn scroll; không hover kẹt, không yêu cầu tap hai lần |
| Motion | Enter/leave nhanh5lần không xếp hàng; chuyển object giữa chừng không snap; idle settle; tab hide/return không nhảy pose; scroll khỏi hero không còn scene loop mới chạy vô ích |
| Lamp | Thấy model tải đầy đủ trước screenshot; fixed xuyên scroll, đầu hướng chuột; không che CTA/keyboard tại viewport thấp; hit overlay không chặn pointer listener của lamp |
| Reading/accessibility | Không tràn ngang, zoom200%, text tiếng Việt không cắt dấu, link/button tối thiểu44px; text thường≥4.5:1, large text≥3:1, focus/control≥3:1 ở nền tương ứng |
| Fallback | Reduced motion trước load và đổi lúc đang chạy; JS chậm/tắt vẫn có headline/copy/link HTML; WebGL fail/model load fail vẫn có link và layout ổn định |
| Image viewer | Mở/đóng bằng chuột/bàn phím, Escape, scroll lock được trả lại; mở ảnh không click xuyên vào case; caption/demo/source không mất |
| Performance | Không React render mỗi pointermove; một Canvas mới cho2props, không thêm canvas mỗi section; đo frame/long tasks cùng thiết bị trước/sau, ghi thiết bị và kết quả thay vì tự tuyên bố60fps |
| Game regression | Vào `/game`, bắt đầu một lượt, thử di chuyển/input và quay lại; không khẳng định đã playtest toàn game |

Static checks: `npm run build`, `git diff --check`. Repo chưa có script lint riêng, không bịa `npm run lint`. Nếu sửa shared styles/components ảnh hưởng game, thêm `npm run test:game`; nếu không thì vẫn smoke browser đường vào game. Chỉ thêm test logic đáng giá như clamp/viewport hit regions và navigation duplication khi cấu trúc dự án hỗ trợ, không test snapshot mirror CSS.

Đoạn quay/check tương tác cần chứng minh: hover hình → phản hồi → leave → trở về → click bàn phím → game; scroll homepage với đèn fixed; reduced motion. Screenshot chỉ chứng minh bố cục, không thay video hoặc kiểm browser về motion.

## 9. Prompt giao agent — có thể copy nguyên khối

> Hãy triển khai `docs/portfolio-interaction-visual-fix-plan.md` trên đúng checkout chứa bản hero hiện tại. Đọc source và kiểm tra dirty/untracked files trước, không reset hoặc bỏ code đang có. Quyết định mới trong plan này thay thế các dòng nền sáng, giảm headline và bỏ fixed lamp trong plan cũ.
>
> Ưu tiên Phase1: làm hover/tilt/feedback trên chính hai hình3D, không chỉ nhãn. Hình bàn phím phải là vùng link trực tiếp tới `/game`, hoạt động bằng chuột, touch và keyboard. Giữ đèn SensorBot fixed và hướng theo chuột. Dùng procedural models hiện có; tôi sẽ dùng Meshy tạo model thật sau.
>
> Sau đó làm đầy đủ phần dưới hero theo Phase2–3: bố cục showcase, màu/bề mặt, khung viền, process/timeline/skills/contact và motion có chủ đích. Không chỉ bọc Reveal quanh bố cục cũ. Tiếp tục đồng bộ5case theo Phase4, giữ toàn bộ nội dung/bằng chứng/URL. Không sửa gameplay hay tự gen asset.
>
> Giữ slogan MAKE SENSE OF DATA. MAKE THINGS WORK., nền tối, lime, container xanh Maersk và font roles. Không hỏi lại những lựa chọn này. Kiểm responsive, vùng click, reduced motion, image dialog, lamp và đường vào game theo ma trận. Bàn giao preview, ảnh/check log, file thay đổi và phần chưa hoàn thành; không tự commit/push/deploy.
