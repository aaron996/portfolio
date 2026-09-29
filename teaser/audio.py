"""
Nhạc + sound design cho teaser 15s (48 kHz, stereo). Không mẫu ngoài, không lời:
mọi âm đều tổng hợp từ đầu bằng numpy/scipy (piano mô hình vật lý đơn giản, pad/choir, bass, trống, riser, impact),
qua reverb tích chập (room + hall). Cùng lưới nhịp với index.html: 128 BPM → 1 beat = 0.46875s, 15s = 32 beat.

Chạy:  python teaser/audio.py            → export/teaser-audio.wav (24-bit) + export/audio-cues.json
"""
import json, os, sys
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
DUR = 15.0
N = int(SR * DUR)
BPM = 128
BEAT = 60 / BPM
b = lambda n: n * BEAT
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "export")
rng = np.random.default_rng(20260929)

# ── mốc trùng với T trong index.html ──
T = dict(sense=b(12), data=b(13), step=[b(16), b(18), b(20), b(22)], img2=b(22.5), img3=b(23), num=b(24), lock=b(25.25),
         make=b(25.5), things=b(26), work=b(26.5), cut=b(27), spark=b(27.55), hit=b(28))

# ───────────────────────── tiện ích DSP ─────────────────────────
def tt(n): return np.arange(n) / SR
def sos(kind, fc, order=2): return signal.butter(order, fc, btype=kind, fs=SR, output="sos")
def lp(x, fc, order=2): return signal.sosfilt(sos("low", min(fc, SR * .45), order), x)
def hp(x, fc, order=2): return signal.sosfilt(sos("high", fc, order), x)
def bp(x, lo, hi, order=2): return signal.sosfilt(sos("band", [lo, min(hi, SR * .45)], order), x)
def noise(n): return rng.standard_normal(n)
def env_exp(n, tau): return np.exp(-tt(n) / tau)

