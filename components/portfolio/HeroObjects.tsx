"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useRef, useState, type PointerEvent } from "react";
import type { PortfolioPrototype } from "@/content/types";
import { PortfolioIcon } from "./PortfolioIcon";
import type { HeroObjectBounds } from "./HeroObjectsScene";

const ObjectsScene = dynamic(
  () => import("./HeroObjectsScene").then((module) => module.HeroObjectsScene),
  { ssr: false }
);

type TargetObject = "container" | "keyboard";

export function HeroObjects({ labels }: { labels: PortfolioPrototype["hero"]["objects"] }) {
  const [active, setActive] = useState<TargetObject | null>(null);
  const [pressed, setPressed] = useState<TargetObject | null>(null);
  const [bounds, setBounds] = useState<HeroObjectBounds | null>(null);
  const invalidateRef = useRef<(() => void) | null>(null);
  const handleReady = useCallback((invalidate: (() => void) | null) => {
    invalidateRef.current = invalidate;
  }, []);
  const handleBounds = useCallback((next: HeroObjectBounds) => {
    setBounds((previous) => previous && (["container", "keyboard"] as const).every(
      (key) => (["left", "top", "width", "height"] as const).every(
        (axis) => Math.abs(previous[key][axis] - next[key][axis]) < 0.1
      )
    ) ? previous : next);
  }, []);

  const pointerRef = useRef<{
    container: { x: number; y: number };
    keyboard: { x: number; y: number };
  }>({
    container: { x: 0, y: 0 },
    keyboard: { x: 0, y: 0 },
  });

  const handlePointerEnter = useCallback((target: TargetObject) => {
    setActive(target);
  }, []);

  const handlePointerMove = useCallback((target: TargetObject, e: PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType === "touch") return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const x = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width) * 2 - 1));
      const y = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height) * 2 - 1));
      pointerRef.current[target] = { x, y };
      invalidateRef.current?.();
    }
  }, []);

  const handlePointerLeave = useCallback((target: TargetObject) => {
    setActive((prev) => (prev === target ? null : prev));
    setPressed((prev) => (prev === target ? null : prev));
    pointerRef.current[target] = { x: 0, y: 0 };
    invalidateRef.current?.();
  }, []);

  const handlePointerCancel = useCallback((target: TargetObject) => {
    setActive((prev) => (prev === target ? null : prev));
    setPressed((prev) => (prev === target ? null : prev));
    pointerRef.current[target] = { x: 0, y: 0 };
    invalidateRef.current?.();
  }, []);

  const handlePointerDown = useCallback((target: TargetObject) => {
    setPressed(target);
  }, []);

  const handlePointerUp = useCallback((target: TargetObject) => {
    setPressed((prev) => (prev === target ? null : prev));
  }, []);

  return (
    <aside className="pf-hero-objects" aria-label={labels.description}>
      <div className="pf-objects-canvas" aria-hidden="true">
        <ObjectsScene active={active} pressed={pressed} pointerRef={pointerRef} onReady={handleReady} onBounds={handleBounds} />
      </div>

      <Link
        href={labels.container.href}
        style={bounds?.container}
        data-projected={Boolean(bounds)}
        className={`pf-object-link pf-container-link ${active === "container" ? "pf-active" : ""} ${pressed === "container" ? "pf-pressed" : ""}`}
        aria-label="Xem kinh nghiệm logistics: Tìm hiểu các mốc vận hành và kết quả"
        onPointerEnter={(e) => {
          if (e.pointerType !== "touch") handlePointerEnter("container");
        }}
        onPointerMove={(e) => handlePointerMove("container", e)}
        onPointerLeave={() => handlePointerLeave("container")}
        onPointerCancel={() => handlePointerCancel("container")}
        onPointerDown={() => handlePointerDown("container")}
        onPointerUp={() => handlePointerUp("container")}
        onFocus={() => setActive("container")}
        onBlur={() => {
          setActive((prev) => (prev === "container" ? null : prev));
          setPressed((prev) => (prev === "container" ? null : prev));
        }}
      >
        <span className="pf-object-hit pf-container-hit" aria-hidden="true" />
        <span className="pf-object-label">
          {labels.container.label}
          <PortfolioIcon />
        </span>
      </Link>

      <Link
        href={labels.keyboard.href}
        style={bounds?.keyboard}
        data-projected={Boolean(bounds)}
        className={`pf-object-link pf-keyboard-link ${active === "keyboard" ? "pf-active" : ""} ${pressed === "keyboard" ? "pf-pressed" : ""}`}
        aria-label="Chơi game: Một góc chơi & làm game của tôi"
        onPointerEnter={(e) => {
          if (e.pointerType !== "touch") handlePointerEnter("keyboard");
        }}
        onPointerMove={(e) => handlePointerMove("keyboard", e)}
        onPointerLeave={() => handlePointerLeave("keyboard")}
        onPointerCancel={() => handlePointerCancel("keyboard")}
        onPointerDown={() => handlePointerDown("keyboard")}
        onPointerUp={() => handlePointerUp("keyboard")}
        onFocus={() => setActive("keyboard")}
        onBlur={() => {
          setActive((prev) => (prev === "keyboard" ? null : prev));
          setPressed((prev) => (prev === "keyboard" ? null : prev));
        }}
      >
        <span className="pf-object-hit pf-keyboard-hit" aria-hidden="true" />
        <span className="pf-object-label">
          {labels.keyboard.label}
          <PortfolioIcon />
        </span>
      </Link>
    </aside>
  );
}
