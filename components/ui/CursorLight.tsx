"use client";

import { useEffect, useRef } from "react";

/* Vệt sáng mềm đi theo con trỏ, đúng như "light patch" trong file template:
   một hình tròn 420px trộn theo chế độ screen, nằm dưới lớp grain (z-60) và
   dưới con bot (z-45). Chỉ bật cho thiết bị có chuột thật — trên màn cảm ứng
   không có con trỏ nên vệt sáng sẽ đứng im một chỗ. */
export function CursorLight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    let frame = 0;
    let x = 0;
    let y = 0;
    let dirty = false;

    const paint = () => {
      frame = 0;
      if (!dirty) return;
      dirty = false;
      el.style.transform = `translate3d(${x}px,${y}px,0)`;
      el.style.opacity = "1";
    };

    const onMove = (event: MouseEvent) => {
      x = event.clientX;
      y = event.clientY;
      dirty = true;
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    const onLeave = () => {
      el.style.opacity = "0";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[44] -ml-[210px] -mt-[210px] h-[420px] w-[420px] rounded-full opacity-0 mix-blend-screen transition-opacity duration-500 [background:radial-gradient(circle,rgba(212,242,54,.16),rgba(212,242,54,.05)_42%,transparent_68%)]"
    />
  );
}
