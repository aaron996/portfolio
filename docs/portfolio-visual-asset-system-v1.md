# Portfolio visual asset system V1

Trạng thái: Homepage đã tích hợp và QA ba minh hoạ biên tập. Tài liệu này ghi nhận hệ đang chạy; các asset case study còn lại chưa được tạo.

## Mục tiêu

Portfolio là nơi chứng minh công việc vận hành và sản phẩm dữ liệu. Visual mới phải làm ba việc: neo nội dung khi một section dài, giải thích một hệ thống không thể công khai bằng screenshot, và tạo nhịp đọc giữa các bằng chứng thật. Visual không được thay screenshot thật, thay dữ liệu đã kiểm chứng, hoặc tạo ấn tượng rằng một mockup là sản phẩm đã ship.

Design read: portfolio BI/Data cho recruiter và khách thuê dự án, có ngôn ngữ operational-editorial tối, technical, gọn. Dials mục tiêu: `DESIGN_VARIANCE 6`, `MOTION_INTENSITY 4`, `VISUAL_DENSITY 5`.

## Quy tắc hệ thống

| Loại visual | Khi dùng | Nguồn |
| --- | --- | --- |
| Bằng chứng sản phẩm | Cần chứng minh UI hoặc tính năng đã tồn tại | Giữ screenshot thật hiện có |
| Bằng chứng hệ thống | Cần giải thích luồng, rule hoặc phạm vi nhưng không thể công khai màn hình nội bộ | Asset generate dạng editorial technical, không có UI giả hoặc số liệu |
| Nhịp đọc | Section giới thiệu, kỹ năng, liên hệ hoặc khoảng chuyển | Asset generate không chữ, có chủ thể liên quan trực tiếp |
| Khung thông tin | Result, decision, metadata, related case, accordion | DOM/CSS. Chỉ thêm một visual khi nó giúp trả lời câu hỏi của khung |

Không tạo hoặc sử dụng chân dung của chủ portfolio. Không tạo người, dashboard giả, số liệu giả, logo khách hàng giả, tên hub/seller/khách hàng, hoặc bảng có chữ không thể kiểm chứng. Ảnh generate luôn là minh hoạ hệ thống, không phải evidence; copy/alt phải nói rõ điều đó khi được render.

## Ngôn ngữ art chung

- Nền: deep green `#0c110e` đến `#23382c`, texture giấy hạt rất nhẹ và lưới kỹ thuật thưa.
- Accent: lime `#d4f236` chỉ là điểm tín hiệu; Maersk blue `#42b0d5` chỉ đánh dấu logistics/data-flow.
- Vật liệu: khối kho và parcel token trừu tượng, mặt sàn vận hành mờ, giấy in báo cáo, container xanh và đường tuyến. Chất liệu chỉ hỗ trợ quy mô hệ thống, không biến ảnh thành product photography.
- Góc máy: editorial documentary, elevated hoặc ngang tầm mắt, có một vùng thở rõ để copy HTML bám vào cạnh ảnh. Ưu tiên bối cảnh vận hành rộng, giấy tờ và vật liệu làm việc có chủ đích; tránh mô hình cơ khí, ray chuyển hướng, chi tiết brass và ảnh sản phẩm cô lập.
- Chữ trong ảnh: không có. Nhãn, số liệu và lời giải thích phải nằm trong DOM để dịch, truy cập bằng keyboard và không bị lỗi sinh ảnh.
- Định dạng: WebP chính, PNG chỉ khi transparency cần thiết. Hero/asset trên fold phải có `<Image>` width, height, `sizes` và reserved aspect ratio.

## Asset map

### Homepage

