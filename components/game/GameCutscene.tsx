"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { GameCutscene } from "@/content/types";
import { containDialogTab } from "@/components/ui/dialogFocus";
import styles from "./GameCutscene.module.css";

export function GameCutscene({ scene, nextLabel, beginLabel, skipLabel, counterLabel, onComplete }: {
  scene: GameCutscene;
  nextLabel: string;
  beginLabel: string;
  skipLabel: string;
  counterLabel: string;
  onComplete: () => void;
}) {
  const [card, setCard] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const last = card === scene.cards.length - 1;
  const advance = () => {
    if (last) onComplete();
    else setCard((current) => current + 1);
  };

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const stage = dialog?.parentElement;
    if (!dialog || !stage) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // A modal dialog lives in the top layer; anchor it to the existing game stage.
    const fit = () => {
      const rect = stage.getBoundingClientRect();
      const height = Math.min(rect.height, window.innerHeight);
      dialog.style.left = `${rect.left}px`;
      dialog.style.top = `${Math.max(0, Math.min(rect.top, window.innerHeight - height))}px`;
      dialog.style.width = `${rect.width}px`;
      dialog.style.height = `${height}px`;
    };
    fit();
    dialog.showModal();
    nextRef.current?.focus({ preventScroll: true });
    const observer = new ResizeObserver(fit);
    observer.observe(stage);
    window.addEventListener("resize", fit);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
      dialog.close();
      const destination = previousFocus?.isConnected && previousFocus.matches('button, a[href], input, select, textarea, [tabindex]') && previousFocus.getClientRects().length > 0
        ? previousFocus : stage.closest<HTMLElement>('[tabindex="-1"]');
      destination?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => { nextRef.current?.focus({ preventScroll: true }); }, [card]);

  const current = scene.cards[card];
  const counter = counterLabel.replace("{current}", String(card + 1)).replace("{total}", String(scene.cards.length));
  return (
    <dialog ref={dialogRef} className={styles.overlay} role="dialog" aria-label={scene.title}
      onCancel={event => { event.preventDefault(); event.stopPropagation(); onComplete(); }}
      onKeyDown={event => {
        // Keep cutscene keys away from the engine's window-level controls.
        event.stopPropagation();
        containDialogTab(event);
        if (event.key === "Escape") { event.preventDefault(); onComplete(); }
        else if (event.key === "Enter" || event.key === " ") {
          if (event.repeat) event.preventDefault();
          else if (!(event.target instanceof HTMLElement && event.target.closest("button"))) {
            event.preventDefault(); advance();
          }
        }
      }}>
      <div className={`${styles.backdrop} ${styles[scene.focus]}`} aria-hidden="true">
        <div className={styles.world} />
        {scene.focus === "boss" ? <img className={styles.boss} src="/game/boss/b1-tel.png" alt="" /> : null}
        {scene.focus === "mission" ? <div className={styles.codes}><span>CT-081</span><strong>CT-018</strong><span>CT-019</span></div> : null}
      </div>
      <div className={styles.panel}>
        <p className={styles.kicker}>{scene.kicker}</p>
        <h2>{scene.title}</h2>
        <div className={styles.card} aria-live="polite">
          {current.speaker ? <p className={styles.speaker}>{current.speaker}</p> : null}
          <p>{current.text} {current.emphasis ? <strong>{current.emphasis}</strong> : null}</p>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.skip} onClick={onComplete}>{skipLabel}</button>
          <span aria-label={counter}>{counter}</span>
          <button ref={nextRef} type="button" className={styles.next} onClick={advance}>{last ? beginLabel : nextLabel}</button>
        </div>
      </div>
    </dialog>
  );
}