def tv_filter(x, kind, fc, q_bw=None, chunk=256, order=2):
    """Bộ lọc có tần số cắt đổi theo thời gian. fc: mảng theo mẫu (Hz). kind: low|high|band (band dùng q_bw = tỉ lệ băng)."""
    y = np.zeros_like(x); zi = None
    for i in range(0, len(x), chunk):
        f = float(np.clip(fc[min(i + chunk // 2, len(x) - 1)], 30, SR * .45))
        if kind == "band":
            s = sos("band", [max(20, f * (1 - q_bw)), min(SR * .45, f * (1 + q_bw))], order)
        else:
            s = sos(kind, f, order)
        if zi is None or zi.shape[0] != s.shape[0]:
            zi = np.zeros((s.shape[0], 2))
        y[i:i + chunk], zi = signal.sosfilt(s, x[i:i + chunk], zi=zi)
    return y

def fade(x, a=0.002, r=0.02):
    x = x.copy(); na, nr = int(a * SR), int(r * SR)
    if na: x[:na] *= np.linspace(0, 1, na)
    if nr and nr < len(x): x[-nr:] *= np.linspace(1, 0, nr)
    return x

def midi(m): return 440.0 * 2 ** ((m - 69) / 12)
NOTE = {n: i for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}
def nf(name):  # "A3" → Hz
    n, o = name[:-1], int(name[-1]); return midi(12 * (o + 1) + NOTE[n])

# ───────────────────────── nguồn âm ─────────────────────────
def piano(f, vel=.7, dur=None):
    """Piano mềm kiểu felt/cinematic: nhiều dây lệch nhẹ, partial hơi lệch hoà âm, búa gõ ngắn."""
    tau0 = float(np.clip(4.8 * (110 / f) ** .32, 1.3, 6.0))
    dur = dur or min(6.5, tau0 * 1.7)
    n = int(dur * SR); t = tt(n); y = np.zeros(n)
    B = 1.2e-4 * (1 + (f / 600) ** 2)
    bright = .50 + .38 * vel
    for k in range(1, 17):
        fk = k * f * np.sqrt(1 + B * k * k)
        if fk > 11000: break
        ak = (1 / k ** 1.12) * bright ** (k - 1)
        tk = tau0 / (1 + .42 * (k - 1))
        for det, ph in ((-1.2e-3, 0.0), (0.0, 1.7), (1.4e-3, 3.1)):     # 3 dây
            y += (ak / 3) * np.sin(2 * np.pi * fk * (1 + det) * t + ph + k) * np.exp(-t / tk)
    thump = lp(noise(n), 1500) * np.exp(-t / .012) * .5 * vel
    y = y + thump * np.abs(y).max()
    y *= np.minimum(1, t / .0015)                                        # attack ~1.5ms
    y = lp(y, 2400 + 7000 * vel)
    return fade(y / (np.abs(y).max() + 1e-9) * (.25 + .75 * vel), 0.0, .04)

def saw(f, n, ph=0.0): return 2 * ((f * tt(n) + ph) % 1.0) - 1

def supersaw(f, n, cents=(-13, -6, 0, 6, 13)):
    y = np.zeros(n)
    for i, c in enumerate(cents): y += saw(f * 2 ** (c / 1200), n, ph=rng.random())
    return y / len(cents)

def pad(freqs, dur, cut0=500, cut1=3000, attack=1.2, rel=.4, gain=1.0):
    n = int(dur * SR); t = tt(n); y = sum(supersaw(f, n) for f in freqs) / np.sqrt(len(freqs))
    fc = np.linspace(cut0, cut1, n) if not np.isscalar(cut0) else cut0 + (cut1 - cut0) * (t / dur) ** 1.5
    y = tv_filter(y, "low", fc)
    e = np.minimum(1, t / attack) * np.minimum(1, (dur - t) / rel)
    return y * e * gain

def choir(freqs, dur, attack=1.5, rel=.6, gain=1.0):
    """Đồng ca 'ah': saw → ba formant (≈700/1150/2600 Hz), thêm hơi thở + vibrato chậm."""
    n = int(dur * SR); t = tt(n); vib = 1 + .0035 * np.sin(2 * np.pi * 5.2 * t + rng.random() * 6)
    y = np.zeros(n)
    for f in freqs:
        for c in (-9, 0, 9):
            ph = np.cumsum(f * 2 ** (c / 1200) * vib) / SR
            y += 2 * (ph % 1) - 1
    y /= len(freqs) * 3
    out = bp(y, 620, 820) * 1.0 + bp(y, 1000, 1300) * .55 + bp(y, 2300, 2900) * .25 + lp(y, 350) * .35
    out += hp(noise(n), 3500) * .012
    e = np.minimum(1, t / attack) * np.minimum(1, (dur - t) / rel)
    return out * e * gain * 3.2

def sine_sweep(f0, f1, dur, curve="exp"):
    n = int(dur * SR); t = tt(n)
    f = f0 * (f1 / f0) ** (t / dur) if curve == "exp" else np.linspace(f0, f1, n)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)

def kick(vel=1.0, depth=1.0):
    n = int(.55 * SR); t = tt(n)
    f = 42 + 150 * depth * np.exp(-t / .028)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .19)
    y += hp(noise(n), 2500) * np.exp(-t / .004) * .35
    y = np.tanh(y * (1.5 + vel)) * vel
    return fade(y * .95, 0, .01)

def snare(vel=1.0):
    n = int(.45 * SR); t = tt(n)
    y = bp(noise(n), 1400, 9000) * np.exp(-t / .105) * .9 + np.sin(2 * np.pi * 185 * t) * np.exp(-t / .055) * .6
    y += hp(noise(n), 5000) * np.exp(-t / .02) * .4
    return np.tanh(y * 1.4) * vel

def clap(vel=1.0):
    n = int(.5 * SR); t = tt(n); y = np.zeros(n)
    for d in (0, .011, .022, .036): y[int(d * SR):] += bp(noise(n - int(d * SR)), 1000, 4500) * np.exp(-tt(n - int(d * SR)) / (.012 if d < .03 else .13))
    return np.tanh(y * .9) * vel * .8

def hat(vel=1.0, open_=False):
    n = int((.30 if open_ else .07) * SR); t = tt(n)
    return hp(noise(n), 7500) * np.exp(-t / (.07 if open_ else .014)) * vel * .5

def tom(f=110, vel=1.0, dur=.55):
    n = int(dur * SR); t = tt(n); fr = f * (1 + .9 * np.exp(-t / .03))
    y = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / (dur * .35)) + lp(noise(n), 900) * np.exp(-t / .02) * .35
    return np.tanh(y * 1.6) * vel

def sub_boom(dur=2.4, f0=95, f1=31, vel=1.0):
    n = int(dur * SR); t = tt(n); fr = f1 + (f0 - f1) * np.exp(-t / .16)
    y = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / (dur * .34))
    y += .25 * np.sin(4 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / .5)
    return np.tanh(y * 1.4) * vel

def crash(dur=3.0, vel=1.0):
    n = int(dur * SR); t = tt(n); y = hp(noise(n), 900) * np.exp(-t / (dur * .28))
    y = tv_filter(y, "low", 12000 * np.exp(-t / 1.8) + 2500)
    y += bp(noise(n), 5200, 5800) * np.exp(-t / .9) * .08
    return y * vel * .6

def swell(dur, f0=400, f1=9000, gain=1.0, power=2.6, reverse=False):
    n = int(dur * SR); t = tt(n); x = noise(n)
    y = tv_filter(x, "band", f0 * (f1 / f0) ** (t / dur), q_bw=.55) * (t / dur) ** power
    y = y / (np.abs(y).max() + 1e-9) * gain
    return y[::-1] if reverse else y

