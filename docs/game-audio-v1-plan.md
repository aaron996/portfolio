# Kế hoạch Audio V1 — Ải 1 Cảng Cát Lái

> Cập nhật hướng âm nhạc theo yêu cầu người dùng sau audition vòng 1:
> “mình cần mấy chất nhạc vui 1 tý như kiểu maple story ấy”.
> Vòng 2 ưu tiên nhạc vui, có giai điệu, cảm giác khám phá/fantasy nhẹ.
> Hướng industrial tối bên dưới là brief ban đầu, đã được thay thế bởi yêu cầu này.
> Sau đó người dùng giao quyền chọn: “mình không xem được, nhưng thôi cứ chọn đại đi”.
> Chốt Loop Town (Fupi, CC0) và ambience Small Harbour; tiếp tục tích hợp không chờ audition.
> Đây là quyền chọn asset, không phải xác nhận đã nghe đạt trên desktop/điện thoại.
> Các ràng buộc CC0, phạm vi audio và biên delivery tiếp tục áp dụng.

Trạng thái: đề xuất triển khai. Baseline source: `3a895f1` trên `origin/main` ngày
10/09/2026.

## Mục tiêu

Khi người chơi bắt đầu Ải 1, Cảng Cát Lái phải có một soundscape nhận diện được
trong tối đa hai giây: nhạc industrial không lời, ambience cảng ở lớp nền và SFX
sample thật cho hành động/combat. Âm thanh phải làm rõ nhịp chơi và telegraph của
boss mà không che thao tác hoặc gây mệt khi chơi lặp lại.

Audio V1 gồm:

- một track nhạc loop riêng cho Ải 1;
- một loop ambience cảng riêng cho Ải 1;
- thay SFX oscillator mặc định bằng sample thật dùng chung cho năm ải;
- thêm cue còn thiếu cho vung vũ khí, hạ quái và các pha chính của boss Ải 1;
- giữ ambience CC0 hiện có của Ải 2 và toàn bộ hành vi mute/pause hiện tại;
- kiểm tra tự động, browser thật và nghe chủ quan trên desktop lẫn điện thoại.

Không thuộc Audio V1:

- nhạc riêng cho Ải 2–5;
- lồng tiếng, lời hát hoặc thoại nhân vật;
- thay gameplay, art, map, HUD hay thông số combat;
- mua asset hoặc dùng asset không xác minh được quyền sử dụng;
- tự sáng tác một soundtrack hoàn chỉnh từ đầu.

## Hiện trạng cần thay thế

- `components/game/gameAudio.ts` tạo toàn bộ SFX bằng oscillator sine/triangle.
- Lớp nhạc hiện tại là bốn oscillator với gain tổng rất thấp, không phải một track
  nhạc đã được sản xuất.
- `public/game/audio/factory-ambiance.ogg` là file thu âm duy nhất và chỉ phát khi
  map index bằng `1`, tức Ải 2 — Kho Phân Loại.
- `GameSound` hiện có chín event: `jump`, `hit`, `shoot`, `hurt`, `reflect`,
  `pickup`, `checkpoint`, `clear`, `interact`.
- Một cooldown `lastAt` dùng chung có thể làm mất cue hợp lệ khi hai event xảy ra
  gần nhau.

## Hướng âm thanh

### Nhạc Ải 1

- Industrial electronic, nhịp vừa, bass thấp và percussion kim loại tiết chế.
- Có chuyển động đủ để hỗ trợ platform/combat nhưng không mang chất trailer hoặc
  boss battle liên tục.
- Loop sạch trong 60–90 giây, không có lời, tiếng nói hoặc đoạn mở đầu quá dài.
- Ứng viên đầu tiên để audition: `Searching` của yd trên OpenGameArt, CC0. Đây là
  ứng viên chứ chưa phải asset đã duyệt.
- Chuẩn bị ít nhất hai ứng viên CC0 và nghe trong chính Ải 1 trước khi chốt.

### Ambience Ải 1

