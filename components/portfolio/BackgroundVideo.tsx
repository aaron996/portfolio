"use client";

import { useEffect, useRef, useState } from "react";

export function BackgroundVideo() {
  const [motionAllowed, setMotionAllowed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotionAllowed(!preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!motionAllowed) return;
    const video = videoRef.current;
    if (!video) return;
    const resume = () => {
      if (document.visibilityState === "visible" && video.paused) {
        video.muted = true;
        void video.play().catch(() => {});
      }
    };
    resume();
    video.addEventListener("canplay", resume);
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("pageshow", resume);
    window.addEventListener("pointerdown", resume, { passive: true });
    return () => {
      video.removeEventListener("canplay", resume);
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("pageshow", resume);
      window.removeEventListener("pointerdown", resume);
    };
  }, [motionAllowed]);

  return (
    <div className="pf-background-stage" aria-hidden="true">
      {motionAllowed && (
        <video ref={videoRef} className="pf-background-video" autoPlay muted loop playsInline preload="auto">
          <source src="/portfolio/video/career-film-full-v1.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  );
}
