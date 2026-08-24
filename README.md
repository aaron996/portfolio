# Portfolio — Lương Thế Vinh

Site tĩnh dựng bằng Next.js 15 (App Router) + Tailwind v4. Không có backend.

## Chạy local

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # kiểm tra trước khi deploy
```

Yêu cầu Node 18.18 trở lên.

## Sửa nội dung

**Toàn bộ chữ nằm trong `content/content.vi.ts`.** Không cần đụng vào component nào.

Không còn chỗ nào chờ điền. `meta.url` đang trỏ về `https://vinhluong-here.vercel.app`
(quyết định không mua domain riêng) — nếu sau này đổi domain thì sửa đúng một dòng đó,
vì nó là giá trị dùng cho thẻ OG khi dán link vào Zalo/LinkedIn.

### Cấu trúc một case study

Mỗi case trong mảng `cases` gồm:

| Trường | Ý nghĩa |
|---|---|
| `kind` | `product` / `system` / `outcome` — quyết định nhãn và màu khối |
| `ownership` | Phần mình làm và phần người khác làm. Để trống `notOwned` nếu làm một mình |
| `decisions` | Phần quan trọng nhất: vấn đề → vì sao khó → quyết định gì → thuật ngữ |
| `results` | Mỗi số bọc trong `{ value, todo }`. Còn `todo` thì site hiện nhãn "Chưa xác thực" |
| `media` | Chỗ đặt ảnh/video. `src: null` thì hiện khung hướng dẫn |

## Thay ảnh và video

1. Bỏ file vào `public/` (ví dụ `public/pg-dashboard.png`).
2. Trong `content.vi.ts`, sửa `src: null` thành `src: "/pg-dashboard.png"`.
3. Giữ `isDemoData: true` nếu ảnh dùng dữ liệu minh hoạ — site sẽ tự gắn nhãn.

**Trước khi chụp màn hình:** thay hết số liệu thật bằng dữ liệu demo, che tên cửa hàng, tên người dùng và mọi thông tin khách hàng.

## Thay CV và ảnh OG

- CV: đặt file tại `public/cv.pdf`
- Ảnh OG: đặt tại `public/og.png`, kích thước 1200×630

## Thêm tiếng Anh sau này

1. Copy `content/content.vi.ts` thành `content/content.en.ts`, dịch nội dung. Type giữ nguyên nên TypeScript sẽ báo nếu thiếu trường.
2. Chuyển `app/` vào `app/[locale]/`, đọc content theo `locale`.

Không component nào hardcode chữ tiếng Việt trừ vài nhãn điều hướng — sửa chúng cùng lúc.

## Deploy lên Vercel

1. Push repo lên GitHub.
2. Vercel → Add New Project → import repo → Deploy. Không cần cấu hình gì thêm.
3. Domain riêng: Vercel → Settings → Domains → thêm domain và làm theo hướng dẫn DNS.

## Ghi chú thiết kế

Hệ màu tối, nhấn lime. Đổi toàn bộ bảng màu trong khối `@theme` của `app/globals.css`:

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--color-ink-950` | `#0A0A0A` | nền chính |
| `--color-ink-900` | `#111110` | nền section xen kẽ |
| `--color-ink-700` | `#26261F` | viền card |
| `--color-paper` | `#F2F1EC` | chữ chính |
| `--color-mute` / `-2` / `-3` | xám nhạt dần | chữ phụ |
| `--color-lime` | `#D4F236` | nhấn, CTA, active state |

Font: Archivo cho heading (in hoa, tracking âm), Inter cho body.

**Cố ý không làm:**

- **Custom cursor** — hỏng accessibility và vỡ trên máy dùng chuột không chính xác.
- **Carousel dự án** — chỉ có 4 dự án; grid hiển thị hết, carousel thì giấu bớt.
- **Mascot / nhân vật 3D** — đã thử rồi bỏ (T8/2026): một con vật đáng yêu không nói gì về công việc. Thay bằng `HeroLattice`, xem bên dưới.
- **Dark/light toggle** — site vốn đã tối.

**Animation:** fade-up khi scroll, marquee ở hero và section lime, scroll progress bar, hover nâng card. Tất cả tự tắt khi trình duyệt bật `prefers-reduced-motion`.

**Vật thể 3D ở hero** (`components/ui/HeroLattice.tsx`, three.js qua react-three-fiber): ma trận cột trừu tượng — hình dạng của chính công việc (bảng chỉ tiêu hub × ngày, ô đạt ngưỡng thì sáng lime). Cuộn 150px đầu trang điều khiển cột dựng lên theo một đợt sóng chéo, kèm xoay nhẹ. Cố ý KHÔNG có nhãn và KHÔNG có số nào trên vật thể: nó lấy cảm hứng từ bảng thật, không phải biểu đồ dữ liệu thật — đặt số vào đó là bịa số. Với `prefers-reduced-motion` thì render sẵn trạng thái cuối, tĩnh hoàn toàn, `frameloop="demand"` nên không tốn GPU.

## Cấu trúc trang chủ

1. Hero — headline, vật thể 3D dựng theo cuộn, thẻ số liệu production, ticker công nghệ
2. Dải số liệu — 6+ năm, 97.5%, 4 hệ thống, 300k đơn/ngày
3. Case study nổi bật (P&G) — 5 quyết định + kết quả, link sang trang đầy đủ
4. AI-assisted, human-accountable — 3 card + quy trình 6 bước
5. Dự án khác — 3 card
6. Năng lực — 6 nhóm dạng pill
7. Kinh nghiệm — timeline
8. Value proposition — nền lime, marquee từ khoá
9. Liên hệ + footer

Đổi thứ tự bằng cách sửa `app/page.tsx`. Case nào hiện ở mục 3 thì đổi `featuredSlug` trong `content.vi.ts`.
