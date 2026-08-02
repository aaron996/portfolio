import type { MediaSlot } from "@/content/types";

export function MediaPlaceholder({ slot }: { slot: MediaSlot }) {
  if (slot.src) {
    return (
      <figure className="overflow-hidden rounded-2xl border border-ink-700 bg-ink-900">
        {slot.kind === "video" ? (
          <video src={slot.src} controls className="w-full" aria-label={slot.alt} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={slot.src} alt={slot.alt} className="w-full" />
        )}
        {slot.isDemoData ? (
          <figcaption className="border-t border-ink-700 px-4 py-2 text-xs text-mute-3">
            Dữ liệu minh hoạ — không phải số liệu kinh doanh thật
          </figcaption>
        ) : null}
      </figure>
    );
  }

  return (
    <div
      className="flex min-h-52 flex-col justify-between rounded-2xl border border-dashed border-ink-700 bg-ink-900 p-5"
      role="img"
      aria-label={`Chỗ dành cho ${slot.kind === "video" ? "video" : "ảnh"}: ${slot.alt}`}
    >
      <span className="eyebrow text-lime">
        {slot.kind === "video" ? "Chỗ đặt video" : "Chỗ đặt ảnh"}
      </span>
      <p className="mt-4 text-sm leading-relaxed text-mute">{slot.brief}</p>
      <code className="mt-4 block text-[11px] text-mute-3">id: {slot.id}</code>
    </div>
  );
}
