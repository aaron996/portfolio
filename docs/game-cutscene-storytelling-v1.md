# Ải Vận Hành — Cutscene & Storytelling V1

**Trạng thái:** design approved for a first implementation slice; chưa thay đổi runtime.  
**Mục tiêu:** làm năm ải đọc như một hành trình nghề nghiệp duy nhất, nhưng không
biến portfolio game thành một visual novel hay chặn người chơi quá lâu.

## Quyết định phạm vi

V1 dùng **playable comic scenes**, không dùng video prerendered hay full-screen
dialogue tree:

- một lớp overlay HTML/CSS trên canvas, có thể tái dùng asset game và typography
  hiện có;
- camera chỉ pan/zoom nhẹ trên world canvas đang chạy; không thêm route, map hay
  render engine thứ hai;
- mỗi scene có tối đa 2–4 thẻ text, người chơi bấm để đi tiếp hoặc bấm giữ để bỏ
  qua; tổng thời gian đọc mặc định 8–15 giây;
- chỉ có một lựa chọn: **Xem / Bỏ qua**. V1 không có nhánh hội thoại, điểm đạo đức
  hay kết quả khác nhau;
- scene được lưu là đã xem theo browser, nhưng luôn có thể xem lại từ pause menu.

Cutscene là phần thưởng và định hướng; luật combat, checkpoint, save, mission,
audio lifecycle và mobile controls vẫn giữ nguyên.

## Nhịp campaign

```text
Title / New run
  -> Intro ải (vì sao phải vào nơi này)
  -> Gameplay + mission
  -> Boss reveal (vấn đề có hình dạng gì)
  -> Boss clear outro (điều gì đã đổi, vấn đề kế tiếp là gì)
  -> Intro ải kế tiếp
  -> ...
  -> Ending montage + link case study thật
```

Intro chỉ xuất hiện khi vào một ải lần đầu trong lượt chơi. Boss reveal xuất hiện
sau khi trigger boss thành công; checkpoint/retry không phát lại. Outro xuất hiện
sau khi boss chết, trước clear panel hiện tại. Nếu player chọn Skip, gameplay tiếp
tục ở state đích ngay, không bị mất item/mission/input đang có.

## Nguyên tắc viết

1. **Việc thật trước ẩn dụ.** Container, băng chuyền, KPI, dấu vết data và rule là
   hình ảnh gameplay của một vấn đề có thật; không tuyên bố đây là mô phỏng nghiệp
   vụ đầy đủ.
2. **Mỗi scene trả lời đúng một câu hỏi.** Intro: "vì sao ở đây?"; reveal: "đối thủ
   là gì?"; outro: "đã thay đổi điều gì, và vì sao chưa kết thúc?".
3. **Không lecture.** Một thẻ tối đa 120 ký tự tiếng Việt nếu đọc trên mobile;
   chi tiết nằm trong case study thật, không nằm trong cutscene.
4. **Không hứa kết quả không có chứng cứ.** Những câu như "đã giảm trễ" chỉ dùng
   khi nguồn portfolio đã xác minh; trong game ưu tiên câu về cơ chế/hệ thống:
   "cảnh báo tắt", "quy tắc được dựng", "lỗi bị chặn ở cửa vào".
5. **Thắng không xóa quá khứ.** Mỗi outro mở sang vấn đề sâu hơn: đối chiếu → tuyến
   → điều phối → trách nhiệm → product rule.

## Contract scene

Task 2 nên thêm một source of truth `components/game/cutscenes.ts` (hoặc field
typed trong `content/content.vi.ts`) với dạng tối thiểu dưới đây. Text visible vẫn
thuộc `content/content.vi.ts`; component/runtime không hard-code lời thoại.

```ts
type CutsceneKind = "map-intro" | "boss-reveal" | "map-outro" | "finale";
type CutsceneCard = {
  speaker?: "Người chơi" | "Hệ thống" | "Boss";
  text: string;
  emphasis?: string;
};
type CutsceneScene = {
  id: string;
  kind: CutsceneKind;
  mapIndex?: number;
  kicker: string;        // ví dụ: "2019 · A.P. Moller Maersk"
  title: string;
  cards: readonly CutsceneCard[];
  image: string;         // asset key, không rải literal public path trong UI
  backdrop: "port" | "warehouse" | "dispatch" | "data" | "product" | "montage";
  focus?: "player" | "boss" | "mission";
  allowSkip: true;
};
```

Runtime state tối thiểu:

```text
gameplay phase -> cutscene(sceneId) -> gameplay/clear/finish phase
                       | skip
                       +-> cùng state đích, không chạy side effect lần hai
```

