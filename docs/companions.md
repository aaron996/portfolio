# Bạn đồng hành — kịch bản

Ba ô dữ liệu đi cùng người xem suốt site. Vinh duyệt kịch bản này ngày 2026-10-08.
Phần đã dựng: màn mở đầu ở hero (`components/home/HeroSort.tsx` + `heroBuddies.ts`) và
lớp dùng chung (`components/companions/`).

## Nhân vật

Ba kiểu dữ liệu "có vấn đề" — người làm data đọc tên là hiểu, người khác vẫn thấy dễ thương.

| Ô | Tên | Tính cách | Câu đùa xuyên suốt |
|---|---|---|---|
| đen | **Chấm** — data point | Tò mò, gan, dẫn đầu. Làm dấu chấm chữ I | Luôn đi tìm chỗ của mình |
| đen | **Trùng** — duplicate | Nhút nhát, bắt chước Chấm chậm nửa nhịp | Là bản sao; thỉnh thoảng bị "khử trùng lặp" |
| xanh | **Lệch** — outlier | Hăng quá mức, nhảy cao hơn, hay lạc | Lúc nào cũng đứng xa nhóm |
| viền nét đứt | **Null** — ẩn | Không ai thấy | Chỉ xuất hiện ở 404 và khi ảnh lỗi |

Nhà của chúng là logo 3×3 — logo có đúng 3 ô sáng. Cuối trang chúng về lại logo.

## Luật chơi

1. Không bao giờ che nội dung hay chặn cú bấm. Lớp nhân vật `pointer-events: none`, chỉ thân ô bấm được.
2. Mỗi section diễn tối đa một màn, mỗi lượt xem một lần, mỗi màn dưới 3 giây. Lúc người xem đọc thì ngồi yên.
3. Lúc rảnh chỉ có mắt nhìn theo con trỏ.
4. Có nút "Ẩn bạn đồng hành" ở footer (nhớ bằng localStorage). `prefers-reduced-motion` → đứng yên ở tư thế cuối.
5. Mobile chỉ giữ màn quan trọng: hero, Đường đi, Liên hệ. Không màn nào cần hover.
6. Bong bóng tối đa một ký tự hoặc hai từ, chữ nằm trong `content/`.

## Kịch bản

### Trang chủ

1. **Hero — ra đời** *(đã dựng)*. Biểu đồ xếp xong vẫn còn 3 ô nằm sai chỗ: Chấm nằm
   nghiêng trên cột 4, Trùng chồng lệch lên Chấm như bản sao, Lệch là ô xanh lạc trên
   cột đen 6. Chúng hé mắt nghe ngóng thì ô đỉnh của cột bên phải lấy đà và đá văng
   chúng xuống sàn bên trái biểu đồ (Lệch văng xa nhất). Đứng dậy, ngó nghiêng, "?".
   Chấm thấy chữ I ("!"), nhảy lên làm dấu chấm → "THİNGS". Trùng chạy theo vài bước
   rồi khựng lại. Trùng và Lệch nhảy cổ vũ rồi đứng lại dưới sàn. Sau đó cả ba **nhìn
   theo con trỏ** khi người xem còn ở hero — Lệch quay nhanh, Trùng chậm nửa nhịp.
2. **Cuộn sang Công việc — lên đường.** Chấm rời chữ I, cả ba trèo lên mép dưới nav dính
   và đi theo — chỗ đỗ mặc định cả trang.
3. **Công việc tiêu biểu — ngó màn hình.** Rê vào case → Chấm ngồi trên mép khung xem
   trước, cúi nhìn. Case 3PL → Lệch đứng lên điểm 97.5%.
4. **Đường đi — đi tàu.** Lúc đường vẽ, Chấm chạy ở đầu đường, leo theo khúc cong. Bấm
   chặng → Chấm nhảy tới. Lệch ngồi ở mũi tên "nay"; Trùng đi nhánh nét đứt Interdist.
5. **Ba câu hỏi — kéo bút dạ quang.** Lệch chạy dưới mỗi câu, vệt dạ quang hiện sau lưng
   nó. Hết câu thứ ba thì thở hồng hộc ("…").
6. **Liên hệ — trời tối.** Thân chìm vào đêm, chỉ còn mắt phát sáng, ngồi trên mép cảnh kho
   pixel. "Chép email" → Trùng nhảy mừng. Rê thẻ game → cả ba quay nhìn cửa ải.
7. **Lên đầu trang — về nhà.** Bám nav đi lên, chui lại vào logo theo thứ tự.

