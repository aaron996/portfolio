# Ải Vận Hành — ưu tiên 2–4

## Luồng vào chơi và tiến độ

- Tutorial ở ải đầu: di chuyển tới x ≥ 160, nhảy thành công, chém trúng quái,
  giữ đỡ ít nhất 0,3 giây. Bấm chém vào không khí không hoàn tất bước chém.
- Có thể bỏ qua; hoàn tất hoặc bỏ qua được nhớ trên trình duyệt.
- Hạ trùm lưu ải tiếp theo và khôi phục kỹ năng tương ứng khi chọn Tiếp tục.
  Chơi lại từ đầu hoặc hoàn thành cả năm ải xóa lượt lưu.
- Save dùng `opsgame:progress-v1`; JSON hỏng và chỉ số ải ngoài phạm vi bị bỏ qua.
  Không cần tài khoản; nếu trình duyệt chặn localStorage, phiên chơi vẫn chạy.
- Khi trùm xuất hiện, checkpoint ghi trang bị hiện tại. Chết sẽ hồi đầy máu,
  phục hồi trang bị lúc bắt đầu trận, đặt lại máu trùm và nhiệm vụ, không hồi quái
  thường. Vị trí hồi sinh tránh toàn bộ vùng di chuyển của bẫy.
- Checkpoint thuộc phiên chơi; tải lại trang trở về đầu ải đã mở gần nhất.
- Khi còn tối đa hai quái, HUD chỉ tên con gần nhất và hướng trái/phải, kèm
  lên/xuống nếu khác tầng đáng kể.

## Năm nhiệm vụ

Cập nhật ải 2: xem [kho ba tầng](warehouse-vertical-plan.md). Kho Phân Loại mở nhiệm vụ ngay từ đầu, có checkpoint tại công tắc và không yêu cầu dọn sạch quái. Mô tả mở khóa boss theo thời gian dưới đây chỉ áp dụng các ải còn lại.

Tương tác khi đứng gần vòng đánh dấu: E hoặc nút hành động trên HUD. Nhiệm vụ mở
khi đã dọn hết quái thường. Vòng xanh nhạt/mũi tên là điểm kế tiếp; dấu tích biểu
thị điểm đã xử lý. Các ký hiệu là lớp chỉ dẫn canvas, không có sprite thiếu.

| Ải | Quyết định của người chơi | Tác động lên trận trùm |
| --- | --- | --- |
| Cảng Cát Lái | Đối chiếu CT-018 giữa ba mã gần giống | Mở sát thương 12 giây |
| Kho Phân Loại | Bật điện, cầu nâng lên tầng 2, nối A/B rồi xuống cổng ra | Công tắc tắt nguồn bắn, mở đường về; cổng ra gọi boss với sát thương mở sẵn |
| Sàn Điều Phối | Canh cửa sổ mở tuyến 2 giây trong chu kỳ 6 giây | San tải mở sát thương 10 giây và dừng cú lao |
| Phòng Dữ Liệu | Đơn hàng → bàn giao → kho nhận theo đúng thứ tự | Điểm chưa xử lý phát đạn nhắm người chơi; đủ chuỗi mở sát thương 10 giây |
| Xưởng Sản Phẩm | Bật chặn thiếu mã và trùng mã; bỏ kiểm tra xóa lựa chọn | Đủ hai quy tắc gỡ khóa sát thương đến hết trận |

Trùm chặn chém, bắn và đạn phản khi nhiệm vụ chưa mở. Đồng hồ nhiệm vụ dùng thời
gian mô phỏng nên dừng cùng game. Mỗi lần retry đặt lại nhiệm vụ. Sau chiến thắng,
bẫy ngừng hiển thị và điểm tương tác hiện hoàn tất trước bảng kết quả; lời kết
giải thích thay đổi trong thế giới game và dẫn tới vấn đề của ải kế tiếp.

Các tình huống tương tác là minh họa hư cấu trong game, không phải bản tái hiện
quy trình nghiệp vụ đầy đủ hoặc kết quả công việc mới.

## Âm thanh và giao diện

Audio V1 đã tích hợp cục bộ ngày 10/09/2026: nhạc Loop Town và ambience cảng cho
Ải 1, giữ nguyên dữ liệu ambience kho của Ải 2. Bộ 15 sample CC0 phục vụ 13 cue
dùng chung, gồm vung vũ khí, hạ quái, cảnh báo và dậm đất của boss. AudioContext
chỉ mở sau thao tác người dùng; mute được nhớ qua reload, pause làm im tiếng,
unmount dừng nguồn và đóng context. Chưa có thu âm diễn viên.

Kiểm tra Audio V1: 73/73 test, TypeScript, build và browser Start/pause/mute/restart/
Continue đã đạt. Người dùng giao quyền chọn asset; nghe chủ quan và loa điện thoại
thật chưa kiểm chứng. Chi tiết nguồn âm và giới hạn xác minh nằm trong
`game-audio-credits.md` và `game-audio-audition.md`; phần này chưa được commit/deploy.

Canvas giữ tỷ lệ 800:420 trong chế độ mở rộng. Màn dọc sẽ có khoảng trống để giữ
toàn bộ khung chơi; màn ngang có nút cảm ứng thành một hàng.

## Kiểm chứng ngày 08/09/2026

- `npm run test:game`: 48 bài qua, gồm traversal của năm ải, hạ cả năm trùm bằng
  chém không cần đạn sau khi mở nhiệm vụ, luật nhiệm vụ, pause, checkpoint, tutorial
  và vòng đời âm thanh.
- `npm run build`: production build qua, bao gồm kiểm tra TypeScript.
- Trình duyệt thực: tutorial hoàn tất qua di chuyển, nhảy, chém trúng và giữ đỡ;
  Continue tới ải 4 từ save mẫu; lượt mới xóa save; mute được nhớ khi tải lại.
- Production: save JSON hỏng, chỉ số âm và quá giới hạn không chặn nút Bắt đầu;
  âm nhảy được phát sau tương tác, mute ngăn âm tiếp theo.
- Kiểm tra hình ở desktop, 390×844 và 844×390; bảng tạm dừng và nút cảm ứng.
- Trang chẩn đoán local dùng engine thật: nối ba điểm truy nguồn mở cửa sổ tấn
  công; restart checkpoint đặt lại chuỗi. Trang này không được publish thành route.
- Chưa có lượt chơi thủ công liền mạch từ đầu tới cuối cả năm ải; các trận trùm
  và điều kiện thắng được kiểm tra bằng mô phỏng. Chưa đánh giá nghe chủ quan trên
  loa điện thoại thật.

Ảnh kiểm tra nằm trong `output/playwright/` (gitignored). Chạy chẩn đoán bằng
`node scripts/game-lab.cjs`; các nút Mission đưa tới checkpoint để kiểm tra riêng
từng cơ chế mà không thêm đường tắt vào game production.