def riser_tone(dur, f0, f1, gain=1.0):
    n = int(dur * SR); t = tt(n); f = f0 * (f1 / f0) ** (t / dur)
    ph = np.cumsum(f) / SR; y = (2 * (ph % 1) - 1) + .6 * (2 * ((ph * 1.005) % 1) - 1)
    y = tv_filter(y, "low", 400 + 7000 * (t / dur) ** 1.4)
    return y * (t / dur) ** 2 * gain * .5

def bass_note(f, dur, gain=1.0, drive=2.0):
    n = int(dur * SR); t = tt(n); y = np.sin(2 * np.pi * f * t) + .45 * lp(saw(f, n), 420) + .2 * np.sin(4 * np.pi * f * t)
    y = np.tanh(y * drive) / np.tanh(drive)
    return y * np.minimum(1, t / .008) * np.minimum(1, (dur - t) / .03) * gain

def braam(dur=3.2, gain=1.0):
    """Đồng nặng kiểu trailer: chồng saw Am, lọc đóng dần, méo."""
    n = int(dur * SR); t = tt(n)
    y = sum(supersaw(f, n, cents=(-20, -9, 0, 9, 20)) for f in [nf("A1"), nf("A2"), nf("E3"), nf("A3"), nf("C4"), nf("E4")]) / 3
    y = tv_filter(y, "low", 4200 * np.exp(-t / .55) + 380)
    y = np.tanh(y * 3.2)
    e = np.minimum(1, t / .02) * np.exp(-t / 1.35) * np.minimum(1, (dur - t) / .3)
    return y * e * gain * .55

def chirp_resolve(steps, vel=.5, f0=320):
    """Nghe được cú 'nét dần': mỗi khung 1/60s một nấc, bậc 1/3 quãng tám — trùng bước pixel ở hình."""
    seg = int(round(SR / 60)); y = np.zeros(seg * steps); ph = 0.0
    for i in range(steps):
        f = f0 * 2 ** (i / 3); n = seg; tt_ = (np.arange(n) / SR)
        sq = np.sign(np.sin(2 * np.pi * f * tt_ + ph)); ph += 2 * np.pi * f * n / SR
        y[i * seg:(i + 1) * seg] = np.round(sq * (.55 + .45 * i / steps) * 6) / 6 * np.minimum(1, np.arange(n) / 40)
    y = lp(y, 9000)
    return y * vel * np.linspace(1, .5, len(y))

def click(f=1800, dur=.02, vel=1.0):
    n = int(dur * SR); t = tt(n); return (np.sin(2 * np.pi * f * t) + .4 * hp(noise(n), 4000)) * np.exp(-t / (dur * .3)) * vel

def bell(f, dur=.8, vel=1.0):
    n = int(dur * SR); t = tt(n)
    y = np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / .1) + .3 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / .04)
    return y * np.exp(-t / (dur * .3)) * np.minimum(1, t / .002) * vel * .5

# ───────────────────────── bus & mix ─────────────────────────
class Bus:
    def __init__(self): self.a = np.zeros((2, N))
    def add(self, x, t0, gain=1.0, pan=0.0):
        i0 = int(round(t0 * SR));
        if i0 >= N: return
        x = np.asarray(x)[: max(0, N - i0)]; g = gain
        l = np.cos((pan + 1) * np.pi / 4) * g; r = np.sin((pan + 1) * np.pi / 4) * g
        self.a[0, i0:i0 + len(x)] += x * l; self.a[1, i0:i0 + len(x)] += x * r

class BusSet:
    def __init__(self): self.dry, self.duck, self.room, self.hall = Bus(), Bus(), Bus(), Bus()
SETS = [BusSet(), BusSet()]          # [0] = trước b27 (bị cổng cắt cứng), [1] = từ pixel lime trở đi (khoảng lặng + tên)
duck = "duck"                        # nhãn bus: pad/bass bị kick ép
kick_times = []

def put(x, t0, gain=1.0, pan=0.0, rm=0.0, hl=0.0, bus=None):
    S = SETS[1 if t0 >= T["cut"] - .001 else 0]
    (S.duck if bus == duck else S.dry).add(x, t0, gain, pan)
    if rm: S.room.add(x, t0, gain * rm, pan)
    if hl: S.hall.add(x, t0, gain * hl, pan)

def K(t0, vel=1.0, depth=1.0):
    kick_times.append((t0, vel)); put(kick(vel, depth), t0, .95, 0, rm=.06)

