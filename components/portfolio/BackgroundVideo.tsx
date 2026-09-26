"use client";

import { useEffect, useState } from "react";

export function BackgroundVideo() {
  const [motionAllowed, setMotionAllowed] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotionAllowed(!preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  return (
    <div className="pf-background-stage" aria-hidden="true">
      {motionAllowed && (
        <video className="pf-background-video" autoPlay muted loop playsInline preload="metadata">
          <source src="/portfolio/video/career-film-full-v1.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  );
}
