import Link from "next/link";
import { content } from "@/content/content.vi";
import { PortfolioIcon } from "./PortfolioIcon";
import { SectionReveal } from "./SectionReveal";

export function SkillsSection() {
  const p = content.prototype;

  return (
    <section className="pf-shell pf-section pf-skills">
      <SectionReveal>
        <div className="pf-section-intro">
          <div>
            <h2>{p.labels.skills}</h2>
          </div>
          <p>
            Các nhóm kỹ năng cốt lõi được xây dựng qua thực tế giải quyết vấn đề vận hành chuỗi cung ứng
            và phát triển ứng dụng nội bộ.
          </p>
        </div>
      </SectionReveal>

      <div className="pf-skills-grid">
        {p.skills.map((skill, index) => (
          <SectionReveal key={skill.title} delay={index * 0.08}>
            <article className="pf-skill-panel">
              <div className="pf-skill-header">
                <span className="pf-skill-index" aria-hidden="true">
                  [{index + 1}]
                </span>
                <h3 className="pf-skill-title">{skill.title}</h3>
              </div>
              <p className="pf-skill-body">{skill.body}</p>
              <div className="pf-skill-evidence">
                <span className="pf-evidence-badge">Dự án chứng minh</span>
                <div className="pf-skill-links">
                  {skill.links.map((link) => (
                    <Link key={link.href} href={link.href} className="pf-skill-link">
                      {link.label}
                      <PortfolioIcon />
                    </Link>
                  ))}
                </div>
              </div>
            </article>
          </SectionReveal>
        ))}
      </div>
    </section>
  );
}
