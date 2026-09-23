"use client";

import { useEffect, useRef, useState } from "react";
import { PortfolioNav, PortfolioContact } from "./PortfolioShell";
import { HeroExperiment } from "./HeroExperiment";
import { FeaturedWork } from "./FeaturedWork";
import { OtherWorkSection } from "./OtherWorkSection";
import { ProcessSection } from "./ProcessSection";
import { AboutSection } from "./AboutSection";
import { ExperienceSection } from "./ExperienceSection";
import { SkillsSection } from "./SkillsSection";
import { portfolioFontVariables } from "./PortfolioFonts";
import { LogisticsHUDNav } from "./hud/LogisticsHUDNav";
import { LogisticsWorldCanvas } from "./3d/LogisticsWorldCanvas";
import { createLogisticsJourneyStore } from "./3d/LogisticsJourney";

export function PortfolioHome() {
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean | null>(null);
  const journeyStoreRef = useRef(createLogisticsJourneyStore());

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(media.matches);
    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  // Begin static until the browser preference is known; an explicit choice wins for this session.
  const motionEnabled = motionOverride ?? !(prefersReducedMotion ?? true);

  return (
    <div className={`portfolio-v2 pf-home-experiment pf-3d-logistics-site ${!motionEnabled ? "pf-motion-paused" : ""} ${portfolioFontVariables}`}>
      {/* 1. Full-Screen Sticky 3D Logistics Canvas */}
      <LogisticsWorldCanvas motionEnabled={motionEnabled} journeyStore={journeyStoreRef.current} />

      {/* 2. Primary navigation remains in normal reading order. */}
      <div className="pf-nav-wrapper">
        <PortfolioNav showMark />
      </div>

      {/* 3. Chapter navigation: fixed rail on desktop, in-flow controls on mobile. */}
      <LogisticsHUDNav
        motionEnabled={motionEnabled}
        journeyStore={journeyStoreRef.current}
        onToggleMotion={() => setMotionOverride((previous) => !(previous ?? motionEnabled))}
      />

      {/* 4. Interactive editorial storytelling layer */}
      <main id="main" tabIndex={-1} className="pf-content-flow">
        {/* Chặng 1: Inbound Port & Container Terminal */}
        <HeroExperiment />

        {/* Chặng 2: Automated Sorting Hub & Parcel Belts */}
        <FeaturedWork />

        {/* Chặng 3: 3PL Fleet & Cross-Dock Distribution */}
        <OtherWorkSection />

        {/* Chặng 4: Cách làm việc với dữ liệu */}
        <ProcessSection />
        <SkillsSection />

        {/* Chặng 5: Final Delivery Terminal & Dispatch Desk */}
        <ExperienceSection />
        <AboutSection />
        <PortfolioContact />
      </main>
    </div>
  );
}
