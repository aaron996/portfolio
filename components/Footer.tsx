import { content } from "@/content/content.vi";

export function Footer() {
  return (
    <footer className="border-t border-ink-800 bg-ink-950">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 sm:px-8">
        <p className="text-xs text-mute-3">
          {content.meta.name} — {content.meta.roleLabel}
        </p>
        <div className="flex items-center gap-5">
          <span className="text-xs text-mute-3">Built with Next.js</span>
          <a href="#main" className="text-xs text-mute-2 transition-colors hover:text-lime">
            Lên đầu trang ↑
          </a>
          <span className="text-xs text-mute-3">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
