# Phim case — motion graphic đầu trang case

Mỗi case có một đoạn phim hoạt hình 22–42 giây giới thiệu vấn đề, kiểu video giải thích
khoa học (Kurzgesagt, TED-Ed) nhưng làm bằng giấy cắt. Vinh duyệt hướng này 2026-10-11.

## Thông điệp (Vinh sửa 2026-10-11)

Phim là **quảng cáo về Vinh cho nhà tuyển dụng**: chọn hình ảnh và câu chữ có lợi, ấn tượng nhất.

- Mạch chung: vấn đề → Vinh xuất hiện dựng giải pháp → kết quả, mọi người vui.
- Mỗi cảnh một ý; chữ trên hình tối đa khoảng 6 từ và nói kết quả. Dùng "AUTO", "AI", "tự động"
  (không viết "chạy theo lịch").
- Bỏ chữ chuyên ngành ("tín hiệu 1, 2", "+1 bậc", "loại kho trung chuyển", "vai trò"…) và câu rào
  đón không có lợi ("Đáng kiểm tra · chưa phải kết luận" → chỉ ghi "Nghi ngờ").
- Mỗi phim kết bằng một **câu chốt kết quả** (`components/motion/Tagline.tsx`) trước logo.
  Muốn chọn chỗ xuống dòng thì đặt `\n` trong câu.
- Không bịa số: chỉ dùng số đã xác nhận trong case (giảm 36% việc làm tay). Bỏ 31,3% khỏi phim
  Tìm kho — đứng một mình dễ bị hiểu là thấp.
- **Phim GHN:** mọi nhân vật trừ Vinh (và người mua) mặc đồng phục GHN, phương án 2 "Xanh – cam"
  (`components/motion/ghn.ts`, `GHN_OUTFIT`). Bưu tá đội mũ bảo hiểm nửa đầu, áo khoác cam GHN.
- **Phim Shopee:** cam thương hiệu `#EE4D2D`, chữ "Shopee" in ngực áo, không dùng logo.

## Đã chốt

- **Ý xuyên suốt:** mỗi case là một màn "sắp ô" — mở bằng mớ lộn xộn, kết bằng các ô khớp
  vào logo 3×3, cùng mạch với hero trang chủ.
- **Phong cách:** giấy cắt phẳng trên nền giấy `#F3F1EA`, xanh rêu + lime, bóng giấy cứng
  (`feDropShadow` không nhoè) và lớp hạt giấy mờ. Bảng màu ở `components/motion/paper.ts`.
- **Nhân vật Vinh: kiểu B "giấy cắt"** (`components/motion/Vinh.tsx`). Nhận diện bằng kính
  tròn viền đậm + tóc side-part kiểu Hàn (chân tóc phồng vừa, mái phẩy cong sang một bên,
  hai bên gọn — **không** ôm sát đầu), sơ mi trắng, quần đen, giày nâu. Không được có
  phần vai nhô lên kiểu cầu vai: lúc buông tay, cả cánh tay nằm sau thân áo.
  Tóc chốt kiểu **mái phẩy**, chân tóc chỉ phồng vừa (Vinh yêu cầu giảm một nửa độ phồng).
  Động tác riêng: đẩy gọng kính và vệt sáng lướt qua tròng kính khi nghĩ ra cách giải;
  mảng tóc nảy trễ sau đầu một nhịp.
