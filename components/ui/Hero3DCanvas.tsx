"use client";
import dynamic from "next/dynamic";

const Hero3D = dynamic(() => import("./Hero3D").then((m) => m.Hero3D), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-ink-800" />,
});

export function Hero3DCanvas() {
  return <Hero3D />;
}
