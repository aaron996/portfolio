"use client";

import { useEffect, useRef, useState } from "react";

/* Nhãn đã gắn rồi thì không gắn lại (kể cả khi chuyển trang trong app).
   Biến nằm ở module nên chỉ F5 mới xoá. */
const landed = new Set<string>();

export type BadgeReveal = "pop" | "drop" | "quiet";

/* Nhãn ẩn cho tới khi cuộn tới. Lúc đó nó báo `companion:badge`: nếu ba bạn đồng hành
   nhận việc (preventDefault) thì họ diễn màn thả ô lime rồi gửi `badge:reveal` để nhãn
   bật ra ("pop"); không ai nhận (tắt bạn đồng hành…) thì nhãn tự rơi ("drop"). */
export function AiBadge({ id, label, aria }: { id: string; label: string; aria: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState<"idle" | "drop" | "pop" | "done">(() => landed.has(id) ? "done" : "idle");

  useEffect(() => {
    const node = ref.current;
    if (!node || landed.has(id)) return;
    let fallback: ReturnType<typeof setTimeout> | undefined;
    let io: IntersectionObserver | undefined;
    const reveal = (mode: BadgeReveal) => {
      clearTimeout(fallback);
      io?.disconnect();
      landed.add(id);
      setState(mode === "quiet" ? "done" : mode);
    };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { reveal("quiet"); return; }
    const onReveal = (e: Event) => reveal((e as CustomEvent<{ mode?: BadgeReveal }>).detail?.mode ?? "pop");
    node.addEventListener("badge:reveal", onReveal);

    io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || landed.has(id)) return;
      io?.disconnect();
      const handled = !window.dispatchEvent(new CustomEvent("companion:badge", { detail: { node }, cancelable: true }));
      // Có người nhận mà mãi không tới (vd. đang kẹt ở hero) thì đừng để nhãn ẩn vô hạn.
      fallback = setTimeout(() => reveal("drop"), handled ? 20000 : 0);
    }, { threshold: 1, rootMargin: "0px 0px -12% 0px" });
    io.observe(node);
    return () => { io?.disconnect(); clearTimeout(fallback); node.removeEventListener("badge:reveal", onReveal); };
  }, [id]);

  return <span ref={ref} className="pf-badge" data-state={state} role="img" aria-label={aria}
    onAnimationEnd={e => { if (e.animationName === "pf-badge-drop" || e.animationName === "pf-badge-pop") setState("done"); }}>{label}</span>;
}
