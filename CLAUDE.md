# Portfolio — quy ước làm việc

Next.js App Router, TypeScript, Tailwind. `/` là portfolio, `/case/[slug]` là case
study, `/game` là minigame "Ải Vận Hành".

## Chữ hiển thị nằm ở `content/`, không nằm trong component

Mọi chuỗi người đọc thấy đều ở `content/content.vi.ts`, kiểu ở `content/types.ts`.
Component chỉ quyết định layout. Thêm chữ mới thì thêm field vào `types.ts` trước rồi
điền ở `content.vi.ts` — đừng hardcode vào JSX, kể cả một nhãn `aria-label`.

Lý do: chữ là quyết định biên tập, sửa thường xuyên và độc lập với code.

## Asset của game — ĐỌC `docs/game-assets.md` MỤC 12 TRƯỚC KHI SỬA ENGINE

Thêm hoặc sửa bất cứ thứ gì nhìn thấy được trong game thì phải làm đủ **bốn việc**
trong cùng lần sửa: vẽ bản lùi bằng code → khai cờ ở `ASSETS` (mặc định tắt) → ghi
vào `docs/game-assets.md` (bảng đầu file + mục prompt + bảng cờ mục 9) → **báo ngay
cho người dùng trong câu trả lời của lượt đó, kèm prompt dán thẳng ra chat**.

Việc thứ tư là bắt buộc. Placeholder không được báo sẽ nằm đó vô thời hạn.

Luật đầy đủ, bảng màu quy ước và toàn bộ prompt: `docs/game-assets.md`. Bảng "việc
còn phải gen" ở đầu file đó là chỗ duy nhất cần đọc để biết game còn thiếu ảnh gì.

## Kiểm tra trước khi commit

```bash
npx tsc --noEmit
npx next build
```

Repo chưa có ESLint config nên `next lint` sẽ hỏi cài — đừng chạy.

Xoá route/file trong `app/` xong mà `tsc` báo thiếu module trong `.next/types/app/...`
thì đó là type sinh sẵn còn sót: `rm -rf .next/types/app/<route>`.

## Test minigame trong trình duyệt

`reactStrictMode: true`, nên ở dev React mount effect hai lần: tạo engine A, huỷ A,
tạo B. Nếu vá `requestAnimationFrame` để tự lái vòng lặp (cần thiết khi pane không
chạy rAF) thì `cancelAnimationFrame` mất tác dụng, A vẫn chạy song song và vẽ đè lên
B — mọi phép đo sau đó vô nghĩa, quái không chết, nhân vật như đứng im. Vá **sau** khi
trang mount xong, hoặc test trên `next build && next start`.

Đo trạng thái game từ ngoài: mở bảng túi đồ (`B`) và bảng tạm dừng (`P`) rồi đọc DOM —
đó là chỗ duy nhất `status()` lộ ra ngoài. Nhớ là mở bảng thì engine nhả hết phím.

## Git

Repo có worktree — `main` bị worktree gốc giữ, nên `gh pr merge --delete-branch` merge
xong sẽ lỗi ở bước `checkout main`. Xoá nhánh bằng nút trên trang PR hoặc
`git push origin --delete <branch>`.