| Vị trí | Asset | Tỷ lệ xuất | Mục đích | Ghi chú integration |
| --- | --- | --- | --- | --- |
| Hero | Không tạo mới | - | Giữ container, keyboard và sensor bot 3D hiện có | Không cạnh tranh thêm một raster hero |
| Hai flagship card | Screenshot hiện có | 16:9 gần đúng | Evidence của P&G và GHN | Giữ caption “dữ liệu minh hoạ” |
| Kết quả 3PL | `carrier-transfer-bay.webp` | 16:9 | Băng tải và khu vực chuyển tải trong ánh đèn cuối ngày | Một minh hoạ bối cảnh, đặt trước phần kết quả. Không đại diện Shopee, Viettel Post hoặc một dự án cụ thể |
| Hệ thống và rule | Không tạo mới | - | Case link và rule nghiệp vụ là DOM/evidence hiện có | Không dùng visual để thay title/link từng case |
| Kinh nghiệm | `terminal-blue-hour.webp` | 16:9 | Bến container lúc chạng vạng, có vùng tối để nhịp đọc tiếp tục | Đặt một lần trước timeline. Mốc và text vẫn là DOM |
| Cách làm việc | `method-worktable.webp` | 16:9 | Bàn làm việc gồm route map, biểu mẫu, sổ tay và laptop | Một minh hoạ ngữ cảnh duy nhất trước bốn bước DOM, không có đường tiến trình hay bốn asset rời |
| Ba nhóm kỹ năng | Không tạo mới | - | Bằng chứng là các case link | Tránh gắn một ảnh trang trí lên mỗi nhóm kỹ năng |
| About | Không tạo mới | - | Duy trì phần tự sự và lời mời game là DOM | Không thêm ảnh chỉ để lấp khoảng trống |
| Liên hệ và game | Screenshot game thật, nếu có | 16:9 | Nối sở thích làm game với hệ thống vận hành thật | Không generate game screenshot giả |

### Case study chung

| Khung | Quy tắc visual |
| --- | --- |
| Header case | Một evidence asset hoặc system visual chiếm 35-45% desktop, sau H1. Không dùng riêng một hero image nếu case không có evidence thật |
| Context | Một crop system visual chỉ khi phần context dài hơn một paragraph; nếu ngắn, giữ text-only |
| Decision | Mỗi decision card vẫn là DOM. Dùng một `decision-strip` 16:9 cho cả nhóm, không generate một ảnh cho mỗi card |
| Flow | Dựng bằng DOM/SVG semantic trước. Raster texture đặt phía sau chỉ để tạo chiều sâu, không mang thông tin workflow duy nhất |
| Demo | Luôn ưu tiên screenshot thật. Asset generated chỉ là opening visual trước demo nếu screenshot không thể public |
| Results/ownership | Giữ DOM. Không dùng bar chart giả hoặc số trên ảnh |
| Related cases | Mỗi link có thumbnail từ asset pack tương ứng hoặc screenshot thật. Không dùng card chữ lặp lại |

### Map theo từng case

| Case | Evidence hiện có | Asset cần generate | Vai trò |
| --- | --- | --- | --- |
| P&G Sales Operations | Dashboard, import, target preview | `pg-pricing-layers.webp`, `pg-target-route.webp` | Hai visual giải thích giá theo hiệu lực và target theo lịch cửa hàng; không thay screenshot UI |
| App điều hành Shopee GHN | Matrix, hub drill, insight, access log | `ghn-control-tower-network.webp` | Opening visual nối các màn hình thành một control-loop, không tạo dashboard mới |
| Reporting KA | Một dashboard monitor | `ka-source-of-truth.webp`, `ka-distribution-loop.webp` | Neo cho semantic layer và pipeline phân phối, thay phần decision card quá chữ |
| Quy trách nhiệm đơn trễ | Không có screenshot công khai | `sla-event-trace.webp`, `sla-priority-path.webp` | Hai visual evidence-system bắt buộc: event trail đi qua các khu kho và route chịu trách nhiệm được chọn theo thứ tự rule. Phải đọc được như một hệ thống, không như máy móc hoặc sản phẩm vật lý |
| Hiệu suất đối tác 3PL | Không có screenshot công khai | `3pl-carrier-review.webp` | Một visual ngắn cho case result: carrier lane, exception note, feedback checkpoint. Không làm nó dài như full case |

Đợt homepage hiện tại có ba raster: `carrier-transfer-bay.webp`, `method-worktable.webp` và `terminal-blue-hour.webp`. Screenshot game thật vẫn là evidence riêng, không generate.

## Prompt contract cho asset case trong tương lai

Mọi prompt dùng phần lõi sau, sau đó thêm brief riêng của bảng trên:

> Restrained editorial visual for a Vietnamese logistics and data-operations portfolio. Show a credible operational setting with a single readable subject and generous negative space for nearby HTML copy. Deep forest green, matte industrial surfaces, off-white paper, restrained signal lime and Maersk-blue accents. No people, portraits, faces, hands, text, letters, numbers, dashboards, charts, logos, brands, watermarks, UI mockups, neon glow, glassmorphism, gradients, stock-photo look, product photography, macro machinery, rails, brass parts, diverters, gears, or laboratory apparatus. Landscape composition, 16:9 unless a placement specifies another ratio.

