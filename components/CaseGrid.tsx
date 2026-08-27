import Image from "next/image";
import Link from "next/link";
import { content } from "@/content/content.vi";
import { Reveal } from "./ui/Reveal";

export function CaseGrid() {
  const { casesEyebrow, casesHeading } = content.sectionLabels;

  return (
    <section id="cases" className="border-b border-ink-800">
      <div className="control-shell py-20 md:py-28">
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div>
              <p className="eyebrow text-lime">{casesEyebrow}</p>
              <h2 className="display mt-4 max-w-[24ch] text-[clamp(2rem,4vw,3.25rem)]">{casesHeading}</h2>
            </div>
            <p className="max-w-[38ch] text-sm leading-7 text-mute-2">{content.intro.body[2]}</p>
          </div>
        </Reveal>

        <div className="mt-9 border-b border-ink-800">
          {content.cases.map((caseStudy, index) => {
            /* Ảnh preview lấy từ chính media của case đó. Bản cũ dùng một map
               hardcode theo slug, trong đó sla-attribution và shopee-3pl-performance
               trỏ vào ảnh của case kas-shopee-performance — hover vào dòng "Đơn trễ
               này là lỗi của kho nào" lại hiện màn hình app hiệu suất Shopee. Hai
               case đó chưa có ảnh nên giờ không hiện preview, cho tới khi bổ sung
               media vào content. */
            const preview = caseStudy.media?.[0];

            return (
              <Reveal key={caseStudy.slug} delay={index * 0.04}>
                <Link
                  href={`/case/${caseStudy.slug}`}
                  className="case-row group relative grid gap-4 border-t border-ink-800 py-7 outline-none sm:py-8 lg:grid-cols-[2.5rem_minmax(0,1fr)_16rem_4rem] lg:items-center lg:gap-6"
                >
                  <span className="font-mono text-xs text-mute-3">{String(index + 1).padStart(2, "0")}</span>
                  <div className="case-row-title transition-transform duration-500 [transition-timing-function:cubic-bezier(.22,1,.36,1)]">
                    <h3 className="font-display text-xl font-extrabold uppercase leading-tight text-paper sm:text-2xl lg:text-[1.75rem]">
                      {caseStudy.title}
                    </h3>
                    <p className="mt-2 max-w-[58ch] text-sm leading-6 text-mute-2">{caseStudy.oneLiner}</p>
                  </div>
                  <div className="lg:pl-2">
                    <p className="font-display text-lg font-extrabold leading-tight text-lime">{caseStudy.keyResult.value}</p>
                    <p className="mt-1 text-xs leading-5 text-mute-3">{caseStudy.keyResult.label}</p>
                  </div>
                  <span className="whitespace-nowrap text-sm font-semibold text-paper/35 transition-all duration-300 group-hover:translate-x-1 group-hover:text-paper lg:justify-self-end">
                    Xem →
                  </span>

                  {preview ? (
                    <Image
                      src={preview.src}
                      alt={preview.alt}
                      width={360}
                      height={230}
                      className="case-row-image pointer-events-none absolute right-[8.5rem] top-1/2 z-10 hidden w-[330px] -translate-y-1/2 scale-[.94] rounded-xl border border-ink-700 object-cover opacity-0 shadow-[0_30px_60px_rgba(0,0,0,.65)] transition-all duration-500 xl:block"
                    />
                  ) : null}
                  <span className="case-row-line absolute inset-x-0 bottom-[-1px] h-px origin-left scale-x-0 bg-lime transition-transform duration-500" />
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
