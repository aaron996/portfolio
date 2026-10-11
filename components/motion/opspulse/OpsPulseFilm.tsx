/* Phim GHN Ops Pulse trọn vẹn (~40 giây): con số toàn quốc che một hub dồn đơn → chụp · cắt · dán
   mỗi sáng → mỗi người một con số → một dashboard dùng chung, đi sâu tới hub cần ưu tiên → mỗi
   sáng Trùng tự chụp chính dashboard gửi nhóm lãnh đạo → logo. Nối cảnh bằng cú lao vào màn hình
   và lùi ra từ màn hình. Tiếng: ./sound.ts, trộn thành public/motion/opspulse-sfx.mp3.
   Kịch bản: docs/case-motion.md */

import { Audio, Sequence, staticFile } from "remotion";
import { EndCard, END_FRAMES } from "../EndCard";
import { study } from "./cast";
import { Drill, DRILL_FRAMES } from "./Drill";
import { Hall, HALL_FRAMES } from "./Hall";
import { Report, REPORT_FRAMES } from "./Report";
import { opsPulseCues } from "./sound";

const AT = { drill: HALL_FRAMES, report: HALL_FRAMES + DRILL_FRAMES, end: HALL_FRAMES + DRILL_FRAMES + REPORT_FRAMES };
export const OPSPULSE_FILM_FRAMES = AT.end + END_FRAMES;
/** Bảng tiếng tuyệt đối của cả phim — scripts/motion-cues.cjs đọc để trộn tiếng và cho trang nghe thử. */
export const OPSPULSE_CUES = opsPulseCues(AT);

export function OpsPulseFilm() {
  return <>
    <Sequence durationInFrames={AT.drill}><Hall /></Sequence>
    <Sequence from={AT.drill} durationInFrames={DRILL_FRAMES}><Drill /></Sequence>
    <Sequence from={AT.report} durationInFrames={REPORT_FRAMES}><Report /></Sequence>
    <Sequence from={AT.end} durationInFrames={END_FRAMES}><EndCard title={study.title} note={`${study.client} · ${study.period}`} /></Sequence>
    {/* Toàn bộ tiếng đã trộn sẵn từ OPSPULSE_CUES: python scripts/motion-sfx.py */}
    <Audio src={staticFile("motion/opspulse-sfx.mp3")} />
  </>;
}