- Gió cảng, động cơ diesel xa, crane hoạt động và tiếng kim loại/container thưa.
- Không dùng còi, tiếng va đập hoặc giọng người nổi bật lặp theo chu kỳ dễ nhận ra.
- Loop phải đứng được khi nghe riêng và không cạnh tranh với music/SFX.

### SFX

- Âm ngắn, rõ transient và đọc được trên loa điện thoại.
- Slash và impact là hai cue khác nhau: vung hụt vẫn có whoosh, đánh trúng thêm
  impact.
- Slash và enemy hit có tối thiểu hai biến thể để tránh cảm giác lặp máy móc.
- `reflect`, `hurt`, `bossWarning` và `bossSlam` có ưu tiên mix cao vì truyền đạt
  trạng thái gameplay.

## Gate chọn asset và license

Chỉ tải và commit asset sau khi hoàn thành manifest audition. Mỗi mục trong
manifest phải có tên file, URL trang nguồn, tác giả, license, định dạng gốc, thời
lượng và mục đích sử dụng.

Nguồn ưu tiên:

1. OpenGameArt với asset ghi rõ `CC0` trên chính trang asset.
2. Kenney với pack có trang license CC0.
3. Freesound, lọc và kiểm từng file ở license `Creative Commons 0`.

Không dùng nhạc lấy từ YouTube, audio tách từ game/video, asset chỉ ghi “no
copyright”, license `NonCommercial`, hoặc file được re-upload mà không truy được
nguồn gốc. CC-BY chỉ được dùng khi có lý do rõ và đã ghi đúng attribution; mặc định
Audio V1 chọn CC0 để giảm rủi ro bàn giao portfolio.

Quy trình audition:

1. Shortlist 2–3 track music, 2 ambience và các pack SFX phù hợp.
2. Lưu URL/license vào manifest tạm, chưa đưa asset loại vào `public/`.
3. Chuyển preview về cùng mức loudness gần đúng và nghe với một đoạn gameplay Ải 1.
4. Chấm theo bốn tiêu chí: hợp bối cảnh, không gây mệt, không che cue, loop khó nhận
   ra điểm nối.
5. Chốt một music, một ambience và bộ SFX; cập nhật
   `docs/game-audio-credits.md` trong cùng commit tích hợp.

## Asset manifest đích

```text
public/game/audio/
├── music/
│   └── map-1-cat-lai.ogg
├── ambience/
│   ├── map-1-port.ogg
│   └── map-2-warehouse.ogg
└── sfx/
    ├── player-jump.ogg
    ├── player-slash-01.ogg
    ├── player-slash-02.ogg
    ├── player-hurt.ogg
    ├── enemy-hit-01.ogg
    ├── enemy-hit-02.ogg
    ├── enemy-defeat.ogg
    ├── gun-shot.ogg
    ├── parry.ogg
    ├── pickup.ogg
    ├── checkpoint.ogg
    ├── mission-interact.ogg
    ├── boss-warning.ogg
    ├── boss-slam.ogg
    └── chapter-clear.ogg
```

Tên file có thể đổi theo asset được duyệt, nhưng consumer chỉ đọc qua manifest,
không rải path literal trong engine. Tổng dung lượng nén mục tiêu không quá 8 MB;
music và ambience dùng OGG loop, SFX dùng OGG ngắn. Giữ file nguồn lossless ngoài
bundle nếu cần biên tập lại, không commit file working quá lớn vào app.

## Kiến trúc triển khai

### Audio manager

Giữ `GameAudio` làm owner duy nhất của audio lifecycle và mở rộng thành bốn bus:

```text
master
├── music
├── ambience
└── sfx
```

- `master` nhận trạng thái mute/pause.
- `music` và `ambience` có source loop, gain và fade độc lập.
- `sfx` phát `AudioBufferSourceNode` ngắn và cho phép nhiều cue hợp lệ đồng thời.
- Music/ambience được fetch và decode sau thao tác Bắt đầu để giữ đúng autoplay
  policy. Khi buffer sẵn sàng, fade in thay vì bật đột ngột.
- Dùng generation/token cho mỗi lần đổi map để một request cũ không phát nhạc của
  map trước sau khi người chơi đã chuyển ải.
