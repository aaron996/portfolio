"""Tiếng cho phim case (docs/case-motion.md): tải nguồn, cắt ứng viên để nghe thử, trộn bản cuối.

Nguồn là tiếng thu thật — Adobe Audition SFX (Cartoon, Foley, Multimedia, Technology, Human Elements,
Production Elements), Kenney.nl, Freesound. Danh sách, link, giấy phép, các "chỗ cần tiếng" (slots)
cùng ứng viên của từng chỗ đều ở docs/motion-audio-sources.json.

    python scripts/motion-sfx.py --download    # nguồn → output/motion-audio/sources/
    python scripts/motion-sfx.py --audition    # ứng viên → output/motion-audio/audition/ (chỉ ở máy)
    python scripts/motion-sfx.py --variants    # mỗi phim × mỗi phong cách → output/motion-audio/variants/
    python scripts/motion-sfx.py               # trộn → public/motion/<phim>-sfx.mp3
    python scripts/motion-sfx.py --film intro --style mixkit   # một phong cách → variants/ để so

Mỗi slot chọn tiếng theo phong cách (`picks`: "vui" hoạt hình, "gon" hiện đại gọn; thiếu thì dùng
`chosen`); phim dùng phong cách ghi ở films.<phim>.style. `"music": false` thì không trộn nhạc nền. Nhạc nền (Vinh tạo bằng Suno,
docs/case-motion-music.md): output/motion-audio/music/<phim>.mp3 nếu có, không thì theme.mp3 dùng chung
— trộn dưới tiếng hiệu ứng và tự nhỏ đi khi có tiếng hiệu ứng. Thêm `--film <phim>` để chỉ trộn một phim.

Bản trộn lấy mốc từ bảng tiếng của phim (node scripts/motion-cues.cjs <phim>). Site chỉ phát bản
trộn — giấy phép Adobe cấm phát tán file tiếng lẻ, nên không bao giờ ghi file tiếng riêng lẻ vào
public/. Cần numpy, imageio-ffmpeg và node.
"""

import json
import os
import subprocess
import sys
import urllib.request
import zipfile

import imageio_ffmpeg
import numpy as np

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
SOURCES = os.path.join(ROOT, "output", "motion-audio", "sources")
# Kho nguồn ~4GB; worktree khác đã tải sẵn thì trỏ MOTION_AUDIO_SOURCES tới đó (nhiều thư mục thì ngăn
# bằng os.pathsep) — tìm ở đó trước, rồi tới SOURCES của repo này.
SEARCH = [p for p in os.environ.get("MOTION_AUDIO_SOURCES", "").split(os.pathsep) if p] + [SOURCES]
MANIFEST = os.path.join(ROOT, "docs", "motion-audio-sources.json")
SR = 44100
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
PEAK = 10 ** (-1 / 20)  # trần của bản trộn: -1 dBFS
TARGET_LUFS = -20  # mọi phim nghe to ngang nhau
MUSIC = os.path.join(ROOT, "output", "motion-audio", "music")
VARIANTS = os.path.join(ROOT, "output", "motion-audio", "variants")


def download(manifest):
    for src in manifest["sources"]:
        if not src.get("url"):  # nguồn tải từng file (vd. Mixkit) — xem trường "download" của nguồn
            continue
        folder = os.path.join(SOURCES, src["id"])
        target = os.path.join(folder, src["file"])
        if os.path.exists(target):
            continue
        os.makedirs(folder, exist_ok=True)
        print("tai", src["id"])
        urllib.request.urlretrieve(src["url"], target + ".part")
        os.replace(target + ".part", target)
        if target.endswith(".zip"):
            zipfile.ZipFile(target).extractall(folder)


def find(src_id, name):
    for root in SEARCH:
        for base, _, files in os.walk(os.path.join(root, src_id)):
            if name in files:
                return os.path.join(base, name)
    raise FileNotFoundError(f"{src_id}/{name}")


def soften(sig, spec):
    """Hạ dải cao (high-shelf) cho phim không có nhạc che — tiếng hiệu ứng trần dễ chói tai."""
    if not spec:
        return sig
    af = f"highshelf=f={spec.get('hz', 3000)}:g={spec.get('db', -6)},lowpass=f={spec.get('lowpass', 9000)}"
    return ffmpeg_f32(["-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", af], sig.astype(np.float32).tobytes())


def ffmpeg_f32(args, data=None):
    out = subprocess.run([FFMPEG, "-loglevel", "error", *args, "-ac", "1", "-f", "f32le", "-"],
                         input=data, check=True, capture_output=True).stdout
    return np.frombuffer(out, dtype=np.float32).copy()


def decode(path):
    return ffmpeg_f32(["-i", path, "-af", f"aresample={SR}"])


