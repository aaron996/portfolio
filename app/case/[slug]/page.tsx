import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { content } from "@/content/content.vi";
import { Nav } from "@/components/Nav";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { Footer } from "@/components/Footer";
import { Contact } from "@/components/Contact";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { DraftBadge } from "@/components/ui/DraftBadge";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { FlowDiagram } from "@/components/ui/FlowDiagram";
import { SensorBotCanvas } from "@/components/ui/SensorBotCanvas";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return content.cases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const c = content.cases.find((x) => x.slug === slug);
  if (!c) return {};
  return {
    title: c.title,
    description: c.oneLiner,
    openGraph: { title: c.title, description: c.oneLiner },
  };
}

export default async function CasePage({ params }: Params) {
  const { slug } = await params;
  const c = content.cases.find((x) => x.slug === slug);
  if (!c) notFound();

  const others = content.cases.filter((x) => x.slug !== c.slug);

  return (
    <>
      <ScrollProgress />
      <Nav />
      <main id="main">
        <header className="border-b border-ink-800 bg-ink-950">
          <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-28 sm:px-8 md:pb-20 md:pt-32">
            <Link href="/#cases" className="text-sm text-mute-2 transition-colors hover:text-lime">
              ← Tất cả case
            </Link>
            <p className="eyebrow mt-8 text-lime">{c.scopeLabel}</p>
            <h1 className="display mt-4 text-[clamp(2.1rem,6vw,4.2rem)]">{c.title}</h1>
            <p className="mt-4 max-w-2xl text-base font-semibold text-paper md:text-lg">{c.proves}</p>
            <p className="prose-lede mt-4 text-mute md:text-lg">{c.oneLiner}</p>

            <div className="mt-10 inline-flex flex-col rounded-2xl border border-lime/40 bg-lime/5 px-6 py-5">
              <span className="font-display text-2xl font-extrabold text-paper md:text-3xl">
                {c.keyResult.value}
                <DraftBadge verified={c.keyResult.verified} />
              </span>
              <span className="mt-2 text-sm text-mute-2">{c.keyResult.label}</span>
            </div>

            <dl className="mt-12 grid gap-6 border-t border-ink-800 pt-8 sm:grid-cols-3">
              <div>
                <dt className="eyebrow text-mute-3">Khách hàng</dt>
                <dd className="mt-2 text-sm text-paper">{c.client}</dd>
                {c.clientNote ? <dd className="mt-1 text-xs text-mute-3">{c.clientNote}</dd> : null}
              </div>
              <div>
                <dt className="eyebrow text-mute-3">Vai trò</dt>
                <dd className="mt-2 text-sm text-paper">{c.role}</dd>
              </div>
              <div>
                <dt className="eyebrow text-mute-3">Thời gian</dt>
                <dd className="mt-2 text-sm text-paper">{c.period}</dd>
              </div>
            </dl>
          </div>
        </header>

        {c.context.length > 0 && (
          <Section className="border-b border-ink-800">
            <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:gap-16">
              <h2 className="display text-[clamp(1.6rem,3.5vw,2.2rem)]">Bối cảnh</h2>
              <div className="space-y-4">
                {c.context.map((p) => (
                  <p key={p.slice(0, 24)} className="leading-relaxed text-mute">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </Section>
        )}

        {c.decisions.length > 0 && (
          <Section tone="darker" className="border-b border-ink-800">
            <SectionHeading eyebrow="Phần khó">
              Những quyết định đứng sau con số
            </SectionHeading>
            <div className="space-y-4">
              {c.decisions.map((d, i) => (
                <Reveal key={d.problem} delay={i * 0.04}>
                  <article className="rounded-xl border border-ink-700 bg-ink-900 p-6 md:p-8">
                    <h3 className="font-display text-lg font-bold text-paper">{d.problem}</h3>
                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                      <div>
                        <p className="eyebrow text-mute-3">Vì sao khó</p>
                        <p className="mt-2 text-sm leading-relaxed text-mute-2">{d.why}</p>
                      </div>
                      <div>
                        <p className="eyebrow text-lime">Tôi đã quyết định</p>
                        <p className="mt-2 text-sm leading-relaxed text-mute">{d.decision}</p>
                      </div>
                    </div>
                    {d.term ? (
                      <p className="mt-5 border-t border-ink-800 pt-4 text-xs text-mute-3">
                        Thuật ngữ tương ứng: {d.term}
                      </p>
                    ) : null}
                  </article>
                </Reveal>
              ))}
            </div>
          </Section>
        )}

        {c.features && c.features.length > 0 && (
          <Section className="border-b border-ink-800">
            <SectionHeading eyebrow="Sản phẩm">Những gì đã ship</SectionHeading>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {c.features.map((f, i) => (
                <Reveal key={f.title} delay={i * 0.04}>
                  <div className="h-full rounded-xl border border-ink-700 bg-ink-900 p-5">
                    <h3 className="font-display text-base font-bold text-paper">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-mute-2">{f.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Section>
        )}

        {c.flow && (
          <Section tone="darker" className="border-b border-ink-800">
            <SectionHeading eyebrow="Luồng dữ liệu">
              {c.flowHeading || "Từ dữ liệu thô tới một nguồn sự thật"}
            </SectionHeading>
            <FlowDiagram nodes={c.flow.nodes} />
          </Section>
        )}

        {c.media && c.media.length > 0 && (
          <Section className="border-b border-ink-800">
            <SectionHeading eyebrow="Demo">Hệ thống trông như thế nào</SectionHeading>
            <div className="grid gap-5 md:grid-cols-2">
              {c.media.map((m) => (
                <MediaPlaceholder key={m.id} slot={m} />
              ))}
            </div>
          </Section>
        )}

        <Section tone="darker">
          <div className="grid gap-12 md:grid-cols-2">
            {c.results.length > 0 && (
              <div>
                <SectionHeading eyebrow="Kết quả">
                  Số liệu
                </SectionHeading>
                <dl className="space-y-5">
                  {c.results.map((r) => (
                    <div key={r.label} className="border-t border-ink-800 pt-4">
                      <dt className="text-sm text-mute-3">{r.label}</dt>
                      <dd>
                        <p className="mt-1 font-display text-xl font-bold text-paper">
                          {r.value}
                          <DraftBadge verified={r.verified} title={r.method} />
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-mute-3">{r.method}</p>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <div>
              {c.ownership.owned.length > 0 && (
                <>
                  <SectionHeading eyebrow="Phạm vi">
                    Phần tôi sở hữu
                  </SectionHeading>
                  <ul className="space-y-2">
                    {c.ownership.owned.map((o) => (
                      <li key={o.slice(0, 20)} className="text-sm leading-relaxed text-mute">
                        {o}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {c.ownership.notOwned.length > 0 && (
                <>
                  <p className="eyebrow mt-8 text-mute-3">Phần do người khác làm</p>
                  <ul className="mt-3 space-y-2">
                    {c.ownership.notOwned.map((o) => (
                      <li key={o.slice(0, 20)} className="text-sm leading-relaxed text-mute-3">
                        {o}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {c.stack.length > 0 && (
                <div className="mt-10 border-t border-ink-800 pt-6">
                  <p className="eyebrow text-mute-3">Công nghệ</p>
                  <dl className="mt-4 space-y-3">
                    {c.stack.map((g) => (
                      <div key={g.group}>
                        <dt className="text-xs text-mute-3">{g.group}</dt>
                        <dd className="mt-1 text-sm text-mute">{g.items.join(" · ")}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </div>
        </Section>

        {c.reflection.length > 0 && (
          <Section className="border-b border-ink-800">
            <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:gap-16">
              <h2 className="display text-[clamp(1.6rem,3.5vw,2.2rem)]">Nhìn lại</h2>
              <div className="space-y-4">
                {c.reflection.map((p) => (
                  <p key={p.slice(0, 24)} className="leading-relaxed text-mute">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </Section>
        )}

        {others.length > 0 && (
          <Section tone="darker" className="border-b border-ink-800">
            <SectionHeading eyebrow="Case khác">Xem tiếp</SectionHeading>
            {/* 4 case còn lại: 2 cột trên tablet, 4 cột trên desktop — tránh để
                lẻ một card mồ côi như lưới 3 cột. */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {others.map((o) => (
                <Link
                  key={o.slug}
                  href={`/case/${o.slug}`}
                  className="group flex h-full flex-col rounded-xl border border-ink-700 bg-ink-900 p-5 transition-colors hover:border-lime/50"
                >
                  <p className="eyebrow text-lime">{o.scopeLabel}</p>
                  <h3 className="mt-2 font-display text-sm font-bold uppercase leading-tight text-paper">
                    {o.title}
                  </h3>
                  <span className="mt-3 text-xs font-semibold text-lime group-hover:underline">
                    Xem chi tiết →
                  </span>
                </Link>
              ))}
            </div>
          </Section>
        )}

        <Contact />
      </main>
      <SensorBotCanvas />
      <Footer />
    </>
  );
}
