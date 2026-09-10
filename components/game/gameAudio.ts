import { AUDIO_MIX, MAP_AUDIO, SOUND_CUES, sampleIndex, type GameSound, type AudioLoop } from "./audioManifest";
export type { GameSound } from "./audioManifest";
type Voice = { source: AudioBufferSourceNode | OscillatorNode; gain: GainNode; sound: GameSound; priority: number };
type LoopVoice = { source: AudioBufferSourceNode; gain: GainNode };

/** Owns every source/node. Selecting a bank never activates audio before a gesture. */
export class GameAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private music: GainNode | null = null;
  private ambience: GainNode | null = null;
  private sfx: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  private muted = false;
  private paused = false;
  private musicActive = false;
  private map = 0;
  private destroyed = false;
  private generation = 0;
  private cueGeneration = 0;
  private loadingBank: number | null = null;
  private loadedBank: number | null = null;
  private loops = new Set<LoopVoice>();
  private retiring = new Set<LoopVoice>();
  private voices = new Set<Voice>();
  private buffers = new Map<string, AudioBuffer>();
  private pending = new Map<string, Promise<AudioBuffer | null>>();
  private failed = new Set<string>();
  private requests = new Set<AbortController>();
  private lastAt = new Map<GameSound, number>();
  private lastVariant = new Map<GameSound, number>();
  constructor(private random: () => number = Math.random) {}

  /** Call from a user gesture: Start, Continue, retry or sound toggle. */
  activate() {
    if (this.destroyed) return;
    try {
      if (!this.context) {
        const context = new AudioContext();
        this.context = context;
        this.master = context.createGain(); this.music = context.createGain();
        this.ambience = context.createGain(); this.sfx = context.createGain();
        this.sfx.gain.value = AUDIO_MIX.sfxGain;
        this.limiter = context.createDynamicsCompressor();
        this.limiter.threshold.value = -8; this.limiter.knee.value = 12;
        this.limiter.ratio.value = 8; this.limiter.attack.value = 0.003; this.limiter.release.value = 0.15;
        this.master.gain.value = this.muted || this.paused ? 0 : 1;
        this.music.connect(this.master); this.ambience.connect(this.master); this.sfx.connect(this.master);
        this.master.connect(this.limiter); this.limiter.connect(context.destination);
        this.ensureBank();
        for (const cue of Object.values(SOUND_CUES)) for (const path of cue.samples) void this.load(path);
      }
      const context = this.context;
      if (context.state !== "running") {
        void context.resume().then(() => { if (this.context === context) this.ensureBank(); }).catch(() => {});
      } else this.ensureBank();
    } catch { /* Unsupported audio must not block the game. */ }
  }
  setMuted(value: boolean) {
    this.muted = value;
    if (value) this.cancelCues();
    this.updateMaster();
    if (!value) this.ensureBank();
  }
  setPaused(value: boolean) {
    this.paused = value;
    if (value) this.cancelCues();
    this.updateMaster();
    if (!value) this.ensureBank();
  }
  setMap(map: number) {
    this.cancelCues(); // Same-map restart also invalidates pending one-shots.
    if (this.map === map) { this.ensureBank(); return; }
    this.map = map;
    this.invalidateBank(); this.ensureBank();
  }
  setMusicMap(map: number) { this.setMap(map); }
  setMusicActive(value: boolean) {
    if (this.musicActive === value) { if (value) this.ensureBank(); return; }
    this.musicActive = value;
    if (!value) this.invalidateBank(); else this.ensureBank();
  }
  private updateMaster() {
    if (!this.context || !this.master) return;
    const at = this.context.currentTime, param = this.master.gain;
    param.cancelScheduledValues(at);
    // Immediate pause/mute; resume fades without duplicating loops.
    if (this.muted || this.paused) param.setValueAtTime(0, at);
    else { param.setValueAtTime(param.value, at); param.linearRampToValueAtTime(1, at + 0.12); }
  }
  private load(path: string): Promise<AudioBuffer | null> {
    const context = this.context;
    if (!context || this.destroyed || this.failed.has(path)) return Promise.resolve(null);
    const cached = this.buffers.get(path);
    if (cached) return Promise.resolve(cached);
    const existing = this.pending.get(path);
    if (existing) return existing;
    const controller = new AbortController();
    this.requests.add(controller);
    const timeout = setTimeout(() => controller.abort(), 12000);
    const request = (async () => {
      try {
        const response = await fetch(path, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const bytes = await response.arrayBuffer();
        if (this.context !== context || this.destroyed) return null;
        const buffer = await context.decodeAudioData(bytes);
        if (this.context !== context || this.destroyed) return null;
        this.buffers.set(path, buffer);
        return buffer;
      } catch (error) {
        if (!this.destroyed) { this.failed.add(path); console.warn(`[game audio] ${path}`, error); }
        return null;
      } finally {
        clearTimeout(timeout); this.requests.delete(controller); this.pending.delete(path);
      }
    })();
    this.pending.set(path, request);
    return request;
  }
  private invalidateBank() {
    this.generation++; this.loadedBank = this.loadingBank = null;
    for (const voice of this.retiring) this.stopLoop(voice);
    this.retiring.clear();
    for (const voice of this.loops) {
      if (this.context) {
        const at = this.context.currentTime;
        voice.gain.gain.cancelScheduledValues(at);
        voice.gain.gain.setValueAtTime(voice.gain.gain.value, at);
        voice.gain.gain.linearRampToValueAtTime(0, at + AUDIO_MIX.loopFadeSeconds);
        voice.source.stop(at + AUDIO_MIX.loopFadeSeconds);
        this.retiring.add(voice);
      } else this.stopLoop(voice);
    }
    this.loops.clear();
  }
  private ensureBank() {
    const context = this.context;
    if (!context || this.destroyed || context.state !== "running" || !this.musicActive || this.muted || this.paused) return;
    const token = this.generation;
    if (this.loadedBank === token || this.loadingBank === token) return;
    this.loadingBank = token;
    const bank = MAP_AUDIO[this.map] ?? {};
    const start = (asset: AudioLoop | undefined, bus: GainNode | null, buffer: AudioBuffer | null) => {
      if (!asset || !bus || !buffer) return;
      const source = context.createBufferSource(), gain = context.createGain();
      source.buffer = buffer; source.loop = true;
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(asset.gain, context.currentTime + AUDIO_MIX.loopFadeSeconds);
      source.connect(gain); gain.connect(bus);
      const voice = { source, gain };
      source.onended = () => { source.disconnect(); gain.disconnect(); this.loops.delete(voice); this.retiring.delete(voice); };
      this.loops.add(voice); source.start();
    };
    // Resolve the pair together: pause/resume during a partial load cannot lose one layer.
    void Promise.all([bank.music ? this.load(bank.music.path) : null, bank.ambience ? this.load(bank.ambience.path) : null]).then(([music, ambience]) => {
      if (token !== this.generation) return;
      this.loadingBank = null;
      if (this.destroyed || this.context !== context || !this.musicActive || this.paused || this.muted) return;
      start(bank.music, this.music, music); start(bank.ambience, this.ambience, ambience);
      this.loadedBank = token;
    }).catch(() => { if (token === this.generation) this.loadingBank = null; });
  }
  play(sound: GameSound) {
    const context = this.context;
    if (!context || this.destroyed || !this.sfx || context.state !== "running" || this.muted || this.paused) return;
    const cue = SOUND_CUES[sound], at = context.currentTime;
    if (at - (this.lastAt.get(sound) ?? -Infinity) < cue.cooldown) return;
    this.lastAt.set(sound, at);
    let index = sampleIndex(cue.samples.length, this.random());
    if (cue.samples.length > 1 && index === this.lastVariant.get(sound)) index = (index + 1) % cue.samples.length;
    this.lastVariant.set(sound, index);
    const path = cue.samples[index], buffer = this.buffers.get(path);
    if (buffer) this.playVoice(sound, buffer);
    else if (this.failed.has(path)) this.playVoice(sound, null);
    else {
      const token = this.cueGeneration;
      void this.load(path).then(buffer => {
        if (this.context === context && token === this.cueGeneration && context.currentTime - at < 0.12) this.playVoice(sound, buffer);
      });
    }
  }
  private playVoice(sound: GameSound, buffer: AudioBuffer | null) {
    const context = this.context;
    if (!context || !this.sfx || this.destroyed || this.muted || this.paused || context.state !== "running") return;
    const cue = SOUND_CUES[sound], same = [...this.voices].filter(v => v.sound === sound);
    if (same.length >= cue.maxVoices) this.stopVoice(same[0]);
    if (this.voices.size >= AUDIO_MIX.maxVoices) {
      const victim = [...this.voices].find(v => v.priority < cue.priority);
      if (!victim) return;
      this.stopVoice(victim);
    }
    const source = buffer ? context.createBufferSource() : context.createOscillator();
    const gain = context.createGain(), at = context.currentTime;
    if (buffer) { (source as AudioBufferSourceNode).buffer = buffer; gain.gain.value = cue.gain; }
    else {
      // Only after sample fetch/decode failure; never the normal music/SFX path.
      (source as OscillatorNode).frequency.value = cue.fallbackHz;
      gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(0.12, at + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, at + 0.12);
    }
    source.connect(gain); gain.connect(this.sfx);
    const voice = { source, gain, sound, priority: cue.priority };
    source.onended = () => { source.disconnect(); gain.disconnect(); this.voices.delete(voice); };
    this.voices.add(voice); source.start();
    if (!buffer) source.stop(at + 0.13);
    if (sound === "hurt" || sound === "reflect" || sound === "bossSlam") this.duck();
  }
  private duck() {
    if (!this.context || !this.music) return;
    const at = this.context.currentTime, gain = this.music.gain;
    gain.cancelScheduledValues(at); gain.setValueAtTime(gain.value, at);
    gain.linearRampToValueAtTime(AUDIO_MIX.duckRatio, at + 0.025);
    gain.linearRampToValueAtTime(1, at + AUDIO_MIX.duckSeconds);
  }
  private stopVoice(voice: Voice) {
    try { voice.source.stop(); } catch { /* Already ended. */ }
    voice.source.disconnect(); voice.gain.disconnect(); this.voices.delete(voice);
  }
  private stopLoop(voice: LoopVoice) {
    try { voice.source.stop(); } catch { /* Already ended. */ }
    voice.source.disconnect(); voice.gain.disconnect();
  }
  private cancelCues() {
    this.cueGeneration++;
    for (const voice of this.voices) this.stopVoice(voice);
    this.lastAt.clear();
  }
  destroy() {
    this.destroyed = true; this.generation++; this.cancelCues();
    for (const controller of this.requests) controller.abort();
    this.requests.clear(); this.pending.clear(); this.buffers.clear(); this.failed.clear();
    for (const voice of [...this.loops, ...this.retiring]) this.stopLoop(voice);
    this.loops.clear(); this.retiring.clear();
    for (const node of [this.music, this.ambience, this.sfx, this.master, this.limiter]) node?.disconnect();
    if (this.context) void this.context.close().catch(() => {});
    this.context = null; this.master = this.music = this.ambience = this.sfx = null; this.limiter = null;
  }
}
