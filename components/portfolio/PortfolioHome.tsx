import { PortfolioNav, PortfolioContact } from "./PortfolioShell";
import { SensorBotCanvas } from "@/components/ui/SensorBotCanvas";
import { HeroExperiment } from "./HeroExperiment";
import { FeaturedWork } from "./FeaturedWork";
import { OtherWorkSection } from "./OtherWorkSection";
import { ProcessSection } from "./ProcessSection";
import { AboutSection } from "./AboutSection";
import { ExperienceSection } from "./ExperienceSection";
import { SkillsSection } from "./SkillsSection";
import { portfolioFontVariables } from "./PortfolioFonts";

export function PortfolioHome() {
  return (
    <div className={`portfolio-v2 pf-home-experiment ${portfolioFontVariables}`}>
      <div className="pf-dark">
        <PortfolioNav showMark />
      </div>
      <main id="main" tabIndex={-1}>
        <HeroExperiment />
        <FeaturedWork />
        <OtherWorkSection />
        <ProcessSection />
        <AboutSection />
        <ExperienceSection />
        <SkillsSection />
        <PortfolioContact />
      </main>
      <SensorBotCanvas />
    </div>
  );
}