# ───────────────────────── SOẠN NHẠC ─────────────────────────
CH = {"Am": ["A2", "E3", "A3", "C4", "E4"], "F": ["F2", "C3", "F3", "A3", "C4"], "G": ["G2", "D3", "G3", "B3", "D4"]}
ROOT = {"Am": "A1", "F": "F1", "G": "G1"}
def chord(name, extra=0): return [nf(n) * (2 ** extra) for n in CH[name]]

# --- 0 → b8: khoảng thở. Drone sub + vài nốt piano thưa (mỗi nốt = một ô sáng trên ma trận) ---
put(bass_note(nf("A1"), b(8) + .5, .32, 1.2)[:], 0, 1, 0, bus=duck)
put(pad([nf("A2"), nf("E3")], b(8) + 1, 300, 1400, attack=3.2, rel=1.0, gain=.20), 0, 1, 0, hl=.5, bus=duck)
piano_intro = [(1, "A3", .48), (2.5, "E4", .5), (3.5, "A4", .56), (5, "C5", .58), (6, "A4", .55), (7, "E5", .62)]
for bt, nn, v in piano_intro:
    put(piano(nf(nn), v), b(bt), .95, (-.25 if nf(nn) < 400 else .25), rm=.15, hl=.55)
put(piano(nf("A2"), .4, 5.0), b(0.0) + .05, .6, -.1, hl=.5)          # nốt trầm mở đầu
put(piano(nf("F2"), .45, 5.0), b(4), .6, -.1, hl=.5)
# hạt nhiễu (dữ liệu) xuất hiện từ ~2.2s: ticks nhỏ thưa dần đặc
for k in range(46):
    tk = 2.3 + (b(8) - 2.3) * (k / 46) ** .8 + rng.random() * .05
    put(click(rng.uniform(2600, 5200), .012, .11 + .08 * k / 46), tk, 1, rng.uniform(-.8, .8), hl=.25)
put(swell(b(2.6), 300, 7000, .34, 2.4), b(5.4), 1, 0, hl=.4)                      # hơi thở tới b8
put(swell(b(1.0), 500, 9000, .38, 2.2, reverse=False), b(7), 1, 0, hl=.5)

# --- b8 → b12: nhịp tim vào, ostinato piano, đồng ca dâng ---
prog = [(8, "Am"), (12, "F"), (16, "Am"), (20, "F"), (24, "G")]
arp = {"Am": ["A3", "E4", "A4", "C5", "E5", "C5", "A4", "E4"], "F": ["F3", "C4", "F4", "A4", "C5", "A4", "F4", "C4"], "G": ["G3", "D4", "G4", "B4", "D5", "B4", "G4", "D4"]}
def arp_bar(b0, ch, vel0, vel1, octave=False, until=None):
    for i in range(8):
        bt = b0 + i * .5
        if until and bt >= until: break
        v = vel0 + (vel1 - vel0) * i / 7
        put(piano(nf(arp[ch][i]), v, 2.4), b(bt), .8, (-.35 + .7 * (i % 4) / 3), rm=.12, hl=.35)
        if octave and i % 2 == 0: put(piano(nf(arp[ch][i]) * 2, v * .8, 1.8), b(bt), .32, .4, hl=.4)
arp_bar(8, "Am", .42, .58); arp_bar(12, "F", .55, .72)
# đồng ca + pad dâng b8 → b16
put(choir(chord("Am"), b(4) + .5, 2.0, .3, gain=.30), b(8), 1, 0, hl=.35, bus=duck)
put(choir(chord("F"), b(4) + .5, 1.0, .4, gain=.36), b(12), 1, 0, hl=.35, bus=duck)
put(pad(chord("Am"), b(4) + .3, 400, 2600, 1.5, .2, .30), b(8), 1, 0, hl=.2, bus=duck)
put(pad(chord("F"), b(4) + .3, 800, 3600, .6, .2, .34), b(12), 1, 0, hl=.2, bus=duck)
# bass sub: A1 (b8–12) rồi F1 (b12–16), xung 8 từ b12
put(bass_note(nf("A1"), b(4), .55, 1.6), b(8), 1, 0, bus=duck)
for i in range(8): put(bass_note(nf("F1"), b(.5) * .9, .62, 2.2), b(12 + i * .5), 1, 0, bus=duck)
# nhịp tim: kick nhẹ b8, b10; hat 8 từ b10; từ b12 kick từng beat
K(b(8), .55, .6); K(b(9.5), .4, .6); K(b(10), .6, .7); K(b(11.5), .45, .6)
for i in range(4): put(hat(.30 + .06 * i), b(10 + i * .5), .5, .3, rm=.1)
# reverse-swell + nốt thang vào cú "SENSE" (b12) và "OF DATA." (b13)
put(swell(b(1.05), 250, 9000, .60, 2.0), b(11), 1, 0, hl=.4)
put(riser_tone(b(4), 120, 1600, .16), b(12), 1, 0, hl=.3)
put(swell(b(4), 500, 10000, .38, 2.4), b(12), 1, 0, hl=.35)

