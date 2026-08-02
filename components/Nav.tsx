"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { content } from "@/content/content.vi";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = content.nav.map((n) => n.href.replace("#", ""));
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (els.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
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
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
          scrolled ? "border-b border-ink-800 bg-ink-950/85 backdrop-blur" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label={`${content.meta.name} — về trang chủ`}
          >
            <span className="grid h-8 w-8 place-items-center rounded-md bg-lime font-display text-xs font-extrabold text-ink-950">
              TV
            </span>
            <span className="hidden font-display text-xs font-bold uppercase tracking-[0.14em] text-paper sm:block">
              Thế Vinh Lương
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <ul className="hidden items-center gap-6 lg:flex">
              {content.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={`/${item.href}`}
                    aria-current={active === item.href ? "true" : undefined}
                    className={`relative text-sm transition-colors hover:text-paper ${
                      active === item.href ? "text-paper" : "text-mute-2"
                    }`}
                  >
                    {item.label}
                    {active === item.href ? (
                      <span className="absolute -bottom-1.5 left-0 h-0.5 w-full bg-lime" />
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>

            <a
              href="#contact"
              className="hidden rounded-lg bg-lime px-4 py-2 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.04] sm:block"
            >
              Let&apos;s connect
            </a>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Đóng menu" : "Mở menu"}
              className="grid h-11 w-11 place-items-center rounded-lg border border-ink-700 lg:hidden"
            >
              <span className="relative block h-3 w-5">
                <span
                  className={`absolute left-0 block h-0.5 w-5 bg-paper transition-transform ${
                    open ? "top-1.5 rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 top-1.5 block h-0.5 w-5 bg-paper transition-opacity ${
                    open ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 block h-0.5 w-5 bg-paper transition-transform ${
                    open ? "top-1.5 -rotate-45" : "top-3"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </nav>

      {open ? (
        <div
          id="mobile-menu"
          className="fixed inset-0 z-30 bg-ink-950 px-5 pt-24 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <ul className="space-y-1">
            {content.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={`/${item.href}`}
                  className="block border-b border-ink-800 py-4 font-display text-2xl font-bold uppercase text-paper"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <a
            href="#contact"
            className="mt-8 block rounded-lg bg-lime px-5 py-4 text-center font-semibold text-ink-950"
          >
            Let&apos;s connect
          </a>
        </div>
      ) : null}
    </>
  );
}
