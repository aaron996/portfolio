# Radio của Vinh

Tham khảo radio ở `D:\Github\GHN`: một phần phát dùng chung cho app, widget có đĩa
xoay theo trạng thái phát thực tế, nhớ tắt âm và vị trí kéo. Portfolio dùng playlist
file nội bộ; mỗi người nghe điều khiển phiên của mình.

Widget giữ nền giấy, chữ mực và màu rêu của portfolio, nằm ở góc dưới bên phải.
Khi hero còn trong màn hình, vị trí mặc định được nâng lên để chừa nút cuộn;
vị trí người xem đã kéo được ưu tiên.
Tên bài, trạng thái và thời gian là thông tin chính; không mở bảng playlist.
Nút có vùng chạm 44px. Người xem kéo vùng đĩa/tên bài, hoặc focus vùng này rồi dùng
phím mũi tên (Shift để đi xa hơn); Home trả về góc mặc định. Thu gọn vẫn giữ nút âm.
Vị trí được giữ trong màn hình khi đổi kích thước; reduced motion dừng đĩa xoay.

## Phát nhạc

- `BackgroundMusic` ở root layout giữ một thẻ audio qua các route. Lần tương tác đầu
  mở khóa phát âm thanh; nếu browser chặn thì nút radio cho phép thử lại trực tiếp.
- **Vào app nhạc tắt** (âm lượng 35% khi bật) và **radio chưa hiện**. Radio chỉ hiện sau khi người
  xem xem MV ở hero và đóng lại — lúc đó nó hiện ở dạng đĩa thu nhỏ ở góc, nhạc vẫn tắt cho tới khi
  người xem bấm đĩa rồi bấm phát. Bật nhạc bằng nút loa trên nav cũng làm radio hiện (giữ dạng
  thu gọn/mở đã lưu). Kéo đĩa xuống để tắt thì radio ẩn lại. Không nhớ gì qua lần tải lại trang
  (`revealed` và `enabled` chỉ nằm trong `music.ts`).
  Tắt âm dừng phần phát; bật lại tiếp tục vị trí đang nghe.
- Intro, MV, phim case và `/game` xin nhường tiếng bằng `music.hold()`. Tạm dừng ngay
  để không chồng tiếng; hết các lý do giữ thì tiếp tục nếu người xem vẫn bật âm.
- Radio tiếp tục khi chuyển tab trình duyệt, tùy giới hạn phát nền của browser/OS.
- Hết bài tự chuyển sang bài tiếp theo, hết danh sách quay lại đầu. Playlist hiện
  chỉ có **How Long**, nên bài tự lặp và chưa hiện nút bài trước/tiếp theo.
- Media Session cung cấp tên bài và phím play/pause; khi có nhiều bài có thêm phím
  trước/sau. Đĩa chỉ xoay khi nhận sự kiện `playing` từ audio.
- Lỗi tải hoặc autoplay bị chặn hiện trạng thái riêng, có nút thử lại.

## Thêm bài

Đặt file nhạc vào `public/portfolio/`, thêm `{ id, title, src }` vào
`content.home.music.tracks` trong `content/content.vi.ts`. Khi có hơn một bài,
widget tự hiện nút trước/sau. Không đưa file hiệu ứng game/phim vào playlist.

Các nhãn hiển thị và trợ năng ở `content/`; trạng thái dùng chung ở
`components/music/music.ts`. `pf-radio-position` và `pf-radio-collapsed` lưu vị trí
và trạng thái thu gọn; thiếu hoặc lỗi localStorage vẫn dùng được với mặc định.
