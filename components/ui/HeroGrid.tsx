"use client";

import { useEffect, useRef } from "react";

export function HeroGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const pointer = { x: -9999, y: -9999 };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let width = 0;
    let height = 0;
    let last = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time = 0) => {
      context.clearRect(0, 0, width, height);
      const step = 36;

      for (let x = step / 2; x < width; x += step) {
        for (let y = step / 2; y < height; y += step) {
          const distance = Math.hypot(x - pointer.x, y - pointer.y);
          const proximity = Math.max(0, 1 - distance / 210);
          const pulse = reduced ? 0.5 : 0.5 + 0.5 * Math.sin(time / 1200 + (x + y) / 210);
          const alpha = Math.min(1, 0.05 + pulse * 0.035 + proximity * proximity * 0.85);
          const size = 4 + proximity * proximity * 6;
          context.fillStyle =
            proximity > 0.3
              ? `rgba(212,242,54,${alpha.toFixed(3)})`
              : `rgba(150,150,138,${alpha.toFixed(3)})`;
          context.fillRect(x - size / 2, y - size / 2, size, size);
        }
      }
    };

    const loop = (time: number) => {
      if (time - last > 32) {
        draw(time);
        last = time;
      }
      frame = window.requestAnimationFrame(loop);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      if (reduced) draw();
    };
    const onPointerLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
      if (reduced) draw();
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("pointerleave", onPointerLeave);
    if (!reduced) frame = window.requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}
