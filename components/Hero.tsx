import Link from "next/link";
import { content } from "@/content/content.vi";
import { Reveal } from "./ui/Reveal";
import { HeroGrid } from "./ui/HeroGrid";
import { Magnetic } from "./ui/Magnetic";
import { StatBand } from "./StatBand";

export function Hero() {
  const { hero } = content;

  return (
    <header className="relative flex min-h-[100dvh] flex-col overflow-hidden border-b border-ink-800 pt-24">
      <HeroGrid />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_90%_at_76%_8%,rgba(212,242,54,.10),transparent_62%)]" />

      <div className="control-shell relative flex flex-1 flex-col justify-center pb-12 pt-3 md:pb-16">
        <Reveal>
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-lime sm:text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full bg-lime motion-safe:animate-pulse" aria-hidden="true" />
            {hero.eyebrow}
          </p>
        </Reveal>

        <Reveal delay={0.06}>
          <h1 className="display mt-7 max-w-[17ch] text-[clamp(2.65rem,7.2vw,6.2rem)]">
            {hero.headline.join(" ")}
          </h1>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-14">
            <p className="max-w-[56ch] text-base leading-8 text-mute md:text-lg">{hero.subline}</p>

            <div className="flex shrink-0 items-center gap-4 lg:mr-[165px] 2xl:mr-[195px]">
              <div className="placeholder-grid grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border border-ink-700 text-center text-[10px] text-mute-3 sm:h-24 sm:w-24">
                Ảnh<br />chân dung
              </div>
              <div>
                <p className="font-display text-sm font-extrabold uppercase text-paper">
                  {content.meta.name}
                </p>
                <p className="mt-1 text-xs text-mute-2">{content.meta.roleLabel}, TP.HCM</p>
                <a href={`mailto:${content.contact.email}`} className="nav-link mt-1.5 inline-block text-xs text-lime">
                  {content.contact.email}
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-9 flex flex-wrap gap-3.5">
            <Magnetic>
              <Link
                href={hero.primaryCta.href}
                className="whitespace-nowrap rounded-full bg-lime px-7 py-4 text-sm font-semibold text-ink-950"
              >
                {hero.primaryCta.label}
              </Link>
            </Magnetic>
            <Magnetic>
              <a
                href={hero.secondaryCta.href}
                className="whitespace-nowrap rounded-full border border-ink-700 px-7 py-4 text-sm font-semibold text-paper transition-colors hover:border-lime hover:text-lime"
              >
                {hero.secondaryCta.label}
              </a>
            </Magnetic>
          </div>
        </Reveal>
      </div>

      <StatBand />
    </header>
  );
}
