import Link from "next/link";
import { content } from "@/content/content.vi";
import { Reveal } from "./ui/Reveal";
import { DraftBadge } from "./ui/DraftBadge";
import { MediaPlaceholder } from "./ui/MediaPlaceholder";

export function FeaturedCase() {
  const c = content.cases.find((x) => x.slug === content.featuredSlug);
  if (!c) return null;
  const hero = c.media?.[0];
  const decisionCount = c.homepageDecisionCount ?? c.decisions.length;
  const homepageDecisions = c.decisions.slice(0, decisionCount);

  return (
    <section id="cases" className="border-b border-ink-800 bg-ink-950">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 md:py-28">
        <Reveal>
          <p className="eyebrow text-lime">
            {content.sectionLabels.featuredEyebrow} {c.client}
            {c.clientNote ? <span className="text-mute-3"> · {c.clientNote}</span> : null}
          </p>
          <h2 className="display mt-4 text-[clamp(2rem,5.5vw,3.75rem)]">{c.title}</h2>
          <p className="mt-4 max-w-2xl text-base font-semibold text-paper md:text-lg">{c.proves}</p>
          <p className="prose-lede mt-4 text-mute md:text-lg">{c.oneLiner}</p>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="mt-10 inline-flex flex-col rounded-2xl border border-lime/40 bg-lime/5 px-6 py-5">
            <span className="font-display text-2xl font-extrabold text-paper md:text-3xl">
              {c.keyResult.value}
              <DraftBadge verified={c.keyResult.verified} />
            </span>
            <span className="mt-2 text-sm text-mute-2">{c.keyResult.label}</span>
          </div>
        </Reveal>

        {hero ? (
          <Reveal delay={0.1}>
            <div className="mt-12">
              <MediaPlaceholder slot={hero} />
            </div>
          </Reveal>
        ) : null}

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {homepageDecisions.map((d, i) => (
            <Reveal key={d.problem} delay={i * 0.05}>
              <article className="h-full rounded-2xl border border-ink-700 bg-ink-900 p-6 transition-colors hover:border-lime/50">
                <p className="eyebrow text-lime">
                  {String(i + 1).padStart(2, "0")}
                  {d.term ? ` · ${d.term.split("—")[0].trim()}` : ""}
                </p>
                <h3 className="mt-3 font-display text-lg font-bold uppercase leading-tight text-paper">
                  {d.decision.split(".")[0]}.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-mute">{d.why}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <Link
            href={`/case/${c.slug}`}
            className="mt-10 inline-flex min-h-11 items-center rounded-lg border border-ink-700 px-6 py-3 text-sm font-semibold text-paper transition-colors hover:border-lime hover:text-lime"
          >
            Đọc case study đầy đủ ({c.decisions.length - decisionCount > 0 ? `+${c.decisions.length - decisionCount} quyết định, ` : ""}kết quả, ownership) →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
