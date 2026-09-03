# Prompt sinh ảnh cho minigame "Ải Vận Hành"

Toàn bộ prompt để tạo asset cho game ở route `/game`. Kích thước lấy thẳng từ
`components/game/engine.ts` — vẽ đúng tỉ lệ thì ráp vào không phải chỉnh toạ độ.

Tổng: **109 tấm** (đã tính khung động).

---

## 0. Cách dùng

1. **Prompt viết bằng tiếng Anh.** Model sinh ảnh hiểu tiếng Anh tốt hơn hẳn.
2. **Luôn dán khối "Style chung" (mục 1) lên trước mỗi prompt.** Đó là thứ giữ cho
   hơn trăm tấm trông như cùng một game thay vì trăm game khác nhau.
3. **Sinh ở kích thước lớn rồi thu nhỏ.** Đừng bảo model vẽ 30×30px — nó không làm
   được. Sinh 1024×1024 rồi thu về đúng số ghi ở mỗi mục.
4. **Làm nhân vật chính trước.** Ưng rồi thì dùng chính ảnh đó làm ảnh tham chiếu
   (Midjourney `--cref`, hoặc upload làm reference) cho mọi asset còn lại. Đây là
   mẹo quan trọng nhất — bỏ qua bước này thì mỗi tấm một style.
5. **Nền trong suốt.** Model nào không xuất được alpha thì thêm
   `on a flat #FF00FF magenta background` rồi tách nền sau.
6. **Một tấm một vật.** Đừng xin sprite sheet — model sẽ vẽ mỗi khung một kiểu.
   Xin từng khung riêng, ghép sheet sau.

**Model nào hợp:**

| Model | Hợp với |
|---|---|
| Recraft | Icon và vật phẩm nhỏ. Xuất nền trong suốt thật, có style lock |
| Midjourney | Nhân vật và trùm. Giữ style bằng `--sref` và `--cref` |
| GPT Image / Nano Banana | Quái có mô tả rắc rối — bám prompt sát nhất |
| Flux | Nền và lớp parallax |

> **Nói trước:** trùm có chữ trên người ("90,1%", "CATEGORY.SKU") thì model sẽ viết
> sai chính tả gần như chắc chắn. Prompt bên dưới đã bảo nó để mặt trống — chữ mình
> vẽ đè bằng canvas, engine có sẵn hàm vẽ chữ rồi.

---

## 1. Style chung — dán trước mọi prompt

Một khối duy nhất, không đổi trong suốt dự án.

```
2D game sprite for a cute casual side-scrolling MMO, hand-painted cartoon in the
spirit of classic MapleStory. Bold dark outline, flat cel shading with exactly two
tones plus one soft highlight, friendly chunky proportions, slightly oversized head,
readable silhouette at small size. Side view, facing right, centered in frame, full
body visible with generous margin. Fully transparent background, no ground shadow,
no scenery, no text, no watermark, no border, single object only.
```

---

## 2. Nhân vật chính — 6 tấm

Thân 26×40px, đầu nhô lên thêm 9px. Vẽ ở 4× rồi thu nhỏ. Luôn quay mặt sang phải,
engine tự lật khi đi ngược.

### Đứng yên · idle — `104×196` → `26×49`

Tấm gốc. Làm tấm này ưng ý trước, vì nó là ảnh tham chiếu cho cả bộ.

```
A young Vietnamese office worker as a cute chibi game hero, standing idle. Short
black hair, warm light skin, dark charcoal short-sleeve shirt (#1E1E1C) and simple
dark trousers, a plain lanyard badge around the neck. Calm friendly face, small
confident smile. Holding a rolled-up paper document in the right hand like a light
sword, tip pointing down. Feet together, relaxed shoulders.
```

### Chạy · 4 khung — `104×196` mỗi khung

Xin riêng từng khung, đừng xin cả dải.

```
The same chibi office-worker hero, mid-run cycle, leaning slightly forward, one leg
extended forward and one bent back, arms swinging, rolled paper document held low in
the right hand, hair blown back slightly. Generate as a single frame, running pose
number [1 of 4 / 2 of 4 / 3 of 4 / 4 of 4].
```

