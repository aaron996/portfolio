<img src="https://raw.githubusercontent.com/aaron996/portfolio/main/github-profile/assets/banner.png" alt="Lương Thế Vinh — BI &amp; Data Analyst. Define the metric. Automate the system. Solve the problem. Sáu năm vận hành logistics và thương mại điện tử: Shopee, GHN, J&amp;T Express, Maersk." width="100%">

<p align="center">
  <a href="https://vinhluong-here.vercel.app"><img alt="Portfolio" src="https://img.shields.io/badge/PORTFOLIO-D4F236?style=for-the-badge&labelColor=0A0A0A"></a>
  <a href="https://vinhluong-here.vercel.app/cv.pdf"><img alt="CV PDF" src="https://img.shields.io/badge/CV%20PDF-1E1E1C?style=for-the-badge&labelColor=0A0A0A"></a>
  <a href="https://www.linkedin.com/in/vinhluongg/"><img alt="LinkedIn" src="https://img.shields.io/badge/LINKEDIN-1E1E1C?style=for-the-badge&labelColor=0A0A0A"></a>
  <a href="mailto:luongthevinh996@gmail.com"><img alt="Email" src="https://img.shields.io/badge/EMAIL-1E1E1C?style=for-the-badge&labelColor=0A0A0A"></a>
</p>

Tôi chốt định nghĩa chỉ tiêu, dựng data model, rồi tự ship hệ thống sinh ra con số — và đứng sau con số đó khi có người hỏi lại.

Tôi bắt đầu từ vận hành, không phải từ kỹ thuật. Sáu năm ngồi trong logistics và thương mại điện tử dạy tôi một thứ mà không khoá học nào dạy được: biết khi nào một con số trông thì đúng nhưng thật ra sai, và sai ở khâu nào.

<img src="https://raw.githubusercontent.com/aaron996/portfolio/main/github-profile/assets/stats.png" alt="6+ năm vận hành và phân tích dữ liệu. 97.5% pickup on-time, từ 90.1% (Shopee × Viettel Post, 2021–2025, đã xác nhận). 4 hệ thống dữ liệu đang chạy production (GHN, Interdist, hiện tại). 300k đơn/ngày từng vận hành (J&amp;T Express × Shopee, 2020–2021)." width="100%">

---

## Việc đã làm

Năm case dưới đây chứng minh năm điều khác nhau, không phải năm dự án na ná nhau.

