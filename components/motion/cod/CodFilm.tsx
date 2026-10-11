/* Phim Rà soát COD trọn vẹn (~28 giây): bưu tá GHN giao hàng, thu tiền; ứng dụng báo giao thành công
   nhưng tiền bị giữ mà hệ thống không thấy → Vinh dựng cỗ máy AI chấm điểm nghi ngờ từ cuộc gọi,
   hành trình, tin nhắn → danh sách thành module Rà soát COD trong GHN Ops Pulse, AUTO mỗi ngày, đội
   vận hành xử lý ngay → logo. Tiếng: ./sound.ts, trộn thành public/motion/cod-sfx.mp3.
   Kịch bản: docs/case-motion.md */

import { Audio, Sequence, staticFile } from "remotion";
import { EndCard, END_FRAMES } from "../EndCard";
import { AiEngine, AI_FRAMES } from "./AiEngine";
import { study } from "./cast";
import { CodBoard, BOARD_FRAMES } from "./CodBoard";
import { Doorstep, DOORSTEP_FRAMES } from "./Doorstep";
import { codCues } from "./sound";

const AT = { ai: DOORSTEP_FRAMES, board: DOORSTEP_FRAMES + AI_FRAMES, end: DOORSTEP_FRAMES + AI_FRAMES + BOARD_FRAMES };
export const COD_FILM_FRAMES = AT.end + END_FRAMES;
/** Bảng tiếng tuyệt đối của cả phim — scripts/motion-cues.cjs đọc để trộn tiếng và cho trang nghe thử. */
export const COD_CUES = codCues(AT);

export function CodFilm() {
  return <>
    <Sequence durationInFrames={AT.ai}><Doorstep /></Sequence>
    <Sequence from={AT.ai} durationInFrames={AI_FRAMES}><AiEngine /></Sequence>
    <Sequence from={AT.board} durationInFrames={BOARD_FRAMES}><CodBoard /></Sequence>
    <Sequence from={AT.end} durationInFrames={END_FRAMES}><EndCard title={study.title} note={`${study.client} · ${study.period}`} /></Sequence>
    {/* Toàn bộ tiếng đã trộn sẵn từ COD_CUES: python scripts/motion-sfx.py */}
    <Audio src={staticFile("motion/cod-sfx.mp3")} />
  </>;
}
