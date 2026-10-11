"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import type { Player as PlayerType, PlayerRef } from "@remotion/player";
import type { CaseMotion } from "@/content/types";
import { PortfolioIcon } from "@/components/portfolio/PortfolioIcon";
import { music } from "@/components/music/music";
import { FILM_FPS as FPS, FILM_H as H, FILM_IDS, FILM_W as W } from "./films";


/* Phim hoạt hình đầu trang case (docs/case-motion.md). Ban đầu chỉ là ảnh đứng + nút phát; mã phim
   (Remotion) tải ngầm khi khung sắp vào tầm nhìn để cú bấm phát được ngay, trình duyệt mới cho phát
   có tiếng. Phim chạy thì nhạc nền "How Long" im, dừng hay hết phim thì nhạc chạy tiếp. */

type Film = { component: ComponentType; frames: number; Player: typeof PlayerType };

const FILMS: Record<string, () => Promise<Omit<Film, "Player">>> = {
  interdist: () => import("@/components/motion/interdist/InterdistFilm").then(m => ({ component: m.InterdistFilm, frames: m.INTERDIST_FILM_FRAMES })),
  opspulse: () => import("@/components/motion/opspulse/OpsPulseFilm").then(m => ({ component: m.OpsPulseFilm, frames: m.OPSPULSE_FILM_FRAMES })),
  cod: () => import("@/components/motion/cod/CodFilm").then(m => ({ component: m.CodFilm, frames: m.COD_FILM_FRAMES })),
  warehouse: () => import("@/components/motion/warehouse/WarehouseFilm").then(m => ({ component: m.WarehouseFilm, frames: m.WAREHOUSE_FILM_FRAMES })),
  shopee: () => import("@/components/motion/shopee/ShopeeFilm").then(m => ({ component: m.ShopeeFilm, frames: m.SHOPEE_FILM_FRAMES })),
};

export function CaseFilm({ slug, motion }: { slug: string; motion: CaseMotion }) {
  const id = FILM_IDS[slug];
  const load = () => Promise.all([import("@remotion/player"), FILMS[id]()]).then(([p, f]): Film => ({ ...f, Player: p.Player }));
  const boxRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerRef>(null);
  const [film, setFilm] = useState<Film | null>(null);
  const [started, setStarted] = useState(false);
  const pending = useRef(false);

  // Tải mã phim khi khung cách tầm nhìn chưa tới một màn hình.
  useEffect(() => {
    const box = boxRef.current;
    if (!box || film) return;
    let alive = true;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      load().then(f => { if (alive) setFilm(f); });
    }, { rootMargin: "100% 0px" });
    io.observe(box);
    return () => { alive = false; io.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, film]);

  // Phim phát thì giữ nhạc nền im.
  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;
    const on = () => music.hold("case-film", true);
    const off = () => music.hold("case-film", false);
    p.addEventListener("play", on);
    p.addEventListener("pause", off);
    p.addEventListener("ended", off);
    return () => {
      p.removeEventListener("play", on);
      p.removeEventListener("pause", off);
      p.removeEventListener("ended", off);
      off();
    };
  }, [film]);

  // Bấm trước khi mã phim tải xong: phát ngay khi xong (trình duyệt có thể chặn tiếng lần này).
  useEffect(() => {
    if (film && pending.current) { pending.current = false; playerRef.current?.play(); }
  }, [film]);

  const start = () => {
    setStarted(true);
    if (film && playerRef.current) playerRef.current.play();
    else { pending.current = true; load().then(setFilm); }
  };

  return <figure className="ca-film" aria-describedby={`film-${slug}`}>
    <div ref={boxRef} className="ca-film-frame">
      {film && <film.Player ref={playerRef} component={film.component} durationInFrames={film.frames} fps={FPS}
        compositionWidth={W} compositionHeight={H} controls={started} clickToPlay={started}
        spaceKeyToPlayOrPause={started} acknowledgeRemotionLicense style={{ width: "100%", height: "100%" }} />}
      {(!started || !film) && <button type="button" className="ca-film-poster" onClick={start} aria-label={motion.play}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/motion/${id}-poster.jpg`} alt="" width={W} height={H} decoding="async" />
        <span className="ca-film-play" aria-hidden="true"><PortfolioIcon name="play" /></span>
        <span className="ca-film-time">{motion.play}</span>
      </button>}
    </div>
    <figcaption id={`film-${slug}`} className="ca-film-desc">{motion.aria}</figcaption>
  </figure>;
}