- Chấm / Trùng / Lệch đóng vai dữ liệu có vấn đề (Trùng = bản sao, Lệch = số lệch).
- **Âm thanh: tiếng hiệu ứng thu thật + nhạc nền, không lồng tiếng.** Vinh chê tiếng tổng hợp bằng
  code ("nghe kì kì"), chê Kenney/Freesound "vẫn điện tử quá", rồi chê bộ tiếng chỉ có Cartoon + Foley
  là "nghèo nàn" → dùng đủ sáu gói **Adobe Audition SFX** (Cartoon, Foley, Multimedia, Technology,
  Human Elements, Production Elements). Nguồn, link, giấy phép, cách cắt và ứng viên từng chỗ:
  `docs/motion-audio-sources.json`.
  - Giấy phép Adobe cấm phát tán file lẻ → trên site chỉ phát **bản trộn của cả phim**
    (`public/motion/<phim>-sfx.mp3`, phim phát bằng một `<Audio>`), không để file tiếng lẻ trong `public/`.
    Trộn: `python scripts/motion-sfx.py` — đọc mốc từ bảng tiếng (`node scripts/motion-cues.cjs <phim>`).
  - **Hai phong cách tiếng** thay cho việc bấm chọn từng chỗ: "vui" (hoạt hình) và "gon" (hiện đại
    gọn). Mỗi slot có `picks: {vui, gon}`; phim dùng phong cách ghi ở `films.<phim>.style`.
    `python scripts/motion-sfx.py --variants` trộn đủ mỗi phim × mỗi phong cách vào
    `output/motion-audio/variants/` để Vinh xem cả phim rồi chọn.
  - **Nhạc nền:** Vinh tạo bằng Suno (`docs/case-motion-music.md`), đặt ở
    `output/motion-audio/music/<phim>.mp3`. Có file thì bản trộn tự thêm nhạc dưới tiếng hiệu ứng
    (mặc định nhỏ hơn 9 dB, tự né 5 dB khi có tiếng hiệu ứng); chỉnh `films.<phim>.music`
    (`start`, `gain`, `duck`, `fade_in`, `fade_out`).
  - Trang nghe thử từng chỗ vẫn còn (`--audition`, `node scripts/motion-audio-audition.cjs`, cổng
    3012) cho khi cần đổi riêng một tiếng.
  - Tiếng có phần dồn trước đỉnh (vd "dồn lên trước khi đứng hình") đặt mốc theo đỉnh, kèm `lead`.
- Chuyển cảnh bằng biến hình / match cut, không cắt chớp (bài học MV "How Long").
- Chữ trong phim nằm ở `CaseStudy.motion.lines` (`content/cases.vi.ts`).
- Quy trình: gửi một đoạn ngắn ở chất lượng cuối để duyệt rồi mới làm tiếp.

## Kỹ thuật

- Dựng bằng Remotion (`remotion`, `@remotion/player`, `@remotion/cli` bản 4.0.534).
  Trên site sẽ nhúng bằng `@remotion/player` (vector, chữ lấy từ `content/`); file
  `remotion/index.ts` chỉ để xem trước và xuất MP4 (composition `Interdist`, `OpsPulse`, `Cod`,
  `Warehouse`, `Shopee`, cùng `VinhSheet`, `GhnCast1–4` để duyệt ngoại hình).
- File trong `components/motion/` chỉ import tương đối — Remotion CLI không hiểu alias `@/`.
- Bộ dùng chung ở `components/motion/`: `Vinh`, `Person` (nhân vật phụ: tóc, áo, logo ngực, dây thẻ,
  mũ bảo hiểm), `ghn.ts` (đồng phục GHN), `Boss`, `Buddy` (Chấm/Trùng/Lệch), `Warehouse`, `Sheet`,
  `Speech`, `Clock`, `Glyphs` (chữ số ghép ô 5×7), `Stage`, `Tagline`, `EndCard` + `endSound.ts`,
  `paper.ts` (màu, `ramp`, `pop`, `camera`, `curve`, `twoLines`).
- Mỗi phim một thư mục: `cast` (chữ + dàn nhân vật), các cảnh, `sound.ts` (bảng tiếng),
  `<Phim>Film.tsx` (ghép cảnh + một `<Audio>` bản trộn). Thêm phim mới thì đăng ký ở
  `remotion/Root.tsx`, `scripts/motion-cues.cjs` và mục `films` trong `docs/motion-audio-sources.json`.
