"use client";

import type { ReactNode } from "react";
import { motion, useIsPresent, useReducedMotion } from "motion/react";

export function AnimatedContent({ children, spatialMotion }: { children: ReactNode; spatialMotion: boolean }) {
  const present = useIsPresent();
  const reducedMotion = useReducedMotion();
  const move = spatialMotion && !reducedMotion;

  return <motion.div className="co-animated-content" inert={!present} aria-hidden={!present || undefined}
    initial={{ opacity: 0, transform: move ? "translateX(12px) scale(0.98)" : "none" }}
    animate={{ opacity: 1, transform: move ? "translateX(0px) scale(1)" : "none" }}
    exit={{ opacity: 0, transform: move ? "translateX(8px) scale(0.99)" : "none",
      transition: { duration: reducedMotion ? 0.06 : 0.1, ease: [0.23, 1, 0.32, 1] } }}
    transition={{ duration: reducedMotion ? 0.08 : 0.18, ease: [0.23, 1, 0.32, 1] }}>
    {children}
  </motion.div>;
}
