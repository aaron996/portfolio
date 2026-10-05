type IconName = "external" | "forward" | "back" | "up" | "close" | "plus" | "play" | "replay" | "mail" | "linkedin" | "pdf" | "chevron";

const paths: Record<IconName, string> = {
  external: "M5 15 15 5M5 5h10v10",
  forward: "M5 5 15 15M5 15h10V5",
  back: "M16 10H4m6-6-6 6 6 6",
  up: "M10 16V4m-6 6 6-6 6 6",
  close: "m5 5 10 10M15 5 5 15",
  plus: "M10 4v12M4 10h12",
  play: "m7 4 9 6-9 6V4Z",
  replay: "M4 9a6 6 0 1 1 1.5 5M4 4v5h5",
  mail: "M3 5h14v10H3zM3 6l7 5 7-5",
  linkedin: "M4 8v8M4 5v.1M8 16V8m0 3a3 3 0 0 1 6 0v5",
  pdf: "M5 2h7l3 3v13H5zM12 2v4h3M7 10h6M7 13h6",
  chevron: "m5 7 5 5 5-5",
};

export function PortfolioIcon({ name = "external" }: { name?: IconName }) {
  return <svg className="pf-icon" width="18" height="18" viewBox="0 0 20 20" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d={paths[name]} />
  </svg>;
}