def shift(sig, semitones):
    """Đổi cao độ kiểu tua băng (đổi cả độ dài) — giống playbackRate ở trang nghe thử."""
    rate = SR * 2 ** (semitones / 12)
    return ffmpeg_f32(["-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                       "-af", f"asetrate={rate:.0f},aresample={SR}"], sig.astype(np.float32).tobytes())


def fade_out(sig, seconds):
    n = min(len(sig), int(SR * seconds))
    if n:
        sig[-n:] *= np.linspace(1, 0, n)
    return sig


def render(spec):
    """Cắt một ứng viên: đoạn [start, start+dur], bỏ lặng đầu, chuẩn hoá đỉnh, fade cuối."""
    sig = decode(find(spec["source"], spec["file"]))
    sig = sig[int(SR * spec.get("start", 0)):]
    if "dur" in spec:
        sig = sig[: int(SR * spec["dur"])]
    # Bỏ khoảng lặng đầu để tiếng khớp đúng khung hình (trừ tiếng cố ý bắt đầu nhỏ, vd tiếng dồn).
    loud = np.nonzero(np.abs(sig) > 0.02 * (np.max(np.abs(sig)) or 1))[0]
    if len(loud) and not spec.get("notrim"):
        sig = sig[max(0, loud[0] - int(SR * 0.004)):]
    sig = sig / (np.max(np.abs(sig)) or 1) * 10 ** (spec.get("peak", -3) / 20)
    return fade_out(sig, spec.get("fade", 0.03))


def write_mp3(sig, path, bitrate="96k"):
    subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                    "-b:a", bitrate, path], input=sig.astype(np.float32).tobytes(), check=True)


def audition(manifest):
    """Cắt mọi ứng viên của trang nghe thử; ghi kèm manifest.json cho trang đọc."""
    folder = os.path.join(ROOT, "output", "motion-audio", "audition")
    clips = os.path.join(folder, "clips")
    os.makedirs(clips, exist_ok=True)
    slots = []
    for slot in manifest["slots"]:
        candidates = []
        for n, cand in enumerate(slot["candidates"]):
            name = f"{slot['id']}-{n}.mp3"
            write_mp3(render(cand), os.path.join(clips, name))
            candidates.append({"label": cand["label"], "clip": f"clips/{name}", "lead": cand.get("lead", 0)})
        slots.append({**{k: slot[k] for k in ("id", "label", "where", "names", "windows")},
                      "chosen": slot.get("chosen"), "candidates": candidates})
    films = [{"id": k, "label": v["label"]} for k, v in manifest["films"].items()]
    with open(os.path.join(folder, "manifest.json"), "w", encoding="utf-8") as out:
        json.dump({"films": films, "slots": slots}, out, ensure_ascii=False)
    print(f"{sum(len(s['candidates']) for s in slots)} candidates -> {os.path.normpath(folder)}")


def sounds(manifest, style):
    """Tên tiếng dùng trong bảng tiếng (vd "pop-3") → (tiếng của slot theo phong cách, biến thể).
    Slot đặt pick = null cho một phong cách thì các tiếng của nó bị bỏ ở phong cách đó."""
    table = {}
    for slot in manifest["slots"]:
        index = slot.get("picks", {}).get(style, slot["chosen"])
        if index is None:
            continue
        cand = slot["candidates"][index]
        for name, variant in slot["names"].items():
            table[name] = (cand, variant if isinstance(variant, dict) else {"st": variant})
    return table


