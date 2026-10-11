/* Bảng tiếng của phim Tự động hoá báo cáo tại Shopee. Mốc lấy từ timeline cảnh văn phòng; tên tiếng
   ứng với slot trong docs/motion-audio-sources.json; trộn bằng python scripts/motion-sfx.py →
   public/motion/shopee-sfx.mp3. */

import { endCardCues } from "../endSound";
import type { Cue } from "../sfx";
import { DROP_TIMES, PLANES, SUCK_TIMES, T } from "./Office";

export function shopeeCues(at: { end: number }): Cue[] {
  const cues: Cue[] = [];
  const add = (f: number, name: string, volume?: number) => cues.push({ at: f, name, volume });

  // ── Báo cáo làm tay chất đống ──
  add(T.intro, "pop-3", 0.4);
  add(T.intro + 6, "pop-4", 0.4);
  DROP_TIMES.forEach((f, k) => add(f, k % 3 === 0 ? "slap" : "paper", k % 3 === 0 ? 0.25 : 0.2));
  for (let i = 0; i < 18; i++) add(T.rain + 30 + i * 9, "tick", 0.18);
  add(T.dusk, "whoosh-soft", 0.3);
  add(T.sleepy + 10, "yawn", 0.4);

  // ── Vinh và cỗ máy AUTO ──
  [4, 14, 24].forEach(d => add(T.vinh + d, "step", 0.4));
  add(T.push + 6, "ting", 0.45);
  add(T.sql + 10, "thud", 0.45);
  add(T.script + 10, "thud", 0.4);
  add(T.head, "block-2", 0.4);
  add(T.funnel, "pop-2", 0.35);
  add(T.press, "latch", 0.5);
  add(T.run, "ding", 0.45);
  add(T.run + 2, "machine", 0.4);
  SUCK_TIMES.forEach((f, k) => { if (k % 2 === 0) add(f, "whoosh-soft", 0.15); });
  [0, 1, 2, 3].forEach(k => add(T.suck + 14 + k * 22, "gulp", 0.3));
  PLANES.forEach(f => add(f, "plane", 0.3));
  add(T.dawn, "chime", 0.25);

  // ── Việc làm tay giảm 36% ──
  add(T.suck + 10, "rewind", 0.3);
  add(T.cut, "pop-6", 0.5);
  add(T.cut + 2, "ding", 0.45);
  add(T.relief - 4, "relief", 0.4);
  add(T.relief + 6, "cheer", 0.4);
  add(T.glint + 6, "ting", 0.45);
  add(T.tagline, "tagline", 0.5);
  add(T.wipe, "whoosh", 0.5);
  add(T.wipe + 6, "paper", 0.45);

  cues.push(...endCardCues(at.end));
  return cues;
}
