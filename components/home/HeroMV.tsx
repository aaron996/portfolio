"use client";

import { useEffect, useRef, useState } from "react";
import { content } from "@/content/content.vi";
import { containDialogTab } from "@/components/ui/dialogFocus";
import { PortfolioIcon } from "@/components/portfolio/PortfolioIcon";
import { music } from "@/components/music/music";

/* MV "How Long" ở hero. Khung được đặt sẵn (ẩn) ngay khi sắp xong biểu đồ để Trùng đo chỗ
   đứng; Trùng nhảy lên mép trên và giậm thì `shown` bật, màn hình mở ra như TV cũ.
   Bấm khung: nhạc nền im, MV phát to có tiếng; đóng lại thì nhạc chạy tiếp. */
export function HeroMV({ done, shown }: { done: boolean; shown: boolean }) {
  const mv = content.home.music.mv;
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const d = dialogRef.current, v = videoRef.current;
    if (!open || !d) return;
    music.hold("mv", true);
    if (!d.open) d.showModal();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    v?.play().catch(() => {});
    return () => {
      v?.pause();
      if (d.open) d.close();
      document.body.style.overflow = prevOverflow;
      music.hold("mv", false);
      cardRef.current?.focus({ preventScroll: true });
    };
  }, [open]);

  if (!done) return null;

  return <>
    <button ref={cardRef} type="button" className="hmv-card" data-shown={shown} tabIndex={shown ? 0 : -1}
      aria-hidden={!shown} onClick={() => setOpen(true)} aria-label={mv.play}>
      <span className="hmv-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mv.poster} alt="" width={1280} height={720} decoding="async" />
        <span className="hmv-play" aria-hidden="true"><PortfolioIcon name="play" /></span>
        <span className="hmv-time">{mv.duration}</span>
      </span>
      <span className="hmv-caption">
        <b>{mv.title}</b>
        <span>{mv.meta}</span>
      </span>
    </button>

    <dialog ref={dialogRef} className="hmv-dialog" aria-label={mv.label} onKeyDown={containDialogTab}
      onCancel={(e) => { e.preventDefault(); setOpen(false); }}
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      {open && <div className="hmv-player">
        <div className="hmv-bar">
          <span>{mv.title} <em>{mv.meta}</em></span>
          <button type="button" className="hmv-close" onClick={() => setOpen(false)} aria-label={mv.close} title={mv.close}>
            <PortfolioIcon name="close" />
          </button>
        </div>
        <video ref={videoRef} src={mv.src} poster={mv.poster} controls playsInline preload="auto" />
      </div>}
    </dialog>
  </>;
}
