export function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const doubled = [...items, ...items];
  return (
    <div className={`marquee-wrap overflow-hidden ${className}`} aria-hidden="true">
      <div className="marquee-track">
        {doubled.map((it, i) => (
          <span key={`${it}-${i}`} className="flex shrink-0 items-center">
            <span className="px-5 text-sm text-mute-2">{it}</span>
            <span className="text-lime">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
