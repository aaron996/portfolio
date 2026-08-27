"use client";

import { useEffect, useRef } from "react";

/* Nút "hút" con trỏ: dịch nhẹ theo hướng chuột khi lơ lửng bên trên, đúng hành
   vi data-magnet trong template. Bọc bằng span inline-flex nên nút vẫn là item
   hợp lệ trong flex container ngoài. */
export function Magnetic({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (event: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
      const dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
      el.style.transform = `translate(${(dx * 8).toFixed(1)}px,${(dy * 6).toFixed(1)}px)`;
    };
    const onLeave = () => {
      el.style.transform = "translate(0,0)";
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <span
      ref={ref}
      className={`transition-transform duration-300 [transition-timing-function:cubic-bezier(.22,1,.36,1)] ${
        className || "inline-flex"
      }`}
    >
      {children}
    </span>
  );
}
