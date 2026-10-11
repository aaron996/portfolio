/* Phim Tìm kho làm trễ trọn vẹn (~32 giây). Bốn cảnh trên một "bản đồ" 2×2, camera đi theo hình
   vuông: hàng kho nghi phạm (trên-trái) → dòng thời gian quét mã (dưới-trái) → xếp quy tắc và tầng
   rây (dưới-phải) → đèn rọi đúng Kho D, câu chốt (trên-phải) → logo. Tiếng: ./sound.ts, trộn thành
   public/motion/warehouse-sfx.mp3. Kịch bản: docs/case-motion.md */

import { Audio, Easing, Sequence, staticFile, useCurrentFrame } from "remotion";
import { EndCard, END_FRAMES } from "../EndCard";
import { Stage } from "../Stage";
import { Tagline } from "../Tagline";
import { C, camera, mix, ramp } from "../paper";
import { lines, study } from "./cast";
import { Scene1, Scene2, T as A } from "./Scenes12";
import { Scene3, Scene4, T as B } from "./Scenes34";
import { warehouseCues } from "./sound";

export const WAREHOUSE_SCENES_FRAMES = B.end;
const AT = { end: WAREHOUSE_SCENES_FRAMES };
export const WAREHOUSE_FILM_FRAMES = AT.end + END_FRAMES;
/** Bảng tiếng tuyệt đối của cả phim — scripts/motion-cues.cjs đọc để trộn tiếng và cho trang nghe thử. */
export const WAREHOUSE_CUES = warehouseCues(AT);

const PATH = [
  { at: 0, x: 640, y: 360 },
  { at: A.pan1, x: 640, y: 360 }, { at: A.pan1 + 30, x: 640, y: 1080 },
  { at: A.pan2, x: 640, y: 1080 }, { at: A.pan2 + 30, x: 1920, y: 1080 },
  { at: B.pan3, x: 1920, y: 1080 }, { at: B.pan3 + 30, x: 1920, y: 360 },
];

function cameraAt(f: number) {
  for (let k = PATH.length - 1; k > 0; k--) {
    const a = PATH[k - 1], b = PATH[k];
    if (f >= a.at) {
      const t = ramp(f, a.at, b.at, Easing.inOut(Easing.cubic));
      return camera(mix(a.x, b.x, t), mix(a.y, b.y, t), 1);
    }
  }
  return camera(640, 360, 1);
}

function World() {
  const f = useCurrentFrame();
  const wipe = ramp(f, B.wipe, B.end - 2, Easing.inOut(Easing.cubic));
  const dim = ramp(f, B.tagline - 4, B.tagline + 8);
  return <Stage>
    <g transform={cameraAt(f)}>
      <rect x={-200} y={-200} width={2960} height={1840} fill={C.paper} />
      <Scene1 f={f} />
      <Scene2 f={f} />
      <Scene3 f={f} />
      <Scene4 f={f} />
    </g>
    {dim > 0 && <rect x={0} y={0} width={1280} height={720} fill={C.paper} opacity={dim * 0.5} />}
    <Tagline f={f} at={B.tagline} text={lines.tagline} />
    {wipe > 0 && <g transform={`rotate(${-3 * (1 - wipe)} 640 ${mix(760, -60, wipe)})`}>
      <rect x={-80} y={mix(760, -60, wipe) + 6} width={1440} height={900} fill="#D9D2C0" />
      <rect x={-80} y={mix(760, -60, wipe)} width={1440} height={900} fill={C.paper} />
    </g>}
  </Stage>;
}

export function WarehouseFilm() {
  return <>
    <Sequence durationInFrames={AT.end}><World /></Sequence>
    <Sequence from={AT.end} durationInFrames={END_FRAMES}><EndCard title={study.title} note={`${study.client} · ${study.period}`} /></Sequence>
    {/* Toàn bộ tiếng đã trộn sẵn từ WAREHOUSE_CUES: python scripts/motion-sfx.py */}
    <Audio src={staticFile("motion/warehouse-sfx.mp3")} />
  </>;
}
