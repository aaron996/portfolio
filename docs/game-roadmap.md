# Ải Vận Hành — Master Roadmap

**Vai trò:** đây là trang điều hướng và thứ tự ưu tiên cấp cao của game `/game`.
Nó không thay thế các spec kỹ thuật, asset hoặc audio chi tiết. Mỗi milestone phải
liên kết về source of truth bên dưới, nêu rõ trạng thái delivery và gate xác minh.

**Cập nhật:** 11/09/2026 · baseline game: `origin/main` sau Audio V1.  
**Delivery đang chờ review:** Cutscene V1 Ải 1 nằm ở branch
`codex/game-cutscene-v1`, commit `7cc0032`; đã push, chưa có PR/merge/preview
production.

## Mục tiêu campaign

`Ải Vận Hành` là campaign platform-combat gồm năm nơi làm việc. Người chơi đi từ
xử lý một chứng từ sai sang xây cơ chế ngăn lỗi ở đầu vào:

```text
Đối chiếu mã → Thông tuyến → San tải → Truy nguồn → Dựng rule
```

Mỗi milestone chỉ nên được thêm khi nó làm rõ một trong ba thứ: **đọc được tình
huống**, **đưa ra quyết định thú vị khi chơi**, hoặc **khiến kết quả có cảm xúc hơn**.
Không thêm map, vũ khí hay asset chỉ để tăng số lượng.

## Trạng thái tổng quan

| Milestone | Trạng thái | Quyết định / gate tiếp theo | Source of truth |
|---|---|---|---|
| Core campaign: 5 map, mission, combat, boss, save/tutorial | Đã có | Cần một manual full-clear từ New Run đến ending | [game-priorities-2-4.md](game-priorities-2-4.md) |
| Map 2 vertical warehouse | Đã có | Giữ là baseline, không mở rộng nếu không có playtest evidence | [warehouse-vertical-plan.md](warehouse-vertical-plan.md) |
| Combat V3 runtime + asset integration | Đã có một phần / cần visual regression thường xuyên | Bảo toàn combat contract khi thêm scene/animation | [game-combat-checks.md](game-combat-checks.md), [game-art-integration.md](game-art-integration.md) |
| Asset V2 | Đã có baseline | Chỉ gen bổ sung theo manifest và QA rig; không regen hàng loạt | [game-assets.md](game-assets.md) |
| Audio V1 | Đã tích hợp, nghe thiết bị thật chưa xác minh | Retest desktop + loa điện thoại trước Audio V2 | [game-audio-v1-plan.md](game-audio-v1-plan.md), [game-audio-credits.md](game-audio-credits.md) |
| Cutscene V1 — Ải 1 vertical slice | Đã code, đã push, chưa merge | PR → Vercel preview → browser mobile → merge → production retest | [game-cutscene-storytelling-v1.md](game-cutscene-storytelling-v1.md) |
| Cutscene V1 — Ải 2–5 + finale | Chưa bắt đầu | Chỉ nhân sau khi Ải 1 được preview-tested và tone/pacing được duyệt | [game-cutscene-storytelling-v1.md](game-cutscene-storytelling-v1.md) |
| Encounter / replayability V1 | Chưa bắt đầu | Chọn sau story/animation pass, không song song với cutscene rollout | Milestone 4 dưới đây |

## Thứ tự triển khai

### Milestone 0 — Delivery gate cho Cutscene Ải 1

**Mục tiêu:** xác nhận vertical slice thực sự không làm chậm nhịp chơi hoặc vỡ mobile.

1. Tạo PR cho `7cc0032`.
2. Đợi Vercel preview và checks hoàn tất.
3. Browser test preview: New Run → intro → gameplay; spawn boss → reveal; clear →
   outro → clear panel; pause → replay; skip/Escape; reload và retry/checkpoint.
4. Kiểm 390×844, 844×390, desktop; reduced motion; mute/pause/resume; console/network.
5. Chỉ merge khi preview đạt. Sau merge, xác minh `origin/main` và retest production
   `/game`.

**Không thuộc milestone:** mở rộng thoại, gen portrait, thay đổi combat/map/item.

### Milestone 1 — Cutscene V1: hoàn thiện campaign

**Mục tiêu:** triển khai Ải 2–5 và finale theo script đã chốt, dùng cùng một pipeline.

- Mỗi ải có intro, boss reveal, outro; campaign có finale montage.
- Giữ one-way narrative: không dialogue branch, voice acting hoặc video prerendered.
- Content visible ở `content/content.vi.ts`; simulation engine chỉ phát lifecycle
  callback tối thiểu, không nhận UI/browser concerns.
