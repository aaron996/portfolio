# Kế hoạch làm game isometric đánh quái ("Ải Vận Hành" đời 2)

Ngày lập: 05/09/2026. Tài liệu này trả lời hai câu: **dùng công cụ gì để làm việc
cùng AI coding agent**, và **làm theo thứ tự nào**.

Đọc mục 2 trước. Đó là chỗ duy nhất có quyết định kỹ thuật; các mục sau chỉ là hệ quả.

---

## 1. Cái đang có — đừng làm lại từ đầu

| Tài sản | Ở đâu | Dùng lại được cho game mới không |
|---|---|---|
| Engine 2D canvas, 3181 dòng | `components/game/engine.ts` | **Không dùng lại code**, nhưng dùng lại *thiết kế*: vòng lặp fixed-step, tách engine khỏi React, bắn event ra UI, cờ `ASSETS` bật/tắt từng loại ảnh |
| Pipeline sprite AI | `scripts/sprites.py`, `docs/game-assets.md` | Có, nếu chọn đường 2D sprite. Vô dụng nếu chọn đường 3D |
| Nội dung tách khỏi code | `content/content.vi.ts`, `content/types.ts` | **Có, bắt buộc giữ.** Luật của `CLAUDE.md` |
| Nạp GLB bằng three.js đã chạy thật | `components/ui/SensorBot.tsx`, `public/*.glb` | **Có — đây là thứ quan trọng nhất.** Đã chứng minh `three` + `@react-three/fiber` + `useGLTF` chạy được trên trang này |
| 176 tấm sprite 2D đã gen | `public/game/` | Chỉ tái dùng được vật phẩm/UI/hiệu ứng. Nhân vật và quái là hình chiếu ngang, không dùng cho iso |

Kết luận sớm: `three` và `@react-three/fiber` **đã nằm trong `package.json` và đã chạy
thật** ở con bot ngoài trang chủ. Không phải thêm dependency nào để làm 3D.

Game cũ ở `/game` **giữ nguyên, không đụng vào**. Game mới đi route riêng
(`/quest` hoặc `/game/iso`). Lý do: game cũ đang là một mục trong portfolio, hỏng nó
để đổi lấy một game chưa xong là lỗ.

---

## 2. Quyết định kỹ thuật: ba đường, chọn đường nào

"Isometric + nhân vật kiểu MapleStory" mô tả gần như chính xác **MapleStory 2** — và
MapleStory 2 không phải game 2D. Nó là **3D chibi với camera gần trực giao**. Đó là
gợi ý mạnh về đường nên đi.

### Đường A — 2D sprite isometric (giống pipeline hiện tại)

Vẽ sprite cho mỗi hướng, mỗi hành động. Số tấm cần:

```
8 hướng × (đứng 4 + chạy 8 + chém 4 + trúng đòn 2 + chết 4) = 176 tấm cho MỘT nhân vật
```

Chưa tính quái. Bộ v2 hiện tại tốn 176 tấm cho **toàn bộ** game 2D. Đường A nghĩa là
mỗi con quái là một bộ 176 tấm nữa.

Và đây mới là chỗ chết người: model sinh ảnh **không giữ được nhất quán nhân vật qua
8 hướng**. Mục 0 của `docs/game-assets.md` đã ghi lại đúng lỗi này ở quy mô nhỏ hơn
nhiều — 9 tấm cùng một tư thế ngang mà cỡ đầu đã lệch 23%, mặt mỗi khung một kiểu.
Nhân bài toán đó lên 8 hướng thì không có script `normalize` nào cứu được: lệch cỡ thì
canh lại được, chứ **lệch danh tính** thì không.

→ **Không khuyến nghị.** Trừ khi bạn muốn look pixel-art thủ công và chấp nhận vẽ tay.

### Đường B — Dựng 3D rồi render ra sprite 2D (kiểu Diablo, Age of Empires)

Làm model low-poly trong Blender, đặt 8 camera quanh nhân vật, render từng khung
animation thành PNG. Nhất quán tuyệt đối vì cùng một model.

Được: giữ được cảm giác 2D thật, engine runtime nhẹ (chỉ vẽ ảnh).
Mất: mỗi lần chỉnh animation phải render lại toàn bộ; xoay camera trong game là không
thể; thêm một công cụ nặng (Blender) vào vòng lặp làm việc với agent.

