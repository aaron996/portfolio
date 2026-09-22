"use client";

import { useEffect, useState } from "react";
import { content } from "@/content/content.vi";
import { LOGISTICS_WAYPOINTS, type LogisticsWaypoint } from "../3d/LogisticsTypes";

interface LogisticsHUDNavProps {
  motionEnabled: boolean;
  onToggleMotion: () => void;
}

export function LogisticsHUDNav({ motionEnabled, onToggleMotion }: LogisticsHUDNavProps) {
  const logistics = content.prototype.logistics;
  const [activeWaypoint, setActiveWaypoint] = useState<LogisticsWaypoint>(LOGISTICS_WAYPOINTS[0]);
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const progress = Math.max(0, Math.min(1, scrollY / maxScroll));
      setProgressPercent(Math.round(progress * 100));

      // Determine active waypoint based on scrollRange
      const current = LOGISTICS_WAYPOINTS.find(
        (wp) => progress >= wp.scrollRange[0] && progress <= wp.scrollRange[1]
      ) || (progress > 0.8 ? LOGISTICS_WAYPOINTS[LOGISTICS_WAYPOINTS.length - 1] : LOGISTICS_WAYPOINTS[0]);

      setActiveWaypoint(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