def hit(t0, big=1.0, rise=False, pitch=1.0, chirp=None, crash_=True):
    """Cú nhấn = sub thump + kick + burst noise (+ crash) + chirp 'nét dần' nếu có pixel-resolve."""
    K(t0, .95 * big, 1.0)
    put(sub_boom(1.6 + 1.2 * big, 88 * pitch, 33 * pitch, .9 * big), t0, .85, 0, hl=.2)
    put(hp(noise(int(.35 * SR)), 700) * np.exp(-tt(int(.35 * SR)) / .06), t0, .5 * big, 0, hl=.4)
    if crash_: put(crash(1.2 + 1.0 * big, .5 * big), t0, .32, 0, hl=.3)
    if chirp: put(chirp_resolve(chirp, .5), t0, .45, 0)

# b12 SENSE: cú lớn đầu tiên. b13 OF DATA.: nhỏ hơn
hit(T["sense"], 1.0, chirp=None)
put(piano(nf("A2"), .85, 5), T["sense"], .8, 0, hl=.55); put(piano(nf("A3"), .8, 5), T["sense"], .6, 0, hl=.55); put(piano(nf("E4"), .8, 5), T["sense"], .5, 0, hl=.55)
put(tom(96, .8), T["data"], .8, -.2, rm=.2, hl=.2)
put(sub_boom(1.2, 80, 36, .6), T["data"], .8, 0, hl=.15)
# b13 → b16: kick từng beat, clap b14/b15, hat 8, snare roll b15→b16
for bt in (13, 14, 15): K(b(bt), .6 + .1 * (bt - 13), .8)
for bt in (14, 15): put(clap(.7), b(bt), .6, 0, rm=.25, hl=.2)
for i in range(6): put(hat(.34 + .04 * i), b(13 + i * .5), .5, .3, rm=.1)
for i in range(8): put(snare(.28 + .5 * i / 7), b(15 + i * .125), .55, 0, rm=.2)      # 32nd roll
put(swell(b(1), 800, 12000, .5, 1.5), b(15), 1, 0, hl=.3)
# text "nổ" 7.22 → 7.5: whoosh kéo tới cú 01
put(swell(.32, 300, 10000, .55, 1.4), T["step"][0] - .32, 1, 0, hl=.3)

# --- b16 → b24: montage. Am (b16–20) → F (b20–24) ---
put(choir(chord("Am"), b(4) + .3, .4, .3, gain=.42), b(16), 1, 0, hl=.3, bus=duck)
put(pad(chord("Am") + [nf("A4")], b(4) + .3, 2000, 4200, .05, .2, .5), b(16), 1, 0, hl=.15, bus=duck)
put(choir(chord("F"), b(4) + .3, .4, .3, gain=.42), b(20), 1, 0, hl=.3, bus=duck)
put(pad(chord("F") + [nf("F4")], b(4) + .3, 2000, 4200, .05, .2, .5), b(20), 1, 0, hl=.15, bus=duck)
arp_bar(16, "Am", .62, .78, octave=True); arp_bar(20, "F", .65, .82, octave=True)
arp_bar(24, "G", .66, .86, octave=True, until=b(25.5))
# bass 8th pumping
for b0, ch in ((16, "Am"), (20, "F"), (24, "G")):
    for i in range(8):
        if b0 + i * .5 >= 27: break
        put(bass_note(nf(ROOT[ch]) * (2 if i % 4 == 3 else 1), b(.5) * .92, .70, 2.6), b(b0 + i * .5), 1, 0, bus=duck)
put(bass_note(nf("A1"), b(1), .8, 2), b(15.9), 1, 0, bus=duck)

# cú nhấn từng bước (kèm chirp pixel-resolve 14 nấc = 14 khung)
def montage_beats(b0, b1, snares):
    for bt in np.arange(b0, b1, 1.0): K(b(bt), .92, 1.0)
    for bt in snares: put(clap(.85), b(bt), .75, 0, rm=.25, hl=.15); put(snare(.7), b(bt), .5, 0, rm=.2)
    for i in range(int((b1 - b0) * 4)):
        put(hat(.28 + .12 * (i % 4 == 2), open_=(i % 8 == 6)), b(b0 + i * .25), .5, .35, rm=.1)