### Nhảy — `104×196`

```
The same chibi office-worker hero, airborne mid-jump, knees tucked up, one arm raised
for balance, rolled paper document held out to the side, shirt and hair lifted by the
motion, cheerful expression.
```

### Chém · 2 khung — `168×196`

Khung rộng hơn vì tay vung ra ngoài thân. Tầm chém trong game là 58px sang phải,
84px khi đang cầm đồ nghề.

```
The same chibi office-worker hero swinging the rolled paper document forward in a
wide horizontal arc to the right, body twisted into the swing, determined expression,
one foot planted. Frame [1: wind-up, arm drawn back / 2: full extension, arm
stretched right]. Do not draw any motion trail or slash effect, only the character.
```

### Trúng đòn — `104×196`

Engine đang nhấp nháy nhân vật lúc bất tử. Có tấm này thì thay bằng dáng bật ngửa,
đọc rõ hơn nhiều.

```
The same chibi office-worker hero knocked backward, body tilted back, arms flung up,
eyes squeezed shut in a comic "ouch" expression, one foot off the ground, papers
scattering from the hand.
```

---

## 3. Quái — 15 con

Quái thường `30×30px`, quái bay `58×28px` (cánh xoè hai bên). Vẽ 512×512 rồi thu
nhỏ — nên silhouette phải đơn giản, chi tiết nhỏ sẽ mất hết.

### Ải 1 · Cảng Cát Lái — tông giấy ngà `#FAF6E8`

**Chứng từ lệch** · đi tuần · `120×120` → `30×30`

```
A cute enemy creature made of a crumpled shipping manifest, off-white cream paper
(#FAF6E8) with faint printed rows, one smudged red ink stamp, dog-eared corner. Two
tiny stubby legs sticking out below, two small dot eyes and a flat worried mouth on
the paper face. Slightly rounded square body.
```

**Sai một ký tự** · bay · `232×112` → `58×28`

```
A cute flying enemy: a single wrong character tile, a small cream paper square
(#FAF6E8) showing one bold mismatched letter, flanked by two small folded-paper wings
spread wide on both sides. Two dot eyes, mischievous grin, hovering pose with wings
raised.
```

### Ải 2 · Kho Phân Loại — tông thùng giấy `#FFF3DC`

**Kiện lạc tuyến** · đi tuần · `120×120` → `30×30`

```
A cute enemy: a small cardboard parcel (#FFF3DC) with packing tape across the top and
a crooked shipping label showing scribbled unreadable marks, one corner dented. Two
tiny legs below, two dot eyes and a confused wavy mouth.
```

**Kiện văng ra** · lao vào người · `120×120` → `30×30`

Loại lao vào cần mũi nhọn phía trước để người chơi nhìn là biết nó sắp xông tới.

```
A cute but aggressive enemy: a cardboard parcel (#FFF3DC) tipped forward like it was
flung off a conveyor, angry slanted eyes, gritted teeth, a sharp pointed wedge of torn
tape jutting from its front edge like a beak, speed-lines shaped into its dented back
corner.
```

**Kiện rơi tầng trên** · bay · `232×112` → `58×28`

```
A cute flying enemy: a small cardboard parcel (#FFF3DC) with two long loose strips of
packing tape spread out on both sides like flapping wings, dangling below a tiny torn
label. Dot eyes, open surprised mouth, tilted as if drifting down.
```

### Ải 3 · Sàn Điều Phối — tông cam kem `#FFEDD8`

**Đơn trễ pickup** · bay · `232×112` → `58×28`

```
A cute flying enemy: a small warm cream order slip (#FFEDD8) with a tiny round alarm
clock face printed on it showing an overdue time, two small paper wings spread on both
sides. Dot eyes, sweat drop, anxious expression, hovering.
```

**Hub báo đỏ** · bắn đạn · `120×120` → `30×30`

Loại bắn cần một cái nòng chĩa ngang — engine tô đỏ nó trước khi bắn.

