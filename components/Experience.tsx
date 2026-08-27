import { content } from "@/content/content.vi";
import { Reveal } from "./ui/Reveal";

export function Experience() {
  return (
    <section id="experience" className="border-b border-ink-800">
      <div className="control-shell py-20 md:py-28">
        <Reveal>
          <h2 className="display text-[clamp(2rem,4vw,3.25rem)]">Sáu năm trong vận hành thật</h2>
        </Reveal>

        <ol className="mt-10 border-b border-ink-800">
          {content.experience.map((experience, index) => (
            <li key={`${experience.company}-${experience.period}`} className="border-t border-ink-800 py-7">
              <Reveal delay={index * 0.04}>
                <div className="grid gap-4 md:grid-cols-[9rem_minmax(0,1fr)_minmax(0,1.5fr)] md:gap-9">
                  <p className="font-display text-sm font-bold uppercase text-lime">{experience.period}</p>
                  <div>
                    <h3 className="font-display text-lg font-bold uppercase text-paper">{experience.company}</h3>
                    <p className="mt-1 text-sm leading-6 text-mute-2">{experience.role}</p>
                  </div>
                  <div>
                    <p className="text-sm leading-7 text-mute">{experience.summary}</p>
                    {experience.highlights.length ? (
                      <ul className="mt-3 space-y-2">
                        {experience.highlights.slice(0, 3).map((highlight) => (
                          <li key={highlight.slice(0, 30)} className="text-sm leading-6 text-mute-2">
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
