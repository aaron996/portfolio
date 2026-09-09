"use client";

import { useEffect, useRef } from "react";

/** The original pixel field, drawn only on resize/pointer input rather than an idle loop. */
export function HeroPixels() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0, height = 0, x = -1000, y = -1000, frame = 0;
    const draw = () => {
      frame = 0;
      ctx.clearRect(0, 0, width, height);
      for (let px = 18; px < width; px += 36) for (let py = 18; py < height; py += 36) {
        const strength = reduced.matches ? 0 : Math.max(0, 1 - Math.hypot(px - x, py - y) / 190);
        ctx.fillStyle = `rgba(212,242,54,${0.045 + strength * strength * 0.34})`;
        const size = 3 + strength * 3;
        ctx.fillRect(px - size / 2, py - size / 2, size, size);
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };
    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = rect.width; height = rect.height;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); schedule();
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = host.getBoundingClientRect(); x = event.clientX - rect.left; y = event.clientY - rect.top; schedule();
    };
    const leave = () => { x = y = -1000; schedule(); };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerleave", leave);
    reduced.addEventListener("change", schedule);
    return () => { observer.disconnect(); host.removeEventListener("pointermove", move); host.removeEventListener("pointerleave", leave); reduced.removeEventListener("change", schedule); cancelAnimationFrame(frame); };
  }, []);
  return <canvas ref={ref} className="pf-hero-pixels" aria-hidden="true" />;
}
