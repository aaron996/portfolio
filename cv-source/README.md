# Nguồn CV

`cv.html` là bản dựng lại của CV, dùng để sinh `public/cv.pdf`. Có nó ở đây để
lần sau sửa CV không phải mở Canva/Word rồi export tay — sửa HTML, in lại là xong.

## In lại PDF

Cần Chromium (hoặc Chrome) và font Carlito (Ubuntu/Debian:
`apt-get install fonts-crosextra-carlito`; máy Windows có Calibri thì tự dùng
Calibri, cùng metric).

```bash
chromium --headless --disable-gpu \
  --print-to-pdf=public/cv.pdf --no-pdf-header-footer \
  cv-source/cv.html
```

Kiểm tra sau khi in: **phải vừa đúng 1 trang**. Nếu tràn sang trang 2 thì giảm
`line-height` của `body` hoặc `margin-top` của `li`, đừng giảm `font-size` xuống
dưới 10pt.

Lưu ý: hiện đã siết khá sát để nhét thêm Interdist — `line-height: 1.15`,
`li { margin-top: 0.8pt }`, lề dưới 16pt. Chỗ nới còn lại rất ít, nên lần sau
thêm nội dung thì tính tới việc **cắt một bullet cũ** thay vì siết tiếp typography.

Cách đo nhanh còn dư bao nhiêu chỗ (mở `cv.html` trong browser, chạy console):

```js
document.body.scrollHeight - 297 / 25.4 * 96  // âm là còn vừa 1 trang
```

## Đã sửa so với bản cũ

- **Trình độ tiếng Anh**: điền `working proficiency, TOEIC 600` (thay vì để trơn
  `English` hoặc placeholder `[professional working proficiency]` cũ).
- **Thời gian làm báo cáo**: thêm số đo `~70%` vào bullet AI reporting pipeline
  (thay cho placeholder `từ [~X hours] xuống [under Y minutes]` của bản cũ).
  Con số này cũng đã đồng bộ sang `content/content.vi.ts` (case KPI/báo cáo,
  `results[0]`) — trước đó portfolio ghi "từ hàng giờ xuống vài phút", tức mạnh
  hơn CV rất nhiều.
- **Title GHN**: `Key Account Specialist` → `Key Account Solution / Data Analyst`
  cho khớp với portfolio.
- **Thêm Interdist** (May 2026 – Present, part-time remote, 2 bullet). Trước đó
  portfolio có Interdist (experience + case study + logo) mà CV không có.
  Đặt **sau GHN** dù ngày bắt đầu mới hơn, vì GHN là vai trò full-time chính —
  để part-time lên đầu sẽ làm người đọc hiểu sai vai trò hiện tại.
- **Thêm link portfolio** (`vinhluong-here.vercel.app`) vào dòng contact, rút
  gọn địa chỉ (`Go Vap District, Ho Chi Minh City` → `Ho Chi Minh City`) để lấy
  chỗ. Domain có gạch nối nên phải set `white-space: nowrap` trên thẻ `<a>`,
  không thì trình duyệt/Chrome PDF sẽ bẻ dòng ngay tại dấu `-` giữa domain,
  trông như hai domain khác nhau.
- **Dòng contact về lại 1 dòng, link tô xanh**: link LinkedIn/portfolio đổi màu
  `#1155CC` cho nổi. Bỏ khoảng trắng thừa quanh dấu `|` (`&nbsp; | &nbsp;` →
  `&nbsp;|&nbsp;`) không đủ để về 1 dòng — nguyên nhân chính là cụm
  `vinhluong-here.vercel.app` có `nowrap` nên bị đẩy nguyên cụm xuống dòng 2
  dù dòng 1 còn dư chỗ (không đủ cho cả cụm). Fix bằng cách giảm
  `.contact { font-size }` 10pt → 9.3pt.
- J&T Express: `Jan 2020 – Aug 2021` → `Oct 2020 – Aug 2021`
- Maersk: `Nov 2019 – Jan 2021` → `Aug 2019 – Sep 2020` (bản cũ chồng lấn với J&T)
- Bỏ hết 5 chỗ placeholder bôi vàng và 2 nhãn `[confirm dates]`
- Điền link LinkedIn thật
- Bullet TMS/ReportHub: đổi sang app điều hành hiệu suất Shopee — việc thật, có
  ticket (KAS-183, KAS-192) và có case trên portfolio
