import { content } from "@/content/content.vi";
import { Reveal } from "./ui/Reveal";
import { Magnetic } from "./ui/Magnetic";

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
      <div className="control-shell relative py-24 md:py-32">
        <Reveal>
          <p className="eyebrow text-lime">{contact.availability}</p>
          <h2 className="display mt-6 text-[clamp(2.2rem,7vw,4.5rem)]">{contact.heading}</h2>
          <p className="prose-lede mt-6 text-mute md:text-lg">{contact.body}</p>

          <div className="mt-10 flex flex-wrap items-center gap-3.5">
            <Magnetic>
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full bg-lime px-7 py-3.5 text-sm font-semibold text-ink-950"
              >
                {contact.email}
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href={contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full border border-ink-700 px-7 py-3.5 text-sm font-semibold text-paper transition-colors hover:border-lime hover:text-lime"
              >
                LinkedIn
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href={contact.cvHref}
                className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full border border-ink-700 px-7 py-3.5 text-sm font-semibold text-paper transition-colors hover:border-lime hover:text-lime"
              >
                Tải CV (PDF)
              </a>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
