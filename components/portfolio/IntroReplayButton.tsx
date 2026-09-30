"use client";

import { content } from "@/content/content.vi";
import { INTRO_REPLAY_EVENT } from "./IntroVideo";
import { PortfolioIcon } from "./PortfolioIcon";

export function IntroReplayButton() {
  return (
    <button type="button" className="pf-intro-replay" aria-label={content.prototype.intro.replay} onClick={() => window.dispatchEvent(new Event(INTRO_REPLAY_EVENT))}>
      <PortfolioIcon name="replay" />
      <span className="pf-intro-replay-label">{content.prototype.intro.replay}</span>
    </button>
  );
}
