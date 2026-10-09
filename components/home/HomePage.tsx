import { portfolioFontVariables } from "@/components/portfolio/PortfolioFonts";
import { IntroVideo } from "@/components/portfolio/IntroVideo";
import { SiteNav } from "./SiteNav";
import { HeroSort } from "./HeroSort";
import { WorkIndex } from "./WorkIndex";
import { CareerPath } from "./CareerPath";
import { AboutQuestions } from "./AboutQuestions";
import { HomeContact } from "./HomeContact";
import { CompanionLayer } from "@/components/companions/CompanionLayer";
import "./home.css";

export function HomePage() {
  return <div id="top" className={`home ${portfolioFontVariables}`}>
    <IntroVideo />
    <SiteNav />

    <main id="main" tabIndex={-1}>
      <HeroSort />
      <WorkIndex />
      <CareerPath />
      <AboutQuestions />
    </main>
    <HomeContact />
    <CompanionLayer nav=".home-nav" />
  </div>;
}
