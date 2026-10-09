/* Sân khấu cho trận đấu ở footer (components/companions/fight.ts): lồng sắt trong một club
   về đêm — giàn đèn, biển neon, khán giả là những ô vuông nhỏ đứng sau lồng và hàng đầu
   bóng đen dưới chân sàn. Chỉ là phông nền: nhân vật và hiệu ứng do lớp bạn đồng hành vẽ
   lên trên. Trạng thái do fight.ts gán qua data-*:
   - `data-lit`   — đèn sân khấu, neon, khán giả ùa vào.
   - `data-crowd` — off · on · hype (nhảy cuồng) · chant (nhún đồng loạt) · gasp (giật mình).
   - `data-hud`   — thanh máu.
   - `data-slowmo`— khung điện ảnh: viền đen trên dưới, tối góc, vạch tốc độ.
   `.hc-cam` là "ống kính": fight.ts phóng to nó cùng lớp nhân vật để zoom cận cảnh. */

import type { CSSProperties } from "react";
import { content } from "@/content/content.vi";

const fight = content.home.fight;

/* Ngẫu nhiên có hạt giống: server và client sinh cùng một đám đông. */
function seeded(seed: number) {
  return () => (seed = (seed * 16807) % 2147483647) / 2147483647;
}

const SKIN = ["#2c3a52", "#45324f", "#28473f", "#4f3f2a", "#33366b", "#57303f", "#3b4a5e", "#2f5145"];
const RIMS = ["#ff3d9a", "#3dd6ff", "#ffb347", "#b26bff"];

type Fan = { style: CSSProperties; phone?: boolean };

function makeCrowd() {
  const r = seeded(20261009);
  const back: Fan[] = [];
  // Ba dãy khán đài sau lồng: dãy xa nhỏ và tối hơn.
  ([[0, 46, 7, 84, 0.55], [1, 40, 10, 54, 0.75], [2, 34, 13, 24, 0.95]] as const).forEach(([row, count, size, y, light]) => {
    for (let n = 0; n < count; n++) {
      const s = size + Math.round(r() * 3);
      back.push({
        phone: row > 0 && r() < 0.13,
        style: {
          left: `${((n + 0.2 + r() * 0.6) / count) * 100}%`,
          bottom: `${y + Math.round(r() * 6)}px`,
          "--s": `${s}px`, "--c": SKIN[Math.floor(r() * SKIN.length)], "--l": light,
          "--d": `${(-r() * 1.2).toFixed(2)}s`, "--t": `${(0.7 + r() * 0.5).toFixed(2)}s`,
          "--in": `${Math.round(r() * 420)}ms`, zIndex: row,
        } as CSSProperties,
      });
    }
  });
  // Hàng đầu sát sàn: bóng đen lớn, mép trên bắt ánh đèn màu.
  const front: Fan[] = Array.from({ length: 22 }, (_, n) => ({
    style: {
      left: `${((n + 0.1 + r() * 0.8) / 22) * 100}%`,
      bottom: `${-14 + Math.round(r() * 10)}px`,
      "--s": `${24 + Math.round(r() * 12)}px`, "--rim": RIMS[n % RIMS.length],
      "--d": `${(-r() * 1.2).toFixed(2)}s`, "--t": `${(0.6 + r() * 0.5).toFixed(2)}s`,
      "--in": `${Math.round(r() * 360)}ms`,
    } as CSSProperties,
  }));
  // Đèn flash máy ảnh lác đác trong khán đài.
  const bulbs = Array.from({ length: 8 }, () => ({
    left: `${4 + r() * 92}%`, bottom: `${30 + Math.round(r() * 90)}px`,
    "--d": `${(r() * 6).toFixed(2)}s`, "--t": `${(3.5 + r() * 4).toFixed(2)}s`,
  } as CSSProperties));
  return { back, front, bulbs };
}

const CROWD = makeCrowd();
/* Giàn đèn màu quét qua khán đài; đèn trắng giữa là đèn rọi sàn đấu. */
const LIGHTS = [
  { x: "9%", c: "#ff3d9a", a0: "-34deg", a1: "6deg", t: "5.2s" },
  { x: "29%", c: "#3dd6ff", a0: "-22deg", a1: "18deg", t: "4.1s" },
  { x: "71%", c: "#ffb347", a0: "22deg", a1: "-18deg", t: "4.6s" },
  { x: "91%", c: "#b26bff", a0: "34deg", a1: "-6deg", t: "5.6s" },
];

export function FightArena() {
  return <div className="hc-arena" data-companion="arena" data-lit="false" data-hud="false" data-crowd="off" aria-hidden="true">
    <div className="hc-cam">
      <div className="hc-haze" />
      <div className="hc-neon">{fight.neon}</div>
      <div className="hc-sign hc-sign-bar">{fight.bar}</div>
      <div className="hc-sign hc-sign-exit">{fight.exit}</div>
      <div className="hc-crowd-back">
        {CROWD.back.map((f, n) => <i key={n} className="hc-fan" data-phone={f.phone || undefined} style={f.style} />)}
        {CROWD.bulbs.map((style, n) => <b key={n} className="hc-bulb" style={style} />)}
      </div>
      <div className="hc-truss">
        {LIGHTS.map(l => <div key={l.x} className="hc-light" style={{ left: l.x, "--c": l.c, "--a0": l.a0, "--a1": l.a1, "--t": l.t } as CSSProperties}>
          <span className="hc-ray" /><span className="hc-lamp" />
        </div>)}
      </div>
      <div className="hc-beam" />
      <div className="hc-cage" />
      <div className="hc-pool" />
      <div className="hc-floor" />
      <div className="hc-crowd-front">
        {CROWD.front.map((f, n) => <i key={n} className="hc-fan" style={f.style} />)}
      </div>
    </div>
    <div className="hc-lines" />
    <div className="hc-vig" />
    <div className="hc-hp hc-hp-a"><b>{fight.aName}</b><i><u /></i></div>
    <div className="hc-hp hc-hp-b"><b>{fight.bName}</b><i><u /></i></div>
    <div className="hc-lb" />
  </div>;
}
