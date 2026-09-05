<img src="https://raw.githubusercontent.com/aaron996/aaron996/main/assets/banner.png" alt="Lương Thế Vinh — BI &amp; Data Analyst. Define the metric. Automate the system. Solve the problem. Sáu năm vận hành logistics và thương mại điện tử · Shopee · GHN · J&amp;T Express · Maersk." width="100%">

<p align="center">
  <a href="https://github.com/aaron996/aaron996/blob/main/assets/cv.pdf"><img alt="CV PDF" src="https://img.shields.io/badge/CV%20PDF-D4F236?style=for-the-badge&labelColor=0A0A0A"></a>
  <a href="https://www.linkedin.com/in/vinhluongg/"><img alt="LinkedIn" src="https://img.shields.io/badge/LINKEDIN-1E1E1C?style=for-the-badge&labelColor=0A0A0A"></a>
  <a href="mailto:luongthevinh996@gmail.com"><img alt="Email" src="https://img.shields.io/badge/EMAIL-1E1E1C?style=for-the-badge&labelColor=0A0A0A"></a>
</p>

Tôi chốt định nghĩa chỉ tiêu, dựng data model, rồi tự ship hệ thống sinh ra con số và đứng sau con số đó khi có người hỏi lại.

Tôi bắt đầu từ vận hành, không phải từ kỹ thuật. Sáu năm ngồi trong logistics và thương mại điện tử dạy tôi một thứ mà không khoá học nào dạy được: biết khi nào một con số trông thì đúng nhưng thật ra sai, và sai ở khâu nào.

<img src="https://raw.githubusercontent.com/aaron996/aaron996/main/assets/stats.png" alt="6+ năm vận hành &amp; phân tích dữ liệu. 97.5% pickup on-time, từ 90.1% (Shopee × Viettel Post · 2021–2025 · đã xác nhận). 4 hệ thống dữ liệu đang chạy production (GHN · Interdist · hiện tại). 300k đơn/ngày từng vận hành (J&amp;T Express × Shopee · 2020–2021)." width="100%">

---

## Việc đã làm

Năm case dưới đây chứng minh năm điều khác nhau: một sản phẩm tôi ship end-to-end một mình, một sản phẩm được team khác nhúng lại vào hệ thống của họ, một hệ thống tôi chuẩn hoá cho cả team, một rule engine tôi dựng ra từ tranh chấp giữa các bộ phận, và một con số kết quả đã được đối tác xác nhận.

> [!NOTE]
> Các hệ thống này là công cụ nội bộ của GHN và Interdist nên repo để private và không
> có link demo công khai. Ảnh bên dưới chụp từ chính bản đang chạy production, đã thay
> số thật bằng dữ liệu minh hoạ và che thông tin khách hàng. Mỗi case có một khối gập
> lại — mở ra là toàn bộ bối cảnh, từng quyết định thiết kế, và cách từng con số được
> tính, kèm nhãn phân biệt số đã xác thực với số còn là ước tính.

<br>

### 01 · P&G Sales Operations Dashboard

**Interdist** · Sản phẩm end-to-end · 1 người · T5/2026 – nay · Bán thời gian, làm từ xa, song song với công việc chính ở GHN

> Tôi ship được một sản phẩm dữ liệu chạy thật — từ phỏng vấn nghiệp vụ tới production — một mình.

Hệ thống nội bộ gom doanh số từ các file Excel rời rạc thành một nguồn dữ liệu duy nhất, có phân quyền, có audit trail, và tự sinh báo cáo cho quản lý.

**85.563 giao dịch doanh số** — 41 cửa hàng · 176 SKU · 8 tài khoản người dùng · đang chạy production `✓ đã xác thực`

<img src="https://raw.githubusercontent.com/aaron996/aaron996/main/assets/case-pg-dashboard.png" alt="Màn hình dashboard KPI với biểu đồ xu hướng và bảng chi tiết theo vùng" width="100%">
<sub>Dashboard KPI: tiến độ target, xu hướng, chi tiết theo vùng và kênh</sub>

<table>
<tr>
<td width="50%"><img src="https://raw.githubusercontent.com/aaron996/aaron996/main/assets/case-pg-import-preview.png" alt="Modal xem trước batch replace: so sánh dữ liệu hiện có và sau khi import, kèm lựa chọn cách xử lý dòng trùng" width="100%"></td>
<td width="50%"><img src="https://raw.githubusercontent.com/aaron996/aaron996/main/assets/case-pg-target-preview.png" alt="Lịch chỉnh target theo ngày với bảng so sánh số trước và sau điều chỉnh" width="100%"></td>
</tr>
<tr>
<td><sub>Xem trước batch replace trước khi ghi đè</sub></td>
<td><sub>Điều chỉnh target theo ngày, có so sánh trước/sau</sub></td>
</tr>
</table>

<details>
<summary><b>Bối cảnh, các quyết định, kết quả và cách tính</b></summary>

#### Bối cảnh

- Interdist phụ trách phân phối cho P&G qua nhiều kênh và vùng. Số liệu doanh số về dưới dạng file Excel rời rạc, mỗi nguồn một định dạng, và việc tổng hợp theo vùng / kênh / sản phẩm là công việc tay lặp lại mỗi kỳ.
- Quản lý cần xem tiến độ target nhanh, nhưng không dám tin số nếu chưa có người kiểm lại — vì mỗi người tổng hợp một kiểu và không ai truy được số nào đúng.

#### 6 quyết định đáng kể

**1. Tách category và SKU từ tiêu đề cột dạng CATEGORY.SKU**

*Vì sao cách hiển nhiên lại sai:* Bản thân mã SKU cũng chứa dấu chấm. Tách naive theo mọi dấu chấm sẽ sinh ra hàng loạt SKU sai — và mỗi SKU sai là một dòng doanh số bị tách khỏi sản phẩm gốc, làm phân mảnh toàn bộ số liệu mà không ai phát hiện.

*Quyết định:* Chỉ tách tại dấu chấm đầu tiên, phần còn lại giữ nguyên làm SKU. Viết test tự động phủ các mẫu tên thật, bao gồm cả các ca oái oăm nhất trong dữ liệu lịch sử.

`Khoá của dimension sản phẩm — sai khoá là hỏng toàn bộ bảng fact`

**2. Dữ liệu Excel bẩn: định dạng số, ngày tháng, ô thiếu**

*Vì sao cách hiển nhiên lại sai:* Cám dỗ lớn nhất là 'tự sửa cho xong'. Nhưng sửa im lặng nghĩa là một hôm nào đó báo cáo lệch mà không ai biết bắt đầu tìm từ đâu.

*Quyết định:* File lên trước vào bảng staging riêng, kiểm tra từng dòng ở đó, rồi mới được đẩy sang bảng giao dịch thật. Cái gì có quy tắc chắc chắn thì chuẩn hoá; còn lại từ chối import và báo lỗi cụ thể tới dòng, tới cột. Số sai bị chặn ở biên, không bao giờ chạm tới bảng fact.

`Staging rồi mới promote — data contract thay vì sửa ngầm`

