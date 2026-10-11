"use client";

import { useEffect, useRef, useState } from "react";

/* Nhãn đã gắn rồi thì không gắn lại (kể cả khi chuyển trang trong app).
   Biến nằm ở module nên chỉ F5 mới xoá. */
const landed = new Set<string>();

/* Nhãn ẩn cho tới khi cuộn tới. Lúc đó nó báo `companion:badge`: nếu ba bạn đồng hành
   nhận việc (preventDefault) thì họ nhảy tới rồi gửi `badge:reveal` để nhãn rơi xuống;
   không ai nhận (tắt bạn đồng hành, giảm chuyển động…) thì nhãn tự rơi. */
export function AiBadge({ id, label, aria }: { id: string; label: string; aria: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState<"idle" | "drop" | "done">(() => landed.has(id) ? "done" : "idle");

  useEffect(() => {
    const node = ref.current;
    if (!node || landed.has(id)) return;
    let fallback: ReturnType<typeof setTimeout> | undefined;
    const reveal = (quiet: boolean) => { clearTimeout(fallback); landed.add(id); setState(quiet ? "done" : "drop"); };
    const onReveal = (e: Event) => reveal(Boolean((e as CustomEvent<{ quiet?: boolean }>).detail?.quiet));
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { reveal(true); return; }
    node.addEventListener("badge:reveal", onReveal);
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const handled = !window.dispatchEvent(new CustomEvent("companion:badge", { detail: { node }, cancelable: true }));
      // Có người nhận mà mãi không tới (vd. đang kẹt ở hero) thì đừng để nhãn ẩn vô hạn.
      fallback = setTimeout(() => reveal(false), handled ? 20000 : 0);
    }, { threshold: 1, rootMargin: "0px 0px -12% 0px" });
    io.observe(node);
    return () => { io.disconnect(); clearTimeout(fallback); node.removeEventListener("badge:reveal", onReveal); };
  }, [id]);

  return <span ref={ref} className="pf-badge" data-state={state} role="img" aria-label={aria}
    onAnimationEnd={e => { if (e.animationName === "pf-badge-drop") setState("done"); }}>{label}</span>;
}
