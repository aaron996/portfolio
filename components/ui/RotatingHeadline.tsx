"use client";

import { useEffect, useMemo, useState } from "react";

export function RotatingHeadline({
  words,
  interval = 2800,
  className = "",
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const longest = useMemo(
    () => words.reduce((current, word) => (word.length > current.length ? word : current), words[0] ?? ""),
    [words]
  );

  useEffect(() => {
    if (words.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % words.length), interval);
    return () => window.clearInterval(timer);
  }, [interval, words]);

  return (
    <span className={`grid ${className}`} aria-hidden="true">
      <span className="invisible col-start-1 row-start-1">{longest}</span>
      <span key={words[active]} className="hero-word-in col-start-1 row-start-1">
        {words[active]}
      </span>
    </span>
  );
}
