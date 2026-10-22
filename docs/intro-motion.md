# Intro motion — kịch bản

Intro motion graphic do ba bạn đồng hành diễn (`docs/companions.md`). Vinh chốt hướng ngày
2026-10-16.

## Đã chốt

- **Chỉ còn phim dựng bằng code** (2026-10-22): teaser video cũ (ảnh chụp app + chữ, 15s) đã bỏ cùng
  file `intro-teaser.mp4`; `components/portfolio/Intro.tsx` mở thẳng phim. Hộp thoại mờ dần vào
  (400ms) thay cho nhịp nghỉ đen của teaser; phim vẫn mở từ màn đen — màn đen là Chấm. Mã nguồn
  dựng teaser còn ở `teaser/` phòng khi cần quay lại.
- **Phim chỉ có tiếng hiệu ứng, không nhạc.**

- **Dựng live**, không phải file video: vẽ bằng SVG trong trang (`components/portfolio/IntroFilm.tsx`),
  khung hình co theo màn hình, pixel nét ở mọi cỡ. Cuối intro logo bay đúng vào logo
  thật trên nav. Muốn bản MP4 để đăng mạng xã hội thì quay lại từ chính code này.
- **Phim mới khoảng 25 giây** (ban đầu chốt 20s; xem bản 20s thấy nhanh quá nên giãn ra, 2026-10-16).
  Nút "Bỏ qua" có từ giây đầu; xem rồi trong phiên thì không hiện lại.
- **Mở màn là màn đen — và màn đen chính là Chấm** đang dí sát ống kính. Vì vậy nền
  intro là nền giấy sáng, không phải nền tối của teaser cũ.
- Mỗi màn diễn **một việc Vinh làm**: phân tích → build cùng AI → ship. Pixel của màn
  trước biến thành đạo cụ của màn sau (biểu đồ → dashboard → thùng hàng → logo), không cắt cảnh.
- **AI có đất diễn riêng**: AI làm nhanh, Chấm soát lại và bắt được một khối sai.
- Màn chào ở hero đổi đoạn mở cho khớp (xem dưới).

## Kịch bản (120 BPM, 1 nhịp = 0,5s)

Các mốc giây dưới đây là **giờ phim** (20s). Lúc phát, phim chạy bằng 0,85 tốc độ và dừng
thở 0,3–0,45s ở cuối bốn màn (lúc cả khung đã đứng yên, chữ vừa hiện đủ), thành ≈ 25s thật.
Cả hai nằm ở `RATE` và `HOLDS` trong `components/portfolio/introClock.ts` — chỉnh nhịp cả phim
thì sửa ở đó, rồi trộn lại tiếng (file tiếng chạy theo giờ thật).

