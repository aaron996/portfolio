"use client";

import { useEffect, useRef } from "react";

const IDLE = [2, 4, 6];
/* Bốn thế "đường chéo" mà ô sáng lần lượt chuyển sang — giống một ma trận đang
   được sắp lại. */
const PERMUTATIONS = [
  [0, 4, 8],
  [1, 4, 7],
  [2, 4, 6],
  [3, 4, 5],
];

const CELLS = Array.from({ length: 9 }, (_, index) => ({
  index,
  x: (index % 3) * 9.5,
  y: Math.floor(index / 3) * 9.5,
}));

export function BrandMark({ className = "" }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const link = svg.closest("a");
    if (!link) return;

    const rects = Array.from(svg.querySelectorAll<SVGRectElement>("rect"));
    const paint = (lit: number[]) => {
      rects.forEach((rect, index) => {
        rect.setAttribute("fill", lit.includes(index) ? "#d4f236" : "#3a3a33");
      });
    };

    let timer: ReturnType<typeof setInterval> | undefined;
    const onEnter = () => {
      if (timer) clearInterval(timer);
      let step = 0;
      timer = setInterval(() => {
        paint(PERMUTATIONS[step % PERMUTATIONS.length]);
        step += 1;
        if (step > 5) {
          clearInterval(timer);
          timer = undefined;
          paint(IDLE);
        }
      }, 130);
    };

    link.addEventListener("mouseenter", onEnter);
    return () => {
      link.removeEventListener("mouseenter", onEnter);
      if (timer) clearInterval(timer);
    };
  }, []);

  return (
    <svg ref={svgRef} viewBox="0 0 26 26" className={className} aria-hidden="true">
      {CELLS.map((cell) => (
        <rect
          key={cell.index}
          x={cell.x}
          y={cell.y}
          width={7}
          height={7}
          fill={IDLE.includes(cell.index) ? "#d4f236" : "#3a3a33"}
          style={{ transition: "fill 250ms ease" }}
        />
      ))}
    </svg>
  );
}