### Trang case

- Thanh tiến độ đọc mảnh ở đầu trang làm sàn; Chấm đi theo tiến độ, đọc xong đứng chỉ "Case khác".
- Case Chuẩn hoá báo cáo KA, tới đoạn entity resolution: Trùng bị gộp vào Chấm, qua đoạn đó tách ra ngơ ngác.
- Case 3PL: Lệch đứng trên con số kết quả.
- Mở ảnh lớn: Chấm thò đầu từ góc khung.

### 404

Ba ô cầm đèn pin đi tìm, "?". Rọi vào giữa trang thì lộ ra Null đứng đó từ đầu.

### Game Ải Vận Hành

Chấm **không** vào game làm pet hay đồng đội — game chỉ có một lần Chấm làm người giới
thiệu: **kéo rèm**. Bấm thẻ game ở footer trang chủ → Chấm (ô đang ngồi trên thẻ) nhảy ra
mép phải, nắm rèm kéo khép lại giữa màn hình, đứng thẳng chờ rồi mới chuyển sang `/game`.
Trang game: rèm đang kín, Chấm nói "Mời vào!", nhún hai lần, rồi kéo rèm mở ra để lộ màn
game và chạy khuất. Bấm kèm phím (tab mới…), tắt bạn đồng hành hay giảm chuyển động thì đi
thẳng như link thường. Code: `components/companions/gameCurtain.ts`; rèm là DOM thuần gắn
vào `<body>` nên sống sót qua cú chuyển trang. Các lối khác vào `/game` (nav, câu hỏi) không
có rèm.

## Kiến trúc

- Một lớp nhân vật dùng chung ở root layout, `position: fixed`, không nhận chuột. Section
  chỉ khai báo điểm neo (`data-companion="work-preview"`), lớp chung quyết định diễn màn nào.
- Trạng thái đi theo giữa các trang qua sessionStorage.
- Mỗi màn là một script nhỏ như `heroBuddies.ts`, dùng Web Animations, không thêm thư viện.

## Đã dựng ở đợt 1

- `components/companions/store.ts` — store dùng chung: `enabled` (localStorage `companions`),
  `place` (`home` | `hero` | `dock`), `heroReady`. Hero đăng ký `HeroBridge` để lớp chung
  đón/trả ba ô theo toạ độ viewport.
- `components/companions/CompanionLayer.tsx` — lớp `position: fixed`. Hero còn hiện dưới 30%
  → ba ô nhảy lên đứng trên mép dưới nav (giữa nav: Lệch tách bên trái, Chấm giữa, Trùng sát
  phải) và nhìn theo con trỏ; hero hiện quá 50% → nhảy về, Chấm lại lên chữ I. Hai ngưỡng
  khác nhau để không nhảy qua lại khi dừng ở giữa.
- `BrandMark companions` — khi ba ô ra ngoài, ba ô sáng của logo thành ô trống viền nét đứt.
- Footer có nút "Ẩn/Hiện bạn đồng hành". Tắt → về nhà, biểu đồ không còn ô lạc. Bật lại sau
  khi đã diễn → đặt thẳng vào tư thế cuối, không diễn lại.
- Xáo lại biểu đồ → ba ô về nhà (logo sáng lại), sắp xong thì diễn lại từ đầu.
- Lớp chung gắn ở từng trang (`HomePage`, `CaseArticle`) thay vì root layout: /game và các
  trang prototype không cần nhân vật. Store là module dùng chung nên trạng thái đi theo khi
  chuyển trang bằng `<Link>`.

## Đã dựng ở đợt 2

`CompanionLayer` giờ có hai lớp: `.cmp-fixed` (nav, logo) và `.cmp-page` (toạ độ tài liệu —
bám nội dung, cuộn theo trang không giật). Một "đạo diễn" chọn màn theo thứ tự ưu tiên:
về nhà → hero → trời tối → ba câu hỏi → đường đi → công việc → đứng trên nav.

Section báo bằng sự kiện trên `window` và thuộc tính `data-companion` (để đo phần trăm hiển thị):

