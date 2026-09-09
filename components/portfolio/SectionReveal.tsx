"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "li";
}

/**
 * SectionReveal: Progressive enhancement viewport entrance animation.
 * SSR & no-JS: Renders standard <div> with 100% opacity, never hides content.
 * Client hydrated: Triggers single-shot entrance animation ([0.22, 1, 0.36, 1]), once: true.
 * Reduced motion: Instantly visible with no motion.
 */
export function SectionReveal({
  children,
  className = "",
  delay = 0,
  y = 16,
  as = "div",
}: SectionRevealProps) {
  const [mounted, setMounted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || reducedMotion) {
    const Tag = as;
    return <Tag className={className} data-revealed="true">{children}</Tag>;
  }

  const MotionTag = as === "li" ? motion.li : motion.div;
  return (
    <MotionTag
      className={className}
      data-revealed={revealed}
      onViewportEnter={() => setRevealed(true)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.42,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </MotionTag>
  );
}