- Dùng cache buffer theo path; không fetch/decode lại khi restart ải.
- Synth hiện tại chỉ giữ làm fallback khi sample thiết yếu tải lỗi, không dùng ở
  đường chạy bình thường.

### Map sound bank

Tạo một manifest typed, ví dụ `components/game/audioManifest.ts`, ánh xạ map index
tới music/ambience và ánh xạ event tới danh sách sample. Audio V1 chỉ khai báo music
cho map `0`; map `1` dùng ambience kho hiện có; các map còn lại không được giả là đã
có soundtrack riêng.

Giữ API tương thích ở `OpsGame.tsx` hoặc đổi có kiểm soát từ `setMusicMap(index)`
sang `setMap(index)`. Mọi đường vào chơi — Bắt đầu, Tiếp tục, Qua ải, Chơi lại ải và
Chơi lại từ đầu — phải chọn đúng bank trước khi resume.

### Event gameplay

Giữ các event hiện có và thêm tối thiểu:

- `attack`: bắt đầu active action để phát slash dù không trúng mục tiêu;
- `enemyDefeat`: hit kết liễu quái thường;
- `bossWarning`: bắt đầu tell của cú slam;
- `bossSlam`: container chạm đất và sinh shockwave.

Không phát lại cùng một cue ở nhiều nhánh cho một action. Cooldown chuyển từ một
timestamp toàn cục sang giới hạn theo event/sample; giới hạn polyphony để spam hit
không tạo clipping.

### Mix khởi điểm

- Music gain: `0.20–0.28`.
- Ambience gain: `0.08–0.15`.
- SFX gain: `0.35–0.55`, điều chỉnh riêng cue quan trọng.
- Fade music/ambience: 1–2 giây khi vào/ra ải; fade ngắn khi pause/resume.
- Khi `hurt`, `reflect` hoặc `bossSlam` phát, duck music nhẹ trong 300–500 ms.
- Không hard-code mức cuối chỉ từ waveform; chốt sau khi nghe desktop và loa điện
  thoại.

## Trình tự thực hiện

### Phase A — Asset audition

- Lập manifest nguồn/license và tải bản audition vào thư mục tạm ngoài bundle.
- Nghe 2–3 music candidate và 2 ambience candidate cùng gameplay Ải 1.
- Chọn asset, cắt loop/crossfade, cân gain sơ bộ và xuất file OGG đích.
- Ghi quyết định chọn/loại ngắn gọn để lần sau không tìm lại từ đầu.

Gate: chưa sửa đường chạy production trước khi có một music và một ambience đạt
audition, trừ phần refactor có test độc lập.

### Phase B — Audio manager và manifest

- Thêm manifest typed và buffer loader/cache.
- Tách gain bus, lifecycle loop, fade, mute/pause/resume/destroy.
- Xử lý fetch/decode lỗi và race khi đổi map/restart.
- Chuyển ambience Ải 2 hiện có vào manifest mới, không làm mất hành vi đã phát hành.

### Phase C — SFX và event integration

- Thay chín SFX oscillator hiện có bằng sample đã duyệt.
- Thêm `attack`, `enemyDefeat`, `bossWarning`, `bossSlam` vào contract giữa engine và
  audio.
- Thêm random variation có thể kiểm soát trong test; tránh phát hai lần cho một hit.
- Cân mix vòng đầu với combat thường, súng, parry, mission và boss slam của Ải 1.

### Phase D — Validation và polish

- Chạy static/deterministic gates.
- Kiểm tra browser thật trên route `/game` với network/audio instrumentation.
- Chơi tay từ Bắt đầu tới boss Ải 1, sau đó qua Ải 2 và restart nhiều lần.
- Nghe trên headphone, loa laptop và ít nhất một điện thoại thật; chỉnh gain cuối.
- Cập nhật credits và tài liệu hiện trạng để không còn ghi “chưa có nhạc nền”.

## File dự kiến thay đổi

