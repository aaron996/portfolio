"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { content } from "@/content/content.vi";
import { containDialogTab } from "@/components/ui/dialogFocus";
import { useCompanions } from "@/components/companions/store";
import { IntroFilm } from "./IntroFilm";
import "./intro.css";

const SEEN_KEY = "pf-intro-seen";
export const INTRO_REPLAY_EVENT = "pf-intro-replay";
export const INTRO_STATE_EVENT = "pf-intro-state";
type Phase = "playing" | "closing" | "gone";

/* Intro phủ toàn màn hình (kịch bản: docs/intro-motion.md): phim motion vẽ live bằng SVG trong
   IntroFilm. File này lo hộp thoại: mở một lần mỗi phiên, tiếng, Bỏ qua, Xem lại, trả focus.
   `?intro=1.8` mở phim và đứng yên ở giây 1,8. */
export function Intro() {
  const { intro } = content.prototype;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  // SSR renders a closed dialog; only the client decides whether to play.
  const [phase, setPhase] = useState<Phase>("gone");
  const [run, setRun] = useState(0);
  const [freeze, setFreeze] = useState<number | null>(null);
  const [muted, setMuted] = useState(false);
  const [tone, setTone] = useState<"dark" | "light" | "clear">("dark");
  // Trùng đang nấp trong biểu đồ hero (ô của nó trên nav trống): cuối phim cho nó lẻn khỏi logo.
  const trungOut = useCompanions().absent.includes(1);

  const close = useCallback(() => {
    try { sessionStorage.setItem(SEEN_KEY, "1"); } catch {}
    document.documentElement.dataset.introSeen = "1";
    setPhase((p) => (p === "gone" || p === "closing" ? p : "closing"));
  }, []);
  const muteFallback = useCallback(() => setMuted(true), []);
  const unmute = useCallback(() => setMuted(false), []);

  // Read storage on every mount, including client navigation back from a case.
  useEffect(() => {
    const at = new URLSearchParams(window.location.search).get("intro");
    if (at !== null && Number.isFinite(Number(at))) {
      setFreeze(Number(at));
      setPhase("playing");
      return;
    }
    let seen = document.documentElement.dataset.introSeen === "1";
    try { seen ||= sessionStorage.getItem(SEEN_KEY) === "1"; } catch {}
    if (!seen && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPhase("playing");
  }, []);

  const active = phase !== "gone";
  useEffect(() => {
    document.documentElement.dataset.introActive = active ? "1" : "0";
    window.dispatchEvent(new CustomEvent(INTRO_STATE_EVENT));
    return () => {
      document.documentElement.dataset.introActive = "0";
      window.dispatchEvent(new CustomEvent(INTRO_STATE_EVENT));
    };
  }, [active]);
  useEffect(() => {
    if (!active) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const returnTo = returnFocusRef.current;
    returnFocusRef.current = null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();
    skipRef.current?.focus();
    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = prevOverflow;
      const destination = returnTo?.isConnected && returnTo.getClientRects().length > 0
        ? returnTo : document.getElementById("main");
      destination?.focus({ preventScroll: true });
    };
  }, [active, run]);

  // Nút "Xem lại intro" ở thanh điều hướng gửi sự kiện này. Bấm nút là một cú chạm của người
  // xem, nên lần này mở tiếng được.
  useEffect(() => {
    const replay = () => {
      returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setFreeze(null);
      setMuted(false);
      setPhase("playing");
      setRun((n) => n + 1);
    };
    window.addEventListener(INTRO_REPLAY_EVENT, replay);
    return () => window.removeEventListener(INTRO_REPLAY_EVENT, replay);
  }, []);

  useEffect(() => {
    if (phase !== "closing") return;
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 450;
    const id = setTimeout(() => setPhase("gone"), duration);
    return () => clearTimeout(id);
  }, [phase]);

  const toggleSound = () => setMuted(m => !m);

  return (
    <dialog ref={dialogRef} className="pf-intro" data-phase={phase} data-tone={tone} aria-label={intro.label}
      onKeyDown={containDialogTab} onCancel={event => { event.preventDefault(); close(); }}>
      {active && <>
        <IntroFilm key={run} freeze={freeze} sfx={intro.sfx} muted={muted} onMuteFallback={muteFallback} onUnmute={unmute} onEnd={close} onTone={setTone} trungOut={trungOut} />
        <div className="pf-intro-controls">
          {freeze === null && (
            <button type="button" className="pf-intro-icon-btn" onClick={toggleSound}
              aria-label={muted ? intro.soundOn : intro.soundOff} title={muted ? intro.soundOn : intro.soundOff}>
              <SoundIcon muted={muted} />
            </button>
          )}
          <button ref={skipRef} type="button" className="pf-intro-btn pf-intro-skip" onClick={close}>
            {intro.skip}<SkipIcon />
          </button>
        </div>
      </>}
    </dialog>
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
