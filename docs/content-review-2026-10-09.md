# Review nội dung kinh nghiệm và case — 09/10/2026

> Bản review ban đầu, trước đính chính về KAS GHN và yêu cầu gỡ Reporting KA/SLA. Nội dung đã triển khai theo hướng mới được ghi tại [content-update-2026-10-09.md](content-update-2026-10-09.md).

Phạm vi: homepage, timeline nghề nghiệp, năm trang case và đối chiếu CV HTML hiện có. Review dựa trên source trong checkout 3b65; chưa xác minh website production, trạng thái các hệ thống nội bộ, số liệu kinh doanh hoặc CV PDF. Đây là đề xuất biên tập, chưa thay nội dung runtime.

## Nhận định

Portfolio có một câu chuyện nghề nghiệp rõ: hiểu vận hành, chuyển yêu cầu thành logic dữ liệu, rồi xây công cụ phục vụ công việc. Điểm cần cải thiện là nối các case với trách nhiệm nghề nghiệp và làm rõ mức độ bằng chứng. Một số câu hiện tại mang giọng tự chứng minh hoặc khẳng định quá tuyệt đối, khiến thành quả khó đánh giá hơn.

Định vị đề xuất:

> Tôi làm việc với dữ liệu từ góc nhìn vận hành: làm rõ cách tính, đối chiếu số liệu và xây công cụ để người dùng theo dõi, kiểm tra và ra quyết định. Kinh nghiệm của tôi đến từ logistics và thương mại điện tử tại Maersk, J&T, Shopee và GHN; hiện tôi đồng thời xây hệ thống dữ liệu doanh số cho Interdist theo hình thức bán thời gian.

Đây là câu định vị; giữ chức danh của từng nơi làm việc riêng, không tự nâng thành cấp bậc mới.

## 1. Kinh nghiệm làm việc

Timeline hiện chỉ có một câu mỗi nơi. Giữ độ ngắn nhưng đổi từ tên công cụ/con số sang trách nhiệm và giá trị của từng chặng.

| Nơi làm việc | Thời gian trong CV HTML | Note đề xuất cho timeline |
|---|---|---|
| Maersk | 08/2019–09/2020 | Phụ trách hỗ trợ hàng xuất khẩu và dữ liệu khách hàng. |
| J&T Express | 10/2020–08/2021 | Phối hợp với Shopee theo dõi luồng đơn và xử lý vấn đề vận hành. |
| Shopee | 08/2021–02/2025 | Theo dõi KPI và phối hợp cải thiện hiệu suất đối tác vận chuyển. |
| GHN | 10/2025–nay | Phụ trách tài khoản thương mại điện tử; đồng thời xây báo cáo và công cụ dữ liệu phục vụ điều hành. |
| Interdist | 05/2026–nay | Xây và vận hành hệ thống dữ liệu doanh số P&G, bán thời gian song song với GHN. |

Lưu ý:

- Timeline đang dùng năm; CV HTML có tháng. Có thể giữ trục theo năm nhưng hiện tháng trong phần chi tiết để tránh hiểu rằng các công việc nối liền không có khoảng nghỉ.
- Note Shopee hiện viết “Hiệu suất đối tác vận chuyển: 90.1% → 97.5%”. Nếu giữ số, viết “Pickup đúng hạn của Viettel Post: 90,1% → 97,5%”; không mở rộng thành toàn bộ đối tác hoặc toàn bộ KPI.
- Khoảng 300.000 đơn/ngày tại J&T là quy mô luồng đơn phối hợp, không phải sản lượng cá nhân xử lý. Để trong chi tiết có phạm vi, thay vì dùng làm note chính.
- Interdist phải tiếp tục hiện nhãn bán thời gian, song song với GHN. Chức danh trong CV và mô tả chức năng trên app nên được phân biệt rõ.
- Trục vận hành → dữ liệu/sản phẩm là cách kể hành trình, không phải thang cấp bậc. Cân nhắc tên “Vận hành, dữ liệu và sản phẩm” để nhấn mạnh sự tích luỹ năng lực.
- Các trường “nay” và chức danh hiện tại cần chủ portfolio xác nhận khi cập nhật; source/CV chỉ cho biết nội dung đang được ghi.

## 2. Năm case

### P&G / Interdist — case sản phẩm từ đầu đến vận hành

Giữ vị trí đầu. Hai quyết định nên đọc sớm là giá theo hiệu lực và phân bổ target; hiện bài bắt đầu bằng parsing SKU và staging, làm người đọc gặp chi tiết kỹ thuật trước ý nghĩa nghiệp vụ.

Mở bài đề xuất:

> Tôi xây hệ thống nội bộ để Interdist tổng hợp doanh số P&G, theo dõi target và quản lý dữ liệu giá. Phần tôi phụ trách gồm làm rõ nghiệp vụ, thiết kế dữ liệu, xây ứng dụng và xử lý phản hồi sau triển khai.

Sửa cụ thể:

