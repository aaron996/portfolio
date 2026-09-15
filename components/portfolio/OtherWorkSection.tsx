import Image from "next/image";
import Link from "next/link";
import { content } from "@/content/content.vi";
import { PortfolioIcon } from "./PortfolioIcon";
import { SectionReveal } from "./SectionReveal";

export function OtherWorkSection() {
  const p = content.prototype;
  const brief = content.cases.find((c) => c.tier === "brief")!;
  const deepCases = content.cases.filter((c) => c.tier === "deep" && c.homepage);

  return (
    <section className="pf-shell pf-section pf-other">
      <SectionReveal>
        <div className="pf-section-intro">
          <div>
            <span className="pf-eyebrow">Kết quả & Hồ sơ kỹ thuật</span>
            <h2>{p.labels.otherWorks}</h2>
          </div>
        </div>
      </SectionReveal>

      {/* 3PL Results Block */}
      <SectionReveal delay={0.08}>
        <div className="pf-other-group">
          <h3 className="pf-other-group-title">Kết quả vận hành</h3>
          <article className="pf-result-strip">
            <div className="pf-result-info">
              <span className="pf-meta">{brief.homepage!.role}</span>
              <h3>{brief.homepage!.title}</h3>
              <p>{brief.homepage!.summary}</p>
              <Link className="pf-text-link pf-action-link" href={`/case/${brief.slug}`}>
                {brief.homepage!.cta}
                <PortfolioIcon />
              </Link>
            </div>
            <div className="pf-result-visual">
              <Image
                src="/portfolio/visuals/homepage/carrier-feedback-loop.webp"
                alt="Minh hoạ hệ thống: Vòng phản hồi vận hành nối depot giao nhận, tuyến vận chuyển và sổ đối chiếu báo cáo"
                width={1264}
                height={848}
                className="pf-visual-img"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 360px"
              />
              <span className="pf-visual-badge">Minh hoạ hệ thống</span>
            </div>
            <div className="pf-result-metric">
              <p className="pf-result-number" aria-label={`Pickup on-time của Viettel Post cải thiện từ ${brief.homepage!.evidence}`}>
                {brief.homepage!.evidence}
              </p>
              <span className="pf-result-label">Pickup on-time của Viettel Post</span>
              <p className="pf-result-note">{p.resultNote}</p>
            </div>
          </article>
        </div>
      </SectionReveal>

      {/* KA & SLA Dossier Rows */}
      <div className="pf-other-group">
        <h3 className="pf-other-group-title">Hệ thống và quy tắc nghiệp vụ</h3>
        <div className="pf-dossier-list" aria-label="Hồ sơ chuẩn hóa và quy tắc nghiệp vụ">
          {deepCases.map((c, i) => (
            <SectionReveal key={c.slug} delay={i * 0.08}>
              <article className="pf-dossier-row">
                <div className="pf-dossier-header">
                  <span className="pf-dossier-index" aria-hidden="true">
                    0{i + 1}
                  </span>
                  <div>
                    <span className="pf-meta">{c.homepage!.role}</span>
                    <h3 className="pf-dossier-title">
                      <Link href={`/case/${c.slug}`}>{c.homepage!.title}</Link>
                    </h3>
                  </div>
                </div>

                <div className="pf-dossier-content">
                  <p className="pf-dossier-summary">{c.homepage!.summary}</p>
                  <div className="pf-dossier-evidence">
                    <span className="pf-evidence-badge">Điểm kiểm chứng</span>
                    <span>{c.homepage!.evidence}</span>
                  </div>
                </div>

                <div className="pf-dossier-action">
                  <Link className="pf-text-link pf-action-link" href={`/case/${c.slug}`}>
                    {c.homepage!.cta}
                    <PortfolioIcon />
                  </Link>
                </div>
              </article>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
