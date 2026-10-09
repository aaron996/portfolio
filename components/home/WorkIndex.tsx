"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { content } from "@/content/content.vi";
import { PortfolioIcon } from "@/components/portfolio/PortfolioIcon";

const copy = content.home.work;

/* Báo cho bạn đồng hành biết người xem đang rê vào case nào (null = rời danh sách). */
const tell = (slug: string | null) => window.dispatchEvent(new CustomEvent("companion:work", { detail: slug }));

/* Chỉ có hai mốc đã xác nhận nên vẽ slope chart hai điểm — không nội suy chuỗi giả. */
function SlopeChart() {
  const { before, after, aria } = copy.chart;
  const min = 86, max = 100, h = 200, top = 30;
  const y = (v: number) => top + (1 - (v - min) / (max - min)) * h;
  const x1 = 90, x2 = 410;
  return <svg className="wi-chart" viewBox="0 0 480 270" role="img" aria-label={aria}>
    {[88, 92, 96, 100].map(v => <g key={v}>
      <line x1="56" x2="460" y1={y(v)} y2={y(v)} className="wi-grid" />
      <text x="48" y={y(v) + 4} textAnchor="end" className="wi-axis">{v}%</text>
    </g>)}
    <line x1={x1} y1={y(before.value)} x2={x2} y2={y(after.value)} className="wi-slope" pathLength={1} />
    <circle cx={x1} cy={y(before.value)} r="7" className="wi-dot-before" />
    <circle cx={x2} cy={y(after.value)} r="8" className="wi-dot-after" />
    <text x={x1} y={y(before.value) + 30} textAnchor="middle" className="wi-val">{before.value}%</text>
    <text x={x2} y={y(after.value) - 18} textAnchor="middle" className="wi-val wi-val-after">{after.value}%</text>
    <text x={x1} y="262" textAnchor="middle" className="wi-axis">{before.year}</text>
    <text x={x2} y="262" textAnchor="middle" className="wi-axis">{after.year}</text>
  </svg>;
}

function Preview({ index }: { index: number }) {
  const item = content.cases[index];
  const shot = item.media?.[0];
  return <div className="wi-preview-inner" key={item.slug}>
    <div className="wi-frame">
      {shot
        ? <Image src={shot.src} alt={shot.alt} fill sizes="(max-width: 1100px) 50vw, 600px" />
        : item.slug === copy.chart.slug
          ? <SlopeChart />
          : <p className="wi-frame-figure">{item.keyResult.value}</p>}
    </div>
    <p className="wi-result"><strong>{item.keyResult.value}</strong><span>{item.keyResult.label}</span></p>
  </div>;
}

export function WorkIndex() {
  const [active, setActive] = useState(0);

  return <section id="cases" className="wi" aria-labelledby="wi-title" data-companion="work">
    <header className="home-section-head">
      <h2 id="wi-title">{copy.heading}</h2>
      <p>{String(content.cases.length).padStart(2, "0")} {copy.count}<span className="wi-hint"> · {copy.hint}</span></p>
    </header>

    <div className="wi-layout">
      <ol className="wi-list" onPointerLeave={() => tell(null)}>
        {content.cases.map((item, index) => <li key={item.slug}>
          <Link href={`/case/${item.slug}`} className="wi-row" data-active={active === index}
            onPointerEnter={() => { setActive(index); tell(item.slug); }} onFocus={() => { setActive(index); tell(item.slug); }}>
            <span className="wi-index">{String(index + 1).padStart(2, "0")}</span>
            <span className="wi-title">{item.homepage?.title ?? item.title}</span>
            <span className="wi-meta">{item.client} · {item.period}</span>
            <span className="wi-mobile-result">{item.keyResult.value}</span>
            <span className="wi-open" aria-hidden="true"><PortfolioIcon /></span>
          </Link>
        </li>)}
      </ol>
      <div className="wi-preview" aria-hidden="true">
        <Preview index={active} />
      </div>
    </div>
  </section>;
}
