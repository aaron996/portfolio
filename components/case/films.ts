/* Case nào có phim hoạt hình đầu trang và tên file của phim (ảnh đứng public/motion/<id>-poster.jpg).
   Tách khỏi CaseFilm (client) để trang render phía server cũng hỏi được. */

export const FILM_IDS: Record<string, string> = {
  "pg-sales-operations": "interdist",
  "kas-shopee-performance": "opspulse",
  "cod-screening": "cod",
  "warehouse-attribution": "warehouse",
  "shopee-3pl-performance": "shopee",
};

export const hasFilm = (slug: string) => slug in FILM_IDS;

/** Khung phim — trùng FPS/W/H ở components/motion/paper.ts (không import file đó để khỏi kéo
 *  thư viện Remotion vào bundle trang trước khi người xem bấm phát). */
export const FILM_FPS = 30, FILM_W = 1280, FILM_H = 720;