- “Tôi ship được… một mình” → mô tả phạm vi sở hữu như đoạn trên; giữ AI-assisted trong phần cách thực hiện.
- 85.563 giao dịch, 41 cửa hàng, 176 SKU, 8 tài khoản, 22 bảng là snapshot quy mô/cấu hình. Bổ sung ngày đếm và điều kiện đếm trước khi gọi là hiện tại. Tài khoản không đồng nghĩa người dùng hoạt động.
- “Không bao giờ lệch” → “Tính actual từ dữ liệu giao dịch để giảm nguy cơ lệch giữa các bản lưu song song.”
- “Người dùng không thể lách qua API” → “Phân quyền được thực thi ở tầng cơ sở dữ liệu bằng RLS.” Nêu cấu hình không thay thế kiểm thử chính sách.
- ~40–60 giờ/tháng vẫn là ước tính; đổi “được giải phóng” thành “ước tính có thể giảm”, giữ phương pháp và giới hạn đo.
- Mô tả staging/promote cần đối chiếu app thật nếu tiếp tục viết thành cơ chế đã triển khai; review này chưa kiểm parser/database của Interdist.

### App điều hành Shopee tại GHN — case công cụ được sử dụng

Giữ phân biệt làm tại GHN, phục vụ tài khoản Shopee. Case có câu chuyện tốt về copy ảnh vào group và đổi đường đồng bộ khi Workspace chặn chia sẻ.

Mở bài đề xuất:

> Tôi xây app theo dõi hiệu suất tài khoản Shopee tại GHN, giúp điều hành xem KPI theo miền, vùng và hub. App có bộ lọc, chế độ trình chiếu và copy bảng thành ảnh để phục vụ trao đổi trong group.

Sửa cụ thể:

- “Tự làm toàn bộ” → “Phụ trách tầng dữ liệu phục vụ app, giao diện, phân quyền và vận hành; sử dụng KPI chuẩn của công ty.”
- Đưa copy ảnh và đồng bộ dữ liệu lên trước; reuse ở Control Tower là bằng chứng sử dụng nếu đã nhúng thật.
- Comment dẫn KAS-192 ghi “định hướng nhúng”, còn headline viết “đã được nhúng”. Cần bằng chứng hoàn tất để giữ cách viết này; không kết luận chưa nhúng chỉ từ comment.
- Access log/presence cho biết tài khoản, lượt truy cập và thời điểm. Chưa có bằng chứng trong review này để viết “ai đã xem bản nào” hoặc “ai đã xem gì”.
- Bốn tab được method ghi đối chiếu ngày 24/08/2026; muốn mô tả phạm vi hiện tại cần refresh source app.
- ~12–14 ngày công là effort quy đổi, không phải thời gian tiết kiệm. Đưa vào ghi chú phương pháp hoặc bỏ khỏi phần kết quả chính.
- “Yêu cầu từ quản lý” thuộc bối cảnh, không phải kết quả.

### Reporting KA — case chuẩn hoá và kiểm chứng số

Mở bài đề xuất:

> Tôi xây bộ định nghĩa KPI và quy trình tạo báo cáo cho các tài khoản KA phụ trách. Trọng tâm là thống nhất cách tính, đối chiếu chênh lệch và đưa kết quả tới đúng nhóm người dùng.

Sửa cụ thể:

- “Toàn team”, “nguồn duy nhất” cần phạm vi áp dụng cụ thể. Nếu chưa có bằng chứng áp dụng toàn bộ, viết “các báo cáo trong phạm vi triển khai”.
- Skill dùng chung giúp hạn chế khác biệt ngữ cảnh; không bảo đảm LLM “cùng câu hỏi, cùng câu trả lời, bất kể ai hỏi”. Giữ đối chiếu và review đầu ra.
- Chọn ba quyết định chính: thống nhất KPI, định danh seller, đối chiếu trước phát hành. Skill AI, migration engine và lịch phân phối là phần đọc sâu.
- Báo cáo KA, dashboard multi-KPI và migration data job đang được gộp vào cùng case. Giữ cùng chủ đề nhưng ghi rõ từng đầu ra, nhóm dùng và cơ chế chạy; không khiến người đọc hiểu tất cả thuộc một pipeline duy nhất.
- ~70% giữ nhãn ước tính, không dùng làm headline tác động đã đo.
- Sơ đồ hiện đi từ Trino tới skill, DOCX/HTML và phân phối. Cần đối chiếu xem đó là luồng chung thực tế hay chỉ một nhánh trong các công việc đang kể.

### SLA — case diễn giải nghiệp vụ thành logic kiểm lại được

Mở bài đề xuất:

> Tôi chuyển quy tắc quy trách nhiệm đơn trễ do vận hành thống nhất thành logic xử lý trên log ra/vào kho. Đầu ra giữ chi tiết từng quy tắc và cơ sở chọn kho để vận hành kiểm lại trên từng đơn.

Sửa cụ thể:

