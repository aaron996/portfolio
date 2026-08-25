"use client";
import dynamic from "next/dynamic";

/* three + r3f không cần nằm trong chunk đầu tiên: hero vẫn đọc được khi
   canvas chưa tải. ssr: false vì WebGL không có trên server. */
const HeroLattice = dynamic(() => import("./HeroLattice").then((m) => m.HeroLattice), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-ink-900" />,
});

export function HeroLatticeCanvas() {
  return <HeroLattice />;
}
