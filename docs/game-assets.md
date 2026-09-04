# Prompt sinh ảnh cho minigame "Ải Vận Hành" — bản 2

Toàn bộ prompt để tạo asset cho game ở route `/game`.

**Bản 2 khác bản 1 ở đâu:** bản 1 đủ ảnh nhưng chơi lên thì thấy nhân vật phình to
lúc tung đòn, mặt mỗi khung một kiểu, chạy thì cứng, nền chỉ có tông màu. Ba lỗi đó
không sửa được bằng prompt hay hơn — phải sửa bằng **luật khung** (mục 1) và **nhiều
khung hơn** (mục 3). Đọc mục 0 và 1 trước, đừng nhảy thẳng xuống prompt.

Tổng: **176 tấm**. Không cần làm hết một lượt — mục 9 có bảng bật cờ, gen tới đâu bật
tới đó, engine dùng ngay phần đã có và giữ nguyên phần cũ.

## Bảng việc còn phải gen

Đây là **chỗ duy nhất** cần đọc để biết hiện game còn thiếu ảnh gì. Sửa code mà thêm
một thứ mới nhìn thấy được thì cập nhật bảng này ngay trong cùng lần sửa — xem
`CLAUDE.md` ở gốc repo.

| Cần gen | Số tấm | Hiện đang là gì | Mục |
|---|---|---|---|
| — | 0 | Đã hoàn tất toàn bộ bộ asset v2 | — |

**Đã xong (176 tấm):** 22 khung nhân vật · 64 khung quái (16 loại × 4) · 40 khung trùm
(đứng, báo đòn, trúng đòn, đi, ra đòn) · 20 lớp nền · 4 bẫy · 15 vật phẩm
`heal`/`tool`/`gun` · 3 khung vệt chém · `hit` `dust` `ring` `shot` `bullet` `muzzle`
`shield` · `gun-held` · `ground` `platform` · `gate` `heart-full` `bossbar`.

---

## 0. Ba lỗi của bộ asset đời 1

Đo bằng `python scripts/sprites.py check`, không phải cảm giác:

**1. Tỉ lệ nhân vật trôi giữa các khung.** Chiều cao đầu (đỉnh tóc → chin) trong
9 tấm hiện có: idle `120px`, run `126–133px`, jump `134px`, attack-2 `135px`,
attack-1 `147px`. Cùng một nhân vật mà cỡ đầu lệch tới **23%**. Nguyên nhân: mỗi tấm
được vẽ ở một mức zoom khác nhau, rồi bị **crop sát alpha và normalize về cùng chiều
cao file** — thao tác này xoá luôn thông tin "nhân vật to bao nhiêu". Engine cũ lại
ép mỗi khung vừa một cái hộp `maxW × maxH` khác nhau, nên cộng thêm một lớp lệch nữa.

**2. Mặt không cố định.** Khung chém có kiểu mắt to hơn, miệng mở, đường nét khác hẳn
khung đứng. Ba khung liên tiếp là ba cái mặt.

**3. Nền chỉ có tông màu và chưa lặp liền mép.** Ở bộ đời 1, `m1`, `m2`, `m3`, `m5`
có mép trái không khớp mép phải → cứ mỗi tấm lại một đường sọc chạy qua màn hình.
Ngoài ra chỉ có một lớp giữa, nên năm ải khác nhau đúng ở bảng màu.

Bản 2 chặn từng lỗi: (1) rig cố định + script chuẩn hoá, (2) khoá mặt bằng ảnh tham
chiếu, (3) spec seamless + tả cảnh cụ thể theo từng nơi làm việc.

Cả ba lỗi giờ đã chữa xong ở phần đã gen: bộ nhân vật v2 giữ đúng một khuôn mặt và
một cỡ đầu qua cả 18 khung; chín lớp nền mới đều lặp liền mép (`check` báo lệch 0) và
mỗi ải có hai lớp cảnh thật thay vì một mảng màu. Phần chưa gen — quái — vẫn là bộ
đời 1 hai khung, và engine vẫn hiệu chuẩn riêng cho nó.

---

## 1. Luật khung và rig — phần quan trọng nhất tài liệu này

### 1.1 Quy trình ba bước

Model sinh ảnh **không canh được pixel**, prompt có nói "head exactly 240px" thì nó
vẫn vẽ lệch. Nên đừng cố. Quy trình đúng là gen thoải mái rồi để máy kéo về đúng rig:

```bash
# 1. gen ảnh vào một thư mục tạm, khung to, nền trong suốt, một vật một tấm
# 2. xem số đo trước, chưa ghi gì
python scripts/sprites.py normalize raw/player out/ --kind player --dry-run
# 3. canh về rig. --fit none giữ nguyên cỡ, chỉ canh neo; --out-size cho nhẹ trang
python scripts/sprites.py normalize raw/player public/game/player --kind player --fit none --out-size 512
# 4. kiểm lại trước khi commit
python scripts/sprites.py check
```

`normalize` làm hai việc, và **phải chọn đúng chế độ**:

- `--fit none` — chỉ đặt tâm hông và gan bàn chân vào điểm neo, **không đụng tới cỡ**.
  Dùng khi bộ ảnh đã nhất quán cỡ nhân vật.
- `--fit head` — thêm việc phóng từng khung cho chiều cao đầu bằng spec. Chỉ dùng khi
  bộ ảnh thật sự lệch cỡ giữa các khung (như bộ đời 1, lệch 23%).

**Bài học từ đợt gen bộ nhân vật v2:** bộ đo tự động tìm chin bằng vệt màu da liền
khối, nên khung nào có cẳng tay hoặc bàn tay chạm vào mặt/cổ thì vệt da nối liền
xuống tay và số đo phồng lên — khung sạch ra 350, khung `land` ra 489. Bộ ảnh vốn đã
nhất quán, mà chạy `--fit head` theo mấy số đó thì chính script làm nó lệch 40%. Vì
vậy: **luôn `--dry-run` trước, và soi bằng mắt trước khi cho phóng.** Nếu các khung
sạch (không có tay che mặt) đều cho cùng một số, tin số đó và dùng `--fit none`.

`--out-size 512` thu khung xuất về 512² sau khi canh neo. Engine vẽ nhân vật cao 87px,
tức 174px trên màn Retina, nên 512 vẫn dư gấp ba — mà 18 khung 1024² là 7MB tải về,
512² còn 2,3MB.

### 1.1b Nén trước khi commit — `pack`

Engine preload toàn bộ asset ngay lúc vào trang, nên cân nặng là chuyện thật, không
phải chuyện sạch sẽ. Lệnh `pack` làm hai việc và chạy được trên mọi thư mục ảnh:

```bash
python scripts/sprites.py pack public/game/player public/game/player   # ghi đè tại chỗ
python scripts/sprites.py pack raw/bg public/game/bg --trim-v          # cho lớp nền
```

- **Dọn alpha.** Tách nền bằng máy để lại hai thứ rác: phần "đặc" chỉ tới alpha ~240
  (cả lớp hơi trong, nền dưới hắt lên) và một lớp mờ 1–31 ở chỗ đáng lẽ trong hẳn —
  thấy rõ nhất là mảng trời lọt giữa hai chân cần cẩu. `pack` ép hai đầu về 0 và 255,
  giữ nguyên dải giữa vì đó là viền khử răng cưa thật và vệt sáng của hiệu ứng.
- **Nén bảng màu 256.** Ở cỡ vẽ trong game không phân biệt được với bản gốc — đã soi
  ở 3×, 5×, 6× cỡ game — mà file nhẹ đi ba tới mười lần. Cả bộ asset từ **10MB xuống
  3,1MB**. Muốn giữ màu thật thì `--colors 0`.
- `--trim-v` cắt hàng trong suốt trên/dưới. **Chỉ dùng cho lớp nền**, xem mục 7.1.
  Cắt sprite là hỏng rig.

### 1.2 Bảng rig

| Nhóm | Khung tham chiếu | Thước đo | Tâm thân (ax) | Mặt sàn (ay) |
|---|---|---|---|---|
| Nhân vật | `1024×1024` | chiều cao đầu ≈ `350px` | `x = 512` | `y = 960` |
| Quái | `512×512` | chiều cao thân `440px` | `x = 256` | `y = 476` |
| Trùm | `768×768` | chiều cao thân `660px` | `x = 384` | `y = 714` |

