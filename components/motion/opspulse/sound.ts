/* Bảng tiếng của phim GHN Ops Pulse. Mốc lấy từ timeline từng cảnh nên chỉnh nhịp hình thì tiếng
   đi theo. Tên tiếng ứng với slot trong docs/motion-audio-sources.json; trộn bằng
   python scripts/motion-sfx.py → public/motion/opspulse-sfx.mp3. */

import { endCardCues } from "../endSound";
import type { Cue } from "../sfx";
import { T as D } from "./Drill";
import { T as H } from "./Hall";
import { SHOTS as REPORT_SHOTS, T as R } from "./Report";

const HALL_SHOTS = [258, 298, 328, 350, 356, 362, 368, 374, 380];

export function opsPulseCues(at: { drill: number; report: number; end: number }): Cue[] {
  const cues: Cue[] = [];
  const add = (f: number, name: string, volume?: number) => cues.push({ at: f, name, volume });

  // ── Con số toàn quốc ──
  for (let i = 0; i < 12; i++) add(H.tiles + i * 2.4, `block-${i % 4}`, 0.3);
  add(H.tiles + 30, "pop-2", 0.5);
  add(H.cheer + 4, "ding", 0.35);
  add(H.cheer + 6, "cheer", 0.4);
  [0, 5, 10].forEach((d, i) => add(H.chips + d, `pop-${3 + i}`, 0.4));
  add(H.hub, "whoosh-long", 0.5); // tiếng dồn: đỉnh rơi đúng lúc lộ ra hub
  add(H.hub + 2, "buzz", 0.5);
  [8, 18].forEach(d => add(H.hub + d, "thud", 0.3));
  add(H.hub + 1, "pop-1", 0.4);
  add(H.back, "whoosh", 0.5);
  add(H.pan1 + 4, "whoosh-soft", 0.45);

  // ── Chụp · cắt · dán ──
  add(H.shot - 6, "pop-3", 0.5);
  HALL_SHOTS.forEach((f, k) => {
    const slow = k < 3, dur = slow ? HALL_SHOTS[k + 1] - f : 8;
    add(f, "shutter", slow ? 0.5 : 0.35);
    if (slow) add(f + dur * 0.28, "paper", 0.4);
    add(slow ? f + dur * 0.55 : f + 1, "whoosh-soft", 0.2);
    add(slow ? f + dur * 0.9 : f + 7, `blip-${k % 6}`, 0.25);
  });
  [272, 322, 352].forEach(f => add(f, "block-0", 0.35));
  add(H.pan2 + 4, "whoosh-soft", 0.45);

  // ── Phòng họp ──
  [0, 12, 24].forEach((d, i) => add(H.argue + d, `blip-${i * 2}`, 0.4));
  [4, 16, 28].forEach(d => add(H.vinh + d, "step", 0.5));
  add(H.push + 8, "ting", 0.5);
  [0, 4, 8].forEach(d => add(H.fly + d, "whoosh-soft", 0.3));
  add(H.on, "ding", 0.4);
  add(H.on + 2, "pop-6", 0.4);
  add(H.dive, "whoosh", 0.5);

  // ── Đi sâu trong dashboard ──
  const d = (f: number, name: string, volume?: number) => add(at.drill + f, name, volume);
  [D.click0, D.click1, D.click2].forEach(f => d(f, "tick", 0.55));
  [0, 1, 2].forEach(i => d(D.click0 + 12 + i * 3, `pop-${2 + i}`, 0.4));
  [0, 1, 2, 3].forEach(i => d(D.click1 + 14 + i * 2, `pop-${3 + i}`, 0.4));
  [0, 1, 2, 3, 4].forEach(i => d(D.click2 + 16 + i * 2, `block-${i % 4}`, 0.35));
  d(D.tag, "ting", 0.45);

  // ── Báo cáo buổi sáng ──
  const r = (f: number, name: string, volume?: number) => add(at.report + f, name, volume);
  r(0, "whoosh-soft", 0.45);
  [2, 10, 18, 26].forEach(f => r(R.leave + f, "step", 0.3));
  for (let i = 0; i < 14; i++) r(R.spin + (R.on - R.spin) * (1 - Math.pow(1 - i / 14, 1.6)), "tick", 0.22);
  [-2, 12].forEach(f => r(R.on + f, "ring", 0.35));
  r(R.trung, "boing-up", 0.4);
  r(R.trung + 16, "pop-2", 0.4);
  REPORT_SHOTS.forEach((f, k) => {
    r(f, "shutter", 0.45);
    r(f + 3, "whoosh-soft", 0.15);
    r(f + 13, `blip-${k % 6}`, 0.25);
  });
  r(R.on + 2, "pop-5", 0.4);
  r(R.note, "ding", 0.45);
  [2, 10, 18, 26].forEach(f => r(R.back + f, "step", 0.3));
  r(R.glint, "ting", 0.45);
  r(R.tagline, "tagline", 0.5);
  r(R.wipe, "whoosh", 0.5);
  r(R.wipe + 6, "paper", 0.45);

  cues.push(...endCardCues(at.end));
  return cues;
}
