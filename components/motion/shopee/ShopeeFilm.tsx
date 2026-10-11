/* Phim Tự động hoá báo cáo tại Shopee trọn vẹn (~22 giây): team logistics của Shopee ngập trong báo cáo
   làm tay cho ba đối tác vận chuyển → Vinh ghép cỗ máy AUTO từ SQL và Apps Script, báo cáo tự chạy, tự
   gửi → việc làm tay giảm 36% → logo. Tiếng: ./sound.ts, trộn thành public/motion/shopee-sfx.mp3.
   Kịch bản: docs/case-motion.md */

import { Audio, Sequence, staticFile } from "remotion";
import { EndCard, END_FRAMES } from "../EndCard";
import { study } from "./cast";
import { Office, OFFICE_FRAMES } from "./Office";
import { shopeeCues } from "./sound";

const AT = { end: OFFICE_FRAMES };
export const SHOPEE_FILM_FRAMES = AT.end + END_FRAMES;
/** Bảng tiếng tuyệt đối của cả phim — scripts/motion-cues.cjs đọc để trộn tiếng và cho trang nghe thử. */
export const SHOPEE_CUES = shopeeCues(AT);

export function ShopeeFilm() {
  return <>
    <Sequence durationInFrames={AT.end}><Office /></Sequence>
    <Sequence from={AT.end} durationInFrames={END_FRAMES}><EndCard title={study.title} note={`${study.client} · ${study.period}`} /></Sequence>
    {/* Toàn bộ tiếng đã trộn sẵn từ SHOPEE_CUES: python scripts/motion-sfx.py */}
    <Audio src={staticFile("motion/shopee-sfx.mp3")} />
  </>;
}