> [!NOTE]
> Các hệ thống này là công cụ nội bộ của GHN và Interdist nên repo để private và không có link demo công khai. Ảnh bên dưới chụp từ chính bản đang chạy production. Phần bối cảnh, các quyết định thiết kế và cách từng con số được tính ra nằm đầy đủ ở [portfolio](https://vinhluong-here.vercel.app).

<br>

### 01 · P&G Sales Operations Dashboard

**Interdist** · Sản phẩm end-to-end, một người · T5/2026 – nay · bán thời gian, từ xa, song song với GHN

> Tôi ship được một sản phẩm dữ liệu chạy thật — từ phỏng vấn nghiệp vụ tới production — một mình.

Hệ thống nội bộ gom doanh số từ các file Excel rời rạc thành một nguồn dữ liệu duy nhất, có phân quyền, có audit trail, và tự sinh báo cáo cho quản lý.

**85.563 giao dịch doanh số** · 41 cửa hàng · 176 SKU · 6 vùng · 8 tài khoản người dùng · Row Level Security bật trên toàn bộ 22 bảng

<img src="https://raw.githubusercontent.com/aaron996/portfolio/main/public/case-pg-dashboard.png" alt="Màn hình dashboard KPI với biểu đồ xu hướng và bảng chi tiết theo vùng" width="100%">

<table>
<tr>
<td width="50%"><img src="https://raw.githubusercontent.com/aaron996/portfolio/main/public/case-pg-import-preview.png" alt="Modal xem trước batch replace: so sánh dữ liệu hiện có và sau khi import, kèm lựa chọn cách xử lý dòng trùng" width="100%"></td>
<td width="50%"><img src="https://raw.githubusercontent.com/aaron996/portfolio/main/public/case-pg-target-preview.png" alt="Lịch chỉnh target theo ngày với bảng so sánh số trước và sau điều chỉnh" width="100%"></td>
</tr>
<tr>
<td><sub>Xem trước batch replace trước khi ghi đè</sub></td>
<td><sub>Điều chỉnh target theo ngày, có so sánh trước/sau</sub></td>
</tr>
</table>

`PostgreSQL (Supabase)` `SQL` `fact/dimension` `React 19` `TypeScript` `Vite` `Tailwind` `Express` `XLSX parsing` `Recharts` `Google OAuth` `Vercel`

<br>

### 02 · App điều hành hiệu suất Shopee

**Giao Hàng Nhanh (GHN)** · Sản phẩm nội bộ, từ báo cáo rời tới một app điều hành · 2026 – nay

> Sản phẩm tôi làm không dừng ở chỗ chạy được — nó được một team khác chọn nhúng vào hệ thống của họ.

Web app theo dõi ontime pickup/giao hàng của Shopee theo Miền/Vùng/Hub, theo lane và theo từng chặng leadtime — thay cho các bảng rời phải dựng lại tay mỗi lần điều hành cần xem.

**Control Tower SPE chọn nhúng app này làm tab sức khoẻ vận hành thay vì dựng lại** · 4 tab báo cáo trên cùng một nguồn

<table>
<tr>
<td width="50%"><img src="https://raw.githubusercontent.com/aaron996/portfolio/main/public/case-kas-shopee-matrix.png" alt="Màn hình tổng quan: bốn thẻ chỉ số ontime kèm ngưỡng target, dải cảnh báo hub cần can thiệp, và bảng ma trận tỷ lệ đúng giờ theo miền và vùng" width="100%"></td>
<td width="50%"><img src="https://raw.githubusercontent.com/aaron996/portfolio/main/public/case-kas-shopee-hub-drill.png" alt="Bảng ma trận mở rộng một vùng xuống từng hub, kèm nút copy bảng thành ảnh cạnh tiêu đề" width="100%"></td>
</tr>
<tr>
<td><sub>Ma trận ontime theo miền và vùng, kèm ngưỡng target</sub></td>
<td><sub>Mở một vùng xuống từng hub, copy bảng thành ảnh</sub></td>
</tr>
<tr>
<td><img src="https://raw.githubusercontent.com/aaron996/portfolio/main/public/case-kas-shopee-insight.png" alt="Tab Insight liệt kê chỉ số biến động và xếp hạng hub đáng chú ý, kèm ghi chú đây là tương quan chứ chưa phải quan hệ nhân quả" width="100%"></td>
<td><img src="https://raw.githubusercontent.com/aaron996/portfolio/main/public/case-kas-shopee-access-log.png" alt="Trang quản trị hiển thị danh sách người đã truy cập kèm số lượt, số người đang online và biểu đồ lượt truy cập bảy ngày" width="100%"></td>
</tr>
<tr>
<td><sub>Tab Insight — ghi rõ đây là tương quan, chưa phải nhân quả</sub></td>
<td><sub>Nhật ký truy cập, phân quyền theo allowlist</sub></td>
</tr>
</table>

`Supabase (Postgres)` `đồng bộ từ Google Sheet` `Vercel` `allowlist auth` `access log`

<br>

### 03 · Chuẩn hoá & tự động hoá báo cáo Key Account

**Giao Hàng Nhanh (GHN)** · Hệ thống dùng chung, toàn team Key Account · 2025 – nay

> Tôi chuẩn hoá được định nghĩa KPI cho cả một team — không chỉ cho báo cáo của riêng mình.

Một nguồn định nghĩa KPI duy nhất cho toàn team, và pipeline tự sinh báo cáo tuần từ dữ liệu thô — thay cho việc mỗi người tự viết query, tự dựng bảng, tự soạn file.

**Cùng một nguồn định nghĩa KPI phục vụ ba nhóm** — giám đốc vùng, team KA khách hàng, vận hành hub — mỗi nhóm một định dạng · 5 loại báo cáo đã chuẩn hoá

<img src="https://raw.githubusercontent.com/aaron996/portfolio/main/public/case-kas-monitor.png" alt="Dashboard theo dõi sản lượng, dự báo và năng lực theo tỉnh, cập nhật theo ngày" width="100%">

`Trino SQL` `Iceberg lakehouse` `Metabase` `n8n` `Google Apps Script` `LLM agent skills`

<br>

### 04 · Đơn trễ này là lỗi của kho nào

**Giao Hàng Nhanh (GHN)** · Business logic, từ log thô tới một kho chịu trách nhiệm · 2025 – nay

> Tôi biến tranh chấp giữa các bộ phận thành một quy tắc chạy được — và nói ra khi định nghĩa của người khác có lỗ.

Rule engine đọc log ra/vào kho của từng đơn bị khiếu nại quá hạn, rồi chỉ ra đúng một kho chịu trách nhiệm — thay cho việc mỗi bộ phận tự tra tay rồi tranh luận xem ai sai.

<img src="https://raw.githubusercontent.com/aaron996/portfolio/main/github-profile/assets/case-sla-flow.png" alt="Đường đi của rule engine: 01 log ra/vào kho (quét trùng, quét thiếu, thứ tự không chuẩn) → 02 gom episode, chuẩn hoá event trước khi suy luận → 03 chạy 4 quy tắc, vét cạn mọi đơn không lọc theo nhóm khiếu nại → 04 thứ tự ưu tiên, chạy lại luôn ra cùng kết quả → kết quả: đúng một kho, 1 dòng mỗi đơn kèm số ngày tồn và số quy tắc cùng vi phạm." width="100%">

Hai quyết định đáng kể nhất: **chạy cả bốn quy tắc trên mọi đơn** thay vì lọc theo nhóm khiếu nại do khách chọn — vì nhóm khiếu nại và vi phạm thật không buộc phải trùng nhau, chạy hẹp thì mọi ca lệch nhóm đều lặng lẽ trả về "không tìm thấy vi phạm"; và **thứ tự ưu tiên rõ ràng giữa các quy tắc** thay vì rule nào khớp trước thì thắng — vì đầu ra này dẫn tới chế tài với một bưu cục cụ thể, chỉ cần một lần kết quả không tái lập được là mất niềm tin của vận hành.

Trong lúc làm còn phát hiện một lỗi định nghĩa có sẵn: ngưỡng "tồn quá 2 ngày" thiếu ràng buộc ngày, đếm theo lịch hay theo 48 giờ cho ra hai tập kho vi phạm khác nhau, và phần lệch rơi đúng vào các ca sát ngưỡng — tức các ca dễ bị phản bác nhất.

`Trino SQL` `Iceberg` `log ra/vào kho` `rule priority` `event → episode`

<br>

### 05 · Hiệu suất đối tác vận chuyển 3PL

**Shopee** · Kết quả đã kiểm chứng, 4 năm · 2021 – 2025

> Con số cứng nhất trong portfolio này — đã được cả Shopee và đối tác vận chuyển xác nhận.

Hệ thống theo dõi KPI 3PL và cơ chế làm việc với đối tác.

<img src="https://raw.githubusercontent.com/aaron996/portfolio/main/github-profile/assets/case-3pl-uplift.png" alt="Pickup on-time của Viettel Post đi từ 90.1% năm 2021 lên 97.5% năm 2025, theo dõi trong 4 năm, Shopee và đối tác cùng xác nhận. Thang đo từ 88% đến 100%." width="100%">

Contact rate mỗi đơn giảm 15–20%. Khối lượng thủ công của team giảm khoảng 30% (đây là ước tính vận hành, không phải số đã đối chiếu).

`SQL` `Google Sheets` `Google Apps Script`

---

## Cách tôi làm

Một dashboard ở đây không đi thẳng từ query ra màn hình. Nó đi qua bảy mắt, và có mắt do team khác nắm:

```
chốt lại câu hỏi  →  tự viết query, tự kiểm output  →  nhờ team BI dựng job định kỳ
      →  đồng bộ sang CSDL ứng dụng  →  mô hình hoá lại cho ứng dụng
      →  dựng ứng dụng  →  deploy và vận hành
```

Mắt thứ ba là ràng buộc tổ chức, không phải lựa chọn kỹ thuật: tôi phải thiết kế trong năng lực và lịch của một team khác.

**Về AI:** tôi dùng AI-assisted coding để đi nhanh hơn ở phần dựng. Phần khó không nằm ở code — nó nằm ở chỗ quyết định cái gì đáng đưa vào và cái gì nên bỏ, và ở chỗ chịu trách nhiệm khi có người hỏi lại con số.

---

## Bộ kỹ năng

| Nhóm | |
|---|---|
| **Phân tích & truy vấn** | SQL (Trino/Presto, StarRocks, PostgreSQL) · Python · Excel/Google Sheets nâng cao · phân tích nguyên nhân gốc |
| **Mô hình hoá dữ liệu** | thiết kế fact/dimension · định nghĩa grain và khoá · dimension có hiệu lực theo thời gian · chuẩn hoá KPI dùng chung |
| **BI & báo cáo** | Metabase · Power BI · Looker Studio · dashboard cho cấp quản lý · báo cáo định kỳ tự động |
| **Chất lượng & đối chiếu** | validation ở biên · đối chiếu song song khi thay quy trình · đối chiếu số tiền hai chiều · entity resolution · test cho business rule · audit trail, RLS & phân quyền |
| **Tự động hoá** | n8n · Google Apps Script · LLM agent workflow · AI-assisted development |
| **Nghiệp vụ** | vận hành logistics & TMĐT · quản lý SLA và escalation · dự báo sản lượng · làm việc với stakeholder và đối tác |

---

## Kinh nghiệm

| | |
|---|---|
| **Giao Hàng Nhanh (GHN)** — Key Account Solution / Data Analyst | 2025 – nay |
| **Interdist** — Sở hữu dữ liệu & sản phẩm *(bán thời gian, từ xa)* | T5/2026 – nay |
| **Shopee** — Logistics Management Specialist | 2021 – 2025 |
| **J&T Express** — Key Account Specialist | 2020 – 2021 |
| **Maersk** — Export Care Business Partner | 2019 – 2020 |

---

## Nên gọi tôi khi

- Chỉ tiêu đang bị mỗi bên hiểu một kiểu
- Báo cáo còn dựng tay mỗi tuần
- Cần một người vừa chốt logic vừa ship được hệ thống

**Và khi không nên:** tôi không định vị mình là software engineer. Tôi là người xây hệ thống dữ liệu cho bài toán vận hành mình hiểu rõ.

---

<p align="center">
  <a href="https://vinhluong-here.vercel.app"><b>vinhluong-here.vercel.app</b></a> &nbsp;·&nbsp;
  <a href="mailto:luongthevinh996@gmail.com">luongthevinh996@gmail.com</a> &nbsp;·&nbsp;
  <a href="https://www.linkedin.com/in/vinhluongg/">LinkedIn</a>
</p>

<p align="center"><sub>Nhận dự án data product theo phạm vi rõ ràng, làm từ xa · cũng cân nhắc vị trí BI / Data Analyst</sub></p>
