import { content } from "@/content/content.vi";
import { PortfolioIcon } from "./PortfolioIcon";
import { SectionReveal } from "./SectionReveal";
import { EditorialStill } from "./EditorialStill";

export function ExperienceSection() {
  const p = content.prototype;

  return (
    <section id="experience" className="pf-shell pf-section pf-experience">
      <SectionReveal>
        <div className="pf-experience-header">
          <div>
            <h2>{p.labels.experience}</h2>
          </div>
          <a className="pf-button pf-secondary-btn" href={content.contact.cvHref}>
            {p.labels.cv}
            <PortfolioIcon name="forward" />
          </a>
        </div>
      </SectionReveal>

      <SectionReveal delay={0.06}>
        <EditorialStill visual={p.visuals.experience} className="pf-experience-still" />
      </SectionReveal>

      <div className="pf-timeline" aria-label="Dòng thời gian kinh nghiệm">
        {p.experience.map((job, index) => {
          return (
            <SectionReveal key={job.company} delay={index * 0.06}>
              <article className="pf-timeline-item">
                <div className="pf-timeline-period">
                  <span className="pf-meta pf-period-text">{job.period}</span>
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
