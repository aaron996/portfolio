---
name: "Portfolio Lương Thế Vinh — theme giấy"
description: "Hệ thống hiện tại của homepage, case và vỏ trang game, trích từ code."
colors:
  ground: "#f3f1ea"
  surface: "#fbfaf6"
  text: "#161614"
  secondary: "#6b6960"
  line: "#d9d5c8"
  accent: "#1f5a3d"
  accent-hover: "#174a31"
  mark: "#dcf25a"
  night: "#0b0f14"
  night-text: "#eef0ee"
  night-muted: "#9aa3a8"
  night-line: "#263040"
typography:
  display:
    fontFamily: "Archivo Black, sans-serif"
    fontSize: "clamp(44px, 6vw, 96px)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "clamp(28px, 3.4vw, 44px)"
    fontWeight: 700
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
  metadata:
    fontFamily: "IBM Plex Mono, monospace"
rounded:
  control: "8px"
  card: "12px"
  tag: "999px"
spacing:
  gutter: "clamp(16px, 4vw, 48px)"
components:
  navigation-cv:
    backgroundColor: "{colors.text}"
    textColor: "{colors.ground}"
    rounded: "{rounded.control}"
    padding: "8px 14px"
  case-image:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
---

# Design System: Portfolio Lương Thế Vinh

## Overview

Portfolio hiện tại là một trang giấy ấm, chữ đen và màu nhấn xanh rêu. Hero biến các ô dữ liệu lộn xộn thành biểu đồ, danh sách công việc mở ảnh xem trước, dòng thời gian giải thích đường đi từ vận hành tới dữ liệu và sản phẩm. Ba bạn đồng hành là một phần của ngôn ngữ tương tác hiện có.

Tài liệu mô tả code hiện tại, thay cho bản ghi Phase 2 màu xanh tối. Phạm vi gồm homepage, toàn bộ case và phần nav/nội dung/footer của `/game`. Canvas, bảng hướng dẫn và HUD của minigame giữ hệ màu riêng; trang 404 dùng biến màu đêm.

Nguồn: [home.css](components/home/home.css), [case.css](components/case/case.css), [game.css](app/game/game.css), [fonts](components/portfolio/PortfolioFonts.ts), [intro.css](components/portfolio/intro.css) và [globals.css](app/globals.css). Kiểm tra local và trạng thái production được báo riêng, không suy ra từ tài liệu này.

## Colors

Nền `--bg` là giấy `#f3f1ea`; `--surface` sáng hơn cho vùng ảnh và khối nội dung. Chữ chính `--text` là `#161614`, chữ phụ `--muted` là `#6b6960`, đường chia `--line` là `#d9d5c8`.

Xanh rêu `--accent` dùng cho link, trạng thái đang chọn và focus; lime `--mark` dùng để tô headline và nhấn chi tiết. Footer, trang 404 và nền bao game dùng nhóm `--night`, `--night-text`, `--night-muted`, `--night-line`. Các biến dark/lime trong globals phục vụ game, không thay thế nhóm màu của `.home`.

## Typography

Archivo Black là chữ poster ở hero; Space Grotesk là chữ nội dung, heading và điều hướng; IBM Plex Mono dành cho metadata, năm và bộ đếm. Các font được khai qua `next/font` trong `PortfolioFonts.ts`. Archivo/Inter ở layout vẫn phục vụ typography của game và các utility toàn cục.

Hero dùng `clamp(44px, 6vw, 96px)`, line-height 1.02; ở màn nhỏ headline vẫn dùng cùng công thức, vị trí copy chuyển lên 6% từ breakpoint 640px. Heading section dùng `clamp(28px, 3.4vw, 44px)`. Kích thước chữ case và game là quy tắc riêng tại từng surface, không lấy cỡ chữ hero làm mặc định.

## Layout

