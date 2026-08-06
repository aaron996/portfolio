"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import type { Decision } from "@/content/types";

function DecisionCard({ decision, index, compact = false }: { decision: Decision; index: number; compact?: boolean }) {
  return (
    <article className={`rounded-2xl border border-ink-700 bg-ink-900 ${compact ? "p-6" : "p-7 lg:p-9"}`}>
      <p className="eyebrow text-lime">
        {String(index + 1).padStart(2, "0")}
        {decision.term ? ` · ${decision.term.split("—")[0].trim()}` : ""}
      </p>
      <h3 className="mt-4 font-display text-xl font-bold uppercase leading-tight text-paper lg:text-2xl">
        {decision.problem}
      </h3>
      <p className="mt-5 text-sm leading-relaxed text-mute">{decision.why}</p>
      <div className="mt-6 border-t border-ink-700 pt-5">
        <p className="eyebrow text-mute-3">Quyết định</p>
        <p className="mt-3 text-sm font-medium leading-relaxed text-paper">{decision.decision}</p>
      </div>
    </article>
  );
}

export function DecisionStepper({ decisions }: { decisions: Decision[] }) {
  const [active, setActive] = useState(0);
  const reducedMotion = useReducedMotion();

  return (
    <>
      <div className="mt-12 grid gap-4 md:hidden">
        {decisions.map((decision, index) => (
          <DecisionCard key={decision.problem} decision={decision} index={index} compact />
        ))}
      </div>

      <div className="mt-14 hidden grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] gap-8 md:grid lg:gap-12">
        <div className="flex flex-col" aria-label="Các quyết định dữ liệu">
          {decisions.map((decision, index) => {
            const selected = index === active;
            return (
              <button
                key={decision.problem}
                type="button"
                aria-pressed={selected}
                onClick={() => setActive(index)}
                className={`group grid grid-cols-[2.5rem_1fr] gap-4 border-b border-ink-700 py-5 text-left transition-colors first:pt-0 ${
                  selected ? "text-paper" : "text-mute-3 hover:text-mute"
                }`}
              >
                <span className={`font-display text-sm font-bold ${selected ? "text-lime" : "text-mute-3"}`}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-sm font-bold uppercase leading-snug lg:text-base">
                  {decision.decision.split(".")[0]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative min-h-[27rem]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={decisions[active].problem}
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <DecisionCard decision={decisions[active]} index={active} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
