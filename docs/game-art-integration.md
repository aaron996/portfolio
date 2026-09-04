# Tích hợp art game — 04/09/2026

Đã nhập 64 ảnh quái từ `mob-v2-additions/complete-set/public/game`
và sinh thêm 10 ảnh thay placeholder bằng ImageGen tích hợp.
Tất cả file runtime nằm trong `public/game/`, engine sử dụng ở route `/game`.

Giữ nguyên engine, combo, bảng tạm dừng, 18 frame nhân vật và các asset
nền/trùm/vật phẩm đã hiệu chỉnh trên main (PR #15).

**Phân biệt số lượng:** thư mục runtime hiện có đúng 64 PNG quái, đủ 16 loại
theo ải × 4 khung, không thiếu và không thừa tên file.

10 ảnh vừa sinh: `fx/aura.png`, `fx/shot.png`, `fx/hit.png`, `fx/dust.png`,
`fx/ring.png`, `bg/ground.png`, `bg/platform.png`, `ui/gate.png`,
`ui/heart-full.png`, `ui/bossbar.png`. Prompt đầy đủ và nguồn ImageGen được lưu
trong [game-art-generated.json](game-art-generated.json).

## Hiển thị và chuyển động

- Thay khung chữ nhật quanh nhân vật bằng aura alpha, dùng sprite cho đạn,
  vệt chém, bụi tiếp đất, tia trúng đòn, vòng báo đòn và hạt lấp lánh.
- Bệ dùng hai đầu cố định và phần giữa co giãn, không kéo méo đầu bệ. Mặt đất lặp
  theo camera, cả 5 ải dùng chung bộ kết cấu công nghiệp.
- Cửa ải, tim đầy/mờ và khung máu trùm dùng ảnh. Gradient trời và phần fill
  của thanh máu/thời gian là hình học có chủ đích.
- Nhân vật giữ canvas 1024×1024 và rig theo đầu, neo chân (512,960) từ main.
- Khung chém thứ hai và vệt chém bắt đầu cùng thời điểm tính sát thương.
- Walker và flyer chạy đủ chu kỳ 1–4. Charger/rider dùng khung 3 khi lấy đà,
  khung 4 khi lao; shooter dùng khung 3 lúc ngắm và khung 4 khi giật lùi
  sau phát bắn. Khung 1–2 dùng cho chuyển động chờ.
- Bộ quái giữ canvas nguồn 512×512. Script đo vùng alpha, lưu điểm neo chân
  từng frame và kích thước tham chiếu chung cho mỗi loại trong
  `components/game/mob-sprite-metrics.json`, tránh padding làm quái lơ lửng.
- Trùm giữ logic `-hit`, `-tel` của main. Hitbox và hành vi chiến đấu giữ nguyên.
- PNG giữ alpha và nén bảng màu; 74 ảnh nhập/sinh chiếm 4.197 MB
  (4,197,304 byte).

Danh sách từng file, kích thước và nguồn: [game-art-import.json](game-art-import.json).
Các ảnh nguồn để ở thư mục gốc repo từ trước phiên làm việc được giữ nguyên.

## Kiểm tra

- `npx.cmd tsc --noEmit`, `npm.cmd run build`, `git diff --check`.
- Browser route `/game`: bắt đầu chơi, sprite và nền hiển thị; mobile viewport
  390×844 có nút nhảy/đánh, không tràn ngang, không có console error.
- Harness riêng dùng bản sao engine hiện tại: 134/134 ảnh runtime decode thành công,
  20 kiểm tra qua;
  kiểm tra đủ 64 đường dẫn quái, chu kỳ walker/flyer, lấy đà–lao của charger/rider,
  ngắm–giật lùi của shooter, đi, nhảy, tiếp đất, nhịp damage và cả 5 ải.
- Đã xem trực tiếp cả 5 nền, aura, slash, rider, boss-hit, vòng báo đòn và cổng.
- Đây là kiểm tra art và các tương tác liên quan; không phải lượt chơi hoàn tất
  toàn bộ 5 ải bằng tay.

## Chạy lại công cụ local

`node scripts/import-game-art.cjs <thư-mục-chứa-các-gói-output>` nhập lại asset.
Script dùng Sharp có sẵn trong dependency tree của Next.js, giữ nguồn nguyên bản,
ghi file tạm rồi rename để tránh khóa file PNG trên Windows.

`node scripts/preview-game-art.cjs` mở server review tại `http://127.0.0.1:3002`.
Các nút đổi ải/pose phục vụ kiểm tra. Hook kiểm tra chỉ được chèn vào bản engine
trong HTML local ở `output/playwright/`, không được đưa vào route production.
