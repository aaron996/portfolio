import { content } from "@/content/content.vi";
import { Reveal } from "./ui/Reveal";

export function Contact() {
  const { contact } = content;
  return (
    <section id="contact" className="relative overflow-hidden bg-ink-950">
      <div
        aria-hidden="true"
        className="absolute -right-32 top-1/2 h-[28rem] w-[28rem] -translate-y-1/2 rounded-full border border-lime/15"
      />
      <div
        aria-hidden="true"
        className="absolute -right-10 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full border border-lime/10"
      />
      <div className="relative mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 md:py-32">
        <Reveal>
          <p className="eyebrow text-lime">{contact.availability}</p>
          <h2 className="display mt-6 text-[clamp(2.2rem,7vw,4.5rem)]">{contact.heading}</h2>
          <p className="prose-lede mt-6 text-mute md:text-lg">{contact.body}</p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${contact.email}`}
              className="min-h-11 rounded-lg bg-lime px-6 py-3 text-sm font-semibold text-ink-950 transition-transform hover:scale-[1.03]"
            >
              {contact.email}
            </a>
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-11 rounded-lg border border-ink-700 px-6 py-3 text-sm font-semibold text-paper transition-colors hover:border-lime hover:text-lime"
            >
              LinkedIn
            </a>
            <a
              href={contact.cvHref}
              className="min-h-11 rounded-lg border border-ink-700 px-6 py-3 text-sm font-semibold text-paper transition-colors hover:border-lime hover:text-lime"
            >
              Tải CV (PDF)
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
