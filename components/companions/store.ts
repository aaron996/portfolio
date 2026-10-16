"use client";

/* Trạng thái dùng chung của ba bạn đồng hành (kịch bản: docs/companions.md).
   - enabled: người xem có muốn thấy chúng không — nhớ bằng localStorage.
   - place: ba ô đang ở đâu. "home" = trong logo, "hero" = trên sân khấu hero,
     "dock" = đứng trên mép dưới nav, đi theo người xem.
   - heroReady: màn mở đầu ở hero đã diễn xong, ba ô sẵn sàng rời đi.
   - absent: ô vắng khỏi logo dù cả nhóm đang "home" — trang chủ: Trùng đã lẻn vào
     biểu đồ hero từ trước, nên ô của nó trống. */

import { useSyncExternalStore } from "react";

export type Place = "home" | "hero" | "dock";
export type CompanionState = { enabled: boolean; place: Place; heroReady: boolean; absent: number[] };

/** Ô trong logo 3×3 của Chấm, Trùng, Lệch (thứ tự 0, 1, 2). */
export const LOGO_CELLS = [4, 6, 2];

/** Điểm giữa-đáy của một ô theo toạ độ viewport, kèm cạnh ô đang hiển thị. */
export type Spot = { x: number; y: number; size: number };

/** Hero đăng ký để lớp dùng chung đón và trả ba ô. */
export type HeroBridge = {
  stage: HTMLElement;
  size: number;
  positions: () => Spot[];
  show: (visible: boolean) => void;
};

const KEY = "companions";
const SERVER: CompanionState = { enabled: true, place: "home", heroReady: false, absent: [] };

function readEnabled() {
  try { return localStorage.getItem(KEY) !== "off"; } catch { return true; }
}

let state: CompanionState = typeof window === "undefined" ? SERVER : { ...SERVER, enabled: readEnabled() };
let hero: HeroBridge | null = null;
const listeners = new Set<() => void>();

function set(patch: Partial<CompanionState>) {
  state = { ...state, ...patch };
  listeners.forEach(listener => listener());
}

export const companions = {
  get: () => state,
  set,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },
  setEnabled(enabled: boolean) {
    try { localStorage.setItem(KEY, enabled ? "on" : "off"); } catch {}
    // Tắt thì cả ba về nhà ngay; bật lại thì hero tự đưa chúng ra.
    set(enabled ? { enabled } : { enabled, place: "home" });
  },
  hero: () => hero,
  registerHero(bridge: HeroBridge | null) {
    hero = bridge;
    listeners.forEach(listener => listener());
  },
};

/** Ba ô đang ở ngoài cùng người xem (hoặc đã diễn xong ở hero, sắp rời đi khi người xem
 *  cuộn thẳng xuống) — các section dùng để quyết định có gọi chúng không. */
export function companionsOut() {
  return state.enabled && (state.place === "dock" || (state.place === "hero" && state.heroReady));
}

export function useCompanions() {
  return useSyncExternalStore(companions.subscribe, companions.get, () => SERVER);
}
