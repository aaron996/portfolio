"use client";
import { useEffect, useState, type RefObject } from "react";
import { content } from "@/content/content.vi";
import type { GameInstance, GameStatus } from "./engine";
import styles from "./OpsGame.module.css";

const { game } = content;
type HudState = Omit<GameStatus, "items">;

/** Keep frequent status updates inside this small component, away from the game shell. */
export function GameHud({ instanceRef, touch }: {
  instanceRef: RefObject<GameInstance | null>; touch: boolean;
}) {
  const [status, setStatus] = useState<HudState | null>(null);
  useEffect(() => {
    let previous = "";
    const update = () => {
      const snapshot = instanceRef.current?.status();
      if (!snapshot) return;
      const { items: _items, ...rest } = snapshot;
      const next = { ...rest, guard: Math.round(rest.guard * 100) / 100,
        toolLeft: Math.ceil(rest.toolLeft), bossHpPct: Math.round(rest.bossHpPct * 100) / 100 };
      const signature = JSON.stringify(next);
      if (signature !== previous) { previous = signature; setStatus(next); }
    };
    update();
    const timer = window.setInterval(update, 100);
    return () => window.clearInterval(timer);
  }, [instanceRef]);

  if (!status) return null;
  const map = game.maps[status.mapIndex];
  const labels = game.display;
  const hint = status.bossAlive && map.bossKind === "volley"
    ? (touch ? labels.volleyTouch : game.volleyHint)
    : labels.remaining.replace("{n}", String(status.mobsLeft)).replace("{total}", String(status.mobsTotal));
  const message = touch ? status.message.replace("J", labels.attack) : status.message;
  return (
    <div className={styles.hud}>
      <div className={styles.hudStats}>
        <span className={status.hp <= 1 ? styles.warning : undefined}>{labels.hp} <strong>{Math.max(0, status.hp)}/{status.mhp}</strong></span>
        <label>{labels.guard}<meter min={0} max={1} value={status.guard} /> <strong>{Math.round(status.guard * 100)}%</strong></label>
        <span className={status.gunName && status.ammo <= 3 ? styles.warning : undefined}>
          {status.gunName ? <>{labels.ammo} <strong>{status.ammo}</strong></> : labels.noGun}
        </span>
        {status.toolLeft > 0 ? <span>{labels.toolTime.replace("{n}", String(status.toolLeft))}</span> : null}
      </div>
      {status.bossAlive ? <label className={styles.bossHealth}>
        <span>{map.boss}</span><meter min={0} max={1} value={status.bossHpPct} />
      </label> : null}
      <div className={styles.hudHint}>
        <span>{status.bossAlive && map.bossKind !== "volley" ? map.boss : hint}</span>
        <span role="status" className={styles.feedback}>{message}</span>
      </div>
    </div>
  );
}
