/* Bảng tiếng của phim Rà soát COD. Mốc lấy từ timeline từng cảnh; tên tiếng ứng với slot trong
   docs/motion-audio-sources.json; trộn bằng python scripts/motion-sfx.py → public/motion/cod-sfx.mp3. */

import { endCardCues } from "../endSound";
import type { Cue } from "../sfx";
import { FEEDS, OUTS, T as A } from "./AiEngine";
import { STAMPS, T as B } from "./CodBoard";
import { T as D } from "./Doorstep";

export function codCues(at: { ai: number; board: number; end: number }): Cue[] {
  const cues: Cue[] = [];
  const add = (f: number, name: string, volume?: number) => cues.push({ at: f, name, volume });

  // ── Trước cửa: giao hàng, thu tiền, tiền bị giữ ──
  [6, 18, 30].forEach(f => add(f, "step", 0.35));
  add(D.give + 14, "slap", 0.3);
  add(D.cash, "cash", 0.5);
  add(D.banked, "pop-2", 0.3);
  add(D.status, "pop-4", 0.45);
  add(D.days, "latch", 0.35);
  [0, 14, 28].forEach(d => add(D.days + d + 10, "flip", 0.4));
  add(D.held, "buzz", 0.45);
  add(D.slide, "whoosh", 0.5);

  // ── Cỗ máy AI ──
  const a = (f: number, name: string, volume?: number) => add(at.ai + f, name, volume);
  a(A.vinh, "boing-up", 0.4);
  a(A.push + 6, "ting", 0.45);
  a(A.body, "thud", 0.4);
  [A.hopper, A.gears, A.gears + 4].forEach((f, k) => a(f, `block-${k + 1}`, 0.3));
  a(A.eye, "ding", 0.4);
  a(A.lever, "pop-1", 0.3);
  a(A.chimney, "pop-2", 0.3);
  a(A.chip, "pop-4", 0.45);
  [0, 1, 2].forEach(k => a(A.src + k * 6, `pop-${3 + k}`, 0.4));
  a(A.pull, "ratchet", 0.5);
  a(A.run, "machine", 0.4);
  a(A.run + 2, "hiss", 0.2);
  FEEDS.forEach((d, n) => { a(d.at, "whoosh-soft", 0.15); if (n % 2 === 0) a(d.at + 20, "gulp", 0.3); });
  OUTS.forEach(o => { a(o.at, "boing-up", 0.25); a(o.land, `scan-${o.level}`, 0.4); });
  a(A.glint + 6, "ting", 0.45);
  a(A.grow, "whoosh", 0.5);

  // ── Bảng GHN Ops Pulse ──
  const b = (f: number, name: string, volume?: number) => add(at.board + f, name, volume);
  b(B.header, "blip-1", 0.3);
  b(B.auto, "pop-5", 0.45);
  [0, 1, 2, 3, 4].forEach(i => b(B.rows + i * 6 + 4, `block-${i % 4}`, 0.22));
  b(B.zoom, "whoosh-soft", 0.4);
  b(B.flip, "flip", 0.5);
  b(B.refresh, "ratchet", 0.3);
  [0, 1, 2, 3, 4].forEach(i => b(B.refresh + i * 3 + 5, `blip-${i}`, 0.18));
  STAMPS.forEach(s => b(s.at, "stamp", 0.55));
  b(B.cheer, "ding", 0.4);
  b(B.cheer + 2, "cheer", 0.45);
  b(B.glint + 6, "ting", 0.4);
  b(B.tagline, "tagline", 0.5);
  b(B.wipe, "whoosh", 0.5);
  b(B.wipe + 6, "paper", 0.45);

  cues.push(...endCardCues(at.end));
  return cues;
}