Ba con số này khớp với `PLAYER_RIG` / `MOB_RIG_V2` / `BOSS_RIG_V2` trong
`components/game/engine.ts` và `SPEC` trong `scripts/sprites.py`. Sửa một chỗ thì
phải sửa cả ba.

Hai điều cần hiểu về bảng này:

- **Con số thước đo không quan trọng, sự nhất quán mới quan trọng.** Engine chỉ đọc
  một số duy nhất (`PLAYER_RIG.unit`) rồi phóng mọi khung theo đó. Bộ v2 gen ra đầu
  cao ~353px chứ không phải 240 như prompt xin — không sao, chỉ cần ghi đúng 353 vào
  engine là xong. Cái không chữa được bằng một con số là **mỗi khung một cỡ khác nhau**.
- **Khung xuất được phép nhỏ hơn khung tham chiếu**, miễn vuông. Rig trong engine tính
  theo tỉ lệ nên 512² hay 1024² đều đúng cỡ như nhau. Bộ nhân vật đang xuất ở 512².

**Tâm thân lấy ở hông, không lấy ở giữa ảnh.** Khung chém có tay vung ra ngoài thân,
giữa ảnh lệch hẳn khỏi người — neo theo giữa ảnh là nhân vật trượt ngang mỗi lần đổi
khung. Script tự đo dải hông (52–66% chiều cao thân), không phải khai bằng tay.

### 1.3 Sáu luật dán vào mọi prompt nhân vật, quái, trùm

1. **Không crop.** Xuất nguyên khung, để nhân vật có lề trống quanh người. Crop sát
   alpha là thứ đã phá bộ đời 1.
2. **Cùng một cỡ nhân vật trong mọi khung.** Nói thẳng trong prompt: *"exactly the
   same character size and head size as the reference image"*.
3. **Nền trong suốt thật.** Model nào không xuất được alpha thì thêm
   `on a flat #FF00FF magenta background` rồi tách nền sau.
4. **Một tấm một vật.** Đừng xin sprite sheet — model sẽ vẽ mỗi khung một kiểu.
5. **Quay mặt sang phải.** Engine tự lật khi đi ngược.
6. **Không vẽ bóng đổ dưới chân, không vẽ vệt chuyển động.** Engine vẽ cả hai, vẽ
   sẵn trong ảnh là chồng hai lớp.

### 1.4 Model nào hợp

| Model | Hợp với |
|---|---|
| Nano Banana / GPT Image | Nhân vật nhiều khung — bám ảnh tham chiếu tốt nhất, đây là thứ quan trọng nhất ở đây |
| Midjourney | Trùm và key art. Giữ style bằng `--sref`, giữ nhân vật bằng `--cref` |
| Recraft | Vật phẩm nhỏ, icon. Xuất nền trong suốt thật |
| Flux | Nền và lớp parallax |

> Trùm có chữ trên người ("90,1%", "CATEGORY.SKU") thì model sẽ viết sai chính tả gần
> như chắc chắn. Prompt bên dưới đã bảo nó để mặt trống — chữ vẽ đè sau bằng code.

---

## 2. Style chung — dán trước mọi prompt

Một khối duy nhất, không đổi trong suốt dự án.

```
2D game sprite for a cute casual side-scrolling MMO, hand-painted cartoon in the
spirit of classic MapleStory. Bold dark outline, flat cel shading with exactly two
tones plus one soft highlight, friendly chunky proportions, slightly oversized head,
readable silhouette at small size. Side view, facing right, centered in frame, full
body visible with generous margin on all sides. Fully transparent background, no
ground shadow, no motion trail, no scenery, no text, no watermark, no border, single
object only. Do not crop the subject.
```

---

## 3. Nhân vật chính — 18 khung

Sprite hiển thị trong game cao khoảng `72px`, đầu `30px`. Hitbox thân `26×40px` tính
riêng, không liên quan tới ảnh.

### 3.1 Tấm gốc — làm xong tấm này rồi mới làm tiếp

`player/idle-1.png`. Ưng ý tấm này rồi thì **upload nó làm ảnh tham chiếu cho tất cả
17 khung còn lại**. Bỏ qua bước này thì mỗi tấm một mặt, đúng như bản 1.

```
A young Vietnamese office worker as a cute chibi game hero, standing idle. Short
black hair, warm light skin, dark charcoal short-sleeve shirt (#1E1E1C) and simple
dark trousers, a plain lanyard badge around the neck. Calm friendly face, small
confident smile. Holding a rolled-up paper document in the right hand like a light
sword, tip pointing down. Feet together, relaxed shoulders.
```

### 3.2 Khối khoá mặt — dán vào cuối mọi khung nhân vật

Đây là câu chữa lỗi số 2 ở mục 0.

```
Use the reference image as the exact same character. Keep the face IDENTICAL to the
reference: same eye shape and eye size, same eyebrows, same nose, same mouth line,
same hairstyle and same hair volume, same head size relative to the body. Only the
limbs, the torso lean and the clothing folds may change. Do not restyle the face, do
not enlarge the eyes, do not change the expression unless this frame explicitly asks
for it. Same character size in frame as the reference.
```

### 3.3 Đứng yên · 3 khung — `idle-1..3`

Ba khung thở, engine đảo 3 khung/giây. Khung 1 là tấm gốc ở 3.1.

```
Frame [2 / 3] of a 3-frame idle breathing cycle of the same chibi office-worker hero.
Frame 2: chest lifted slightly on the inhale, shoulders a touch higher, head level.
Frame 3: chest settled on the exhale, shoulders relaxed low, head tipped down by a
hair. Feet stay planted in exactly the same place in all three frames.
```

### 3.4 Chạy · 8 khung — `run-1..8`

Bản 1 chỉ có 4 khung và không nói rõ khung nào là khung nào, nên nhịp chạy bị cứng.
Tám khung dưới đây là một chu kỳ chạy chuẩn: hai lần đạp, hai lần bay người. Xin
**riêng từng khung**, và nói rõ số khung.

| Khung | Dáng |
|---|---|
| 1 | contact — chân phải vừa chạm đất phía trước, chân trái vươn ra sau, người hơi chúi |
| 2 | down — chân phải khuỵu nhận trọng lượng, người thấp nhất trong chu kỳ |
| 3 | passing — chân phải thẳng đỡ toàn thân, chân trái co lên ngang qua, người cao dần |
| 4 | up — bật lên, cả hai chân rời đất, người cao nhất trong chu kỳ |
| 5 | contact — đổi chân: chân trái chạm đất phía trước |
| 6 | down — chân trái khuỵu, người thấp nhất |
| 7 | passing — chân trái thẳng, chân phải co lên ngang qua |
| 8 | up — bật lên, hai chân rời đất |

```
Frame [N] of 8 in a single run cycle of the same chibi office-worker hero, running to
the right. [DÁNG TỪ BẢNG TRÊN]. Arms swing in opposition to the legs, elbows bent, the
rolled paper document held low in the right hand, hair pushed back by the wind, mouth
set in a determined line. Keep the feet on an invisible ground line at the same height
in every frame — never lift the whole character up to fill the frame.
```

### 3.5 Nhảy · 3 khung — `jump-rise`, `jump-fall`, `land`

Bản 1 chỉ có một khung `jump.png` dùng cho cả lúc bốc lên và lúc rơi xuống, nên cú
nhảy không có trọng lượng.

```
Three separate frames of the same chibi office-worker hero.
jump-rise: the instant after take-off, body stretched upward, legs trailing down and
slightly together, one arm raised, rolled document held out to the side, hair and
shirt lifted by the speed, eyes looking up, excited.
jump-fall: falling, body compact, knees pulled up in front, both arms slightly out for
balance, hair blown upward, eyes looking down at the landing spot.
land: the frame of impact, knees deeply bent in a crouch, one hand touching the
ground, body compressed low and wide, head tucked, dust implied only by the pose.
```

### 3.6 Chém · 3 khung — `attack-1..3`

