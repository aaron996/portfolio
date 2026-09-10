export type GameSound = "jump" | "hit" | "shoot" | "hurt" | "reflect" | "pickup" | "checkpoint" | "clear" | "interact";

/**
 * Sound stays local to the game: short action cues, a sparse synthesized bed,
 * and one CC0 warehouse loop where a real industrial recording adds more life.
 * Nothing plays before a player gesture.
 */
export class GameAudio {
  private context: AudioContext | null = null;
  private output: GainNode | null = null;
  private music: GainNode | null = null;
  private musicPads: OscillatorNode[] = [];
  private ambient: HTMLAudioElement | null = null;
  private muted = false;
  private paused = false;
  private musicActive = false;
  private musicMap = 0;
  private lastAt = -1;

  activate() {
    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.output = this.context.createGain();
        this.output.gain.value = this.muted || this.paused ? 0 : 0.07;
        this.output.connect(this.context.destination);
        this.music = this.context.createGain();
        this.music.gain.value = 0;
        this.music.connect(this.context.destination);
        if (typeof Audio !== "undefined") {
          this.ambient = new Audio("/game/audio/factory-ambiance.ogg");
          this.ambient.loop = true;
          this.ambient.preload = "auto";
          this.ambient.volume = 0.12;
        }
      }
      if (this.context.state === "suspended") {
        void this.context.resume().then(() => this.ensureMusic()).catch(() => {});
      }
    } catch { /* Audio support must never block play. */ }
  }

  setMuted(value: boolean) { this.muted = value; this.updateVolume(); }
  setPaused(value: boolean) { this.paused = value; this.updateVolume(); }
  /** Select a map's tonal palette. It is safe to call before AudioContext exists. */
  setMusicMap(map: number) {
    this.musicMap = map;
    if (this.musicPads.length) this.tuneMusic();
    this.updateAmbient();
  }
  /** Fade the music bed without silencing confirmation / clear SFX. */
  setMusicActive(value: boolean) {
    this.musicActive = value;
    if (value) this.ensureMusic();
    this.updateVolume();
    this.updateAmbient();
  }
  private updateVolume() {
    if (!this.context) return;
    if (this.output) this.output.gain.setTargetAtTime(this.muted || this.paused ? 0 : 0.07, this.context.currentTime, 0.01);
    if (this.music) this.music.gain.setTargetAtTime(this.muted || this.paused || !this.musicActive ? 0 : 0.022, this.context.currentTime, 0.24);
  }

  /** The actual CC0 loop belongs to the three-floor warehouse chapter. */
  private updateAmbient() {
    const ambient = this.ambient;
    if (!ambient) return;
    const shouldPlay = !this.muted && !this.paused && this.musicActive && this.musicMap === 1;
    if (shouldPlay) void ambient.play().catch(() => {});
    else ambient.pause();
  }

  private ensureMusic() {
    const context = this.context;
    const music = this.music;
    if (!context || !music || context.state !== "running" || this.musicPads.length) return;
    const levels = [0.48, 0.29, 0.16, 0.045];
    const kinds: OscillatorType[] = ["sine", "triangle", "sine", "triangle"];
    levels.forEach((level, index) => {
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      oscillator.type = kinds[index];
      envelope.gain.value = level;
      oscillator.connect(envelope);
      envelope.connect(music);
      oscillator.start();
      this.musicPads.push(oscillator);
    });
    this.tuneMusic();
  }

  private tuneMusic() {
    // One unobtrusive palette per chapter: yard → warehouse → dispatch → data → product.
    const palettes = [
      [55, 82.41, 110, 220],
      [49, 73.42, 98, 196],
      [58.27, 87.31, 116.54, 233.08],
      [46.25, 69.3, 92.5, 185],
      [65.41, 98, 130.81, 261.63],
    ];
    const palette = palettes[Math.min(Math.max(this.musicMap, 0), palettes.length - 1)];
    this.musicPads.forEach((oscillator, index) => {
      oscillator.frequency.setTargetAtTime(palette[index], this.context!.currentTime, 0.6);
    });
  }

  play(sound: GameSound) {
    const context = this.context;
    if (!context || !this.output || context.state !== "running" || this.muted || this.paused) return;
    const at = context.currentTime;
    if (at - this.lastAt < 0.035) return;
    this.lastAt = at;
    const tones: Record<GameSound, number[]> = {
      jump: [280, 420], hit: [140], shoot: [680, 220], hurt: [120, 80],
      reflect: [600, 900], pickup: [440, 660], checkpoint: [330, 440, 550],
      clear: [440, 550, 660, 880], interact: [520, 650],
    };
    tones[sound].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      const start = at + index * 0.065;
      oscillator.type = sound === "hurt" || sound === "hit" ? "triangle" : "sine";
      oscillator.frequency.value = frequency;
      envelope.gain.setValueAtTime(0, start);
      envelope.gain.linearRampToValueAtTime(1, start + 0.008);
      envelope.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
      oscillator.connect(envelope); envelope.connect(this.output!);
      oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
      oscillator.start(start); oscillator.stop(start + 0.13);
    });
  }

  destroy() {
    this.musicPads.forEach((oscillator) => {
      try { oscillator.stop(); oscillator.disconnect(); } catch { /* already closed */ }
    });
    this.musicPads = [];
    if (this.ambient) {
      this.ambient.pause();
      this.ambient.removeAttribute("src");
      this.ambient.load();
      this.ambient = null;
    }
    if (this.context) void this.context.close().catch(() => {});
    this.context = null; this.output = null; this.music = null;
  }
}
