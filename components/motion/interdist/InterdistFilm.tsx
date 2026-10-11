/* Phim Interdist trọn vẹn (~38 giây): văn phòng → xưởng → sáng hôm sau → logo.
   Các cảnh nối bằng biến hình: tờ file phủ khung, camera dí vào app rồi lùi ra từ màn hình
   của sếp, tờ giấy trượt lên phủ khung. Tiếng: ./sound.ts, trộn thành public/motion/interdist-sfx.mp3. Kịch bản: docs/case-motion.md */

import { Audio, Sequence, staticFile } from "remotion";
import { caseStudies } from "../../../content/cases.vi";
import { EndCard, END_FRAMES } from "../EndCard";
import { InterdistOpener, INTERDIST_OFFICE_FRAMES } from "./InterdistOpener";
import { Morning, MORNING_FRAMES } from "./Morning";
import { interdistCues } from "./sound";
import { Workshop, WORKSHOP_FRAMES } from "./Workshop";

const study = caseStudies.find(c => c.slug === "pg-sales-operations")!;

const AT = {
  workshop: INTERDIST_OFFICE_FRAMES,
  morning: INTERDIST_OFFICE_FRAMES + WORKSHOP_FRAMES,
  end: INTERDIST_OFFICE_FRAMES + WORKSHOP_FRAMES + MORNING_FRAMES,
};
export const INTERDIST_FILM_FRAMES = AT.end + END_FRAMES;
/** Bảng tiếng tuyệt đối của cả phim — scripts/motion-cues.cjs đọc để trộn tiếng và cho trang nghe thử. */
export const INTERDIST_CUES = interdistCues(AT);

export function InterdistFilm() {
  return <>
    <Sequence durationInFrames={AT.workshop}><InterdistOpener /></Sequence>
    <Sequence from={AT.workshop} durationInFrames={WORKSHOP_FRAMES}><Workshop /></Sequence>
    <Sequence from={AT.morning} durationInFrames={MORNING_FRAMES}><Morning /></Sequence>
    <Sequence from={AT.end} durationInFrames={END_FRAMES}><EndCard title={study.title} note={`${study.client} · ${study.period}`} /></Sequence>
    {/* Toàn bộ tiếng đã trộn sẵn từ INTERDIST_CUES: python scripts/motion-sfx.py */}
    <Audio src={staticFile("motion/interdist-sfx.mp3")} />
  </>;
}
