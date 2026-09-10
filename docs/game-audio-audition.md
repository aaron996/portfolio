# Audio V1 — Phase A audition

Status: **round 1 rejected; user delegated final selection; selected assets integrated locally**.
Date: 2026-09-10. Branch: `codex/game-audio-v1`.
Baseline: `3a895f10108426b9c9b2bb98f9a43d9a18c44525`.

The implementation scope and delivery boundary are preserved in
[the supplied plan](game-audio-v1-plan.md). The selected assets, audio manager and
engine events are integrated locally. Warehouse audio bytes are preserved at the
new manifest path. No commit, push, PR, merge or deployment has been performed.

User feedback, 2026-09-10: **“Chưa hợp, cần tìm ứng viên khác.”** No first-round
combination was approved. Rejected music remains audition-only; Small Harbour and
the SFX were later selected under the user's delegated choice.

Subsequent user direction: **“mình cần mấy chất nhạc vui 1 tý như kiểu maple story ấy”**.
This supersedes the original dark industrial music direction. MapleStory is a mood
reference; no MapleStory audio is downloaded or reused.

## Round 2 — cheerful adventure shortlist

| UI | Candidate | Reason to audition, based on creator description | License |
| --- | --- | --- | --- |
| C | [Loop Town / Fupi](https://opengameart.org/content/loop-town) | Cheerful piano/harp with bass and drums; small-town motion with a calmer middle section | CC0 |
| D | [Town Theme RPG / cynicmusic](https://opengameart.org/content/town-theme-rpg) | Harp and recorders; warm, calm fantasy town / exploration alternative | CC0 |
| E | [Magic Town / controllerhead](https://opengameart.org/content/magic-town) | Whimsical fantasy town, inspired by SNES RPGs; a more retro alternative | CC0 |

These are source-based directions, not fabricated listening assessments. The
default is C with ambience off so the user can judge the melody first. Music
selection switches immediately during audition. Existing SFX and ambience stay
available for comparison, with no new approval inferred.

Round 2 preserves whole tracks and normalizes them near −20 LUFS rather than
cutting a musical phrase at an arbitrary 80-second boundary. The final 60–90-second
loop arrangement was deferred until selection (now completed below); seam review
and three-cycle listening remain unverified. Use `node scripts/prepare-game-audio-audition.cjs --round2` after
downloading the round-2 source-manifest entries to append these previews while
retaining the first-round files and SFX. Run normal preparation first on a fresh
checkout. These commands only prepare audition previews; the separate release preparation script promotes the selected assets.

Additional candidates inspected but excluded from the CC0 shortlist:
`The Little Big Adventure!` by Hitctrl and `Woodland Fantasy` by Matthew Pablo
are CC-BY 3.0 on their original pages. They were not downloaded. A CC-BY exception
was unnecessary while the CC0 options above remained available for audition.

## Listen locally

```powershell
node scripts/game-audio-audition.cjs
```

Open <http://127.0.0.1:3011>. Click **Bắt đầu audition**. Choosing music switches
immediately; choose ambience then **Áp dụng bản mix**. Change gains or choose no music/ambience to hear a layer
alone. Restart returns to Cát Lái; Dừng âm thanh stops loops and voices.

The page runs this checkout's actual engine/content with local diagnostic
instrumentation. Nine existing sound events play the candidate samples during
gameplay. `attack`, `enemyDefeat`, `bossWarning` and `bossSlam` are separate preview
buttons only. Their presence does **not** demonstrate event integration or boss
timing. There is no production mute persistence or new manager implementation in
this audition harness.

The server binds to loopback only. Mobile viewport checks below are desktop
browser emulation, not access from a physical phone. A physical phone listening
session remains outstanding; preview files can be copied to a phone for isolated
listening, but that alone will not validate production gameplay on the phone.

## Round 1 candidate ledger (rejected)

All candidates have CC0 shown on the linked original asset/pack pages, checked
2026-09-10. They are candidates, not subjective recommendations or approvals.

| ID | Candidate / creator | Downloaded duration | Trial loop | Decision |
| --- | --- | ---: | ---: | --- |
| searching | [Searching / yd](https://opengameart.org/content/searching) | 104.58 s | 80 s | Await listening; requested first candidate; industrial/electronic tags |
| bleak | [Bleak Terminal / Ruskerdax](https://opengameart.org/content/bleak-terminal) | 112.18 s | 80 s | Await listening; compare industrial horror mood against fatigue criterion |
| harbour | [Dorset Harbour / Carlvus](https://freesound.org/people/Carlvus/sounds/182616/) | 153.77 s | 80 s | Await listening; check voices, horns and repetitive foreground sounds |
| diesel | [Boat Engine / DBlover](https://freesound.org/people/DBlover/sounds/659922/) | 176.54 s | 80 s | Await listening; cargo ship engine; wind/crane coverage still unverified |

The two Freesound downloads are **public HQ MP3 previews**, not original WAV
masters. Original WAV downloads require login. Original formats/durations and the
downloaded representation are recorded separately. Do not silently promote these
preview derivatives to approved production masters.

15 short SFX candidates cover 13 events, including two slash and two hit variants.
They come from Kenney's [Impact Sounds](https://kenney.nl/assets/impact-sounds),
[RPG Audio](https://kenney.nl/assets/rpg-audio),
[Interface Sounds](https://kenney.nl/assets/interface-sounds), and
[Sci-fi Sounds](https://kenney.nl/assets/sci-fi-sounds). The source archives include
`License.txt`. This set mixes foley and produced electronic samples; gun, warning,
interaction and clear are provisional choices that especially need listening.

- [Source/download manifest](game-audio-audition-sources.json): original pages,
  authors, license, download URLs, source formats, intended uses.
- [Per-file audition manifest](game-audio-audition-manifest.json): original names,
  measured durations/peaks, edits, sizes and SHA-256 hashes for all 19 files.
- Temporary source archives, normalized WAVs and OGG previews are under ignored
  `output/audio-audition/`; no candidate is in `public/`.
- Total 19-file OGG preview payload: **4,094,936 bytes**. This is not the final
  Audio V1 production budget, which must include retained warehouse ambience.

Trial loops use the first 81 seconds, loudness targets of −20 LUFS for music and
−24 LUFS for ambience, then a 1-second circular crossfade for an 80-second result.
The trial edit returns at source second 2. SFX are peak-adjusted near −3 dBFS.
OGG encoding can alter peaks slightly. These are technical preparation choices,
not evidence that transitions are inaudible, rhythmically correct, or well mixed.

## Reproduce preparation

Download each `url` to `output/audio-audition/sources/<file>` using the source
manifest. Unpack SFX archives into folders named after each pack's `id` there.
Keep the source license files. Supply an existing FFmpeg executable through
`FFMPEG_PATH`, or install the local preparation dependency:

```powershell
python -m pip install imageio-ffmpeg --target output/audio-audition/tools
node scripts/prepare-game-audio-audition.cjs
node scripts/game-audio-audition.cjs
```

The preparation script measures assets and rewrites the two audition manifests.
It only writes audio into the ignored audition directory, never `public/`.
App dependencies are installed from the existing lockfile; no package changes.

## Round 1 verification performed

- `npm run test:game`: **64/64 passed**, existing baseline/regression suite.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed, 10 static pages generated.
- `git diff --check`: passed; new CJS scripts pass `node --check`.
- Real Chromium audition page: no context, fetch or sources before Start;
  all 19 OGG files fetched and decoded without HTTP/decode/console errors.
- Start to two active loops: **876 ms in one local run**. This is source-start
  instrumentation, not an audible-output measurement or production/network SLA.
- Pause sets master gain to zero; resume restores it. Switching both candidates
  and restarting four times maintains exactly two loops and 19 cached loads.
- All 13 cue buttons exercised, including repeated slash/hit. Stop leaves zero
  loop sources, zero SFX voices and master gain zero.
- Audition page checked at 1440×1000, 390×844 and 844×390 with no horizontal
  overflow. Screenshots and local verification scripts: `output/playwright/`.

These checks concern the audition harness and existing app. They do **not** pass
the future Audio V1 manager/event tests, production `/game` integration, a full
manual start-to-boss playthrough, music loop listening, headphones/laptop/phone
listening, or production verification.

## Selection delegated and integration completed

The user subsequently said **“mình không xem được, nhưng thôi cứ chọn đại đi”**,
then **“tiếp tục”**. This overrides waiting for the subjective audition gate.
Selected: Loop Town / Fupi (CC0), Small Harbour / Carlvus (CC0) at low gain, and
15 Kenney CC0 SFX samples. The choice follows the requested cheerful mood; it is
not a claim that the user or agent passed a headphone/phone listening session.

The release loop is an 80-second edit with a 1-second circular crossfade.
Source attribution, modifications and hashes are in `game-audio-credits.md` and
`game-audio-assets.json`. Run `node scripts/prepare-game-audio-release.cjs` after
preparing the local audition assets to reproduce the selected production files.
Only selected audio is under `public/`; total 4,805,175 bytes including map 2.

Runtime: typed map/SFX manifest, master plus music/ambience/SFX buses, compressor,
shared fetch/decode cache, gesture activation, per-cue cooldown and polyphony,
priority admission with 12 simultaneous SFX, 1.2-second loop fades and 0.4-second
music ducking on hurt/reflect/slam. Pause/mute silence the master and discard SFX;
loop clocks continue silently and resume without duplicate sources. Map changes
invalidate stale loads. Destroy aborts requests, stops sources and closes context.
Oscillator fallback is only used after a sample fails; failed loops stay silent.

The engine emits swing on its active frame (including misses), hit/defeat once
per melee action or bullet result, and warning/slam at boss telegraph/impact.
Gameplay parameters and damage logic are unchanged.

Automated validation: 73/73 tests pass, TypeScript passes and production build
passes (10 pages). The audio tests cover asset hashes/budget, activation, cached
restart, pause/mute, partial and stale loads, teardown, priority/variation,
fallback, clear cue, melee/bullet kills and boss warning/impact.

Subjective loop-seam/fatigue/phone-speaker listening remains unverified. No commit,
push, PR, merge or deployment has been performed.

## Production-build browser verification — 2026-09-10

Chromium against `next start` at `http://127.0.0.1:3012/game`, with test-only
AudioContext/fetch instrumentation injected by Playwright (no production debug API):

- Intro: zero contexts, requests and sources before a gesture.
- Start: 17 map-1 audio files returned HTTP 200 and decoded; two loop sources.
  An actual captured click to both source starts measured **1,031 ms** in one
  local run at 390×844. This does not measure speaker output or remote latency.
- Real J input created a slash sample source; zero oscillator fallback sources.
- P pause/resume and sound toggle: master zero when silent, restored on resume,
  exactly two original loop sources retained. Four UI restarts reused the cache
  with 17 requests total and no additional loop sources.
- Continue using a valid local save fixture for map index 1: only warehouse
  ambience plus shared SFX fetched (16 files); no map-1 music/ambience requested.
  Restart retained one warehouse loop. Muted preference survived a reload and
  Continue, with no active loops until the sound toggle was enabled.
- Desktop, 390×844 portrait and 844×390 landscape screenshots inspected.
  Zero JavaScript/audio errors; unrelated preloaded-CSS warning remains.

Evidence scripts/screenshots are local under `output/playwright/audio-production-*`.
Boss-event timing and rapid asynchronous map transitions are covered by deterministic
tests, not a claimed manual start-to-boss browser playthrough. Physical phone
playback, subjective listening and deployed-site verification remain untested.
