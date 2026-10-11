/* Bảng nhân vật để duyệt ngoại hình Vinh — chỉ dùng trong Remotion Studio/CLI, không lên site. */
import { AbsoluteFill } from "remotion";
import { Vinh } from "../components/motion/Vinh";
import { C, H, W } from "../components/motion/paper";

export function VinhSheet() {
  return <AbsoluteFill style={{ background: C.paper }}>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <defs>
        <filter id="cut" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx={0} dy={4} stdDeviation={0} floodColor="#3B2F1E" floodOpacity={0.16} />
        </filter>
      </defs>
      <rect y={660} width={W} height={60} fill={C.floor} />
      <ellipse cx={420} cy={664} rx={80} ry={12} fill="#3B2F1E" opacity={0.12} />
      <Vinh x={420} y={662} scale={1.7} pose={{ smile: 0.6 }} filter="url(#cut)" />
      <ellipse cx={860} cy={664} rx={80} ry={12} fill="#3B2F1E" opacity={0.12} />
      <Vinh x={860} y={662} scale={1.7} pose={{ smile: 1, push: 1, glint: 0.45, look: -1 }} filter="url(#cut)" />
    </svg>
  </AbsoluteFill>;
}
