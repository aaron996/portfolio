import type { FlowNode } from "@/content/types";

export function FlowDiagram({ nodes }: { nodes: FlowNode[] }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Luồng dữ liệu">
      {nodes.map((n, i) => (
        <li key={n.id} className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
          <span className="eyebrow text-lime">Bước {String(i + 1).padStart(2, "0")}</span>
          <p className="mt-2 font-display text-base font-bold uppercase text-paper">{n.label}</p>
          {n.sublabel ? <p className="mt-1 text-sm leading-relaxed text-mute">{n.sublabel}</p> : null}
        </li>
      ))}
    </ol>
  );
}
