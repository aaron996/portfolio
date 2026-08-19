import Link from "next/link";
import { content } from "@/content/content.vi";
import { Reveal } from "./ui/Reveal";
import { Marquee } from "./ui/Marquee";
import { Hero3DCanvas } from "./ui/Hero3DCanvas";
import { RotatingWord } from "./ui/RotatingWord";

export function Hero() {
  const { hero } = content;
  return (
    <header className="relative overflow-hidden border-b border-ink-800 pt-28">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 pb-14 sm:px-8 md:pb-20 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-center">
        <div>
          <Reveal>
            <p className="eyebrow text-lime">{hero.eyebrow}</p>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="display mt-6 text-[clamp(2.6rem,8vw,5.5rem)]">
              {hero.headline.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              {hero.headlineRotating && hero.headlineRotating.length > 0 ? (
                <span className="block">
                  <RotatingWord words={hero.headlineRotating} />
                </span>
              ) : null}
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="prose-lede mt-7 text-base text-mute md:text-lg">{hero.subline}</p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href={hero.primaryCta.href}
                className="min-h-11 rounded-lg bg-lime px-6 py-3 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.03]"
              >
                {hero.primaryCta.label}
              </Link>
              <a
                href={hero.secondaryCta.href}
                className="min-h-11 rounded-lg border border-ink-700 px-6 py-3 text-sm font-semibold text-paper transition-colors hover:border-lime hover:text-lime"
              >
                {hero.secondaryCta.label}
              </a>
            </div>
          </Reveal>
        </div>

        {/* Vật thể 3D + thẻ bằng chứng. Vật thể để tạo chiều sâu thị giác;
            số liệu bên dưới mới là thứ chứng minh, không phải hình trang trí. */}
        <Reveal delay={0.24}>
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-lime/25"
            />
            <div
              aria-hidden="true"
              className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-lime/5 blur-2xl"
            />

            <div
              aria-hidden="true"
              className="relative mb-4 h-64 overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 sm:h-72"
            >
              <Hero3DCanvas />
              <span className="pointer-events-none absolute bottom-3 right-4 text-[11px] text-mute-3">
                Kéo để xoay
              </span>
            </div>

            <div className="relative rounded-2xl border border-ink-700 bg-ink-900 p-6">
              <p className="eyebrow text-lime">{hero.liveCard.label}</p>
              <dl className="mt-6 space-y-5">
                {hero.liveCard.figures.map((f) => (
                  <div key={f.label} className="border-t border-ink-800 pt-4 first:border-t-0 first:pt-0">
                    <dd className="break-words font-display text-3xl font-extrabold leading-tight text-paper">
                      {f.value}
                    </dd>
                    <dt className="mt-1 text-xs text-mute-2">{f.label}</dt>
                  </div>
                ))}
              </dl>
              {hero.liveCard.caption ? (
                <p className="mt-6 border-t border-ink-700 pt-4 text-xs leading-relaxed text-mute-3">
                  {hero.liveCard.caption}
                </p>
              ) : null}
            </div>
          </div>
        </Reveal>
      </div>

      <div className="border-t border-ink-800 py-4">
        <Marquee items={hero.ticker} />
      </div>
    </header>
  );
}
