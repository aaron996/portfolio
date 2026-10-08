import Link from "next/link";
import type { CaseStudy, Media } from "@/content/types";
import { content } from "@/content/content.vi";
import { portfolioFontVariables } from "@/components/portfolio/PortfolioFonts";
import { PortfolioIcon } from "@/components/portfolio/PortfolioIcon";
import { SiteNav } from "@/components/home/SiteNav";
import { HomeContact } from "@/components/home/HomeContact";
import { CompanionLayer } from "@/components/companions/CompanionLayer";
import "@/components/home/home.css";
import "./case.css";

const L = content.casePage;

function Unverified({ verified, title }: { verified: boolean; title?: string }) {
  if (verified) return null;
  return <span className="ca-unverified" title={title || L.unverifiedTitle}>{L.unverified}</span>;
}

function Figure({ media, priority = false }: { media: Media; priority?: boolean }) {
  const caption = media.caption ?? (media.isDemoData ? L.demoData : null);
  return <figure className="ca-figure" data-wide={media.wide ? "true" : undefined}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={media.src} alt={media.alt} loading={priority ? "eager" : "lazy"} />
    {caption && <figcaption>{caption}</figcaption>}
  </figure>;
}

/* Một mục của bài: nhãn dính cột trái, nội dung cột phải. */
function Part({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return <section className="ca-part" id={id} aria-labelledby={id ? `${id}-title` : undefined}>
    <h2 id={id ? `${id}-title` : undefined}>{title}</h2>
    <div className="ca-part-body">{children}</div>
  </section>;
}

export function CaseArticle({ caseStudy: c }: { caseStudy: CaseStudy }) {
  const index = content.cases.findIndex(item => item.slug === c.slug);
  const next = content.cases[(index + 1) % content.cases.length];
  const others = content.cases.filter(item => item.slug !== c.slug && item.slug !== next.slug);
  const [hero, ...gallery] = c.media ?? [];
  const title = (item: CaseStudy) => item.homepage?.title ?? item.title;

  return <div id="top" className={`home ca ${portfolioFontVariables}`}>
    <a href="#main" className="home-skip">{content.prototype.labels.skip}</a>
    <SiteNav onHome={false} progress />

    <main id="main" tabIndex={-1}>
      <article data-read>
        <header className="ca-head">
          <Link href="/#cases" className="ca-back"><PortfolioIcon name="back" />{L.back}</Link>
          <p className="ca-scope">{c.scopeLabel}</p>
          <h1>{c.title}</h1>
          <p className="ca-proves">{c.proves}</p>
          <p className="ca-one">{c.oneLiner}</p>

          <div className="ca-facts">
            <dl>
              <div><dt>{L.client}</dt><dd>{c.client}{c.clientNote && <small>{c.clientNote}</small>}</dd></div>
              <div><dt>{L.role}</dt><dd>{c.role}</dd></div>
              <div><dt>{L.period}</dt><dd>{c.period}</dd></div>
            </dl>
            <p className="ca-key" data-companion={c.keyResult.companion === "outlier" ? "result" : undefined}>
              <strong>{c.keyResult.value}<Unverified verified={c.keyResult.verified} /></strong>
              <span>{c.keyResult.label}</span>
            </p>
          </div>
        </header>

        {hero && <div className="ca-hero"><Figure media={hero} priority /></div>}

        {c.context.length > 0 && <Part title={L.context} id="context">
          {c.context.map(p => <p key={p.slice(0, 32)}>{p}</p>)}
        </Part>}

        {c.decisions.length > 0 && <Part title={L.decisions} id="decisions">
          <ol className="ca-decisions">
            {c.decisions.map((d, i) => <li key={d.problem} data-companion={d.companion}>
              <span className="ca-num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{d.problem}</h3>
              <div className="ca-why"><p className="ca-label">{L.why}</p><p>{d.why}</p></div>
              <div className="ca-did"><p className="ca-label">{L.decision}</p><p>{d.decision}</p></div>
              {d.term && <p className="ca-term">{d.term}</p>}
            </li>)}
          </ol>
        </Part>}

        {c.features && c.features.length > 0 && <Part title={L.features} id="features">
          <ul className="ca-features">
            {c.features.map(f => <li key={f.title}><h3>{f.title}</h3><p>{f.description}</p></li>)}
          </ul>
        </Part>}

        {c.flow && <Part title={c.flowHeading || L.flow} id="flow">
          <ol className="ca-flow">
            {c.flow.nodes.map(n => <li key={n.id}><strong>{n.label}</strong>{n.sublabel && <span>{n.sublabel}</span>}</li>)}
          </ol>
        </Part>}

        {gallery.length > 0 && <Part title={L.media} id="media">
          <div className="ca-gallery">{gallery.map(m => <Figure key={m.id} media={m} />)}</div>
        </Part>}

        {c.results.length > 0 && <Part title={L.results} id="results">
          <dl className="ca-results">
            {c.results.map(r => <div key={r.label}>
              <dt>{r.label}</dt>
              <dd><strong>{r.value}<Unverified verified={r.verified} title={r.method} /></strong><span>{r.method}</span></dd>
            </div>)}
          </dl>
        </Part>}

        {(c.ownership.owned.length > 0 || c.ownership.notOwned.length > 0) && <Part title={L.owned} id="ownership">
          <ul className="ca-owned">{c.ownership.owned.map(o => <li key={o.slice(0, 32)}>{o}</li>)}</ul>
          {c.ownership.notOwned.length > 0 && <>
            <h3 className="ca-sub">{L.notOwned}</h3>
            <ul className="ca-not-owned">{c.ownership.notOwned.map(o => <li key={o.slice(0, 32)}>{o}</li>)}</ul>
          </>}
        </Part>}

        {c.stack.length > 0 && <Part title={L.stack} id="stack">
          <dl className="ca-stack">{c.stack.map(g => <div key={g.group}><dt>{g.group}</dt><dd>{g.items.join(" · ")}</dd></div>)}</dl>
        </Part>}

        {c.reflection.length > 0 && <Part title={L.reflection} id="reflection">
          <div className="ca-reflection">{c.reflection.map(p => <p key={p.slice(0, 32)}>{p}</p>)}</div>
        </Part>}
      </article>

      <nav className="ca-next" aria-label={L.others}>
        <Link href={`/case/${next.slug}`} className="ca-next-main">
          <span>{L.next}</span>
          <strong>{title(next)}<PortfolioIcon name="forward" /></strong>
          <small>{next.client} · {next.period}</small>
        </Link>
        <ul>
          {others.map(o => <li key={o.slug}><Link href={`/case/${o.slug}`}>{title(o)}<PortfolioIcon /></Link></li>)}
        </ul>
      </nav>
    </main>

    <HomeContact replay={false} />
    <CompanionLayer nav=".home-nav" origin="logo" />
  </div>;
}
