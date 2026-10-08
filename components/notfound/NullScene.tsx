"use client";

/* Trang 404: con trỏ là đèn pin. Ba bạn đồng hành đứng dưới đáy, mắt nhìn theo đèn;
   rọi trúng giữa trang thì lộ ra Null — ô viền nét đứt đứng đó từ đầu mà không ai
   thấy. Kịch bản: docs/companions.md. */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { content } from "@/content/content.vi";
import { portfolioFontVariables } from "@/components/portfolio/PortfolioFonts";
import { PortfolioIcon } from "@/components/portfolio/PortfolioIcon";
import { trackGaze } from "@/components/home/heroBuddies";

const copy = content.notFound;
const FIND_RADIUS = 90; // tâm đèn cách tâm Null dưới mức này thì coi là tìm thấy

export function NullScene() {
  const stageRef = useRef<HTMLElement>(null);
  const nullRef = useRef<HTMLDivElement>(null);
  const [found, setFound] = useState(false);
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    const stage = stageRef.current!;
    setTouch(window.matchMedia("(pointer: coarse)").matches);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setFound(true);
    const stopGaze = trackGaze([...stage.querySelectorAll<HTMLElement>(".nf-crew .hs-gaze")], 22, stage);

    const aim = (x: number, y: number) => {
      const r = stage.getBoundingClientRect();
      stage.style.setProperty("--lx", `${x - r.left}px`);
      stage.style.setProperty("--ly", `${y - r.top}px`);
      const n = nullRef.current?.getBoundingClientRect();
      if (n && Math.hypot(x - (n.left + n.width / 2), y - (n.top + n.height / 2)) < FIND_RADIUS) setFound(true);
    };
    const onMove = (e: PointerEvent) => aim(e.clientX, e.clientY);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerdown", onMove);
    return () => {
      stopGaze();
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerdown", onMove);
    };
  }, []);

  return <div className={`home nf ${portfolioFontVariables}`}>
    <main ref={stageRef} className="nf-stage" data-found={found} id="main">
      <Link href="/" className="nf-brand">{content.meta.name}</Link>

      <div className="nf-scene">
        <p className="nf-code" aria-hidden="true">{copy.code}</p>
        <div ref={nullRef} className="nf-null" aria-hidden="true">
          <span className="hs-eyes"><span className="hs-blink"><i /><i /></span></span>
        </div>
        <h1>{copy.found}</h1>
        <p className="nf-body">{copy.body}</p>
      </div>

      <div className="nf-dark" aria-hidden="true" />

      <div className="nf-crew" aria-hidden="true">
        {["ink", "ink", "green"].map((variant, i) =>
          <div key={i} className="hs-buddy" data-variant={variant}>
            <span className="hs-eyes"><span className="hs-gaze"><span className="hs-blink"><i /><i /></span></span></span>
          </div>)}
        <span className="nf-bubble">{found ? copy.spotted : content.home.sort.confused}</span>
      </div>

      <div className="nf-bar">
        {!found && <>
          <span className="nf-hint">{touch ? copy.hintTouch : copy.hint}</span>
          <button type="button" onClick={() => setFound(true)}>{copy.lights}</button>
        </>}
        <Link href="/">{copy.home}<PortfolioIcon name="forward" /></Link>
        <Link href="/#cases">{copy.work}<PortfolioIcon /></Link>
      </div>
    </main>
  </div>;
}