**Không vẽ vệt chém.** Engine vẽ vệt lưỡi liềm riêng (mục 6) và nó cần được đồng bộ
theo thời gian, vẽ sẵn trong ảnh là hỏng.

```
Three separate frames of the same chibi office-worker hero swinging the rolled paper
document, facing right.
attack-1: wind-up, weight shifted onto the back foot, torso twisted away, document
drawn back high behind the shoulder, front hand open for balance, eyes locked forward.
attack-2: full extension, torso twisted into the swing, document sweeping down and
forward at chest height in front of the body, front foot planted, back leg braced.
attack-3: recovery, document lowered past the front knee, torso unwinding back to
neutral, weight settling onto the front foot, shoulders dropping.
Determined expression, mouth closed and firm — do not open the mouth, do not enlarge
the eyes. No motion trail, no slash effect, no glow, only the character.
```

### 3.7 Trúng đòn — `hurt.png`

```
The same chibi office-worker hero knocked backward, body tilted back, arms flung up,
eyes squeezed shut in a comic "ouch" expression, one foot off the ground, papers
scattering from the hand.
```

---

## 4. Quái — 16 loại × 4 khung = 64 tấm

Sprite hiển thị `44px` (quái bay `32px`, rider `46px`). Vẽ `512×512`, không crop.

### 4.1 Bốn khung nghĩa là gì

Engine chọn khung theo trạng thái, không phải cứ đảo vòng. Vẽ sai nghĩa khung thì
hoạt ảnh có mà như không:

| Loại | Khung 1–2 | Khung 3 | Khung 4 |
|---|---|---|---|
| `walker` | bốn khung đi đều, đảo vòng 1→2→3→4 (bảng dưới) | | |
| `flyer` | bốn khung vỗ cánh, đảo vòng: cánh trên, giữa hạ, cánh dưới, giữa nâng | | |
| `charger` | đứng nhấp nhô, đảo 1↔2 | rùng mình báo đòn (0,25 giây) | đang lao tới |
| `rider` | chạy chậm, đảo 1↔2 | rú ga báo đòn (0,5 giây) | đang lao tới |
| `shooter` | đứng, đảo 1↔2 | nhắm, nòng chĩa về người chơi | vừa nhả đạn, giật lùi |

Khối nối cho `walker` (dán vào cuối prompt gốc, thay `[N]`):

```
Frame [N] of 4 in a walk cycle of the exact same creature, identical in size, colour
and expression. Frame 1: both stubby legs together, body at rest height. Frame 2: left
leg forward, body dipped slightly. Frame 3: legs together, body at its highest.
Frame 4: right leg forward, body dipped slightly. Keep the feet on the same invisible
ground line in all four frames.
```

Khối nối cho `flyer`:

```
Frame [N] of 4 in a wing-flap cycle of the exact same creature, identical in size,
colour and expression. Frame 1: wings raised high above the body. Frame 2: wings
mid-stroke coming down, body lifted. Frame 3: wings pushed fully down and spread wide,
body at its lowest. Frame 4: wings mid-stroke coming back up, body rising.
```

Khối nối cho `charger` và `rider`:

```
Frame [N] of 4 of the exact same creature, identical in size and colour.
Frame 1: idle, weight settled, watching.
Frame 2: idle, weight shifted a touch to the other side — same pose, tiny variation.
Frame 3: winding up to charge, crouched back and coiled, eyes narrowed and locked on
the target, body trembling with a faint red-orange warning glow along its front edge.
Frame 4: mid-charge, stretched forward horizontally, body leaning hard into the
direction of travel, everything loose behind it swept back.
```

Khối nối cho `shooter`:

```
Frame [N] of 4 of the exact same creature, identical in size and colour.
Frame 1: idle, barrel pointing slightly down, calm.
Frame 2: idle, same pose with a small breathing shift.
Frame 3: aiming, barrel raised level and pointing right at the target, a hot red glow
building inside the muzzle.
Frame 4: the instant after firing, body rocked back by the recoil, muzzle flaring
bright, a small puff of smoke at the barrel tip.
```

### 4.2 Ải 1 · Cảng Cát Lái — tông giấy ngà `#FAF6E8`

**Chứng từ lệch** · `walker`

```
A cute enemy creature made of a crumpled shipping manifest, off-white cream paper
(#FAF6E8) with faint printed rows, one smudged red ink stamp, dog-eared corner. Two
tiny stubby legs sticking out below, two small dot eyes and a flat worried mouth on
the paper face. Slightly rounded square body.
```

**Sai một ký tự** · `flyer`

```
A cute flying enemy: a single wrong character tile, a small cream paper square
(#FAF6E8) showing one bold mismatched letter, flanked by two small folded-paper wings
spread wide on both sides. Two dot eyes, mischievous grin, hovering pose.
```

### 4.3 Ải 2 · Kho Phân Loại — tông thùng giấy `#FFF3DC`

**Kiện lạc tuyến** · `walker`

```
A cute enemy: a small cardboard parcel (#FFF3DC) with packing tape across the top and
a crooked shipping label showing scribbled unreadable marks, one corner dented. Two
tiny legs below, two dot eyes and a confused wavy mouth.
```

**Kiện văng ra** · `charger`

```
A cute but aggressive enemy: a cardboard parcel (#FFF3DC) tipped forward like it was
flung off a conveyor, angry slanted eyes, gritted teeth, a sharp pointed wedge of torn
tape jutting from its front edge like a beak, dented back corner.
```

**Kiện rơi tầng trên** · `flyer`

```
A cute flying enemy: a small cardboard parcel (#FFF3DC) with two long loose strips of
packing tape spread out on both sides like flapping wings, dangling below a tiny torn
label. Dot eyes, open surprised mouth, tilted as if drifting down.
```

### 4.4 Ải 3 · Sàn Điều Phối — tông cam kem `#FFEDD8`

**Đơn trễ pickup** · `flyer`

```
A cute flying enemy: a small warm cream order slip (#FFEDD8) with a tiny round alarm
clock face printed on it showing an overdue time, two small paper wings spread on both
sides. Dot eyes, sweat drop, anxious expression.
```

**Hub báo đỏ** · `shooter`

```
A cute turret-like enemy: a tiny cream warehouse hub building (#FFEDD8) with a shutter
door face, a red rotating warning beacon on its roof, and a short stubby cannon barrel
protruding horizontally from its right side. Two dot eyes above the barrel, stern mouth.
```

**Đơn dồn ca** · `walker`

```
A cute enemy: a thick stack of cream order slips (#FFEDD8) bound with a stretched
rubber band, leaning and overstuffed, papers fanning out at the edges. Two tiny legs
buckling under the weight, dot eyes, strained grimace.
```

**Rider giao gấp** · `rider` · **loại mới của bản 2**

Con này là ngoại lệ duy nhất của luật "quái phải cute": nó phải **không có mặt**. Nhìn
xa nhất (430px), báo đòn 0,5 giây bằng tiếng rú ga và đèn pha, rồi lao ngang với tốc
độ gấp đôi `charger`. Engine đang vẽ nó bằng code — có bộ ảnh này thì bật
`ASSETS.riderArt = true`.

```
A cute-but-ominous enemy for a casual 2D side-scroller: a delivery rider hunched low
over a small scooter, seen from the side, facing right. The rider wears a bright
Shopee-orange (#EE4D2D) delivery jacket and a matching insulated delivery box strapped
behind the seat. The head is a plain dark full-face helmet with NO FACE AT ALL — the
visor is a solid black void with a single thin cold cyan light line across it, in the
style of a mysterious hooded anime character. Skin never visible: dark gloves, dark
trousers, dark boots. The scooter is charcoal grey with two chunky black wheels and one
warm yellow headlight at the front. Silhouette must stay simple and readable at small
size: helmet, orange torso, delivery box, two wheels. Menacing but stylised, not gory.
```

Khung 3 (rú ga) và khung 4 (lao) của rider dùng khối nối `charger/rider` ở 4.1, thêm:

```
Frame 3 extra: the headlight blazes bright and throws a visible cone of warm light
forward, the front wheel turned straight at the target, exhaust puffing behind.
Frame 4 extra: the whole bike stretched horizontally by the speed, front wheel lifted a
touch, the rider flattened over the handlebars, white speed lines trailing behind the
rear wheel.
```

