# Game audio credits

All shipped files are CC0 1.0. The user delegated selection on 2026-09-10 after
requesting cheerful music with a MapleStory-like mood. No MapleStory audio is used.
File hashes, original names/formats, duration, peak levels, source URLs and exact
edits are in [game-audio-assets.json](game-audio-assets.json).

## Music — Cát Lái

- **Asset:** `public/game/audio/music/map-1-cat-lai.ogg`
- **Creator:** Fupi — Loop Town
- **Source:** https://opengameart.org/content/loop-town
- **License:** CC0 1.0
- **Original:** `loopcity_0.ogg`, OGG Vorbis, 118.47 seconds.
- **Edit:** Target −20 LUFS / −3 dBTP; first 81 seconds, rotated at 2 seconds
  with a 1-second circular crossfade, producing an 80-second Vorbis loop.
- **Use:** Music only in map index 0. Loop seam listening remains unverified.

## Port ambience

- **Asset:** `public/game/audio/ambience/map-1-port.ogg`
- **Creator:** Carlvus — Small Harbour
- **Source:** https://freesound.org/people/Carlvus/sounds/182616/
- **License:** CC0 1.0
- **Download used:** Public HQ MP3 preview `182616_3244946-hq.mp3`, 153.74 seconds.
  This is a derivative of the original WAV, not the lossless master.
- **Edit:** Target −24 LUFS / −3 dBTP; 1-second circular crossfade, 80-second loop.
- **Use:** Quiet background layer in map index 0, gain 0.08 beneath music 0.26.

## Factory ambience — preserved

- **Asset:** `public/game/audio/ambience/map-2-warehouse.ogg`
- **Creator:** yd
- **Source:** https://opengameart.org/content/factory-ambiance
- **License:** CC0 1.0 (Public Domain)
- **Use in game:** Loop nền cho Ải 2 — Kho Phân Loại.
- **Edit:** Relocated from `factory-ambiance.ogg`; original bytes preserved.

## Shared SFX — Kenney

All samples use CC0 1.0. Pack `License.txt` was checked during preparation.
Each sample is peak-normalized near −3 dBFS and encoded as 44.1 kHz OGG Vorbis
quality 4, without trimming. Slash and enemy hit have two variants each.

| Pack / source | Original samples | Shipped names under `public/game/audio/sfx/` |
| --- | --- | --- |
| [RPG Audio](https://kenney.nl/assets/rpg-audio) | cloth1, knifeSlice, knifeSlice2, handleCoins | player-jump, player-slash-01, player-slash-02, pickup |
| [Impact Sounds](https://kenney.nl/assets/impact-sounds) | impactPunch_medium_000/001, impactSoft_heavy_000/002, impactMetal_heavy_000 | enemy-hit-01/02, player-hurt, enemy-defeat, boss-slam |
| [Sci-Fi Sounds](https://kenney.nl/assets/sci-fi-sounds) | laserSmall_000, forceField_000 | gun-shot, parry |
| [Interface Sounds](https://kenney.nl/assets/interface-sounds) | confirmation_001, click_003, question_003, confirmation_004 | checkpoint, mission-interact, boss-warning, chapter-clear |

Every filename in the table has the `.ogg` extension. Total shipped audio:
**18 files, 4,805,175 bytes**, including the existing warehouse ambience.

CC0 does not require attribution. This record is kept so the source and license
remain clear when the portfolio is transferred or deployed elsewhere.
