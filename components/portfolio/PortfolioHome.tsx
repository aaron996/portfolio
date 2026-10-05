import { PortfolioNav, PortfolioContact } from "./PortfolioShell";
import { HeroExperiment } from "./HeroExperiment";
import { CareerObjects } from "./career-objects/CareerObjects";
import "./career-objects/career-objects.css";
import { ProcessSection } from "./ProcessSection";
import { AboutSection } from "./AboutSection";
import { SkillsSection } from "./SkillsSection";
import { portfolioFontVariables } from "./PortfolioFonts";
import { BackgroundVideo } from "./BackgroundVideo";
import { IntroVideo } from "./IntroVideo";

export function PortfolioHome() {
  return (
    <div className={`portfolio-v2 pf-home-experiment ${portfolioFontVariables}`}>
      <IntroVideo />
      <BackgroundVideo />
      <div className="pf-nav-wrapper">
        <PortfolioNav showMark />
      </div>
      <main id="main" tabIndex={-1} className="pf-content-flow">
        <HeroExperiment />
        <CareerObjects embedded />
        <ProcessSection />
        <SkillsSection />
        <AboutSection />
        <PortfolioContact withEndingArt />
      </main>
    </div>
  );
}
