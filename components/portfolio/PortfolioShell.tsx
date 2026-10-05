import { PortfolioIcon } from "./PortfolioIcon";
import Link from "next/link";
import { content } from "@/content/content.vi";
import { BrandMark } from "@/components/ui/BrandMark";
import { SectionReveal } from "./SectionReveal";
import { IntroReplayButton } from "./IntroReplayButton";
import { MobileNavMenu } from "./MobileNavMenu";

export function PortfolioNav({ showMark = false }: { showMark?: boolean }) {
  const { prototype: p, meta, contact } = content;
  return (
    <nav className="pf-nav pf-shell" aria-label={p.labels.navigation}>
      <Link href="/" className={showMark ? "pf-name pf-name-with-mark" : "pf-name"}>
        {showMark && <BrandMark className="pf-brand-mark" />}
        <div>
          {meta.name}
          <span>{meta.roleLabel}</span>
        </div>
      </Link>
      <div className="pf-nav-links">
        {p.nav.map((link) => (
          <Link key={link.href} href={link.href} className="pf-nav-link">
            {link.label}
          </Link>
        ))}
        {showMark && (
          <Link href={p.contact.gameCta.href} className="pf-nav-game">
            <PortfolioIcon name="play" />
            {p.labels.navGame}
          </Link>
        )}
        {showMark && <IntroReplayButton />}
        <a className="pf-cv" href={contact.cvHref} aria-label={p.labels.cv}>
          {showMark ? p.labels.navCv : p.labels.cv}
          <PortfolioIcon />
        </a>
      </div>
      <div className="pf-mobile-nav">
        <Link href={p.nav[0].href} className="pf-mobile-work">{p.labels.navWork}</Link>
        <a href={contact.cvHref} aria-label={p.labels.cv} className="pf-mobile-cv">{p.labels.navCv}<PortfolioIcon /></a>
        <MobileNavMenu showIntro={showMark} />
      </div>
    </nav>
  );
}

export function PortfolioContact({ withEndingArt = false }: { withEndingArt?: boolean }) {
  const { prototype: p, contact } = content;

  return (
    <div className={withEndingArt ? "pf-ending" : undefined}>
      <section id="contact" className="pf-contact pf-section">
        <SectionReveal>
          <div className="pf-shell pf-contact-grid">
            <div>
              <h2>{p.contact.heading}</h2>
            </div>
            <div className="pf-contact-details">
              <p className="pf-contact-lead">{p.contact.body}</p>
              <a className="pf-email" href={`mailto:${contact.email}`}>
                <PortfolioIcon name="mail" />
                <span className="pf-email-address">{contact.email}</span>
                <PortfolioIcon />
              </a>
              <div className="pf-links">
                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pf-button pf-secondary-btn"
                >
                  <PortfolioIcon name="linkedin" />
                  {p.labels.linkedin}
                  <PortfolioIcon />
                </a>
                <a href={contact.cvHref} className="pf-button pf-secondary-btn">
                  <PortfolioIcon name="pdf" />
                  {p.labels.cv}
                  <PortfolioIcon />
                </a>
              </div>
            </div>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <div className="pf-shell pf-game-invite-container">
            <div className="pf-game-invite-banner">
              <span className="pf-game-status">{p.contact.gameStatus}</span>
              <div className="pf-game-invite-row">
                <h3 className="pf-game-title"><span aria-hidden="true">&gt; </span>{p.contact.gameTitle}</h3>
                <Link href={p.contact.gameCta.href} className="pf-button pf-game-btn">
                  <span className="pf-game-key" aria-hidden="true">{p.contact.gameEntryKey}</span>
                  {p.contact.gameCta.label}
                  <PortfolioIcon name="forward" />
                </Link>
              </div>
            </div>
          </div>
        </SectionReveal>
      </section>

      <footer className="pf-shell pf-footer">
        <div className="pf-footer-bottom">
          <a href="#main" className="pf-back-to-top">
            {p.labels.top}
            <PortfolioIcon name="up" />
          </a>
        </div>
      </footer>
      {withEndingArt && <div className="pf-ending-art" aria-hidden="true" />}
    </div>
  );
}