```
A cute turret-like enemy: a tiny cream warehouse hub building (#FFEDD8) with a shutter
door face, a red rotating warning beacon on its roof, and a short stubby cannon barrel
protruding horizontally from its right side. Two dot eyes above the barrel, stern mouth.
```

**Đơn dồn ca** · đi tuần · `120×120` → `30×30`

```
A cute enemy: a thick stack of cream order slips (#FFEDD8) bound with a stretched
rubber band, leaning and overstuffed, papers fanning out at the edges. Two tiny legs
buckling under the weight, dot eyes, strained grimace.
```

### Ải 4 · Phòng Dữ Liệu — tông xanh tím nhạt `#E8EAFF`

**Query lỗi** · bắn đạn · `120×120` → `30×30`

```
A cute turret-like enemy: a small floating terminal window, pale lavender-white body
(#E8EAFF) with a dark screen showing three short abstract code lines and one red error
bar, a stubby cannon barrel protruding horizontally from its right edge. Dot eyes on
the window frame, flat annoyed mouth.
```

**Join nhân dòng** · lao vào người · `120×120` → `30×30`

```
A cute aggressive enemy: two identical pale lavender table fragments (#E8EAFF) fused
together and duplicating outward, showing doubled rows, leaning forward with a sharp
pointed wedge at the front. Angry slanted eyes, jagged grin, a faint third copy
ghosting behind it.
```

**Cột thiếu** · đi tuần · `120×120` → `30×30`

```
A cute enemy: a tall narrow pale lavender data column block (#E8EAFF) with a header bar
on top and stacked cells below, but with one cell missing, leaving a clean square hole
through the middle you can see through. Two tiny legs, dot eyes, blank empty expression.
```

### Ải 5 · Xưởng Sản Phẩm — tông xanh bạc hà `#EFFBF4`

**File Excel rời** · đi tuần · `120×120` → `30×30`

```
A cute enemy: a single loose spreadsheet sheet, mint-white paper (#EFFBF4) with a faint
green grid of cells and one green corner tab, curling at the edges as if it drifted away
from a stack. Two tiny legs, dot eyes, sheepish smile.
```

**Dòng lỗi định dạng** · lao vào người · `120×120` → `30×30`

```
A cute aggressive enemy: a horizontal spreadsheet row strip, mint-white (#EFFBF4), each
cell drawn in a visibly different style — one cell with a date, one with a number, one
with ragged text — clashing together. Tipped forward, sharp pointed wedge at the front
edge, angry eyes, gritted teeth.
```

**Số lệch** · bay · `232×112` → `58×28`

```
A cute flying enemy: a single bold numeral shape on a mint-white rounded tile (#EFFBF4),
one of its digits visibly crooked and tilted out of alignment, flanked by two small
paper wings spread wide. Dot eyes, smug grin, hovering.
```

**Cột trùng tên** · bắn đạn · `120×120` → `30×30`

```
A cute turret-like enemy: two identical mint-white column header cells (#EFFBF4) stacked
and slightly offset so they overlap as exact twins, with a stubby cannon barrel
protruding horizontally from the right side. Two pairs of dot eyes, one on each header,
both staring flatly.
```

---

## 3b. Khung động cho quái — 30 tấm

Mục 3 ở trên chỉ cho **khung 1**. Mỗi con quái cần thêm **khung 2** để nó sống, tổng
15 × 2 = 30 tấm.

Không cần viết lại prompt từ đầu. Lấy đúng prompt khung 1 của con đó, rồi **nối thêm
một đoạn "khung 2"** bên dưới tuỳ theo loại quái.

Hai khung là đủ. Quái chỉ 30×30px, thêm khung thứ ba gần như không ai nhận ra.

### Vì sao khung 2 lại quan trọng hơn nó có vẻ

Với `charger` và `shooter`, khung 2 không phải để cho đẹp — nó là **tín hiệu báo trước
đòn đánh**. Engine đã có sẵn trạng thái đó (`o.dash > 0` và `o.cd < 0.4`), hiện đang tô
đỏ bằng code. Có sprite riêng thì người chơi đọc được ý đồ của quái, trận đánh chuyển từ
ăn may sang có kỹ năng.