### 4.5 Ải 4 · Phòng Dữ Liệu — tông xanh tím nhạt `#E8EAFF`

**Query lỗi** · `shooter`

```
A cute turret-like enemy: a small floating terminal window, pale lavender-white body
(#E8EAFF) with a dark screen showing three short abstract code lines and one red error
bar, a stubby cannon barrel protruding horizontally from its right edge. Dot eyes on
the window frame, flat annoyed mouth.
```

**Join nhân dòng** · `charger`

```
A cute aggressive enemy: two identical pale lavender table fragments (#E8EAFF) fused
together and duplicating outward, showing doubled rows, leaning forward with a sharp
pointed wedge at the front. Angry slanted eyes, jagged grin, a faint third copy
ghosting behind it.
```

**Cột thiếu** · `walker`

```
A cute enemy: a tall narrow pale lavender data column block (#E8EAFF) with a header bar
on top and stacked cells below, but with one cell missing, leaving a clean square hole
through the middle you can see through. Two tiny legs, dot eyes, blank empty expression.
```

### 4.6 Ải 5 · Xưởng Sản Phẩm — tông xanh bạc hà `#EFFBF4`

**File Excel rời** · `walker`

```
A cute enemy: a single loose spreadsheet sheet, mint-white paper (#EFFBF4) with a faint
green grid of cells and one green corner tab, curling at the edges as if it drifted away
from a stack. Two tiny legs, dot eyes, sheepish smile.
```

**Dòng lỗi định dạng** · `charger`

```
A cute aggressive enemy: a horizontal spreadsheet row strip, mint-white (#EFFBF4), each
cell drawn in a visibly different style — one cell with a date, one with a number, one
with ragged text — clashing together. Tipped forward, sharp pointed wedge at the front
edge, angry eyes, gritted teeth.
```

**Số lệch** · `flyer`

```
A cute flying enemy: a single bold numeral shape on a mint-white rounded tile (#EFFBF4),
one of its digits visibly crooked and tilted out of alignment, flanked by two small
paper wings spread wide. Dot eyes, smug grin.
```

**Cột trùng tên** · `shooter`

```
A cute turret-like enemy: two identical mint-white column header cells (#EFFBF4) stacked
and slightly offset so they overlap as exact twins, with a stubby cannon barrel
protruding horizontally from the right side. Two pairs of dot eyes, one on each header,
both staring flatly.
```

---

## 5. Trùm — 5 con × 8 khung = 40 tấm

Tám khung mỗi con:

| Khung | Dùng khi | Có chưa |
|---|---|---|
| `bX.png` | đứng yên | ✅ |
| `bX-tel.png` | báo đòn, 0,55 giây trước khi ra đòn | ✅ |
| `bX-hit.png` | vừa ăn đòn | ✅ |
| `bX-walk-1..4.png` | đang đi tới chỗ người chơi | ✅ |
| `bX-atk.png` | đòn đã bung ra (giậm / nhả loạt / lao) | ✅ |

Toàn bộ khung trùm đã xong và được bật trong engine.

### 5.1 Trùm Sai Mã Container · ải 1, giậm đất

```
A chunky cartoon boss: a battered shipping container standing upright on two short thick
legs, painted brick red (#E0563F), corrugated ribs, heavy dents, a large stencilled
container code plate on its chest with the characters deliberately smudged and
unreadable. Big angry eyebrows over glaring eyes, wide jagged mouth made of the container
doors. Two stubby arms with clenched fists. A small pointed lime-yellow crown (#D4F236)
sits on top of its head.
```

### 5.2 Băng Chuyền Kẹt · ải 2, bắn loạt ba

```
A chunky cartoon boss: a jammed conveyor belt machine given a body, deep red steel frame
(#C0392B), a mouth made of belt rollers with parcels crushed and stuck between the teeth,
one roller bent out of line. Furious eyes, steam puffing from a side vent, two short
mechanical arms. A small pointed lime-yellow crown (#D4F236) on top.
```

### 5.3 Trùm 90,1% · ải 3, lao ngang

Con này là mốc on-time thật ở Shopee. Để mặt đồng hồ trống, số vẽ đè bằng code.

```
A chunky cartoon boss: a giant round performance gauge given a body, deep purple casing
(#7A2E9D), a wide dial face taking up its chest with tick marks around the rim and a
heavy needle stuck low on the left in the red zone. Leave the dial face otherwise blank
with no numbers and no text. Smug narrowed eyes above the dial, sharp grin, two stubby
arms, crouched forward like it is about to charge. A small pointed lime-yellow crown
(#D4F236) on top.
```

### 5.4 Đơn Vô Chủ · ải 4, bắn loạt ba

```
A chunky cartoon boss: an oversized orphaned parcel, dark navy blue (#2C3E75), slightly
translucent and ghostly at the bottom edge where it fades out, wrapped in loose tape. On
its chest a completely blank white shipping label with no writing at all. Hollow glowing
eyes, no mouth, two wispy arms. A small pointed lime-yellow crown (#D4F236) on top.
```

### 5.5 CATEGORY.SKU · ải 5, lao ngang

```
A chunky cartoon final boss: a giant spreadsheet column header cell given a body, deep
green (#1F6E52), rectangular and heavy, split down the middle by a huge glowing crack
shaped like a single round dot punched through it. Leave the header face blank with no
text. Two glaring eyes on either side of the crack, sharp angular mouth below, two thick
arms braced wide. A small pointed lime-yellow crown (#D4F236) on top.
```

### 5.6 Hai khung phụ — nối vào cuối prompt trùm tương ứng

```
-tel frame: the exact same boss, identical in pose, size and facing direction, at the
instant it winds up to attack: the whole body glows hot and washed out in pale cream
white, the eyes flare bright, a thin rim of light outlines the silhouette, and the body
is coiled a fraction lower and wider as if loading up.
-hit frame: the exact same boss, identical in size and facing direction, at the instant
it takes a hit: body flinching back, head snapped away from the impact, eyes screwed
shut, mouth open in a grunt, whole silhouette flashed bright and desaturated.
```

### 5.7 Chu kỳ đi và khung ra đòn — 25 tấm · **ĐÃ XONG**

Trùm đi tới chỗ người chơi ở tốc độ 51px/s trong suốt trận, mà chỉ có một khung đứng
— nên nó **trượt ngang như đẩy tủ lạnh**. Engine đã có bản chữa tạm: nhấc người 3px
hai lần mỗi chu kỳ, bóp dọc lúc chân chạm đất, lắc thân 2,5 độ, nhả bụi và rung màn
nhẹ mỗi bước. Đủ để đọc ra "đang bước", nhưng chân vẫn không cử động — cần ảnh.

**Nhịp bốn khung.** Trùm nặng nên chu kỳ dài và thấp, không nảy như nhân vật: một chu
kỳ là **96px** đường đi (nhân vật 150px), tức khoảng 1,9 giây một chu kỳ hai bước.

```
walk-1: weight on the near leg just planted, body at its LOWEST, other leg lifted
        behind, torso leaning very slightly forward.
walk-2: mid-stride, both legs passing each other, body at its HIGHEST, torso upright.
walk-3: mirror of walk-1 — the other leg just planted, body at its lowest again.
walk-4: mirror of walk-2 — legs passing, body at its highest, torso upright.
```

Nối khối này vào cuối prompt của từng con trùm ở mục 5.1–5.5:

```
Generate four separate walk-cycle frames of the exact same boss, identical in size,
colour, facing direction and every design detail, walking to the LEFT in profile
three-quarter view. It is a heavy slow walker, so keep the vertical travel small — the
body should rise and fall only a little, never bounce. Do not change the head size or
the crown between frames.
Frame 1: near leg just planted taking the weight, body at its lowest point, far leg
lifted and trailing behind, torso tipped a few degrees forward, arms swinging opposite
to the legs.
Frame 2: both legs passing each other mid-stride, body at its highest point, torso
upright, arms crossing the body.
Frame 3: the mirror of frame 1 with the other leg planted, body at its lowest again.
Frame 4: the mirror of frame 2, legs passing, body at its highest, torso upright.
Transparent background, no ground, no shadow, no motion blur, no speed lines, no text.
```

