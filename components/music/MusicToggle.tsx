"use client";

import { useSyncExternalStore } from "react";
import { content } from "@/content/content.vi";
import { music, serverMusic } from "./music";
import "./music.css";

/* Nút bật/tắt nhạc nền. Biểu tượng biến hình: khi bật, hai vạch sóng nhấp theo nhạc;
   khi tắt, sóng thu lại và hai nét chéo vẽ ra thành dấu ✕. */
export function MusicToggle() {
  const s = useSyncExternalStore(music.subscribe, music.get, serverMusic);
  const t = content.home.music;
  const label = s.enabled ? t.off : t.on;
  return (
    <button type="button" className="mt-btn" data-on={s.enabled} data-playing={s.playing}
      aria-pressed={s.enabled} aria-label={label} title={label} onClick={() => music.setEnabled(!s.enabled)}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path className="mt-body" d="M4 9.5h3.2L11.5 6v12l-4.3-3.5H4z" fill="currentColor" />
        <path className="mt-wave mt-wave-1" pathLength={1} d="M14.6 9.4a4 4 0 0 1 0 5.2" />
        <path className="mt-wave mt-wave-2" pathLength={1} d="M17.2 6.8a7.6 7.6 0 0 1 0 10.4" />
        <path className="mt-x mt-x-1" pathLength={1} d="m15 9.5 5 5" />
        <path className="mt-x mt-x-2" pathLength={1} d="m20 9.5-5 5" />
      </svg>
    </button>
  );
}
