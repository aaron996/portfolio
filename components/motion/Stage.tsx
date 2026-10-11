/* Khung chung của một cảnh phim: nền, bóng giấy cứng (#cut) và lớp hạt giấy phủ trên cùng. */

import type { ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { C, H, W } from "./paper";

export function Stage({ bg = C.paper, children }: { bg?: string; children: ReactNode }) {
  return <AbsoluteFill style={{ background: bg }}>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <defs>
        <filter id="cut" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx={0} dy={4} stdDeviation={0} floodColor="#3B2F1E" floodOpacity={0.16} />
        </filter>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency={0.85} numOctaves={2} seed={4} />
          <feColorMatrix values="0 0 0 0 0.23  0 0 0 0 0.18  0 0 0 0 0.12  0 0 0 0.55 0" />
        </filter>
      </defs>
      {children}
      <rect width={W} height={H} filter="url(#grain)" opacity={0.08} style={{ mixBlendMode: "multiply" }} />
    </svg>
  </AbsoluteFill>;
}
