#!/bin/bash
# render.sh <html> <out.png> <width>
# Chrome headless không vẽ hết phần cuối khi viewport vừa khít nội dung, nên:
#   lượt 1 — hỏi #root cao bao nhiêu
#   lượt 2 — chụp với viewport dư 400px
#   lượt 3 — cắt xuống đúng chiều cao thật
CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
SRC="$1"; OUT="$2"; W="${3:-1600}"
PROBE="${SRC%.html}.probe.html"
cp "$SRC" "$PROBE"
cat >> "$PROBE" <<'JS'
<script>window.addEventListener('load',()=>{document.title='H='+Math.ceil(document.getElementById('root').getBoundingClientRect().height);});</script>
JS
H=$("$CHROME" --headless --no-sandbox --disable-gpu --hide-scrollbars --virtual-time-budget=2000 \
     --window-size=$W,900 --dump-dom "file://$PROBE" 2>/dev/null | grep -o 'H=[0-9]*' | head -1 | cut -d= -f2)
[ -z "$H" ] && { echo "FAIL: không đo được chiều cao $SRC"; exit 1; }
"$CHROME" --headless --no-sandbox --disable-gpu --hide-scrollbars --virtual-time-budget=2000 \
  --window-size=$W,$((H+400)) --screenshot="$OUT.raw.png" "file://$SRC" 2>/dev/null
python3 - "$OUT.raw.png" "$OUT" "$H" <<'PY'
import sys
from PIL import Image
src,dst,h = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = Image.open(src).convert('RGB')
im.crop((0,0,im.width,min(h,im.height))).save(dst)
PY
rm -f "$OUT.raw.png" "$PROBE"
python3 -c "
from PIL import Image; im=Image.open('$OUT'); print('$(basename $OUT)','→',im.width,'x',im.height)"
