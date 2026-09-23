"use client";

import { useEffect, useState } from "react";
import { content } from "@/content/content.vi";
import { LOGISTICS_WAYPOINTS, type LogisticsWaypoint } from "../3d/LogisticsTypes";
import type { LogisticsJourneyStore } from "../3d/LogisticsJourney";

interface LogisticsHUDNavProps {
  motionEnabled: boolean;
  onToggleMotion: () => void;
  journeyStore: LogisticsJourneyStore;
}

export function LogisticsHUDNav({ motionEnabled, onToggleMotion, journeyStore }: LogisticsHUDNavProps) {
  const logistics = content.prototype.logistics;
  const [activeWaypoint, setActiveWaypoint] = useState<LogisticsWaypoint>(LOGISTICS_WAYPOINTS[0]);
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    const sync = () => {
      const state = journeyStore.current;
      setProgressPercent(Math.round(state.pageProgress * 100));
      setActiveWaypoint(LOGISTICS_WAYPOINTS.find((waypoint) => waypoint.id === state.activeChapterId) ?? LOGISTICS_WAYPOINTS[0]);
    };
    sync();
    return journeyStore.subscribe(sync);
  }, [journeyStore]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: motionEnabled ? "smooth" : "auto" });
    } else if (sectionId === "hero") {
      window.scrollTo({ top: 0, behavior: motionEnabled ? "smooth" : "auto" });
    }
  };

  return (
    <>
      <aside
        className="pf-hud-nav"
        aria-label={logistics.navigationLabel}
      >
        <div className="pf-hud-summary">
          <span className="pf-hud-summary-eyebrow">{logistics.progressLabel}</span>
          <strong>{logistics.chapters[activeWaypoint.id].label}</strong>
          <div className="pf-hud-progress-track">
            <div
              className="pf-hud-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="pf-hud-progress-text">{progressPercent}%</span>
        </div>

        <nav className="pf-hud-rail" aria-label={logistics.navigationLabel}>
          {LOGISTICS_WAYPOINTS.map((wp) => {
            const isActive = wp.id === activeWaypoint.id;
            const chapter = logistics.chapters[wp.id];
            return (
              <button
                key={wp.id}
                type="button"
                className={`pf-hud-waypoint-btn ${isActive ? "pf-hud-active" : ""}`}
                onClick={() => scrollToSection(wp.sectionId)}
                aria-current={isActive ? "location" : undefined}
                title={chapter.description}
              >
                <span className="pf-hud-wp-index">0{wp.index}</span>
                <span className="pf-hud-wp-label">{chapter.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Motion Controls Toggle */}
        <div className="pf-hud-controls">
          <button
            type="button"
            onClick={onToggleMotion}
            className={`pf-hud-toggle-btn ${motionEnabled ? "pf-motion-on" : "pf-motion-off"}`}
            aria-pressed={motionEnabled}
            aria-label={motionEnabled ? logistics.motion.disable : logistics.motion.enable}
            title={motionEnabled ? logistics.motion.disable : logistics.motion.enable}
          >
            <span className="pf-toggle-text">
              <span className="pf-toggle-text-desktop">{motionEnabled ? logistics.motion.enabledState : logistics.motion.disabledState}</span>
              <span className="pf-toggle-text-mobile" aria-hidden="true">3D</span>
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
