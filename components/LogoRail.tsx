import { content } from "@/content/content.vi";

export function LogoRail() {
  return (
    <section className="border-b border-ink-800 bg-ink-925" aria-label="Các công ty đã làm việc">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-6 sm:px-8 lg:flex-row lg:items-center lg:gap-10 xl:px-11">
        <p className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-mute-3">
          Đã làm trong
        </p>
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-5">
          {content.logos.map((company) => (
            <div
              key={company}
              className="grid h-11 place-items-center rounded-xl border border-dashed border-ink-700 px-3 text-center font-display text-xs font-bold uppercase tracking-[0.08em] text-mute-2"
            >
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