| Sự kiện | Ai gửi | Màn |
|---|---|---|
| `companion:work` (slug / null) | `WorkIndex` khi rê/rời dòng | Chấm, Trùng ngồi mép khung xem trước; case 3PL → Lệch lên điểm 97.5%. Rời 1,2s → về nav. Mobile bỏ qua (không có khung) |
| `companion:path` | `CareerPath` khi biểu đồ vào khung nhìn | Đường chờ 600ms (`data-lead`), Chấm chạy theo đầu nét đang vẽ (cùng easing, keyframe đều theo độ dài); Lệch ngồi trước mũi tên "nay", Trùng ở cuối nhánh Interdist |
| `companion:path-stop` (index) | `CareerPath` khi **bấm** chặng | Chấm nhảy tới chặng đó |
| `companion:questions` | `AboutQuestions` (đặt `data-driver`) | Lệch chạy dưới từng câu, vệt dạ quang mọc theo; hết thì "…". Quá 9s chưa chạy thì tự tô |
| `companion:copied` | `HomeContact` khi chép email | Trùng nhảy mừng (chỉ khi đang ở màn đêm) |
| click `a[href="#top"]` | — | Bay về ba ô trong logo, logo sáng lại |

Màn đêm: khi phần Liên hệ hiện quá 45%, ba ô ngồi trên mép thẻ game, thân tối, mắt dạ quang
phát sáng; rê thẻ game → cả ba nhún.

## Đã dựng ở đợt 3

- Trang `/case/[slug]` làm lại theo theme giấy: `components/case/CaseArticle.tsx` + `case.css`,
  một template cho cả 5 case (đọc từ `CaseStudy`).
  Nhãn trong `content.casePage`. Nav dùng chung `SiteNav`; trang case bật thanh tiến độ đọc
  (`ReadProgress`, tính bằng `reading.ts` trên phần tử `[data-read]`).
- `CompanionLayer origin="logo"`: vào thẳng trang case (ba ô đang ở nhà) → sau 1,2s nhảy ra
  từ ba ô của logo. Chuyển trang khi ba ô đang ở ngoài → cũng nhảy ra từ logo ở trang mới.
- Màn **read**: Chấm đi theo tiến độ đọc trên mép nav, Trùng lẽo đẽo phía sau (ease chậm),
  Lệch đứng chờ ở cuối thanh. Bám cuộn liên tục bằng style, không nhảy từng cú.
- Màn **dedupe**: `Decision.companion = "dedupe"` (case KA, đoạn entity resolution). Trùng co lại
  chạy vào Chấm và biến mất, Chấm phình 1,15 lần; qua đoạn đó Trùng tách ra kèm "?".
- Màn **result**: `KeyResult.companion = "outlier"` (case 3PL). Lệch rời thanh đọc, lên đứng
  trên thẻ kết quả.
- Chưa làm: Chấm thò đầu khi mở ảnh lớn (trang case mới không có lightbox).

## Đã dựng ở đợt 4

- **404** (`app/not-found.tsx`, `components/notfound/`): trang tối, con trỏ là đèn pin
  (`--lx/--ly`). Ba ô đứng dưới đáy, mắt dạ quang nhìn theo đèn, "?". Đèn rọi trúng tâm
  Null (dưới 90px) → bóng tối tan, lộ "Trang này là NULL.", ba ô nhảy "!". Nút "Bật đèn"
  cho bàn phím/cảm ứng; giảm chuyển động thì sáng sẵn.
- **Game**: ban đầu có làm ba ô pet đi theo nhân vật trong engine; đã **gỡ** (người làm
  không cần Chấm vào game). Thay bằng màn kéo rèm ở mục "Game Ải Vận Hành" phía trên, nên
  không còn ảnh pet cần gen.

## Lộ trình

| Đợt | Nội dung | Trạng thái |
|---|---|---|
| 0 | Màn mở đầu ở hero, mắt nhìn theo con trỏ | Xong |
| 1 | Lớp dùng chung, nhà ở logo, nút tắt, giảm chuyển động | Xong — đang gắn ở trang chủ |
| 2 | Các màn trang chủ: Công việc, Đường đi, Ba câu hỏi, Liên hệ, về nhà | Xong |
| 3 | Trang case theo theme mới + ba ô đi trên thanh đọc, khử trùng lặp, Lệch khoe số | Xong |
| 4 | 404 với Null, Chấm kéo rèm vào game | Xong (pet trong game đã gỡ) |

## Lỗi đã sửa

- Hero từng có **sáu** ô: lúc `HeroSort` diễn màn đá văng (đã `place: "hero"` nhưng chưa
  `registerHero`), `CompanionLayer.desired()` rơi xuống màn nền "dock" nên bộ ba thứ hai nhảy
  ra từ logo, đứng trên nav rồi nhảy xuống nhập vào bộ ba ở sàn. Giờ `place === "hero"` mà
  chưa có hero thì lớp chung trả `"off"`, nằm yên đến khi hero diễn xong.

