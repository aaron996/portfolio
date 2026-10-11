/* Tiếng của cảnh kết logo (EndCard) — dùng chung cho mọi phim case. */

import { HOMES } from "./EndCard";
import type { Cue } from "./sfx";

/** `at`: khung bắt đầu cảnh kết trong phim. */
export function endCardCues(at: number): Cue[] {
  const cues: Cue[] = [];
  [0, 1, 3, 5, 7, 8].forEach((i, n) => cues.push({ at: at + i * 2, name: `block-${n % 4}`, volume: 0.35 }));
  HOMES.forEach((h, n) => {
    cues.push({ at: at + h.at, name: "whoosh-soft", volume: 0.25 });
    cues.push({ at: at + h.at + 16, name: `pop-${5 + n}`, volume: 0.5 });
  });
  cues.push({ at: at + HOMES[2].at + 18, name: "chime", volume: 0.55 });
  return cues;
}