**3. Giá khác nhau theo kênh, cửa hàng và khoảng thời gian**

*Vì sao cách hiển nhiên lại sai:* Nếu tính doanh thu bằng giá hiện tại, thì mỗi lần đổi giá là toàn bộ lịch sử doanh thu tự thay đổi theo. Báo cáo tháng trước in ra hôm nay sẽ khác báo cáo in tháng trước.

*Quyết định:* Lưu giá kèm khoảng hiệu lực, và định nghĩa rõ thứ tự ưu tiên: dòng giá riêng của cửa hàng ghi đè dòng giá mặc định toàn hệ thống. Doanh thu luôn tính theo giá đúng tại thời điểm phát sinh giao dịch, không phải giá hiện hành.

`Effective-dated dimension (tương đương SCD Type 2), có precedence rõ ràng`

**4. Phân bổ chỉ tiêu tháng thành chỉ tiêu ngày**

*Vì sao cách hiển nhiên lại sai:* Chia đều cho 30 ngày là sai. Cửa hàng có lịch hoạt động riêng, có ngày nghỉ, có ngoại lệ. Chia sai thì tiến độ hằng ngày trở nên vô nghĩa và quản lý mất niềm tin vào dashboard.

*Quyết định:* Hai tầng: trọng số theo thứ trong tuần cho từng cửa hàng từng tháng, và ngoại lệ theo đúng một ngày cụ thể ghi đè lên trọng số đó. Mọi điều chỉnh đi theo lô — có bản xem trước tác động, có audit trail, và hoàn tác được cả lô.

`Target allocation hai tầng: weekday weight + date override`

**5. Có nên lưu số thực đạt cạnh chỉ tiêu cho tiện truy vấn không**

*Vì sao cách hiển nhiên lại sai:* Lưu số dẫn xuất cạnh số gốc nghĩa là tạo ra hai nguồn sự thật cho cùng một con số. Chỉ cần một lần import muộn hoặc một lần sửa lịch sử là hai nơi lệch nhau — và lúc đó không ai biết nơi nào đúng.

*Quyết định:* Bảng chỉ tiêu chỉ lưu chỉ tiêu. Số thực đạt luôn được tính từ bảng giao dịch tại thời điểm đọc, không bao giờ lưu song song. Chậm hơn một chút, nhưng không bao giờ lệch.

`Không lưu số dẫn xuất — derived metric tính tại thời điểm đọc`

**6. Ai được sửa gì, và làm sao truy lại khi số lệch**

*Vì sao cách hiển nhiên lại sai:* Một hệ thống báo cáo mà ai cũng sửa được thì không phải nguồn sự thật, chỉ là một file Excel đắt tiền hơn.

*Quyết định:* Đăng nhập Google, phân quyền ba mức admin / user / pending. Mọi thao tác ảnh hưởng tới con số đều được ghi log kèm người thực hiện và thời điểm.

`Quản trị dữ liệu ở mức tối thiểu nhưng đủ dùng`

#### Phần tôi làm

- Phỏng vấn nghiệp vụ và chốt định nghĩa chỉ tiêu
- Thiết kế lược đồ dữ liệu (fact doanh số, dimension cửa hàng / sản phẩm / giá / target)
- Business rule: tách SKU, phân bổ target, chọn giá hiệu lực
- Xây toàn bộ ứng dụng (AI-assisted): frontend, backend, cơ sở dữ liệu, phân quyền
- Kiểm chứng đầu ra bằng dữ liệu thật trước khi phát hành
- Vận hành và xử lý phản hồi người dùng sau khi lên production

#### Không thuộc phần tôi

- Hạ tầng và bảo mật cấp doanh nghiệp của Interdist — tôi làm việc trong khuôn khổ có sẵn

#### Kết quả — và con số đó được tính ra sao

| Chỉ số | Giá trị | Cách tính |
|---|---|---|
| Thời gian tổng hợp một kỳ báo cáo | **~40–60 giờ / tháng được giải phóng** `≈ ước tính` | Ước tính thận trọng dựa trên quy trình của 3–4 PIC: thay thế thao tác tổng hợp Excel thủ công, giảm phụ thuộc công thức lặp lại, tập trung dữ liệu giá / chỉ tiêu / mapping cửa hàng. Sẽ được xác thực thêm bằng theo dõi thời gian sử dụng thực tế. |
| Khối lượng dữ liệu đang gánh | **85.563 giao dịch · 12.476 bản tổng hợp ngày · 569 dòng chỉ tiêu tháng** `✓ đã xác thực` | Nguồn: Postgres production của hệ thống Interdist, đếm trực tiếp. Bảng tổng hợp ngày được dẫn xuất từ bảng giao dịch, không nhập tay. |
| Người dùng | **8 tài khoản** `✓ đã xác thực` | Nguồn: Postgres production của hệ thống Interdist — số profile đang hoạt động, phân ba cấp quyền |
| Phạm vi master data | **41 cửa hàng · 176 SKU · 6 vùng · 2 kênh** `✓ đã xác thực` | Nguồn: master data trên hệ thống Interdist. Hệ thống đang được mở rộng cho các khách hàng khác của Interdist. |
| Kiểm soát truy cập | **Row Level Security bật trên toàn bộ 22 bảng** `✓ đã xác thực` | Nguồn: cấu hình RLS trên hệ thống Interdist. Phân quyền được thực thi ở tầng cơ sở dữ liệu, không chỉ ở tầng giao diện — người dùng không thể lách qua API để đọc dữ liệu ngoài phạm vi. |

#### Nhìn lại

> Sai lầm lớn nhất ở giai đoạn đầu là tôi build dashboard trước khi chốt xong định nghĩa chỉ tiêu. Kết quả là phải làm lại phần tính toán khi nghiệp vụ nói lại cho rõ. Từ đó tôi luôn viết định nghĩa ra giấy và cho người dùng xác nhận trước khi động vào code.
>
> Điều tôi sẽ làm khác đi là đo thời gian ngay từ đầu. Con số tiết kiệm 40–60 giờ mỗi tháng tới giờ vẫn là ước tính, vì tôi không bấm giờ một chu kỳ tổng hợp tay nào trước khi triển khai — mà chỉ cần vài lần bấm giờ ở tuần đầu là đã có mốc để so. Thiếu mốc đó thì kết quả rõ nhất của cả hệ thống lại đúng là phần duy nhất tôi không chứng minh được bằng số.

</details>

`PostgreSQL (Supabase)` `SQL` `Thiết kế lược đồ fact/dimension` `React 19` `TypeScript` `Vite` `Tailwind CSS` `Express` `XLSX parsing` `Recharts` `Google OAuth` `Vercel` `Automated tests cho business rules`

<br>

### 02 · App điều hành hiệu suất Shopee

**Giao Hàng Nhanh (GHN)** · Sản phẩm nội bộ · từ báo cáo rời tới một app điều hành · 2026 – nay · Công việc chính, toàn thời gian — yêu cầu từ quản lý trực tiếp

> Sản phẩm tôi làm không dừng ở chỗ chạy được — nó được một team khác chọn nhúng vào hệ thống của họ.

