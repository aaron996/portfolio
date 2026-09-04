"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { content } from "@/content/content.vi";
import {
  createGame,
  type GameInstance,
  type GameKey,
  type GameStatus,
  type PickupInfo,
} from "./engine";

const { game } = content;
const ALL_SKILLS = game.maps.flatMap((m) => m.skills);

type Phase = "title" | "play" | "clear" | "end";

/** Thẻ giải nghĩa vật phẩm nằm trên màn hình bao lâu rồi tự tắt */
const PICKUP_CARD_MS = 5200;

export function OpsGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameInstance | null>(null);
  const pickupTimer = useRef<number | null>(null);

  const [phase, setPhase] = useState<Phase>("title");
  const [mapIndex, setMapIndex] = useState(0);
  const [got, setGot] = useState<string[]>([]);
  const [lastClear, setLastClear] = useState<{ index: number; skills: string[] } | null>(null);
  const [paused, setPaused] = useState(false);
  /** Ảnh chụp lúc bấm tạm dừng — bảng hướng dẫn đọc từ đây, không đọc mỗi khung hình */
  const [status, setStatus] = useState<GameStatus | null>(null);
  const [pickup, setPickup] = useState<PickupInfo | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const instance = createGame(
      canvas,
      game.maps,
      {
        bossAppear: game.bossAppear,
        deathLine: game.deathLine,
        pickupTool: game.pickupTool,
        pickupHeal: game.pickupHeal,
        pauseHint: game.pauseHint,
      },
      {
        onMap: (i) => setMapIndex(i),
        onCleared: (i, skills) => {
          setGot((prev) => [...prev, ...skills.filter((s) => !prev.includes(s))]);
          setLastClear({ index: i, skills });
          // Đợi hiệu ứng nổ và màn tối chạy xong rồi mới đưa bảng tổng kết lên
          window.setTimeout(() => {
            setPhase(i + 1 >= game.maps.length ? "end" : "clear");
          }, 900);
        },
        onPause: (next) => {
          setPaused(next);
          if (next) setStatus(gameRef.current?.status() ?? null);
        },
        onPickup: (info) => {
          setPickup(info);
          if (pickupTimer.current) window.clearTimeout(pickupTimer.current);
          pickupTimer.current = window.setTimeout(() => setPickup(null), PICKUP_CARD_MS);
        },
      }
    );
    gameRef.current = instance;
    return () => {
      if (pickupTimer.current) window.clearTimeout(pickupTimer.current);
      instance.destroy();
      gameRef.current = null;
    };
  }, []);

  /** Vào màn chơi: dùng chung cho bắt đầu, qua ải, chơi lại */
  const enterPlay = useCallback((index?: number) => {
    setPickup(null);
    setPaused(false);
    if (index != null) gameRef.current?.loadMap(index);
    setPhase("play");
    gameRef.current?.resume();
  }, []);

  const start = useCallback(() => enterPlay(), [enterPlay]);
  const next = useCallback(
    () => enterPlay((lastClear?.index ?? mapIndex) + 1),
    [enterPlay, lastClear, mapIndex]
  );
  const restartAll = useCallback(() => {
    setGot([]);
    setLastClear(null);
    enterPlay(0);
  }, [enterPlay]);
  const restartMap = useCallback(() => enterPlay(mapIndex), [enterPlay, mapIndex]);
  const togglePause = useCallback(() => gameRef.current?.togglePause(), []);

  // Nút ảo cho điện thoại — giữ nút thì nhân vật chạy, thả thì dừng
  const padProps = (key: GameKey) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      gameRef.current?.press(key);
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault();
      gameRef.current?.release(key);
    },
    onPointerLeave: () => gameRef.current?.release(key),
    onPointerCancel: () => gameRef.current?.release(key),
  });

  const map = game.maps[mapIndex];
  const pause = game.pause;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="relative overflow-hidden rounded-2xl border border-ink-700 bg-ink-900">
        {/* Thanh trạng thái: đang ở ải nào, đã nhặt được kỹ năng gì */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-800 px-4 py-3">
          <div>
            <p className="font-display text-lg font-bold uppercase tracking-tight text-paper">
              {map.name}
            </p>
            <p className="text-[11px] tracking-wide text-mute-3">
              Ải {mapIndex + 1}/{game.maps.length} · {map.year} · {map.place}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ul className="flex flex-wrap justify-end gap-1.5" aria-label={game.skillsLabel}>
              {ALL_SKILLS.map((s) => {
                const owned = got.includes(s);
                return (
                  <li
                    key={s}
                    className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                      owned
                        ? "border-lime bg-lime/10 text-lime"
                        : "border-ink-700 text-mute-3"
                    }`}
                  >
                    {s}
                  </li>
                );
              })}
            </ul>
            {phase === "play" ? (
              <button
                type="button"
                onClick={togglePause}
                aria-label={paused ? pause.resumeLabel : pause.heading}
                className="shrink-0 rounded-lg border border-ink-700 px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wide text-mute transition-colors hover:border-lime hover:text-lime"
              >
                {paused ? "▶" : "❚❚"}
              </button>
            ) : null}
          </div>
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={420}
            className="block h-auto w-full touch-none"
            aria-label={`Màn chơi ${map.name}`}
          />

          {/* Thẻ giải nghĩa vật phẩm vừa nhặt */}
          {pickup && phase === "play" && !paused ? (
            <div
              className="pickup-card absolute bottom-3 left-3 right-3 max-w-sm rounded-xl border border-ink-700 bg-ink-950/92 p-3 backdrop-blur-sm sm:right-auto"
              role="status"
            >
              <p
                className={`font-display text-[10px] font-bold uppercase tracking-widest ${
                  pickup.kind === "tool" ? "text-lime" : "text-[#ff8f85]"
                }`}
              >
                {game.pickupKindLabel[pickup.kind]}
              </p>
              <p className="mt-1 font-display text-sm font-bold text-paper">{pickup.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-mute">{pickup.desc}</p>
            </div>
          ) : null}

          {phase !== "play" ? (
            <div className="absolute inset-0 grid place-items-center bg-ink-950/85 px-5 text-center">
              <div className="max-w-sm">
                {phase === "title" ? (
                  <>
                    <h2 className="display text-3xl text-paper">{game.heading}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-mute">{game.intro}</p>
                    <button
                      type="button"
                      onClick={start}
                      className="mt-6 rounded-lg bg-lime px-7 py-3 font-display text-sm font-bold uppercase tracking-wide text-ink-950 transition-transform hover:scale-[1.04]"
                    >
                      {game.startLabel}
                    </button>
                    <p className="mt-4 text-xs text-mute-3">{game.controlsHint}</p>
                  </>
                ) : null}

                {phase === "clear" && lastClear ? (
                  <>
                    <h2 className="display text-3xl text-paper">
                      {game.clearHeading.replace("{n}", String(lastClear.index + 1))}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-mute">
                      {game.maps[lastClear.index].line}
                    </p>
                    <ul className="mt-4 flex flex-wrap justify-center gap-2">
                      {lastClear.skills.map((s) => (
                        <li
                          key={s}
                          className="rounded-full border border-lime bg-lime/10 px-3 py-1.5 text-xs font-semibold text-lime"
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={next}
                      className="mt-6 rounded-lg bg-lime px-7 py-3 font-display text-sm font-bold uppercase tracking-wide text-ink-950 transition-transform hover:scale-[1.04]"
                    >
                      {game.nextLabel.replace("{n}", String(lastClear.index + 2))}
                    </button>
                  </>
                ) : null}

                {phase === "end" ? (
                  <>
                    <h2 className="display text-3xl text-paper">{game.finish.heading}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-mute">{game.finish.body}</p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                      <Link
                        href="/#featured"
                        className="rounded-lg bg-lime px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-ink-950 transition-transform hover:scale-[1.04]"
                      >
                        {game.finish.cta}
                      </Link>
                      <button
                        type="button"
                        onClick={restartAll}
                        className="rounded-lg border border-ink-700 px-6 py-3 text-sm text-mute transition-colors hover:border-mute-3 hover:text-paper"
                      >
                        Chơi lại từ ải 1
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        {/* Bảng tạm dừng: hướng dẫn điều khiển + mục tiêu ải hiện tại */}
        {phase === "play" && paused ? (
          <div className="absolute inset-0 overflow-y-auto bg-ink-950/85 p-3 sm:p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="display text-xl text-paper sm:text-2xl">{pause.heading}</h2>
              <p className="text-[11px] tracking-wide text-mute-3">
                Ải {mapIndex + 1} · {map.name}
              </p>
            </div>

            {/* Hai cột để cả bảng vừa trong khung game, không phải cuộn mới thấy nút */}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-ink-700 bg-ink-900/70 p-3">
                <p className="font-display text-[10px] font-bold uppercase tracking-widest text-lime">
                  {pause.objectiveHeading}
                </p>
                <p className="mt-1.5 text-[13px] leading-snug text-paper">{map.objective}</p>
                {status ? (
                  <p className="mt-2 text-[11px] leading-snug text-mute-2">
                    {status.bossAlive || status.mobsLeft === 0
                      ? pause.progressBoss
                      : pause.progressMobs
                          .replace("{left}", String(status.mobsLeft))
                          .replace("{total}", String(status.mobsTotal))}
                  </p>
                ) : null}
                <p className="mt-2 border-t border-ink-800 pt-2 text-[11px] leading-snug text-mute">
                  <span className="font-semibold text-mute-2">{pause.tipHeading}: </span>
                  {map.tip}
                </p>
              </div>

              {/* Màn hình hẹp: cả thẻ game chỉ cao khoảng 290px, nhồi thêm bảng
                  phím vào là phải cuộn mới thấy nút. Ở đó chơi bằng nút ảo nên
                  bảng phím không cần thiết — thay bằng một dòng. */}
              <p className="text-[11px] leading-snug text-mute sm:hidden">
                {pause.mobileControls}
              </p>

              <div className="hidden sm:block">
                <p className="font-display text-[10px] font-bold uppercase tracking-widest text-mute-3">
                  {pause.controlsHeading}
                </p>
                <ul className="mt-1.5 divide-y divide-ink-800 rounded-xl border border-ink-800">
                  {pause.controls.map((c) => (
                    <li key={c.keys} className="px-2.5 py-1.5">
                      <span className="font-display text-[11px] font-bold tracking-wide text-lime">
                        {c.keys}
                      </span>
                      <span className="ml-2 text-[11px] leading-snug text-mute">{c.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={togglePause}
                className="rounded-lg bg-lime px-5 py-2 font-display text-xs font-bold uppercase tracking-wide text-ink-950 transition-transform hover:scale-[1.04]"
              >
                {pause.resumeLabel}
              </button>
              <button
                type="button"
                onClick={restartMap}
                className="rounded-lg border border-ink-700 px-4 py-2 text-xs text-mute transition-colors hover:border-mute-3 hover:text-paper"
              >
                {pause.restartLabel}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Nút ảo — chỉ hiện trên màn hình cảm ứng hoặc màn hình hẹp */}
      <div className="mt-3 flex items-center justify-between gap-3 md:hidden">
        <div className="flex gap-3">
          <button type="button" aria-label="Sang trái" {...padProps("left")} className={PAD}>
            ◀
          </button>
          <button type="button" aria-label="Sang phải" {...padProps("right")} className={PAD}>
            ▶
          </button>
        </div>
        <button
          type="button"
          aria-label={pause.heading}
          onClick={togglePause}
          className="grid h-11 w-11 shrink-0 touch-none select-none place-items-center rounded-xl border border-ink-700 bg-ink-850 text-sm text-mute active:border-lime active:text-lime"
        >
          {paused ? "▶" : "❚❚"}
        </button>
        <div className="flex gap-3">
          <button type="button" aria-label="Nhảy" {...padProps("jump")} className={PAD}>
            ▲
          </button>
          <button
            type="button"
            aria-label="Đánh"
            {...padProps("atk")}
            className="h-16 w-24 touch-none select-none rounded-2xl border-2 border-lime bg-lime font-display text-sm font-extrabold uppercase text-ink-950 active:scale-95"
          >
            Đánh
          </button>
        </div>
      </div>
    </div>
  );
}

const PAD =
  "grid h-16 w-16 touch-none select-none place-items-center rounded-2xl border-2 border-ink-700 bg-ink-850 font-display text-xl text-paper active:border-lime active:text-lime";
