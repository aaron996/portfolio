"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { content } from "@/content/content.vi";
import { IntroReplayButton } from "./IntroReplayButton";
import { PortfolioIcon } from "./PortfolioIcon";

export function MobileNavMenu({ showIntro }: { showIntro: boolean }) {
  const p = content.prototype;
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const dismiss = () => {
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    const onResize = () => {
      if (window.matchMedia("(min-width: 761px)").matches) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <div ref={root} className="pf-mobile-more" onKeyDown={event => {
      if (event.key === "Escape" && open) {
        event.preventDefault();
        event.stopPropagation();
        dismiss();
      }
    }} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <button ref={trigger} type="button" className="pf-mobile-more-trigger"
        aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(value => !value)}>
        {p.labels.more}<PortfolioIcon name="chevron" />
      </button>
      <div id={panelId} className="pf-mobile-more-panel" hidden={!open}>
        {p.nav.slice(1).map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
        <Link href={p.contact.gameCta.href} onClick={() => setOpen(false)}><PortfolioIcon name="play" />{p.labels.navGame}</Link>
        {showIntro && <IntroReplayButton onReplay={dismiss} />}
      </div>
    </div>
  );
}
