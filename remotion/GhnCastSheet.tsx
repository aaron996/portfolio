/* Bảng nhân vật GHN để Vinh chọn đồng phục — chỉ dùng trong Remotion Studio/CLI, không lên site.
   Mỗi phương án: vận hành, quản lý, lãnh đạo, bưu tá (mặc đồ GHN) và Vinh (giữ nguyên). */
import { AbsoluteFill } from "remotion";
import { GHN_OPTIONS, ghnLook, type GhnRole } from "../components/motion/ghn";
import { Person } from "../components/motion/Person";
import { Vinh } from "../components/motion/Vinh";
import { C, fonts, H, W } from "../components/motion/paper";
import { lines } from "../components/motion/opspulse/cast";

const ROLES: { role: GhnRole; label: string }[] = [
  { role: "ops", label: "Vận hành" },
  { role: "manager", label: "Quản lý" },
  { role: "lead", label: "Lãnh đạo" },
  { role: "shipper", label: "Bưu tá" },
];

export function GhnCastSheet({ option }: { option: number }) {
  return <AbsoluteFill style={{ background: C.paper }}>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <defs>
        <filter id="cut" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx={0} dy={4} stdDeviation={0} floodColor="#3B2F1E" floodOpacity={0.16} />
        </filter>
      </defs>
      <text x={60} y={78} fontFamily={fonts.sans} fontWeight={700} fontSize={40} fill={C.ink}>{`Phương án ${option + 1} · ${GHN_OPTIONS[option].name}`}</text>
      <rect y={640} width={W} height={80} fill={C.floor} />
      {ROLES.map((r, i) => {
        const x = 150 + i * 230;
        return <g key={r.role}>
          <ellipse cx={x} cy={642} rx={66} ry={10} fill="#3B2F1E" opacity={0.12} />
          <Person x={x} y={640} scale={1.45} look={ghnLook(option, r.role, lines.brand)} pose={{ mouth: "smile" }} filter="url(#cut)" />
          <text x={x} y={690} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={24} fill={C.ink}>{r.label}</text>
        </g>;
      })}
      <line x1={1030} x2={1030} y1={170} y2={620} stroke={C.floorLine} strokeWidth={3} strokeDasharray="10 8" />
      <ellipse cx={1140} cy={642} rx={66} ry={10} fill="#3B2F1E" opacity={0.12} />
      <Vinh x={1140} y={640} scale={1.45} pose={{ smile: 0.7 }} filter="url(#cut)" />
      <text x={1140} y={690} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={24} fill={C.ink}>Vinh (giữ nguyên)</text>
    </svg>
  </AbsoluteFill>;
}