# b16: hit lớn
hit(T["step"][0], 1.0, chirp=14)
montage_beats(16, 24, [17, 19, 21, 23])
put(piano(nf("A1"), .9, 5), b(16), .8, 0, hl=.5)
# 01: viewfinder lock ở b17 (ping), gộp sẵn ở dưới
put(bell(nf("A6"), .9, .9), b(17), .55, .2, hl=.7); put(click(1200, .03, .6), b(17), .5)
# b18 (02): định nghĩa — 9 hàng thanh chốt cạnh nhau: ratchet click leo cao
hit(T["step"][1], .72, chirp=14, crash_=False)
for i in range(9): put(click(1500 + 220 * i, .018, .55), T["step"][1] + .234 + i * .016, .8, -.3 + .075 * i * 1, hl=.15)
put(bell(nf("E6"), .6, .6), b(19), .5, .2, hl=.6)
# b20 (03): đối chiếu — buzz lỗi rồi khớp
hit(T["step"][2], .72, chirp=14, crash_=False)
u0 = T["step"][2]; n_b = int((b(21) - u0 - .28) * SR); tb = tt(n_b)
buzz = np.sign(np.sin(2 * np.pi * 196 * tb)) * (np.floor((tb + .28) * 30) % 2 == 0) * .12
put(lp(buzz, 1800), u0 + .28, 1, 0, rm=.2)
put(bell(nf("A5"), 1.1, .8), b(21), .7, 0, hl=.7); put(bell(nf("E6"), 1.1, .5), b(21), .6, .2, hl=.7)
for i in range(14): put(click(2400 + 90 * i, .012, .32), b(21) + .03 + i * .016, .7, -.5 + i / 13, hl=.2)
# b22 (04): app thật — cú nhấn + whoosh; b23: ảnh thứ hai
hit(T["step"][3], .8, chirp=14, crash_=False)
hit(T["img2"], .5, chirp=5, crash_=False)
hit(T["img3"], .6, chirp=5, crash_=False)
put(swell(.5, 400, 9000, .35, 1.2), T["step"][3] - .5, 1, 0, hl=.3)
for k in range(4): put(click(3400 + 300 * k, .01, .12), T["step"][3] + .12 + k * .08, 1, .3, hl=.3)

# --- b24 → b27: con số, ba nhát, rồi cắt ---
put(choir([nf(n) for n in CH["G"]], b(3) + .1, .05, .1, gain=.46), b(24), 1, 0, hl=.25, bus=duck)
put(pad([nf(n) for n in CH["G"]] + [nf("G4")], b(3) + .1, 2500, 5200, .05, .1, .52), b(24), 1, 0, hl=.1, bus=duck)
hit(T["num"], 1.0, chirp=14)
for i in range(24): put(snare(.40 + .55 * i / 23), b(24 + i * .125 * 1.0), .55, 0, rm=.2)      # roll 32nd tới b27... (cắt sau b25.5)
# tick đếm 6 nấc (thang pentatonic đi lên) + khoá "97,5%"
scale = ["A5", "C6", "D6", "E6", "G6", "A6"]
for k in range(6): put(bell(nf(scale[k]), .5, .75), b(24.625) + k * b(.125), .6, -.3 + .12 * k, hl=.4)
put(bell(nf("E6"), 1.4, .9), T["lock"], .6, .3, hl=.7); put(piano(nf("E5"), .9, 3), T["lock"], .5, .2, hl=.5)
put(sub_boom(.9, 70, 40, .55), T["lock"], .7, 0)
put(riser_tone(b(3), 300, 3400, .34), b(24), 1, 0, hl=.2)
put(swell(b(3), 700, 13000, .5, 1.6), b(24), 1, 0, hl=.25)
# MAKE / THINGS / WORK.: ba nhát nặng dần
words = [(T["make"], 1.00, 118), (T["things"], 1.06, 100), (T["work"], 1.16, 84)]
for t0, big, f in words:
    K(t0, 1.0, 1.0); put(tom(f * 1.0, 1.0, .5), t0, .95, 0, rm=.2, hl=.15)
    put(sub_boom(1.0, 84, 34, .9), t0, .9, 0)
    put(chirp_resolve(5, .42), t0, .5, 0)
    put(hp(noise(int(.25 * SR)), 900) * np.exp(-tt(int(.25 * SR)) / .05), t0, .45, 0, hl=.3)
def blip(notes, step=.045, vel=.5):
    seg = int(step * SR); y = np.zeros(seg * len(notes))
    for i, nn in enumerate(notes):
        tt_ = tt(seg); y[i * seg:(i + 1) * seg] = np.sign(np.sin(2 * np.pi * nf(nn) * tt_)) * np.exp(-tt_ / (step * .8))
    return lp(y, 7000) * vel
put(blip(["E5", "B5", "E6"]), T["make"] + .02, .30, -.2, rm=.3)
put(swell(.20, 800, 9000, .40, 1.0, reverse=True), T["things"], .7, .2, hl=.3)
# đồng trầm stab ngắn cho ba nhát (Am–G–Am), bị cắt cứng ở b27
for t0, root in ((T["make"], "A1"), (T["things"], "G1"), (T["work"], "A1")):
    y = sum(supersaw(nf(root) * m, int(.36 * SR)) for m in (1, 2, 3)) / 2
    y = np.tanh(tv_filter(y, "low", 3400 * np.exp(-tt(int(.36 * SR)) / .12) + 500) * 3) * env_exp(int(.36 * SR), .16)
    put(y, t0, .55, 0, hl=.15, bus=duck)

