"use client";

import Link from "next/link";
import type { PortfolioPrototype } from "@/content/types";
import { PortfolioIcon } from "./PortfolioIcon";

export function Hero3DOverlay({ labels }: { labels: PortfolioPrototype["hero"]["objects"] }) {
  return (
    <div className="pf-hero-3d-strip">
      {/* Telemetry Target Reticle on 3D Container */}
      <div className="pf-hero-focal-zone">
        <div className="pf-hero-telemetry-chip">
          <span className="pf-telemetry-dot" />
          <span className="pf-telemetry-mono">CONTAINER // MINH HOẠ HÀNH TRÌNH</span>
          <span className="pf-telemetry-state-pill">MINH HOẠ 3D</span>
        </div>

        {/* Tactical interactive anchor links corresponding to container & journey */}
        <div className="pf-hero-object-anchors">
          <a
            href={labels.container.href}
            className="pf-object-pill pf-pill-container"
            title="Khám phá kinh nghiệm chuỗi cung ứng"
          >
            <span className="pf-pill-badge">01</span>
            <span className="pf-pill-label">{labels.container.label}</span>
            <PortfolioIcon />
          </a>

          <Link
            href={labels.keyboard.href}
            className="pf-object-pill pf-pill-keyboard"
            title="Đến trò chơi & minigame"
          >
            <span className="pf-pill-badge">05</span>
            <span className="pf-pill-label">{labels.keyboard.label}</span>
            <PortfolioIcon />
          </Link>

          {/* Scroll Journey Indicator */}
          <div className="pf-hero-scroll-cue" aria-hidden="true">
            <span className="pf-cue-mouse">
              <span className="pf-cue-wheel" />
            </span>
            <span className="pf-cue-text">Cuộn chuột để khởi hành</span>
          </div>
        </div>
      </div>
    </div>
  );
}
