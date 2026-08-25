import type { Media } from "@/content/types";

export function MediaPlaceholder({ slot }: { slot: Media }) {
  return (
    <figure
      className={`overflow-hidden rounded-2xl border border-ink-700 bg-ink-900${
        slot.wide ? " md:col-span-2" : ""
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={slot.src} alt={slot.alt} className="w-full" />
      {slot.isDemoData ? (
        <figcaption className="border-t border-ink-700 px-4 py-2 text-xs text-mute-3">
          Dữ liệu minh hoạ — không phải số liệu kinh doanh thật
        </figcaption>
      ) : null}
    </figure>
  );
}
