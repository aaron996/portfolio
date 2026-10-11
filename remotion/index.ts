// Entry cho Remotion CLI/Studio — chỉ để xem trước và xuất MP4 các phim case.
// Trên site, phim chạy trực tiếp bằng @remotion/player (không qua file này).
//   npx remotion studio remotion/index.ts
//   npx remotion render remotion/index.ts InterdistOpener .preview/interdist-opener.mp4
import { registerRoot } from "remotion";
import { Root } from "./Root";

registerRoot(Root);
