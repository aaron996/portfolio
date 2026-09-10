export type GameSound = "jump" | "attack" | "hit" | "enemyDefeat" | "shoot" | "hurt" | "reflect" | "pickup" | "checkpoint" | "clear" | "interact" | "bossWarning" | "bossSlam";
export interface AudioLoop { path: string; gain: number }
export interface MapSoundBank { music?: AudioLoop; ambience?: AudioLoop }
export interface SoundCue { samples: readonly string[]; gain: number; cooldown: number; priority: number; maxVoices: number; fallbackHz: number }
/** Provenance and edits: docs/game-audio-credits.md. Map indices are zero based. */
export const MAP_AUDIO: Readonly<Record<number, MapSoundBank>> = {
  0: { music: { path: "/game/audio/music/map-1-cat-lai.ogg", gain: 0.26 }, ambience: { path: "/game/audio/ambience/map-1-port.ogg", gain: 0.08 } },
  1: { ambience: { path: "/game/audio/ambience/map-2-warehouse.ogg", gain: 0.12 } },
};
export const SOUND_CUES: Readonly<Record<GameSound, SoundCue>> = {
  jump: { samples: ["/game/audio/sfx/player-jump.ogg"], gain: 0.8, cooldown: 0.08, priority: 0, maxVoices: 2, fallbackHz: 420 },
  attack: { samples: ["/game/audio/sfx/player-slash-01.ogg", "/game/audio/sfx/player-slash-02.ogg"], gain: 0.9, cooldown: 0.06, priority: 0, maxVoices: 2, fallbackHz: 250 },
  hit: { samples: ["/game/audio/sfx/enemy-hit-01.ogg", "/game/audio/sfx/enemy-hit-02.ogg"], gain: 0.85, cooldown: 0.035, priority: 1, maxVoices: 3, fallbackHz: 140 },
  enemyDefeat: { samples: ["/game/audio/sfx/enemy-defeat.ogg"], gain: 0.9, cooldown: 0.045, priority: 1, maxVoices: 2, fallbackHz: 180 },
  shoot: { samples: ["/game/audio/sfx/gun-shot.ogg"], gain: 0.8, cooldown: 0.045, priority: 1, maxVoices: 3, fallbackHz: 680 },
  hurt: { samples: ["/game/audio/sfx/player-hurt.ogg"], gain: 1.05, cooldown: 0.08, priority: 3, maxVoices: 2, fallbackHz: 100 },
  reflect: { samples: ["/game/audio/sfx/parry.ogg"], gain: 1, cooldown: 0.045, priority: 3, maxVoices: 2, fallbackHz: 900 },
  pickup: { samples: ["/game/audio/sfx/pickup.ogg"], gain: 0.8, cooldown: 0.06, priority: 1, maxVoices: 2, fallbackHz: 660 },
  checkpoint: { samples: ["/game/audio/sfx/checkpoint.ogg"], gain: 0.95, cooldown: 0.15, priority: 2, maxVoices: 1, fallbackHz: 550 },
  clear: { samples: ["/game/audio/sfx/chapter-clear.ogg"], gain: 1, cooldown: 0.3, priority: 3, maxVoices: 1, fallbackHz: 880 },
  interact: { samples: ["/game/audio/sfx/mission-interact.ogg"], gain: 0.8, cooldown: 0.07, priority: 1, maxVoices: 2, fallbackHz: 520 },
  bossWarning: { samples: ["/game/audio/sfx/boss-warning.ogg"], gain: 1.05, cooldown: 0.2, priority: 3, maxVoices: 1, fallbackHz: 720 },
  bossSlam: { samples: ["/game/audio/sfx/boss-slam.ogg"], gain: 1.1, cooldown: 0.15, priority: 3, maxVoices: 2, fallbackHz: 85 },
};
export const AUDIO_MIX = { sfxGain: 0.45, maxVoices: 12, loopFadeSeconds: 1.2, duckSeconds: 0.4, duckRatio: 0.65 } as const;
export function sampleIndex(length: number, random: number): number {
  return Math.min(length - 1, Math.max(0, Math.floor((Number.isFinite(random) ? random : 0) * length)));
}