- “4 quy tắc · mọi đơn · đúng một kho” → “4 quy tắc · ưu tiên rõ ràng · chi tiết theo đơn”.
- Phân biệt chạy cả bốn rule trên mọi đơn thuộc tập đánh giá với việc mọi đơn đều có kết luận. Nêu cách xử lý ca không khớp rule, thiếu log hoặc thiếu dữ kiện trước khi hứa mỗi đơn có một kho.
- Quy tắc/ngưỡng do OE chốt; phần sở hữu là diễn giải, triển khai, kiểm tra và cung cấp cơ sở dữ liệu cho quyết định.
- Audit ngưỡng 22h30 có comment xác định là công việc riêng. Đặt thành ví dụ phân tích liên quan, tách khỏi luồng quy trách nhiệm chính.
- “Định nghĩa của người khác có lỗ” → “Phát hiện và đối chiếu điểm chưa chặt trong định nghĩa chỉ tiêu.”
- Nhãn ảnh minh hoạ SLA hiện có; ảnh này không chứng minh engine đã xử lý đầy đủ trường hợp.

### 3PL / Shopee — case phân tích kết hợp điều phối

Mở bài đề xuất:

> Trong vai trò tại Shopee, tôi theo dõi KPI vận chuyển và phối hợp với đối tác để xác định khu vực cần cải thiện, thống nhất hành động và theo dõi kết quả. Pickup đúng hạn của Viettel Post tăng từ 90,1% lên 97,5% trong giai đoạn được báo cáo.

Sửa cụ thể:

- “Con số cứng nhất trong portfolio” → mô tả kết quả và phạm vi đo; bỏ tự xếp hạng bằng chứng.
- “Đã được cả Shopee và đối tác xác nhận” cần nguồn có thể dẫn hoặc mô tả rõ tài liệu xác nhận. `verified:true` không tự chứng minh việc xác nhận.
- 90,1% → 97,5% cần kỳ đo, định nghĩa/mẫu số và scope Viettel Post. Không mặc định năm vào/ra công ty chính là kỳ đo của hai mốc: homepage chart hiện gắn hai số với 2021 và 2025.
- Contact rate giảm 15–20% cần định nghĩa, baseline, kỳ đo và phân biệt giảm tương đối với điểm phần trăm. Chưa đủ thì bỏ khỏi opening, giữ ghi chú chờ xác nhận.
- Giữ rõ kết quả có đóng góp từ vận hành của đối tác; phần cá nhân là phân tích, báo cáo và điều phối.
- Giảm khoảng 30% việc tay vẫn là ước tính và cần cách ước lượng.

## 3. Nội dung và cách render đang lệch nhau

- `WorkIndex.tsx` chỉ render title, client/period và keyResult. Các field homepage.summary, role và evidence chưa hiện. P&G vì vậy thiếu nhãn part-time ở danh sách dù source đã viết; người đọc cũng chưa thấy mỗi case giải quyết việc gì.
- Đề xuất hiện một câu summary dưới tên case, cùng nhãn vai trò/ngữ cảnh ngắn. Giữ keyResult như bằng chứng bổ sung.
- `CaseArticle.tsx` render toàn bộ decisions theo thứ tự mảng. Hai quyết định nghiệp vụ tiêu biểu trong content map lịch sử chưa trở thành thứ tự đọc hiện tại.
- Header case đồng thời có proves, oneLiner, role và keyResult; nhiều câu lặp luận điểm. Gộp proves/oneLiner thành một đoạn cụ thể, còn role chỉ nói phạm vi phụ trách.
- “Phần do người khác làm” nên đổi thành “Phạm vi phối hợp và giới hạn trách nhiệm”; nội dung gồm cả quyền quyết định/hạ tầng, không chỉ việc người khác thực hiện.
- `verified:false` được gắn nhãn “Chưa xác thực”, trong khi phần lớn là ước tính có phương pháp. Tách nhãn “Ước tính”, “Snapshot tại [ngày]”, “Kết quả theo [nguồn]” khi đủ dữ kiện. Không suy ra nhãn “đã xác nhận độc lập” từ boolean hiện có.

## 4. Thứ tự chỉnh đề xuất

1. Sửa phạm vi số liệu và câu tuyệt đối: SLA, LLM, RLS, access log, số 3PL.
2. Nối lại trách nhiệm nghề nghiệp: GHN có KA và dữ liệu; Interdist part-time; Shopee tách khỏi tài khoản Shopee tại GHN.
3. Viết lại opening của năm case theo mẫu trên, giảm câu tự chứng minh.
4. Hiện summary/vai trò trên homepage; sắp decisions theo ý nghĩa nghiệp vụ; giảm trùng header.
5. Bổ sung mốc/nguồn đo và refresh các claim adoption/phạm vi đang chạy. Chưa có nguồn thì giảm mức khẳng định, giữ phần đã chứng minh được.

Nguồn đã đọc: `content/content.vi.ts`, `components/home/HomePage.tsx`, `components/home/WorkIndex.tsx`, `components/home/CareerPath.tsx`, `components/case/CaseArticle.tsx`, `app/case/[slug]/page.tsx`, `PRODUCT.md`, `CLAUDE.md`, `cv-source/cv.html`, `cv-source/README.md`. `docs/portfolio-content-map.md` dùng làm tài liệu biên tập lịch sử; source hiện tại quyết định nội dung đang render.
