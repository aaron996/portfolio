"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { content } from "@/content/content.vi";
import { INTRO_STATE_EVENT } from "@/components/portfolio/IntroVideo";
import { music, PREF_KEY, serverMusic } from "./music";

const VOLUME = 0.35;
const FADE_MS = 600;

/* Nhạc nền "How Long", gắn ở layout để không ngắt khi chuyển trang. Trình duyệt chặn phát
   có tiếng trước khi người xem tương tác, nên nhạc chỉ bắt đầu sau cú chạm/bấm phím đầu tiên
   (kể cả cú bấm "Bỏ qua intro"). */
export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const unlocked = useRef(false);
  const fade = useRef<number | null>(null);
  const s = useSyncExternalStore(music.subscribe, music.get, serverMusic);
  const pathname = usePathname();
  const shouldPlay = s.enabled && s.holds.length === 0;
  const want = useRef(shouldPlay);
  want.current = shouldPlay;

  useEffect(() => {
    try { if (localStorage.getItem(PREF_KEY) === "0") music.setEnabled(false); } catch {}
  }, []);

  // Trang game có âm thanh riêng.
  useEffect(() => { music.hold("route", pathname.startsWith("/game")); }, [pathname]);

  // Intro có tiếng riêng; tab ẩn thì cũng im.
  useEffect(() => {
    const intro = () => music.hold("intro", document.documentElement.dataset.introActive === "1");
    const vis = () => music.hold("hidden", document.hidden);
    intro();
    window.addEventListener(INTRO_STATE_EVENT, intro);
    document.addEventListener("visibilitychange", vis);
    return () => {
      window.removeEventListener(INTRO_STATE_EVENT, intro);
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);

  const ramp = useCallback((to: number, done?: () => void) => {
    const a = audioRef.current;
    if (!a) return;
    if (fade.current) cancelAnimationFrame(fade.current);
    const from = a.volume, t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / FADE_MS);
      a.volume = from + (to - from) * k;
      if (k < 1) fade.current = requestAnimationFrame(step);
      else { fade.current = null; done?.(); }
    };
    fade.current = requestAnimationFrame(step);
  }, []);

  const start = useCallback(() => {
    const a = audioRef.current;
    if (!a || !unlocked.current || !want.current) return;
    if (a.paused) a.volume = 0;
    a.play().then(() => { music.setPlaying(true); ramp(VOLUME); }).catch(() => music.setPlaying(false));
  }, [ramp]);

  // Cú tương tác đầu tiên mở khoá âm thanh.
  useEffect(() => {
    const unlock = () => {
      if (unlocked.current) return;
      unlocked.current = true;
      // Đợi các handler của cú bấm này chạy xong (vd. đóng intro) rồi mới quyết định phát.
      setTimeout(start, 0);
    };
    window.addEventListener("pointerdown", unlock, true);
    window.addEventListener("keydown", unlock, true);
    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
    };
  }, [start]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (shouldPlay) { start(); return; }
    music.setPlaying(false);
    if (!a.paused) ramp(0, () => a.pause());
  }, [shouldPlay, start, ramp]);

  return <audio ref={audioRef} src={content.home.music.src} loop preload="none" aria-hidden="true" />;
}
