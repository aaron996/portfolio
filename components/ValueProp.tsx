import { content } from "@/content/content.vi";
import { Reveal } from "./ui/Reveal";

const KEYWORDS = ["Analyze", "Simplify", "Automate", "Visualize", "Improve"];

export function ValueProp() {
  return (
    <section className="border-b border-ink-800 bg-lime text-ink-950">
      <div className="control-shell py-20 md:py-28">
        <Reveal>
          <h2 className="display text-[clamp(2rem,6.5vw,4.5rem)]">{content.sectionLabels.ctaHeading}</h2>
          <p className="prose-lede mt-8 text-base leading-relaxed text-ink-950/80 md:text-lg">
            {content.sectionLabels.ctaBody}
          </p>
        </Reveal>
      </div>
      <div className="border-t border-ink-950/20 py-4">
        <div className="marquee-wrap overflow-hidden" aria-hidden="true">
          <div className="marquee-track">
            {[...KEYWORDS, ...KEYWORDS].map((k, i) => (
              <span key={`${k}-${i}`} className="flex shrink-0 items-center">
                <span className="px-6 font-display text-lg font-extrabold uppercase">{k}</span>
                <span className="text-ink-950/40">+</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
