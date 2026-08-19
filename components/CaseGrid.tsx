import Link from "next/link";
import { content } from "@/content/content.vi";
import { Section, SectionHeading } from "./ui/Section";
import { Reveal } from "./ui/Reveal";
import { DraftBadge } from "./ui/DraftBadge";

/**
 * Ba case còn lại chia theo tier: "deep" (2 case GHN) render thành card ngang
 * đầy đủ scopeLabel + proves; "brief" (Shopee) render mỏng hơn hẳn — thành một
 * dải kết quả (result strip), không phải card thứ ba cùng cỡ. Chính sự chênh
 * kích cỡ này là hierarchy nhìn thấy được, thay vì 3 card giống hệt nhau.
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
        {deep.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.06}>
            <Link
              href={`/case/${c.slug}`}
              className="group flex h-full flex-col rounded-2xl border border-ink-700 bg-ink-900 p-6 transition-all hover:-translate-y-1 hover:border-lime/50"
            >
              <p className="eyebrow text-lime">{c.scopeLabel}</p>
              <h3 className="mt-3 font-display text-lg font-bold uppercase leading-tight text-paper">
                {c.title}
              </h3>
              <p className="mt-2 text-sm font-semibold text-paper">{c.proves}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-mute">{c.oneLiner}</p>
              <div className="mt-5 border-t border-ink-800 pt-4">
                <p className="font-display text-base font-bold text-paper">
                  {c.keyResult.value}
                  <DraftBadge verified={c.keyResult.verified} />
                </p>
                <p className="mt-1 text-xs text-mute-3">{c.keyResult.label}</p>
              </div>
              <span className="mt-4 text-sm font-semibold text-lime group-hover:underline">
                Xem chi tiết →
              </span>
            </Link>
          </Reveal>
        ))}
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
