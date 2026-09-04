# Đưa README này lên trang profile GitHub

`README.md` ở thư mục này là **profile README** — nội dung hiện ở đầu trang
<https://github.com/aaron996>. Nó không được dùng bởi site Next.js; để ở đây vì ảnh
phải nằm trong một repo public thì GitHub mới hiện được.

## Ảnh lấy từ đâu

Mọi `<img>` trong README trỏ về `raw.githubusercontent.com/aaron996/portfolio/main/...`:

| Ảnh | Đường dẫn trong repo này |
|---|---|
| Banner, dải số liệu, sơ đồ rule engine, biểu đồ 3PL | `github-profile/assets/` |
| 8 screenshot sản phẩm | `public/` (đã có sẵn, dùng chung với site) |

**Vì trỏ vào nhánh `main`, ảnh chỉ hiện sau khi nhánh này được merge vào `main`.**
Trước lúc đó README sẽ hiện ảnh vỡ — đó là bình thường, không phải sai đường dẫn.

## Ba bước phát hành

1. Merge nhánh `claude/github-visual-portfolio-6v0du2` vào `main` (ảnh mới lên `main`).
2. Tạo repo **public** tên đúng bằng username: `aaron996/aaron996`, tick "Add a README file".
   GitHub sẽ hiện dòng "You found a secret!" — đó là dấu hiệu đặt tên đúng.
3. Chép toàn bộ nội dung `github-profile/README.md` vào `README.md` của repo đó, commit.

Sau này sửa chữ thì sửa ở cả hai nơi, hoặc coi file trong repo này là bản gốc rồi chép lại.

## Vẽ lại các ảnh tự dựng

Bốn ảnh trong `assets/` được dựng bằng HTML + Chromium headless, nguồn ở `src/`.

```bash
# cần: Chromium (sửa biến CHROME trong render.sh cho đúng máy), python3 + Pillow,
# và font Archivo + Inter đặt trong ~/.fonts (Google Fonts: ofl/archivo, ofl/inter) rồi fc-cache -f
cd github-profile/src
./render.sh banner.html   ../assets/banner.png          1600
./render.sh stats.html    ../assets/stats.png           1600
./render.sh sla-flow.html ../assets/case-sla-flow.png   1600
./render.sh uplift.html   ../assets/case-3pl-uplift.png 1600
```

`render.sh` chụp ba lượt: đo `#root` cao bao nhiêu → chụp với viewport dư 400px → cắt
xuống đúng chiều cao thật. Lượt dư là bắt buộc: Chrome headless **không vẽ phần đuôi
nội dung** khi viewport vừa khít, ảnh sẽ mất một hai dòng chữ cuối mà không báo lỗi gì.

Bảng màu lấy đúng từ khối `@theme` trong `app/globals.css` (`#0A0A0A`, `#111110`,
`#1E1E1C`, `#26261F`, `#F2F1EC`, `#A9A9A2`, `#6E6E68`, `#D4F236`). Đổi màu site thì
đổi luôn ở đây, nếu không hai bên sẽ lệch nhau.

## Hai việc còn phải người quyết

### 1. Địa chỉ site đang bị khai hai kiểu

| Nơi khai | Giá trị |
|---|---|
| `content/content.vi.ts` → `meta.url` (dùng cho thẻ OG) | `https://vinhluong-here.vercel.app` |
| Trường *Website* của repo `aaron996/portfolio` trên GitHub | `https://portfolio-woad-nu-85.vercel.app` |

README đang dùng `vinhluong-here.vercel.app` vì đó là giá trị site tự khai trong thẻ OG.
Nếu địa chỉ thật là cái còn lại thì sửa 4 chỗ trong `README.md` (2 badge, 1 link trong
khối NOTE, 2 link ở footer) và sửa `meta.url` cho khớp.

### 2. Dọn phần repo public

Trang profile không chỉ có README — bên dưới là danh sách repo. Hiện có 5 repo public,
phần lớn chưa có mô tả nên trang nhìn trống. Đề xuất cho từng repo:

| Repo | Mô tả nên đặt | Topics |
|---|---|---|
| `portfolio` | Portfolio cá nhân — Next.js 15, Tailwind v4, kèm minigame side-scroller | `nextjs` `typescript` `tailwindcss` `portfolio` |
| `kas_shopee_performance` | Web app theo dõi ontime pickup/giao hàng theo Miền/Vùng/Hub | `react` `supabase` `dashboard` `logistics` |
| `GHN` | *(đang là "All code GHN" — nên viết rõ hơn hoặc chuyển private)* | — |
| `portfolio-assets` | Ảnh và tài nguyên dùng cho portfolio | — |
| `Brown-Bear-Buddy-Releases` | *(repo rỗng — nên xoá hoặc đặt private)* | — |

Chọn **Pinned repositories** (tối đa 6, nút *Customize your pins* ở trang profile) — pin
những repo có mô tả tử tế, đừng pin repo rỗng.

Các repo còn lại đang private nên khách không thấy; README đã nói rõ điều đó trong khối
NOTE ở đầu mục "Việc đã làm" thay vì để người đọc tự thắc mắc.
