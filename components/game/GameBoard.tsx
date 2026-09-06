"use client";
import { useEffect, useRef, type ReactNode } from "react";
import styles from "./GameBoard.module.css";
import { GAME_BOARD_ART } from "./engine";

// Local extension of the game's warehouse world: illustrated steel rim, packing paper,
// live selectable instructions and controls. Raster decoration never contains UI text.
export function GameBoard({ children, actions, label, supply = false, centered = false }: {
  children: ReactNode; actions?: ReactNode; label: string; supply?: boolean; centered?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const board = ref.current;
    if (!board) return;
    board.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = Array.from(board.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex="0"]'
      )).filter((item) => item.getClientRects().length > 0);
      if (!items.length) { event.preventDefault(); return; }
      const first = items[0]; const last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === board)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === board)) {
        event.preventDefault(); first.focus();
      }
    };
    board.addEventListener("keydown", onKey);
    return () => {
      board.removeEventListener("keydown", onKey);
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  return (
    <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={label}
      className={`${styles.board} ${GAME_BOARD_ART ? (supply ? styles.supply : styles.briefing) : ""} ${centered ? styles.centered : ""}`}>
      <div className={styles.content}>{children}</div>
      {actions ? <div className={`${styles.content} ${styles.actions}`}>{actions}</div> : null}
    </div>
  );
}
