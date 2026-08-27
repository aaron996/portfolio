import { Reveal } from "./ui/Reveal";

export function Testimonials() {
  return (
    <section className="border-b border-ink-800 bg-ink-925">
      <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 md:py-24 xl:px-11">
        <Reveal>
          <h2 className="display max-w-[24ch] text-[clamp(1.8rem,3.4vw,2.8rem)]">
            Ba chỗ trống chờ trích dẫn thật
          </h2>
          <p className="mt-5 max-w-[62ch] text-sm leading-7 text-mute-3">
            Trích dẫn sẽ chỉ xuất hiện khi có phản hồi thật từ quản lý hoặc stakeholder từng làm việc cùng.
          </p>
        </Reveal>

        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Reveal key={index} delay={index * 0.05}>
              <figure className="h-full rounded-2xl border border-dashed border-ink-700 p-6">
                <blockquote className="text-base leading-7 text-ink-700">“…”</blockquote>
                <figcaption className="mt-8 flex items-center gap-3">
                  <span className="placeholder-grid h-10 w-10 shrink-0 rounded-full border border-ink-700" />
                  <span>
                    <span className="block text-sm font-semibold text-mute-3">Tên, vai trò</span>
                    <span className="mt-0.5 block text-xs text-ink-700">Công ty</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