### walker · nối vào cuối prompt khung 1

```
Second animation frame of the exact same character, identical in every other way: the
two tiny legs are now swapped into the opposite step, the body sits very slightly lower
as if mid-step, and the whole shape leans a few degrees forward. Same colours, same size,
same style, same facing direction.
```

### flyer · nối vào cuối prompt khung 1

```
Second animation frame of the exact same character, identical in every other way: both
wings are now swept fully downward instead of raised, and the body sits slightly higher
as if lifted by the downstroke. Same colours, same size, same style, same facing direction.
```

### charger · nối vào cuối prompt khung 1

Khung 1 nên vẽ nó **đứng yên, hiền, chưa có mũi đỏ**. Khung 2 mới là lúc nó xông tới.

```
Second animation frame of the exact same character, identical in every other way, now in
full charge: the body is tilted hard forward into the direction it faces, the pointed
front wedge is glowing hot brick red (#E0563F), two short white speed lines trail behind
it, eyes narrowed into an aggressive glare. Same colours elsewhere, same size, same style,
same facing direction.
```

### shooter · nối vào cuối prompt khung 1

Khung 1 để nòng tối. Khung 2 là lúc nhả đạn.

```
Second animation frame of the exact same character, identical in every other way, at the
moment of firing: the cannon barrel is glowing hot brick red (#E0563F) with a small
four-pointed muzzle flash at its tip, and the whole body is pushed back slightly by the
recoil. Same colours elsewhere, same size, same style, same facing direction.
```

### Bảng loại quái theo ải

| Ải | walker | flyer | charger | shooter |
|---|---|---|---|---|
| 1 · Cảng Cát Lái | Chứng từ lệch | Sai một ký tự | — | — |
| 2 · Kho Phân Loại | Kiện lạc tuyến | Kiện rơi tầng trên | Kiện văng ra | — |
| 3 · Sàn Điều Phối | Đơn dồn ca | Đơn trễ pickup | — | Hub báo đỏ |
| 4 · Phòng Dữ Liệu | Cột thiếu | — | Join nhân dòng | Query lỗi |
| 5 · Xưởng Sản Phẩm | File Excel rời | Số lệch | Dòng lỗi định dạng | Cột trùng tên |

### Những thứ KHÔNG cần vẽ thêm khung

Engine làm sẵn bằng code, xin thêm ảnh chỉ tốn công:

- **Nhấp nhô lên xuống** — code cộng một hàm sin vào toạ độ y
- **Chớp trắng lúc trúng đòn** — code vẽ đè trắng lên sprite
- **Lật mặt khi quay đầu** — code lật ngang, nên mọi sprite chỉ cần quay phải
- **Nổ tan lúc chết** — hạt particle, không phải sprite

---

---

## 4. Trùm — 5 con

`70×78px`, vương miện nhô thêm 20px. Vẽ 768×768 rồi thu về `70×98`. Cần thêm một biến
thể "sáng trắng" cho lúc trùm nhấp nháy trước khi ra đòn — đổi `flat cel shading` thành
`glowing pale cream, washed out` trên cùng tấm đó.

### Trùm Sai Mã Container · ải 1, giậm đất

```
A chunky cartoon boss: a battered shipping container standing upright on two short thick
legs, painted brick red (#E0563F), corrugated ribs, heavy dents, a large stencilled
container code plate on its chest with the characters deliberately smudged and
unreadable. Big angry eyebrows over glaring eyes, wide jagged mouth made of the container
doors. Two stubby arms with clenched fists. A small pointed lime-yellow crown (#D4F236)
sits on top of its head.
```

### Băng Chuyền Kẹt · ải 2, bắn loạt ba

```
A chunky cartoon boss: a jammed conveyor belt machine given a body, deep red steel frame
(#C0392B), a mouth made of belt rollers with parcels crushed and stuck between the teeth,
one roller bent out of line. Furious eyes, steam puffing from a side vent, two short
mechanical arms. A small pointed lime-yellow crown (#D4F236) on top.
```