Web app theo dõi ontime pickup/giao hàng của Shopee theo Miền/Vùng/Hub, theo lane và theo từng chặng leadtime — thay cho các bảng rời phải dựng lại tay mỗi lần điều hành cần xem.

**Được team khác nhúng vào hệ thống của họ** — Control Tower SPE chọn nhúng app này làm tab sức khoẻ vận hành thay vì dựng lại `✓ đã xác thực`

<table>
<tr>
<td width="50%"><img src="https://raw.githubusercontent.com/aaron996/aaron996/main/assets/case-kas-shopee-matrix.png" alt="Màn hình tổng quan: bốn thẻ chỉ số ontime kèm ngưỡng target, dải cảnh báo hub cần can thiệp, và bảng ma trận tỷ lệ đúng giờ theo miền và vùng" width="100%"></td>
<td width="50%"><img src="https://raw.githubusercontent.com/aaron996/aaron996/main/assets/case-kas-shopee-hub-drill.png" alt="Bảng ma trận mở rộng một vùng xuống từng hub, kèm nút copy bảng thành ảnh cạnh tiêu đề" width="100%"></td>
</tr>
<tr>
<td><sub>Ma trận ontime theo miền và vùng, kèm ngưỡng target</sub></td>
<td><sub>Mở một vùng xuống từng hub, copy bảng thành ảnh</sub></td>
</tr>
<tr>
<td width="50%"><img src="https://raw.githubusercontent.com/aaron996/aaron996/main/assets/case-kas-shopee-insight.png" alt="Tab Insight liệt kê chỉ số biến động và xếp hạng hub đáng chú ý, kèm ghi chú đây là tương quan chứ chưa phải quan hệ nhân quả" width="100%"></td>
<td width="50%"><img src="https://raw.githubusercontent.com/aaron996/aaron996/main/assets/case-kas-shopee-access-log.png" alt="Trang quản trị hiển thị danh sách người đã truy cập kèm số lượt, số người đang online và biểu đồ lượt truy cập bảy ngày" width="100%"></td>
</tr>
<tr>
<td><sub>Tab Insight — ghi rõ đây là tương quan, chưa phải nhân quả</sub></td>
<td><sub>Nhật ký truy cập và phân quyền theo allowlist</sub></td>
</tr>
</table>

<details>
<summary><b>Bối cảnh, các quyết định, kết quả và cách tính</b></summary>

#### Bối cảnh

- Điều hành vùng và team Key Account cần nhìn ontime pickup và ontime giao hàng ở nhiều lát cắt khác nhau: theo miền/vùng/hub, theo seller lớn, theo ca trong ngày, theo lane. Mỗi lát cắt trước đó là một bảng dựng tay, và mỗi lần cần xem lại là dựng lại từ đầu.
- Hệ quả không nằm ở thời gian dựng bảng, mà ở nhịp điều hành: khi số chỉ có sau khi ai đó ngồi làm, thì cuộc họp sáng phải chờ, và bưu cục đang tụt chỉ tiêu chỉ được phát hiện muộn hơn một nhịp.

#### 4 quyết định đáng kể

**1. Control Tower của team khác cần đúng phần việc app này đang làm**

*Vì sao cách hiển nhiên lại sai:* Lựa chọn mặc định trong tổ chức là mỗi team dựng lại giao diện của mình — an toàn về quyền sở hữu, nhưng tạo ra hai bản báo cáo cùng chủ đề, và tới lúc chúng lệch nhau thì không ai biết bản nào đúng.

*Quyết định:* Thay vì dựng lại tab đó trong app của họ, nhúng thẳng app này vào Control Tower làm tab sức khoẻ vận hành. Một nơi tính số, hai nơi hiển thị — nên không có bản thứ hai để lệch.

`Tái sử dụng thay vì nhân bản — tránh hai nguồn sự thật cho cùng chỉ tiêu`

**2. Người dùng thật không mở dashboard — họ chụp màn hình gửi vào group**

*Vì sao cách hiển nhiên lại sai:* Điều hành bưu cục trao đổi trong group chat, không trong dashboard. Một app đẹp mà bắt người ta rời group để đăng nhập vào xem thì sẽ thua một tấm ảnh chụp bảng Excel — không phải vì nó tốt hơn, mà vì nó nằm đúng chỗ người ta đang làm việc.

*Quyết định:* Thiết kế theo đúng thói quen đó thay vì chống lại nó: chế độ toàn màn hình để trình chiếu trong họp, và một nút copy thẳng bảng thành ảnh để dán vào group chat (kèm xuất CSV khi cần số thô). App phục vụ luồng phân phối sẵn có, không đòi thay nó.

`Thiết kế theo kênh phân phối thật của người dùng`

**3. Số hiệu suất theo hub là số có người chịu trách nhiệm, không phải số công khai**

*Vì sao cách hiển nhiên lại sai:* Bảng này gọi tên bưu cục đang tụt chỉ tiêu. Mở rộng cho ai cũng xem được thì nó thành công cụ chỉ trích chéo giữa các đơn vị; khoá quá chặt thì lại không ai dùng. Và nếu có tranh cãi về một con số, câu hỏi đầu tiên luôn là ai đã xem bản nào, lúc nào.

*Quyết định:* Chỉ email trong danh sách cho phép mới truy cập được, kèm nhật ký truy cập để luôn trả lời được ai đã xem gì. Phân quyền đặt ở tầng dữ liệu chứ không chỉ ẩn trên giao diện.

`Access control + audit log cho báo cáo có tính quy trách nhiệm`

**4. Đường nạp dữ liệu của app bị chính chính sách bảo mật công ty cắt giữa lúc đang chạy**

*Vì sao cách hiển nhiên lại sai:* App vốn đọc thẳng link CSV export của Google Sheet từ browser. Cách đó chỉ chạy được khi Sheet để chế độ ai có link cũng xem được — và khi Workspace của công ty chặn share ra ngoài thì link trả về 401/403. Điểm mấu chốt: không có mức share nào cứu được cách gọi cũ, vì một request không đăng nhập thì không bao giờ mang theo cookie Google của người đang xem. Tức là phải đổi kiến trúc, không phải sửa một tuỳ chọn.

*Quyết định:* Giữ Google Sheet làm nơi nhập liệu, nhưng đổi chiều nạp: một Apps Script gắn trong chính file Sheet, chạy dưới quyền người sở hữu nên không phụ thuộc cấu hình share, đẩy dữ liệu theo lịch sang Supabase làm tầng phục vụ cho app. Đẩy thành từng dòng quan hệ chứ không phải một khối JSON, để dữ liệu đó còn query/join bằng SQL cho việc khác. Người nhập liệu không phải đổi gì.

`Tách nơi nhập liệu khỏi nơi phục vụ truy vấn`

#### Phần tôi làm

