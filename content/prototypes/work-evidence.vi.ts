export const workEvidencePreview = {
  title: "Chọn bố cục công việc tiêu biểu",
  status: "Bản mẫu · chưa áp dụng vào homepage",
  navigation: "Chọn phương án bố cục",
  evidence: "Điểm kiểm chứng",
  directions: [
    { id: "open", label: "Mở nền video", description: "Ảnh dẫn, bố cục lệch trái/phải và nền mô tả gọn để giữ video hiện diện." },
    { id: "image", label: "Ảnh dẫn", description: "Ảnh lớn dẫn nhịp đọc; mô tả đứng cạnh trên desktop và bên dưới trên mobile." },
    { id: "dossier", label: "Hồ sơ liền mạch", description: "Tên dự án mở đầu một khối; ảnh lớn và thông tin cùng nằm trên một nền đọc ổn định." },
  ],
} as const;
