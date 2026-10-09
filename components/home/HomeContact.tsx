"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { content } from "@/content/content.vi";
import { PortfolioIcon } from "@/components/portfolio/PortfolioIcon";
import { IntroReplayButton } from "@/components/portfolio/IntroReplayButton";
import { companions, useCompanions } from "@/components/companions/store";
import { closeCurtain, curtainAllowed } from "@/components/companions/gameCurtain";

const copy = content.home.contact;
const fight = content.home.fight;
const { email, linkedin, cvHref } = content.contact;

export function HomeContact({ replay = true, gameCard = true }: { replay?: boolean; gameCard?: boolean }) {
  const [copied, setCopied] = useState(false);
  const { enabled } = useCompanions();
  const router = useRouter();

  /* Chấm kéo rèm khép lại rồi mới sang /game; trang game kéo rèm mở. Giảm chuyển động,
     tắt bạn đồng hành hay bấm kèm phím (mở tab mới…) thì đi thẳng như link thường. */
  const enterGame = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !curtainAllowed()) return;
    e.preventDefault();
    closeCurtain(e.currentTarget.getBoundingClientRect()).catch(() => {}).then(() => router.push("/game"));
  };
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  return <footer id="contact" className="hc" data-companion="night">
    <div className="hc-inner">
      <div className="hc-main">
        <h2>{copy.heading}</h2>
        <a className="hc-mail" href={`mailto:${email}`}>{email}</a>
        <button type="button" className="hc-copy" onClick={() => navigator.clipboard?.writeText(email).then(() => { setCopied(true); window.dispatchEvent(new CustomEvent("companion:copied")); }, () => {})}>
          {copied ? copy.copied : copy.copy}
        </button>
      </div>

      <div className="hc-side">
        <a className="hc-card" href={linkedin} target="_blank" rel="noopener noreferrer">
          <span>{copy.linkedin}</span>
          <strong>{copy.linkedinCta}<PortfolioIcon name="forward" /></strong>
        </a>
        <a className="hc-card" href={cvHref}>
          <span>{copy.cv}</span>
          <strong>{copy.cvCta}<PortfolioIcon name="pdf" /></strong>
        </a>
        {gameCard && <Link href="/game" className="hc-card hc-game" onClick={enterGame}>
          <span>{copy.gameTitle}</span>
          <strong>{copy.gameCta}<PortfolioIcon name="forward" /></strong>
        </Link>}
      </div>

      {/* Sàn đấu của Chấm và Lệch (components/companions/fight.ts): chỉ là sân khấu — ánh đèn,
          sàn, thanh máu; nhân vật và hiệu ứng do lớp bạn đồng hành vẽ lên trên. */}
      {gameCard && enabled && <div className="hc-arena" data-companion="arena" data-lit="false" data-hud="false" aria-hidden="true">
        <div className="hc-beam" />
        <div className="hc-pool" />
        <div className="hc-floor" />
        <div className="hc-hp hc-hp-a"><b>{fight.aName}</b><i><u /></i></div>
        <div className="hc-hp hc-hp-b"><b>{fight.bName}</b><i><u /></i></div>
      </div>}

      <div className="hc-bottom">
        {replay && <IntroReplayButton />}
        <button type="button" className="hc-companions" data-off={!enabled} onClick={() => companions.setEnabled(!enabled)}>
          <span className="hc-companions-dots" aria-hidden="true"><i /><i /><i /></span>
          {enabled ? content.home.companions.hide : content.home.companions.show}
        </button>
        {gameCard && enabled && <button type="button" className="hc-rematch" onClick={() => window.dispatchEvent(new CustomEvent("companion:rematch"))}>{fight.rematch}</button>}
        <a href="#top">{content.home.footer.top}<PortfolioIcon name="up" /></a>
      </div>
    </div>
  </footer>;
}
