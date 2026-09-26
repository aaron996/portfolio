import { PortfolioNav, PortfolioContact } from "./PortfolioShell";
import { HeroExperiment } from "./HeroExperiment";
import { FeaturedWork } from "./FeaturedWork";
import { OtherWorkSection } from "./OtherWorkSection";
import { ProcessSection } from "./ProcessSection";
import { AboutSection } from "./AboutSection";
import { ExperienceSection } from "./ExperienceSection";
import { SkillsSection } from "./SkillsSection";
import { portfolioFontVariables } from "./PortfolioFonts";
import { BackgroundVideo } from "./BackgroundVideo";

export function PortfolioHome() {
  return (
    <div className={`portfolio-v2 pf-home-experiment ${portfolioFontVariables}`}>
      <BackgroundVideo />
      <div className="pf-nav-wrapper">
        <PortfolioNav showMark />
      </div>
      <main id="main" tabIndex={-1} className="pf-content-flow">
        <HeroExperiment />
        <FeaturedWork />
        <OtherWorkSection />
        <ProcessSection />
        <SkillsSection />
        <ExperienceSection />
        <AboutSection />
        <PortfolioContact />
      </main>
    </div>
  );
}