- Tầng dữ liệu: lược đồ Supabase và pipeline đồng bộ từ nguồn Google Sheet
- Bốn tab báo cáo (4 chỉ số theo Miền/Vùng/Hub, %Ca 1 theo lane, leadtime từng chặng, Insight) và toàn bộ logic lọc
- Xác thực, danh sách truy cập, nhật ký truy cập
- Toàn bộ giao diện: nhiều vòng chỉnh theme, responsive mobile, dark mode
- Copy bảng thành ảnh, xuất CSV, chế độ trình chiếu toàn màn hình
- Vận hành sau khi phát hành và xử lý lỗi phát sinh

#### Không thuộc phần tôi

- Định nghĩa các chỉ tiêu ontime pickup / ontime giao là chuẩn chung của công ty — tôi hiển thị và cắt lát chúng, không tự định nghĩa lại
- App Control Tower là sản phẩm của team khác — tôi chỉ sở hữu phần được nhúng vào

#### Kết quả — và con số đó được tính ra sao

| Chỉ số | Giá trị | Cách tính |
|---|---|---|
| Được tái sử dụng bởi team khác | **nhúng vào Control Tower SPE** `✓ đã xác thực` | Team xây Control Tower chọn nhúng app này làm tab sức khoẻ vận hành thay vì dựng lại giao diện tương đương. |
| Phạm vi báo cáo | **4 tab báo cáo trên cùng một nguồn** `✓ đã xác thực` | 4 chỉ số ontime theo Miền/Vùng/Hub (mở được tới từng hub) · %Ca 1 theo lane · leadtime từng chặng · Insight. Lọc theo vùng/miền, loại hub và khoảng ngày. Đối chiếu với repo app tại HEAD 24/08/2026. |
| Nguồn gốc yêu cầu | **yêu cầu từ quản lý, không phải dự án tự phát** `✓ đã xác thực` | Xuất phát từ yêu cầu của quản lý trực tiếp, không phải sản phẩm tôi tự nghĩ ra rồi đi thuyết phục. |
| Khối lượng công việc quy đổi | **~12–14 ngày công nếu làm thủ công** `≈ ước tính` | Ước tính nội bộ khi tách hạng mục lúc mở task, dùng để so sánh với cách làm không có AI hỗ trợ. Là ước tính công sức, không phải thời gian thực tế đã bỏ ra. |

#### Nhìn lại

> Thứ khiến app này được dùng không phải là biểu đồ, mà là nút xuất ảnh. Tôi mất vài vòng mới chấp nhận rằng người dùng sẽ không đổi chỗ làm việc của họ vì sản phẩm của mình — sản phẩm phải đi tới chỗ họ đang đứng.
>
> Được team khác nhúng lại là kết quả tôi thấy đáng giá nhất, nhưng nó cũng đổi bản chất công việc: từ lúc đó app không còn là công cụ riêng nữa mà thành một phụ thuộc của người khác. Nếu làm lại, tôi sẽ chốt trước cam kết về tính ổn định và cách thông báo thay đổi, thay vì để nó thành thoả thuận ngầm.

</details>

`Supabase (Postgres)` `pipeline đồng bộ từ Google Sheet` `Web app trên Vercel` `xác thực & phân quyền theo allowlist` `nhật ký truy cập`

<br>

### 03 · Chuẩn hoá & tự động hoá báo cáo Key Account

**Giao Hàng Nhanh (GHN)** · Hệ thống dùng chung · toàn team Key Account · 2025 – nay · Công việc chính, toàn thời gian

> Tôi chuẩn hoá được định nghĩa KPI cho cả một team — không chỉ cho báo cáo của riêng mình.

Một nguồn định nghĩa KPI duy nhất cho toàn team, và pipeline tự sinh báo cáo tuần từ dữ liệu thô — thay cho việc mỗi người tự viết query, tự dựng bảng, tự soạn file.

**Giám đốc vùng · team KA khách hàng · vận hành hub** — cùng một nguồn định nghĩa KPI phục vụ cả ba nhóm, mỗi nhóm một định dạng `✓ đã xác thực`

<img src="https://raw.githubusercontent.com/aaron996/aaron996/main/assets/case-kas-monitor.png" alt="Dashboard theo dõi sản lượng, dự báo và năng lực theo tỉnh, cập nhật theo ngày" width="100%">
<sub>Giám sát sản lượng, dự báo và năng lực theo tỉnh</sub>

<details>
<summary><b>Bối cảnh, các quyết định, kết quả và cách tính</b></summary>

#### Bối cảnh

- Team Key Account phục vụ các tài khoản lớn (Shopee Express, Shopee Bulky, TikTok Shop) với báo cáo hiệu suất định kỳ hằng tuần và hằng tháng.
- Mỗi người tự viết query, tự dựng bảng, tự soạn file. Kết quả là cùng một chỉ tiêu nhưng mỗi báo cáo ra một con số, và không ai truy được vì sao lệch.

#### 6 quyết định đáng kể

**1. Cùng tên chỉ tiêu, khác điều kiện lọc, khác mốc thời gian, khác cách xử lý đơn ngoại lệ**

*Vì sao cách hiển nhiên lại sai:* Khi định nghĩa KPI sống trong đầu từng người thay vì trong một nơi, thì mọi cuộc họp đều bắt đầu bằng việc đối chiếu số chứ không phải bàn hành động. Và không ai sai — vì không có bản gốc để so.

*Quyết định:* Xây SQL model trên Trino / Iceberg làm nguồn định nghĩa duy nhất: một chỉ tiêu, một điều kiện lọc, một mốc thời gian. Báo cáo của cả team đọc từ đó thay vì từ query riêng.

`Semantic layer — một định nghĩa KPI cho toàn team`

**2. Mỗi người prompt LLM một kiểu, ra một số**

*Vì sao cách hiển nhiên lại sai:* Khi ai cũng dùng LLM để viết query, sai lệch không giảm mà tăng — vì giờ mỗi người có một trợ lý riêng, hiểu nghiệp vụ theo một cách riêng.

*Quyết định:* Đóng gói định nghĩa KPI, schema bảng và quy tắc nghiệp vụ thành skill dùng chung. LLM không tự đoán nữa mà đọc từ một nguồn duy nhất — cùng câu hỏi, cùng câu trả lời, bất kể ai hỏi.

`Context engineering — chuẩn hoá ngữ cảnh thay vì chuẩn hoá prompt`

**3. Tin được báo cáo do AI sinh ra tới đâu**

*Vì sao cách hiển nhiên lại sai:* Một báo cáo sai gửi tới khách hàng lớn thì thiệt hại không nằm ở con số, mà ở niềm tin — và niềm tin mất rồi rất khó lấy lại.

*Quyết định:* Mọi rule đều chạy song song với cách tính cũ và phải giải thích được từng chỗ lệch trước khi phát hành. Chưa đối chiếu xong thì chưa gửi.

`Đối chiếu song song (parallel run) trước khi thay thế quy trình cũ`

**4. Lấy gì làm định danh cho một seller**

*Vì sao cách hiển nhiên lại sai:* Báo cáo theo seller chỉ đúng khi mỗi seller là đúng một thực thể. Nếu chọn khoá mà không kiểm coverage trước, thì một seller có thể bị đếm thành hai, hoặc hai seller gộp thành một — và sai lệch này không lộ ra ở tổng, chỉ lộ ra khi khách hàng soi từng dòng.

