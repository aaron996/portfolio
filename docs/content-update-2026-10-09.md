# Điều chỉnh nội dung portfolio — 09/10/2026

## Nội dung đã đổi

- Còn ba case: Interdist, KAS GHN và đối tác vận chuyển tại Shopee.
- Interdist được mô tả là hệ thống quản lý dữ liệu và báo cáo doanh số. Phạm vi cá nhân gồm làm rõ yêu cầu, tổ chức dữ liệu, xây ứng dụng, kiểm tra đầu ra, hỗ trợ sử dụng và bàn giao; không dùng danh sách kỹ thuật làm phần giới thiệu chính.
- KAS GHN là ứng dụng theo dõi vận hành được lãnh đạo sử dụng hằng ngày, theo đính chính trực tiếp của chủ portfolio. Repo xác nhận chức năng; chưa dùng repo để suy ra số người dùng hay mức tiết kiệm thời gian.
- Reporting KA và SLA gỡ khỏi content runtime, homepage, link câu hỏi và điều hướng giữa các case. URL cũ trả 404. Lịch sử trong Git và tài liệu review cũ vẫn giữ được.
- Slug GHN giữ `kas-shopee-performance` để không làm hỏng link case đã chia sẻ. Tiêu đề, mô tả, metadata và alt ảnh gọi đúng KAS GHN.
- Các nhãn “Tôi đã quyết định”, “Phần tôi sở hữu” đổi thành “Cách làm”, “Phạm vi phụ trách”. Không còn “Tôi/tôi” trong nội dung runtime của homepage và case.
- Homepage hiện summary và vai trò, bao gồm Interdist bán thời gian. Không chỉ hiện tên case và con số.
- Hai mốc 3PL giữ giá trị nhưng không gán mặc định vào năm 2021/2025; kỳ đo cụ thể chưa có trong nguồn. Contact rate thiếu phương pháp được bỏ khỏi phần đang trình bày.
- Số quy mô Interdist thiếu ngày snapshot và claim tái sử dụng Control Tower thiếu bằng chứng hoàn tất không làm headline. Ước tính tiết kiệm giữ nhãn/phương pháp.

## Repo đã đối chiếu

### Interdist

Project lưu trong app trỏ tới `D:\Github\Interdist\p&g-sales-dashboard`, checkout chính ở `8da6f47`. Nhánh remote đã được lưu cục bộ trỏ tới `05170f2`; worktree `C:\Users\admin\.codex\worktrees\df28\p&g-sales-dashboard` ở cùng commit, dùng để kiểm phạm vi mới hơn. Không fetch hoặc thay đổi hai checkout này.

Đã đọc `PRODUCT.md`, `ARCHITECTURE.md`, `docs/ADMIN_GUIDE.md`, `docs/CALCULATION_CONTRACT.md`, `src/modules/moduleRegistry.ts`, `src/lib/salesImportStaging.ts`, `src/modules/configure/ConfigureModule.tsx`.

Các nguồn cho thấy dashboard, nhập/xuất dữ liệu, báo cáo, giá/chỉ tiêu/lịch bán, danh mục/phân công và quyền theo vai trò. Module HR còn dữ liệu mockup, không đưa vào thành quả sản phẩm đang vận hành. Những migration/contract có trong repo không tự chứng minh đã được áp dụng production.

### KAS GHN

Project `KAS APP` trỏ tới `D:\Github\GHN`, HEAD `72c6e83`.

Đã đọc `src/modules/moduleRegistry.jsx`, `src/modules/moduleIds.js`, `src/modules/ops-metrics/OperationsOverview.jsx`, `src/modules/ops-metrics/OperationsHome.jsx`, `src/modules/ops-metrics/Report1MienVungHub.jsx`, `src/App.jsx`, `docs/google-sheet-supabase-sync.md`; rà bảng xếp hạng và module COD.

Tổng quan gồm KPI, xu hướng và hub cần ưu tiên, mở được xuống chi tiết. Registry có ca 1 theo lane, bảng xếp hạng, module COD; Leadtime và Insight có nhãn đang phát triển. Không gộp chức năng đang phát triển vào nhóm hoàn tất. Ảnh GHN trong portfolio là phiên bản trước, giữ nhãn dữ liệu minh hoạ; bỏ ảnh Insight khỏi gallery hiện tại.

## Giới hạn kiểm chứng

Các repo chỉ được đọc, không đăng nhập app nội bộ, không truy vấn dữ liệu production, không chỉnh database. Thông tin lãnh đạo sử dụng hằng ngày do chủ portfolio xác nhận. CV PDF và nội dung video intro chưa được chỉnh hoặc xác nhận lại trong task này.

## Kiểm tra bản local

- TypeScript và production build qua; build sinh đúng ba route case.
- Kiểm tra content: đủ ba slug, link câu hỏi trỏ tới case còn tồn tại, file ảnh có thật, không còn “Tôi/tôi” ở nội dung homepage/case.
- Nội dung game so sánh với HEAD không thay đổi. 74 test game hiện có qua; test loader được cập nhật để đọc file case đã tách.
- IAB: đọc homepage, Interdist và KAS GHN; mở case từ danh sách và điều hướng sang case tiếp theo. Kiểm hình desktop và viewport 390×844; homepage/KAS không tràn ngang.
- HTTP trên production build local: homepage và ba case trả 200; Reporting KA/SLA trả 404.
- Chưa commit, push hay deploy website production.