### Trùm 90,1% · ải 3, lao ngang

Con này là mốc on-time thật của bạn ở Shopee. Để mặt đồng hồ trống, số mình vẽ đè.

```
A chunky cartoon boss: a giant round performance gauge given a body, deep purple casing
(#7A2E9D), a wide dial face taking up its chest with tick marks around the rim and a
heavy needle stuck low on the left in the red zone. Leave the dial face otherwise blank
with no numbers and no text. Smug narrowed eyes above the dial, sharp grin, two stubby
arms, crouched forward like it is about to charge. A small pointed lime-yellow crown
(#D4F236) on top.
```

### Đơn Vô Chủ · ải 4, bắn loạt ba

```
A chunky cartoon boss: an oversized orphaned parcel, dark navy blue (#2C3E75), slightly
translucent and ghostly at the bottom edge where it fades out, wrapped in loose tape. On
its chest a completely blank white shipping label with no writing at all. Hollow glowing
eyes, no mouth, two wispy arms. A small pointed lime-yellow crown (#D4F236) on top.
```

### CATEGORY.SKU · ải 5, lao ngang

```
A chunky cartoon final boss: a giant spreadsheet column header cell given a body, deep
green (#1F6E52), rectangular and heavy, split down the middle by a huge glowing crack
shaped like a single round dot punched through it. Leave the header face blank with no
text. Two glaring eyes on either side of the crack, sharp angular mouth below, two thick
arms braced wide. A small pointed lime-yellow crown (#D4F236) on top.
```

---

## 4b. Khung báo đòn cho trùm — 5 tấm

Cùng lý do như `charger`. Trùm nhấp nháy 0,55 giây trước khi ra đòn; hiện code đang tô
kem nhạt lên sprite gốc. Có khung riêng thì đọc rõ hơn nhiều.

Nối vào cuối prompt trùm tương ứng ở mục 4:

```
Second frame of the exact same boss, identical in pose and size, at the instant it winds
up to attack: the whole body glows hot and washed out in pale cream white, the eyes flare
bright, and a thin rim of light outlines the silhouette. Same shape, same proportions,
same facing direction.
```

---

## 5. Bẫy — 4 tấm

Tất cả dùng chung màu đỏ nguy hiểm `#E0563F`. Đó là quy ước của game: thấy đỏ là né.
Đừng đổi màu theo từng ải.

### Bãi gai · spike — lặp ngang, cao 13px · vẽ `512×96`

Phải lặp được theo chiều ngang vì bề rộng thay đổi 60–80px tuỳ chỗ.

```
A horizontally tileable row of sharp hazard spikes for a 2D platformer, seven identical
triangular metal spikes side by side pointing straight up, brick red (#E0563F) with a
darker red base and one bright highlight on each left facet. The left and right edges
must cut exactly mid-spike so the strip repeats seamlessly. Flat front-on side view, no
perspective, no ground beneath.
```

### Lưỡi cưa · saw — `120×120` → `30×30`

Engine quay tấm này liên tục, nên phải đối xứng tròn — lệch tâm là nhìn ra ngay.

```
A circular saw blade hazard for a 2D platformer, perfectly radially symmetric with eight
identical triangular teeth around the rim, brick red (#E0563F) with a darker red hub and
a small bolt in the exact centre. The centre of the blade must be the exact centre of the
image so it can be rotated in code without wobbling. Flat front-on view.
```

### Luồng phun · pulse — 2 tấm

Cột `104×296` → `26×74`. Miệng phun `120×32` → `30×8`, luôn nằm đó lúc tắt để người chơi
canh nhịp.

```
Two separate 2D platformer hazard pieces, generate as two images.
Image 1: a tall narrow vertical jet of pressurised steam shooting straight upward, brick
red (#E0563F) fading to a lighter red at the top, billowing rounded edges, roughly four
times taller than it is wide, flat cartoon shading.
Image 2: a small wide floor vent grate seen from the side, dark metal with three slots,
matching red rim, very short and wide.
```