*Quyết định:* Chốt một khoá định danh duy nhất, xác nhận tỷ lệ coverage trên dữ liệu thật, và verify riêng điều kiện lọc phân định luồng đơn trước khi cho phép bất kỳ báo cáo nào chạy trên nó.

`Entity resolution — chốt khoá và đo coverage trước khi báo cáo`

**5. Hạ tầng truy vấn đổi engine, hàng loạt data job đang trỏ vào chỗ cũ**

*Vì sao cách hiển nhiên lại sai:* Đổi engine mà bê nguyên query sang là cách nhanh nhất để có một dashboard vẫn chạy nhưng ra số khác — vì cú pháp chạy được không có nghĩa là ngữ nghĩa giữ nguyên.

*Quyết định:* Chuyển từng sheet một, và mỗi sheet đều đối chiếu số cũ với số mới trước khi cắt nguồn. Sheet nào chưa khớp thì chưa chuyển.

`Migration theo lô có đối chiếu, không cutover một lần`

**6. Báo cáo vẫn phải chờ có người bấm chạy**

*Vì sao cách hiển nhiên lại sai:* Một pipeline cần người trực thì nó chưa phải hệ thống, chỉ là một script có chủ. Tuần nào người đó nghỉ là tuần đó báo cáo trễ, và cả team quay lại làm tay.

*Quyết định:* Vòng chạy định kỳ qua n8n và Google Apps Script gửi thẳng tới stakeholder. Người chỉ can thiệp khi hệ thống chủ động báo bất thường — không phải khi có người nhớ ra.

`Automation có cảnh báo, không phải automation im lặng`

#### Phần tôi làm

- Chốt định nghĩa KPI dùng chung cho toàn team, gồm cả định danh seller và điều kiện phân luồng đơn
- Xây SQL model trên Trino / Iceberg làm nguồn duy nhất
- Đóng gói quy tắc nghiệp vụ thành agent skill để LLM sinh đúng query và đúng báo cáo
- Xây web app theo dõi sản lượng multi-KPI (actual vs forecast vs AOP, theo client và theo tỉnh), thay cho các file Excel/HTML rời rạc
- Chuyển data job của dashboard sang engine truy vấn mới, đối chiếu từng sheet trước khi cắt nguồn
- Tự động hoá vòng chạy định kỳ và phân phối báo cáo

#### Không thuộc phần tôi

- Hạ tầng lakehouse do team Data Platform vận hành — tôi là người tiêu thụ và mô hình hoá trên đó

#### Kết quả — và con số đó được tính ra sao

| Chỉ số | Giá trị | Cách tính |
|---|---|---|
| Thời gian soạn một báo cáo | **giảm ~70% thời gian làm tay** `≈ ước tính` | Ước lượng của người trực tiếp làm, so sánh quy trình soạn tay trước đây với pipeline hiện tại. Chưa đo bằng time-tracking thực tế nên vẫn để là ước lượng. |
| Tính nhất quán | **một định nghĩa KPI cho toàn team** `✓ đã xác thực` | Thay cho tình trạng mỗi người một cách tính, không truy được nguồn lệch |
| Nhóm người dùng | **điều hành vùng · KAM/KAC khách hàng · các team vận hành khác** `✓ đã xác thực` | Cùng một SQL model chuẩn hoá phục vụ ba định dạng đầu ra khác nhau: báo cáo tuần DOCX, dashboard theo dõi hằng ngày, và bản gửi group điều hành. |
| Số loại báo cáo đã chuẩn hoá | **5 loại báo cáo** `✓ đã xác thực` | Đếm trực tiếp số loại báo cáo định kỳ đang chạy qua pipeline này |

#### Nhìn lại

> Bài học lớn nhất: vấn đề không phải là viết query nhanh hơn, mà là làm sao để mọi người viết ra cùng một con số. Chuẩn hoá ngữ cảnh có giá trị hơn chuẩn hoá công cụ.

</details>

`Trino SQL` `Iceberg lakehouse` `Metabase` `LLM agent skills` `n8n` `Google Apps Script`

<br>

### 04 · Đơn trễ này là lỗi của kho nào

**Giao Hàng Nhanh (GHN)** · Business logic · từ log thô tới một kho chịu trách nhiệm · 2025 – nay · Công việc chính, toàn thời gian

> Tôi biến tranh chấp giữa các bộ phận thành một quy tắc chạy được — và nói ra khi định nghĩa của người khác có lỗ.

Rule engine đọc log ra/vào kho của từng đơn bị khiếu nại quá hạn, rồi chỉ ra đúng một kho chịu trách nhiệm — thay cho việc mỗi bộ phận tự tra tay rồi tranh luận xem ai sai.

**4 quy tắc · mọi đơn · đúng một kho** — quy tắc do vận hành chốt · cùng một đơn chạy lại luôn ra cùng kết quả `✓ đã xác thực`

<img src="https://raw.githubusercontent.com/aaron996/aaron996/main/assets/case-sla-flow.png" alt="Đường đi của rule engine: 01 log ra/vào kho (quét trùng, quét thiếu, thứ tự không chuẩn) → 02 gom episode, chuẩn hoá event trước khi suy luận → 03 chạy 4 quy tắc, vét cạn mọi đơn không lọc theo nhóm khiếu nại → 04 thứ tự ưu tiên, chạy lại luôn ra cùng kết quả → kết quả: đúng một kho, 1 dòng mỗi đơn kèm số ngày tồn và số quy tắc cùng vi phạm." width="100%">

<details>
<summary><b>Bối cảnh, các quyết định, kết quả và cách tính</b></summary>

#### Bối cảnh

- Một đơn quá hạn đi qua nhiều kho: kho lấy, kho luân chuyển, kho giao, và có thể cả kho trả. Khi khách hàng mở khiếu nại đền bù, câu phải trả lời là kho nào đã giữ hàng quá lâu — và câu trả lời đó dẫn tới chế tài thật với một bưu cục thật.
- Trước đó, câu trả lời phụ thuộc vào bộ phận nào tra log nhanh hơn và lập luận thuyết phục hơn. Cùng một đơn, hai người tra có thể ra hai kho khác nhau — nên kết luận nào cũng bị phản bác được, và cuộc họp nào cũng quay lại từ đầu.

#### 5 quyết định đáng kể

**1. Nhiều quy tắc cùng đúng trên một đơn, nhưng chỉ được chọn một kho**

*Vì sao cách hiển nhiên lại sai:* Nếu để rule nào khớp trước thì thắng, kết quả sẽ đổi theo thứ tự dữ liệu — cùng một đơn chạy lại có thể ra kho khác. Mà đầu ra này dẫn tới chế tài với một bưu cục cụ thể, nên chỉ cần một lần kết quả không tái lập được là mất luôn niềm tin của vận hành.

