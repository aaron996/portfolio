/** Tiến độ đọc 0–1 của bài `[data-read]` trên trang: 0 khi đầu bài chạm đỉnh
 *  khung nhìn, 1 khi cuối bài chạm đáy. Thanh đọc ở nav và bạn đồng hành dùng chung. */
export function readProgress() {
  const article = document.querySelector<HTMLElement>("[data-read]");
  if (!article) return 0;
  const r = article.getBoundingClientRect();
  const span = r.height - window.innerHeight;
  if (span <= 0) return 1;
  return Math.min(1, Math.max(0, -r.top / span));
}