def envelope(sig, seconds=0.05):
    """Độ to (RMS) theo cửa sổ trượt (tổng tích luỹ cho nhanh), cùng độ dài với tín hiệu."""
    n = max(1, int(SR * seconds))
    acc = np.cumsum(np.concatenate([[0.0], sig.astype(np.float64) ** 2]))
    mean = (acc[n:] - acc[:-n]) / n
    mean = np.pad(mean, (n // 2, len(sig) - len(mean) - n // 2), mode="edge")
    return np.sqrt(np.maximum(mean, 0))


def music_bed(film, spec, sfx):
    """Nhạc nền của phim (nếu có file): cắt từ `start`, mờ vào/ra, nhỏ hơn tiếng hiệu ứng `gain` dB và
    tự né (giảm tới `duck` dB) lúc tiếng hiệu ứng vang lên."""
    if spec is False:  # phim chỉ có tiếng hiệu ứng (vd. intro)
        return None
    path = next((p for p in (os.path.join(MUSIC, f"{film}.mp3"), os.path.join(MUSIC, "theme.mp3")) if os.path.exists(p)), None)
    if path is None:
        return None
    length = len(sfx)
    sig = decode(path)[int(SR * spec.get("start", 0)):][:length]
    sig = np.pad(sig, (0, length - len(sig)))
    n_in = int(SR * spec.get("fade_in", 0.4))
    sig[:n_in] *= np.linspace(0, 1, n_in)
    sig = fade_out(sig, spec.get("fade_out", 1.5))
    sig *= 10 ** ((TARGET_LUFS + spec.get("gain", -9) - loudness(sig)) / 20)
    env = envelope(sfx, 0.08)
    level = np.clip(env / (np.percentile(env, 95) or 1), 0, 1)
    # Né nhanh khi tiếng vào, nhả chậm khi tiếng tắt.
    step = SR // 100
    coarse, smooth, value = level[::step], [], 0.0
    for v in coarse:
        value += (v - value) * (0.6 if v > value else 0.06)
        smooth.append(value)
    gain_db = -spec.get("duck", 5) * np.interp(np.arange(length), np.arange(len(smooth)) * step, smooth)
    return sig * 10 ** (gain_db / 20)


def mix(manifest, film, out, style):
    data = json.loads(subprocess.run(["node", os.path.join(ROOT, "scripts", "motion-cues.cjs"), film],
                                     check=True, capture_output=True, cwd=ROOT).stdout)
    table, cache = sounds(manifest, style), {}
    length = int(SR * data["frames"] / data["fps"])
    track = np.zeros(length + SR * 4)
    skipped = set()
    for cue in data["cues"]:
        if cue["name"] not in table:
            skipped.add(cue["name"])
            continue
        cand, variant = table[cue["name"]]
        if cue["name"] not in cache:
            sig = render(cand)
            if variant.get("st"):
                sig = shift(sig, variant["st"])
            if variant.get("dur"):
                sig = fade_out(sig[: int(SR * variant["dur"])].copy(), 0.03)
            cache[cue["name"]] = sig
        sig = cache[cue["name"]] * min(1, cue.get("volume", 0.7) * data["master"])
        start = int(round(SR * (cue["at"] / data["fps"] - cand.get("lead", 0))))
        if start < 0:
            sig, start = sig[-start:], 0
        track[start:start + len(sig)] += sig
    track = fade_out(track[:length], 0.05)
    track = soften(track, manifest["films"][film].get("soften"))
    before = loudness(track)
    # Nén đỉnh làm bản trộn nhỏ đi một chút, nên chỉnh thêm một lượt cho sát mức đích.
    for _ in range(2):
        track = limit(track * 10 ** ((TARGET_LUFS - loudness(track)) / 20))
    bed = music_bed(film, manifest["films"][film].get("music", {}), track)
    if bed is not None:
        track = track + bed
        for _ in range(2):
            track = limit(track * 10 ** ((TARGET_LUFS - loudness(track)) / 20))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    write_mp3(track, out, "128k")
    print(f"{film} [{style}{' + music' if bed is not None else ''}]: {len(data['cues'])} cues, {len(cache)} sounds, "
          f"{before:.1f} -> {loudness(track):.1f} LUFS, peak {20 * np.log10(np.max(np.abs(track))):.1f} dBFS "
          f"-> {os.path.relpath(out, ROOT)}" + (f" (skip: {', '.join(sorted(skipped))})" if skipped else ""))


def loudness(sig):
    """Độ to tích hợp (LUFS) theo EBU R128, đo bằng ffmpeg."""
    report = subprocess.run([FFMPEG, "-hide_banner", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                             "-af", "ebur128=framelog=quiet", "-f", "null", "-"],
                            input=sig.astype(np.float32).tobytes(), capture_output=True, check=True).stderr.decode()
    return float(report.rsplit("I:", 1)[1].split("LUFS")[0])


def limit(sig, knee=0.6):
    """Nén mềm phần trên `knee` rồi đặt trần -1 dBFS — giữ đỉnh mà không hạ cả bản trộn."""
    mag = np.abs(sig)
    over = mag > knee
    out = sig.copy()
    out[over] = np.sign(sig[over]) * (knee + (1 - knee) * np.tanh((mag[over] - knee) / (1 - knee)))
    return out * PEAK / max(np.max(np.abs(out)), PEAK)


def main():
    manifest = json.load(open(MANIFEST, encoding="utf-8"))
    if "--download" in sys.argv:
        download(manifest)
    elif "--audition" in sys.argv:
        audition(manifest)
    else:
        only = sys.argv[sys.argv.index("--film") + 1] if "--film" in sys.argv else None
        for film, spec in manifest["films"].items():
            if only and film != only:
                continue
            if "--style" in sys.argv:  # một phong cách → variants/<phim>-<phong cách>.mp3 để nghe so sánh
                style = sys.argv[sys.argv.index("--style") + 1]
                mix(manifest, film, os.path.join(VARIANTS, f"{film}-{style}.mp3"), style)
            elif "--variants" in sys.argv:
                for style in manifest["styles"]:
                    mix(manifest, film, os.path.join(VARIANTS, f"{film}-{style}.mp3"), style)
            else:
                mix(manifest, film, os.path.join(ROOT, spec["out"]), spec.get("style", "vui"))


if __name__ == "__main__":
    main()
