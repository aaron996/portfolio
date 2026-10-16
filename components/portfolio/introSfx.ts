/* Bảng tiếng hiệu ứng của phim intro — không nhạc nền (Vinh chốt 2026-10-16).

   Bản đầu (86 mốc, mượn bộ "vui" của phim case) bị chê chói tai: không có nhạc che nên tiếng cao
   lộ hết, lại quá dày. Bản này còn ~một nửa số mốc, mỗi mốc là một "vai" riêng của intro (slot
   tiền tố i- trong docs/motion-audio-sources.json) có hai bộ tiếng chọn theo độ chói thấp:
   "mem" (Adobe gỗ/lò xo/cao su) và "mixkit" (Mixkit Cartoon) — Vinh chọn mixkit; bản trộn còn hạ
   dải cao (soften).
   Mốc ghi theo giờ phim — đọc thẳng từ IntroFilm — rồi quy ra giờ thật theo introClock.

       python scripts/motion-sfx.py --film intro --style mixkit   # nghe thử → output/motion-audio/variants/
       python scripts/motion-sfx.py --film intro                   # bản chính → public/portfolio/intro-sfx.mp3

   File này không import React: scripts/motion-cues.cjs bundle nó bằng esbuild. */

import { END, realTime } from "./introClock";

/** Phải khớp FPS của components/motion/paper (cue script đọc fps từ đó). */
const FPS = 30;

/** [giờ phim, tên tiếng, độ to 0–1] */
const SCORE: [number, string, number][] = [
  // Mở màn: màn đen im lặng.
  [2.13, "i-startle", 0.55], // Chấm giật mình
  [2.75, "i-land", 0.45],
  [3.24, "i-boing", 0.45], // Lệch nảy quá đà

  // Phân tích.
  [4.25, "i-whoosh", 0.4], // Lệch lộn nhào
  [4.45, "i-rattle", 0.5], // mưa pixel
  [4.9, "i-block-0", 0.45], [5.2, "i-block-2", 0.45], // Chấm quét, pixel về cột
  [5.72, "i-stack", 0.45], // cột tự nhân đôi
  [6.05, "i-kick", 0.65], // Chấm đá phần trùng
  [6.22, "i-boing-up", 0.45], // Lệch bật vọt
  [6.45, "i-outlier", 0.5], // khoanh đỏ
  [6.52, "i-dizzy", 0.45], // Trùng choáng
  [6.95, "i-pop-3", 0.4], // cột cuối vọt lên
  [7.3, "i-success", 0.55], // 97.5%

  // Build + AI.
  [7.65, "i-fold", 0.45],
  [8.15, "i-hammer", 0.55],
  [8.55, "i-block-1", 0.4], [8.8, "i-block-1", 0.4], [9.05, "i-block-1", 0.4], // ba khối y hệt — cùng một tiếng
  [8.85, "i-pop-5", 0.4], // chip AI hiện ra
  [9.08, "i-magic", 0.5], // húc chip, AI lấp đầy
  [10.3, "i-error", 0.5], // bắt được khối sai
  [10.48, "i-boing-up", 0.45], [10.75, "i-success", 0.45],

  // Ship.
  [11.7, "i-fold", 0.45],
  [12.3, "i-stamp", 0.7],
  [12.75, "i-kick", 0.65], [12.76, "i-whoosh", 0.55],

  // Về nhà.
  [13.65, "i-pop-0", 0.35], // lưới logo bật lên
  [14.42, "i-pop-4", 0.45], // Chấm vào ô giữa
  [14.95, "i-boing-down", 0.55], // Trùng giẫm đầu Chấm
  [15.4, "i-whoosh", 0.5], // Lệch vọt khỏi khung
  [16.45, "i-fall", 0.45], [16.45, "i-impact", 0.5], // còi rơi kết thúc đúng lúc chạm

  // Ký tên.
  ...[0, 1, 2, 3].map(n => [17.05 + n * 0.2, "i-tick", 0.3] as [number, string, number]),
  [18.15, "i-pop-2", 0.3], [18.45, "i-pop-4", 0.3],
  [19.0, "i-whoosh-soft", 0.4],
  [19.55, "i-chime", 0.5],
];

export const INTRO_CUES = SCORE.map(([at, name, volume]) => ({ at: Math.round(realTime(at) * FPS), name, volume }));
/** Dài hơn phim một chút cho tiếng chuông cuối ngân hết lúc hộp thoại mờ đi. */
export const INTRO_FRAMES = Math.ceil((realTime(END) + 1) * FPS);