| Giây | Màn | Hình | Chữ |
|---|---|---|---|
| 0–4,2 | **Mở màn** *(đã dựng)* | Đen kịt. Camera lùi chậm, mép đen lộ dần, hai con mắt khổng lồ hiện ra và chớp — cái đen này có mắt. Chấm giật mình ("!"), nhảy lùi, camera giật ra toàn cảnh: sàn giấy. Chấm lắc người vẫy chào; Lệch rơi từ trên xuống nảy quá đà; Trùng trượt vào và vẫy chào y hệt Chấm, chậm nửa nhịp | |
| 4,2–7,6 | **Phân tích** *(đã dựng)* | Mưa pixel đổ xuống, ba bạn nhảy tránh sang trái (Lệch lộn nhào qua đầu cả nhóm). Chấm chạy quét qua đống pixel — chạy tới đâu pixel bay về thành cột tới đó; Trùng chạy theo, bắt chước từng bước. Trùng nhảy lên đỉnh cột cuối thì cột tự nhân đôi dưới chân (trùng lặp làm phồng số liệu); Chấm nhảy lên đá bay phần trùng, Trùng lộn vòng qua cả biểu đồ rơi xuống sàn, choáng. Đường xu hướng vẽ qua đỉnh cột; Lệch bật vọt lên cao hơn hẳn, treo lơ lửng vẫy chào, bị khoanh đỏ — điểm ngoại lai — rồi mới rơi. Cột cuối hoá xanh, vọt lên, số đếm **90.1% → 97.5%** (case 3PL, pickup đúng hạn) | MAKE SENSE OF DATA. |
| 7,6–11,5 | **Build + AI** *(đã dựng)* | Các cột gập thành khung một màn hình dashboard đứng trên chân đế; phần chưa có hiện ô nét đứt. Làm tay: Lệch nện búa quá tay, khối bay vút lên dội mép trên rồi văng mất; Trùng đá ba khối y hệt nhau vào đúng một chỗ, chồng lên nhau. Chấm thở dài. Một chip ✦ màu lime hiện trên đầu Chấm — Chấm húc đầu vào như khối hỏi chấm: các ô còn lại tuôn ra từ chip lấp đầy màn hình trong một nhịp, hai khối trùng xẹp mất, Lệch buông búa, hai bạn tròn mắt. Chấm nhảy lên mép trên, thả kính lúp quét dọc màn hình, bắt một khối AI đặt sai (đỏ, lệch hai hàng) — "!" — giậm chân một cái, khối lộn về đúng chỗ và đúng màu | BUILD WITH AI. |
| 11,5–13,5 | **Ship** *(đã dựng)* | Chấm nhảy xuống sàn. Dashboard sụp xuống thành một thùng hàng giấy carton có băng keo. Trùng nhảy qua đầu Lệch lên nóc thùng — đáp xuống là con dấu ✓ đập lên mặt thùng. Lệch lấy đà chạy tới sút một phát, thùng lộn vòng bay vút khỏi khung kèm vệt gió; cả ba ngước nhìn theo, Lệch nhảy cẫng | SHIP IT. |
| 13,5–17 | **Về nhà** *(đã dựng)* | Lưới logo 3×3 bật lên giữa sàn (ô bằng đúng cỡ nhân vật): sáu ô tối và ba ô nhà nét đứt. Chấm nhảy một cú vào ô giữa gọn gàng, sáng lime. Trùng bắt chước nhảy vào đúng ô của Chấm — giẫm lên đầu Chấm (Chấm nhắm tịt mắt), dội ra, lộn một vòng rơi vào ô dưới trái. Lệch vọt lên quá đà, bay qua ô của mình ra khỏi khung; hai bạn ngước lên chờ; một nhịp sau Lệch mới rơi thẳng xuống ô trên phải, cả lưới rung. Về đúng ô thì thân chuyển lime, mắt đổi màu mực | |
| 17–20 | **Ký tên** *(đã dựng)* | Đường chéo sáng quay một vòng quanh Chấm như kim đồng hồ (Lệch và Trùng nhảy từng ô, Chấm nhún mỗi bước) — đi qua đủ bốn thế đường chéo của logo rồi dừng ở thế quen. VINH LUONG hiện dưới logo, bốn chữ DATA · PRODUCT · AI · SOLUTION bật lần lượt; ba bạn chớp mắt cùng lúc. Chữ tắt, nền giấy và sàn tan để lộ trang thật phía sau; mắt tắt dần, logo thu nhỏ bay đáp khít lên logo trên nav. Trùng lặng lẽ tụt khỏi ô, rơi xuống biểu đồ hero — ô của nó trên nav thành nét đứt, nối sang màn chào | |

Ô của ba bạn trong logo (khớp `LOGO_CELLS`): Chấm ô giữa (4), Trùng dưới trái (6), Lệch trên phải (2).

Đủ phim (20s giờ phim, ≈ 25s thật). Hết phim hộp thoại mờ đi trên logo đã khớp chỗ, nên không thấy chỗ nối.
Xem một khung đứng yên: `/?intro=1.8` (giây thứ 1,8). Không có số thì chạy bình thường.

Đích bay đo từ `.home-brand svg` trên nav, đo lại từng khung trong lúc bay (nav còn xê
dịch khi font tải xong). Nhịp Trùng lẻn đi chỉ diễn khi trang đang để trống ô của Trùng
(`absent` trong store bạn đồng hành) — tắt bạn đồng hành thì cả ba ở lại logo.

