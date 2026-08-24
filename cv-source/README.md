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

## Còn chờ Vinh xác nhận

- **Trình độ tiếng Anh**: đang ghi trơn `English`, chưa có mức. Bản cũ để
  placeholder `[professional working proficiency]` nên không dùng được. Điền mức
  thật vào dòng `Languages`.
- **Thời gian làm báo cáo**: bản cũ ghi `từ [~X hours] xuống [under Y minutes]`
  nhưng chưa có số đo. Câu hiện tại chỉ nói phần đã kiểm chứng được (chuẩn hoá
  chất lượng báo cáo). Có số đo thật thì thêm lại.

## Đã sửa so với bản cũ

- J&T Express: `Jan 2020 – Aug 2021` → `Oct 2020 – Aug 2021`
- Maersk: `Nov 2019 – Jan 2021` → `Aug 2019 – Sep 2020` (bản cũ chồng lấn với J&T)
- Bỏ hết 5 chỗ placeholder bôi vàng và 2 nhãn `[confirm dates]`
- Điền link LinkedIn thật
- Bullet TMS/ReportHub: đổi sang app điều hành hiệu suất Shopee — việc thật, có
  ticket (KAS-183, KAS-192) và có case trên portfolio
