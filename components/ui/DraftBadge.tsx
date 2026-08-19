export function DraftBadge({ verified, title }: { verified: boolean; title?: string }) {
  if (verified) return null;
  return (
    <span
      title={title || "Ước tính, chưa được đối chiếu bởi bên thứ ba"}
      className="ml-2 inline-flex items-center rounded border border-lime/50 bg-lime/10 px-2 py-0.5 align-middle text-[11px] font-medium text-lime"
    >
      Chưa xác thực
    </span>
  );
}
