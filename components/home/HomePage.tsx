import { content } from "@/content/content.vi";
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
  const { prototype: p } = content;
  return <div id="top" className={`home ${portfolioFontVariables}`}>
    <IntroVideo />
    <a href="#main" className="home-skip">{p.labels.skip}</a>
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
