# Ghép các ảnh still thành một contact sheet để duyệt nhanh:  python teaser/sheet.py out.png cols a.png b.png ...
import sys
from PIL import Image
out, cols, files = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
w, h = 960, 540
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (cols * w, rows * h))
for i, f in enumerate(files):
    sheet.paste(Image.open(f).convert("RGB").resize((w, h), Image.LANCZOS), ((i % cols) * w, (i // cols) * h))
sheet.save(out)