Khung ra đòn — một tấm mỗi con, đúng lúc đòn đã bung ra (0,3 giây). Đòn khác nhau
theo `bossKind`, nên chọn đúng câu cho từng con:

```
atk frame: the exact same boss, identical in size, colour and every design detail, at
the instant its attack lands — fully committed and extended, not winding up.
· ải 1 (giậm đất, slam): both fists slammed straight down onto the ground, body
  crouched deep, shockwave cracks spreading out from its feet.
· ải 2 và 4 (bắn loạt ba, volley): body flung wide open, chest thrown forward, three
  projectiles just leaving it, arms flared back.
· ải 3 và 5 (lao ngang, dash): body stretched forward almost horizontal in a full
  lunge, leading arm reaching out, rear leg kicked out straight behind.
Transparent background, no ground, no shadow, no text.
```

Sau khi gen: đặt `ASSETS.bossWalk = 4` và `ASSETS.bossAtk = true`. `bossWalk` là loại
**bắt buộc trọn bộ** — thiếu một ải là con trùm ải đó nhấp nháy về khung đứng.

---

## 6. Bẫy và hiệu ứng — 18 tấm

### 6.1 Bẫy — 4 tấm (giữ nguyên bản 1)

Tất cả dùng chung màu đỏ nguy hiểm `#E0563F`. Đó là quy ước của game: thấy đỏ là né.
Đừng đổi màu theo từng ải.

```
spike (512×96, lặp ngang): a horizontally tileable row of chunky triangular floor
spikes in brick red (#E0563F) with a dark metal base strip, flat side view. Left and
right edges must match exactly for seamless repeat.
saw (512×512): a circular buzz-saw blade seen face-on, brick red (#E0563F) with eight
chunky triangular teeth around the rim and a dark bolt hub at the exact centre.
Perfectly radially symmetric so it can be rotated around its centre in code.
pulse-jet (256×768, tall): a vertical jet of hot air or steam shooting straight upward,
brick red at the base fading to pale translucent at the top, soft rounded plume shape,
same width all the way up.
pulse-vent (256×64, short and wide): a small dark floor vent grate with a red rim,
flat side view, sitting on the ground.
```

### 6.2 Vệt chém lưỡi liềm — 3 tấm · **đã xong**

Engine chạy ba khung tuần tự theo tiến độ đòn (`ASSETS.slashFx = 3`); chưa có ảnh thì
nó tự vẽ cung lưỡi liềm bằng code.

**Ảnh hiệu ứng phải neo ở tâm cung, không phải mép ảnh.** Lưỡi liềm trong ảnh cong
quanh một tâm nằm khoảng 27% chiều rộng tính từ mép trái và 48% chiều cao. Bản đầu
engine neo vào mép ảnh nên cả vệt văng lên góc trên bên phải, cách người cả thân
người. Ba con số neo nằm trong `drawSlash()` — gen lại vệt chém với hình cong khác
thì phải dò lại chúng.

```
Three separate frames of a crescent slash effect for a 2D action game, no character.
Each frame is a thin curved arc like a crescent moon blade, thick in the middle and
tapering to sharp points at both ends, sweeping from the top-right down to the
bottom-right (as if a right-handed swing seen from the side). Colour: hot white core
fading out through pale lime yellow (#D4F236) to fully transparent at the outer edge.
Frame 1: short arc, only the top third of the sweep, brightest.
Frame 2: full arc across the whole sweep, widest and thickest.
Frame 3: the arc dissolving, thinner, broken into a few drifting sparks at the tail.
Transparent background, nothing else in frame, no character, no scenery.
```

### 6.3 Ba hiệu ứng nhỏ — 3 tấm

Engine cũng đang vẽ mấy cái này bằng code. Gen ảnh chỉ để nâng chất, không bắt buộc.

```
hit (256×256): a sharp impact starburst, white hot centre with six uneven angular
spikes radiating out, thin lime yellow (#D4F236) rim, transparent background.
dust (256×128, wide): a small soft puff of pale grey-white dust, three overlapping
rounded clouds sitting low and spreading sideways, semi-transparent, transparent
background.
ring (256×256): a thin expanding shockwave ring seen slightly from above, pale lime
yellow (#D4F236), bright at the rim and empty in the middle, transparent background.
```

### 6.4 Đạn — 1 tấm

```
shot (256×256): a small round energy projectile for a 2D game, solid brick red core
(#E0563F) with a bright white highlight on its upper left and a soft red glow around
it, perfectly round, transparent background.
```

### 6.5 Súng quét và đỡ đòn — 7 tấm · **ĐÃ XONG**

Hai cơ chế mới: bắn tầm xa (phím `K`, nhặt súng dọc đường, 14 viên) và đỡ đòn (giữ
`L`, tốn thể lực, bấm đúng nhịp thì bật ngược đạn về). Cả hai đang chạy bằng hình vẽ
trong code — khẩu súng là ba cái `roundRect`, khiên là một cung `arc`, tia đạn là một
dải gradient. Đọc được nhưng lệch hẳn khỏi phần còn lại của game.

**Màu quy ước:** xanh nhạt `#9FD8FF` cho mọi thứ thuộc súng và khiên. Đỏ `#E0563F` là
của địch, lime `#D4F236` là của đòn chém — thêm màu thứ ba để người chơi phân biệt
được đạn của mình với đạn của quái trong một phần giây.

Hai khung nhân vật, dán **khối khoá mặt ở mục 3.2** vào cuối như mọi khung nhân vật:

```
shoot-1: the same character, same size and same face as the reference, standing
side-on facing right, firing a compact pale-blue handheld scanner gun (#9FD8FF) held
out at chest height in the near hand — the gun is drawn as part of the frame. Body
recoiling: torso rotated a few degrees back, gun arm snapped straight, rear foot
braced, head steady and eyes on the target. No muzzle flash in this frame.
shoot-2: the exact same pose one beat later, recoil absorbed — gun arm bent back in
toward the chest, torso returning upright, weight settling onto the front foot.
```

```
guard (player/guard.png): the same character, same size and same face as the
reference, braced behind a guard: knees bent low, weight dropped, near shoulder turned
forward into the blow, both forearms raised and crossed in front of the chest and face,
chin tucked, eyes narrowed and looking over the arms. Facing right, side-on. Do not
draw a shield object — the shield is added separately by code.
```

Bốn tấm còn lại là vật và hiệu ứng, không có nhân vật:

```
gun-held (player/gun-held.png, 256×192): a compact handheld barcode-scanner gun seen
from the side, pale blue body (#9FD8FF) with a dark grey grip and trigger, a short
squared muzzle at the front and a thin glowing blue lens strip along the top. Pointing
to the RIGHT. Nothing else in frame, no hand, no arm.
bullet (fx/bullet.png, 512×192, wide): a horizontal scanner beam bolt travelling to
the RIGHT — a hot white core capsule at the leading right edge with a pale blue
(#9FD8FF) tail streaking back to the left and fading to fully transparent. Sharp and
thin, like a barcode laser line, not a fireball.
muzzle (fx/muzzle.png, 256×256): a short muzzle flash burst pointing RIGHT, hot white
centre with four uneven pale blue (#9FD8FF) petals flaring forward, brightest at the
left where it meets the barrel, fading out to the right.
shield (fx/shield.png, 384×512, tall): a guard barrier facing RIGHT — a vertical
curved arc of pale blue (#9FD8FF) energy, bulging toward the right, bright hard rim
line along the outer edge and a soft translucent fill behind it, faint hexagonal
facets in the fill. The left side (the side against the character) fades to
transparent.
```

Cả bốn: nền trong suốt, không chữ, không số, không bóng đổ.

Sau khi gen bật cờ tương ứng ở mục 9. Bốn tấm này đều là loại **có đường lùi** — gen
lẻ tấm nào bật tấm đó, tấm chưa có thì engine vẫn vẽ bằng code. Riêng `shoot-1..2`:
có ảnh thì khẩu súng nằm luôn trong khung, nên engine tự bỏ lớp `gun-held` vẽ đè.

---

## 7. Nền — 5 ải × 4 lớp = 20 tấm

