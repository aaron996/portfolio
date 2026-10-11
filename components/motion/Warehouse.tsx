/* Nhà kho / hub kiểu giấy cắt, vẽ trong hộp 300×300 (gốc trên-trái, mặt đất ở y=250).
   Dùng cho hub dồn đơn (GHN Ops Pulse) và hàng kho "nghi phạm" (Tìm kho làm trễ). */

import { C } from "./paper";

export function Warehouse({ x = 0, y = 0, size = 300, color = "#D9CBB0", roof = C.moss, parcels = 0, alarm = 0, face, label, dim = 0 }: {
  x?: number; y?: number; size?: number; color?: string; roof?: string;
  /** Số kiện chất đống trước cửa (cho phép số lẻ: kiện cuối đang rơi xuống). */
  parcels?: number;
  /** 0..1 đèn báo đỏ trên mái sáng lên. */
  alarm?: number;
  /** Mặt cửa sổ: mắt nhìn trái/phải, lông mày lo lắng, hoặc mắt cười (^ ^) khi được minh oan. */
  face?: { look?: number; worry?: boolean; blink?: number; happy?: boolean };
  label?: string;
  /** 0..1 làm mờ (kho bị loại khỏi danh sách quy trách nhiệm). */
  dim?: number;
}) {
  const s = size / 300;
  const pile = Math.max(0, parcels);
  const boxes = Array.from({ length: Math.ceil(pile) }, (_, i) => {
    const row = i < 4 ? 0 : i < 7 ? 1 : 2, col = i < 4 ? i : i < 7 ? i - 4 : i - 7;
    const fall = i === Math.ceil(pile) - 1 && pile % 1 > 0 ? (1 - (pile % 1)) * 90 : 0;
    return { bx: 18 + col * 34 + row * 17, by: 250 - 30 - row * 30 - fall };
  });
  return <g transform={`translate(${x} ${y}) scale(${s})`} opacity={1 - dim * 0.55}>
    {alarm > 0 && <circle cx={150} cy={58} r={40 + alarm * 30} fill={C.tie} opacity={0.18 * alarm} />}
    <rect x={60} y={120} width={180} height={130} fill={color} />
    <path d="M44 124 L150 64 L256 124Z" fill={roof} />
    <rect x={122} y={170} width={56} height={80} fill="#8C7A5E" />
    {[0, 1, 2].map(i => <line key={i} x1={122} x2={178} y1={186 + i * 18} y2={186 + i * 18} stroke="#6E5F48" strokeWidth={4} />)}
    {face
      ? <g>
          <rect x={78} y={142} width={34} height={26} rx={5} fill={C.white} />
          <rect x={188} y={142} width={34} height={26} rx={5} fill={C.white} />
          {face.happy
            ? <g stroke={C.ink} strokeWidth={5} strokeLinecap="round" fill="none"><path d="M88 159 Q95 148 102 159" /><path d="M198 159 Q205 148 212 159" /></g>
            : <>
                <ellipse cx={95 + (face.look ?? 0) * 6} cy={156} rx={5} ry={6 * (1 - (face.blink ?? 0) * 0.85)} fill={C.ink} />
                <ellipse cx={205 + (face.look ?? 0) * 6} cy={156} rx={5} ry={6 * (1 - (face.blink ?? 0) * 0.85)} fill={C.ink} />
              </>}
          {face.worry && <g stroke={C.ink} strokeWidth={4} strokeLinecap="round"><line x1={80} y1={136} x2={108} y2={132} /><line x1={192} y1={132} x2={220} y2={136} /></g>}
        </g>
      : <g fill="#F3EBD9"><rect x={78} y={142} width={34} height={26} rx={4} /><rect x={188} y={142} width={34} height={26} rx={4} /></g>}
    <circle cx={150} cy={58} r={13} fill={alarm > 0 ? C.tie : "#9A928A"} />
    {boxes.map((b, i) => <g key={i}>
      <rect x={b.bx} y={b.by} width={30} height={28} rx={3} fill={C.wood} />
      <line x1={b.bx + 15} x2={b.bx + 15} y1={b.by} y2={b.by + 28} stroke={C.woodDeep} strokeWidth={4} />
    </g>)}
    <rect x={0} y={248} width={300} height={6} fill={C.floorLine} />
    {label && <text x={150} y={286} textAnchor="middle" fontFamily="var(--hero-grotesk, 'Space Grotesk'), sans-serif" fontWeight={700} fontSize={30} fill={C.ink}>{label}</text>}
  </g>;
}