- Asset mới là tùy chọn, chỉ thêm sau khi crop sprite/background hiện có không đủ đọc
  trên mobile.

**Gate:** playtest cả campaign; scene được skip/replay; scene không phát lại khi
checkpoint/retry; performance và control mobile không giảm.

### Milestone 2 — Animation & presentation coverage

**Mục tiêu:** tăng cảm giác va chạm và đọc trạng thái combat, thay vì mở rộng hệ
combat mới.

Ưu tiên theo thứ tự:

1. Boss coverage chung: intro/idle/tell/active/recovery/hit/death, với silhouette
   khác nhau rõ ở tell và recovery.
2. Player: landing, hurt/knockback, parry success, item use, chuyển kiếm/súng.
3. Mob: hit-stun/death và pose báo đòn rõ cho walker, charger, flyer, shooter/rider.
4. Mission props: trạng thái off/on riêng cho scanner, switch, terminal, rule gate;
   giữ procedural fallback cho asset chưa có.
5. Camera/VFX: hit-stop và shake có cấp độ, tôn trọng reduced motion.

**Gate asset:** một ảnh/một frame, alpha thật, rig/anchor QA, `sprites.py check`,
bundle budget và browser visual review. Không dùng text do model sinh trong sprite.

### Milestone 3 — Audio & full-playthrough polish

**Mục tiêu:** hoàn thiện nhịp nghe và độ khó dựa trên lần chơi thật.

- Nghe Audio V1 bằng laptop/headphone và ít nhất một loa điện thoại thật.
- Cân music/ambience/SFX ở intro, boss reveal, parry, slam và outro; không thêm
  voice-over trong milestone này.
- Chơi tay liên tục từ New Run đến ending trên desktop và mobile; ghi lại điểm người
  chơi không hiểu objective, chết không công bằng, hoặc bị cutscene làm ngắt nhịp.
- Chỉ sau evidence đó mới cân nhắc music riêng Ải 3–5 hoặc cue `sceneStinger`.

**Gate:** test/build không thay cho full manual run và listening test.

### Milestone 4 — Encounter & replayability V1

**Mục tiêu:** tạo lựa chọn nhẹ và encounter có nhịp khác nhau mà không phá tuyến
campaign đầu tiên.

Các ứng viên, chọn tối đa hai cho một release:

- elite enemy có một passive đọc được;
- challenge room tùy chọn đổi lấy item/cosmetic;
- mini-objective 20–30 giây giữa map;
- boss phase 2 ở 40–50% HP, thay pattern chứ không chỉ tăng máu;
- sau boss chọn một passive nhỏ, không làm New Run đầu tiên mất cân bằng.

**Không làm trước:** nhiều vũ khí mới, map thứ sáu, procedural level hoặc New Game+
đầy đủ. Chúng chỉ đáng cân nhắc khi campaign core có completion evidence.

## Quy tắc ưu tiên và delivery

1. **Đi theo milestone, không theo checklist asset.** Chưa duyệt milestone trước thì
   không chuẩn bị batch art/feature cho milestone sau.
2. **Spec trước implementation.** Thay đổi narrative/asset/audio phải có source,
   scope và acceptance gate trước khi chạm production code.
3. **Một PR, một ý định review được.** Cutscene, animation asset và encounter không
   trộn chung nếu không có dependency kỹ thuật bắt buộc.
4. **Xác minh tách lớp:** deterministic test → TypeScript/build → browser preview →
   production retest → manual play/audio/device evidence. Lớp trước không thay thế
   lớp sau.
5. **Giữ git boundary rõ:** commit/push không đồng nghĩa PR; PR không đồng nghĩa
   merge; merge không đồng nghĩa production retest.

## Chỉ số quyết định có làm tiếp hay không

Sau mỗi milestone, trả lời bằng evidence thay vì cảm giác:

- Người chơi hiểu mục tiêu của ải trước khi mở pause help không?
- Có biết vì sao boss đang bất tử và cần làm gì để mở khóa không?
- Có thấy intro/outro tạo nhịp nghỉ hợp lý hay muốn skip ngay?
- Mobile có giữ được text, CTA và controls không che nhau không?
- Cơ chế mới có tạo quyết định khác biệt hay chỉ thêm thao tác/asset?

Nếu không trả lời được ít nhất một câu bằng playtest/browser evidence, ưu tiên là
đo/kiểm lại thay vì mở milestone mới.
