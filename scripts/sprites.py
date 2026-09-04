#!/usr/bin/env python3
"""Đo, chuẩn hoá và kiểm tra rig của sprite cho minigame "Ải Vận Hành".

VÌ SAO CẦN FILE NÀY

Bộ asset đời 1 bị crop sát alpha rồi normalize về cùng chiều cao ảnh. Hệ quả:
mỗi khung nhân vật có cỡ đầu khác nhau — chạy game lên là thấy nhân vật phình
to đúng lúc tung đòn, mặt cũng không nằm cố định một chỗ. Model sinh ảnh không
canh được pixel dù prompt có nói gì, nên cách chữa không phải là prompt kỹ hơn
mà là một bước chuẩn hoá bằng máy sau khi gen:

    1. gen ảnh (khung to, nền trong suốt, một vật một tấm)
    2. `normalize` — đo rồi kéo mọi khung về đúng một rig
    3. `check` — xác nhận từng tấm đúng spec trước khi commit

THƯỚC ĐO

  * Nhân vật — chiều cao ĐẦU, đỉnh tóc tới chin. Đây là đại lượng bất biến
    giữa các dáng: chân co thì thân ngắn lại nhưng đầu không đổi. Chin tìm
    bằng vệt màu da liền khối lớn nhất ở nửa trên ảnh.
  * Quái và trùm — chiều cao thân (bbox alpha), vì không có mặt người để đo.
  * ax — tâm dải hông (52–66% chiều cao thân). Không lấy tâm ảnh: khung chém
    có tay vung ra ngoài nên tâm ảnh lệch hẳn khỏi thân người.
  * ay — gan bàn chân, tức đáy bbox alpha.

CÁCH DÙNG

    python scripts/sprites.py check                       # đo và in bảng
    python scripts/sprites.py check --set v2              # kiểm theo spec mới
    python scripts/sprites.py check --emit-rig            # in bảng rig cho engine
    python scripts/sprites.py normalize raw/ out/ --kind player --fit none
    python scripts/sprites.py normalize raw/ out/ --kind player --fit head
    python scripts/sprites.py normalize raw/ out/ --kind mob --dry-run
    python scripts/sprites.py pack raw/bg public/game/bg      # dọn alpha + nén

Cần Pillow:  pip install pillow
"""
from __future__ import annotations

import argparse
import os
import sys
from collections import deque
from pathlib import Path

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    sys.exit("Thiếu Pillow. Chạy: pip install pillow")

# Console Windows mặc định cp1252, in tiếng Việt vào là vỡ
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
GAME = ROOT / "public" / "game"

# Spec asset đời 2 — trùng với PLAYER_RIG_V2 / MOB_RIG_V2 / BOSS_RIG_V2
# trong components/game/engine.ts. Sửa ở đây thì phải sửa cả bên đó.
# `canvas` là khung THAM CHIẾU của spec. File xuất ra được phép nhỏ hơn (miễn
# vuông) — rig trong engine tính theo tỉ lệ nên đổi kích thước không ảnh hưởng,
# mà 1024² cho 18 khung là 8MB tải về, quá nặng cho một trang web.
SPEC = {
    # unit của nhân vật là chiều cao đầu — biên rộng (±60) vì bộ đo bị cánh tay
    # sát mặt làm lệch, xem chú thích head_height(). Cỡ nhân vật thật phải soi
    # bằng mắt trên strip đầu, không tin số này một mình.
    "player": dict(canvas=1024, unit=350, ax=512, ay=960, tol_unit=60, tol_xy=14),
    "mob": dict(canvas=512, unit=440, ax=256, ay=476, tol_unit=8, tol_xy=10),
    "boss": dict(canvas=768, unit=660, ax=384, ay=714, tol_unit=12, tol_xy=14),
    # Bộ trùm vẫn đời 1 (khung 446², thân 416px). Khung -hit gen mới ở 768²
    # phải kéo về đúng quy ước này, không thì trùm nhảy 2px mỗi lần trúng đòn.
    "boss_v1": dict(canvas=446, unit=416, ax=223, ay=431, tol_unit=8, tol_xy=8),
}

# Nhóm nào đang dùng bộ asset đời nào. Phải khớp RIG_SET và PLAYER_RIG trong
# components/game/engine.ts, nếu không thì báo cáo của script vô nghĩa.
ASSET_SET = {"player": "v2", "mob": "v1", "boss": "v1"}

ALPHA_MIN = 16


