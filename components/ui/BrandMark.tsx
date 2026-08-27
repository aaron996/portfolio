export function BrandMark({ className = "" }: { className?: string }) {
  const active = new Set([2, 4, 6]);

  return (
    <span
      aria-hidden="true"
      className={`grid grid-cols-3 gap-[3px] ${className}`}
    >
      {Array.from({ length: 9 }, (_, index) => (
        <span
          key={index}
          className={`aspect-square ${active.has(index) ? "bg-lime" : "bg-ink-700"}`}
        />
      ))}
    </span>
  );
}
