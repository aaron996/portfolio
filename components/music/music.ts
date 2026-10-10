/* Trạng thái nhạc nền dùng chung: nút trên nav đọc/ghi `enabled`, các phần khác (intro,
   MV, trang game) xin "giữ im" bằng hold(). BackgroundMusic là nơi duy nhất điều khiển audio. */

type State = { enabled: boolean; playing: boolean; holds: string[] };

let state: State = { enabled: true, playing: false, holds: [] };
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export const PREF_KEY = "pf-music";

export const music = {
  get: () => state,
  subscribe(fn: () => void) {
    subs.add(fn);
    return () => { subs.delete(fn); };
  },
  setEnabled(enabled: boolean) {
    state = { ...state, enabled };
    try { localStorage.setItem(PREF_KEY, enabled ? "1" : "0"); } catch {}
    emit();
  },
  setPlaying(playing: boolean) {
    if (state.playing === playing) return;
    state = { ...state, playing };
    emit();
  },
  /** Giữ nhạc im khi có lý do (intro, MV, trang game); bỏ giữ thì nhạc chạy lại nếu đang bật. */
  hold(reason: string, on: boolean) {
    const has = state.holds.includes(reason);
    if (on === has) return;
    state = { ...state, holds: on ? [...state.holds, reason] : state.holds.filter((r) => r !== reason) };
    emit();
  },
};

const SERVER: State = { enabled: true, playing: false, holds: [] };
export const serverMusic = () => SERVER;
