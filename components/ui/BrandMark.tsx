"use client";

import { useEffect, useRef } from "react";
import { useCompanions } from "@/components/companions/store";

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

/* Ba ô sáng của logo là nhà của ba bạn đồng hành (docs/companions.md). Bật
   `companions` thì khi chúng ra ngoài, ba ô đó thành ô trống viền nét đứt. */
export function BrandMark({ className = "", companions = false }: { className?: string; companions?: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const state = useCompanions();
  const away = companions && state.enabled && state.place !== "home";
  const awayRef = useRef(away);
  awayRef.current = away;

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
      if (awayRef.current) return; // nhà đang vắng — không có ô nào để xếp lại
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
      {CELLS.map((cell) => {
        const empty = away && IDLE.includes(cell.index);
        return <rect
          key={cell.index}
          x={empty ? cell.x + 0.5 : cell.x}
          y={empty ? cell.y + 0.5 : cell.y}
          width={empty ? 6 : 7}
          height={empty ? 6 : 7}
          fill={empty ? "transparent" : IDLE.includes(cell.index) ? "#d4f236" : "#3a3a33"}
          stroke={empty ? "#9b978a" : "none"}
          strokeWidth={1}
          strokeDasharray={empty ? "1.6 1.2" : undefined}
          style={{ transition: "fill 250ms ease" }}
        />;
      })}
    </svg>
  );
}
