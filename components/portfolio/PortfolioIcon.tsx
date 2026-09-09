type IconName = "external" | "forward" | "back" | "up" | "close" | "plus";

const paths: Record<IconName, string> = {
  external: "M5 15 15 5M5 5h10v10",
  forward: "M5 5 15 15M5 15h10V5",
  back: "M16 10H4m6-6-6 6 6 6",
  up: "M10 16V4m-6 6 6-6 6 6",
  close: "m5 5 10 10M15 5 5 15",
  plus: "M10 4v12M4 10h12",
};

export function PortfolioIcon({ name = "external" }: { name?: IconName }) {
  return <svg className="pf-icon" width="18" height="18" viewBox="0 0 20 20" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d={paths[name]} />
  </svg>;
}
