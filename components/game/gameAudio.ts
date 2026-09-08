export type GameSound = "jump" | "hit" | "shoot" | "hurt" | "reflect" | "pickup" | "checkpoint" | "clear" | "interact";

/** Short synthesized cues: no downloads, no music before a user gesture. */
export class GameAudio {
  private context: AudioContext | null = null;
  private output: GainNode | null = null;
  private muted = false;
  private paused = false;
  private lastAt = -1;

  activate() {
    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.output = this.context.createGain();
        this.output.gain.value = this.muted || this.paused ? 0 : 0.07;
        this.output.connect(this.context.destination);
      }
      if (this.context.state === "suspended") void this.context.resume().catch(() => {});
    } catch { /* Audio support must never block play. */ }
  }

  setMuted(value: boolean) { this.muted = value; this.updateVolume(); }
  setPaused(value: boolean) { this.paused = value; this.updateVolume(); }
  private updateVolume() {
    if (this.context && this.output) this.output.gain.setTargetAtTime(this.muted || this.paused ? 0 : 0.07, this.context.currentTime, 0.01);
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
    if (this.context) void this.context.close().catch(() => {});
    this.context = null; this.output = null;
  }
}