---

## 6. Vật phẩm — 10 tấm · `24×24px`

Nhỏ xíu nên phải cực kỳ đơn giản: một vật, một màu chủ đạo, viền dày. Vẽ `256×256`.

### Hồi máu — viền hồng đỏ `#FF8F85`

| Ải | Tên | Prompt |
|---|---|---|
| 1 | Ly cà phê | `a Vietnamese iced coffee in a clear plastic cup with a domed lid and a straw, condensed milk swirl visible` |
| 2 | Bữa trưa ca đêm | `a stacked metal lunch tin box with a carry handle, lid slightly open with a puff of steam` |
| 3 | Nghỉ giữa ca | `a small plastic stool with a glass of iced tea resting on it, the classic Vietnamese street-side break` |
| 4 | Nghỉ năm phút | `a small round desk timer with a rounded knob on top, dial face left blank with no numbers` |
| 5 | Cà phê lần ba | `three small espresso cups nested in a row, the third one tipped and empty` |

Khuôn — thay `[VẬT]` bằng một dòng trong bảng:

```
A tiny game pickup icon: [VẬT], warm coral pink glow outline (#FF8F85). Chunky,
ultra-simple, readable at very small size.
```

### Đồ nghề — viền lime `#D4F236`, buff 12 giây

| Ải | Tên | Prompt |
|---|---|---|
| 1 | Máy quét mã vỏ | `a handheld barcode scanner gun with a short trigger grip, emitting one straight scan beam from the nose` |
| 2 | Súng bắn mã | `a label applicator gun with a small roll of blank stickers mounted on top` |
| 3 | Dashboard realtime | `a small tablet screen showing three rising bar-chart columns and one upward line, no text or numbers anywhere` |
| 4 | Câu SQL đúng | `an unrolled scroll of paper with three short abstract code lines and a glowing checkmark at the bottom, no readable text` |
| 5 | Data contract | `a folded document with a round wax seal and a ribbon at the bottom corner, three short abstract lines of writing, no readable text` |

Khuôn:

```
A tiny game pickup icon: [VẬT], bright lime yellow glow outline (#D4F236). Chunky,
ultra-simple, readable at very small size.
```

---

## 7. Đạn và hiệu ứng — 6 tấm

### Đạn · quái và trùm dùng chung — `144×144` → `18×18`

```
A small round energy projectile for a 2D platformer, brick red core (#E0563F) with a
brighter hot centre and a short soft tapering trail behind it, perfectly circular,
symmetrical. Flat cartoon shading, no motion blur photo effect.
```

### Vệt chém — `336×288` → `84×72`

Vẽ cho tầm dài nhất (lúc cầm đồ nghề), engine co lại khi đánh thường.

```
A crescent slash effect for a 2D action game, a wide arc sweeping from top to bottom
opening to the right, bright lime yellow (#D4F236) fading to transparent at both tapered
tips, thick at the middle, clean hard cartoon edge with a thin white inner core. No
character, effect only.
```

### Tia trúng đòn — `192×192` → `48×48`

```
A cartoon impact burst effect, a compact starburst of six chunky tapering shards
radiating from the centre, white core fading to lime yellow (#D4F236) at the tips.
Symmetrical, flat, no smoke, effect only.
```

### Bụi nhảy — `160×96` → `40×24`

```
A small cartoon dust puff for a platformer jump, two soft rounded white clouds spreading
outward and low to the ground, thin dark outline, semi-transparent at the edges. Effect
only, no ground.
```

### Hào quang nhặt đồ — `256×256` → `64×64`

```
A pickup sparkle burst, a ring of eight small four-pointed stars expanding outward from
an empty centre, bright lime yellow (#D4F236) with white cores, evenly spaced and
symmetrical. Effect only, transparent centre.
```

### Vòng báo đòn trùm — `400×160` → `100×40`

Hiện dưới chân trùm 0,55 giây trước khi ra đòn. Đây là thứ biến trận trùm từ "ăn may"
thành "đọc được".

