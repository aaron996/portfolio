"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/**
 * Chữ luân phiên ở cuối headline hero. Tách khỏi headline tĩnh để aria-label
 * dựng được câu đầy đủ cho screen reader (đọc hết cả mảng words, không chỉ
 * từ đang hiện — screen reader không thấy được animation).
 */
export function RotatingWord({ words, intervalMs = 2600 }: { words: string[]; intervalMs?: number }) {
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (reducedMotion || words.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), intervalMs);
    return () => clearInterval(id);
  }, [words.length, intervalMs, reducedMotion]);

  return (
    <span className="relative inline-block align-top">
      {/* Đọc hết cho screen reader; ẩn khỏi mắt vì bên dưới đã render chữ động */}
      <span className="sr-only">{words.join(" / ")}</span>
      <span aria-hidden="true">
        {reducedMotion ? (
          words[0]
        ) : (
          <AnimatePresence mode="wait">
            <motion.span
              key={words[index]}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block text-lime"
            >
              {words[index]}
            </motion.span>
          </AnimatePresence>
        )}
      </span>
    </span>
  );
}