→ **Phương án dự phòng**, nếu đường C ra look không ưng.

### Đường C — 3D thật, camera trực giao, toon shading ★ khuyến nghị

`OrthographicCamera` đặt ở góc 45°/35.264° (góc isometric thật). Nhân vật là GLB
low-poly chibi, `MeshToonMaterial` + viền đen (`<Outlines>` của drei) cho ra đúng
ngôn ngữ hình ảnh MapleStory: khối đơn giản, màu tươi, viền đậm.

Được:
- **Xoá sạch bài toán 8 hướng.** Xoay model là xong. 8 hướng, 16 hướng, hay xoay mượt
  đều cùng một chi phí bằng không.
- Animation lấy từ Mixamo (miễn phí, auto-rig) hoặc bộ CC0 có sẵn animation. Không
  phải gen ảnh.
- Đổ bóng, ánh sáng, hiệu ứng đánh trúng có chiều sâu thật — thứ 2D phải vẽ tay.
- Camera xoay/zoom được → một tính năng "thấy được ngay" mà đường A/B không có.
- **Agent kiểm chứng được bằng code**: vị trí, va chạm, sát thương đều là số trong
  scene graph, không phải pixel.

Mất:
- Phải học `useGLTF` / `AnimationMixer` (đã có tiền lệ ở `SensorBot.tsx`).
- Nặng hơn 2D trên máy yếu. Cần ngân sách poly kỷ luật (mục 6).
- Look sẽ giống MapleStory **2**, không giống MapleStory 1. Nếu bạn muốn đúng vibe
  bản 1 thì đây là điểm phải chốt trước khi viết dòng code nào.

**Chốt: đi đường C.** Toàn bộ mục 3–7 viết theo đường C. M0 chính là chốt chặn để
đổi ý sang B nếu look không ưng — bỏ đi đúng một mốc, không phải cả kế hoạch.

---

## 3. Bộ công cụ nối với AI coding agent

### 3.1 Nguyên tắc gốc: agent phải **tự nhìn thấy** game

Vòng lặp làm game khác vòng lặp làm web. Web thì `tsc` xanh gần như là đúng. Game thì
`tsc` xanh mà nhân vật đi xuyên tường, quái đứng im, đòn đánh trượt vẫn xanh. Nếu bạn
là người duy nhất nhìn được kết quả, bạn thành nút cổ chai: mỗi vòng lặp phải chờ bạn
mở trình duyệt, chơi thử, mô tả lại bằng lời cho agent.

Nên hai thứ dưới đây quan trọng hơn mọi thư viện trong mục 3.2:

**(a) Cửa sổ debug — `window.__quest`**

Engine phơi ra một object đọc được từ ngoài: vị trí người chơi, danh sách quái + máu,
phase hiện tại, số frame đã chạy, và hàm `step(n)` để chạy N tick không cần chờ thời
gian thật.

`CLAUDE.md` đã ghi cách đo trạng thái game cũ: *"mở bảng túi đồ (B) và bảng tạm dừng
(P) rồi đọc DOM — đó là chỗ duy nhất `status()` lộ ra ngoài"*. Đó là cách đo qua khe
cửa. Game mới đặt cửa sổ ngay từ commit đầu tiên.

**(b) Mô phỏng headless, tất định**

Tách `logic/` khỏi `render/`. Logic không chạm `window`, không chạm `THREE`, nhận
`dt` cố định, dùng RNG có seed. Agent chạy được `node scripts/sim.mjs --seed 42
--ticks 3600` và có kết quả **giống hệt nhau mọi lần** → viết được test kiểu "chạy
1200 tick với input này thì phải hạ được 3 con quái và còn ≥ 40 máu".

Đây là thứ đổi hẳn chất lượng làm việc với agent: agent tự sửa cân bằng game trong
vòng lặp đóng, không cần bạn ngồi chơi thử.

### 3.2 Công cụ theo vai trò

