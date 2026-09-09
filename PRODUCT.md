# Portfolio Lương Thế Vinh

## Người đọc và mục đích

Portfolio phục vụ ngang nhau hai nhóm: nhà tuyển dụng BI/Data Analyst và khách thuê dự án dữ liệu. Người đọc thường đến từ CV để xem sản phẩm, phần đóng góp và cách giải quyết vấn đề; người vào trực tiếp vẫn cần thấy tên, vai trò và domain logistics/thương mại điện tử ngay đầu trang.

Nội dung tập trung vào công việc thực tế. Không chia theo persona, không kể lại đầy đủ CV. CTA chính là **Xem công việc tiêu biểu**, tiếp theo là liên hệ; CV là link phụ dễ tìm.

## Cấu trúc và nội dung

Homepage: hero gọn → hai case nổi bật P&G và app điều hành Shopee tại GHN → kết quả 3PL và hai case Reporting KA/SLA → bốn bước làm việc → giới thiệu/kinh nghiệm/năng lực → liên hệ và minigame phụ.

Giữ cả năm URL case và các anchor `#cases`, `#pipeline`, `#about`, `#experience`, `#contact`. Case trình bày bài toán, vai trò, bằng chứng, quyết định tiêu biểu, kết quả và giới hạn. Phần kỹ thuật dài có đường đọc sâu riêng.

Tiếng Việt là ngôn ngữ của batch này. Mọi chữ hiển thị, kể cả caption và nhãn trợ năng, phải được chuyển vào `content/content.vi.ts` với kiểu tương ứng ở `content/types.ts` khi tích hợp bản mẫu.

## Bằng chứng và cách diễn đạt

- P&G là ứng dụng nội bộ của Interdist; app điều hành Shopee là sản phẩm trong công việc tại GHN. Tách rõ khỏi vai trò từng làm tại Shopee.
- Giữ phạm vi tự làm/phối hợp và quyền quyết định của vận hành, Data Platform, BI, đối tác.
- Ảnh ứng dụng dùng dữ liệu minh hoạ; nhãn đặt sát ảnh. Screenshot chứng minh giao diện, không xác nhận số kinh doanh hay bảo mật.
- Ước tính giữ phương pháp và nhãn. Số quy mô không được viết thành tác động. Không tự bổ sung ngày đếm, số liệu, chân dung hoặc lời chứng thực.
- Không render testimonial trống hay placeholder chân dung. Layout không cần chờ ảnh mới.

## Hướng visual và ranh giới

Hero tối gọn, vùng dự án/nội dung dài sáng hơi ấm, lime dùng tiết chế. Palette, tỷ lệ sáng/tối và robot được đánh giá ở Phase 2; chưa phải thông số đã duyệt. Theme phải scope theo surface để không đổi giao diện game.

Mục tiêu bản mẫu: bằng chứng trong hai màn hình đầu, đọc được bằng keyboard/touch, giảm chữ lặp mà giữ nguồn/phạm vi/giới hạn. Mức giảm 40–50% chữ mặc định chỉ được kết luận sau khi đo DOM baseline và bản mẫu cùng cách.

Không đổi CV, domain/slug, thêm backend/form/CMS, xác thực production khách hàng, sửa gameplay/art hoặc deploy trong batch này.

## Trạng thái

Phase 1 và Phase 2 hoàn thành local ngày 09/09/2026. Homepage và case P&G đã tích hợp copy, bố cục và ảnh của bản mẫu; bốn case còn lại dùng template cũ. TypeScript, production build và lượt kiểm desktop/mobile đạt trong phạm vi Phase 2. Chưa commit, push hoặc deploy.

Đọc [plan](docs/portfolio-redesign-plan.md), [content map và bằng chứng](docs/portfolio-content-map.md), [copy dùng cho bản mẫu](docs/portfolio-copy-draft.md), [so sánh và kiểm tra Phase 2](docs/portfolio-phase2-review.md) và [hệ thống visual bản mẫu](DESIGN.md). Đây là mốc người dùng xem lại visual trước Phase 3; các giá trị trong DESIGN.md mô tả bản đã dựng, chưa phải phê duyệt cuối.
