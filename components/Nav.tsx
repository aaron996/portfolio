"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { content } from "@/content/content.vi";
import { BrandMark } from "./ui/BrandMark";
import { Magnetic } from "./ui/Magnetic";

export function Nav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);

  /* Thanh nav trong suốt khi ở đỉnh trang rồi mới đặc dần khi cuộn — hero cần
     nguyên khung hình cho lưới sáng, một thanh đen kịt ngay từ đầu làm mất hiệu
     ứng đó. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = content.nav
      .map((item) => document.getElementById(item.href.slice(1)))
      .filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-42% 0px -48% 0px", threshold: [0, 0.2, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-40 h-[68px] border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled || open
            ? "border-ink-800 bg-ink-950/88 backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="control-shell flex h-full items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-paper" aria-label="Vinh Lương, về trang chủ">
            <BrandMark className="h-[26px] w-[26px]" />
            <span className="font-display text-xs font-extrabold uppercase tracking-[0.15em] sm:text-[13px]">
              Vinh Lương
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <ul className="hidden items-center gap-7 lg:flex">
              {content.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={`/${item.href}`}
                    aria-current={active === item.href ? "location" : undefined}
                    className={`nav-link text-sm ${active === item.href ? "text-lime" : "text-mute"}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <Magnetic className="hidden sm:inline-flex">
              <a
                href="/#contact"
                className="whitespace-nowrap rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-ink-950"
              >
                {content.sectionLabels.navCta}
              </a>
            </Magnetic>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Đóng menu" : "Mở menu"}
              className="grid h-11 w-11 place-items-center rounded-full border border-ink-700 lg:hidden"
            >
              <span className="relative h-3.5 w-5" aria-hidden="true">
                <span className={`absolute left-0 h-px w-5 bg-paper transition-transform ${open ? "top-1.5 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 top-1.5 h-px w-5 bg-paper transition-opacity ${open ? "opacity-0" : "opacity-100"}`} />
                <span className={`absolute left-0 h-px w-5 bg-paper transition-transform ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
              </span>
            </button>
          </div>
        </div>
      </nav>

      {open ? (
        <div id="mobile-menu" className="fixed inset-0 z-30 bg-ink-950 px-5 pb-8 pt-24 lg:hidden">
          <ul>
            {content.nav.map((item) => (
              <li key={item.href} className="border-b border-ink-800">
                <Link
                  href={`/${item.href}`}
                  onClick={() => setOpen(false)}
                  className="block py-5 font-display text-2xl font-bold uppercase text-paper"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <a
            href="/#contact"
            onClick={() => setOpen(false)}
            className="mt-8 block rounded-full bg-lime px-6 py-4 text-center font-semibold text-ink-950"
          >
            {content.sectionLabels.navCta}
          </a>
        </div>
      ) : null}
    </>
  );
}