*Quyết định:* Định nghĩa thứ tự ưu tiên rõ ràng giữa các quy tắc và áp dụng nhất quán. Bốn quy tắc được chốt cùng vận hành, mỗi quy tắc gắn với một khâu cụ thể và một ngưỡng tồn cụ thể. Một đơn chỉ có đúng một kho chịu trách nhiệm.

`Rule priority — kết quả xác định, không phụ thuộc thứ tự dữ liệu`

**2. Có nên chỉ chạy các quy tắc thuộc đúng nhóm khiếu nại của đơn đó**

*Vì sao cách hiển nhiên lại sai:* Cách tự nhiên nhất là đơn bị khiếu nại 'quá hạn giao' thì chỉ chạy các quy tắc nhóm giao. Nhưng nhóm khiếu nại do phía khách chọn, còn vi phạm thật nằm ở chỗ dữ liệu chỉ ra — hai thứ đó không buộc phải trùng nhau. Chạy hẹp theo nhóm nghĩa là mọi ca lệch nhóm đều lặng lẽ trả về 'không tìm thấy vi phạm', và không ai biết mình đang bỏ sót.

*Quyết định:* Chạy cả bốn quy tắc trên mọi đơn, bất kể đơn đó thuộc nhóm khiếu nại nào, rồi đếm số quy tắc cùng vi phạm trên từng đơn. Nhờ vậy bắt được đúng loại ca mà cách làm hẹp bỏ sót: đơn khiếu nại 'quá hạn giao' nhưng vi phạm thật nằm ở khâu trả hàng.

`Đánh giá vét cạn thay vì lọc theo nhãn đầu vào`

**3. Log ra/vào kho có nhiễu: quét trùng, quét thiếu, thứ tự không chuẩn**

*Vì sao cách hiển nhiên lại sai:* Quét trùng làm một lần nhập kho trông như hai; quét thiếu làm đơn trông như chưa bao giờ rời kho. Cả hai đều dẫn tới quy sai trách nhiệm — và quy sai một lần là mất luôn sự hợp tác của kho đó.

*Quyết định:* Gom log thành các episode nhập/xuất có ý nghĩa nghiệp vụ trước khi áp rule, thay vì chạy rule thẳng trên từng dòng log.

`Chuẩn hoá event thành episode trước khi suy luận`

**4. 'Tồn quá 2 ngày' nên đếm theo ngày trên lịch hay theo 48 giờ trôi qua**

*Vì sao cách hiển nhiên lại sai:* Hai cách đếm cho ra hai tập kho vi phạm khác nhau, và phần lệch rơi đúng vào các ca sát ngưỡng — tức các ca dễ bị phản bác nhất. Đây là loại chi tiết không ai hỏi tới lúc thiết kế, nhưng là chỗ đầu tiên bị chất vấn khi một bưu cục không đồng ý với kết luận.

*Quyết định:* Đếm theo ngày trên lịch, vì kho vận hành theo ngày và theo chuyến luân chuyển trong ngày, không theo đồng hồ bấm giây từ lúc quét. Chọn xong thì ghi thẳng vào định nghĩa chỉ tiêu, để lần sau không ai phải đoán lại.

`Grain của ngưỡng thời gian — calendar day, không phải elapsed hours`

**5. Vận hành kết luận seller bàn giao trễ nên đơn về kho giao trễ — dựa trên một định nghĩa thiếu ràng buộc**

*Vì sao cách hiển nhiên lại sai:* Chỉ tiêu họ dùng đo 'đơn vào kho trung chuyển trước 22h30', nhưng không ràng buộc đó phải cùng ngày với lúc lấy hàng. Một đơn lấy hôm nay, vào kho trung chuyển 22h00 hôm sau vẫn được tính là đạt. Định nghĩa lỏng như vậy làm chỉ tiêu trông cao hơn thực tế, và mọi kết luận rút ra từ nó đều chỉ về phía seller.

*Quyết định:* Không phản bác bằng lời. Dựng lại chỉ tiêu theo cả hai định nghĩa — bản lỏng họ đang dùng và bản chặt có ràng buộc cùng ngày — rồi đặt cạnh nhau trên cùng tệp dữ liệu để khoảng lệch tự nói. Song song tách riêng ba khâu bàn giao / trung chuyển / giao để thấy khâu nào thật sự đóng góp vào trễ, chạy cho cả tệp seller VIP và toàn bộ seller.

`Audit định nghĩa chỉ tiêu — một ngưỡng thời gian cần ràng buộc grain ngày`

#### Phần tôi làm

- Phỏng vấn vận hành để diễn giải bốn quy tắc quy trách nhiệm thành logic chạy được, và chốt thứ tự ưu tiên giữa chúng
- Thiết kế cách dựng episode nhập/xuất kho từ log thô
- Xây pipeline Trino sinh một dòng kết quả cho mỗi đơn, kèm số ngày tồn từng khâu và số quy tắc cùng vi phạm
- Dựng lại chỉ tiêu trung chuyển theo hai định nghĩa để đối chiếu, và đóng gói cách phân tích thành quy trình dùng lại được

#### Không thuộc phần tôi

- Bốn quy tắc và các ngưỡng tồn do vận hành (OE) chốt — tôi đề xuất cách diễn giải chúng thành dữ liệu và chỉ ra chỗ định nghĩa còn hở
- Quyết định chế tài với kho vi phạm thuộc về vận hành — tôi cung cấp cơ sở dữ liệu để họ quyết

#### Kết quả — và con số đó được tính ra sao

| Chỉ số | Giá trị | Cách tính |
|---|---|---|
| Kết quả cho vận hành | **mỗi đơn quá hạn chỉ về đúng một kho** `✓ đã xác thực` | Thay cho tranh luận thủ công giữa các bộ phận. Cùng một đơn chạy lại luôn ra cùng một kết quả, nên kết luận không bị lật lại vì thứ tự dữ liệu. |
| Phạm vi quy tắc | **4 quy tắc · 2 nhóm khiếu nại · chạy trên mọi đơn** `✓ đã xác thực` | Quá hạn giao và quá hạn trả, mỗi nhóm hai quy tắc gắn với một khâu và một ngưỡng tồn riêng. Cả bốn quy tắc đều do vận hành (OE) xác nhận trước khi áp dụng. |
| Đầu ra cho mỗi đơn | **1 dòng · kho vi phạm từng quy tắc · số ngày tồn · số quy tắc cùng vi phạm** `✓ đã xác thực` | Đủ chi tiết để vận hành tự kiểm lại kết luận trên từng đơn cụ thể, thay vì phải tin vào một con số tổng. |
| Lỗi định nghĩa đã phát hiện | **một ngưỡng thời gian thiếu ràng buộc ngày** `✓ đã xác thực` | Chỉ tiêu 'vào kho trung chuyển trước 22h30' không ràng buộc cùng ngày lấy hàng, làm chỉ tiêu trông cao hơn thực tế. Đã dựng bản định nghĩa chặt để đặt cạnh bản đang dùng. |

#### Nhìn lại