## Màn chào ở hero — đổi đoạn mở

Trước: ba ô lạc nằm sẵn trong biểu đồ, bị đá văng cả ba.

Giờ: sắp xong biểu đồ thì **chỉ Chấm và Lệch nhảy ra từ logo trên nav** xuống sàn. Ô của
Trùng trong logo đã trống từ trước (Trùng lẻn đi lúc nào không ai thấy). Hai bạn đếm quân,
nhìn lại logo, "?". Lệch phát hiện một ô trong biểu đồ hé mắt — là Trùng, bản sao nên nằm
lẫn y như mọi ô khác. Ô đỉnh cột bên cạnh đá Trùng văng xuống sàn. Phần sau giữ nguyên:
Chấm thấy chữ I, nhảy lên làm dấu chấm.

## Tiếng

Bảng tiếng ở `components/portfolio/introSfx.ts` (giờ phim, tên tiếng, độ to). Bản đầu 86 mốc mượn
bộ "vui" của phim case bị chê **chói tai** (không có nhạc che, lại quá dày). Bản thứ hai 42 mốc, mỗi
mốc là một vai riêng (slot `i-*` trong `docs/motion-audio-sources.json`) với hai bộ tiếng chọn theo độ
chói đo được: **mem** (Adobe gỗ/lò xo/cao su, trọng tâm phổ ~450 Hz) và **mixkit** (Mixkit Cartoon,
~780 Hz; bản cũ ~1.760 Hz). Bản trộn còn hạ dải cao (`soften` của phim intro). **Vinh chọn mixkit**
(2026-10-16) — `films.intro.style` = `"mixkit"`; bộ "mem" giữ trong manifest để còn đổi lại.

```bash
MOTION_AUDIO_SOURCES=<thư mục sources đã tải> python scripts/motion-sfx.py --film intro --style mixkit  # → output/motion-audio/variants/
python scripts/motion-sfx.py --film intro   # bản chính theo films.intro.style → public/portfolio/intro-sfx.mp3
```

Kho Adobe ~4GB (`--download`). Mixkit Cartoon (136 tiếng, giấy phép Mixkit Sound Effects Free — dùng
thương mại, không cần ghi nguồn) tải từng file `https://assets.mixkit.co/active_storage/sfx/<id>/<id>.wav`
vào `output/motion-audio/sources/mixkit-cartoon/` với tên `"<id> <tên>.wav"`; `--download` bỏ qua nguồn này.

Phát: teaser cố mở tiếng; trình duyệt chặn thì phát câm và nút loa hiện "Bật tiếng". Chưa có cú
chạm nào thì Chrome chặn cả `<audio>` phát câm, nên tiếng phim mới chỉ chạy khi trang được phép phát
có tiếng, hoặc khi người xem bấm loa — lúc đó tiếng vào từ đúng giây phim đang chiếu. Tiếng lệch
đồng hồ phim quá 0,12s (vd. vừa quay lại tab) thì tự kéo về. `?intro=<giây>` (đứng yên) không có tiếng.

### Giảm tần suất tiếng (2026-10-22)

Còn **13 mốc** (từ 42): mỗi màn một đến hai tiếng ở bước ngoặt — Chấm giật mình, Lệch nảy, cột nhân
đôi, cú đá, 97.5%, búa, AI lấp đầy, bắt lỗi, con dấu, sút thùng, Trùng giẫm đầu, còi rơi + uỵch, chuông cuối.
Bỏ hết tiếng whoosh, pop, tick, rattle, fold, block và các tiếng đệm.

`public/portfolio/intro-sfx.mp3` đã trộn lại từ bảng 13 mốc (style mixkit, −20 LUFS, đỉnh −5 dBFS); mỗi tiếng
nhỏ hơn bản 42 mốc cũ khoảng 20% (mức chuẩn trên cả file nên hết tiếng đệm thì mỗi tiếng không to lên).
Kho nguồn dùng lại từ worktree khác qua `MOTION_AUDIO_SOURCES` (Mixkit ở `intro-motion-graphic-*`, Adobe ở
`motion-graphic-cases-*`).
