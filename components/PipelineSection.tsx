"use client";
import { useState } from "react";
import { content } from "@/content/content.vi";
import { Section } from "./ui/Section";
import { Reveal } from "./ui/Reveal";

/**
 * Đường đi thật của một dashboard, từ yêu cầu tới production — thay cho section
 * `ai` (3 card lặp lại chính case GHN) và `process` (6 bước chung chung mà analyst
 * nào cũng viết được). Dạng rail dọc + node — quen thuộc, không phát minh gì mới.
 *
 * Điểm nhấn không nằm ở tên công cụ, mà ở hai thứ: `owner` khác "Tôi" (mắt do team
 * khác nắm), và `constraint` (ràng buộc tổ chức tạo ra mắt đó) — thứ không ai bịa
 * ra được nếu chưa sống trong tổ chức đó.
 */
export function PipelineSection() {
  const [openTradeoff, setOpenTradeoff] = useState(true);
  const { pipeline } = content;

  return (
    <Section id="pipeline" tone="darker" className="border-b border-ink-800">
      <Reveal>
        <p className="eyebrow text-lime">Cách tôi làm việc</p>
        <h2 className="display mt-4 max-w-2xl text-[clamp(1.9rem,5vw,3.25rem)]">{pipeline.heading}</h2>
        <p className="prose-lede mt-6 max-w-3xl text-mute md:text-lg">{pipeline.intro}</p>
      </Reveal>

      <ol className="mt-14 max-w-3xl">
        {pipeline.steps.map((s, i) => {
          const delegated = s.owner && s.owner !== "Tôi";
          const isLast = i === pipeline.steps.length - 1;
          return (
            <li key={s.label} className="relative pb-8 pl-14">
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="absolute left-[15px] top-8 bottom-0 w-px bg-ink-700"
                />
              )}
              <Reveal delay={i * 0.04}>
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border font-display text-[11px] font-bold tabular-nums ${
                    delegated
                      ? "border-amber-400/70 text-amber-400"
                      : "border-ink-700 bg-ink-800 text-mute-2"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className={`rounded-xl border p-5 ${delegated ? "border-amber-400/25 bg-ink-800/60" : "border-ink-700 bg-ink-900"}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-base font-bold text-paper">{s.label}</h3>
                    <span
                      className={`flex-none rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        delegated
                          ? "border-amber-400/40 bg-amber-400/10 text-amber-400"
                          : "border-ink-700 bg-ink-800 text-mute-2"
                      }`}
                    >
                      {s.owner}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs font-semibold text-lime">{s.tool}</p>

                  {s.constraint ? (
                    <p className="mt-3 rounded-r border-l-2 border-amber-400 bg-amber-400/[0.08] px-3 py-2 text-xs leading-relaxed text-paper">
                      <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wide text-amber-400">
                        Ràng buộc
                      </span>
                      {s.constraint}
                    </p>
                  ) : null}

                  <p className="mt-3 text-sm leading-relaxed text-mute">{s.body}</p>
                </div>
              </Reveal>
            </li>
          );
        })}
      </ol>

      <Reveal>
        <div className="mt-4 max-w-3xl border-t border-ink-800 pt-6">
          <button
            type="button"
            onClick={() => setOpenTradeoff((v) => !v)}
            aria-expanded={openTradeoff}
            className="text-xs font-bold uppercase tracking-wide text-lime"
          >
            {openTradeoff ? "−" : "+"} Điểm yếu của kiến trúc này
          </button>
          {openTradeoff ? (
            <p className="mt-3 text-sm leading-relaxed text-mute">{pipeline.tradeoff}</p>
          ) : null}

          <p className="mt-6 border-t border-ink-800 pt-5 text-xs leading-relaxed text-mute-3">
            {pipeline.aiNote}
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