- Render dùng Chrome headless có sẵn của dự án MV:
  `--browser-executable=D:/Github/how-long-mv/node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe`
  Ví dụ: `npx remotion render remotion/index.ts Cod .preview/cod-film.mp4 --scale=1.5 --crf=18 --browser-executable=…`
  Bản so sánh tiếng: render hình một lần với `--muted`, rồi ghép từng file trong
  `output/motion-audio/variants/` bằng ffmpeg (`-c:v copy`) → `.preview/variants/<phim>-<phong cách>.mp4`.
- Đầu ra xem trước ở `.preview/` (đã ignore). Trang nghe thử phát chính các file này nên giữ chúng
  mở — **tắt trang nghe thử trước khi render lại** (Windows không cho ghi đè file đang mở).
- Mọi phim trộn tiếng về −20 LUFS, đỉnh −1 dBFS (`scripts/motion-sfx.py`).

## Đã duyệt (2026-10-11)

- Hình cả 5 phim, tiếng phong cách **"vui"** cho cả 5 phim.
- Nhạc nền: **một bài chung** "How It Works" (Suno), ở `output/motion-audio/music/theme.mp3` (không đưa
  lên git); phim nào cũng chạy từ đầu bài. Muốn phim nào có nhạc riêng thì đặt `<phim>.mp3` cùng thư mục.

## Kịch bản

### 1. Interdist — "Sếp và núi file" (`Interdist`, ~39 giây)
`components/motion/interdist/`: `InterdistOpener` (văn phòng) → `Workshop` (xưởng) →
`Morning` (sáng hôm sau) → `EndCard`.
1. Sếp giữa các file Excel bay quanh đầu như vệ tinh; điện thoại hỏi "Vùng nào đạt chỉ
   tiêu?"; hai bản của cùng một file (bản sao là Trùng) cho hai con số rồi đâm nhau;
   đồng hồ hạn báo cáo quay nhanh, sếp ôm đầu bốc khói. Đứng hình, cửa mở, Vinh bước vào.
2. Vinh hỏi "Mỗi sáng sếp cần biết gì?" — sếp đáp: vùng, cửa hàng, sản phẩm. Tờ file phía
   trước phóng to phủ kín khung thành nền giấy của xưởng.
3. File rơi vào phễu "Kiểm tra"; bản trùng bị bật ra kèm cờ đỏ (xem trước khi nhập). File
   đạt hoá ô, ô bay vào xếp cột theo vùng trong app. Vinh chỉnh thanh trượt chỉ tiêu. Lệch
   nhảy vào làm vọt cột Trung → tua lịch sử nhập lùi một bước, Lệch bị gỡ ra.
4. Camera dí vào app, lùi ra thấy đó là màn hình trên bàn sếp sáng hôm sau: dữ liệu mới đổ
   vào, bốn vùng đạt; sếp gối tay sau đầu cười, ba bạn đồng hành nhảy trên nóc màn hình.
5. Giấy trượt lên phủ khung → logo 3×3, ba bạn đồng hành nhảy về ba ô sáng, tên case.

### 2. GHN Ops Pulse — "Con số trung bình nói dối" (`OpsPulse`, ~42 giây)
`components/motion/opspulse/`: `Hall` (một dải phòng, camera lia) → `Drill` (trong dashboard) →
`Report` (báo cáo buổi sáng).
1. Con số toàn quốc 96% ghép bằng ô, cả team vỗ tay reo. Camera zoom một mạch vào một ô → ô tách
   thành ô nhỏ, một ô đỏ → hub đang dồn đơn trễ. Lùi ra.
2. 7:00, chụp · cắt · dán từng bảng vào nhóm chat, ngày càng gấp, mắt díp lại.
3. Ba người cầm ba con số khác nhau, cãi nhau. Vinh vào, ba tờ giấy bay vào một màn hình chung —
   nhãn **"Một dashboard cho cả team"**.
4. Lao vào màn hình: toàn quốc → Miền Nam → Vùng 3 → danh sách hub, Hub 3 "Cần ưu tiên" (chính
   hub ở cảnh 1).