Mỗi asset cần thêm một câu mô tả chủ thể. Với `sla-event-trace.webp`, dùng: “three abstract warehouse zones connected by a parcel event trail; several neutral parcel markers pass through each zone, while one accountable route is selected in restrained signal lime and alternate routes recede into deep green; large spatial forms, sparse operational-map composition, dot and parcel markers only, with no marks resembling type”. Không dùng các từ `physical`, `brass`, `tactile`, `steel track`, `rail` hoặc `diverter` cho asset SLA.

### Gate riêng cho SLA

Reject ngay nếu kết quả có một hoặc nhiều dấu hiệu sau:

- Chủ thể chính là máy, ray, cơ cấu chuyển hướng, robot, dụng cụ bàn thao tác hoặc một product shot.
- Cần nhìn lớn mới hiểu đây là vận hành qua nhiều khu kho; thumbnail phải đọc được ba zone và một route được chọn.
- Route chịu trách nhiệm phụ thuộc vào chữ hoặc số được sinh trong bitmap để hiểu.
- Có màu brass/vàng kim loại thành accent chính thay vì lime là tín hiệu route.

Chỉ nhận asset khi nó đọc ngay là “hành trình event qua kho và đường chịu trách nhiệm được chọn”, còn chi tiết rule được HTML copy giải thích bên cạnh.

## Kích thước và performance budget

| Nhóm | Kích thước nguồn | File runtime tối đa | Tải |
| --- | --- | --- | --- |
| 16:9 desktop | 1600px wide | 400 KB WebP mục tiêu | `priority` chỉ nếu nằm trong 1.5 viewport đầu |
| 3:2 hoặc 4:3 | 1600×1067 hoặc 1440×1080 | 180 KB WebP | `loading="lazy"` dưới fold |
| Thumbnail related case | 960×640 | 90 KB WebP | lazy |
| Texture transparency | 1200×800 PNG/WebP | 70 KB | chỉ khi alpha thật sự cần |

Không tải đồng thời một batch asset chỉ để phủ trang. Homepage chỉ ưu tiên hero hiện tại và screenshot flagship đầu tiên; các image section còn lại lazy-load. Mỗi asset mới cần được nén và kiểm kích thước trước khi tích hợp.

## Schema và file đích

```text
public/portfolio/visuals/
  homepage/
  cases/pg/
  cases/ghn/
  cases/ka/
  cases/sla/
  cases/3pl/
  game/
.impeccable/prompts/
  <asset>.txt
docs/portfolio-visual-asset-system-v1.md
```

- Runtime filenames phải descriptive và lowercase kebab-case.
- Runtime WebP ở `public/`; prompt gốc nằm trong `.impeccable/prompts/<asset>.txt` và sidecar `public/.../<asset>.webp.json` trỏ về nguồn đó.
- Chỉ thêm `visuals` field vào content schema sau khi asset nào đã QA xong. Không tạo trước 16 URL placeholder.
- `alt` được viết khi biết chính xác asset cuối, bằng tiếng Việt và mô tả chủ thể, không mô tả cảm xúc.

## Trình tự cho asset case mới

1. Tạo contact sheet nhỏ cho tối đa bốn asset của một case trước khi generate bản cuối.
2. Chốt palette, vật liệu, camera và negative space qua screenshot inspection. Nếu một asset trông như fake dashboard, stock illustration, product photography hoặc mô hình cơ khí tabletop, bỏ và generate lại.
3. Chỉ generate asset case khi đã có placement và câu hỏi cụ thể mà screenshot thật chưa trả lời được.
4. Convert runtime copies sang WebP, kiểm pixel dimensions, alpha, file size và filename manifest.
5. Tích hợp từng nhóm vào case khi nó bổ sung được bằng chứng. Trên homepage, chỉ dùng một visual cho mỗi cụm cần nhịp đọc; ưu tiên screenshot thật, typography và cấu trúc HTML.
6. Browser review tại 390×844, 768×1024, 1280×800, 1440×900 cho homepage và cả năm case. Kiểm riêng `/game` để chắc global CSS không ảnh hưởng game.

## Acceptance gate trước khi merge

- Mỗi asset có một `placement` và `job` trong map này; asset không có job không được đưa vào repo.
- Screenshot thật luôn được phân biệt với “Minh hoạ hệ thống”.
- Không có human portrait, fake dashboard, fake metrics, nhận diện thương hiệu giả hay text sinh trong bitmap.
- Mỗi khung card vẫn đọc và thao tác được khi image bị lỗi hoặc JavaScript tắt.
- Không có crop mobile cắt chủ thể, overflow ngang hoặc LCP regression rõ rệt.
- Inspect ảnh thật sau generation, không suy từ prompt hay build pass.
- Không commit, push, merge hoặc deploy asset case mới trừ khi có yêu cầu riêng.
