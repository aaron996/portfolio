/* Một nguồn trạng thái cho nav, widget và audio ở root layout. Các video xin nhường
   tiếng qua hold(); chỉ BackgroundMusic điều khiển phần phát. */
export type MusicStatus = "idle" | "loading" | "playing" | "blocked" | "error";
type State = {
  enabled: boolean; playing: boolean; holds: string[]; status: MusicStatus;
  trackIndex: number; request: number; elapsed: number; duration: number;
};

const SERVER: State = {
  enabled: true, playing: false, holds: [], status: "idle",
  trackIndex: 0, request: 0, elapsed: 0, duration: 0,
};
let state = SERVER;
const subs = new Set<() => void>();
const emit = () => subs.forEach((fn) => fn());
export const PREF_KEY = "pf-music";

export const music = {
  get: () => state,
  subscribe(fn: () => void) {
    subs.add(fn);
    return () => { subs.delete(fn); };
  },
  setEnabled(enabled: boolean) {
    state = { ...state, enabled, request: state.request + 1 };
    try { localStorage.setItem(PREF_KEY, enabled ? "1" : "0"); } catch { /* Optional storage. */ }
    emit();
  },
  setStatus(status: MusicStatus) {
    const playing = status === "playing";
    if (state.status === status && state.playing === playing) return;
    state = { ...state, status, playing };
    emit();
  },
  setTime(elapsed: number, duration: number) {
    elapsed = Math.floor(elapsed);
    duration = Number.isFinite(duration) ? Math.floor(duration) : 0;
    if (elapsed === state.elapsed && duration === state.duration) return;
    state = { ...state, elapsed, duration };
    emit();
  },
  step(delta: number, count: number) {
    if (count < 1) return;
    state = { ...state, trackIndex: (state.trackIndex + delta + count) % count,
      elapsed: 0, duration: 0, request: state.request + 1 };
    emit();
  },
  hold(reason: string, on: boolean) {
    if (on === state.holds.includes(reason)) return;
    state = { ...state, holds: on ? [...state.holds, reason] : state.holds.filter(r => r !== reason) };
    emit();
  },
};

export const serverMusic = () => SERVER;

export function musicLabel(s: State, t: { on: string; off: string; retry: string }) {
  if (s.status === "error" || s.status === "blocked") return t.retry;
  return s.enabled && (s.status !== "idle" || s.holds.length > 0) ? t.off : t.on;
}

export function toggleMusic() {
  music.setEnabled(!state.enabled || state.status === "blocked" || state.status === "error" ||
    (state.status === "idle" && state.holds.length === 0));
}
