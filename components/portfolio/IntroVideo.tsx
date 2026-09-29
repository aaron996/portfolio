"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { content } from "@/content/content.vi";

const SEEN_KEY = "pf-intro-seen";
const AUTO_ENTER_SECONDS = 5;

/* Chạy trước khi React hydrate: người đã xem trong phiên này hoặc bật giảm chuyển động
   thì ẩn lớp intro bằng CSS ngay từ lần vẽ đầu, không chớp màn đen. */
const PRE_PAINT = `try{if(sessionStorage.getItem("${SEEN_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.introSeen="1"}catch(e){}`;

type Phase = "playing" | "blocked" | "ended" | "closing" | "gone";

export function IntroVideo() {
  const { intro } = content.prototype;
  const videoRef = useRef<HTMLVideoElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const enterRef = useRef<HTMLButtonElement>(null);
  const [phase, setPhase] = useState<Phase>("playing");
  const [muted, setMuted] = useState(true);
  const [left, setLeft] = useState(AUTO_ENTER_SECONDS);

  const close = useCallback(() => {
    try { sessionStorage.setItem(SEEN_KEY, "1"); } catch {}
    videoRef.current?.pause();
    setPhase((p) => (p === "gone" || p === "closing" ? p : "closing"));
  }, []);

  // Quyết định có chạy intro không, khoá cuộn trang khi đang mở.
  useEffect(() => {
    if (document.documentElement.dataset.introSeen) { setPhase("gone"); return; }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    skipRef.current?.focus();
    videoRef.current?.play().catch(() => setPhase("blocked"));
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  useEffect(() => {
    if (phase === "gone") document.body.style.overflow = "";
    if (phase === "closing") {
      const id = setTimeout(() => setPhase("gone"), 450);
      return () => clearTimeout(id);
    }
    if (phase === "ended") {
      enterRef.current?.focus();
      setLeft(AUTO_ENTER_SECONDS);
      const id = setInterval(() => setLeft((s) => s - 1), 1000);
      return () => clearInterval(id);
    }
  }, [phase]);

  useEffect(() => { if (phase === "ended" && left <= 0) close(); }, [phase, left, close]);

  useEffect(() => {
    if (phase === "gone") return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, close]);

  if (phase === "gone") return null;

  const toggleSound = () => {
    const v = videoRef.current; if (!v) return;
    v.muted = !v.muted; setMuted(v.muted);
  };
  const playNow = () => {
    const v = videoRef.current; if (!v) return;
    v.play().then(() => setPhase("playing")).catch(() => close());
  };

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: PRE_PAINT }} />
      <div className="pf-intro" data-phase={phase} role="dialog" aria-modal="true" aria-label={intro.label}>
        <div className="pf-intro-frame">
          <video
            ref={videoRef}
            className="pf-intro-video"
            src={intro.src}
            muted
            playsInline
            preload="auto"
            onEnded={() => setPhase("ended")}
            onError={close}
          />
          {phase === "ended" && (
            <div className="pf-intro-end">
              <button ref={enterRef} type="button" className="pf-intro-btn pf-intro-primary" onClick={close}>{intro.enter}</button>
              <p className="pf-intro-countdown" aria-live="polite">{intro.countdown.replace("{s}", String(Math.max(0, left)))}</p>
            </div>
          )}
        </div>
        <div className="pf-intro-controls">
          {phase === "blocked" && (
            <button type="button" className="pf-intro-btn pf-intro-primary" onClick={playNow}>{intro.play}</button>
          )}
          {phase !== "ended" && (
            <button type="button" className="pf-intro-btn" onClick={toggleSound} aria-pressed={!muted}>
              {muted ? intro.soundOn : intro.soundOff}
            </button>
          )}
          {phase !== "ended" && (
            <button ref={skipRef} type="button" className="pf-intro-btn" onClick={close}>{intro.skip}</button>
          )}
        </div>
      </div>
    </>
  );
}
