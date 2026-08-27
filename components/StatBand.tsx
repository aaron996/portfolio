import { content } from "@/content/content.vi";
import { CountUp } from "./ui/CountUp";

export function StatBand() {
  return (
    <div className="relative border-t border-ink-800 bg-ink-925/80" aria-label="Số liệu tổng quan">
      <dl className="grid grid-cols-2 lg:grid-cols-4">
        {content.statBand.map((stat, index) => (
          <div
            key={stat.label}
            className={`px-5 py-6 sm:px-8 lg:px-9 ${index % 2 === 0 ? "border-r border-ink-800" : ""} ${index < 2 ? "border-b border-ink-800 lg:border-b-0" : ""} ${index > 0 ? "lg:border-l lg:border-ink-800" : ""}`}
          >
            <dd className="font-display text-[clamp(2rem,4.2vw,2.7rem)] font-extrabold leading-none text-paper">
              <CountUp value={stat.value} />
              {stat.suffix ? <span className="text-lime">{stat.suffix}</span> : null}
            </dd>
            <dt className="mt-2.5 max-w-[26ch] text-xs leading-5 text-mute-2">{stat.label}</dt>
            {stat.note ? <p className="mt-1 text-[10px] leading-4 text-mute-3">{stat.note}</p> : null}
          </div>
        ))}
      </dl>
    </div>
  );
}