# Tách nền bằng máy để lại hai thứ rác: phần "đặc" chỉ tới alpha ~240 (cả lớp
# hơi trong, nền dưới hắt lên), và một lớp mờ 1–31 ở chỗ đáng lẽ phải trong hẳn
# (thấy rõ nhất là mảng sky lọt giữa hai chân cần cẩu). Ép hai đầu về 0 và 255,
# giữ nguyên dải giữa vì đó là viền khử răng cưa thật và vệt sáng của hiệu ứng.
ALPHA_LUT = [0 if v <= 24 else (255 if v >= 224 else round((v - 24) * 255 / 200)) for v in range(256)]


def clean_alpha(im: Image.Image) -> Image.Image:
    r, g, b, a = im.split()
    return Image.merge("RGBA", (r, g, b, a.point(ALPHA_LUT)))


def is_skin(r: int, g: int, b: int) -> bool:
    """Màu da của nhân vật chính: sáng, ấm, đỏ hơn xanh nhưng không quá gắt."""
    return r > 200 and g > 150 and b > 110 and 30 < r - b < 110 and g - b > 10


def alpha_bbox(im: Image.Image):
    a = im.split()[3].point(lambda v: 255 if v > ALPHA_MIN else 0)
    return a.getbbox()


def band_center_x(im: Image.Image, lo: float, hi: float):
    """Hoành độ trung bình của điểm đục trong dải [lo, hi] chiều cao thân."""
    px = im.load()
    w, _ = im.size
    bb = alpha_bbox(im)
    if not bb:
        return None
    y0, y1 = bb[1], bb[3] - 1
    bh = y1 - y0
    xs = []
    for y in range(int(y0 + bh * lo), int(y0 + bh * hi) + 1):
        for x in range(w):
            if px[x, y][3] > ALPHA_MIN:
                xs.append(x)
    return sum(xs) / len(xs) if xs else None


