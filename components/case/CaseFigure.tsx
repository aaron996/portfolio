"use client";

import { useEffect, useRef, useState } from "react";
import { content } from "@/content/content.vi";
import { PortfolioIcon } from "@/components/portfolio/PortfolioIcon";
import { useCompanions } from "@/components/companions/store";

const L = content.casePage;

type Props = { src: string; alt: string; caption: string | null; wide?: boolean; priority?: boolean };

/* Ảnh trong bài. Bấm để phóng to trong một <dialog> modal (trình duyệt lo focus trap, Esc,
   trả focus). Lúc phóng, Chấm thò đầu từ sau góc phải khung ảnh (docs/companions.md, trang
   case): nằm ngoài ảnh, không nhận chuột, tắt theo nút "Ẩn bạn đồng hành". */
export function CaseFigure({ src, alt, caption, wide = false, priority = false }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const eyes = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const { enabled } = useCompanions();

  /* Mắt Chấm nhìn theo con trỏ khi đang thò đầu. */
  useEffect(() => {
    if (!open || !enabled) return;
    const move = (e: PointerEvent) => {
      const el = eyes.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 120) * 2;
      el.style.transform = `translate(${(dx / d) * k}px, ${(dy / d) * k}px)`;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [open, enabled]);

  const show = () => { dialog.current?.showModal(); setOpen(true); };
  const hide = () => dialog.current?.close();

  return <figure className="ca-figure" data-wide={wide ? "true" : undefined}>
    <button type="button" className="ca-zoom" onClick={show} aria-haspopup="dialog" aria-label={`${L.lightbox.open}: ${alt}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} />
    </button>
    {caption && <figcaption>{caption}</figcaption>}

    <dialog ref={dialog} className="lb" aria-label={alt} onClose={() => setOpen(false)}
      onClick={e => { if (e.target === e.currentTarget) hide(); }}>
      {open && <div className="lb-stage">
        {enabled && <span className="lb-chip" aria-hidden="true">
          <span className="lb-eyes"><span ref={eyes}><i /><i /></span></span>
          <span className="lb-bubble">{L.lightbox.peek}</span>
        </span>}
        <div className="lb-frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} />
          <button type="button" className="lb-close" onClick={hide} aria-label={L.lightbox.close}><PortfolioIcon name="close" /></button>
        </div>
        {caption && <p className="lb-caption">{caption}</p>}
      </div>}
    </dialog>
  </figure>;
}
