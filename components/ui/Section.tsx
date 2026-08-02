type Tone = "dark" | "darker" | "lime";

const tones: Record<Tone, string> = {
  dark: "bg-ink-950 text-paper",
  darker: "bg-ink-900 text-paper",
  lime: "bg-lime text-ink-950",
};

export function Section({
  id,
  tone = "dark",
  children,
  className = "",
}: {
  id?: string;
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`${tones[tone]} ${className}`}>
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 md:py-28">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  children,
  onLime = false,
}: {
  eyebrow?: string;
  children: React.ReactNode;
  onLime?: boolean;
}) {
  return (
    <header className="mb-12 md:mb-16">
      {eyebrow ? (
        <p className={`eyebrow mb-4 ${onLime ? "text-ink-950/70" : "text-lime"}`}>{eyebrow}</p>
      ) : null}
      <h2 className="display text-[clamp(1.9rem,5vw,3.25rem)]">{children}</h2>
    </header>
  );
}
