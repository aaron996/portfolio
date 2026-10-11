/* Bảng tiếng của phim Tìm kho làm trễ. Mốc lấy từ timeline các cảnh; tên tiếng ứng với slot trong
   docs/motion-audio-sources.json; trộn bằng python scripts/motion-sfx.py → public/motion/warehouse-sfx.mp3. */

import { endCardCues } from "../endSound";
import type { Cue } from "../sfx";
import { T as A } from "./Scenes12";
import { T as B } from "./Scenes34";

export function warehouseCues(at: { end: number }): Cue[] {
  const cues: Cue[] = [];
  const add = (f: number, name: string, volume?: number) => cues.push({ at: f, name, volume });

  // ── Thư đòi đền bù, hàng kho nghi phạm ──
  add(A.env, "whoosh", 0.45);
  add(A.land, "slap", 0.45);
  add(A.land + 2, "paper", 0.35);
  add(A.letter, "pop-3", 0.45);
  add(A.letter + 6, "buzz", 0.4);
  add(A.shrink, "whoosh-soft", 0.35);
  add(A.where, "pop-2", 0.45);
  [0, 1, 2, 3, 4].forEach(k => add(A.whs + k * 8, "thud", 0.3));
  [0, 1, 2, 3, 4].forEach(k => add(A.accuse + k * 10, `blip-${k}`, 0.35));
  add(A.pan1 + 4, "whoosh-soft", 0.45);

  // ── Dòng thời gian từ lịch sử quét mã ──
  add(A.parcel, "boing-up", 0.35);
  add(A.parcel + 18, "thud", 0.3);
  add(A.parcel + 2, "pop-1", 0.35);
  [4, 16, 28].forEach(f => add(A.vinh + f, "step", 0.35));
  for (let k = 0; k < 8; k++) add(A.stamps + k * 6, "stamp", 0.35);
  add(A.glint, "ting", 0.45);
  [0, 12, 24, 34].forEach((d, k) => add(A.bars + d, `block-${k}`, 0.4));
  add(A.point, "pop-4", 0.4);
  add(A.pan2 + 4, "whoosh-soft", 0.45);

  // ── Xếp quy tắc, tầng rây ──
  [0, 1, 2, 3].forEach(k => add(B.cards + k * 3, "flip", 0.3));
  [0, 1, 2, 3].forEach(k => add(B.order + k * 4 + 6, "paper", 0.25));
  add(B.priority, "pop-4", 0.4);
  [0, 1, 2, 3].forEach(k => add(B.toTray + k * 4, "whoosh-soft", 0.2));
  add(B.drop, "whoosh", 0.4);
  add(B.pass1, "ratchet", 0.4);
  add(B.catch, "thud", 0.45);
  add(B.catch + 2, "ding", 0.4);
  add(B.light, "spotlight", 0.55);
  add(B.hit, "pop-5", 0.45);
  add(B.pan3 + 4, "whoosh-soft", 0.45);

  // ── Đèn rọi đúng kho ──
  add(B.spot - 4, "spotlight", 0.6);
  add(B.spot, "whoosh-long", 0.35);
  add(B.lock, "ding", 0.45);
  add(B.lock + 2, "buzz", 0.3);
  add(B.env, "whoosh-soft", 0.35);
  add(B.envLand, "slap", 0.45);
  add(B.cheer + 4, "cheer", 0.4);
  add(B.glint, "ting", 0.45);
  add(B.tagline, "tagline", 0.5);
  add(B.wipe, "whoosh", 0.5);
  add(B.wipe + 6, "paper", 0.45);

  cues.push(...endCardCues(at.end));
  return cues;
}
