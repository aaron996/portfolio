/* Đồng hồ của phim intro (kịch bản: docs/intro-motion.md).

   Mọi mốc trong IntroFilm và bảng tiếng là **giờ phim** (0 → END). Lúc phát, phim chạy chậm
   hơn đồng hồ thật (RATE) và dừng thở ở cuối bốn màn — đúng những lúc cả khung đã đứng yên —
   nên giờ thật ≈ 25s. Muốn nhanh/chậm cả phim thì chỉnh hai hằng số này, đừng sửa từng mốc;
   nhớ trộn lại tiếng (`python scripts/motion-sfx.py --film intro`) vì file tiếng chạy theo giờ thật.

   File này không import React: scripts/motion-cues.cjs bundle nó bằng esbuild để trộn tiếng. */

export const END = 20;
export const RATE = 0.85;
export const HOLDS = [
  { at: 7.35, dur: 0.45 }, // 97.5% vừa đếm xong, MAKE SENSE OF DATA.
  { at: 11.2, dur: 0.35 }, // khối sai đã sửa, BUILD WITH AI.
  { at: 13.35, dur: 0.3 }, // thùng đã bay, SHIP IT.
  { at: 18.73, dur: 0.4 }, // tên và bốn chữ đã đủ
];

/** Giờ thật (giây kể từ lúc phim mới bắt đầu) → giờ phim. */
export function filmTime(real: number) {
  let film = 0, clock = 0;
  for (const h of HOLDS) {
    const run = clock + (h.at - film) / RATE;
    if (real < run) return film + (real - clock) * RATE;
    clock = run + h.dur;
    film = h.at;
    if (real < clock) return film;
  }
  return film + (real - clock) * RATE;
}

/** Giờ phim → giờ thật. Mốc trùng đúng chỗ dừng thở thì kêu lúc bắt đầu dừng. */
export function realTime(film: number) {
  return film / RATE + HOLDS.filter(h => h.at < film).reduce((sum, h) => sum + h.dur, 0);
}
