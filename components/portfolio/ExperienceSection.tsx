import { content } from "@/content/content.vi";
import { PortfolioIcon } from "./PortfolioIcon";
import { SectionReveal } from "./SectionReveal";

export function ExperienceSection() {
  const p = content.prototype;

  return (
    <section id="experience" className="pf-shell pf-section pf-experience">
      <SectionReveal>
        <div className="pf-experience-header">
          <div>
            <span className="pf-eyebrow">Hành trình nghề nghiệp</span>
            <h2>{p.labels.experience}</h2>
          </div>
          <a className="pf-button pf-secondary-btn" href={content.contact.cvHref}>
            {p.labels.cv}
            <PortfolioIcon name="forward" />
          </a>
        </div>
      </SectionReveal>

      <div className="pf-timeline" aria-label="Dòng thời gian kinh nghiệm">
        {p.experience.map((job, idx) => {
          // Quy tắc node: job gần nhất dùng lime (#d4f236), các job trước dùng Maersk blue (#42b0d5)
          const nodeColorClass = idx === 0 ? "pf-node-lime" : "pf-node-blue";

          return (
            <SectionReveal key={job.company} delay={idx * 0.06}>
              <article className="pf-timeline-item">
                <div className="pf-timeline-period">
                  <span className="pf-meta pf-period-text">{job.period}</span>
                </div>

                <div className="pf-timeline-track">
                  <span className={`pf-timeline-node ${nodeColorClass}`} aria-hidden="true" />
                  <span className="pf-timeline-line" aria-hidden="true" />
                </div>

                <div className="pf-timeline-content">
                  <h3 className="pf-timeline-company">{job.company}</h3>
                  <p className="pf-timeline-role">{job.role}</p>
                  <p className="pf-timeline-body">{job.body}</p>
                </div>
              </article>
            </SectionReveal>
          );
        })}
      </div>
    </section>
  );
}
