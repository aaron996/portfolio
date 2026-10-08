"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { content } from "@/content/content.vi";
import { PortfolioIcon } from "@/components/portfolio/PortfolioIcon";
import { IntroReplayButton } from "@/components/portfolio/IntroReplayButton";
import { companions, useCompanions } from "@/components/companions/store";

const copy = content.home.contact;
const { email, linkedin, cvHref } = content.contact;

export function HomeContact({ replay = true }: { replay?: boolean }) {
  const [copied, setCopied] = useState(false);
  const { enabled } = useCompanions();
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  return <footer id="contact" className="hc" data-companion="night">
    <div className="hc-inner">
      <h2>{copy.heading}</h2>
      <div className="hc-email">
        <a href={`mailto:${email}`}>{email}</a>
        <button type="button" onClick={() => navigator.clipboard?.writeText(email).then(() => { setCopied(true); window.dispatchEvent(new CustomEvent("companion:copied")); }, () => {})}>
          {copied ? copy.copied : copy.copy}
        </button>
      </div>
      <div className="hc-links">
        <a href={linkedin} target="_blank" rel="noopener noreferrer"><PortfolioIcon name="linkedin" />{copy.linkedin}</a>
        <a href={cvHref}><PortfolioIcon name="pdf" />{copy.cv}</a>
      </div>

      <Link href="/game" className="hc-game">
        <span>{copy.gameTitle}</span>
        <strong>{copy.gameCta}<PortfolioIcon name="forward" /></strong>
      </Link>

      <div className="hc-bottom">
        {replay && <IntroReplayButton />}
        <button type="button" className="hc-companions" data-off={!enabled} onClick={() => companions.setEnabled(!enabled)}>
          <span className="hc-companions-dots" aria-hidden="true"><i /><i /><i /></span>
          {enabled ? content.home.companions.hide : content.home.companions.show}
        </button>
        <a href="#top">{content.home.footer.top}<PortfolioIcon name="up" /></a>
      </div>
    </div>
    <div className="hc-art" aria-hidden="true" />
  </footer>;
}
