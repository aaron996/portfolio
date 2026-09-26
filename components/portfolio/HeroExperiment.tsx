import { content } from "@/content/content.vi";
import { PortfolioIcon } from "./PortfolioIcon";
import { HeroPixels } from "./HeroPixels";
import { portfolioFontVariables } from "./PortfolioFonts";

export function HeroExperiment() {
  const { hero } = content.prototype;
  return (
    <header id="hero" className={`pf-hero-experiment ${portfolioFontVariables}`}>
      <HeroPixels />
      <div className="pf-shell pf-poster-shell">
        <div className="pf-hero-compact-grid">
          {/* Main Hero Header & Value Proposition */}
          <div className="pf-hero-main-content">
            <p className="pf-hero-domain">{hero.domain} · BI &amp; Data Analyst</p>

            <h1 className="pf-poster-title" lang="en" aria-label={hero.heading}>
              <span className="pf-poster-heavy">MAKE SENSE OF DATA.</span>
              <span className="pf-poster-human">MAKE THINGS WORK.</span>
            </h1>

            <p className="pf-poster-body">{hero.body}</p>

            <div className="pf-links pf-hero-actions">
              <a className="pf-button pf-primary" href={hero.primary.href}>
                {hero.primary.label}
                <PortfolioIcon name="forward" />
              </a>
              <a className="pf-button pf-secondary-ghost" href={hero.secondary.href}>
                {hero.secondary.label}
                <PortfolioIcon />
              </a>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