`seenCutscenes` phải tách khỏi progress hiện có. Suggested key:
`opsgame:cutscenes-v1`; chỉ ghi sau khi scene kết thúc/skip. Một save JSON hỏng phải
bị bỏ qua an toàn, giống progress save hiện tại. Không lưu scene giữa chừng; reload
trở lại entry state an toàn thay vì khôi phục overlay nửa chừng.

## Scene scripts V1

### Ải 1 — Cảng Cát Lái / 2019

**Intro — `map-1-intro`**

- Kicker: `2019 · A.P. Moller Maersk`
- Title: `Một ký tự, một cổng hàng khác.`
- Focus: player đi qua bãi container; camera pan sang ba mã container xa phía trước.
- Cards:
  1. `Ca bắt đầu ở bãi. Một chứng từ lệch một ký tự cũng đủ đưa hàng sang cổng khác.`
  2. `Đọc bằng mắt không đủ nhanh. Phải đối chiếu đúng mã trước khi chuyến tiếp theo tới.`
- CTA cuối: `Vào bãi`

**Boss reveal — `map-1-boss`**

- Kicker: `ĐỐI CHIẾU CHƯA XONG`
- Title: `Trùm Sai Mã Container`
- Focus: boss silhouette + mã `CT-081 / CT-018 / CT-019`, mã đúng sáng cuối cùng.
- Cards:
  1. `Ba mã nhìn giống nhau. Chỉ một mã khớp chứng từ.`
  2. `Khóa sai mã đã mở. Đừng đứng dưới chân nó khi container dậm xuống.`
- CTA cuối: `Đối chiếu và đánh`

**Outro — `map-1-outro`**

- Kicker: `MÃ VỎ ĐÃ KHỚP`
- Title: `Đúng mã chưa chắc đúng tuyến.`
- Focus: gate chuyển từ đỏ sang xanh; container di chuyển khỏi bãi.
- Cards:
  1. `Lô hàng ra đúng cổng. Cảnh báo ở bãi tắt.`
  2. `Nhưng ở kho kế tiếp, một kiện đúng mã vẫn có thể đi sai tuyến.`
- Transition: palette lạnh của cảng dissolve sang vàng/đen của kho.

### Ải 2 — Kho Phân Loại / 2020

**Intro — `map-2-intro`**

- Kicker: `2020 · J&T Express`
- Title: `Đúng kiện, đúng lúc, đúng nhánh.`
- Focus: camera tilt dọc từ tầng 1 lên tầng 3, dừng ở cầu nâng tắt điện.
- Cards:
  1. `Ba trăm nghìn đơn một ngày. Băng chuyền không chờ một kiện bị kẹt.`
  2. `Bật điện, nối hai nhánh, rồi trở về cổng ra trước khi cả tuyến đứng lại.`
- CTA cuối: `Khởi động kho`

**Boss reveal — `map-2-boss`**

- Kicker: `CỔNG RA ĐÃ CHẠY`
- Title: `Băng Chuyền Kẹt`
- Focus: lõi băng chuyền mở, parcel projectile bay ngang; player facing projectile.
- Cards:
  1. `Nguồn kẹt nằm ở lõi, không phải ở kiện hàng trước mặt.`
  2. `Quay mặt về đạn. Đỡ đúng nhịp để đưa lực trả lại lõi máy.`
- CTA cuối: `Mở lõi`

**Outro — `map-2-outro`**

- Kicker: `HAI NHÁNH ĐÃ THÔNG`
- Title: `Tuyến chạy lại, nhưng áp lực vẫn tăng.`
- Focus: lift chạy, hai luồng parcel sang hai phía; alert đỏ giảm dần.
- Cards:
  1. `Luồng hàng đã có đường đi. Cầu nâng không còn đứng yên.`
  2. `Khi volume tăng, câu hỏi không còn là “đi được không”, mà là “chia tải thế nào”.`
- Transition: parcel trail thành dải light dẫn vào Sàn Điều Phối.

### Ải 3 — Sàn Điều Phối / 2021

**Intro — `map-3-intro`**

- Kicker: `2021 · Shopee`
- Title: `Đúng nhịp quan trọng bằng đúng số.`
- Focus: rider silhouettes chạy qua, HUD cycle 6 giây bắt đầu đếm.
- Cards:
  1. `Ca dồn lên theo nhịp. Một hub đỏ có thể kéo cả tuyến chậm theo.`
  2. `Cửa sổ mở tuyến chỉ có hai giây. Phải san tải trước khi nó đóng.`
- CTA cuối: `Vào nhịp`

**Boss reveal — `map-3-boss`**

