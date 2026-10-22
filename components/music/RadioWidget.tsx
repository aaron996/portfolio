"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { usePathname } from "next/navigation";
import { content } from "@/content/content.vi";
import { music, musicLabel, serverMusic, toggleMusic } from "./music";
import "./music.css";

const POSITION_KEY = "pf-radio-position";
const COLLAPSED_KEY = "pf-radio-collapsed";
type Position = { x: number; y: number };
const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

function RadioIcon({ kind }: { kind: "sound" | "muted" | "minimize" | "expand" | "previous" | "next" }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "sound" || kind === "muted" ? <>
      <path d="M4 9h4l4-4v14l-4-4H4z" />
      {kind === "sound" ? <><path d="M16 8a6 6 0 0 1 0 8" /><path d="M19 5a10 10 0 0 1 0 14" /></> : <path d="m17 9 5 6m0-6-5 6" />}
    </> : kind === "minimize" ? <path d="M6 12h12" /> : kind === "expand" ? <path d="M7 10V7h3m4 0h3v3m0 4v3h-3m-4 0H7v-3" /> : <>
      <path d={kind === "previous" ? "M6 5v14m12-14L8 12l10 7z" : "M18 5v14M6 5l10 7-10 7z"} />
    </>}
  </svg>;
}

export function RadioWidget() {
  const s = useSyncExternalStore(music.subscribe, music.get, serverMusic);
  const t = content.home.music;
  const box = useRef<HTMLElement>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dismissReady, setDismissReady] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const pathname = usePathname();
  const drag = useRef<{ id: number; x: number; y: number; origin: Position; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const track = t.tracks[s.trackIndex];
  const suppressed = s.holds.some(reason => reason === "intro" || reason === "route" || reason === "mv");

  const clamp = (p: Position): Position => {
    const rect = box.current?.getBoundingClientRect();
    const margin = 12;
    return {
      x: Math.max(margin, Math.min(p.x, window.innerWidth - (rect?.width ?? 320) - margin)),
      y: Math.max(88, Math.min(p.y, window.innerHeight - (rect?.height ?? 82) - margin)),
    };
  };
  const save = (p: Position) => {
    try { localStorage.setItem(POSITION_KEY, JSON.stringify(p)); } catch { /* Optional storage. */ }
  };

  // Chừa nút cuộn ở đáy hero; vị trí người xem kéo vẫn được ưu tiên qua inline style.
  useEffect(() => {
    const hero = document.querySelector(".hs-stage");
    if (!hero) { setHeroVisible(false); return; }
    const observer = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting),
      { rootMargin: "-88px 0px 0px 0px" });
    observer.observe(hero);
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSED_KEY) === "1");
      const p = JSON.parse(localStorage.getItem(POSITION_KEY) ?? "null");
      if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) setPosition(clamp(p));
    } catch { /* Missing or invalid preference uses the default corner. */ }
  }, []);

  useEffect(() => {
    if (suppressed) return;
    const resize = () => {
      setPosition(p => {
        if (!p) return p;
        const next = clamp(p);
        return next.x === p.x && next.y === p.y ? p : next;
      });
    };
    const observer = new ResizeObserver(resize);
    if (box.current) observer.observe(box.current);
    window.addEventListener("resize", resize);
    return () => { observer.disconnect(); window.removeEventListener("resize", resize); };
  }, [suppressed]);

  // Radio vừa hiện ra sau MV (nhạc còn tắt) thì lộ dạng đĩa thu nhỏ; hiện do người xem bật nhạc thì giữ nguyên dạng đang lưu.
  const wasRevealed = useRef(s.revealed);
  useEffect(() => {
    if (s.revealed && !wasRevealed.current && !s.enabled) collapse(true);
    wasRevealed.current = s.revealed;
  }, [s.revealed]); // eslint-disable-line react-hooks/exhaustive-deps

  function collapse(next: boolean) {
    setCollapsed(next);
    try { localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0"); } catch { /* Optional storage. */ }
  }

  function dismiss() {
    music.setEnabled(false);
    music.setRevealed(false);
    setPosition(null);
    try { localStorage.removeItem(POSITION_KEY); } catch { /* Optional storage. */ }
    // Keep a keyboard route back after removing the focused disc.
    document.querySelector<HTMLButtonElement>(".mt-btn")?.focus({ preventScroll: true });
  }

  function readyToDismiss(d: NonNullable<typeof drag.current>, x: number, y: number) {
    const dy = y - d.y;
    return collapsed && dy > Math.abs(x - d.x) &&
      (dy >= 80 || (dy >= 24 && y >= window.innerHeight - 48));
  }

  function begin(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0 || !e.isPrimary || drag.current) return;
    suppressClick.current = false;
    const rect = box.current!.getBoundingClientRect();
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, origin: { x: rect.left, y: rect.top }, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  }
  function move(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.hypot(dx, dy) > 6) d.moved = true;
    if (!d.moved) return;
    suppressClick.current = true;
    const next = clamp({ x: d.origin.x + dx, y: d.origin.y + dy });
    // Track the finger directly, including a little resistance at the bottom edge.
    const overflow = collapsed ? Math.max(0, d.origin.y + dy - next.y) * 0.25 : 0;
    box.current!.style.transform = `translate(${next.x - d.origin.x}px, ${next.y - d.origin.y + overflow}px)`;
    setDismissReady(readyToDismiss(d, e.clientX, e.clientY));
  }
  function end(e: PointerEvent<HTMLDivElement>, cancelled = false) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    box.current!.style.transform = "";
    setDragging(false);
    setDismissReady(false);
    if (cancelled) return;
    if (d.moved && readyToDismiss(d, e.clientX, e.clientY)) {
      dismiss();
    } else if (d.moved) {
      const next = clamp({ x: d.origin.x + e.clientX - d.x, y: d.origin.y + e.clientY - d.y });
      setPosition(next);
      save(next);
    }
  }
  function keyMove(e: KeyboardEvent<HTMLDivElement>) {
    if (collapsed && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      collapse(false);
      return;
    }
    if (collapsed && (e.key === "Delete" || e.key === "Backspace")) {
      e.preventDefault();
      dismiss();
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      setPosition(null);
      try { localStorage.removeItem(POSITION_KEY); } catch { /* Optional storage. */ }
      return;
    }
    const delta: Record<string, Position> = {
      ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }, ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
    };
    if (!delta[e.key]) return;
    e.preventDefault();
    const rect = box.current!.getBoundingClientRect();
    const step = e.shiftKey ? 40 : 12;
    const next = clamp({ x: rect.left + delta[e.key].x * step, y: rect.top + delta[e.key].y * step });
    setPosition(next);
    save(next);
  }

  if (!track) return null;
  const needsRetry = s.status === "blocked" || s.status === "error";
  const soundOn = s.enabled && !needsRetry && (s.status !== "idle" || s.holds.length > 0);
  const label = musicLabel(s, t);
  const status = !s.enabled ? t.paused : s.holds.length ? t.held :
    s.status === "idle" ? t.blocked : t[s.status];

  return <>
  <aside ref={box} className="pf-radio" aria-label={t.label} hidden={suppressed || !s.revealed}
    data-playing={s.playing} data-collapsed={collapsed} data-dragging={dragging} data-multiple={t.tracks.length > 1} data-hero={heroVisible}
    style={position ? { left: position.x, top: position.y, right: "auto", bottom: "auto" } as CSSProperties : undefined}>
    <div className="pf-radio-main">
      <div className="pf-radio-drag" role={collapsed ? "button" : "group"} tabIndex={0}
        aria-expanded={collapsed ? false : undefined}
        aria-label={collapsed ? `${t.expand}. ${t.dismissHint}` : t.move}
        title={collapsed ? `${t.expand} · ${t.dismissHint}` : t.move}
        onClick={() => { if (collapsed && !suppressClick.current) collapse(false); }}
        onPointerDown={begin} onPointerMove={move} onPointerUp={end} onPointerCancel={e => end(e, true)}
        onLostPointerCapture={e => end(e, true)} onKeyDown={keyMove}>
        <span className="pf-radio-disc" aria-hidden="true"><span /></span>
        {!collapsed && <span className="pf-radio-copy">
          <strong title={track.title}>{track.title}</strong>
          <span className="pf-radio-status" role="status">{s.playing && <i aria-hidden="true" />}{status}</span>
          <span className="pf-radio-time" aria-hidden="true">{clock(s.elapsed)} / {clock(s.duration)}</span>
        </span>}
      </div>
      {!collapsed && t.tracks.length > 1 && <button className="pf-radio-control" type="button" onClick={() => music.step(-1, t.tracks.length)} aria-label={t.previous} title={t.previous}><RadioIcon kind="previous" /></button>}
      {!collapsed && <button className="pf-radio-control pf-radio-sound" type="button" onClick={toggleMusic}
        aria-label={label} title={label} aria-pressed={soundOn}>
        <RadioIcon kind={soundOn ? "sound" : "muted"} />
      </button>}
      {!collapsed && t.tracks.length > 1 && <button className="pf-radio-control" type="button" onClick={() => music.step(1, t.tracks.length)} aria-label={t.next} title={t.next}><RadioIcon kind="next" /></button>}
      {!collapsed && <button className="pf-radio-control" type="button" aria-expanded aria-label={t.minimize}
        title={t.minimize} onClick={() => {
          collapse(true);
          box.current?.querySelector<HTMLElement>(".pf-radio-drag")?.focus({ preventScroll: true });
        }}><RadioIcon kind="minimize" /></button>}
    </div>
    {!collapsed && <span className="pf-radio-progress" aria-hidden="true"><span /></span>}
  </aside>
  {collapsed && dragging && !suppressed && <div className="pf-radio-dismiss" data-ready={dismissReady} role="status">
    <RadioIcon kind="muted" />{dismissReady ? t.dismissRelease : t.dismissDrag}
  </div>}
  </>;
}
