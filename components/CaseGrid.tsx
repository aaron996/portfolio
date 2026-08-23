import Link from "next/link";
import { content } from "@/content/content.vi";
import { Section, SectionHeading } from "./ui/Section";
import { Reveal } from "./ui/Reveal";
import { DraftBadge } from "./ui/DraftBadge";

/**
 * Các case còn lại chia theo tier: "deep" render thành card đầy đủ scopeLabel +
 * proves; "brief" render mỏng hơn hẳn — thành một dải kết quả (result strip),
 * không phải card cùng cỡ. Chính sự chênh kích cỡ này là hierarchy nhìn thấy
 * được, thay vì các card giống hệt nhau.
 *
 * Lưới deep là 2 cột, nên số case deep lẻ sẽ để card cuối mồ côi kèm một ô
 * trống bằng nửa hàng. Card đó được cho trải hết chiều ngang và xếp ngang lại —
 * lấp ô trống mà không phải hạ cấp một case xuống tier thấp hơn chỉ vì layout.
 */
export function CaseGrid() {
  const others = content.cases.filter((c) => c.slug !== content.featuredSlug);
  const deep = others.filter((c) => c.tier === "deep");
  const brief = others.filter((c) => c.tier === "brief");

  return (
    <Section className="border-b border-ink-800">
      <SectionHeading eyebrow={content.sectionLabels.otherCasesEyebrow}>
        {content.sectionLabels.otherCasesHeading}
      </SectionHeading>

      <div className="grid gap-4 md:grid-cols-2">
        {deep.map((c, i) => {
          const isOrphan = deep.length % 2 === 1 && i === deep.length - 1;

          const head = (
            <>
              <p className="eyebrow text-lime">{c.scopeLabel}</p>
              <h3 className="mt-3 font-display text-lg font-bold uppercase leading-tight text-paper">
                {c.title}
              </h3>
              <p className="mt-2 text-sm font-semibold text-paper">{c.proves}</p>
            </>
          );
          const result = (
            <>
              <p className="font-display text-base font-bold text-paper">
                {c.keyResult.value}
                <DraftBadge verified={c.keyResult.verified} />
              </p>
              <p className="mt-1 text-xs text-mute-3">{c.keyResult.label}</p>
              <span className="mt-4 block text-sm font-semibold text-lime group-hover:underline">
                Xem chi tiết →
              </span>
            </>
          );
          const card =
            "group rounded-2xl border border-ink-700 bg-ink-900 p-6 transition-all hover:-translate-y-1 hover:border-lime/50";

          return (
            <Reveal key={c.slug} delay={i * 0.06} className={isOrphan ? "md:col-span-2" : ""}>
              {isOrphan ? (
                <Link href={`/case/${c.slug}`} className={`${card} flex flex-col md:flex-row md:items-center md:gap-10`}>
                  <div className="md:flex-1">
                    {head}
                    <p className="mt-3 text-sm leading-relaxed text-mute">{c.oneLiner}</p>
                  </div>
                  <div className="mt-5 flex-none border-t border-ink-800 pt-4 md:mt-0 md:w-64 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                    {result}
                  </div>
                </Link>
              ) : (
                <Link href={`/case/${c.slug}`} className={`${card} flex h-full flex-col`}>
                  {head}
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-mute">{c.oneLiner}</p>
                  <div className="mt-5 border-t border-ink-800 pt-4">{result}</div>
                </Link>
              )}
            </Reveal>
          );
        })}
      </div>

      {brief.length > 0 ? (
        <div className="mt-4 grid gap-4">
          {brief.map((c) => (
            <Reveal key={c.slug}>
              <Link
                href={`/case/${c.slug}`}
                className="group flex flex-col gap-4 rounded-2xl border border-ink-700 bg-ink-900 p-6 transition-colors hover:border-lime/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="eyebrow text-lime">{c.scopeLabel} · {c.client}</p>
                  <h3 className="mt-2 font-display text-base font-bold uppercase leading-tight text-paper">
                    {c.title}
                  </h3>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-mute">{c.oneLiner}</p>
                </div>
                <div className="flex flex-none items-center gap-6 sm:pl-6">
                  <div>
                    <p className="font-display text-2xl font-extrabold text-paper">
                      {c.keyResult.value}
                      <DraftBadge verified={c.keyResult.verified} />
                    </p>
                    <p className="mt-1 text-xs text-mute-3">{c.keyResult.label}</p>
                  </div>
                  <span className="text-sm font-semibold text-lime group-hover:underline">→</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      ) : null}
    </Section>
  );
}
