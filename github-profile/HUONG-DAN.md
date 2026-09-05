# Đưa trang github.com/aaron996 thành portfolio

**Đã phát hành.** Repo profile <https://github.com/aaron996/aaron996> đang chạy nội dung
của `repo/`, nhánh `main`.

Thư mục này là nguồn: `repo/` là bản sao đúng 1:1 của repo profile, `build-readme.mjs`
sinh ra `repo/README.md` từ `content/content.vi.ts`. Giữ lại để còn cập nhật được —
đừng xoá, vì xoá là mất luôn đường sinh lại README cho khớp với site.

```
github-profile/
├── HUONG-DAN.md        ← file này, KHÔNG đẩy lên repo profile
├── build-readme.mjs    ← sinh repo/README.md, KHÔNG đẩy lên repo profile
└── repo/               ← nội dung repo aaron996/aaron996, giữ khớp 1:1
    ├── README.md          (sinh ra, đừng sửa tay)
    ├── .gitattributes     (không tính src/ vào thống kê ngôn ngữ)
    ├── assets/            6 ảnh tự dựng + 8 screenshot + cv.pdf
    └── src/               nguồn HTML của 6 ảnh + render.sh
```

## Trang profile đứng độc lập

Đây là ràng buộc chính, đừng phá:

- **Mọi ảnh trỏ về `raw.githubusercontent.com/aaron996/aaron996/main/assets/`** — tức
  chính repo profile, không phải repo `portfolio`. Vì vậy `repo/assets/` có bản sao của
  8 screenshot và `cv.pdf` (gốc ở `public/` của repo này). Trùng lặp là cố ý: đổi lại là
  trang profile không phụ thuộc repo nào khác.
- **README không link sang site Vercel.** Toàn bộ chiều sâu — bối cảnh, 23 quyết định
  thiết kế, bảng kết quả kèm cách tính — nằm trong các khối `<details>` gập lại ngay
  trong README. Người đọc không phải rời trang GitHub.

Muốn thêm link sang site thì thêm một badge nữa ở khối `<p align="center">` đầu
`build-readme.mjs`, nhưng khi đó trang lại phụ thuộc site — cân nhắc.

## Cập nhật trang profile

Sửa nội dung ở `content/content.vi.ts` → sinh lại README → đẩy sang repo profile:

```bash
node github-profile/build-readme.mjs
git clone https://github.com/aaron996/aaron996 /tmp/prof
cp -r github-profile/repo/. /tmp/prof/
cd /tmp/prof && git add -A && git commit -m "cập nhật nội dung" && git push
```

README **được sinh ra**, đừng sửa tay — lần chạy `build-readme.mjs` sau sẽ ghi đè. Script
đọc thẳng `content/content.vi.ts` (transpile bằng `typescript` có sẵn trong
devDependencies) rồi dựng markdown.

Lý do sinh chứ không gõ tay: nguồn có 5 case, 23 quyết định, và mọi con số đều kèm
trường `method` cùng cờ `verified`. Chép tay từng đó chữ là chép sai — mà sai ở đây
nghĩa là con số trên profile lệch với con số trên site.

Chú thích ngắn dưới mỗi ảnh là phần **viết tay duy nhất** trong script, ở hằng
`CAPTIONS`, khoá theo `media.id`. Thêm ảnh mới vào `content.vi.ts` mà quên thêm chú
thích thì ảnh vẫn lên, chỉ là không có dòng mô tả.

## Vẽ lại 6 ảnh tự dựng

`banner.png`, `stats.png`, `pipeline.png`, `timeline.png`, `case-sla-flow.png`,
`case-3pl-uplift.png` được dựng bằng HTML + Chromium headless, nguồn ở `repo/src/`.

```bash
# cần: Chromium (sửa biến CHROME trong render.sh cho đúng máy), python3 + Pillow,
# font Archivo và Inter đặt trong ~/.fonts (Google Fonts: ofl/archivo, ofl/inter) rồi fc-cache -f
cd github-profile/repo/src
./render.sh banner.html   ../assets/banner.png          1600
./render.sh stats.html    ../assets/stats.png           1600
./render.sh pipeline.html ../assets/pipeline.png        1600
./render.sh timeline.html ../assets/timeline.png        1600
./render.sh sla-flow.html ../assets/case-sla-flow.png   1600
./render.sh uplift.html   ../assets/case-3pl-uplift.png 1600
```

`render.sh` chụp ba lượt: đo `#root` cao bao nhiêu → chụp với viewport dư 400px → cắt
xuống đúng chiều cao thật. Lượt dư là **bắt buộc**: Chrome headless không vẽ phần đuôi
nội dung khi viewport vừa khít, ảnh sẽ mất một hai dòng chữ cuối mà không báo lỗi gì.
Mọi phần tử phải nằm trong `<div id="root">` thì mới đo được.

Bảng màu lấy đúng từ khối `@theme` trong `app/globals.css` (`#0A0A0A`, `#111110`,
`#1E1E1C`, `#26261F`, `#F2F1EC`, `#A9A9A2`, `#6E6E68`, `#D4F236`). Đổi màu site thì đổi
luôn ở đây, nếu không hai bên lệch nhau.

## Việc còn lại

### 1. Đặt mô tả cho repo profile

Repo `aaron996/aaron996` hiện chưa có description (lúc tạo bỏ trống). Vào
<https://github.com/aaron996/aaron996> → nút ⚙️ cạnh mục *About* → điền, ví dụ:

> Lương Thế Vinh — BI &amp; Data Analyst. Define the metric. Automate the system. Solve the problem.

### 2. Dọn phần repo public

Trang profile không chỉ có README — bên dưới là danh sách repo, và đó là phần README
không che được. Hiện có 5 repo public, phần lớn chưa có mô tả nên trang nhìn trống.

| Repo | Mô tả nên đặt | Topics |
|---|---|---|
| `aaron996` | *(xem mục 1 ở trên)* | — |
| `portfolio` | Portfolio cá nhân — Next.js 15, Tailwind v4, kèm minigame side-scroller | `nextjs` `typescript` `tailwindcss` `portfolio` |
| `kas_shopee_performance` | Web app theo dõi ontime pickup/giao hàng theo Miền/Vùng/Hub | `react` `supabase` `dashboard` `logistics` |
| `GHN` | *(đang là "All code GHN" — nên viết rõ hơn hoặc chuyển private)* | — |
| `portfolio-assets` | Ảnh và tài nguyên dùng cho portfolio | — |
| `Brown-Bear-Buddy-Releases` | *(repo rỗng — nên xoá hoặc đặt private)* | — |

Rồi chọn **Pinned repositories** (tối đa 6, nút *Customize your pins* ở trang profile).
Pin `aaron996` lên đầu, và chỉ pin repo có mô tả tử tế — đừng pin repo rỗng.

Các repo còn lại đang private nên khách không thấy. README đã nói thẳng điều đó trong
khối NOTE ở đầu mục "Việc đã làm", thay vì để người đọc tự thắc mắc vì sao một người
viết mình ship 4 hệ thống mà trang GitHub trống trơn.
