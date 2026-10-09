import type { Metadata } from "next";
import Link from "next/link";
import { OpsGame } from "@/components/game/OpsGame";
import { CurtainOpener } from "@/components/companions/CurtainOpener";
import { SiteNav } from "@/components/home/SiteNav";
import { HomeContact } from "@/components/home/HomeContact";
import { PortfolioIcon } from "@/components/portfolio/PortfolioIcon";
import { portfolioFontVariables } from "@/components/portfolio/PortfolioFonts";
import { content } from "@/content/content.vi";
import "@/components/home/home.css";
import "./game.css";

const { game } = content;

export const metadata: Metadata = {
  title: game.heading,
  description: game.intro,
};

/* Nav và footer theo theme giấy như trang chủ; riêng khung game (OpsGame) nằm trong
   một tấm nền tối `.gp-stage`, vì toàn bộ màu của game vẽ cho nền tối. */
export default function GamePage() {
  return (
    <div id="top" className={`home gp ${portfolioFontVariables}`}>
      <CurtainOpener />
      <a href="#main" className="home-skip">{content.prototype.labels.skip}</a>
      <SiteNav onHome={false} />
      <main id="main" tabIndex={-1}>
        <header className="gp-head">
          <p className="gp-eyebrow">{game.eyebrow}</p>
          <h1>{game.heading}</h1>
          <p className="gp-intro">{game.intro}</p>
        </header>

        <div className="gp-stage">
          <OpsGame />
        </div>

        <div className="gp-foot">
          <p>{game.note}</p>
          <Link href="/" className="gp-back"><PortfolioIcon name="back" />{game.backHome}</Link>
        </div>
      </main>
      <HomeContact replay={false} gameCard={false} />
    </div>
  );
}
