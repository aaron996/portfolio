"use client";

import { useEffect, useRef } from "react";
import { content } from "@/content/content.vi";
import { readProgress } from "./reading";

export function ReadProgress() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const p = readProgress();
      el.style.transform = `scaleX(${p})`;
      el.parentElement?.setAttribute("aria-valuenow", String(Math.round(p * 100)));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return <span className="site-progress" role="progressbar" aria-label={content.casePage.progress} aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}>
    <span ref={ref} />
  </span>;
}