> Phần khó nhất không phải SQL mà là chốt thứ tự ưu tiên giữa các quy tắc — đó là quyết định nghiệp vụ, không phải quyết định kỹ thuật, và nó cần vận hành đồng ý chứ không thể tự quyết.
>
> Khi kết luận của một pipeline dẫn tới chế tài với một bưu cục cụ thể, 'gần đúng' không còn là lựa chọn. Tôi học được cách trình bày kết quả ở mức từng đơn để chính người bị kết luận kiểm lại được — và học được rằng khi định nghĩa của bộ phận khác có lỗ, cách hiệu quả nhất là dựng cả hai bản định nghĩa rồi để khoảng lệch tự nói, chứ không phải tranh luận.
>
> Giữa lúc phân tích, tôi tự tìm ra một lỗi nhân dòng trong query của mình. Nó nhắc rằng người đi chỉ ra lỗi định nghĩa của người khác thì càng phải kiểm số của chính mình trước.

</details>

`Trino SQL` `Iceberg` `log ra/vào kho`

<br>

### 05 · Hiệu suất đối tác vận chuyển 3PL

**Shopee** · Kết quả đã kiểm chứng · 4 năm · 2021 – 2025

> Con số cứng nhất trong portfolio này — đã được cả Shopee và đối tác vận chuyển xác nhận.

Hệ thống theo dõi KPI 3PL và cơ chế làm việc với đối tác: pickup on-time Viettel Post từ 90.1% lên 97.5%, contact rate giảm 15–20% mỗi đơn.

**90.1% → 97.5%** — pickup on-time của Viettel Post, theo dõi trong 4 năm `✓ đã xác thực`

<img src="https://raw.githubusercontent.com/aaron996/aaron996/main/assets/case-3pl-uplift.png" alt="Pickup on-time của Viettel Post đi từ 90.1% năm 2021 lên 97.5% năm 2025, theo dõi trong 4 năm, Shopee và đối tác cùng xác nhận. Thang đo từ 88% đến 100%." width="100%">

<details>
<summary><b>Bối cảnh, các quyết định, kết quả và cách tính</b></summary>

#### Bối cảnh

- Shopee giao phần lớn sản lượng cho các đối tác vận chuyển bên thứ ba: Vietnam Post, Viettel Post, J&T. Hiệu suất đối tác ảnh hưởng trực tiếp tới trải nghiệm người mua.
- Nhưng dữ liệu nằm rải rác, mỗi bên nhìn một bộ số, và chu kỳ phản hồi tới đối tác quá chậm để kịp điều chỉnh.

#### 2 quyết định đáng kể

**1. Đối tác và Shopee tranh luận trên hai bộ số khác nhau**

*Vì sao cách hiển nhiên lại sai:* Không thể cải thiện thứ mà hai bên còn chưa thống nhất cách đo. Mỗi cuộc họp trôi qua trong việc đối chiếu số thay vì bàn cách khắc phục.

*Quyết định:* Cho đối tác nhìn chung một dashboard với cùng định nghĩa KPI. Cuộc họp chuyển từ tranh luận số liệu sang bàn hành động cụ thể theo khu vực.

`Nguồn sự thật chung giữa các bên`

**2. Contact rate cao vì người mua không hiểu đơn đang ở đâu**

*Vì sao cách hiển nhiên lại sai:* Mỗi cuộc gọi tới tổng đài là một chi phí, và phần lớn xuất phát từ việc trạng thái hiển thị không trả lời được câu hỏi đơn giản nhất: bao giờ hàng tới.

*Quyết định:* Phân tích các trạng thái gây thắc mắc nhiều nhất và thiết kế lại luồng hiển thị quanh câu hỏi đó, thay vì mô tả quy trình nội bộ.

`Thiết kế chỉ số quanh câu hỏi của người dùng cuối`

#### Phần tôi làm

- Xây dashboard KPI tự động bằng SQL và Google Sheets cho cả nội bộ lẫn đối tác
- Thiết lập nhịp làm việc định kỳ với đối tác dựa trên cùng một bộ số
- Phân tích và thiết kế lại luồng trạng thái vận chuyển hiển thị cho người mua

#### Không thuộc phần tôi

- Vận hành giao nhận thực tế thuộc về đối tác — vai trò của tôi là phân tích và điều phối

#### Kết quả — và con số đó được tính ra sao

| Chỉ số | Giá trị | Cách tính |
|---|---|---|
| Pickup on-time (Viettel Post) | **90.1% → 97.5%** `✓ đã xác thực` | Theo dõi KPI hằng tuần và làm việc có cấu trúc với đối tác |
| Contact rate mỗi đơn | **giảm 15–20%** `✓ đã xác thực` | Sau khi thiết kế lại luồng trạng thái vận chuyển |
| Khối lượng thủ công của team | **giảm khoảng 30%** `≈ ước tính` | Nhờ công cụ báo cáo tự động bằng Google Apps Script |

#### Nhìn lại

> Con số 97.5% không đến từ một phân tích xuất sắc nào cả. Nó đến từ việc lặp lại một nhịp làm việc đủ lâu: cùng nhìn một bộ số, chỉ ra khu vực cụ thể, theo tới khi khắc phục xong.

</details>

`SQL` `Google Sheets` `Google Apps Script`

<br>

---

## Đường đi của một dashboard, từ yêu cầu tới production

Tôi không sở hữu hạ tầng nào trong chuỗi này: không có quyền ghi vào lakehouse, không tự tạo được job định kỳ, không được cấp server. Mỗi mắt dưới đây là một đường hợp lệ tìm ra trong ràng buộc sẵn có — và chính các ràng buộc đó định hình kiến trúc, chứ không phải sở thích kỹ thuật của tôi.

<img src="https://raw.githubusercontent.com/aaron996/aaron996/main/assets/pipeline.png" alt="Bảy mắt của một dashboard: 01 chốt lại câu hỏi, 02 tự viết query và tự kiểm output (chỉ có quyền đọc lakehouse), 03 job định kỳ do team BI dựng vì quyền tạo job thuộc team khác, 04 đồng bộ sang cơ sở dữ liệu ứng dụng, 05 mô hình hoá lại cho ứng dụng, 06 dựng ứng dụng, 07 deploy và vận hành." width="100%">

**Đánh đổi tôi biết mình đang chịu.** Chuỗi này là đồ ghép, và tôi biết điều đó. Google Sheets ở giữa là điểm dễ vỡ, Apps Script không có retry và không tự báo khi job chết, mỗi mắt nối thêm là thêm một chỗ có thể lệch số. Tôi chọn nó vì đó là đường hợp lệ duy nhất trong quyền hạn mình có. Nếu được cấp quyền ghi vào warehouse, tôi đã bỏ hai mắt giữa và cho ứng dụng đọc thẳng từ một bảng được quản lý.

**Về AI.** Tôi dùng AI-assisted coding để rút ngắn khoảng cách từ ý tưởng tới sản phẩm chạy được. Phần thuộc về tôi — và cũng là phần khó — là đóng khung vấn đề, chốt business rule, kiểm chứng đầu ra và chịu trách nhiệm khi số sai.

---

## Bộ kỹ năng