Đây là phần bản 1 làm mỏng nhất: chỉ có lớp giữa, nên năm ải chỉ khác nhau ở bảng
màu. Bản 2 chia bốn lớp và **tả cảnh cụ thể theo từng nơi từng làm việc**.

**ĐÃ XONG:** đủ 20 lớp nền `sky`, `far`, `mid`, `near` cho cả 5 ải.

### 7.1 Luật chung của nền

- **Lặp ngang liền mép.** Ba lớp `far`, `mid`, `near` đều lặp. Mép trái phải khớp
  mép phải chính xác, không thì cứ mỗi tấm lại có một đường sọc chạy qua màn hình.
  Kiểm bằng `python scripts/sprites.py check`. Cách làm được việc: hoà 48px mép trái
  đè lên mép phải — ở cỡ vẽ trong game không nhìn ra chỗ hoà.
- **Không chừa khoảng trong suốt ở đáy.** Engine vẽ lớp nền với chiều cao cố định, nên
  nếu tấm thừa 119px trong suốt dưới đáy thì mặt đường trong tranh treo lơ lửng cách
  mặt đất của game một quãng. Chạy `pack --trim-v` để cắt, hoặc vẽ cho hình chạm đáy.
- **Kích thước:** `sky 1600×840` (không lặp, kéo phủ khung), `far 1280×720`,
  `mid 1280×840`, `near 1280×480`. Sau khi `--trim-v` thì chiều cao co lại theo phần
  có hình — đó là chuyện bình thường, engine tính bề rộng ô lặp theo tỉ lệ.
- **Bố cục engine ghép ba lớp** (`FAR_H`/`FAR_BOTTOM_UP`/`MID_H` trong `engine.ts`):
  lớp giữa cao 150px tính từ mặt đất lên, lớp xa cao 230px và chân của nó nằm cao hơn
  mặt đất 70px nên phần dưới khuất sau lớp giữa. Vật ở xa phải nằm **cao hơn** trên
  màn hình thì mới ra chiều sâu — đặt chân lớp xa ngang mặt đất là nó bị lớp giữa che
  gần hết, đúng lỗi của bản đầu.
- **Mặt đất là một dải màu phẳng do code vẽ**, nối tiếp ngay dưới lớp giữa. Màu lấy từ
  `palette.ground` trong `content.vi.ts` và đã được chỉnh lại bằng cách **lấy trung
  bình 24 hàng dưới cùng của chính tấm `mid`** — nền vẽ tay mà dải đất tô màu cũ thì
  nhìn như hai bức tranh dán cạnh nhau.
- **Trong suốt phía trên.** Ba lớp lặp phải trong suốt ở phần trời, chỉ có hình ở
  phần dưới. Lớp `near` trong suốt cả phần giữa, chỉ có vật ở sát đáy.
- **Nhạt dần theo độ xa.** `far` nhạt nhất và gần màu trời nhất, `near` đậm nhất.
  Đây là thứ tạo chiều sâu, không phải chi tiết.
- **Không vẽ nhân vật, không vẽ chữ, không vẽ biển hiệu có chữ.**
- Lớp `near` chạy **trước mặt nhân vật** (nhanh hơn camera). Chỉ đặt vật thấp và
  thưa, không che tầm nhìn: mép container, bánh xe, thùng hàng, cáp buông.

### 7.2 Khối chung — dán trước mỗi prompt nền

```
A horizontally tileable parallax layer for a 2D side-scrolling game, hand-painted
cartoon in the spirit of classic MapleStory, flat cel shading with two tones plus one
soft highlight, thin darker outline, muted and low contrast so foreground characters
stay readable. Flat side view, no perspective, no characters, no text, no signage with
writing. Transparent above the shapes. The left and right edges must match exactly so
the strip repeats seamlessly.
```

### 7.3 Ải 1 · Cảng Cát Lái — A.P. Moller Maersk

Tông: trời `#A9DCF0`, xa `#7BB9D4`, giữa `#4E8FAE`, đất `#2F5F78`.

```
sky: a soft clear morning sky over a container seaport, gentle vertical wash from pale
blue (#A9DCF0) at the top to warm hazy white at the horizon, two or three very soft
flat clouds, a faint sun glow low on the right. Extremely simple and low contrast.
far: distant harbour silhouettes in pale blue-grey (#7BB9D4) — a row of tall gantry
crane frames with horizontal booms reaching out over the water, one moored container
ship with a boxy superstructure and a single funnel, a low breakwater line. Flat single
tone, no detail inside the shapes.
mid: a working container yard in mid blue (#4E8FAE) — stacks of shipping containers two
and three high in staggered heights, a straddle carrier lifting one container, a rail
line with a flatbed wagon carrying containers, a small yard office cabin, bollards and
mooring ropes along the quay edge, a lifebuoy ring on a post.
near: foreground quay clutter in deep blue (#2F5F78), only along the very bottom edge —
the corner of a single container cut off by the frame edge, a coil of thick rope, two
short bollards, a puddle reflecting light. Transparent everywhere else.
```

### 7.4 Ải 2 · Kho Phân Loại — J&T Express

Tông: trời `#FFDFAF`, xa `#F0BE7E`, giữa `#CF8B45`, đất `#8C5A2B`.

```
sky: warm dusk light seen through the skylights of a huge sorting warehouse, gentle
vertical wash from amber (#FFDFAF) to dim gold, dust motes in the air, no clouds.
far: the far end of the warehouse in pale amber (#F0BE7E) — a row of triangular roof
trusses under a long roof beam, tall bay doors, hanging dome lamps on cables, a
mezzanine walkway railing. Flat single tone.
mid: the sorting floor in warm brown-orange (#CF8B45) — a long roller conveyor running
across the frame with parcels on it, a chute dropping parcels into a bin, stacked
cardboard boxes and wooden pallets at staggered heights, a hand trolley, a wall of
pigeonhole sorting shelves, a floor scale.
near: foreground floor clutter in dark brown (#8C5A2B), only at the very bottom — a
half-open cardboard box cut off by the frame edge, a stack of two pallets, a strip of
yellow floor tape, a scattered handful of parcels. Transparent everywhere else.
```

### 7.5 Ải 3 · Sàn Điều Phối — Shopee

Tông: trời `#FFCDB4`, xa `#FBA981`, giữa `#EE7A4D`, đất `#B4482A`.

Đây là ải có rider. Nền nên cho thấy cái sàn mà rider chạy ra chạy vào.

```
sky: a warm sunset sky over a city logistics hub, vertical wash from peach (#FFCDB4) to
deep orange near the horizon, a few long flat clouds catching the light, no sun disc.
far: a distant city skyline in soft coral (#FBA981) — office towers of staggered
heights with small lit windows, a few rooftop water tanks and antenna masts, one low
warehouse block with a saw-tooth roof. Flat single tone.
mid: a delivery dispatch yard in bright orange (#EE7A4D) — a long row of parked
delivery scooters seen from the side with insulated delivery boxes on the back, two
open-sided canopy tents with sorting tables under them, plastic crates of parcels
stacked beside them, a roll-up shutter loading bay, a queue barrier, a wall-mounted
status board left completely blank with no text.
near: foreground yard clutter in deep red-orange (#B4482A), only at the very bottom —
the front wheel and mudguard of a scooter cut off by the frame edge, two stacked
plastic parcel crates, a folded canopy leg, a traffic cone. Transparent elsewhere.
```

### 7.6 Ải 4 · Phòng Dữ Liệu — Giao Hàng Nhanh

Tông: trời `#C8CCF2`, xa `#9BA2DE`, giữa `#6C74BE`, đất `#454C8E`.

```
sky: the cold ceiling glow of a data centre, vertical wash from pale periwinkle
(#C8CCF2) down to dim blue-violet, a faint grid of recessed ceiling lights, no clouds.
far: the far wall of the hall in muted indigo (#9BA2DE) — overhead cable trays running
across the frame with bundles of cables looping down, ceiling ducts, a row of tall
distribution cabinets, a glass partition wall frame. Flat single tone.
mid: rows of server racks in deep blue-violet (#6C74BE) — cabinets of staggered heights
filled with horizontal unit slots and small status lights, patch panels with fanned
cable bundles, a cooling unit with a fan grille, a rolling KVM console with a blank
dark screen, floor tiles with one panel lifted showing cables underneath.
near: foreground clutter in dark navy (#454C8E), only at the very bottom — the base of
one rack cut off by the frame edge, a coil of patch cables, a lifted floor tile leaning
against the rack, a small toolbox. Transparent everywhere else.
```