- Kicker: `KPI ĐANG LAO TỚI`
- Title: `Trùm 90,1%`
- Focus: boss dash arrow, 90,1% xuất hiện như metric không như text trên sprite.
- Cards:
  1. `90,1% không phải một con số trên bảng. Nó là phần còn lại phải chạy bù mỗi ngày.`
  2. `Đọc hướng lao. Đỡ hoặc nhảy qua, rồi phản công trong nhịp hồi.`
- CTA cuối: `Giữ tuyến`

**Outro — `map-3-outro`**

- Kicker: `CA ĐÃ ĐƯỢC SAN`
- Title: `Không thể sửa thứ chưa biết nó trễ ở đâu.`
- Focus: dashboard glow bình ổn; rider trails trở thành các packet có dấu vết.
- Cards:
  1. `Báo động lùi xuống. Các hub không còn gánh cùng một đợt quá tải.`
  2. `Nhưng một đơn trễ phải đi qua nhiều bàn giao. Muốn sửa, phải lần được dấu vết.`
- Transition: line chart/grid tan thành data route.

### Ải 4 — Phòng Dữ Liệu / 2025

**Intro — `map-4-intro`**

- Kicker: `2025 · Giao Hàng Nhanh`
- Title: `Một đơn trễ cần một nơi chịu trách nhiệm.`
- Focus: ba node `Đơn hàng → Bàn giao → Kho nhận` nổi trên data room.
- Cards:
  1. `Cảnh báo nói đơn đang trễ. Nó chưa nói trễ ở đoạn nào.`
  2. `Nối đúng dấu vết: đơn hàng, bàn giao, rồi kho nhận.`
- CTA cuối: `Truy nguồn`

**Boss reveal — `map-4-boss`**

- Kicker: `DẤU VẾT BỊ ĐỨT`
- Title: `Đơn Vô Chủ`
- Focus: boss từ packet rời rạc ghép lại; ba node chưa hoàn tất chớp đỏ.
- Cards:
  1. `Khi không có kho nào nhận, lỗi có thể đi qua cả hệ thống mà không ai thấy nó.`
  2. `Gọi đúng tên điểm đứt. Khi lớp che mở ra, đạn phản sẽ đi thẳng về nguồn.`
- CTA cuối: `Gọi đúng tên`

**Outro — `map-4-outro`**

- Kicker: `CHUỖI ĐÃ NỐI`
- Title: `Biết nguyên nhân là chưa đủ.`
- Focus: ba node nối bằng đường lime; alert panels tắt lần lượt.
- Cards:
  1. `Mỗi đơn trễ đã có dấu vết và nơi nhận trách nhiệm.`
  2. `Bước tiếp theo là chặn lỗi từ cửa vào, trước khi phải truy nguồn lần nữa.`
- Transition: data route snap thành validation checkmarks.

### Ải 5 — Xưởng Sản Phẩm / 2026

**Intro — `map-5-intro`**

- Kicker: `2026 · Interdist`
- Title: `Đừng để lỗi được sinh ra.`
- Focus: form/schema nhập liệu; hai validation slot trống, một bypass warning.
- Cards:
  1. `Sửa từng chứng từ là cách chữa cháy. Sản phẩm cần tự chặn lỗi trước khi nó đi xa.`
  2. `Bật kiểm tra thiếu mã và trùng mã. Bỏ kiểm tra chỉ đưa vấn đề quay lại.`
- CTA cuối: `Dựng rule`

**Boss reveal — `map-5-boss`**

- Kicker: `SCHEMA KHÔNG AN TOÀN`
- Title: `CATEGORY.SKU`
- Focus: dot giữa `CATEGORY` và `SKU` tách thành crack; boss dùng hybrid dash/slam.
- Cards:
  1. `Một dấu chấm đặt sai có thể làm vỡ cách cả hệ thống hiểu dữ liệu.`
  2. `Giữ hai rule hoạt động. Lần này lớp bảo vệ sẽ không tự đóng lại.`
- CTA cuối: `Ship cho đúng`

**Outro — `map-5-outro`**

- Kicker: `RULE ĐÃ HOẠT ĐỘNG`
- Title: `Từ xử lý sự cố đến hệ thống tự bảo vệ.`
- Focus: rules seal gate; player đứng trước xưởng yên, không còn boss/UI combat.
- Cards:
  1. `Lỗi thiếu mã và trùng mã bị chặn trước cửa vào.`
  2. `Công việc không kết thúc ở một lần sửa đúng. Nó thành một cách làm có thể lặp lại.`
- Transition: vào finale, không show next-map CTA.

### Finale — `campaign-finale`

- Kicker: `2019 → 2026`
- Title: `Ải Vận Hành đã khép lại.`
- Backdrop: montage năm environment, mỗi map 1.0–1.5 giây; ưu tiên asset/background
  hiện có, không cần key art mới ở V1.
