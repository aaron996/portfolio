"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { flushSync } from "react-dom";
import type { Player as PlayerType, PlayerRef } from "@remotion/player";
import type { CaseMotion } from "@/content/types";
import { content } from "@/content/content.vi";
import { PortfolioIcon } from "@/components/portfolio/PortfolioIcon";
import { music } from "@/components/music/music";
import { FILM_FPS as FPS, FILM_H as H, FILM_IDS, FILM_W as W } from "./films";

const L = content.casePage.film;

/* Phim hoạt hình đầu trang case (docs/case-motion.md). Nằm thu nhỏ cạnh tiêu đề: ban đầu chỉ là ảnh
   đứng + nút phát; mã phim (Remotion) tải ngầm khi khung sắp vào tầm nhìn để cú bấm phát được ngay,
   trình duyệt mới cho phát có tiếng. Bấm phát thì phim phóng to giữa màn hình; thu nhỏ (nút, Esc, bấm
   nền) thì về lại khung nhỏ và vẫn chạy tiếp.

   Phóng to là `showModal()` trên chính <dialog> chứa Player — lúc đóng, dialog được CSS cho hiện như
   một khối thường. Cùng một Player đi qua lại giữa hai chỗ nên không mất vị trí đang phát. Phim chạy
   thì nhạc nền "How Long" im, dừng hay hết phim thì nhạc chạy tiếp. */

type Film = { component: ComponentType; frames: number; Player: typeof PlayerType };

const FILMS: Record<string, () => Promise<Omit<Film, "Player">>> = {
  interdist: () => import("@/components/motion/interdist/InterdistFilm").then(m => ({ component: m.InterdistFilm, frames: m.INTERDIST_FILM_FRAMES })),
  opspulse: () => import("@/components/motion/opspulse/OpsPulseFilm").then(m => ({ component: m.OpsPulseFilm, frames: m.OPSPULSE_FILM_FRAMES })),
  cod: () => import("@/components/motion/cod/CodFilm").then(m => ({ component: m.CodFilm, frames: m.COD_FILM_FRAMES })),
  warehouse: () => import("@/components/motion/warehouse/WarehouseFilm").then(m => ({ component: m.WarehouseFilm, frames: m.WAREHOUSE_FILM_FRAMES })),
  shopee: () => import("@/components/motion/shopee/ShopeeFilm").then(m => ({ component: m.ShopeeFilm, frames: m.SHOPEE_FILM_FRAMES })),
};

/* Chuyển khung nhỏ ↔ lớn bằng View Transition nếu trình duyệt có và người xem không tắt chuyển động. */
function morph(update: () => void) {
  type Transition = { ready: Promise<void>; finished: Promise<void> };
  const doc = document as Document & { startViewTransition?: (cb: () => void) => Transition };
  if (!doc.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) return update();
  // Trình duyệt bỏ hiệu ứng (tab ẩn, bấm liên tục) vẫn chạy update; chỉ cần nuốt promise bị từ chối.
  const t = doc.startViewTransition(() => flushSync(update));
  t.ready.catch(() => {});
  t.finished.catch(() => {});
}

export function CaseFilm({ slug, motion }: { slug: string; motion: CaseMotion }) {
  const id = FILM_IDS[slug];
  const load = () => Promise.all([import("@remotion/player"), FILMS[id]()]).then(([p, f]): Film => ({ ...f, Player: p.Player }));
  const slotRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDialogElement>(null);
  const expandRef = useRef<HTMLButtonElement>(null);
  const minRef = useRef<HTMLButtonElement>(null);
  const playerRef = useRef<PlayerRef>(null);
  const [film, setFilm] = useState<Film | null>(null);
  const [started, setStarted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const pending = useRef(false);

  // Tải mã phim khi khung cách tầm nhìn chưa tới một màn hình.
  useEffect(() => {
    const slot = slotRef.current;
    if (!slot || film) return;
    let alive = true;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      load().then(f => { if (alive) setFilm(f); });
    }, { rootMargin: "100% 0px" });
    io.observe(slot);
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

  const expand = () => {
    const box = boxRef.current;
    if (!box || box.open) return;
    morph(() => { box.showModal(); minRef.current?.focus(); setExpanded(true); });
  };

  const minimize = () => {
    const box = boxRef.current;
    if (!box?.open) return;
    morph(() => { box.close(); setExpanded(false); });
  };

  // Thu nhỏ xong thì trả focus về nút phóng to ở khung nhỏ (nút cũ đã nằm trong dialog vừa đóng).
  const wasExpanded = useRef(false);
  useEffect(() => {
    if (wasExpanded.current && !expanded) expandRef.current?.focus({ preventScroll: true });
    wasExpanded.current = expanded;
  }, [expanded]);

  const start = () => {
    setStarted(true);
    expand();
    if (film && playerRef.current) playerRef.current.play();
    else { pending.current = true; load().then(setFilm); }
  };

  return <figure className="ca-film" aria-describedby={`film-${slug}`}>
    <div ref={slotRef} className="ca-film-slot">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="ca-film-under" src={`/motion/${id}-poster.jpg`} alt="" width={W} height={H} decoding="async" />

      <dialog ref={boxRef} className="ca-film-box" data-expanded={expanded || undefined} aria-label={L.kicker} aria-describedby={`film-${slug}`}
        onCancel={e => { e.preventDefault(); minimize(); }}
        onClick={e => { if (e.target === e.currentTarget) minimize(); }}>
        {/* Luôn có trong DOM (CSS ẩn lúc dialog đóng) để showModal() đưa focus vào đúng nút này. */}
        <button ref={minRef} type="button" className="ca-film-min" onClick={minimize}>
          <PortfolioIcon name="shrink" /><span>{L.minimize}</span>
        </button>
        <div className="ca-film-frame">
          {film && <film.Player ref={playerRef} component={film.component} durationInFrames={film.frames} fps={FPS}
            compositionWidth={W} compositionHeight={H} controls={started} clickToPlay={started}
            spaceKeyToPlayOrPause={expanded} acknowledgeRemotionLicense style={{ width: "100%", height: "100%" }}
            // Khung nhỏ: nút phóng to của trang thay chỗ nút toàn màn hình (một nút duy nhất ở góc phải
            // thanh điều khiển). Phóng to rồi thì trả lại nút toàn màn hình thật — cần cho điện thoại xoay ngang.
            allowFullscreen={expanded}
            renderCustomControls={expanded ? undefined : () => <button ref={expandRef} type="button" className="ca-film-grow"
              onClick={expand} aria-label={L.expand} title={L.expand}><PortfolioIcon name="expand" /></button>} />}
          {(!started || !film) && <button type="button" className="ca-film-poster" onClick={start} aria-label={motion.play}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/motion/${id}-poster.jpg`} alt="" width={W} height={H} decoding="async" />
            <span className="ca-film-kicker" aria-hidden="true">{L.kicker}</span>
            <span className="ca-film-play" aria-hidden="true"><PortfolioIcon name="play" /></span>
            <span className="ca-film-time">{motion.play}</span>
          </button>}
        </div>
      </dialog>
    </div>
    <figcaption id={`film-${slug}`} className="ca-film-desc">{motion.aria}</figcaption>
  </figure>;
}
