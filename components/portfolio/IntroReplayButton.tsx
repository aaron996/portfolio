"use client";

import { content } from "@/content/content.vi";
import { INTRO_REPLAY_EVENT } from "./IntroVideo";

export function IntroReplayButton() {
  return (
    <button type="button" className="pf-intro-replay" onClick={() => window.dispatchEvent(new Event(INTRO_REPLAY_EVENT))}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m6 4 14 8-14 8V4Z" /></svg>
      {content.prototype.intro.replay}
    </button>
  );
}