# ───────── b27 → b28: khoảng lặng có chủ đích. Chỉ còn pixel lime (nốt đầu tiên) và hơi hút vào ─────────
put(click(3100, .03, .5), T["spark"], .5, 0, hl=.9)
put(bell(nf("A6"), 1.0, .4), T["spark"], .35, 0, hl=.9)
put(swell(.22, 500, 6000, .42, 2.0), T["hit"] - .22, 1, 0, hl=.3)

# ───────── b28: TÊN — cú nhấn cuối cùng ─────────
t0 = T["hit"]
hit(t0, 1.35, chirp=14)
put(braam(3.4, 1.0), t0, .95, 0, hl=.35)
put(bell(nf("A3"), 3, .6), t0, .3, 0, hl=.6)
for nn, v, pan in (("A1", .95, -.1), ("A2", .9, -.15), ("E3", .8, -.05), ("A3", .8, .05), ("C4", .75, .1), ("E4", .75, .15), ("A4", .7, .2)):
    put(piano(nf(nn), v, 5.5), t0, .70, pan, rm=.1, hl=.6)
put(choir([nf(n) for n in ["A2", "E3", "A3", "C4", "E4", "A4"]], DUR - t0 + .2, .12, 1.0, gain=.44), t0, 1, 0, hl=.4, bus=duck)
put(pad([nf(n) for n in ["A2", "E3", "A3", "C4"]], DUR - t0 + .2, 1500, 2400, .12, 1.0, .34), t0, 1, 0, hl=.3, bus=duck)
put(bass_note(nf("A1"), 1.4, .9, 2.2), t0, 1, 0, bus=duck)
# 4 nốt kính khi ma trận logo tự sắp lại (0.12s mỗi thế), nốt cuối khi vào thế IDLE
for i, nn in enumerate(["E6", "A6", "C7", "E6"]): put(bell(nf(nn), .7, .55), t0 + .12 * (i + 1), .35, -.3 + .2 * i, hl=.7)
# tên hiện (wipe) → chuông ấm + vệt sáng quét (14.05)
put(bell(nf("A5"), 2.2, .8), t0 + .30, .38, 0, hl=.7)
put(swell(.55, 1200, 12000, .3, .9), 14.05, 1, 0, hl=.5)
put(bell(nf("E7"), 1.2, .5), 14.30, .22, .3, hl=.9)
for i, nn in enumerate(["A5", "C6", "E6", "A6"]):
    put(bell(nf(nn), .9, .55), b(29 + i * .5), .32, -.3 + .2 * i, hl=.7); put(click(2600, .015, .35), b(29 + i * .5), .5, 0, hl=.3)
# dòng cuối: hai nốt piano cao thoát ra (mở, không giải quyết hết)
put(piano(nf("E5"), .55, 2.4), b(30), .55, .1, hl=.8); put(piano(nf("A5"), .5, 2.2), b(30.5), .5, -.1, hl=.8); put(piano(nf("C6"), .45, 1.6), b(31.5), .42, .1, hl=.9)

# ───────────────────────── Sidechain + reverb + master ─────────────────────────
duck_env = np.ones(N)
for kt, kv in kick_times:
    i0 = int(kt * SR); m = min(N - i0, int(.5 * SR))
    if m <= 0: continue
    duck_env[i0:i0 + m] = np.minimum(duck_env[i0:i0 + m], 1 - .58 * kv * np.exp(-np.arange(m) / SR / .11))
duck_env = lp(duck_env, 250, 1)      # làm mượt cạnh (tránh click)

def reverb_ir(rt60, damp, pre=.02, seed=1, width=1.0):
    r = np.random.default_rng(seed); n = int(rt60 * 1.15 * SR); t = tt(n)
    ir = np.stack([r.standard_normal(n), r.standard_normal(n)]) * np.exp(-6.9 * t / rt60)
    ir = np.stack([lp(hp(ir[k], 180, 1), damp, 1) for k in range(2)])
    ir *= np.minimum(1, t / .004)
    d = int(pre * SR); ir = np.pad(ir, ((0, 0), (d, 0)))
    ir /= np.sqrt((ir ** 2).sum(axis=1).mean())
    return ir
def conv(bus, ir):
    m = bus.a.mean(axis=0)
    l = signal.fftconvolve(m, ir[0])[:N]; r = signal.fftconvolve(m, ir[1])[:N]
    return np.stack([l, r])

