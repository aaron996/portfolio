"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { content } from "@/content/content.vi";
import { createGame, type GameInstance, type GameKey } from "./engine";

const { game } = content;
const ALL_SKILLS = game.maps.flatMap((m) => m.skills);

type Phase = "title" | "play" | "clear" | "end";

export function OpsGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameInstance | null>(null);

  const [phase, setPhase] = useState<Phase>("title");
  const [mapIndex, setMapIndex] = useState(0);
  const [got, setGot] = useState<string[]>([]);
  const [lastClear, setLastClear] = useState<{ index: number; skills: string[] } | null>(null);

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
      }
    );
    gameRef.current = instance;
    return () => {
      instance.destroy();
      gameRef.current = null;
    };
  }, []);

  const start = useCallback(() => {
    setPhase("play");
    gameRef.current?.resume();
  }, []);

  const next = useCallback(() => {
    const i = (lastClear?.index ?? mapIndex) + 1;
    gameRef.current?.loadMap(i);
    setPhase("play");
    gameRef.current?.resume();
  }, [lastClear, mapIndex]);

  const restart = useCallback(() => {
    setGot([]);
    setLastClear(null);
    gameRef.current?.loadMap(0);
    setPhase("play");
    gameRef.current?.resume();
  }, []);

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

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="overflow-hidden rounded-2xl border border-ink-700 bg-ink-900">
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
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={420}
            className="block h-auto w-full touch-none"
            aria-label={`Màn chơi ${map.name}`}
          />

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
                        onClick={restart}
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
      </div>

      {/* Nút ảo — chỉ hiện trên màn hình cảm ứng hoặc màn hình hẹp */}
      <div className="mt-3 flex justify-between gap-3 md:hidden">
        <div className="flex gap-3">
          <button type="button" aria-label="Sang trái" {...padProps("left")} className={PAD}>
            ◀
          </button>
          <button type="button" aria-label="Sang phải" {...padProps("right")} className={PAD}>
            ▶
          </button>
        </div>
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
