"use client";

import { useEffect, useRef, useState } from "react";

export function CountUp({ value, suffix = "", duration = 1000 }: { value: number; suffix?: string; duration?: number }) {
  const root = useRef<HTMLSpanElement>(null);
  const played = useRef(false);
  const decimals = String(value).split(".")[1]?.length ?? 0;
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const element = root.current;
    if (!element) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || played.current) return;
        played.current = true;
        observer.disconnect();

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const startedAt = performance.now();
        setDisplay(0);

        const tick = (now: number) => {
          const progress = Math.min((now - startedAt) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(value * eased);
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.45 }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [duration, value]);

  return (
    <span ref={root} aria-label={`${value}${suffix}`}>
      <span aria-hidden="true">{display.toFixed(decimals)}</span>
      {suffix ? <span className="text-lime" aria-hidden="true">{suffix}</span> : null}
    </span>
  );
}
