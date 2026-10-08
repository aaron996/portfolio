"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { content } from "@/content/content.vi";
import { PortfolioIcon } from "@/components/portfolio/PortfolioIcon";
import { companionsOut } from "@/components/companions/store";

const copy = content.home.about;

/* Ba câu hỏi được tô dạ quang lần lượt khi cuộn tới; mỗi câu dẫn sang case trả lời nó. */
export function AboutQuestions() {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      // Bạn đồng hành đang ở ngoài → để Lệch kéo bút dạ quang thay cho hiệu ứng CSS.
      if (companionsOut()) {
        node.dataset.driver = "companion";
        window.dispatchEvent(new CustomEvent("companion:questions"));
        fallback = setTimeout(() => { if (node.dataset.driver === "companion") node.dataset.driver = "done"; }, 9000);
      }
      setInView(true);
    }, { threshold: 0.4 });
    let fallback: ReturnType<typeof setTimeout> | undefined;
    io.observe(node);
    return () => { io.disconnect(); clearTimeout(fallback); };
  }, []);

  return <section ref={ref} className="aq" data-inview={inView} data-companion="questions" aria-labelledby="aq-lead">
    <p id="aq-lead" className="aq-lead">{copy.lead}</p>
    <ol className="aq-list">
      {copy.questions.map((item, index) => {
        const target = content.cases.find(c => c.slug === item.slug);
        return <li key={item.slug} style={{ transitionDelay: `${index * 220}ms` }}>
          <Link href={`/case/${item.slug}`} className="aq-q">
            <span className="aq-text"><mark style={{ transitionDelay: `${200 + index * 220}ms` }}>{item.q}</mark></span>
            <span className="aq-case"><span className="aq-case-name">{target?.homepage?.title ?? target?.title}</span><PortfolioIcon /></span>
          </Link>
        </li>;
      })}
    </ol>
    <div className="aq-foot">
      <p>{copy.footnote}</p>
      <Link href="/game" className="aq-aside">{copy.aside} <span>{copy.asideCta}<PortfolioIcon name="forward" /></span></Link>
    </div>
  </section>;
}
