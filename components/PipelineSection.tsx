"use client";

import { useState } from "react";
import { content } from "@/content/content.vi";
import { Reveal } from "./ui/Reveal";

export function PipelineSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="pipeline" className="border-b border-ink-800 bg-ink-925">
      <div className="control-shell py-20 md:py-28">
        <Reveal>
          <p className="eyebrow text-lime">Cách tôi làm việc</p>
          <h2 className="display mt-4 max-w-[26ch] text-[clamp(2rem,4vw,3.25rem)]">{content.pipeline.heading}</h2>
          <p className="mt-6 max-w-[75ch] text-base leading-8 text-mute">{content.pipeline.intro}</p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {content.pipeline.steps.map((step, index) => (
            <Reveal key={step.label} delay={index * 0.04}>
              <article className="group h-full rounded-2xl border border-ink-700 bg-ink-900 p-5 transition duration-300 hover:-translate-y-1 hover:border-lime/45">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-xs text-mute-3">{String(index + 1).padStart(2, "0")}</span>
                  <span className="rounded-full border border-ink-700 bg-ink-800 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.05em] text-mute-2">
                    {step.owner}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-base font-bold leading-snug text-paper">{step.label}</h3>
                <p className="mt-2 text-xs font-semibold text-lime">{step.tool}</p>
                {step.constraint ? (
                  <p className="mt-4 border-l-2 border-lime bg-lime/[0.05] px-3 py-2 text-xs leading-5 text-mute">
                    <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-[0.06em] text-lime">Ràng buộc</span>
                    {step.constraint}
                  </p>
                ) : null}
                <p className="mt-4 text-[13px] leading-6 text-mute-2">{step.body}</p>
              </article>
            </Reveal>
          ))}

          <Reveal delay={0.28}>
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              className="h-full w-full rounded-2xl border border-dashed border-ink-700 p-5 text-left transition-colors hover:border-lime/50"
            >
              <span className="font-mono text-xs text-lime">Điểm yếu đã biết</span>
              <span className="mt-4 block font-display text-base font-bold text-paper">Điểm yếu của kiến trúc này</span>
              <span className={`mt-4 block text-[13px] leading-6 ${expanded ? "text-mute" : "text-mute-3"}`}>
                {expanded ? content.pipeline.tradeoff : "Bấm để xem chỗ tôi biết là chưa tốt."}
              </span>
            </button>
          </Reveal>
        </div>

        <p className="mt-8 max-w-[78ch] border-t border-ink-800 pt-6 text-sm leading-7 text-mute-3">
          {content.pipeline.aiNote}
        </p>
      </div>
    </section>
  );
}
