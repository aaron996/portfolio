"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { content } from "@/content/content.vi";
import { careerObjectsPreview as copy, type CareerObjectId, type CareerObjectEntry } from "@/content/prototypes/career-objects.vi";
import { BackgroundVideo } from "@/components/portfolio/BackgroundVideo";
import { portfolioFontVariables } from "@/components/portfolio/PortfolioFonts";
import { ProjectImage } from "@/components/portfolio/ProjectImage";
import { PortfolioIcon } from "@/components/portfolio/PortfolioIcon";
import { BrandMark } from "@/components/ui/BrandMark";
import { ObjectMockup } from "./ObjectMockup";
import { AnimatedContent } from "./AnimatedContent";

export function CareerObjectsPreview() {
  const [active, setActive] = useState<CareerObjectId | null>(null);
  const [pinnedId, setPinnedId] = useState<CareerObjectId | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [spinning, setSpinning] = useState(true);
  const [spatialMotion, setSpatialMotion] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buttons = useRef<Partial<Record<CareerObjectId, HTMLButtonElement | null>>>({});
  const spotlight = useRef<HTMLDivElement | null>(null);
  const [flight, setFlight] = useState({ x: 0, y: 0 });
  const suppressed = useRef<CareerObjectId | null>(null);
  const pinned = active !== null && active === pinnedId;
  const keep = () => { if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; } };
  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);
  const close = (returnFocus = false) => {
    keep(); suppressed.current = active; setActive(null); setPinnedId(null);
    if (returnFocus && active) buttons.current[active]?.focus();
  };
  const preview = (id: CareerObjectId) => {
    keep();
    if (suppressed.current !== id) { suppressed.current = null; if (!showAll) setActive(id); }
  };
  const leave = () => {
    keep();
    hideTimer.current = setTimeout(() => {
      hideTimer.current = null;
      if (!document.querySelector("dialog[open]")) setActive(pinnedId);
    }, 400);
  };
  const selected = (copy.entries as CareerObjectEntry[]).find(entry => entry.id === active);
  const experience = content.prototype.experience.find(item => item.company === selected?.company);
  const cases = content.cases.filter(item => selected?.cases.includes(item.slug));
  const media = selected?.media ? content.prototype.media[selected.media] : undefined;
  useLayoutEffect(() => {
    if (!active || showAll) return;
    const position = () => {
      const source = buttons.current[active]?.getBoundingClientRect();
      const model = buttons.current[active]?.querySelector<HTMLElement>(".co-model-flight");
      const target = spotlight.current?.getBoundingClientRect();
      if (!source || !model || !target) return;
      // Read the unchanged button origin, never the model's animated bounds.
      setFlight({ x: target.x + target.width / 2 - (source.x + source.width / 2),
        y: target.y + target.height / 2 - (source.y + model.offsetTop + model.offsetHeight / 2) });
    };
    position();
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => { window.removeEventListener("resize", position); window.removeEventListener("scroll", position, true); };
  }, [active, showAll]);

  return <div className={`portfolio-v2 co-preview ${portfolioFontVariables}`} data-spinning={spinning} data-spatial-motion={spatialMotion} data-featured={active !== null && !showAll} onKeyDown={event => {
    if (event.key === "Escape" && !document.querySelector("dialog[open]")) { event.preventDefault(); close(true); }
  }}>
    <BackgroundVideo />
    <header className="co-header">
      <Link className="co-brand" href="/"><BrandMark /><span>{content.meta.name}<small>{content.meta.roleLabel}</small></span></Link>
      <nav><Link href="/prototypes/work-evidence">{copy.back}</Link><a href={content.contact.cvHref}>{copy.cv}<PortfolioIcon /></a></nav>
    </header>
    <main id="main" tabIndex={-1}>
      <h1 className="sr-only">{copy.title}</h1>
      <div className="co-topline"><p>{copy.status}</p><div className="co-tools">
        <button className="co-rotation-toggle" onClick={() => setSpinning(!spinning)}>{spinning ? copy.pauseRotation : copy.resumeRotation}</button>
        <button className="co-all-link" aria-expanded={showAll} aria-controls="co-case-panel" onClick={event => { setSpatialMotion(event.detail !== 0); setShowAll(!showAll); close(); }}>{copy.all}<PortfolioIcon name="plus" /></button>
      </div></div>
      <div className="co-stage" onPointerEnter={keep} onPointerLeave={leave}>
        <nav className="co-rail" aria-label={copy.navigation}>
          {copy.entries.map(entry => <button key={entry.id} ref={node => { buttons.current[entry.id] = node; }} type="button" className="co-object"
            aria-expanded={active === entry.id} aria-controls="co-case-panel" data-active={active === entry.id}
            onPointerEnter={event => { if (event.pointerType === "mouse") { setSpatialMotion(true); preview(entry.id); } }} onPointerLeave={() => { suppressed.current = null; }}
            onFocus={() => { setSpatialMotion(false); preview(entry.id); }} onBlur={event => { if (!event.relatedTarget || !event.relatedTarget.closest(".co-interactive")) leave(); }}
            onClick={event => { setSpatialMotion(event.detail !== 0); keep(); suppressed.current = null; setShowAll(false); setActive(entry.id); setPinnedId(entry.id); }}>
            <span className="co-model-flight" style={{ transform: active === entry.id && !showAll ? `translate(${flight.x}px, ${flight.y}px) scale(2)` : "translate(0px, 0px) scale(1)" }}><ObjectMockup id={entry.id} label={entry.label} /></span><span className="co-object-label">{entry.label}</span>
          </button>)}
        </nav>
        <div className="co-spotlight" ref={spotlight} aria-hidden="true" />
        <div id="co-case-panel" className="co-outlet co-interactive" onPointerEnter={keep}
          onFocus={keep} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) leave(); }}>
          <AnimatePresence initial={false} mode="wait">
          <AnimatedContent key={showAll ? "all" : active ?? "intro"} spatialMotion={spatialMotion}>
          {showAll ? <section id="co-all-work" className="co-all-work" aria-label={copy.work}>
            <h2>{copy.work}</h2>{content.cases.map(item => <Link key={item.slug} href={`/case/${item.slug}`}><span>{item.homepage?.title ?? item.title}<small>{item.client}</small></span><PortfolioIcon /></Link>)}
          </section> : selected && experience ? <section className="co-panel" aria-labelledby="co-panel-title">
            <div className="co-panel-actions"><button className="co-pin" aria-pressed={pinned} onClick={() => { keep(); setPinnedId(pinned ? null : active); }}>{pinned ? copy.pinned : copy.pin}</button>
              <button className="co-close" aria-label={copy.close} onClick={() => close(true)}><PortfolioIcon name="close" /></button></div>
            <h2 id="co-panel-title">{selected.label}</h2><p className="co-period">{experience.period} · {experience.role}</p>
            {media && <ProjectImage media={media} labels={content.prototype.labels} />}
            <p className="co-body">{experience.body}</p>
            {cases.length > 0 && <div className="co-case-list">{cases.map(item => <Link key={item.slug} href={`/case/${item.slug}`}><span>{item.homepage?.title ?? item.title}</span><PortfolioIcon /></Link>)}</div>}
          </section> : <div className="co-intro"><h2>{copy.title}</h2><p>{content.prototype.about[0]}</p><p className="co-desktop-hint">{copy.hint}</p><p className="co-mobile-hint">{copy.mobileHint}</p></div>}
          </AnimatedContent>
          </AnimatePresence>
        </div>
      </div>
    </main>
  </div>;
}