### 7.7 Ải 5 · Xưởng Sản Phẩm — Interdist

Tông: trời `#C6EBD9`, xa `#93D6B8`, giữa `#5FB18E`, đất `#3B7A61`.

```
sky: bright clean noon light through the tall windows of a product workshop, vertical
wash from mint (#C6EBD9) to near white at the bottom, soft light beams, no clouds.
far: the back of the workshop in pale mint green (#93D6B8) — a wall of tall multi-pane
windows, exposed ceiling beams, two large slow gear wheels mounted on the wall, a
pinboard left completely blank with no text. Flat single tone.
mid: the workshop floor in medium green (#5FB18E) — open shelving racks holding neat
boxes and sample products, a long assembly workbench with clamps and small parts trays,
a set of interlocking gears driving a belt, a whiteboard on wheels left blank, a stack
of labelled crates with the labels left blank.
near: foreground bench clutter in deep green (#3B7A61), only at the very bottom — the
corner of a workbench cut off by the frame edge, a small toolbox, two stacked sample
boxes, a coil of cable. Transparent everywhere else.
```

---

## 8. Vật phẩm — 15 tấm

Hiển thị `36×36px`, vẽ `512×512`, nền trong suốt. Mỗi ải một bộ ba: hồi máu (viền hồng
đỏ `#FF8F85`), đồ nghề (viền lime `#D4F236`, buff 12 giây), và **súng quét** (viền
xanh nhạt `#9FD8FF`, nạp 14 viên cho đòn tầm xa phím `K`).

| Ải | `heal` | `tool` |
|---|---|---|
| 1 | Ly cà phê — a paper coffee cup with a lid and a warm steam curl | Máy quét mã vỏ — a handheld barcode scanner gun with a red laser line |
| 2 | Bữa trưa ca đêm — a stacked metal lunch tin with a pair of chopsticks | Súng bắn mã — a pistol-grip label scanner with a small screen |
| 3 | Nghỉ giữa ca — a folding stool with a cold drink bottle beside it | Dashboard realtime — a tablet showing three abstract green bars, no text |
| 4 | Nghỉ năm phút — a desk clock lying on its side next to a mug | Câu SQL đúng — a scroll of paper with three abstract code lines and a green tick |
| 5 | Cà phê lần ba — a tall iced coffee glass with a straw | Data contract — a folded document with a wax seal and a green tick |

```
A cute chunky game pickup item icon: [MÔ TẢ TỪ BẢNG]. Hand-painted cartoon, bold dark
outline, flat cel shading with two tones plus one soft highlight, seen from a slight
three-quarter angle, single object floating with nothing under it. A soft glowing rim
of [#FF8F85 cho heal / #D4F236 cho tool] around the silhouette. Transparent background,
no ground shadow, no text, no numbers, no labels.
```

### 8.1 `gun-1..5` — 5 tấm · **ĐÃ XONG**

Đây là **vũ khí**, không phải buff — nên phải đọc ra là một khẩu súng ngay cả ở
`36×36px`. Ba luật riêng cho nhóm này, khác nhóm `tool`:

- **Nòng chỉ sang phải.** Cả năm tấm cùng hướng, engine không lật icon.
- **Bóng phải rõ ở cỡ nhỏ.** Thân ngang + tay cầm chúc xuống, đúng bóng chữ L ngược.
  Đừng vẽ chi tiết máy móc — ở `36px` thành một cục.
- **Viền phát sáng xanh `#9FD8FF`**, để không lẫn với `tool` viền lime.

| Ải | `gun` | Mô tả |
|---|---|---|
| 1 | Súng quét mã vỏ | a rugged dockside barcode scanner gun with a thick rubber bumper and a stubby antenna |
| 2 | Súng bắn mã vạch | a warehouse pistol-grip barcode gun with a coiled cable stub and a small screen on top |
| 3 | Súng quét mã đơn | a slim courier handheld scanner with a phone-sized screen on its back and a trigger grip |
| 4 | Con trỏ truy vấn | a chunky sci-fi query pointer pistol, its muzzle shaped like a blinking text cursor bar |
| 5 | Súng dán nhãn SKU | a label-applicator gun with a small roll of blank stickers mounted on top |

```
A cute chunky game pickup item icon: [MÔ TẢ TỪ BẢNG]. Seen in flat side view with the
barrel pointing to the RIGHT, so the silhouette reads as a gun shape at very small
size: a horizontal body with a grip hanging down beneath it. Keep it simple and bold
with no fine mechanical detail. Hand-painted cartoon, bold dark outline, flat cel
shading with two tones plus one soft highlight. Pale blue body (#9FD8FF) with dark grey
grip, and a soft glowing pale blue rim (#9FD8FF) around the silhouette. Single object
floating with nothing under it, transparent background, no ground shadow, no hand, no
arm, no text, no numbers, no labels.
```

Sau khi gen: `ASSETS.gunArt = true`. Bật cờ này còn thay luôn cái icon đạn vẽ bằng code
trên HUD — engine dùng `item/gun-N.png` y như cách nó dùng `item/tool-N.png`.

---

## 9. Bật cờ trong engine sau khi gen

Mọi thứ engine dùng đều khai báo ở `ASSETS` và `RIG_SET` đầu file
`components/game/engine.ts`. Engine **không đoán file** — chưa khai báo thì không tải,
nên gen dở dang cũng không sinh ra một tràng 404. Gen tới đâu sửa số tới đó:

| Gen xong | Sửa | Bắt buộc trọn bộ? |
|---|---|---|
| **Cả 18 khung nhân vật — ĐÃ XONG** | `PLAYER_RIG.unit` = chiều cao đầu đo được | cả nhóm nhân vật |
| Cả 64 khung quái | `RIG_SET.mob: "v2"` | cả nhóm quái |
| Cả 15 khung trùm | `RIG_SET.boss: "v2"` | cả nhóm trùm |
| **`idle-1..3` — ĐÃ XONG** | `playerIdle: 3` | đủ 3 khung |
| **`run-1..8` — ĐÃ XONG** | `playerRun: 8` | đủ 8 khung |
| **`attack-1..3` — ĐÃ XONG** | `playerAttack: 3` | đủ 3 khung |
| **`jump-rise`/`jump-fall`/`land` — ĐÃ XONG** | `playerJump: "split"` | đủ 3 khung |
| **Quái 4 khung — ĐÃ XONG** | `mobFrames.<loại>: 4` | đủ 4 khung cho loại đó, ở **mọi ải** có nó |
| **Trùm có `bX-hit.png` — ĐÃ XONG** | `bossFrames: 3` | không — thiếu ải nào ải đó dùng khung đứng |
| **`bX-walk-1..4` cả 5 ải — ĐÃ XONG** | `bossWalk: 4` | **cả nhóm trùm** — thiếu ải nào ải đó nhấp nháy |
| **`bX-atk` cả 5 ải — ĐÃ XONG** | `bossAtk: true` | không — thiếu thì dùng khung đứng |
| **`item/gun-1..5` — ĐÃ XONG** | `gunArt: true` | cả 5 ải — thiếu ải nào ải đó vẽ khẩu súng bằng code |
| **`player/shoot-1..2` — ĐÃ XONG** | `playerShoot: 2` | đủ số khung khai — thiếu thì mượn khung chém |
| **`player/guard.png` — ĐÃ XONG** | `playerGuard: true` | không |
| **`player/gun-held.png` — ĐÃ XONG** | `gunHeldArt: true` | không |
| **`fx/bullet.png` — ĐÃ XONG** | `bulletArt: true` | không |
| **`fx/muzzle.png` — ĐÃ XONG** | `muzzleArt: true` | không |
| **`fx/shield.png` — ĐÃ XONG** | `shieldArt: true` | không |
| **Ảnh rider — ĐÃ XONG** | `riderArt: true` | đủ số khung khai trong `mobFrames.rider` |
| **`fx/slash-1..3` — ĐÃ XONG** | `slashFx: 3` | không — thiếu thì rơi về vệt vẽ bằng code |
| **Nền `mX-sky.png` — ĐÃ XONG** | `bgSky: true` | không — thiếu ải nào ải đó dùng dốc màu code |
| **Nền `mX-far.png` — ĐÃ XONG** | `bgFar: true` | không — thiếu ải nào ải đó dùng silhouette code |
| **Nền `mX-near.png` — ĐÃ XONG** | `bgNear: true` | không — thiếu thì bỏ qua lớp đó |