- `components/game/gameAudio.ts`: loader, cache, bus, loop, fade và sample playback.
- `components/game/audioManifest.ts`: file mới, source of truth cho path/gain/variation.
- `components/game/engine.ts`: phát event còn thiếu tại đúng state transition.
- `components/game/OpsGame.tsx`: chọn map bank và giữ lifecycle theo phase game.
- `scripts/test-game.cjs`: contract audio, event, lifecycle và regression tests.
- `public/game/audio/**`: asset đã duyệt và tối ưu.
- `docs/game-audio-credits.md`: nguồn, tác giả, license, asset sử dụng.
- `docs/game-priorities-2-4.md`: cập nhật mô tả hiện trạng sau khi Audio V1 hoàn tất.

Không sửa component portfolio, map content, sprite, combat tuning hoặc CSS nếu không
có bằng chứng audio integration bắt buộc phải chạm tới.

## Validation gates

### Tự động

- `npm run test:game` qua toàn bộ suite hiện tại và test Audio V1 mới.
- `npx tsc --noEmit` qua.
- `npm run build` qua.
- `git diff --check` sạch.
- Test audio xác nhận:
  - không tạo/phát source trước user gesture;
  - map 0 chọn đúng music và ambience, map 1 giữ ambience kho;
  - mute/pause làm im cả ba bus và resume không tạo loop trùng;
  - restart/map switch nhanh không để source cũ sống lại;
  - destroy dừng source, giải phóng node và đóng context;
  - variation không vượt danh sách manifest;
  - một action gameplay không phát trùng event.

### Browser và nghe thực tế

- Sau khi bấm Bắt đầu, music và ambience Ải 1 nghe được trong tối đa hai giây.
- Network không có audio 404; console không có lỗi `play`, fetch hoặc decode.
- Chém hụt, chém trúng, bắn và bị thương nghe khác nhau rõ ràng.
- `bossWarning` nghe được trước `bossSlam`; slam không bị music che.
- Pause im ngay; resume fade lại; toggle mute được nhớ sau reload.
- Restart Ải 1 nhiều lần không tăng volume do loop bị nhân đôi.
- Qua Ải 2, soundscape Ải 1 dừng; ambience kho bắt đầu đúng và không chồng nguồn.
- Desktop, 390×844 và 844×390 giữ điều khiển/gameplay bình thường.
- Có một lượt nghe chủ quan trên loa điện thoại thật; browser assertion không thay
  thế gate này.

## Điều kiện nghiệm thu

Audio V1 chỉ hoàn tất khi đồng thời đạt các điều kiện sau:

1. Asset music, ambience và SFX đang chạy đều có provenance/license ghi trong repo.
2. Ải 1 có soundscape thật, không còn phụ thuộc oscillator ở normal path.
3. Toàn bộ cue gameplay quan trọng đọc được và không clipping/spam rõ rệt.
4. Mute, pause, restart, map switch và teardown không hồi quy.
5. Automated gates, browser checks và nghe trên thiết bị thật đều được báo riêng;
   không dùng build/test để thay cho đánh giá âm thanh chủ quan.
6. Không có thay đổi ngoài phạm vi audio.

## Rủi ro và cách khóa phạm vi

- **Nhạc hợp license nhưng không hợp game:** audition trong gameplay trước tích hợp.
- **Điểm nối loop lộ:** chỉnh ở source lossless, kiểm waveform và nghe ít nhất ba
  vòng liên tục.
- **File quá nặng:** giữ tổng bundle Audio V1 không quá 8 MB và kiểm network timing.
- **Autoplay/browser policy:** chỉ resume/decode/start sau user gesture, test Chrome
  desktop và mobile.
- **SFX nhỏ trên điện thoại:** nghiệm thu bằng loa thật, không chỉ headphone.
- **Loop trùng sau restart:** audio manager sở hữu duy nhất active sources và có test
  generation/token.
- **License trôi hoặc link mất:** lưu creator, license và URL trong credits ngay lúc
  tải; không chờ đến cuối.

## Biên delivery

Plan này cho phép triển khai và kiểm chứng trong branch riêng. Commit, push, PR,
merge và production verification là bước delivery tách biệt; chỉ thực hiện khi có
yêu cầu rõ. Nếu phát hành, phải kiểm Vercel preview trước merge và retest route
production sau khi `origin/main` đã chứa merge commit.
