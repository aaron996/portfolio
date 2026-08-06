import { content } from "@/content/content.vi";
import { Reveal } from "./ui/Reveal";
import { CountUp } from "./ui/CountUp";

export function StatBand() {
  return (
    <section className="border-b border-ink-800 bg-ink-900" aria-label="Số liệu tổng quan">
      <dl className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-8 px-5 py-12 sm:px-8 lg:grid-cols-4">
        {content.statBand.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06}>
            <div>
              <dd className="font-display text-[clamp(2rem,5vw,3rem)] font-extrabold leading-none text-paper">
                <CountUp value={Number(s.value)} suffix={s.suffix} />
              </dd>
              <dt className="mt-3 text-xs leading-relaxed text-mute-2">{s.label}</dt>
            </div>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
