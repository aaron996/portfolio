import { content } from "@/content/content.vi";
import { Reveal } from "./ui/Reveal";

export function About() {
  const { intro } = content;

  return (
    <section id="about" className="border-b border-ink-800">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-[minmax(0,.82fr)_minmax(0,1.18fr)] lg:gap-16 xl:px-11">
        <Reveal>
          <div className="relative max-w-xl">
            <div className="placeholder-grid aspect-[4/5] overflow-hidden rounded-2xl border border-ink-700 bg-ink-900">
              <div className="grid h-full place-items-center p-8 text-center text-sm leading-relaxed text-mute-3">
                Ảnh chân dung dọc<br />đang làm việc, ánh sáng tự nhiên
              </div>
            </div>
            <div className="absolute -bottom-5 left-4 rounded-xl bg-lime px-5 py-4 text-ink-950 sm:-left-4 sm:bottom-7">
              <p className="font-display text-sm font-extrabold uppercase tracking-[0.08em]">
                {content.meta.name}
              </p>
              <p className="mt-1 text-xs text-ink-950/70">{content.meta.roleLabel}, TP.HCM</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="eyebrow text-lime">{intro.eyebrow}</p>
          <h2 className="display mt-4 max-w-[20ch] text-[clamp(2rem,4.2vw,3.4rem)]">{intro.heading}</h2>
          <div className="mt-7 max-w-[64ch] space-y-5 text-base leading-8 text-mute md:text-[17px]">
            {intro.body.slice(0, 2).map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>

          {/* Giới hạn tự nhận — theo types.ts phải xuất hiện đúng một lần trên site,
              và đây là chỗ của nó. Trước đây không component nào render câu này. */}
          <p className="mt-6 max-w-[64ch] border-l-2 border-ink-700 pl-4 text-sm leading-7 text-mute-2">
            {intro.boundary}
          </p>

          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            <FitList title="Tôi phù hợp khi" items={intro.fit} positive />
            <FitList title="Tôi không phù hợp khi" items={intro.notFit} />
          </div>

          {/* Sáu nhóm năng lực, mỗi nhóm một hàng chip. Bản cũ flatten hết rồi
              .slice(0, 9) — mất tên nhóm và mất 18/27 item của content.skills. */}
          <dl className="mt-7 space-y-4 border-t border-ink-800 pt-6">
            {content.skills.map((group) => (
              <div
                key={group.title}
                className="grid gap-2 sm:grid-cols-[10.5rem_minmax(0,1fr)] sm:gap-5"
              >
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mute-3 sm:pt-2">
                  {group.title}
                </dt>
                <dd className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-ink-700 px-3 py-1.5 text-xs leading-5 text-mute"
                    >
                      {item}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

function FitList({ title, items, positive = false }: { title: string; items: string[]; positive?: boolean }) {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
      <h3 className="font-display text-sm font-bold uppercase text-paper">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm leading-6 text-mute-2">
            <span className={positive ? "text-lime" : "text-mute-3"} aria-hidden="true">
              {positive ? "→" : "×"}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
