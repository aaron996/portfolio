"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { content } from "@/content/content.vi";
import { companionsOut } from "@/components/companions/store";

const copy = content.home.timeline;

/* Khung vẽ theo đơn vị viewBox; SVG co giãn theo chiều ngang. */
const W = 1000, H = 400;
const PAD = { left: 84, right: 56, top: 48, bottom: 56 };
const AXIS_X = 40;
const FROM = 2019, TO = 2027;
const BEND = 26; // nửa bề ngang đoạn cong giữa hai chặng

const x = (year: number) => PAD.left + ((year - FROM) / (TO - FROM)) * (W - PAD.left - PAD.right);
const y = (level: number) => PAD.top + (1 - level) * (H - PAD.top - PAD.bottom);

const main = copy.items.filter(item => !item.parallel);

/* Mỗi chặng là một đoạn ngang ở mức của nó; giữa hai chặng là một đường cong. */
const segments = copy.items.map(item => {
  const i = main.indexOf(item);
  const x0 = item.parallel ? x(item.start) + BEND : i === 0 ? x(item.start) : x(item.start) + BEND;
  const x1 = item.end === null ? x(TO) : x(item.end) - BEND;
  return { item, x0, x1, y: y(item.level) };
});

function curve(ax: number, ay: number, bx: number, by: number) {
  const mx = (ax + bx) / 2;
  return `C ${mx} ${ay}, ${mx} ${by}, ${bx} ${by}`;
}

const mainPath = segments.filter(s => !s.item.parallel).reduce((d, s, i, all) => {
  if (i === 0) return `M ${s.x0} ${s.y} H ${s.x1}`;
  const prev = all[i - 1];
  return `${d} ${curve(prev.x1, prev.y, s.x0, s.y)} H ${s.x1}`;
}, "");

const branchPaths = segments.filter(s => s.item.parallel).map(s => {
  const host = segments.find(o => !o.item.parallel && o.item.start <= s.item.start && (o.item.end ?? TO) >= s.item.start)!;
  const bx = x(s.item.start) - BEND;
  return `M ${bx} ${host.y} ${curve(bx, host.y, s.x0, s.y)} H ${s.x1}`;
});

const label = (item: (typeof copy.items)[number]) => item.parallel ? `${item.short} · ${copy.sideJob}` : item.short;
/* Ước lượng bề ngang nhãn (~9.5 đơn vị/ký tự ở cỡ 17) để nhãn sát mép phải neo về bên phải. */
const labelFits = (s: (typeof segments)[number]) => s.x0 + label(s.item).length * 9.5 < W - 4;

export function CareerPath() {
  const [active, setActive] = useState(copy.items.indexOf(main[main.length - 1]));
  const [announcement, setAnnouncement] = useState("");
  const [inView, setInView] = useState(false);
  /* Ba bạn đồng hành đang ở ngoài → đường chờ Chấm nhảy tới đầu rồi mới vẽ. */
  const [lead, setLead] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = copy.items[active];

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      if (companionsOut()) {
        setLead(true);
        window.dispatchEvent(new CustomEvent("companion:path"));
      }
      setInView(true);
    }, { threshold: 0.35 });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  /* Bấm (không phải rê) vào một chặng thì Chấm nhảy tới chặng đó. */
  const choose = (index: number) => {
    focusStop(index);
    window.dispatchEvent(new CustomEvent("companion:path-stop", { detail: index }));
  };
  const focusStop = (index: number) => {
    setActive(index);
    const item = copy.items[index];
    setAnnouncement(`${item.start} – ${item.end ?? copy.now}. ${item.company}. ${item.role}. ${item.note}`);
  };
  const onKey = (index: number) => (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(index); }
  };

  return <section id="experience" className="cp" aria-labelledby="cp-title" data-companion="path">
    <header className="home-section-head">
      <h2 id="cp-title">{copy.heading}</h2>
      <p>{copy.hint}</p>
    </header>

    <div className="cp-scroll" ref={ref}>
      <svg className="cp-chart" viewBox={`0 0 ${W} ${H}`} data-inview={inView} data-lead={lead} aria-label={copy.chartLabel} role="group">
        <defs>
          <marker id="cp-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 10 5 0 10z" className="cp-arrowhead" />
          </marker>
          {/* Mũi tên "nay" ở cuối đường: hiện sau khi đường vẽ xong, không đứng trơ trọi lúc đầu. */}
          <marker id="cp-arrow-end" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 10 5 0 10z" className="cp-end-head" />
          </marker>
        </defs>

        {Array.from({ length: TO - FROM + 1 }, (_, i) => FROM + i).map(year => <g key={year}>
          <line x1={x(year)} x2={x(year)} y1={PAD.top - 16} y2={H - PAD.bottom + 8} className="cp-grid" />
          <text x={x(year)} y={H - 18} textAnchor="middle" className="cp-year">{year === TO ? copy.now : year}</text>
        </g>)}

        <line x1={AXIS_X} x2={AXIS_X} y1={y(0)} y2={y(1) - 8} className="cp-axis" markerEnd="url(#cp-arrow)" />
        {/* Nhãn trục xoay dọc theo mũi tên: "Vận hành" ở gốc, "Dữ liệu & sản phẩm" ở đỉnh. */}
        <text transform={`translate(${AXIS_X - 12} ${y(0)}) rotate(-90)`} className="cp-axis-label">{copy.axisOps}</text>
        <text transform={`translate(${AXIS_X - 12} ${y(1)}) rotate(-90)`} textAnchor="end" className="cp-axis-label cp-axis-data">{copy.axisData}</text>

        <path d={mainPath} className="cp-line" pathLength={1} markerEnd="url(#cp-arrow-end)" />
        {branchPaths.map(d => <path key={d} d={d} className="cp-line cp-branch" pathLength={1} />)}

        {segments.map((s, index) => {
          const on = active === index;
          return <g key={s.item.company} className="cp-stop" data-active={on} tabIndex={0} role="button" aria-pressed={on}
            aria-label={`${s.item.company}, ${s.item.start} – ${s.item.end ?? copy.now}`}
            style={{ transitionDelay: `${300 + index * 140}ms` }}
            onPointerEnter={() => setActive(index)} onFocus={() => focusStop(index)} onClick={() => choose(index)} onKeyDown={onKey(index)}>
            <line x1={s.x0} x2={s.x1} y1={s.y} y2={s.y} className="cp-hit" />
            <line x1={s.x0} x2={s.x1} y1={s.y} y2={s.y} className="cp-seg" />
            <circle cx={s.x0} cy={s.y} r={on ? 9 : 6} className="cp-dot" />
            <text x={labelFits(s) ? s.x0 : W - 4} y={s.y - 18} textAnchor={labelFits(s) ? "start" : "end"} className="cp-name">{label(s.item)}</text>
          </g>;
        })}
      </svg>
    </div>

    <div className="cp-detail">
      <p className="cp-when">{current.start} – {current.end ?? copy.now}</p>
      <h3>{current.company}</h3>
      <p className="cp-role">{current.role}</p>
      <p className="cp-note">{current.note}</p>
    </div>
    <span className="sr-only" role="status" aria-atomic="true">{announcement}</span>
  </section>;
}
