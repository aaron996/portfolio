import Link from "next/link";
import { content } from "@/content/content.vi";
import { PortfolioIcon } from "./PortfolioIcon";
import { ProjectImage } from "./ProjectImage";
import { SectionReveal } from "./SectionReveal";

export function FeaturedWork() {
  const p = content.prototype;
  const featured = content.cases.filter((c) => c.tier === "flagship" && c.homepage);

  return (
    <section id="cases" className="pf-shell pf-work-section">
      <SectionReveal>
        <div className="pf-section-intro">
          <div>
            <h2>{p.labels.works}</h2>
          </div>
          <p>{p.worksIntro}</p>
        </div>
      </SectionReveal>

      <div className="pf-lateral-showcase-list">
        {featured.map((c, index) => {
          const isRightDocked = index % 2 === 1;
          const media = p.media[c.slug];

          return (
            <SectionReveal key={c.slug} delay={0.1}>
              <div
                className={`pf-lateral-row ${isRightDocked ? "pf-dock-right" : "pf-dock-left"}`}
              >
                <article className="pf-lateral-dossier">
                  <span className="pf-meta pf-showcase-role">{c.homepage!.role}</span>

                  <h3 className="pf-showcase-title">
                    <Link href={`/case/${c.slug}`}>{c.homepage!.title}</Link>
                  </h3>

                  <p className="pf-showcase-summary">{c.homepage!.summary}</p>

                  {/* Compact Integrated UI Preview */}
                  {media && (
                    <div className="pf-dossier-media-slot">
                      <ProjectImage media={media} labels={p.labels} priority={index === 0} />
                    </div>
                  )}

                  <div className="pf-showcase-evidence">
                    <span className="pf-evidence-badge">Điểm kiểm chứng</span>
                    <p className="pf-evidence-text">{c.homepage!.evidence}</p>
                  </div>

                  <div className="pf-showcase-action">
                    <Link className="pf-text-link pf-action-link" href={`/case/${c.slug}`}>
                      {c.homepage!.cta}
                      <PortfolioIcon />
                    </Link>
                  </div>
                </article>
              </div>
            </SectionReveal>
          );
        })}
      </div>
    </section>
  );
}
