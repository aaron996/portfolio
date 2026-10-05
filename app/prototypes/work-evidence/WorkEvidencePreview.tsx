"use client";

import Link from "next/link";
import { useState } from "react";
import { content } from "@/content/content.vi";
import { workEvidencePreview as preview } from "@/content/prototypes/work-evidence.vi";
import { portfolioFontVariables } from "@/components/portfolio/PortfolioFonts";
import { PortfolioIcon } from "@/components/portfolio/PortfolioIcon";
import { ProjectImage } from "@/components/portfolio/ProjectImage";
import { BrandMark } from "@/components/ui/BrandMark";
import { BackgroundVideo } from "@/components/portfolio/BackgroundVideo";

export function WorkEvidencePreview() {
  const [direction, setDirection] = useState<(typeof preview.directions)[number]["id"]>("open");
  const selected = preview.directions.find(item => item.id === direction)!;
  const p = content.prototype;
  const featured = content.cases.filter(item => item.tier === "flagship" && item.homepage);

  return <div className={`portfolio-v2 work-preview ${portfolioFontVariables}`} data-direction={direction}>
    <BackgroundVideo />
    <header className="preview-controls">
      <div><p>{preview.status}</p><h1>{preview.title}</h1></div>
      <nav aria-label={preview.navigation}>
        {preview.directions.map(item => <button key={item.id} type="button" aria-pressed={direction === item.id}
          onClick={() => setDirection(item.id)}>{item.label}</button>)}
      </nav>
    </header>
    <div className="preview-context">
      <Link href="/" className="preview-brand"><BrandMark /><span>{content.meta.name}<small>{content.meta.roleLabel}</small></span></Link>
      <a href={content.contact.cvHref}>{p.labels.navCv}<PortfolioIcon /></a>
    </div>
    <main id="main" tabIndex={-1}>
      <section className="preview-work" aria-labelledby="work-title">
        <div className="preview-section-intro"><h2 id="work-title">{p.labels.works}</h2><p>{p.worksIntro}</p></div>
        <div className="preview-work-list">
          {featured.map((item, index) => {
            const work = item.homepage!;
            const media = p.media[item.slug];
            const heading = <h3><Link href={`/case/${item.slug}`}>{work.title}</Link></h3>;
            return <article className="preview-project" key={item.slug}>
              {direction === "dossier" && <div className="preview-project-heading">{heading}<p className="preview-role">{work.role}</p></div>}
              <div className="preview-project-layout">
                {media && <div className="preview-media"><ProjectImage media={media} labels={p.labels} priority={index === 0} /></div>}
                <div className="preview-copy">
                  {direction !== "dossier" && <>{heading}<p className="preview-role">{work.role}</p></>}
                  <p className="preview-summary">{work.summary}</p>
                  <div className="preview-evidence"><span>{preview.evidence}</span><p>{work.evidence}</p></div>
                  <Link href={`/case/${item.slug}`} className="preview-case-link">{work.cta}<PortfolioIcon /></Link>
                </div>
              </div>
            </article>;
          })}
        </div>
      </section>
      <footer className="preview-notes"><p>{selected.description}</p></footer>
    </main>
  </div>;
}
