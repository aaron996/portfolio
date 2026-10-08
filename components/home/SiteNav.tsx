import Link from "next/link";
import { content } from "@/content/content.vi";
import { PortfolioIcon } from "@/components/portfolio/PortfolioIcon";
import { BrandMark } from "@/components/ui/BrandMark";
import { ReadProgress } from "./ReadProgress";

/* Nav dùng chung cho trang chủ và trang case. Trang case bật `progress` để có thanh
   tiến độ đọc ở mép dưới — cũng là "sàn" cho bạn đồng hành đi trên đó. */
export function SiteNav({ onHome = true, progress = false }: { onHome?: boolean; progress?: boolean }) {
  const { home, meta, contact, prototype: p } = content;
  return <header className="home-nav">
    <Link href="/" className="home-brand"><BrandMark companions /><span>{meta.name}</span></Link>
    <nav aria-label={p.labels.navigation}>
      <Link href={onHome ? "#cases" : "/#cases"} className="home-nav-text">{home.nav.work}</Link>
      <a href="#contact" className="home-nav-text">{home.nav.contact}</a>
      <Link href="/game" className="home-nav-game"><PortfolioIcon name="play" />{home.nav.game}</Link>
      <a href={contact.cvHref} className="home-cv" aria-label={home.nav.cvLabel}>{home.nav.cv}<PortfolioIcon name="pdf" /></a>
    </nav>
    {progress && <ReadProgress />}
  </header>;
}