| Vai trò | Công cụ | Ghi chú |
|---|---|---|
| **Agent viết code** | Claude Code (đang dùng) + `CLAUDE.md` | Đã có. Cần bổ sung mục cho game mới, xem M0 |
| **Agent tự mở game xem** | Playwright (`@playwright/mcp`) hoặc `chrome-devtools-mcp` | Môi trường web session đã cài sẵn Chromium ở `/opt/pw-browsers`, đừng chạy `playwright install`. Chụp màn hình → agent tự đối chiếu |
| **Render 3D** | `three` + `@react-three/fiber` + `@react-three/drei` | **Đã có trong `package.json`.** `drei` cho `<Outlines>`, `useGLTF`, `useAnimations`, `OrthographicCamera` |
| **Model nhân vật/quái** | Quaternius, Kenney (CC0, có sẵn animation) → sau đó Meshy/Tripo (text→3D) cho model riêng | Bắt đầu bằng CC0 để có thứ chạy được trong ngày đầu. Model riêng làm sau, không chặn tiến độ |
| **Rig + animation** | Mixamo (miễn phí, auto-rig từ FBX) | Rig chuẩn người tỉ lệ thật; nhân vật chibi 2-đầu auto-rig xong thường phải chỉnh tay khớp vai/hông |
| **Sửa model, gộp animation, xuất GLB** | Blender + `blender-mcp` (server cộng đồng) | Chỉ cần khi bắt đầu làm model riêng. Đừng cài ở M0 |
| **Bản đồ** | JSON tự định nghĩa trong `content/`, không dùng Tiled | Map là lưới ô + danh sách spawn — 40 dòng TypeScript có kiểu chặt chẽ, agent sửa trực tiếp được. Tiled thêm một file nhị phân agent không đọc nổi. Chỉ đổi ý khi map vượt ~40×40 ô |
| **Kiểm tra** | `npx tsc --noEmit`, `npx next build`, `node scripts/sim.mjs` | Ba lệnh này là hợp đồng: agent không được báo xong nếu một trong ba đỏ. Đừng chạy `next lint`, repo chưa có config |
| **Asset 2D còn lại** (icon, UI, hiệu ứng) | ImageGen tích hợp + `scripts/sprites.py` | Tái dùng nguyên pipeline cũ |

### 3.3 Hạ tầng phải dựng cho agent (không phải cho người chơi)

Ba thứ này là "công cụ", dù chúng là code trong repo:

1. `scripts/sim.mjs` — chạy logic headless, in JSON trạng thái cuối. Mục 3.1(b).
2. `app/quest/debug/page.tsx` — trang bày mọi model ở mọi animation trên một lưới,
   như `preview-game-art.cjs` cũ nhưng cho 3D. Agent chụp một tấm là thấy hết.
3. `docs/iso-assets.md` — bảng "việc còn phải gen" cho game mới, cùng luật bốn việc
   của `CLAUDE.md` mục asset. Placeholder không được ghi vào bảng sẽ nằm đó vĩnh viễn.

---

## 4. Kiến trúc mã nguồn

```
content/
  quest.vi.ts          chữ + dữ liệu map (luật CLAUDE.md: KHÔNG hardcode chữ vào JSX)
  quest-types.ts       kiểu cho map, quái, kỹ năng, vật phẩm
components/quest/
  logic/               KHÔNG import three, KHÔNG chạm window
    world.ts           trạng thái thế giới, tick(dt)
    grid.ts            lưới ô, tìm đường, va chạm
    combat.ts          hitbox, sát thương, trạng thái đòn
    mobs.ts            AI quái
    rng.ts             RNG có seed
  render/              chỉ dựng hình, không quyết định gì
    Scene.tsx          camera trực giao + ánh sáng
    Actor.tsx          GLB + AnimationMixer + Outlines
    Terrain.tsx        dựng ô từ dữ liệu map
  ui/                  HUD, túi đồ, bảng tạm dừng (React thường, không phải canvas)
  QuestGame.tsx        ráp vào nhau, phơi window.__quest
app/quest/page.tsx
scripts/sim.mjs
```

Ranh giới `logic/` ↔ `render/` là ranh giới quan trọng nhất trong toàn bộ kế hoạch.
Giữ được nó thì test headless chạy được, đổi từ đường C sang B chỉ phải viết lại
`render/`. Phá nó một lần là mất cả hai.

Quy ước toạ độ: logic dùng ô lưới (số nguyên) + offset thực (float) trên mặt phẳng
XZ. Render đổi sang toạ độ màn hình. **Logic không bao giờ biết pixel là gì.**