Gutter chung là `clamp(16px, 4vw, 48px)`. Nav sticky ở đầu trang, z-index 50. Hero có canvas ở nền, headline và hành động ở trên. Danh sách công việc là các hàng có đường chia; ở màn nhỏ, bằng chứng kết quả nằm trong hàng thay vì cần hover để đọc.

Dòng thời gian cho phép cuộn ngang ở màn nhỏ. Case có heading, thông tin vai trò, ảnh bằng chứng rồi các mục nội dung; breakpoint của từng surface quyết định cách gom cột. Vỏ trang game rộng tối đa 960px và giữ một nền tối bao OpsGame.

Các vùng chạm được sửa trong đợt này (link quay lại case/game và nút 404) cao tối thiểu 44px. Giữ một skip link ở root layout, trỏ tới `#main`, hiện ở lớp 200 khi focus.

## Elevation & Depth

Giấy, khoảng trắng và đường chia tạo hierarchy chính. Ảnh có bóng mềm; CTA hero hiện có bóng lệch lime. Nav dùng nền giấy trong suốt nhẹ và backdrop blur. Dialog ảnh và video intro dùng modal native, nằm trên nội dung trang.

Footer hiện có sân đấu của các bạn đồng hành, với override riêng `--night: #12171f`, `--night-line: #2b3546`, `--night-muted: #a2abb6` trong `.hc`; hiệu ứng sân đấu giữ nguyên khi sửa UX/UI.

CursorLight toàn cục đã bỏ để tránh listener không mang lại hiệu ứng rõ trên nền giấy. Không thêm lại ánh sáng con trỏ của theme xanh tối. Hiệu ứng đèn pin của trang 404 là tương tác riêng của trang đó.

## Shapes

Thang bo góc: `--r-control: 8px` cho nút/select; `--r-card: 12px` cho card, ảnh và khối flow; 999px dành cho tag. Hình tròn, mắt/nhân vật và thanh progress nhỏ là hình học riêng của tương tác, không phải token card/control. Nút âm lượng intro giữ hình tròn. Lời nhắc cuộn `.hs-cue` dùng bo góc control 8px.

Ảnh case khai width/height theo file gốc trong `content/`, hiển thị width 100% và height auto. Giữ đúng tỷ lệ để ảnh lazy không đẩy nội dung khi tải xong.

## Components

Nav và link dùng focus outline rõ theo nền. Skip link chung hiện phía trên nav khi focus. Intro lần đầu vẫn tự phát, dùng `preload="metadata"`; session seen, bỏ qua, Escape và replay giữ hành vi hiện có. Autoplay có thể tải dữ liệu video để phát bất kể mức preload.

HeroSort chỉ chạy canvas/demo khi intro đã đóng, hero giao viewport và tab đang hiển thị; tạm dừng giữ các mốc thời gian để tiếp tục đúng nhịp. Số phần trăm vẫn hiển thị nhưng không là live announcement; vùng status riêng chỉ báo hoàn thành. Reduced motion cho biểu đồ ở trạng thái đã sắp.

CareerPath vẫn xem trước khi rê chuột; vùng status riêng chỉ cập nhật khi focus hoặc kích hoạt một chặng. Ảnh case mở dialog bằng nút có nhãn từ content. Game lấy nhãn màn chơi, tiến độ traversal và mẹo touch từ content, không thay phím bằng cách sửa chuỗi chung trong component.

## Do's and Don'ts

- Giữ chữ hiển thị và nhãn trợ năng trong `content/content.vi.ts`, có kiểu ở `content/types.ts`.
- Giữ caption, nhãn dữ liệu minh hoạ và giới hạn bằng chứng ngay cạnh nội dung liên quan.
- Kiểm tra keyboard, desktop và màn 375px trên production build local.
- Dùng token bo góc theo vai trò; bảo toàn hệ màu và hình ảnh game hiện có.
- Không mô tả theme xanh tối/robot 3D/CursorLight cũ như giao diện hiện tại.
- Không suy ra khả năng dùng screen reader, thiết bị thật hoặc production chỉ từ kiểm tra DOM/local.
