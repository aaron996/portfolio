import Link from "next/link";
import type { CaseStudy, Media } from "@/content/types";
import { content } from "@/content/content.vi";
import { portfolioFontVariables } from "@/components/portfolio/PortfolioFonts";
import { PortfolioIcon, isIconName } from "@/components/portfolio/PortfolioIcon";
import { SiteNav } from "@/components/home/SiteNav";
import { AiBadge } from "@/components/home/AiBadge";
import { CaseFigure } from "./CaseFigure";
import { CaseFilm } from "./CaseFilm";
import { hasFilm } from "./films";
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
  return <CaseFigure src={media.src} alt={media.alt} width={media.width} height={media.height} caption={caption} wide={media.wide} priority={priority} />;
}

/* Một mục của bài: số thứ tự + tiêu đề ở trên, nội dung trải ngang bên dưới. */
function Part({ n, title, children, id, className }: { n: number; title: string; children: React.ReactNode; id: string; className?: string }) {
  return <section className={`ca-part${className ? ` ${className}` : ""}`} id={id} aria-labelledby={`${id}-title`}>
    <header className="ca-part-head">
      <span className="ca-part-n" aria-hidden="true">{String(n).padStart(2, "0")}</span>
      <h2 id={`${id}-title`}>{title}</h2>
    </header>
    {children}
  </section>;
}

export function CaseArticle({ caseStudy: c }: { caseStudy: CaseStudy }) {
  const index = content.cases.findIndex(item => item.slug === c.slug);
  const next = content.cases[(index + 1) % content.cases.length];
  const others = content.cases.filter(item => item.slug !== c.slug && item.slug !== next.slug);
  // Case có phim thì phim nằm thu nhỏ cạnh tiêu đề, ảnh chụp màn hình xuống mục ảnh.
  const film = c.motion && hasFilm(c.slug) ? c.motion : null;
  const [hero, ...rest] = film ? [undefined, ...(c.media ?? [])] : c.media ?? [];
  const gallery = rest.filter((m): m is Media => !!m);
  const title = (item: CaseStudy) => item.homepage?.title ?? item.title;
  const [lead, ...context] = c.context;
  const hasOwned = c.ownership.owned.length > 0 || c.ownership.notOwned.length > 0;
  let n = 0;

  return <div id="top" className={`home ca ${portfolioFontVariables}`}>
    <SiteNav onHome={false} progress />

    <main id="main" tabIndex={-1}>
      <article data-read>
        <header className="ca-head" data-film={film ? "true" : undefined}>
          <div className="ca-head-text">
            <Link href="/#cases" className="ca-back"><PortfolioIcon name="back" />{L.back}</Link>
            <p className="ca-scope">{c.scopeLabel}{c.homepage?.badge && <AiBadge id={`${c.slug}:case`} label={c.homepage.badge.label} aria={c.homepage.badge.aria} />}</p>
            <h1>{c.title}</h1>
            <p className="ca-proves">{c.proves}</p>
            <p className="ca-one">{c.oneLiner}</p>
          </div>
          {film && <div className="ca-head-film"><CaseFilm slug={c.slug} motion={film} /></div>}
        </header>

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

        {hero && <div className="ca-hero"><Figure media={hero} priority /></div>}

        {lead && <Part n={++n} title={L.context} id="context">
          <div className="ca-context" data-single={context.length === 0 ? "true" : undefined}>
            <p className="ca-lead">{lead}</p>
            {context.length > 0 && <div>{context.map(p => <p key={p.slice(0, 32)}>{p}</p>)}</div>}
          </div>
        </Part>}

        {c.decisions.length > 0 && <Part n={++n} title={L.decisions} id="decisions">
          <ol className="ca-decisions" data-count={c.decisions.length}>
            {c.decisions.map((d, i) => <li key={d.problem} data-companion={d.companion}>
              <span className="ca-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <h3>{d.problem}</h3>
              <div className="ca-did"><p className="ca-label">{L.decision}</p><p>{d.decision}</p></div>
              <details className="ca-why">
                <summary><span>{L.why}</span><PortfolioIcon name="chevron" /></summary>
                <p>{d.why}</p>
              </details>
              {d.term && <p className="ca-term">{d.term}</p>}
            </li>)}
          </ol>
        </Part>}

        {c.features && c.features.length > 0 && <Part n={++n} title={L.features} id="features">
          <ul className="ca-features">
            {c.features.map(f => <li key={f.title}>
              {isIconName(f.icon) && <span className="ca-feature-icon"><PortfolioIcon name={f.icon} /></span>}
              <h3>{f.title}</h3><p>{f.description}</p>
            </li>)}
          </ul>
        </Part>}

        {c.flow && <Part n={++n} title={c.flowHeading || L.flow} id="flow">
          <ol className="ca-flow" style={{ "--steps": c.flow.nodes.length } as React.CSSProperties}>
            {c.flow.nodes.map(node => <li key={node.id}><strong>{node.label}</strong>{node.sublabel && <span>{node.sublabel}</span>}</li>)}
          </ol>
        </Part>}

        {gallery.length > 0 && <Part n={++n} title={L.media} id="media">
          <div className="ca-gallery">{gallery.map(m => <Figure key={m.id} media={m} />)}</div>
        </Part>}

        {c.results.length > 0 && <Part n={++n} title={L.results} id="results">
          <dl className="ca-results">
            {c.results.map(r => <div key={r.label}>
              <dt>{r.label}</dt>
              <dd><strong>{r.value}<Unverified verified={r.verified} title={r.method} /></strong><span>{r.method}</span></dd>
            </div>)}
          </dl>
        </Part>}

        {(hasOwned || c.stack.length > 0) && <div className="ca-duo">
          {hasOwned && <Part n={++n} title={L.owned} id="ownership">
            <ul className="ca-owned">{c.ownership.owned.map(o => <li key={o.slice(0, 32)}>{o}</li>)}</ul>
            {c.ownership.notOwned.length > 0 && <>
              <h3 className="ca-sub">{L.notOwned}</h3>
              <ul className="ca-not-owned">{c.ownership.notOwned.map(o => <li key={o.slice(0, 32)}>{o}</li>)}</ul>
            </>}
          </Part>}

          {c.stack.length > 0 && <Part n={++n} title={L.stack} id="stack">
            <dl className="ca-stack">{c.stack.map(g => <div key={g.group}>
              <dt>{g.group}</dt>
              <dd><ul>{g.items.map(item => <li key={item}>{item}</li>)}</ul></dd>
            </div>)}</dl>
          </Part>}
        </div>}

        {c.reflection.length > 0 && <Part n={++n} title={L.reflection} id="reflection">
          <blockquote className="ca-reflection">{c.reflection.map(p => <p key={p.slice(0, 32)}>{p}</p>)}</blockquote>
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
