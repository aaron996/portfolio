import Link from "next/link";
import { content } from "@/content/content.vi";
import { Section, SectionHeading } from "./ui/Section";
import { Reveal } from "./ui/Reveal";

export function CaseGrid() {
  const others = content.cases.filter((c) => c.slug !== content.featuredSlug);
  return (
    <Section id="projects" className="border-b border-ink-800">
      <SectionHeading eyebrow="Dự án khác">Ba hệ thống, ba loại bài toán</SectionHeading>
      <div className="grid gap-4 md:grid-cols-3">
        {others.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.06}>
            <Link
              href={`/case/${c.slug}`}
              className="group flex h-full flex-col rounded-2xl border border-ink-700 bg-ink-900 p-6 transition-all hover:-translate-y-1 hover:border-lime/50"
            >
              <p className="eyebrow text-lime">
                {c.kindLabel} · {c.client.split("(")[0].trim()}
              </p>
              <h3 className="mt-3 font-display text-lg font-bold uppercase leading-tight text-paper">
                {c.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-mute">{c.oneLiner}</p>
              <p className="mt-5 text-xs text-mute-3">
                {c.stack.flatMap((g) => g.items).slice(0, 4).join(" · ")}
              </p>
              <span className="mt-4 text-sm font-semibold text-lime group-hover:underline">
                Xem chi tiết →
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