- Cards:
  1. `Một mã đúng. Một tuyến thông. Một nhịp được giữ. Một dấu vết có người nhận.`
  2. `Rồi thành những rule để lỗi bị chặn trước khi người khác phải chạy theo nó.`
  3. `Mười kỹ năng, sáu năm, năm con trùm. Không cái nào tự rơi xuống.`
- CTA chính: `Xem các case study thật →`
- CTA phụ: `Chơi lại từ đầu`

## Presentation direction

### Visual language

- Overlay chiếm phần dưới 32–40% màn hình ở desktop; mobile dùng sheet đáy có
  safe-area, không che toàn bộ canvas.
- Kicker dùng monospace/caps nhỏ như HUD vận hành. Title dùng display face hiện có.
- Portrait không bắt buộc ở V1. Ưu tiên crop boss/player trực tiếp từ sprite hiện có
  với viền/stroke CSS; chỉ thêm portrait riêng sau khi vertical slice chứng minh cần.
- Một accent màu theo map palette: cảng xanh, kho amber, điều phối coral, data indigo,
  xưởng green. Không tạo một UI skin mới mỗi scene.
- Chuyển cảnh: fade + 12–24 px slide; tôn trọng `prefers-reduced-motion`, khi đó
  chỉ crossfade 120–160 ms, không camera movement/shake.

### Sound direction

- Cutscene không có voice-over ở V1.
- Reuse audio bus hiện có: ambience hạ nhẹ, music duck 25–35%; một transition cue
  ngắn, không loop mới.
- Boss reveal dùng `bossWarning` hoặc một cue mới `sceneStinger`, nhưng không phát
  cùng tick với boss attack cue. Outro dùng `clear` duy nhất, không double-play.

## Asset plan

Vertical slice Ải 1 không cần gen ảnh mới. Dùng các asset đã có:

| Nhu cầu | Nguồn V1 | Asset mới chỉ khi cần sau slice |
|---|---|---|
| Player focus | player idle/armed idle hiện có | portrait cảm xúc 1 tấm |
| Boss focus | boss 1 + combat V3 stomp frames | boss portrait/intro pose 1 tấm |
| World focus | background map 1 + container/mission props | key art 16:9 không chữ |
| Code/mã minh họa | HTML typography, không gen text-in-image | không áp dụng |
| Finale montage | 5 background layers hiện có | banner finale tùy chọn |

Sau vertical slice, nếu portrait thật sự cải thiện khả năng đọc trên mobile, batch
asset tối thiểu là 6 ảnh: player neutral + năm boss portraits. Mỗi ảnh phải theo rig,
transparent alpha, không text/watermark và được kiểm tra before integration. Không
gen full cutscene art cho cả 5 map trước khi UX pattern được chốt.

## Acceptance criteria cho Task 2 — vertical slice Ải 1

1. New Run vào `map-1-intro`; bấm tiếp/skip đều bắt đầu game bình thường.
2. Clear mob + mở mission → `map-1-boss` chỉ phát một lần trước combat boss.
3. Kill boss → `map-1-outro`, sau đó mới đến clear panel / `Vào ải 2` hiện có.
4. Retry từ checkpoint không phát lại intro hoặc boss reveal; replay scene từ pause
   menu không làm thay đổi engine state.
5. Keyboard, touch, screen reader focus và Escape đều có đường đóng rõ; không có
   keyboard input lọt vào engine phía dưới overlay.
6. 390×844, 844×390 và desktop vẫn đọc được, không che CTA hay virtual controls.
7. `prefers-reduced-motion`, mute, pause/resume và unmount không hồi quy.
8. Tests tách rõ: state transition deterministic, React/browser flow, visual mobile
   smoke. Không gọi task complete chỉ vì build qua.

## File boundary cho Task 2

**Dự kiến sửa:** `content/content.vi.ts`, `content/types.ts`, `components/game/OpsGame.tsx`,
`components/game/OpsGame.module.css`, một component scene mới và test game/browser
liên quan.

**Không sửa trong vertical slice:** `components/game/engine.ts` combat tuning,
map layout, item balance, asset bundle hiện có, save progress contract và route
portfolio ngoài `/game`. Chỉ được thêm callback/state adapter cần thiết để chặn
input trong cutscene; không được đưa UI/browser concern vào engine simulation.

## Các quyết định hoãn

- Voice acting, localization, dialogue branching, achievement/codex và fully
  illustrated cutscenes.
- Portrait batch, boss phase-2 scene riêng và map-specific music cho ải 3–5.
- Scene editor/tooling. V1 có 16 scene cố định; typed content đủ an toàn và dễ review.

Những hạng mục này chỉ được xem lại sau khi playtest vertical slice xác nhận người
chơi đọc scene, hiểu transition và không thấy nó làm chậm nhịp game.
