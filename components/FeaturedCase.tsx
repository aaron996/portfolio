import Link from "next/link";
import { content } from "@/content/content.vi";
import { Reveal } from "./ui/Reveal";
import { DraftBadge } from "./ui/DraftBadge";
import { MediaPlaceholder } from "./ui/MediaPlaceholder";
import { DecisionStepper } from "./ui/DecisionStepper";

export function FeaturedCase() {
  const c = content.cases.find((x) => x.slug === content.featuredSlug);
  if (!c) return null;
  const hero = c.media[0];

  return (
    <section id="featured" className="border-b border-ink-800 bg-ink-950">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 md:py-28">
        <Reveal>
          <p className="eyebrow text-lime">
            Case study · {c.client}
          </p>
          <h2 className="display mt-4 text-[clamp(2rem,5.5vw,3.75rem)]">{c.title}</h2>
          <p className="prose-lede mt-6 text-mute md:text-lg">{c.oneLiner}</p>
        </Reveal>

        {hero ? (
          <Reveal delay={0.1}>
            <div className="mt-12">
              <MediaPlaceholder slot={hero} />
            </div>
          </Reveal>
        ) : null}

        <DecisionStepper decisions={c.decisions} />

        {c.results.length > 0 ? (
          <Reveal>
            <div className="mt-10 rounded-2xl border border-lime/40 bg-lime/5 p-6 md:p-8">
              <p className="eyebrow text-lime">Kết quả</p>
              <dl className="mt-5 grid gap-6 md:grid-cols-3">
                {c.results.map((r) => (
                  <div key={r.label}>
                    <dd className="font-display text-xl font-bold text-paper">
                      {r.value.value}
                      <DraftBadge todo={r.value.todo} />
                    </dd>
                    <dt className="mt-2 text-xs leading-relaxed text-mute-2">{r.method}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        ) : null}

        <Reveal>
          <Link
            href={`/case/${c.slug}`}
            className="mt-10 inline-flex min-h-11 items-center rounded-lg border border-ink-700 px-6 py-3 text-sm font-semibold text-paper transition-colors hover:border-lime hover:text-lime"
          >
            Đọc case study đầy đủ →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
