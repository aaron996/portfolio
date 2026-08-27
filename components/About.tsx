import { content } from "@/content/content.vi";
import { Reveal } from "./ui/Reveal";

const FIT = [
  "Chỉ tiêu đang bị mỗi bên hiểu một kiểu",
  "Báo cáo còn dựng tay mỗi tuần",
  "Cần một người vừa chốt logic vừa ship được",
];

const NOT_FIT = [
  "Cần một data engineer dựng hạ tầng từ đầu",
  "Bài toán thuần ML hoặc mô hình dự báo nặng",
  "Chỉ cần người chạy query theo yêu cầu",
];

export function About() {
  const skills = Array.from(new Set(content.skills.flatMap((group) => group.items))).slice(0, 9);

  return (
    <section id="about" className="border-b border-ink-800">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-[minmax(0,.82fr)_minmax(0,1.18fr)] lg:gap-16 xl:px-11">
        <Reveal>
          <div className="relative max-w-xl">
            <div className="placeholder-grid aspect-[4/5] overflow-hidden rounded-2xl border border-ink-700 bg-ink-900">
              <div className="grid h-full place-items-center p-8 text-center text-sm leading-relaxed text-mute-3">
                Ảnh chân dung dọc<br />đang làm việc, ánh sáng tự nhiên
              </div>
            </div>
            <div className="absolute -bottom-5 left-4 rounded-xl bg-lime px-5 py-4 text-ink-950 sm:-left-4 sm:bottom-7">
              <p className="font-display text-sm font-extrabold uppercase tracking-[0.08em]">Lương Thế Vinh</p>
              <p className="mt-1 text-xs text-ink-950/70">BI & Data Analyst, TP.HCM</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="eyebrow text-lime">Về tôi</p>
          <h2 className="display mt-4 max-w-[20ch] text-[clamp(2rem,4.2vw,3.4rem)]">
            Tôi đến với dữ liệu từ phía vận hành
          </h2>
          <div className="mt-7 max-w-[64ch] space-y-5 text-base leading-8 text-mute md:text-[17px]">
            {content.intro.body.slice(0, 2).map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            <FitList title="Tôi phù hợp khi" items={FIT} positive />
            <FitList title="Tôi không phù hợp khi" items={NOT_FIT} />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill} className="rounded-full border border-ink-700 px-3 py-1.5 text-xs text-mute">
                {skill}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FitList({ title, items, positive = false }: { title: string; items: string[]; positive?: boolean }) {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
      <h3 className="font-display text-sm font-bold uppercase text-paper">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm leading-6 text-mute-2">
            <span className={positive ? "text-lime" : "text-mute-3"} aria-hidden="true">
              {positive ? "+" : "×"}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
