/* Bảng tiếng hiệu ứng của phim intro — không nhạc nền (Vinh chốt 2026-10-16).

   Bản đầu (86 mốc, mượn bộ "vui" của phim case) bị chê chói tai: không có nhạc che nên tiếng cao
   lộ hết, lại quá dày. Bản thứ hai còn 42 mốc; bản này (22/10/2026) chỉ giữ 13 mốc — mỗi màn một
   đến hai tiếng ở bước ngoặt chính, còn lại để hình tự kể. Mỗi mốc là một "vai" riêng của intro (slot
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
  [3.24, "i-boing", 0.45], // Lệch nảy quá đà

  // Phân tích.
  [5.72, "i-stack", 0.45], // cột tự nhân đôi
  [6.05, "i-kick", 0.65], // Chấm đá phần trùng
  [7.3, "i-success", 0.55], // 97.5%

  // Build + AI.
  [8.15, "i-hammer", 0.55],
  [9.08, "i-magic", 0.5], // húc chip, AI lấp đầy
  [10.3, "i-error", 0.5], // bắt được khối sai

  // Ship.
  [12.3, "i-stamp", 0.7],
  [12.75, "i-kick", 0.65], // sút thùng

  // Về nhà.
  [14.95, "i-boing-down", 0.55], // Trùng giẫm đầu Chấm
  [16.45, "i-fall", 0.45], [16.45, "i-impact", 0.5], // còi rơi kết thúc đúng lúc chạm

  // Ký tên.
  [19.55, "i-chime", 0.5],
];

export const INTRO_CUES = SCORE.map(([at, name, volume]) => ({ at: Math.round(realTime(at) * FPS), name, volume }));
/** Dài hơn phim một chút cho tiếng chuông cuối ngân hết lúc hộp thoại mờ đi. */
export const INTRO_FRAMES = Math.ceil((realTime(END) + 1) * FPS);
