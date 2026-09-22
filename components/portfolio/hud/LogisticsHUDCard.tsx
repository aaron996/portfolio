"use client";

import type { ReactNode } from "react";

interface LogisticsHUDCardProps {
  children: ReactNode;
  tag?: string;
  stationCode?: string;
  className?: string;
}

export function LogisticsHUDCard({
  children,
  tag,
  stationCode,
  className = "",
}: LogisticsHUDCardProps) {
  return (
    <div className={`pf-hud-card ${className}`}>
      {/* Corner Brackets */}
      <span className="pf-hud-bracket pf-bracket-tl" aria-hidden="true" />
      <span className="pf-hud-bracket pf-bracket-tr" aria-hidden="true" />
      <span className="pf-hud-bracket pf-bracket-bl" aria-hidden="true" />
      <span className="pf-hud-bracket pf-bracket-br" aria-hidden="true" />

      {/* Header Telemetry Strip */}
      {(tag || stationCode) && (
        <div className="pf-hud-card-header">
          {stationCode && <span className="pf-hud-card-code">{stationCode}</span>}
          {tag && <span className="pf-hud-card-tag">{tag}</span>}
        </div>
      )}

      {/* Card Content */}
      <div className="pf-hud-card-body">{children}</div>
    </div>
  );
}
