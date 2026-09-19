import { PortfolioIcon } from "./PortfolioIcon";
import Link from "next/link";
import { content } from "@/content/content.vi";
import { BrandMark } from "@/components/ui/BrandMark";
import { SectionReveal } from "./SectionReveal";

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
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
        <a className="pf-cv" href={contact.cvHref}>
          {p.labels.cv}
          <PortfolioIcon />
        </a>
      </div>
    </nav>
  );
}

export function PortfolioContact() {
  const { prototype: p, contact, meta } = content;

  return (
    <>
      <section id="contact" className="pf-contact pf-section">
        <SectionReveal>
          <div className="pf-shell pf-contact-grid">
            <div>
              <h2>{p.contact.heading}</h2>
            </div>
            <div className="pf-contact-details">
              <p className="pf-contact-lead">{p.contact.body}</p>
              <a className="pf-email" href={`mailto:${contact.email}`}>
                {contact.email}
                <PortfolioIcon />
              </a>
              <div className="pf-links">
                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pf-button pf-secondary-btn"
                >
                  {p.labels.linkedin}
                  <PortfolioIcon />
                </a>
                <a href={contact.cvHref} className="pf-button pf-secondary-btn">
                  {p.labels.cv}
                  <PortfolioIcon />
                </a>
              </div>
            </div>
          </div>
        </SectionReveal>

        {/* Khối lời mời chơi game riêng biệt có viền */}
        <SectionReveal delay={0.1}>
          <div className="pf-shell pf-game-invite-container">
            <div className="pf-game-invite-banner">
              <div className="pf-game-invite-text">
                <span className="pf-game-badge">Mini-game</span>
                <p className="pf-game-desc">{p.contact.game}</p>
              </div>
              <Link href={p.contact.gameCta.href} className="pf-button pf-game-btn">
                {p.contact.gameCta.label}
                <PortfolioIcon name="forward" />
              </Link>
            </div>
          </div>
        </SectionReveal>
      </section>

      <footer className="pf-shell pf-footer">
        <div className="pf-footer-bottom">
          <span>
            {meta.name} · {p.labels.location}
          </span>
          <a href="#main" className="pf-back-to-top">
            {p.labels.top}
            <PortfolioIcon name="up" />
          </a>
        </div>
      </footer>
    </>
  );
}