def head_height(im: Image.Image):
    """Đỉnh tóc → chin. Đo trên ảnh thu nhỏ cho nhanh rồi quy về cỡ thật.

    CẢNH BÁO: chin tìm bằng vệt màu da liền khối, nên khung nào có cẳng tay
    hoặc bàn tay chạm vào mặt/cổ thì vệt da nối liền xuống tay và số đo phồng
    lên (đo thử bộ v2: khung sạch ra 350, khung có tay sát mặt ra tới 489).
    Vì vậy đừng dùng số này để phóng ảnh khi bộ ảnh vốn đã nhất quán cỡ —
    dùng `--fit none` và soi bằng mắt. Chỉ dùng `--fit head` khi bộ ảnh thật
    sự lệch cỡ giữa các khung (như bộ đời 1).
    """
    scale = 1.0
    work = im
    if im.width > 360:
        scale = 360 / im.width
        work = im.resize((360, max(1, round(im.height * scale))), Image.NEAREST)
    px = work.load()
    w, h = work.size
    mask = [[False] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > ALPHA_MIN and is_skin(r, g, b):
                mask[y][x] = True

    seen = [[False] * w for _ in range(h)]
    best = None
    for y in range(h):
        for x in range(w):
            if not mask[y][x] or seen[y][x]:
                continue
            q = deque([(x, y)])
            seen[y][x] = True
            cells = []
            while q:
                cx, cy = q.popleft()
                cells.append((cx, cy))
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < w and 0 <= ny < h and mask[ny][nx] and not seen[ny][nx]:
                        seen[ny][nx] = True
                        q.append((nx, ny))
            # Mặt phải nằm ở nửa trên; nếu không thì đó là bàn tay hoặc cánh tay
            if sum(p[1] for p in cells) / len(cells) < h * 0.5:
                if best is None or len(cells) > len(best):
                    best = cells
    if not best:
        return None
    chin = max(p[1] for p in best)
    bb = alpha_bbox(work)
    top = bb[1] if bb else 0
    return (chin - top) / scale


def measure(im: Image.Image, kind: str):
    """Ba số cần cho rig, cộng vài số phụ để in báo cáo."""
    bb = alpha_bbox(im)
    if not bb:
        return None
    body = bb[3] - bb[1]
    unit = head_height(im) if kind == "player" else float(body)
    return dict(
        w=im.width, h=im.height, body=body, unit=unit,
        ax=band_center_x(im, 0.52, 0.66), ay=float(bb[3]),
        top=bb[1], left=bb[0], right=bb[2],
    )


# ── check ───────────────────────────────────────────────


def cmd_check(args):
    if not GAME.exists():
        sys.exit(f"Không thấy {GAME}")

    groups = [
        ("player", sorted((GAME / "player").glob("*.png"))),
        ("mob", sorted((GAME / "mob").glob("*.png"))),
        ("boss", sorted((GAME / "boss").glob("*.png"))),
    ]
    for kind, paths in groups:
        if not paths:
            continue
        spec = SPEC[kind]
        rig_set = args.rig_set or ASSET_SET[kind]
        print(f"\n{kind.upper()} — {len(paths)} tấm")
        print(f"  {'file':22s} {'khung':>12s} {'thân':>6s} {'thước đo':>9s} {'ax':>6s} {'ay':>6s}  ghi chú")
        bad_count = 0
        rows = []
        for p in paths:
            im = Image.open(p).convert("RGBA")
            m = measure(im, kind)
            if not m:
                print(f"  !! {p.name}: ảnh trống hoàn toàn")
                continue
            rows.append((p, m))
            if rig_set == "v2":
                bad = []
                # Khung nhỏ hơn spec vẫn đạt, miễn là vuông: quy mọi số đo về
                # khung tham chiếu rồi mới so
                k = spec["canvas"] / m["h"] if m["h"] else 1
                if m["w"] != m["h"]:
                    bad.append(f"khung phải vuông, đang {m['w']}x{m['h']}")
                elif m["h"] > spec["canvas"]:
                    bad.append(f"khung lớn hơn spec {spec['canvas']}²")
                # Thước đo của nhân vật chỉ để tham khảo: chin tìm bằng vệt
                # màu da nên khung nào có cẳng tay sát mặt là số phồng lên.
                # Chỉ báo khi lệch xa tới mức chắc chắn là vẽ sai cỡ thật.
                if m["unit"] and abs(m["unit"] * k - spec["unit"]) > spec["tol_unit"] * 3:
                    bad.append(
                        f"thước đo lệch {m['unit'] * k - spec['unit']:+.0f}px — soi lại bằng mắt"
                    )
                if m["ax"] and abs(m["ax"] * k - spec["ax"]) > spec["tol_xy"]:
                    bad.append(f"tâm thân lệch {m['ax'] * k - spec['ax']:+.0f}px")
                if abs(m["ay"] * k - spec["ay"]) > spec["tol_xy"]:
                    bad.append(f"mặt sàn lệch {m['ay'] * k - spec['ay']:+.0f}px")
                note = "OK" if not bad else " · ".join(bad)
                bad_count += bool(bad)
            else:
                note = "đời 1 — engine phải hiệu chuẩn"
            u = f"{m['unit']:.0f}" if m["unit"] else "?"
            ax = f"{m['ax']:.0f}" if m["ax"] else "?"
            print(
                f"  {p.name:22s} {m['w']:5d}x{m['h']:<6d} {m['body']:6d} {u:>9s} "
                f"{ax:>6s} {m['ay']:6.0f}  {note}"
            )
        if rig_set == "v2":
            print(f"  → {len(rows) - bad_count}/{len(rows)} tấm đúng spec")

        if args.emit_rig and kind == "player":
            print("\n// Dán vào PLAYER_RIG_V1 trong components/game/engine.ts")
            for p, m in rows:
                if not m["unit"] or not m["ax"]:
                    continue
                print(
                    f'  "player/{p.name}": {{ unit: {m["unit"]:.0f} / {m["h"]}, '
                    f'ax: {m["ax"] / m["w"]:.3f}, ay: {m["ay"] / m["h"]:.4f} }},'
                )

    # Nền lặp ngang: mép trái và mép phải phải khớp, không thì cứ mỗi tấm lại
    # thấy một đường sọc chạy ngang màn hình
    print("\nNỀN — kiểm mép lặp")
    for p in sorted(GAME.glob("bg/*.png")):
        im = Image.open(p).convert("RGBA")
        if p.stem.endswith("-sky"):
            print(f"  {p.name:22s} {im.width}x{im.height}  lớp trời, không lặp — bỏ qua")
            continue
        left = im.crop((0, 0, 1, im.height)).tobytes()
        right = im.crop((im.width - 1, 0, im.width, im.height)).tobytes()
        diff = sum(abs(a - b) for a, b in zip(left, right)) / (im.height * 4)
        flag = "OK" if diff < 18 else f"lệch {diff:.0f} — chưa seamless, sẽ thấy sọc"
        print(f"  {p.name:22s} {im.width}x{im.height}  {flag}")


# ── normalize ───────────────────────────────────────────


def cmd_normalize(args):
    src = Path(args.src)
    dst = Path(args.dst)
    if not src.is_dir():
        sys.exit(f"Không thấy thư mục {src}")
    spec = SPEC[args.kind]
    files = sorted(src.glob("*.png"))
    if not files:
        sys.exit(f"Không có .png nào trong {src}")
    if not args.dry_run:
        dst.mkdir(parents=True, exist_ok=True)

    fit = args.fit
    how = f"thước đo {spec['unit']}px" if fit == "head" else "giữ nguyên cỡ"
    print(f"{args.kind}: {len(files)} tấm → khung {spec['canvas']}², "
          f"{how}, neo ({spec['ax']}, {spec['ay']})")
    for p in files:
        im = Image.open(p).convert("RGBA")
        # Làm sạch TRƯỚC khi đo: lớp mờ sót lại làm phình bbox nên điểm neo lệch
        if not args.raw_alpha:
            im = clean_alpha(im)
        m = measure(im, args.kind)
        if not m:
            print(f"  !! {p.name}: ảnh trống, bỏ qua")
            continue
        unit = m["unit"]
        if fit == "none":
            # Chỉ canh vị trí, không đụng tới cỡ. Dùng khi bộ ảnh đã nhất quán
            # cỡ nhân vật — phóng lại theo số đo chỉ làm mờ và làm lệch.
            scale = 1.0
        else:
            if not unit:
                # Không tìm được mặt (mũ trùm kín, quái không có da) — dùng chiều
                # cao thân, nhưng phải nói ra vì con số này kém tin hơn
                unit = float(m["body"])
                print(f"  ~  {p.name}: không thấy mặt, đo theo chiều cao thân")
            scale = spec["unit"] / unit
        nw, nh = max(1, round(im.width * scale)), max(1, round(im.height * scale))
        scaled = im.resize((nw, nh), Image.LANCZOS)

        anchor_x = (m["ax"] if m["ax"] else (m["left"] + m["right"]) / 2) * scale
        anchor_y = m["ay"] * scale
        ox = round(spec["ax"] - anchor_x)
        oy = round(spec["ay"] - anchor_y)

        canvas = Image.new("RGBA", (spec["canvas"], spec["canvas"]), (0, 0, 0, 0))
        canvas.alpha_composite(scaled, (ox, oy))
        if args.out_size and args.out_size != spec["canvas"]:
            # Thu về khung nhỏ hơn cho nhẹ trang. Làm SAU khi đã canh neo để
            # điểm neo vẫn nằm đúng tỉ lệ.
            canvas = canvas.resize((args.out_size, args.out_size), Image.LANCZOS)

        # Cảnh báo khi nhân vật bị khung cắt: thà biết ngay còn hơn phát hiện
        # lúc chơi thấy mất một cánh tay
        cut = []
        if ox + m["left"] * scale < 0:
            cut.append("trái")
        if ox + m["right"] * scale > spec["canvas"]:
            cut.append("phải")
        if oy + m["top"] * scale < 0:
            cut.append("trên")
        if oy + m["ay"] * scale > spec["canvas"]:
            cut.append("dưới")
        note = f"  !! bị cắt mép {', '.join(cut)}" if cut else ""
        u = f" đầu={unit:.0f}" if unit else ""
        print(f"  {p.name:22s} x{scale:5.3f} lệch ({ox:+5d},{oy:+5d}){u}{note}")

        if not args.dry_run:
            canvas.save(dst / p.name, optimize=True)

    if args.dry_run:
        print("(dry-run — chưa ghi file nào)")
    else:
        print(f"Đã ghi vào {dst}. Kiểm lại: python scripts/sprites.py check --set v2")


# ── pack ────────────────────────────────────────────────


def cmd_pack(args):
    """Dọn alpha và nén file, không đụng tới rig.

    Dùng cho lớp nền (không có rig nên không đi qua `normalize`) và cho mọi
    thư mục ảnh đã đúng rig rồi mà chỉ cần nhẹ đi. Bảng màu 256 ở cỡ vẽ trong
    game không phân biệt được với bản gốc, mà file nhẹ đi ba tới mười lần —
    engine preload toàn bộ asset lúc vào trang nên cân nặng là chuyện thật.
    """
    src = Path(args.src)
    dst = Path(args.dst)
    files = sorted(src.glob("*.png"))
    if not files:
        sys.exit(f"Không có .png nào trong {src}")
    if not args.dry_run:
        dst.mkdir(parents=True, exist_ok=True)

    print(f"{len(files)} tấm → {'giữ nguyên khổ' if not args.width else f'rộng {args.width}px'}"
          f", {args.colors} màu")
    for p in files:
        im = Image.open(p).convert("RGBA")
        before = os.path.getsize(p) // 1024
        im = clean_alpha(im)
        if args.trim_v:
            # Cắt hàng trong suốt ở trên và dưới. Lớp nền được vẽ với chiều cao
            # cố định, nên nếu tấm này thừa 119px trong suốt ở đáy thì mặt
            # đường trong tranh treo lơ lửng trên mặt đất của game. Chỉ cắt
            # chiều dọc — cắt ngang là hỏng mối lặp.
            bb = alpha_bbox(im)
            if bb and (bb[1] > 0 or bb[3] < im.height):
                im = im.crop((0, bb[1], im.width, bb[3]))
        if args.width and im.width != args.width:
            im = im.resize((args.width, round(im.height * args.width / im.width)), Image.LANCZOS)

        # Lặp ngang: mép trái phải khớp mép phải, kiểm cả trước và sau khi nén
        def seam(x: Image.Image) -> float:
            left = x.crop((0, 0, 1, x.height)).tobytes()
            right = x.crop((x.width - 1, 0, x.width, x.height)).tobytes()
            return sum(abs(a - b) for a, b in zip(left, right)) / (x.height * 4)

        # Giữ ảnh ở chế độ bảng màu (P) lúc lưu — convert ngược về RGBA là mất
        # sạch cái lợi, file phồng lại gấp ba
        out = im
        if args.colors:
            # Bảng màu rút gọn: ở cỡ vẽ trong game không phân biệt được với bản
            # gốc, mà file nhẹ đi khoảng mười lần
            out = im.quantize(colors=args.colors, method=Image.Quantize.FASTOCTREE)

        sm = seam(im)
        flag = "" if sm < 18 else f"  !! mép lệch {sm:.0f}, sẽ thấy sọc khi lặp"
        if args.dry_run:
            print(f"  {p.name:16s} {before:5d}KB → (dry-run){flag}")
            continue
        target = dst / p.name
        out.save(target, optimize=True)
        after = os.path.getsize(target) // 1024
        print(f"  {p.name:16s} {before:5d}KB → {after:4d}KB  {out.width}x{out.height}{flag}")


def main():
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    sub = ap.add_subparsers(dest="cmd", required=True)

    c = sub.add_parser("check", help="đo và kiểm sprite trong public/game")
    c.add_argument(
        "--set",
        dest="rig_set",
        choices=("v1", "v2"),
        default=None,
        help="ép cả ba nhóm kiểm theo một đời; bỏ trống thì theo ASSET_SET",
    )
    c.add_argument("--emit-rig", action="store_true", help="in bảng rig cho engine")
    c.set_defaults(func=cmd_check)

    n = sub.add_parser("normalize", help="kéo ảnh vừa gen về đúng rig")
    n.add_argument("src", help="thư mục ảnh thô vừa gen")
    n.add_argument("dst", help="thư mục ghi ảnh đã chuẩn hoá")
    n.add_argument("--kind", choices=tuple(SPEC), required=True)
    n.add_argument(
        "--fit",
        choices=("head", "none"),
        default="head",
        help='"head" phóng từng khung cho thước đo bằng spec (bộ ảnh lệch cỡ); '
             '"none" giữ nguyên cỡ, chỉ canh điểm neo (bộ ảnh đã nhất quán)',
    )
    n.add_argument(
        "--out-size",
        type=int,
        default=None,
        help="thu khung xuất về N×N cho nhẹ trang (engine vẽ nhân vật cao 87px, "
             "512 là đã dư gấp ba ở màn Retina)",
    )
    n.add_argument(
        "--raw-alpha",
        action="store_true",
        help="giữ nguyên alpha thô, không ép hai đầu về 0/255",
    )
    n.add_argument("--dry-run", action="store_true", help="chỉ in, không ghi file")
    n.set_defaults(func=cmd_normalize)

    b = sub.add_parser("pack", help="dọn alpha và nén file cho nhẹ trang")
    b.add_argument("src", help="thư mục ảnh nguồn")
    b.add_argument("dst", help="thư mục ghi ra (trùng src thì ghi đè)")
    b.add_argument("--width", type=int, default=None, help="thu về rộng N px")
    b.add_argument(
        "--trim-v",
        action="store_true",
        help="cắt hàng trong suốt trên/dưới để mép nội dung trùng mép ảnh "
             "(chỉ dùng cho lớp nền — cắt sprite là hỏng rig)",
    )
    b.add_argument(
        "--colors",
        type=int,
        default=256,
        help="số màu của bảng màu, 0 để giữ màu thật (nặng gấp mười)",
    )
    b.add_argument("--dry-run", action="store_true")
    b.set_defaults(func=cmd_pack)

    args = ap.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
