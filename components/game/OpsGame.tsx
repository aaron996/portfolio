"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { GameBoard } from "./GameBoard";
import { GameHud } from "./GameHud";
import styles from "./OpsGame.module.css";
import { content } from "@/content/content.vi";
import {
  createGame,
  type GameInstance,
  type GameKey,
  type GameStatus,
  type PauseReason,
  type PickupInfo,
} from "./engine";

const { game } = content;
const ALL_SKILLS = game.maps.flatMap((m) => m.skills);

type Phase = "title" | "play" | "clear" | "end";

/** Thẻ giải nghĩa vật phẩm nằm trên màn hình bao lâu rồi tự tắt */
const PICKUP_CARD_MS = 5200;

/**
 * Lựa chọn "đừng dừng game khi nhặt vật phẩm nữa" lưu ngay trên máy người
 * chơi. Không phải thiết lập tài khoản, không đáng gửi đi đâu cả — mà bỏ vào
 * localStorage thì lần sau mở lại trang vẫn còn.
 */
const PAUSE_ON_PICKUP_KEY = "opsgame:pause-on-pickup";

function readPauseOnPickup() {
  try {
    return localStorage.getItem(PAUSE_ON_PICKUP_KEY) !== "0";
  } catch {
    // Trình duyệt chặn lưu trữ (chế độ riêng tư, cookie bị khoá) — cứ dừng
    return true;
  }
}