5. Lùi ra, đêm xuống, đồng hồ quay tới 7:00, nhãn **"AUTO · tự gửi 7:00 mỗi sáng"**. Trùng chụp chính
   dashboard 9 lần, ảnh gấp máy bay giấy bay vào nhóm lãnh đạo, cuối cùng là nhận xét ngày hôm qua.
   Câu chốt: "Cả team chung một dashboard, báo cáo tự gửi mỗi sáng".

### 3. Rà soát COD — "Tiền bị giữ, hệ thống không thấy" (`Cod`, ~29 giây)
`components/motion/cod/`: `Doorstep` → `AiEngine` → `CodBoard`. Bưu tá không bị vẽ như tội phạm.
1. Bưu tá GHN giao hàng, người mua trả tiền mặt, tiền vào túi; ứng dụng báo "Giao thành công".
   Túi khoá lại, lịch lật 1 → 3 ngày: "Tiền bị giữ, hệ thống không thấy". Tờ giấy trượt sang.
2. Vinh trồi lên, đẩy kính, phẩy tay dựng cỗ máy **AI** rồi kéo cần. Cuộc gọi, hành trình, tin nhắn
   bay vào phễu ("AI chấm điểm nghi ngờ"); máy bắn ra từng đơn đã gắn nhãn Nghi ngờ cao / vừa / thấp,
   đơn tự chen vào danh sách, mức cao lên đầu. Danh sách phóng ra cả khung.
3. Danh sách là module Rà soát COD trong GHN Ops Pulse, nhãn **"AUTO · cập nhật mỗi ngày"**. Camera lùi
   ra phòng vận hành: đội GHN và Vinh trước màn hình. Lịch lật sang ngày mới, bảng tự cập nhật; quản
   lý chỉ, đơn nghi ngờ cao được đóng dấu "Đã xử lý", cả đội reo. Câu chốt: "AI tự động lọc đơn
   nghi ngờ mỗi ngày".

### 4. Tìm kho làm trễ — "Ai giữ kiện hàng?" (`Warehouse`, ~32 giây)
`components/motion/warehouse/`: bốn cảnh trên một bản đồ 2×2, camera đi hình vuông.
1. Thư "Đơn này trễ. Đền bù!" không nói trễ ở đâu; năm kho xếp hàng nhận diện, gọi tên nhau.
2. Kiện hàng nhả dấu quét Vào/Ra → dòng thời gian từng kho; Kho D giữ lâu nhất (3 ngày, đỏ lên),
   Vinh chỉ vào.
3. Vinh và người bên nghiệp vụ xếp "4 quy tắc nghiệp vụ"; bốn tầng rây, tầng 2 giữ lại → đèn rọi
   đúng Kho D: "Kho D giữ đơn quá hạn".
4. Hàng kho lúc đầu: đèn quét qua rồi dừng ở Kho D, thư đòi đền bù đáp xuống đúng kho; bốn kho kia
   cười (được minh oan), người nghiệp vụ reo, Vinh đẩy kính. Câu chốt: "Biết chính xác kho nào làm
   trễ, có bằng chứng rõ ràng".

### 5. Shopee — "Tự động hoá báo cáo" (`Shopee`, ~22 giây)
`components/motion/shopee/`: một cảnh `Office`. Team logistics của Shopee là team của Vinh.
1. Ba người áo cam Shopee sau bàn; báo cáo cho ba đối tác vận chuyển (Vietnam Post, Viettel Post,
   J&T Express) rơi thành ba chồng giấy cao tới che mặt; thanh "Việc làm tay" đỏ rực; trời tối,
   đồng hồ quay, có người ngáp.
2. Vinh bước vào, đẩy kính; khối **SQL** và **Apps Script** rơi xuống ghép thành cỗ máy **AUTO**; bấm
   nút — máy hút giấy từ các chồng, báo cáo gấp thành máy bay giấy tự bay đi. Trời sáng.
3. Thanh việc làm tay tụt, nhãn **−36%**, cả team thở phào, giơ tay reo, nhâm nhi cà phê. Câu chốt:
   "Tự động hoá giúp team giảm 36% việc làm tay".
