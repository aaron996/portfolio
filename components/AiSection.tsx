import { content } from "@/content/content.vi";
import { Section } from "./ui/Section";
import { Reveal } from "./ui/Reveal";

export function AiSection() {
  const { ai } = content;
  return (
    <Section id="ai" tone="darker" className="border-b border-ink-800">
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:gap-16">
        <Reveal>
          <h2 className="display text-[clamp(1.9rem,5vw,3.25rem)]">{ai.heading}</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="text-base leading-relaxed text-mute md:text-lg">{ai.intro}</p>
        </Reveal>
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {ai.cards.map((card, i) => (
          <Reveal key={card.title} delay={i * 0.06}>
            <article className="h-full rounded-2xl border border-ink-700 bg-ink-950 p-6 transition-colors hover:border-lime/50">
              <p className="eyebrow text-lime">{card.label}</p>
              <h3 className="mt-3 font-display text-base font-bold uppercase text-paper">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-mute">{card.body}</p>
            </article>
          </Reveal>
        ))}
      </div>

      {/* Quy trình 6 bước — gộp vào đây thay vì tách section riêng, giữ trang gọn */}
      <div className="mt-16 border-t border-ink-800 pt-12">
        <p className="eyebrow text-lime">{content.process.heading}</p>
        <p className="prose-lede mt-4 text-mute">{content.process.intro}</p>
        <ol className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {content.process.steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.04}>
              <li className="border-t border-ink-800 pt-4">
                <span className="font-display text-sm font-bold text-lime">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-display text-sm font-bold uppercase text-paper">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-mute-2">{step.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  );
}
