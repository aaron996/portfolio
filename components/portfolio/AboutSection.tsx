import { content } from "@/content/content.vi";
import { SectionReveal } from "./SectionReveal";

export function AboutSection() {
  const p = content.prototype;

  return (
    <section id="about" className="pf-shell pf-section pf-about">
      <SectionReveal className="pf-about-lead">
          <div>
          <h2 className="pf-about-title">{p.labels.about}</h2>
          <p className="pf-about-tagline">
            Từ bài toán hiện trường, dữ liệu chuỗi cung ứng đến việc xây dựng công cụ phần mềm phục vụ
            vận hành thực chiến.
          </p>
        </div>
      </SectionReveal>

      <SectionReveal delay={0.1} className="pf-about-narrative">
        <div>
          <div className="pf-about-body">
            {p.about.map((paragraph, index) => (
              <p key={index} className="pf-about-paragraph">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="pf-about-sidebar-note">
            <span className="pf-meta">Bên lề công việc</span>
            <p>
              Ngoài giờ làm dữ liệu, tôi thích chơi và tự mày mò xây dựng game nhỏ. Tư duy hệ thống
              trong game design cũng chính là cách tôi nhìn nhận luồng dữ liệu và trải nghiệm người
              dùng trong các ứng dụng nội bộ.
            </p>
          </div>
        </div>
      </SectionReveal>
    </section>
  );
}
