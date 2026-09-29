"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { content } from "@/content/content.vi";

const SEEN_KEY = "pf-intro-seen";
const AUTO_ENTER_SECONDS = 5;
export const INTRO_REPLAY_EVENT = "pf-intro-replay";

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
  const [muted, setMuted] = useState(false);
  const [left, setLeft] = useState(AUTO_ENTER_SECONDS);
  const [run, setRun] = useState(0);

  const close = useCallback(() => {
    try { sessionStorage.setItem(SEEN_KEY, "1"); } catch {}
    videoRef.current?.pause();
    setPhase((p) => (p === "gone" || p === "closing" ? p : "closing"));
  }, []);

  // Quyết định có chạy intro không, khoá cuộn trang khi đang mở. Chạy lại mỗi lần `run` đổi (xem lại intro).
  useEffect(() => {
    if (document.documentElement.dataset.introSeen) { setPhase("gone"); return; }
    const v = videoRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    skipRef.current?.focus();
    if (v) {
      // Mặc định mở tiếng. Trình duyệt chặn autoplay có tiếng thì lùi về phát câm, người xem bấm loa để bật.
      v.currentTime = 0;
      v.muted = false;
      v.play().catch(() => {
        v.muted = true;
        v.play().catch(() => setPhase("blocked"));
      });
    }
    return () => { document.body.style.overflow = prevOverflow; };
  }, [run]);

  // Nút "Xem lại intro" ở thanh điều hướng gửi sự kiện này.
  useEffect(() => {
    const replay = () => {
      delete document.documentElement.dataset.introSeen;
      setLeft(AUTO_ENTER_SECONDS);
      setPhase("playing");
      setRun((n) => n + 1);
    };
    window.addEventListener(INTRO_REPLAY_EVENT, replay);
    return () => window.removeEventListener(INTRO_REPLAY_EVENT, replay);
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
    v.muted = !v.muted;
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
            playsInline
            preload="auto"
            onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
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
            <button type="button" className="pf-intro-icon-btn" onClick={toggleSound} aria-label={muted ? intro.soundOn : intro.soundOff} title={muted ? intro.soundOn : intro.soundOff}>
              <SoundIcon muted={muted} />
            </button>
          )}
          {phase !== "ended" && (
            <button ref={skipRef} type="button" className="pf-intro-icon-btn" onClick={close} aria-label={intro.skip} title={intro.skip}>
              <SkipIcon />
            </button>
          )}
        </div>
      </div>
    </>
  );
}

const svg = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

function SoundIcon({ muted }: { muted: boolean }) {
  return (
    <svg {...svg}>
      <path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor" />
      {muted ? (
        <path d="m16 9 5 6M21 9l-5 6" />
      ) : (
        <>
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </>
      )}
    </svg>
  );
}

function SkipIcon() {
  return (
    <svg {...svg}>
      <path d="m5 5 10 7-10 7V5Z" fill="currentColor" />
      <path d="M19 5v14" />
    </svg>
  );
}
