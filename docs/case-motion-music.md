# Nhạc nền phim case — prompt Suno

Vinh tạo nhạc nền bằng Suno (2026-10-11). Chế độ Custom, bật Instrumental, dán prompt vào
"Style of Music"; dòng Exclude dán vào "Exclude styles". Mỗi phim chỉ dùng khoảng 40 giây —
cắt và căn nhịp khi trộn (BPM ghi trong prompt). Nhạc tạo bằng gói Suno miễn phí chỉ được dùng
phi thương mại; gói trả phí thì người tạo sở hữu bài.

File tải về đặt ở `output/motion-audio/music/<phim>.mp3` (không đưa lên git) — `interdist`,
`opspulse`, `cod`, `warehouse`, `shopee`. Có file là `python scripts/motion-sfx.py` tự trộn nhạc dưới
tiếng hiệu ứng (nhỏ hơn 9 dB, tự né khi có tiếng hiệu ứng). Muốn bắt đầu từ giây khác hay to/nhỏ
hơn thì chỉnh `films.<phim>.music` trong `docs/motion-audio-sources.json` (`start`, `gain`, `duck`).

Độ dài phim sau khi làm lại (2026-10-11): Interdist 39 giây, Ops Pulse 42 giây, COD 29 giây, Tìm kho
32 giây, Shopee 22 giây — bài Suno cần dài hơn phim một chút.

```text
Exclude: vocals, choir, EDM drop, dubstep, heavy guitar, epic trailer, sad piano, lo-fi
```

| Phim | Style of Music |
|---|---|
| Interdist | Playful cartoon explainer underscore, quirky pizzicato strings, bassoon and clarinet, ticking woodblock, starts busy and frantic, resolves into bright marimba and glockenspiel, optimistic, 112 BPM, instrumental |
| GHN Ops Pulse | Upbeat modern explainer, plucky synth and marimba, light claps and finger snaps, clean tech feel, curious opening, steady groove, bright uplifting finish, playful corporate, 118 BPM, instrumental |
| Rà soát COD | Light playful detective jazz, walking pizzicato upright bass, brushed drums, muted trumpet, finger snaps, sneaky and curious, then confident upbeat swing finish, cartoon, 100 BPM, instrumental |
| Tìm kho | Whimsical whodunit cartoon score, celesta and harpsichord, tuba and pizzicato, tiptoe rhythm, curious investigation, building to a bright reveal, 104 BPM, instrumental |
| Shopee | Energetic feel-good productivity montage, ukulele, glockenspiel, handclaps, groovy bass, starts slightly hectic then lifts into a triumphant celebratory chorus, 124 BPM, instrumental |
