"use client";

import { useEffect, useRef } from "react";

export function HeroGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    /* Nghe chuột trên cả khối hero, KHÔNG phải trên canvas.
       Canvas nằm ở lớp dưới cùng (absolute inset-0), toàn bộ chữ và nút hero
       phủ lên trên nó — nên listener gắn trực tiếp vào canvas gần như không
       bao giờ nhận được mousemove, và đó là lý do lưới không sáng theo chuột.
       Sự kiện trên phần tử cha vẫn nổi lên từ mọi con, kể cả chữ. */
    const host = canvas.parentElement ?? canvas;

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
          const proximity = Math.max(0, 1 - distance / 200);
          const pulse = reduced ? 0.5 : 0.5 + 0.5 * Math.sin(time / 1176 + (x + y) / 200);
          const alpha = Math.min(1, 0.055 + pulse * 0.045 + proximity * proximity * 0.95);
          const size = 5 + proximity * proximity * 5;
          context.fillStyle =
            proximity > 0.34
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
    host.addEventListener("pointermove", onPointerMove, { passive: true });
    host.addEventListener("pointerleave", onPointerLeave);
    if (!reduced) frame = window.requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}
