import { content } from "@/content/content.vi";

export function Footer() {
  return (
    <footer className="border-t border-ink-800 bg-ink-950">
      <div className="control-shell flex flex-wrap items-center justify-between gap-4 py-6">
        <p className="text-xs text-mute-3">
          {content.meta.name} - {content.meta.roleLabel}, TP.HCM
        </p>
        <div className="flex items-center gap-5">
          <a href={`mailto:${content.contact.email}`} className="text-xs text-mute-2 transition-colors hover:text-lime">
            Email
          </a>
          <a href={content.contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs text-mute-2 transition-colors hover:text-lime">
            LinkedIn
          </a>
          <a href="#main" className="text-xs text-mute-2 transition-colors hover:text-lime">
            Lên đầu trang ↑
          </a>
          <span className="text-xs text-mute-3">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