ROOM_RET, HALL_RET = .55, .95
IR_ROOM = reverb_ir(.9, 7000, .008, 3); IR_HALL = reverb_ir(3.6, 5200, .028, 5)

def render_set(S):
    return S.dry.a + S.duck.a * duck_env + conv(S.room, IR_ROOM) * ROOM_RET + conv(S.hall, IR_HALL) * HALL_RET

pre_mix, post_mix = render_set(SETS[0]), render_set(SETS[1])
# Cắt cứng ở b27 (mọi thứ, kể cả đuôi reverb, về 0 trong 8ms) → im lặng thật rồi mới có pixel lime
cut_i = int(T["cut"] * SR); g = 8 * SR // 1000
gate = np.ones(N); gate[cut_i:cut_i + g] = np.linspace(1, 0, g); gate[cut_i + g:] = 0
# Tự động hoá độ lớn theo cấu trúc: mở đầu rất khẽ → dâng qua đoạn xây → montage → cú TÊN là đỉnh cao nhất
KEYS = [(0, -6), (2.4, -6), (T["sense"] - .02, -6), (T["sense"], -3.5), (T["step"][0] - .01, -3.5), (T["step"][0], -.5), (T["cut"], -.5)]
gdb = np.interp(tt(N), [k[0] for k in KEYS], [k[1] for k in KEYS])
pre_mix = pre_mix * (10 ** (gdb / 20))[None, :]
post_mix = post_mix * 10 ** (5.0 / 20)
mix = pre_mix * gate + post_mix
if os.environ.get("AUDIO_DEBUG"):
    w0, w1 = int(12.665 * SR), int(12.88 * SR)
    for nm, arr in (("pre*gate", pre_mix * gate), ("post", post_mix)): print("gap", nm, 20 * np.log10(np.abs(arr[:, w0:w1]).max() + 1e-12))
if os.environ.get("AUDIO_DEBUG"):
    def rms_db(x, a_, b_): 
        seg = x[..., int(a_ * SR):int(b_ * SR)]; return 20 * np.log10(np.sqrt((seg ** 2).mean()) + 1e-9)
    parts = {"dry": SETS[0].dry.a + SETS[1].dry.a, "duck": (SETS[0].duck.a + SETS[1].duck.a) * duck_env,
             "room": conv(SETS[0].room, IR_ROOM) * ROOM_RET, "hall": conv(SETS[0].hall, IR_HALL) * HALL_RET + conv(SETS[1].hall, IR_HALL) * HALL_RET}
    print("sec  " + "  ".join(f"{k:>6}" for k in parts) + "   total")
    for sec in range(15):
        print(f"{sec:>3}  " + "  ".join(f"{rms_db(v, sec, sec + 1):6.1f}" for v in parts.values()) + f"  {rms_db(mix, sec, sec + 1):6.1f}  peak {20*np.log10(np.abs(mix[:, sec*SR:(sec+1)*SR]).max()+1e-9):5.1f}")
mix = np.stack([lp(hp(mix[k], 28, 2), 14500, 2) for k in range(2)])   # bỏ rumble <28Hz, bo bớt hơi rít >14.5kHz
mix *= 10 ** (-11 / 20)                                               # hạ mức tổng thể trước khi ép
def softclip(x, th=.5):
    a = np.abs(x); return np.where(a <= th, x, np.sign(x) * (th + (1 - th) * np.tanh((a - th) / (1 - th))))
mix = softclip(mix)                                                   # đỉnh vượt 0.6 được bo mềm, không cắt gắt
# fade cuối 0.35s
fN = int(.35 * SR); mix[:, -fN:] *= np.linspace(1, 0, fN) ** 1.5
# chuẩn hoá theo LUFS xấp xỉ (dùng K-weighting gần đúng bằng ffmpeg ở bước kiểm tra) — ở đây chỉ chuẩn hoá đỉnh -1.0 dBFS
peak = np.abs(mix).max(); mix *= (10 ** (-1.5 / 20)) / peak
os.makedirs(OUT, exist_ok=True)
import wave
pcm = np.clip(np.round(mix.T * (2 ** 23 - 1)), -2 ** 23, 2 ** 23 - 1).astype(np.int32)
raw = np.stack([(pcm >> 0) & 255, (pcm >> 8) & 255, (pcm >> 16) & 255], axis=-1).astype(np.uint8).reshape(-1)   # 24-bit LE
with wave.open(os.path.join(OUT, "teaser-audio.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(3); w.setframerate(SR); w.writeframes(raw.tobytes())
cues = dict(bpm=BPM, beat=BEAT, samples=N, sr=SR, hits={k: v for k, v in T.items()}, peak_dbfs=-1.0)
json.dump(cues, open(os.path.join(OUT, "audio-cues.json"), "w"), indent=1)
print("ok", N, "samples; pre-normalise peak", float(peak))
