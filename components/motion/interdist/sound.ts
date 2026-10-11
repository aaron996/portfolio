/* Bảng tiếng của phim Interdist. Mốc lấy thẳng từ timeline từng cảnh (T của mỗi file) nên
   chỉnh nhịp hình thì tiếng tự đi theo. `at` là khung tuyệt đối trong cả phim. Tên tiếng
   (vd "pop-3") ứng với một slot trong docs/motion-audio-sources.json; trộn bằng
   python scripts/motion-sfx.py → public/motion/interdist-sfx.mp3. */

import type { Cue } from "../sfx";
import { endCardCues } from "../endSound";
import { CLOCK, FILES, T as O } from "./InterdistOpener";
import { arrive, BAD, GOOD, IMPORTS, T as Wk, TILES } from "./Workshop";
import { T as Mo } from "./Morning";

export function interdistCues(at: { workshop: number; morning: number; end: number }): Cue[] {
  const cues: Cue[] = [];
  const add = (f: number, name: string, volume?: number) => cues.push({ at: f, name, volume });

  // ── Văn phòng ──
  for (let f = 1; f < O.freeze; f++) {
    if (Math.floor(CLOCK[f] / 30) > Math.floor(CLOCK[f - 1] / 30)) add(f, "tick", f < O.frenzy ? 0.22 : 0.3);
  }
  add(O.drop + 12, "slap", 0.7);
  FILES.forEach((_, i) => { add(O.lift + i * 10, `pop-${i}`, 0.45); add(O.lift + i * 10, "paper", 0.35); });
  add(O.lift + 30, "whoosh-soft", 0.4);
  [0, 20, 40].forEach(d => add(O.ring + d + 1, "ring", 0.45));
  add(O.ask, "pop-3", 0.6);
  add(O.clash, "whoosh", 0.5);
  add(O.clash + 12, "pop-6", 0.55); // Trùng ló ra, cao giọng hơn.
  add(O.hit - 6, "whoosh", 0.45);
  add(O.hit, "impact", 0.9);
  add(O.freeze, "whoosh-long", 0.55); // tiếng dồn: đỉnh rơi đúng lúc đứng hình (lead ở mẫu tiếng)
  add(O.frenzy + 4, "hiss", 0.45);
  add(O.frenzy + 20, "wobble", 0.4);
  add(O.freeze + 1, "stop", 0.6);
  add(O.door - 8, "latch", 0.6);
  add(O.door, "creak", 0.55);
  [O.walk + 2, O.walk + 15, O.stop - 1].forEach(f => add(f, "step", 0.5));
  add(O.push, "pop-1", 0.3);
  add(O.glint + 2, "ting", 0.5);
  add(O.question, "pop-3", 0.6);
  add(O.need, "pop-2", 0.6);
  [0, 1, 2].forEach(i => add(O.need + 6 + i * 7, `blip-${i * 2}`, 0.4));
  add(O.snap, "ting", 0.5);
  add(O.cover, "whoosh", 0.6);
  add(O.cover + 4, "paper", 0.5);

  // ── Xưởng ──
  const w = (f: number, name: string, volume?: number) => add(at.workshop + f, name, volume);
  w(Wk.vinh, "pop-0", 0.45);
  w(Wk.panel, "pop-4", 0.5);
  w(Wk.funnel, "whoosh", 0.4);
  w(Wk.funnel + 6, "thud", 0.6);
  FILES.forEach((_, i) => w(Wk.sheets + i * 12, "paper", 0.3));
  GOOD.forEach(i => w(arrive(i), "gulp", 0.45));
  w(arrive(BAD), "buzz", 0.4);
  w(arrive(BAD) + 2, "boing-up", 0.45);
  w(arrive(BAD) + 24, "slap", 0.55);
  w(arrive(BAD) + 3 + 24, "pop-5", 0.45);
  TILES.forEach(t => w(t.land, `block-${t.bar}`, 0.45));
  IMPORTS.forEach((f, n) => w(f + 1, `blip-${n % 6}`, 0.3));
  w(Wk.target + 6, "ding", 0.5);
  w(Wk.price, "ratchet", 0.35);
  w(Wk.think + 10, "ting", 0.45);
  w(Wk.slide, "ratchet-long", 0.4);
  w(Wk.lech, "whoosh-soft", 0.4);
  w(Wk.lech + 12, "thud", 0.45);
  w(Wk.spike, "boing-up", 0.6);
  w(Wk.think2 + 10, "ting", 0.45);
  w(Wk.rewind, "rewind", 0.6);
  w(Wk.rewind + 4, "boing-down", 0.45);
  w(Wk.out, "boing-up", 0.4);
  w(Wk.out + 20, "thud", 0.4);
  w(Wk.zoom, "whoosh", 0.5);

  // ── Sáng hôm sau ──
  const m = (f: number, name: string, volume?: number) => add(at.morning + f, name, volume);
  m(0, "whoosh-soft", 0.5);
  [0, 1, 2, 3].forEach(b => m(Mo.grow + b * 6 + 4, `pop-${4 + b}`, 0.45));
  m(Mo.grow + 30, "ding", 0.5);
  m(Mo.lean, "creak", 0.25);
  [0, 5, 9].forEach((d, i) => m(Mo.buddies + d, `pop-${i + 2}`, 0.4));
  [0, 18].forEach(d => m(Mo.vinh + d, "boing-up", 0.25));
  m(Mo.think + 10, "ting", 0.45);
  m(Mo.wipe, "whoosh", 0.5);
  m(Mo.wipe + 6, "paper", 0.45);

  // ── Logo ──
  cues.push(...endCardCues(at.end));

  return cues;
}
