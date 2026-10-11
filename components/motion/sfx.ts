/* Kiểu và hằng số chung cho tiếng của các phim case. Tiếng không phát lẻ trên site: bảng tiếng
   của mỗi phim (vd interdist/sound.ts) được scripts/motion-sfx.py trộn thành một file
   public/motion/<phim>-sfx.mp3 — giấy phép Adobe Audition SFX cấm phát tán file tiếng lẻ.
   Nguồn, giấy phép và tiếng đã chọn: docs/motion-audio-sources.json. */

/** Nâng chung cả dải tiếng (~+3 dB) để phim nghe ngang các video thường gặp trên web. */
export const SFX_MASTER = 1.4;

/** `at` là khung tiếng phải "trúng" hình. Tiếng có phần dồn trước đỉnh (vd trống dồn) khai `lead`
 *  ở mẫu tiếng trong docs/motion-audio-sources.json; khi trộn, đỉnh của nó rơi đúng `at`. */
export type Cue = { at: number; name: string; volume?: number };
