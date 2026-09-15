import Image from "next/image";
import { content } from "@/content/content.vi";
import { SectionReveal } from "./SectionReveal";

export function ProcessSection() {
  const p = content.prototype;

  return (
    <section id="pipeline" className="pf-process pf-section">
      <div className="pf-shell">
        <SectionReveal>
          <div className="pf-section-intro">
            <div>
              <span className="pf-eyebrow">Phương pháp</span>
              <h2>{p.labels.process}</h2>
            </div>
            <p>
              Cách tiếp cận tập trung vào thực tế vận hành: bắt đầu từ hiện trường, chuẩn hóa logic
              và đưa ra công cụ mà các team thực sự tin dùng.
            </p>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.05}>
          <figure className="pf-process-visual">
            <Image
              src="/portfolio/visuals/homepage/operating-loop.webp"
              alt="Minh hoạ hệ thống: Bốn khâu vận hành gồm quan sát bài toán hiện trường, chốt tài liệu đặc tả, đối chiếu dữ liệu và bàn giao vận hành"
              width={1376}
              height={768}
              className="pf-visual-img"
              loading="lazy"
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
            <figcaption className="pf-visual-badge">Minh hoạ hệ thống: Bốn khâu từ hiện trường đến bàn giao</figcaption>
          </figure>
        </SectionReveal>

        <ol className="pf-process-grid">
          {p.process.map((step, i) => (
            <SectionReveal as="li" key={step.title} delay={i * 0.08} className="pf-process-step-wrap">
              <div className="pf-process-step">
                <div className="pf-process-rail">
                  <span className="pf-step-index" aria-hidden="true">
                    0{i + 1}
                  </span>
                  <span className="pf-rail-line" aria-hidden="true" />
                </div>
                <h3 className="pf-process-title">{step.title}</h3>
                <p className="pf-process-body">{step.body}</p>
              </div>
            </SectionReveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
