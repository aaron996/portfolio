# Kiểm tra âm thanh: đỉnh/RMS theo 0.5s, độ lặng ở khoảng ngắt, phổ (spectrogram PNG), onset so với lưới nhịp.
import sys, numpy as np
from scipy.io import wavfile
from scipy import signal
sr, x = wavfile.read(sys.argv[1]); x = x.astype(np.float64) / (2**31 if x.dtype == np.int32 else 32768 if x.dtype == np.int16 else 1)
m = x.mean(axis=1); N = len(m)
print("dur", N / sr, "peak dBFS", 20*np.log10(np.abs(x).max()+1e-12))
for i in range(0, int(N/sr*2)):
    seg = m[i*sr//2:(i+1)*sr//2]; r = 20*np.log10(np.sqrt((seg**2).mean())+1e-9); p = 20*np.log10(np.abs(seg).max()+1e-9)
    print(f"{i/2:5.1f}s  rms {r:6.1f}  peak {p:6.1f}  " + "#"*int(max(0, (r+60)/1.5)))
d = np.abs(np.diff(x, axis=0)).max(); print("max sample step (click check)", d)
f, t, S = signal.spectrogram(m, sr, nperseg=2048, noverlap=1536)
from PIL import Image
L = 10*np.log10(S+1e-12); L = np.clip((L+110)/70, 0, 1)
idx = np.linspace(0, len(f)-1, 400).astype(int)**1
img = (L[:400,:][::-1]*255).astype(np.uint8)
Image.fromarray(img).resize((1500, 500)).save(sys.argv[2])
# cân bằng phổ theo giây (dB so với tổng)
bands = [(20,150),(150,1000),(1000,4000),(4000,10000),(10000,20000)]
F, Tt, Sxx = signal.spectrogram(m, sr, nperseg=4096, noverlap=2048)
print("sec   <150  150-1k  1-4k  4-10k  >10k  (dB)")
for sec in range(15):
    cols = (Tt >= sec) & (Tt < sec+1)
    row = []
    for lo, hi in bands:
        sel = (F >= lo) & (F < hi); row.append(10*np.log10(Sxx[sel][:, cols].sum(axis=0).mean()+1e-15))
    print(f"{sec:>3} " + " ".join(f"{v:6.1f}" for v in row))
