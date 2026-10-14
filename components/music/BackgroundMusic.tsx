"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { content } from "@/content/content.vi";
import { INTRO_STATE_EVENT } from "@/components/portfolio/IntroVideo";
import { music, PREF_KEY } from "./music";
import { RadioWidget } from "./RadioWidget";

const tracks = content.home.music.tracks;

/* Một audio sống qua chuyển route. Subscription chạy ngay trong cú click bật âm,
   giữ user activation cho browser chặn autoplay. */
export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const pathname = usePathname();

  useEffect(() => { music.hold("route", pathname.startsWith("/game")); }, [pathname]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || tracks.length === 0) return;
    let unlocked = false;
    let attempt = 0;
    let source = "";
    let signature = "";
    let disposed = false;

    const sync = () => {
      const s = music.get();
      const key = `${s.enabled}/${s.holds.join(",")}/${s.trackIndex}/${s.request}/${unlocked}`;
      if (signature === key) return;
      signature = key;
      const token = ++attempt;
      const track = tracks[s.trackIndex];
      if (source !== track.src) {
        source = track.src;
        audio.src = source;
        music.setTime(0, 0);
        document.documentElement.style.setProperty("--pf-radio-progress", "0");
      }
      if (!s.enabled || s.holds.length || !unlocked) {
        audio.pause();
        music.setStatus("idle");
        return;
      }
      audio.volume = 0.35;
      if (audio.error) audio.load();
      music.setStatus("loading");
      void audio.play().catch((error: DOMException) => {
        if (disposed || token !== attempt || error.name === "AbortError") return;
        music.setStatus(error.name === "NotAllowedError" ? "blocked" : "error");
      });
    };
    const unlock = (event: Event) => {
      if (unlocked) return;
      unlocked = true;
      // Nút bật âm tự quyết định trong onClick; tránh pointerdown phát rồi click tắt ngay.
      if (event.target instanceof Element && event.target.closest(".pf-radio-sound, .mt-btn")) return;
      sync();
    };
    const intro = () => music.hold("intro", document.documentElement.dataset.introActive === "1");

    try { if (localStorage.getItem(PREF_KEY) === "0") music.setEnabled(false); } catch { /* Optional storage. */ }
    intro();
    const unsubscribe = music.subscribe(sync);
    sync();
    window.addEventListener("pointerdown", unlock, true);
    window.addEventListener("keydown", unlock, true);
    window.addEventListener(INTRO_STATE_EVENT, intro);

    return () => {
      disposed = true;
      ++attempt;
      unsubscribe();
      audio.pause();
      music.setStatus("idle");
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
      window.removeEventListener(INTRO_STATE_EVENT, intro);
      document.documentElement.style.removeProperty("--pf-radio-progress");
    };
  }, []);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    const update = () => {
      const s = music.get();
      const track = tracks[s.trackIndex];
      if (track && typeof MediaMetadata !== "undefined" && session.metadata?.title !== track.title) {
        session.metadata = new MediaMetadata({ title: track.title, artist: content.home.music.artist });
      }
      session.playbackState = s.playing ? "playing" : "paused";
    };
    const handlers = {
      play: () => music.setEnabled(true), pause: () => music.setEnabled(false),
      ...(tracks.length > 1 ? {
        previoustrack: () => music.step(-1, tracks.length), nexttrack: () => music.step(1, tracks.length),
      } : {}),
    };
    for (const [action, handler] of Object.entries(handlers)) {
      try { session.setActionHandler(action as MediaSessionAction, handler); } catch { /* Unsupported key. */ }
    }
    update();
    const unsubscribe = music.subscribe(update);
    return () => {
      unsubscribe();
      session.metadata = null;
      session.playbackState = "none";
      for (const action of Object.keys(handlers)) {
        try { session.setActionHandler(action as MediaSessionAction, null); } catch { /* Unsupported key. */ }
      }
    };
  }, []);

  return <>
    <audio ref={audioRef} preload="none" aria-hidden="true"
      onPlaying={event => {
        const s = music.get();
        if (!s.enabled || s.holds.length) { event.currentTarget.pause(); return; }
        music.setStatus("playing");
      }}
      onPause={() => { if (music.get().status !== "error") music.setStatus("idle"); }}
      onWaiting={() => { if (music.get().enabled && !music.get().holds.length) music.setStatus("loading"); }}
      onError={event => { if (event.currentTarget.error?.code !== 1) music.setStatus("error"); }}
      onTimeUpdate={event => {
        const a = event.currentTarget;
        music.setTime(a.currentTime, a.duration);
        const ratio = Number.isFinite(a.duration) && a.duration > 0 ? a.currentTime / a.duration : 0;
        document.documentElement.style.setProperty("--pf-radio-progress", String(Math.min(1, ratio)));
      }}
      onLoadedMetadata={event => music.setTime(event.currentTarget.currentTime, event.currentTarget.duration)}
      onEnded={event => { event.currentTarget.currentTime = 0; music.step(1, tracks.length); }} />
    <RadioWidget />
  </>;
}
