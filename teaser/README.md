# Teaser 15s — "Sense" (Vinh Luong)

Toàn bộ chữ trên hình bằng tiếng Anh. Chữ tiếng Việt chỉ còn trong giao diện gốc của hai ảnh game.

Video 1920×1080 · 60 fps · 15,000 s (900 khung) · H.264 + AAC 320 kbps. Lưu source để sửa và render lại.

## Cấu trúc

| File | Vai trò |
| --- | --- |
| `index.html` | Toàn bộ hình. Mọi cảnh là hàm thuần của thời gian `t` → render lại khung nào cũng giống hệt. `?t=5.7` xem một khung, `?play` xem thử trong trình duyệt |
| `audio.py` | Toàn bộ nhạc + sound design (numpy/scipy), cùng lưới nhịp 128 BPM với hình |
| `render.mjs` | Chrome headless (CDP) → PNG từng khung → ffmpeg → MP4. Có chế độ `still` |
| `analyze.py` | Kiểm tra âm thanh: mức theo 0,5 s, cân bằng phổ, spectrogram |
| `sheet.py` | Ghép các khung `still` thành contact sheet để duyệt |
| `assets/` | Font lấy nguyên từ bản build của portfolio; ảnh app `public/case-*.png`; ảnh KA TTS monitor (đã che email ở header), game 2D Ải Vận Hành và game 3D do người dùng gửi |
| `export/` | Đầu ra (MP4, WAV, cue sheet, ảnh kiểm) |

## Chạy lại

```bash
python -m pip install numpy scipy imageio-ffmpeg pillow      # ffmpeg lấy từ imageio-ffmpeg
python teaser/audio.py                                        # → export/teaser-audio.wav (24-bit 48 kHz)
node teaser/render.mjs still 5.7 7.6 13.2                     # duyệt vài khung
node teaser/render.mjs video                                  # → export/teaser-15s-1080p60.mp4  (~8 phút, 4 tab Chrome)
node teaser/render.mjs video --silent                         # bản không tiếng để duyệt hình
```

Biến môi trường: `CHROME` (đường dẫn Chrome), `FFMPEG`, `WORKERS` (số tab render song song, mặc định 4).

## Lưới nhịp (128 BPM, 1 beat = 0,46875 s, 15 s = 32 beat)

| Beat | Giây | Hình | Âm |
| --- | --- | --- | --- |
| 0–8 | 0–3,75 | Ma trận 3×3 (logo phóng to) sáng từng ô theo nốt piano; nhiễu pixel xuất hiện | Piano thưa, drone sub, hơi thở |
| 8–12 | 3,75–5,63 | Nhiễu dày dần, ma trận đổi thế mỗi beat | Nhịp tim, ostinato piano, đồng ca dâng, riser |
| 12 / 13 | 5,63 / 6,09 | Nhiễu → chữ **MAKE SENSE / OF DATA.** | Cú nhấn 1 (boom + piano trầm) / cú nhỏ |
| 16 | 7,50 | Cú nhấn, pixel-resolve 14 khung → `UNDERSTAND THE PROBLEM` | Hit lớn + chirp "nét dần" 14 nấc = 14 khung |
| 18 / 20 | 8,44 / 9,38 | `LOCK THE DEFINITIONS` / `BUILD & RECONCILE` | Ratchet click theo 9 hàng, chuông "khớp", snare/clap |
| 22 / 22,5 / 23 | 10,31 / 10,55 / 10,78 | `PUT INTO USE`: GHN Shopee → P&G → KA TTS (nét lại sau 5 khung) | Ba cú nhấn, chirp ngắn 5 nấc |
| 24 → 25,25 | 11,25 → 11,84 | **90.1% → 97.5%** đếm 6 nấc 1/32 | 6 nốt chuông thang ngũ cung đi lên, khoá bằng E6 + sub |
| 25,5 / 26 / 26,5 | 11,95 / 12,19 / 12,42 | MAKE trên game 2D, THINGS trên game 3D, WORK. trên nền lime | Tom + sub + đồng trầm; blip 8-bit dưới MAKE, whoosh dưới THINGS |
| 27 → 28 | 12,66 → 13,13 | Đen; 12,91 chỉ còn **một pixel lime** (ô đầu tiên của cả clip) | Cắt cứng 8 ms → im lặng thật ~240 ms → tick + hơi hút |
| 28 | 13,13 | Ngập lime, **VINH LUONG** hiện, logo tự sắp lại rồi dừng ở thế IDLE | Braam + sub + piano Am + đồng ca; 4 nốt kính theo 4 thế logo |
| 29 / 29,5 / 30 / 30,5 | 13,59 → 14,30 | DATA · PRODUCT · AI · SOLUTION bật từng chữ | Mỗi chữ một nốt chuông A5–C6–E6–A6 |

## Nội dung — nguồn kiểm chứng

- `VINH LUONG`, `vinhluong-here.vercel.app`: tên theo brief, URL từ `meta.url` trong `content/content.vi.ts` (tên đầy đủ trong nguồn là "Lương Thế Vinh").
- `DATA · PRODUCT · AI · SOLUTION`: người dùng chốt cho frame cuối, thay cho `BI & DATA ANALYST`.
- `MAKE SENSE OF DATA.` / `MAKE THINGS WORK.`: `prototype.hero.heading`.
- `LOGISTICS · E-COMMERCE`: dịch `prototype.hero.domain`.
- Bốn bước (`UNDERSTAND THE PROBLEM`, `LOCK THE DEFINITIONS`, `BUILD & RECONCILE`, `PUT INTO USE`): dịch `prototype.process`.
- `90.1% → 97.5%`, `PICKUP ON-TIME`, `VIETTEL POST · SHOPEE · 2021–2025`: case 3PL (`evidence`, `resultNote`). Không thêm con số nào khác.
- `REAL INTERFACE · DEMO DATA`: dịch `prototype.labels.demo`, đặt dưới ba ảnh app. Với ảnh KA TTS, nhãn này cần người dùng xác nhận là dữ liệu minh hoạ.
- `2D MINIGAME · BUILT INTO THIS PORTFOLIO` (route `/game`) và `3D OPEN WORLD · PERSONAL PROJECT`: theo mô tả của người dùng.
- Logo 3×3 và bốn "thế" đường chéo: `components/ui/BrandMark.tsx`. Font: Archivo Black, Space Grotesk, IBM Plex Mono. Màu `#d4f236` trên nền xanh đen.

## Nguồn âm và giấy phép

Không dùng mẫu âm bên ngoài, không có lời/voice. Mọi âm đều do `audio.py` tổng hợp (piano cộng partial lệch hoà âm, pad/đồng ca saw+formant, bass, trống, riser, impact, reverb tích chập tự sinh). Không có bản quyền bên thứ ba cần ghi; bản render và mã tổng hợp thuộc dự án này. Các gói CC0 của game (Kenney, OpenGameArt) **không** dùng ở đây.
