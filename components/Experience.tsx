import { content } from "@/content/content.vi";
import { Section, SectionHeading } from "./ui/Section";
import { Reveal } from "./ui/Reveal";

export function Experience() {
  return (
    <Section id="experience" className="border-b border-ink-800">
      <SectionHeading eyebrow="Kinh nghiệm">Sáu năm trong vận hành thật</SectionHeading>
      <ol>
        {content.experience.map((e, i) => (
          <li key={e.company} className="border-t border-ink-800 py-8 last:border-b">
            <Reveal delay={i * 0.04}>
              <div className="grid gap-4 md:grid-cols-[9rem_minmax(0,1fr)_minmax(0,1.6fr)] md:gap-8">
                <p className="font-display text-sm font-bold uppercase text-lime">{e.period}</p>
                <div>
                  <h3 className="font-display text-lg font-bold uppercase text-paper">
                    {e.company}
                  </h3>
                  <p className="mt-1 text-sm text-mute-2">{e.role}</p>
                </div>
                <div>
                  <p className="text-sm leading-relaxed text-mute">{e.summary}</p>
                  <ul className="mt-3 space-y-1.5">
                    {e.highlights.map((h) => (
                      <li key={h.slice(0, 20)} className="text-sm leading-relaxed text-mute-2">
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
