"use client";

import { content } from "@/content/content.vi";

interface CalloutItem {
  id: string;
  badge: string;
  title: string;
  body: string;
  position: "left" | "right";
}

export function LogisticsReticleCallout() {
  const callouts: CalloutItem[] = content.prototype.logistics.callouts.map((item, index) => ({
    ...item,
    id: `callout-${index + 1}`,
    position: index === 0 ? "left" : "right",
  }));

  return (
    <div className="pf-ocean-callouts-container" aria-label="Các điểm kiểm chứng dữ liệu trên tàu container đại dương">
      <div className="pf-shell pf-ocean-callouts-grid">
        {callouts.map((item) => (
          <div
            key={item.id}
            className={`pf-ocean-callout-card pf-callout-${item.position}`}
          >
            <div className="pf-reticle-indicator">
              <span className="pf-reticle-ring" />
              <span className="pf-reticle-core" />
              <span className="pf-reticle-line" />
            </div>
            <div className="pf-callout-content">
              <span className="pf-callout-badge">{item.badge}</span>
              <h4 className="pf-callout-title">{item.title}</h4>
              <p className="pf-callout-body">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
