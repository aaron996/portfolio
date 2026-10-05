export type CareerObjectId = "maersk" | "jt" | "shopee" | "ghn" | "interdist";
export type CareerObjectEntry = { id: CareerObjectId; label: string; company: string; cases: string[]; media?: string };

export const careerObjectsPreview = {
  title: "Khám phá công việc",
  description: "Từ vận hành logistics đến phân tích dữ liệu và xây hệ thống. Chọn một mô hình để xem vai trò, công việc và các case liên quan.",
  status: "Bản nháp bố cục · mô hình mô phỏng, chưa phải GLB",
  back: "So với bản ảnh dẫn",
  navigation: "Chọn nơi làm việc",
  hint: "Rê chuột để khám phá. Bấm để ghim; rời các mô hình để trở lại mục đã ghim.",
  mobileHint: "Chạm một mô hình để xem công việc.",
  all: "Xem tất cả công việc",
  pauseRotation: "Dừng xoay",
  resumeRotation: "Bật xoay",
  close: "Đóng nội dung",
  pin: "Giữ mở",
  pinned: "Đang giữ mở",
  temporary: "Xem nhanh",
  experience: "Kinh nghiệm",
  work: "Công việc tiêu biểu",
  cv: "CV",
  emptyMedia: "Vai trò và công việc trong giai đoạn này",
  entries: [
    { id: "maersk", label: "Maersk", company: "A.P. Moller Maersk", cases: [] },
    { id: "jt", label: "J&T", company: "J&T Express", cases: [] },
    { id: "shopee", label: "Shopee", company: "Shopee", cases: ["shopee-3pl-performance"] },
    { id: "ghn", label: "GHN", company: "Giao Hàng Nhanh", cases: ["kas-shopee-performance", "kas-reporting-automation", "sla-attribution"], media: "kas-shopee-performance" },
    { id: "interdist", label: "Interdist", company: "Interdist", cases: ["pg-sales-operations"], media: "pg-sales-operations" },
  ] satisfies CareerObjectEntry[],
};