---

## 5. Lộ trình

Đơn vị là "phiên" — một buổi làm việc với agent, khoảng 2–3 giờ. Tổng ~16–22 phiên.
Mỗi mốc là một PR, có tiêu chí nghiệm thu chạy được bằng lệnh.

### M0 — Spike: chốt look (1–2 phiên)

Mục tiêu duy nhất: nhìn thấy một nhân vật chibi đứng trên nền isometric và **quyết
định có thích không**.

- Route `/quest` dựng sàn 10×10 ô, camera trực giao đúng góc iso.
- Nạp một model CC0 (Quaternius/Kenney) có sẵn animation idle + walk.
- `MeshToonMaterial` + `<Outlines>`, ba nguồn sáng, một bóng đổ.
- Bấm phím → nhân vật đi theo 8 hướng, xoay mặt đúng hướng.

**Nghiệm thu:** `tsc` + `build` xanh; ảnh chụp `/quest` cho thấy nhân vật đứng đúng
trên sàn; bạn xem ảnh và nói **đi tiếp** hay **đổi sang đường B**.

Chưa viết logic game ở mốc này. Vứt đi cũng chỉ mất 2 phiên.

### M1 — Nền tảng (2–3 phiên)

- `content/quest-types.ts` + một map mẫu trong `content/quest.vi.ts`.
- `logic/world.ts` với vòng lặp fixed-step (60Hz logic, render tự do).
- Lưới đi được / không đi được, va chạm tường, độ cao ô.
- Camera bám nhân vật, có giới hạn biên map.
- **`window.__quest` và `scripts/sim.mjs` phải xong ở mốc này**, không để sau.

**Nghiệm thu:** `node scripts/sim.mjs --seed 1 --ticks 600` in ra vị trí cuối, chạy
hai lần cho kết quả giống hệt. Nhân vật không xuyên tường ở mọi hướng.

### M2 — Chiến đấu (3–4 phiên)

- Máy trạng thái nhân vật: idle / run / attack / hurt / dodge / dead.
- Đòn đánh có ba pha (khởi động, gây sát thương, hồi đòn) — không cho spam.
- Hitbox hình quạt trước mặt; combo 3 nhát.
- Ba loại quái: đi tuần, lao vào, bắn xa. Tái dùng đúng cách phân loại của
  `content/types.ts` cũ (`walker`/`charger`/`shooter`) — nó đã được chứng minh là đủ.
- Sát thương, đẩy lùi, chớp trắng khi trúng, số bay lên.

**Nghiệm thu:** test headless "seed 42, đánh 3 con walker, thắng trong ≤ 900 tick,
máu còn ≥ 40". Test này phải chạy trong CI của chính agent trước mỗi lần commit.

### M3 — Nhân vật thật (2–3 phiên)

Đây là mốc tốn tiền/tốn công nhất, cố ý đặt **sau** khi combat đã chạy — để nếu
combat không vui thì chưa mất gì.

- Chốt tỉ lệ chibi (đầu ≈ 1/2,5 thân), bảng màu, ngân sách poly (mục 6).
- Làm model chính: Meshy/Tripo từ concept → sửa trong Blender → Mixamo rig →
  gộp animation → xuất một GLB duy nhất có đủ clip.
- Ba model quái theo cùng luật.
- Trang `/quest/debug` bày hết model × animation.
- Ghi `docs/iso-assets.md`: bảng việc còn phải gen, prompt đầy đủ, cờ bật/tắt.

**Nghiệm thu:** mỗi model < 8k tam giác, GLB < 1,5 MB, `/quest/debug` chụp một tấm
thấy đủ; asset chưa có thì bản lùi bằng khối hộp vẫn chạy được (cờ `ASSETS`).

### M4 — Nội dung: map và kể chuyện (2 phiên)

- 3–5 màn, mỗi màn một chủ đề nghề như game cũ (kho, tuyến, trạm...).
- Trùm cuối màn, câu chốt sau khi hạ trùm.
- Cổng chuyển màn, điểm hồi sinh.
- **Toàn bộ chữ vào `content/quest.vi.ts`.** Kể cả `aria-label`.

