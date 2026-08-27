"use client";

import { useEffect, useRef, useState } from "react";

const DURATION = 1500;

/* Định dạng đúng như template: ≥1000 dùng dấu phân cách kiểu Việt, số thập phân
   giữ 1 chữ số, còn lại làm tròn. */
function format(value: number, target: number) {
  if (target >= 1000) return Math.round(value).toLocaleString("vi-VN");
  if (String(target).includes(".")) return value.toFixed(1);
  return String(Math.round(value));
}

export function CountUp({ value }: { value: string }) {
  const target = Number.parseFloat(value.replace(/[^\d.]/g, ""));
  const parsable = Number.isFinite(target);
  const ref = useRef<HTMLSpanElement>(null);
  const [text, setText] = useState(() => (parsable ? format(0, target) : value));

  useEffect(() => {
    if (!parsable) return;
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(format(target, target));
      return;
    }

    let frame = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const k = Math.min(1, (now - start) / DURATION);
      setText(format(target * (1 - Math.pow(1 - k, 3)), target));
      if (k < 1) frame = window.requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        frame = window.requestAnimationFrame(tick);
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [parsable, target]);

  return (
    <span ref={ref} aria-label={value}>
      {text}
    </span>
  );
}
