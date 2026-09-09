import { content } from "@/content/content.vi";
import { PortfolioIcon } from "./PortfolioIcon";
import { HeroObjects } from "./HeroObjects";
import { HeroPixels } from "./HeroPixels";
import { portfolioFontVariables } from "./PortfolioFonts";

export function HeroExperiment() {
  const { hero } = content.prototype;
  return <header className={`pf-hero-experiment ${portfolioFontVariables}`}>
    <HeroPixels />
    <div className="pf-shell pf-poster-shell">
      <div className="pf-poster-stage">
        <h1 className="pf-poster-title" lang="en" aria-label={hero.heading}>
          {hero.headlineLines.map((line, index) => <span key={line} aria-hidden="true" className={index < 2 ? "pf-poster-heavy" : "pf-poster-human"}>{line}</span>)}
        </h1>
        <HeroObjects labels={hero.objects} />
      </div>
      <div className="pf-poster-bottom">
        <div className="pf-poster-intro"><p>{hero.body}</p><div className="pf-links">
          <a className="pf-button pf-primary" href={hero.primary.href}>{hero.primary.label}<PortfolioIcon name="forward" /></a>
          <a href={hero.secondary.href}>{hero.secondary.label}<PortfolioIcon /></a>
        </div></div>
        <p className="pf-poster-domain">{hero.domain}</p>
      </div>
    </div>
  </header>;
}