**Nghiệm thu:** đi hết 3 màn bằng sim headless; không có chuỗi tiếng Việt nào trong
`components/quest/`. Kiểm bằng `grep`.

### M5 — Chiều sâu (2–3 phiên)

- Vật phẩm rơi ra, túi đồ, trang bị đổi được chỉ số.
- 3–4 kỹ năng có thời gian hồi.
- Lên cấp, cộng điểm.
- Lưu tiến độ vào `localStorage`.

**Nghiệm thu:** test headless cho cân bằng — "người chơi cấp 3 với trang bị mặc định
phải hạ được trùm màn 1 trong 60 giây". Agent tự chỉnh số cho tới khi qua.

### M6 — Đánh bóng và điện thoại (2–3 phiên)

- Cần điều khiển ảo + nút đánh cho màn hình cảm ứng.
- Âm thanh (một vòng nhạc nền + 6–8 tiếng động).
- Hạt hiệu ứng khi trúng đòn, khi lên cấp.
- Hiệu năng: instancing cho ô sàn, LOD cho quái xa, giới hạn 60fps trên máy giữa.
- `prefers-reduced-motion` — trang này đã tôn trọng nó ở chỗ khác, giữ nhất quán.

**Nghiệm thu:** viewport 390×844 chơi được đủ một màn, không tràn ngang, không lỗi
console; Lighthouse hiệu năng ≥ 70 trên `/quest`.

### M7 — Đưa lên (1 phiên)

- Link từ portfolio, ảnh OG riêng.
- Ghi chú thành thật về việc còn dở (game cũ đã làm đúng chuyện này).
- Cập nhật `CLAUDE.md`: luật asset cho game mới, cách test.

---

## 6. Rủi ro và cách chặn

| Rủi ro | Dấu hiệu sớm | Chặn bằng |
|---|---|---|
| **Look không ra chất MapleStory** | M0 nhìn ra "3D indie chung chung" | Viền đen dày + màu bão hoà cao + đầu to là ba thứ tạo ra chất đó, không phải model đẹp. Chốt ở M0, đừng để đến M3 |
| **Nhân vật thành hố đen thời gian** | Sang phiên thứ 4 của M3 vẫn chưa xong một model | Dùng CC0 tới hết M5. Model riêng là việc của M3 nhưng **không chặn** M4–M5 |
| **Agent sửa mù vì không thấy game** | Agent nói "đã sửa" mà chơi vẫn sai | `window.__quest` + `sim.mjs` phải xong ở M1. Không thương lượng |
| **Logic dính vào render** | `logic/` bắt đầu `import ... from "three"` | Thêm một bước kiểm: `grep -r "three" components/quest/logic/` phải rỗng. Cho vào lệnh kiểm trước commit |
| **Hiệu năng chết trên điện thoại** | 60 quái là tụt xuống 20fps | Ngân sách từ đầu: ≤ 8k tam giác/model, ≤ 15 quái cùng lúc, ô sàn dùng instancing, một bóng đổ duy nhất |
| **Cùng lỗi nhất quán như bộ art đời 1** | Mỗi quái một tỉ lệ, một tông màu | Bảng màu và ngân sách poly ghi vào `docs/iso-assets.md` **trước** khi gen model đầu tiên |
| **Game mới làm hỏng `/game` cũ** | Build đỏ ở route cũ | Route riêng, thư mục riêng, `content` riêng. Không sửa file nào của game cũ |

---

## 7. Cần chốt trước khi bắt đầu M0

1. **Look MapleStory 1 hay 2?** Bản 1 là 2D vẽ tay side-scroll; bản 2 là 3D chibi
   isometric. Kế hoạch này viết cho bản 2. Nếu bạn muốn đúng vibe bản 1 thì đổi sang
   đường B ở mục 2 và cộng thêm ~6 phiên.
2. **Route:** `/quest` hay `/game/iso`? Ảnh hưởng đường dẫn, không ảnh hưởng gì khác.
3. **Chủ đề:** giữ mạch "ải vận hành" của game cũ, hay là thế giới phiêu lưu riêng?
   Ảnh hưởng M4, không ảnh hưởng M0–M3.

Ba câu này không chặn M0 — spike dựng được bất kể trả lời thế nào. Trả lời trước M3
là kịp.