```
A flat elliptical telegraph ring drawn on the ground beneath a boss, wide shallow ellipse
seen from a low side angle, thick brick red outline (#E0563F) with a semi-transparent red
fill and a brighter inner rim. Top-down ellipse shape only, no boss, no scenery.
```

---

## 8. Nền — 5 ải × 4 lớp = 20 tấm

Bốn prompt khuôn dùng chung cho cả năm ải. Với mỗi ải, thay phần trong ngoặc vuông bằng
đúng một dòng trong bảng.

| Ải | `[SCENE]` | `[FAR]` | `[MID]` | `[MÀU ĐẤT]` / `[MÀU MẶT]` |
|---|---|---|---|---|
| 1 · Cảng Cát Lái | `a container seaport at clear morning` | `#7BB9D4` gantry cranes | `#4E8FAE` stacked shipping containers | `#2F5F78` / `#24485C` |
| 2 · Kho Phân Loại | `a parcel sorting warehouse at dusk` | `#F0BE7E` roof trusses and skylights | `#CF8B45` stacked wooden crates and pallets | `#8C5A2B` / `#6E4520` |
| 3 · Sàn Điều Phối | `a logistics control floor at sunset` | `#FBA981` distant office towers | `#EE7A4D` server-rack towers and antenna masts | `#B4482A` / `#8E351E` |
| 4 · Phòng Dữ Liệu | `a cold data centre under blue light` | `#9BA2DE` cable trays and ducts | `#6C74BE` server cabinets with blinking lights | `#454C8E` / `#343A70` |
| 5 · Xưởng Sản Phẩm | `a bright product workshop at noon` | `#93D6B8` tall windows | `#5FB18E` large interlocking gears and machinery | `#3B7A61` / `#2C5E4A` |

### Lớp trời — `800×420`, đứng yên

Cứ để trơn, đừng nhét chi tiết — nhân vật phải nổi lên trên nó.

```
A flat 2D game background sky layer for [SCENE], very soft vertical colour wash only, no
clouds, no sun, no buildings, no detail of any kind. Extremely simple and low contrast so
that game characters read clearly on top of it. Wide landscape format.
```

### Lớp xa — `300×150`, lặp ngang, chạy 0,25×

```
A horizontally tileable far parallax layer for a 2D side-scroller set in [SCENE]. Flat
single-colour silhouettes of [FAR] in [MÀU FAR], no outlines, no shading, no highlights,
sitting along the bottom edge with open empty space above. The left and right edges must
match exactly so the strip repeats seamlessly. Transparent above the silhouettes.
```

### Lớp giữa — `220×140`, lặp ngang, chạy 0,55×

```
A horizontally tileable mid parallax layer for a 2D side-scroller set in [SCENE]. Chunky
simplified shapes of [MID] in [MÀU MID], two flat tones plus one soft highlight, thin
darker outline, sitting along the bottom edge with empty space above. Muted and low
contrast so foreground characters stay readable. The left and right edges must match
exactly so the strip repeats seamlessly. Transparent above the shapes.
```

### Mặt đất và bệ nhảy — đất `128×76`, bệ 3 mảnh cao 13px

Bệ nhảy phải cắt ba mảnh (đầu trái, thân lặp, đầu phải) vì bề rộng thay đổi từ 80 tới
170px. Đây là 9-slice, engine sẽ ghép lại.

```
Generate as two images, both for a 2D platformer set in [SCENE].
Image 1: a horizontally tileable ground strip, top surface in [MÀU MẶT] with a solid
darker body in [MÀU ĐẤT] filling the space below, a crisp bright edge highlight along the
very top. Left and right edges must match exactly for seamless repeat. Flat side view, no
perspective.
Image 2: a floating platform ledge cut into three separate pieces laid side by side — a
rounded left cap, a repeatable straight middle section, and a rounded right cap — coloured
[MÀU ĐẤT] with a light highlight strip along the top face. Very short and wide, roughly
six times wider than tall. Clear gaps between the three pieces.
```

---

## 9. Giao diện — 5 tấm

