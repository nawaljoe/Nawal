"""Jana muzik latar ambient (piano + pad) untuk video Amanah.
Jalankan: python3 scripts/gen_music.py [saat] [saat_finale]   (lalai 50.1 41.7)"""
import sys, os, wave
import numpy as np

SR = 48000
DUR = float(sys.argv[1]) if len(sys.argv) > 1 else 50.1
FINALE = float(sys.argv[2]) if len(sys.argv) > 2 else 41.7
N = int(SR * DUR)
rng = np.random.default_rng(3)
L = np.zeros(N); R = np.zeros(N)

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)

# D major: Bm - G - D - A  (vi IV I V)
CHORDS = [
    [47, 59, 62, 66],  # Bm
    [43, 55, 59, 62],  # G
    [50, 57, 62, 66],  # D
    [45, 57, 61, 64],  # A
]
BEAT = 60 / 64
BAR = BEAT * 4

def add(sig, start, pan=0.0):
    i = int(start * SR)
    if i >= N: return
    sig = sig[: N - i]
    L[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
    R[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))

def piano(m, vel=0.5, length=4.0):
    t = np.arange(int(SR * length)) / SR
    f = hz(m)
    s = np.zeros_like(t)
    for k in range(1, 8):
        fk = f * k * (1 + 0.0004 * k * k)  # sedikit inharmonik
        s += np.sin(2 * np.pi * fk * t) / k ** 1.6 * np.exp(-t * (0.9 + 0.55 * k))
    env = np.minimum(1, t / 0.006)
    return s * env * vel * 0.32

def pad(notes, length, vel=0.5):
    t = np.arange(int(SR * length)) / SR
    s = np.zeros_like(t)
    for m in notes:
        for det in (-0.12, 0.0, 0.12):
            f = hz(m) * 2 ** (det / 12)
            s += np.sin(2 * np.pi * f * t + rng.random() * 6) + 0.18 * np.sin(4 * np.pi * f * t)
    env = np.minimum(1, t / 1.6) * np.minimum(1, (length - t) / 1.6).clip(0)
    lfo = 1 + 0.08 * np.sin(2 * np.pi * 0.18 * t)
    return s * env * lfo * vel * 0.035

bars = int(np.ceil(DUR / BAR))
finale_bar = int(FINALE / BAR)
for b in range(bars):
    c = CHORDS[b % 4]
    t0 = b * BAR
    lift = 1.35 if b >= finale_bar else 1.0
    add(pad(c, BAR + 1.6, 0.5 * lift), t0, pan=0)
    if t0 < 3.0:  # intro: pad sahaja + satu nota
        add(piano(c[2] + 12, 0.35, 5), t0 + 0.4, 0.2)
        continue
    # arpeggio lembut
    pattern = [(0, c[0] + 12, 0.42), (1.5, c[2] + 12, 0.3), (2, c[3] + 12, 0.32), (3, c[1] + 12, 0.28)]
    if b >= finale_bar:
        pattern += [(2.5, c[3] + 24, 0.18), (3.5, c[2] + 24, 0.16)]
    for beat, m, v in pattern:
        add(piano(m, v), t0 + beat * BEAT + rng.normal(0, 0.006), pan=rng.uniform(-0.35, 0.35))
    add(piano(c[0], 0.38, 5), t0, pan=-0.1)  # bass

# reverb (IR hingar mereput)
def reverb(x, seed):
    n = int(SR * 3.2)
    t = np.arange(n) / SR
    ir = np.random.default_rng(seed).normal(0, 1, n) * np.exp(-t / 0.85)
    ir[: int(0.02 * SR)] = 0
    ir /= np.sqrt((ir ** 2).sum())
    size = 1 << int(np.ceil(np.log2(len(x) + n)))
    y = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)]
    return y

wl, wr = reverb(L, 1), reverb(R, 2)
L = 0.72 * L + 0.55 * wl
R = 0.72 * R + 0.55 * wr

# fade masuk/keluar
fade = np.ones(N)
fi, fo = int(1.5 * SR), int(3.0 * SR)
fade[:fi] = np.linspace(0, 1, fi)
fade[-fo:] = np.linspace(1, 0, fo) ** 1.5
L *= fade; R *= fade

st = np.stack([L, R], 1)
rms = np.sqrt((st ** 2).mean())
st *= 10 ** (-19 / 20) / rms  # ~-19 dBFS RMS
peak = np.abs(st).max()
if peak > 0.89: st *= 0.89 / peak

out = os.path.join(os.path.dirname(__file__), "..", "public", "audio", "amanah-ambient.wav")
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype(np.int16).tobytes())
print("ok", out, DUR)