`mobFrames` khai theo từng loại (`{ default: 4, rider: 4 }`) chứ không phải một số
chung, để gen lại được từng loại một. Khai 4 cho một loại mà thiếu file thì con đó
nhấp nháy qua lại giữa ảnh thật và hình khối xám.

Cột thứ ba là chỗ dễ sập nhất. Chỗ ghi "bắt buộc trọn bộ" nghĩa là engine **không có
đường lùi** cho khung thiếu: bật `mobFrames: 4` mà một loại quái chỉ có 2 khung thì
nửa thời gian con đó nhảy về hình khối xám. Chỗ ghi "không" thì engine tự rơi về bản
vẽ bằng code cho đúng phần thiếu, gen lẻ từng ải cũng chạy.

`RIG_SET` khai riêng cho quái và trùm để gen lại được từng nhóm một — nhân vật đã
sang v2 nên không còn công tắc, cả 18 khung dùng chung `PLAYER_RIG`. Bảng hiệu chuẩn
từng khung của bộ nhân vật đời 1 đã bỏ khỏi engine; cần lại thì
`python scripts/sprites.py check --emit-rig` in ra được.

Gen lại nhóm quái hoặc trùm thì làm y hệt nhân vật: `normalize` → `check` → đổi
`RIG_SET` của nhóm đó → sửa `ASSET_SET` trong `scripts/sprites.py` cho khớp, không thì
báo cáo của script vô nghĩa.

Những thứ **không cần gen** vì engine vẽ bằng code: mặt đất, bệ nhảy, tim máu, khung
máu trùm, cửa ải, đếm quái, thanh thể lực đỡ, số đạn trên HUD, bảng tạm dừng, bảng túi
đồ, thẻ giải nghĩa vật phẩm. Toàn bộ HUD và mọi bảng đều là DOM hoặc `fillText` —
thành ảnh là vừa nặng vừa mờ, mà chữ trong ảnh thì không sửa được bằng file content.

---

## 10. Checklist trước khi commit

```bash
python scripts/sprites.py check --set v2
```

- [ ] Mọi khung nhân vật: khung vuông (≤ `1024²`), neo `(512±14, 960±14)` quy về khung
      tham chiếu — script tự quy đổi nếu xuất ở 512²
- [ ] Cỡ đầu nhất quán giữa các khung: **soi bằng mắt**, đừng tin một mình cột thước đo
- [ ] Mọi khung quái: khung `512²`, thân `440±8px`, neo `(256±10, 476±10)`
- [ ] Mọi khung trùm: khung `768²`, thân `660±12px`, neo `(384±14, 714±14)`
- [ ] Nền `far`/`mid`/`near`: mép trái khớp mép phải (script báo `OK`)
- [ ] Không tấm nào bị crop sát người
- [ ] Nền trong suốt thật, không phải trắng
- [ ] Mở game, chạy và chém liên tục: đầu nhân vật **không đổi cỡ** giữa các khung,
      mặt không đổi kiểu, chân không trượt khỏi mặt sàn
- [ ] Chạy sang phải hết bản đồ: không thấy đường sọc lặp ở lớp nền nào

---

## 11. Đặt tên file

Bỏ tất cả vào `public/game/`. Tên file là hợp đồng với engine — sai một chữ là engine
không thấy, và nó sẽ im lặng rơi về hình vẽ bằng code chứ không báo lỗi.

```
public/game/
  player/  idle-1..3.png  run-1..8.png  jump-rise.png  jump-fall.png  land.png
           attack-1..3.png  hurt.png  shoot-1..2.png  guard.png  gun-held.png
  mob/     m1-walker-1..4.png   m1-flyer-1..4.png
           m2-walker-1..4.png   m2-charger-1..4.png  m2-flyer-1..4.png
           m3-walker-1..4.png   m3-flyer-1..4.png    m3-shooter-1..4.png
           m3-rider-1..4.png
           m4-walker-1..4.png   m4-charger-1..4.png  m4-shooter-1..4.png
           m5-walker-1..4.png   m5-charger-1..4.png  m5-flyer-1..4.png
           m5-shooter-1..4.png
  boss/    b1..b5.png  b1..b5-tel.png  b1..b5-hit.png
           b1..b5-walk-1..4.png  b1..b5-atk.png
  trap/    spike.png  saw.png  pulse-jet.png  pulse-vent.png
  item/    heal-1..5.png  tool-1..5.png  gun-1..5.png
  fx/      slash-1..3.png  hit.png  dust.png  ring.png  shot.png
           bullet.png  muzzle.png  shield.png
  bg/      m1..m5-sky.png  m1..m5-far.png  m1..m5-mid.png  m1..m5-near.png
```

Ảnh bìa trang `/game` để riêng ở `public/og-game.png`:

```
A wide landscape key art banner (1200×630) for a cute casual 2D side-scrolling game
about logistics and data work. A chibi office-worker hero in a dark shirt stands on a
floating platform on the left holding a rolled paper document like a sword, facing
right toward a large chunky boss made of a battered red shipping container on the
right. A faceless delivery rider in an orange jacket speeds in from the lower right on
a scooter. Behind them a soft blue seaport skyline with gantry cranes and stacked
containers, warm morning light. Leave the upper middle area visually calm and
uncluttered for a title to be placed later. Hand-painted cartoon, bold outlines, flat
cel shading, no text anywhere.
```

---

## 12. Luật khi thêm thứ nhìn thấy được vào game

Đây là quy tắc của repo, không phải gợi ý. Nó nằm ở file tracked này (không nằm ở
`CLAUDE.md` — file đó bị `.gitignore`) để còn nguyên khi sang máy khác.

**Vấn đề nó chặn:** thêm một cơ chế mới vào engine thì phần hình luôn xong sau phần
chơi. Nếu không ghi lại ngay, cái hình vẽ tạm bằng code sẽ nằm đó vô thời hạn — không
ai đọc diff để phát hiện, và người quyết định gen ảnh thì không biết là có việc.

### Bốn việc, làm trong CÙNG lần sửa

1. **Vẽ bằng code một bản đủ đọc được.** Game phải chạy ngay, không chờ ảnh. Engine
   không bao giờ tải một file chưa tồn tại — chưa khai trong `ASSETS` thì không gọi
   `img()`, vì mỗi lần gọi thiếu file là một cái 404 trong console.
2. **Khai cờ** ở `ASSETS` đầu `components/game/engine.ts`, mặc định **tắt**, cộng
   nhánh `if` dùng ảnh khi bật. Ghi rõ trong comment cờ đó cần bao nhiêu tấm và có
   bắt buộc trọn bộ hay không.
3. **Ghi vào tài liệu này**, ba chỗ: một dòng ở **Bảng việc còn phải gen** ở đầu file,
   một mục prompt đầy đủ, một dòng ở bảng bật cờ mục 9.
4. **Báo cho người dùng ngay trong câu trả lời của lượt đó**: tên file, số tấm, hiện
   đang vẽ bằng gì, và **dán thẳng prompt ra chat**. Đừng bắt họ mở file docs ra tìm.

Việc 4 là bắt buộc, không phải phần thêm cho đẹp.

### Prompt phải theo tài liệu này

Sáu luật khung ở mục 1.3 · khối khoá mặt mục 3.2 cho mọi khung nhân vật · bảng rig
mục 1.2. Màu quy ước, đừng thêm màu thứ tư mà không có lý do:

| Màu | Nghĩa |
|---|---|
| `#E0563F` đỏ | mọi thứ của địch và mọi thứ gây sát thương |
| `#D4F236` lime | đòn chém của người chơi, đồ nghề, mọi thứ "tốt" |
| `#9FD8FF` xanh nhạt | súng quét và khiên đỡ của người chơi |