### Tim · đầy và rỗng — `120×112` → `15×14`

```
Generate as two images: a chunky cartoon game health heart icon with a thick dark outline
and one soft white highlight. Image 1 filled solid warm red (#FF6B5E). Image 2 the
identical heart but empty, drawn as a hollow outline only with a faint translucent grey
fill. Both must be exactly the same size and shape.
```

### Khung máu trùm — `1536×80` → `384×20`

```
A long horizontal boss health bar frame for a 2D game HUD, dark near-black rounded
container with a thin metallic bevel edge and small angular caps at both ends, completely
empty inside so a red fill can be drawn in code. No text, no numbers, no fill.
```

### Cửa ải · cuối bản đồ — `184×384` → `46×96`

Hiện đang là hai hình chữ nhật trắng.

```
A tall narrow glowing portal gate for a 2D platformer, a simple stone or metal arch frame
standing on the ground with a soft pale glowing light filling the opening, faint upward
light particles inside. Symmetrical, front-on side view, roughly twice as tall as it is
wide. No characters, no scenery around it.
```

### Biểu tượng đồ nghề · thanh đếm ngược — `64×64` → `16×16`

```
A very small square HUD status icon showing a simple wrench crossed over a spark, solid
lime yellow (#D4F236) on transparent, no outline detail, designed to stay readable at 16
pixels. Ultra-minimal, single flat colour.
```

### Ảnh bìa trang — `1200×630`

Để thay `public/og.png` riêng cho route `/game`.

```
A wide landscape key art banner for a cute casual 2D side-scrolling game about logistics
and data work. A chibi office-worker hero in a dark shirt stands on a floating platform on
the left holding a rolled paper document like a sword, facing right toward a large chunky
boss made of a battered red shipping container on the right. Behind them a soft blue
seaport skyline with gantry cranes and stacked containers, warm morning light. Leave the
upper middle area visually calm and uncluttered for a title to be placed later.
Hand-painted cartoon, bold outlines, flat cel shading, no text anywhere.
```

---

## 10. Đặt tên file

Bỏ tất cả vào `public/game/`:

```
public/game/
  player/    idle.png  run-1..4.png  jump.png  attack-1.png  attack-2.png  hurt.png
  mob/       m1-walker-1.png   m1-walker-2.png   m1-flyer-1.png   m1-flyer-2.png
             m2-walker-1/2.png m2-charger-1/2.png m2-flyer-1/2.png
             m3-walker-1/2.png m3-flyer-1/2.png   m3-shooter-1/2.png
             m4-walker-1/2.png m4-charger-1/2.png m4-shooter-1/2.png
             m5-walker-1/2.png m5-charger-1/2.png m5-flyer-1/2.png m5-shooter-1/2.png
  boss/      b1.png b2.png b3.png b4.png b5.png
             b1-tel.png b2-tel.png b3-tel.png b4-tel.png b5-tel.png
  trap/      spike.png  saw.png  pulse-jet.png  pulse-vent.png
  item/      heal-1..5.png  tool-1..5.png
  fx/        shot.png  slash.png  hit.png  dust.png  sparkle.png  telegraph.png
  bg/        m1-sky.png m1-far.png m1-mid.png m1-ground.png m1-plat.png
             ... tương tự m2 tới m5
  ui/        heart-full.png  heart-empty.png  bossbar.png  gate.png  tool-icon.png
  og.png
```

**Thứ tự nên làm**, nếu muốn ít việc mà đổi nhiều nhất:
nhân vật chính → 5 con trùm → 3 loại bẫy → lớp nền giữa. Bốn nhóm đó chiếm phần lớn
thứ mắt người chơi nhìn vào.

Engine hiện vẽ mọi thứ bằng hình khối trong code. Khi có ảnh thì thay các lệnh vẽ đó
bằng `drawImage`, thêm bộ preload và vòng lặp khung hình cho nhân vật. Không cần đủ hết
mới ráp được — nhóm nào xong ráp nhóm đó, ảnh thiếu vẫn để hình khối như cũ.
