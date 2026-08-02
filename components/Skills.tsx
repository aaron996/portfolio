import { content } from "@/content/content.vi";
import { Section, SectionHeading } from "./ui/Section";
import { Reveal } from "./ui/Reveal";

export function Skills() {
  return (
    <Section id="skills" tone="darker" className="border-b border-ink-800">
      <SectionHeading eyebrow="Năng lực">Năng lực dữ liệu &amp; sản phẩm</SectionHeading>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {content.skills.map((g, i) => (
          <Reveal key={g.title} delay={i * 0.05}>
            <div className="h-full rounded-2xl border border-ink-700 bg-ink-950 p-6 transition-colors hover:border-lime/50">
              <h3 className="font-display text-base font-bold uppercase text-paper">{g.title}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {g.items.map((it) => (
                  <li
                    key={it}
                    className="rounded-full border border-ink-700 px-3 py-1 text-xs text-mute"
                  >
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
