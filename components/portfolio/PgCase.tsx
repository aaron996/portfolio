import { PortfolioIcon } from "./PortfolioIcon";
import Link from "next/link";
import type { CaseStudy } from "@/content/types";
import { content } from "@/content/content.vi";
import { PortfolioNav, PortfolioContact } from "./PortfolioShell";
import { ProjectImage } from "./ProjectImage";
import { SensorBotCanvas } from "@/components/ui/SensorBotCanvas";
import { portfolioFontVariables } from "./PortfolioFonts";

export function PgCase({ caseStudy: c }: { caseStudy: CaseStudy }) {
  const p = content.prototype;
  return (
    <div className={`portfolio-v2 ${portfolioFontVariables}`}>
      <div className="pf-dark">
        <PortfolioNav />
      </div>
      <main id="main" tabIndex={-1}>
    <header className="pf-shell pf-case-header"><Link className="pf-text-link" href="/#cases"><PortfolioIcon name="back" />{p.labels.back}</Link>
      <h1>{c.title}</h1><p className="pf-meta">{p.pg.period}</p><div className="pf-case-lead"><p>{p.pg.context}</p><p>{p.pg.role}</p></div>
    </header>
    <div className="pf-shell pf-case-hero"><ProjectImage media={p.media[c.slug]} labels={p.labels} priority /></div>
    <section className="pf-shell pf-section pf-decisions"><h2>{p.labels.decisions}</h2><div>{p.pg.decisions.map(d => <article key={d.id} id={d.id}><h3>{d.title}</h3><p>{d.body}</p></article>)}</div><ProjectImage media={p.media.target} labels={p.labels} /></section>
    <section className="pf-section pf-case-result"><div className="pf-shell pf-case-two-col"><div><h2>{p.labels.results}</h2><p>{p.pg.output}</p></div><div><p className="pf-result-number">{p.pg.result.value}</p><h3>{p.pg.result.label}</h3><p>{p.pg.result.method}</p><p className="pf-source-note">{p.pg.snapshot}</p></div></div></section>
    <section className="pf-shell pf-section pf-case-two-col"><h2>{p.labels.ownership}</h2><div><ul className="pf-owned">{c.ownership.owned.map(item => <li key={item}>{item}</li>)}</ul><h3>{p.labels.sharedScope}</h3>{c.ownership.notOwned.map(item => <p key={item}>{item}</p>)}</div></section>
    <section className="pf-shell pf-section pf-details"><h2>{p.labels.details}</h2>{p.pg.details.map((detail,index) => <details key={detail.title}><summary>{detail.title}<PortfolioIcon name="plus" /></summary><div><p>{detail.body}</p>{index === 0 && <ProjectImage media={p.media.import} labels={p.labels} />}</div></details>)}<details><summary>{p.labels.stack}<PortfolioIcon name="plus" /></summary><dl>{c.stack.map(group => <div key={group.group}><dt>{group.group}</dt><dd>{group.items.join(" · ")}</dd></div>)}</dl></details></section>
    <section className="pf-shell pf-section pf-case-two-col"><h2>{p.labels.lesson}</h2><p>{p.pg.lesson}</p></section>
    <section className="pf-shell pf-section pf-related"><h2>{p.labels.related}</h2>{content.cases.filter(item => ["kas-shopee-performance", "kas-reporting-automation"].includes(item.slug)).map(item => <Link key={item.slug} href={`/case/${item.slug}`}><h3>{item.homepage!.title}</h3><PortfolioIcon /></Link>)}</section>
    <PortfolioContact />
      </main>
      <SensorBotCanvas />
    </div>
  );
}
