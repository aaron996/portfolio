"use client";

import { useEffect, useRef, useState } from "react";
import type { GameCutscene } from "@/content/types";
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
  const nextRef = useRef<HTMLButtonElement>(null);
  const last = card === scene.cards.length - 1;
  const advance = () => {
    if (last) onComplete();
    else setCard((current) => current + 1);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onComplete(); }
      else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); advance(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [last, onComplete]);

  useEffect(() => { nextRef.current?.focus({ preventScroll: true }); }, [card]);

  const current = scene.cards[card];
  const counter = counterLabel.replace("{current}", String(card + 1)).replace("{total}", String(scene.cards.length));
  return (
    <section className={styles.overlay} role="dialog" aria-modal="true" aria-label={scene.title}>
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
    </section>
  );
}