export function OpsGame() {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [touchMode, setTouchMode] = useState<"auto" | "on" | "off">("auto");
  const [autoTouch, setAutoTouch] = useState(false);
  const showTouch = touchMode === "on" || (touchMode === "auto" && autoTouch);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameInstance | null>(null);
  const pickupTimer = useRef<number | null>(null);
  const clearTimer = useRef<number | null>(null);
  /** Engine đọc cờ này qua setPauseOnPickup; ref để handler không bị đóng băng giá trị cũ */
  const pauseOnPickupRef = useRef(true);

  const [phase, setPhase] = useState<Phase>("title");
  const [mapIndex, setMapIndex] = useState(0);
  const [got, setGot] = useState<string[]>([]);
  const [lastClear, setLastClear] = useState<{ index: number; skills: string[] } | null>(null);
  const [paused, setPaused] = useState(false);
  const [pauseWhy, setPauseWhy] = useState<PauseReason>("manual");
  const [pauseOnPickup, setPauseOnPickupState] = useState(true);
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
        pickupGun: game.pickupGun,
        noAmmo: game.noAmmo,
        parryLine: game.parryLine,
        reflectLine: game.reflectLine,
        volleyHint: game.volleyHint,
        guardBreakLine: game.guardBreakLine,
        pauseHint: game.pauseHint,
      },
      {
        onMap: (i) => setMapIndex(i),
        onCleared: (i, skills) => {
          setGot((prev) => [...prev, ...skills.filter((s) => !prev.includes(s))]);
          setLastClear({ index: i, skills });
          // Đợi hiệu ứng nổ và màn tối chạy xong rồi mới đưa bảng tổng kết lên
          clearTimer.current = window.setTimeout(() => {
            setPhase(i + 1 >= game.maps.length ? "end" : "clear");
          }, 900);
        },
        onPause: (next, reason) => {
          setPaused(next);
          setPauseWhy(reason);
          if (next) setStatus(gameRef.current?.status() ?? null);
          // Đọc xong thì thẻ vật phẩm đi cùng bảng đó cũng biến mất theo
          else if (reason === "pickup") setPickup(null);
        },
        onPickup: (info) => {
          setPickup(info);
          if (pickupTimer.current) window.clearTimeout(pickupTimer.current);
          // Khi game dừng hẳn để đọc thì thẻ không được tự tắt — người chơi
          // đóng bảng lúc nào là xong lúc đó.
          if (!pauseOnPickupRef.current) {
            pickupTimer.current = window.setTimeout(() => setPickup(null), PICKUP_CARD_MS);
          }
        },
      }
    );
    gameRef.current = instance;
    instance.setExternalHud(true);
    const saved = readPauseOnPickup();
    pauseOnPickupRef.current = saved;
    setPauseOnPickupState(saved);
    instance.setPauseOnPickup(saved);
    return () => {
      if (pickupTimer.current) window.clearTimeout(pickupTimer.current);
      if (clearTimer.current) window.clearTimeout(clearTimer.current);
      instance.destroy();
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(any-pointer: coarse), (max-width: 767px)");
    const update = () => setAutoTouch(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    surfaceRef.current?.focus({ preventScroll: true });
    const trapTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const root = surfaceRef.current;
      if (!root || root.querySelector('[role="dialog"]')) return;
      const controls = Array.from(root.querySelectorAll<HTMLElement>("button, select, a[href]"))
        .filter((item) => !item.closest("[inert]") && !item.hasAttribute("disabled") && item.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first) return;
      if (event.shiftKey && (document.activeElement === first || document.activeElement === root)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === root)) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", trapTab);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", trapTab);
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [expanded]);

  const toggleExpanded = () => {
    if (expanded) gameRef.current?.pause();
    setExpanded((value) => !value);
  };

  /** Vào màn chơi: dùng chung cho bắt đầu, qua ải, chơi lại */
  const enterPlay = useCallback((index?: number) => {
    if (clearTimer.current) window.clearTimeout(clearTimer.current);
    if (pickupTimer.current) window.clearTimeout(pickupTimer.current);
    setPickup(null);
    setPaused(false);
    if (index != null) gameRef.current?.loadMap(index);
    setPhase("play");
    gameRef.current?.resume();
  }, []);

  const start = useCallback(() => {
    if (window.matchMedia("(any-pointer: coarse), (max-width: 767px)").matches) setExpanded(true);
    enterPlay();
  }, [enterPlay]);
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
  const toggleBag = useCallback(() => gameRef.current?.toggleInventory(), []);

  /** Tích "đừng dừng nữa": ghi vào máy, báo xuống engine ngay trong ván này */
  const setPauseOnPickup = useCallback((on: boolean) => {
    pauseOnPickupRef.current = on;
    setPauseOnPickupState(on);
    gameRef.current?.setPauseOnPickup(on);
    try {
      localStorage.setItem(PAUSE_ON_PICKUP_KEY, on ? "1" : "0");
    } catch {
      // Không lưu được thì thôi, lựa chọn vẫn có hiệu lực trong phiên này
    }
  }, []);

  // Nút ảo cho điện thoại — giữ nút thì nhân vật chạy, thả thì dừng
  const padProps = (key: GameKey) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      gameRef.current?.press(key);
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault();
      gameRef.current?.release(key);
    },
    onLostPointerCapture: () => gameRef.current?.release(key),
    onPointerCancel: () => gameRef.current?.release(key),
  });

  const map = game.maps[mapIndex];
  const pause = game.pause;
  const bag = game.inventory;
  const panel = game.pickupPanel;

  return (
    <div ref={surfaceRef} tabIndex={-1} aria-label={game.heading}
      className={`${styles.surface} ${expanded ? styles.expanded : ""} ${showTouch ? styles.withTouch : ""} mx-auto w-full max-w-4xl`}>
      <div className={styles.toolbar}>
        <div className={styles.mapTitle}>
          <p>{map.name}</p>
          <span>{mapIndex + 1}/{game.maps.length} · {map.year} · {map.place}</span>
        </div>
        <div className={styles.actions}>
          {phase === "play" ? <>
            <button type="button" onClick={toggleBag} disabled={paused} aria-label={bag.heading}>{bag.heading}</button>
            <button type="button" onClick={togglePause} aria-label={paused ? pause.resumeLabel : pause.heading}>
              {paused ? pause.resumeLabel : pause.heading}
            </button>
          </> : null}
          <button type="button" onClick={toggleExpanded} aria-pressed={expanded}>
            {expanded ? game.display.collapse : game.display.expand}
          </button>
        </div>
      </div>
      <div className={`${styles.frame} ${paused ? styles.reading : ""} relative overflow-hidden rounded-2xl border border-ink-700 bg-ink-900`}>
        {phase === "play" ? <GameHud instanceRef={gameRef} touch={showTouch} /> : null}
        <div className={`${styles.stage} ${phase !== "play" ? styles.instructions : ""} relative`}>
          <canvas
            ref={canvasRef}
            width={800}
            height={420}
            className={styles.canvas}
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
                  PICKUP_ACCENT[pickup.kind]
                }`}
              >
                {game.pickupKindLabel[pickup.kind]}
              </p>
              <p className="mt-1 font-display text-sm font-bold text-paper">{pickup.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-mute">{pickup.desc}</p>
            </div>
          ) : null}

          {phase !== "play" ? (
            <GameBoard label={phase === "title" ? game.heading : phase === "end" ? game.finish.heading : game.clearHeading.replace("{n}", String((lastClear?.index ?? 0) + 1))} centered>
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
                    <p className="mt-4 text-xs text-mute-3">{showTouch ? pause.mobileControls : game.controlsHint}</p>
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
                        href="/#cases"
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
            </GameBoard>
          ) : null}
        </div>

        {/* Bảng vật phẩm vừa nhặt — game dừng hẳn cho tới khi đọc xong */}
        {phase === "play" && paused && pauseWhy === "pickup" && pickup ? (
          <GameBoard label={panel.heading} supply centered>
            <div
              className="w-full max-w-md py-4"
            >
              <p className="font-display text-[10px] font-bold uppercase tracking-widest text-mute-3">
                {panel.heading}
              </p>
              <p
                className={`mt-2 font-display text-[10px] font-bold uppercase tracking-widest ${
                  PICKUP_ACCENT[pickup.kind]
                }`}
              >
                {game.pickupKindLabel[pickup.kind]}
              </p>
              <p className="mt-1 font-display text-xl font-bold text-paper">{pickup.name}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-mute">{pickup.desc}</p>

              <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[12px] leading-snug text-mute-2">
                <input
                  type="checkbox"
                  checked={!pauseOnPickup}
                  onChange={(e) => setPauseOnPickup(!e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-lime"
                />
                {panel.dontPauseLabel}
              </label>
              <p className="mt-1.5 text-[11px] leading-snug text-mute-3">{panel.inventoryHint}</p>

              <button
                type="button"
                onClick={togglePause}
                className="mt-4 w-full rounded-lg bg-lime px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wide text-ink-950 transition-transform hover:scale-[1.02]"
              >
                {panel.resumeLabel}
              </button>
            </div>
          </GameBoard>
        ) : null}

        {/* Túi đồ — mở bằng B hoặc nút 🎒, đọc từ ảnh chụp lúc dừng */}
        {phase === "play" && paused && pauseWhy === "inventory" ? (
          <GameBoard label={bag.heading} supply actions={
            <button type="button" onClick={toggleBag}
              className="rounded-lg bg-lime px-5 py-2 font-display text-xs font-bold uppercase tracking-wide text-ink-950">
              {bag.closeLabel}
            </button>
          }>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="display text-xl text-paper sm:text-2xl">{bag.heading}</h2>
              <p className="text-[11px] tracking-wide text-mute-3">
                Ải {mapIndex + 1} · {map.name}
              </p>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <StatRow label={bag.hpLabel} value={status ? `${status.hp}/${status.mhp}` : "—"} />
              <StatRow
                label={bag.guardLabel}
                value={status ? `${Math.round(status.guard * 100)}%` : "—"}
              />
              <StatRow
                label={bag.toolLabel}
                value={
                  status?.toolName
                    ? `${status.toolName} · ${bag.toolLeft.replace(
                        "{n}",
                        String(Math.ceil(status.toolLeft))
                      )}`
                    : bag.noneLabel
                }
                accent={status?.toolName ? "tool" : undefined}
              />
              <StatRow
                label={bag.gunLabel}
                value={
                  status?.gunName
                    ? `${status.gunName} · ${bag.ammoLeft.replace("{n}", String(status.ammo))}`
                    : bag.noneLabel
                }
                accent={status?.gunName ? "gun" : undefined}
              />
            </div>

            <p className="mt-4 font-display text-[10px] font-bold uppercase tracking-widest text-mute-3">
              {bag.itemsHeading}
            </p>
            {status && status.items.length ? (
              <ul className="mt-1.5 space-y-1.5">
                {status.items.map((it, i) => (
                  <li
                    key={`${it.name}-${i}`}
                    className="rounded-xl border border-ink-800 bg-ink-900/70 px-3 py-2"
                  >
                    <span
                      className={`font-display text-[10px] font-bold uppercase tracking-widest ${
                        PICKUP_ACCENT[it.kind]
                      }`}
                    >
                      {game.pickupKindLabel[it.kind]}
                    </span>
                    <p className="font-display text-[13px] font-bold text-paper">{it.name}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-mute">{it.desc}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5 text-[12px] text-mute">{bag.emptyLabel}</p>
            )}

          </GameBoard>
        ) : null}

        {/* Bảng tạm dừng: hướng dẫn điều khiển + mục tiêu ải hiện tại */}
        {phase === "play" && paused && pauseWhy === "manual" ? (
          <GameBoard label={pause.heading} actions={
            <div className="flex flex-wrap gap-2.5">
              <button type="button" onClick={togglePause}
                className="rounded-lg bg-lime px-5 py-2 font-display text-xs font-bold uppercase tracking-wide text-ink-950">
                {pause.resumeLabel}
              </button>
              <button type="button" onClick={restartMap}
                className="rounded-lg border border-ink-700 px-4 py-2 text-xs text-mute">
                {pause.restartLabel}
              </button>
            </div>
          }>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="display text-xl text-paper sm:text-2xl">{pause.heading}</h2>
              <p className="text-[11px] tracking-wide text-mute-3">
                Ải {mapIndex + 1} · {map.name}
              </p>
            </div>

            {/* Hai cột để cả bảng vừa trong khung game, không phải cuộn mới thấy nút */}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="py-2 pr-2">
                <p className="font-display text-sm font-bold text-lime">
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
                  {showTouch ? map.tip.replaceAll("bấm L", "bấm ĐỠ").replaceAll("giữ L", "giữ ĐỠ").replaceAll("bấm K", "bấm BẮN") : map.tip}
                </p>
                {map.mobs.some((mob) => mob.kind === "rider" || mob.kind === "charger") && (
                  <p className="mt-2 text-[11px] leading-snug text-mute">{game.rushHint}</p>
                )}
              </div>

              {/* Màn hình hẹp: cả thẻ game chỉ cao khoảng 290px, nhồi thêm bảng
                  phím vào là phải cuộn mới thấy nút. Ở đó chơi bằng nút ảo nên
                  bảng phím không cần thiết — thay bằng một dòng. */}
              <p className="text-[11px] leading-snug text-mute" hidden={!showTouch}>
                {pause.mobileControls}
              </p>

              <div hidden={showTouch}>
                <p className="font-display text-[10px] font-bold uppercase tracking-widest text-mute-3">
                  {pause.controlsHeading}
                </p>
                <ul className="mt-1.5 divide-y divide-ink-800">
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

          </GameBoard>
        ) : null}
      </div>

      <div className={styles.touchSettings}>
        <label>
          {game.display.touchLabel}
          <select value={touchMode} onChange={(event) => {
            (["left", "right", "jump", "down", "guard", "atk", "shoot"] as GameKey[])
              .forEach((key) => gameRef.current?.release(key));
            setTouchMode(event.target.value as "auto" | "on" | "off");
          }}>
            <option value="auto">{game.display.touchAuto}</option>
            <option value="on">{game.display.touchOn}</option>
            <option value="off">{game.display.touchOff}</option>
          </select>
        </label>
        <span>{game.skillProgress.replace("{n}", String(got.length)).replace("{total}", String(ALL_SKILLS.length))}</span>
      </div>
      {showTouch && phase === "play" && !paused ? (
        <div className={styles.touchControls}>
          <div className={styles.directions}>
            <button type="button" aria-label={game.display.left} {...padProps("left")} className={PAD}>◀</button>
            <button type="button" aria-label={game.display.right} {...padProps("right")} className={PAD}>▶</button>
            <button type="button" aria-label={game.dropLabel} {...padProps("down")} className={`${PAD} ${styles.down}`}>▼</button>
          </div>
          <div className={styles.combat}>
            <button type="button" {...padProps("guard")} className={`${ACT} border-[#9fd8ff] text-[#9fd8ff]`}>{game.display.block}</button>
            <button type="button" {...padProps("jump")} className={PAD}>{game.display.jump}</button>
            <button type="button" {...padProps("shoot")} className={`${ACT} border-[#9fd8ff] bg-[#9fd8ff] text-ink-950`}>{game.display.shoot}</button>
            <button type="button" {...padProps("atk")} className={`${ACT} border-lime bg-lime text-ink-950`}>{game.display.attack}</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Một dòng chỉ số trong túi đồ: nhãn bên trái, giá trị bên phải */
function StatRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: PickupInfo["kind"];
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 rounded-xl border border-ink-800 bg-ink-900/70 px-3 py-2">
      <span className="font-display text-[10px] font-bold uppercase tracking-widest text-mute-3">
        {label}
      </span>
      <span className={`text-[12px] ${accent ? PICKUP_ACCENT[accent] : "text-paper"}`}>
        {value}
      </span>
    </div>
  );
}

/** Màu nhận dạng ba loại vật phẩm, khớp với màu engine vẽ trong canvas */
const PICKUP_ACCENT: Record<PickupInfo["kind"], string> = {
  heal: "text-[#ff8f85]",
  tool: "text-lime",
  gun: "text-[#9fd8ff]",
};

const PAD =
  "grid h-14 w-14 touch-none select-none place-items-center rounded-2xl border-2 border-ink-700 bg-ink-850 font-display text-lg text-paper active:border-lime active:text-lime";

/** Nút hành động trên điện thoại — to hơn nút hướng vì bấm nhiều hơn */
const ACT =
  "h-14 w-[4.5rem] touch-none select-none rounded-2xl border-2 font-display text-[11px] font-extrabold uppercase tracking-wide active:scale-95";