| Nhóm | |
|---|---|
| **Phân tích & truy vấn** | SQL (Trino/Presto, StarRocks, PostgreSQL) · Python · Excel / Google Sheets nâng cao · Phân tích nguyên nhân gốc |
| **Mô hình hoá dữ liệu** | Thiết kế fact / dimension · Định nghĩa grain và khoá · Dimension có hiệu lực theo thời gian · Chuẩn hoá định nghĩa KPI dùng chung |
| **BI & báo cáo** | Metabase · Power BI · Looker Studio · Thiết kế dashboard cho cấp quản lý · Báo cáo định kỳ tự động |
| **Chất lượng & đối chiếu dữ liệu** | Validation ở biên (staging rồi promote) · Đối chiếu song song khi thay quy trình · Đối chiếu số tiền hai chiều · Entity resolution & kiểm coverage khoá · Test cho business rule · Audit trail, RLS & phân quyền |
| **Tự động hoá** | n8n · Google Apps Script · LLM agent workflow · AI-assisted development |
| **Nghiệp vụ** | Vận hành logistics & thương mại điện tử · Quản lý SLA và escalation · Dự báo sản lượng · Làm việc với stakeholder và đối tác |

---

## Kinh nghiệm

<img src="https://raw.githubusercontent.com/aaron996/aaron996/main/assets/timeline.png" alt="2019 – 2020: A.P. Moller Maersk, Export Care Business Partner. 2020 – 2021: J&amp;T Express, Key Account Specialist. 2021 – 2025: Shopee, Logistics Management Specialist. T5/2026 – nay: Interdist, Sở hữu dữ liệu &amp; sản phẩm (bán thời gian, từ xa). 2025 – nay: Giao Hàng Nhanh (GHN), Key Account Solution / Data Analyst." width="100%">

<details>
<summary><b>Giao Hàng Nhanh (GHN)</b> — Key Account Solution / Data Analyst · 2025 – nay</summary>

Phụ trách dữ liệu, hiệu suất vận hành và đối chiếu tài chính cho các tài khoản chiến lược (Shopee Express, Shopee Bulky, TikTok Shop). Làm việc trực tiếp với điều hành vùng, team KA của khách hàng và bộ phận kiểm soát nội bộ.

- Xây pipeline SQL trên Trino quy trách nhiệm từng đơn vi phạm SLA về đúng kho gây ra — bốn quy tắc do vận hành chốt, chạy vét cạn trên mọi đơn, kết quả tái lập được. Đầu ra được dùng tiếp cho khâu đối chiếu tài chính với bộ phận kiểm soát nội bộ.
- Chuẩn hoá định nghĩa KPI cho toàn team — gồm cả định danh seller và điều kiện phân luồng đơn — và xây pipeline sinh báo cáo tự động từ dữ liệu thô.
- Xây web app theo dõi sản lượng multi-KPI (actual vs forecast vs AOP, theo client và theo tỉnh), thay cho các file Excel/HTML rời rạc.
- Chuyển data job của dashboard sang engine truy vấn mới theo từng lô, đối chiếu số cũ với số mới trước khi cắt nguồn.
- Dựng báo cáo điều hành theo vùng/hub cho giám đốc vùng, phân phối tự động qua n8n và Google Apps Script.
- Hỗ trợ các team khác (vận hành, chăm sóc khách hàng) dựng báo cáo và trực quan hoá backlog trên cùng nguồn dữ liệu chuẩn hoá.

</details>

<details>
<summary><b>Interdist</b> — Sở hữu dữ liệu & sản phẩm (bán thời gian, từ xa) · T5/2026 – nay</summary>

Làm song song với GHN, khoảng 18 giờ/tuần. Sở hữu toàn bộ phần dữ liệu và sản phẩm của hệ thống vận hành doanh số P&G.

- Chuyển quy trình tổng hợp doanh số từ các file Excel rời rạc sang một cơ sở dữ liệu trung tâm có kiểm soát chất lượng.
- Thiết kế lược đồ dữ liệu và business rule: giá theo khoảng hiệu lực, phân bổ chỉ tiêu theo lịch hoạt động cửa hàng.
- Xây và vận hành sản phẩm một mình, từ frontend tới cơ sở dữ liệu và phân quyền.

</details>

<details>
<summary><b>Shopee</b> — Logistics Management Specialist · 2021 – 2025</summary>

Phân tích hiệu suất đối tác vận chuyển (Vietnam Post, Viettel Post, J&T).

- Đưa pickup on-time của Viettel Post từ 90.1% lên 97.5% thông qua theo dõi dữ liệu chặt và phối hợp có cấu trúc với đối tác.
- Thiết kế lại luồng trạng thái vận chuyển dựa trên phân tích dữ liệu, giảm 15–20% contact rate trên mỗi đơn.
- Xây dashboard SQL + Google Sheets tự động cho cấp quản lý và đối tác.

</details>

<details>
<summary><b>J&T Express</b> — Key Account Specialist · 2020 – 2021</summary>

Vận hành luồng đơn khối lượng lớn cùng bộ phận logistics của Shopee (~300.000 đơn/ngày).

- Dựng dashboard và báo cáo nội bộ chuẩn hoá chỉ số cho đội vận hành.
- Dùng dữ liệu để theo dõi các sáng kiến và thiết kế giải pháp giao hàng.

</details>

<details>
<summary><b>A.P. Moller Maersk</b> — Export Care Business Partner · 2019 – 2020</summary>

Đối tác vận hành cho khách hàng xuất khẩu, phối hợp với đại lý nước ngoài và các bộ phận nội bộ.

- Duy trì độ chính xác master data khách hàng để tối ưu hệ thống nội bộ và trải nghiệm end-to-end.

</details>

---

## Nên gọi tôi khi

- Chỉ tiêu đang bị mỗi bên hiểu một kiểu
- Báo cáo còn dựng tay mỗi tuần
- Cần một người vừa chốt logic vừa ship được

## Và khi không nên

- Cần một data engineer dựng hạ tầng từ đầu
- Bài toán thuần ML hoặc mô hình dự báo nặng
- Chỉ cần người chạy query theo yêu cầu

> Tôi không định vị mình là software engineer. Tôi là người xây hệ thống dữ liệu cho bài toán vận hành mình hiểu rõ.

---

## Bạn đang có một con số không ai dám bảo vệ?

Nếu team bạn cần một người hiểu nghiệp vụ đủ sâu để định nghĩa đúng con số, và đủ tay nghề để tự dựng hệ thống sinh ra con số đó — mình rất muốn trao đổi. Mình cũng nhận dự án data product theo phạm vi rõ ràng, làm từ xa.

<p align="center">
  <a href="mailto:luongthevinh996@gmail.com"><b>luongthevinh996@gmail.com</b></a> &nbsp;·&nbsp;
  <a href="https://www.linkedin.com/in/vinhluongg/">LinkedIn</a> &nbsp;·&nbsp;
  <a href="https://github.com/aaron996/aaron996/blob/main/assets/cv.pdf">CV (PDF)</a>
</p>

<p align="center"><sub>Nhận dự án data product · cũng cân nhắc vị trí BI / Data Analyst</sub></p>
