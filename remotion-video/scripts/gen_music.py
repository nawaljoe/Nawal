"""Jana muzik latar sedih (piano + strings) untuk video Amanah.

D minor, ~56 bpm. Progression disusun ke belakang dari hujung supaya chord
terakhir ialah tonik (Dm) — lagu selesai dengan "pulang", tak tergantung —
dan dibiar bergema sebelum outro FK masuk.

Jalankan: python3 scripts/gen_music.py [saat] [saat_finale]   (lalai 49.95 45.1)
"""
import sys, os, wave
import numpy as np

SR = 48000
DUR = float(sys.argv[1]) if len(sys.argv) > 1 else 49.95
FINALE = float(sys.argv[2]) if len(sys.argv) > 2 else 45.1
N = int(SR * DUR)
rng = np.random.default_rng(5)
L = np.zeros(N)
R = np.zeros(N)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


BPM = 56
BEAT = 60 / BPM
BAR = BEAT * 4

# 8 bar frasa (D minor): Dm  Bb  F  C | Dm  Bb  Gm  A
CHORDS = [
    (38, [50, 53, 57]),  # Dm
    (34, [50, 53, 58]),  # Bb
    (41, [48, 53, 57]),  # F
    (36, [48, 52, 55]),  # C
    (38, [50, 53, 57]),  # Dm
    (34, [50, 53, 58]),  # Bb
    (31, [50, 55, 58]),  # Gm
    (33, [49, 52, 57]),  # A  (C# = harmonic minor, tarik ke Dm)
]
# melodi (nota midi, rentak mula, panjang dalam beat) bagi setiap bar
MELODY = [
    [(69, 0, 2), (65, 2, 1), (64, 3, 1)],
    [(62, 0, 3), (65, 3, 1)],
    [(69, 0, 2), (72, 2, 1), (69, 3, 1)],
    [(67, 0, 3), (64, 3, 1)],
    [(65, 0, 2), (64, 2, 1), (62, 3, 1)],
    [(62, 0, 2), (65, 2, 2)],
    [(67, 0, 2), (70, 2, 1), (69, 3, 1)],
    [(69, 0, 3), (67, 3, 1)],
]


def add(sig, start, pan=0.0):
    i = int(start * SR)
    if i >= N or i + len(sig) <= 0:
        return
    if i < 0:
        sig = sig[-i:]
        i = 0
    sig = sig[: N - i]
    L[i : i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
    R[i : i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))


def piano(m, vel=0.5, length=5.0):
    t = np.arange(int(SR * length)) / SR
    f = hz(m)
    s = np.zeros_like(t)
    for k in range(1, 9):
        fk = f * k * (1 + 0.0004 * k * k)
        s += np.sin(2 * np.pi * fk * t) / k**1.7 * np.exp(-t * (0.55 + 0.5 * k))
    # sedikit "hammer" lembut
    s += 0.02 * rng.normal(0, 1, len(t)) * np.exp(-t * 60)
    env = np.minimum(1, t / 0.008)
    return s * env * vel * 0.3


def strings(notes, length, vel=0.5):
    t = np.arange(int(SR * length)) / SR
    s = np.zeros_like(t)
    for m in notes:
        for det in (-0.08, 0.0, 0.09):
            f = hz(m) * 2 ** (det / 12)
            vib = 1 + 0.0025 * np.sin(2 * np.pi * 5.2 * t + rng.random() * 6)
            ph = 2 * np.pi * f * np.cumsum(vib) / SR
            s += np.sin(ph) + 0.3 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph)
    att = min(2.2, length / 2)
    env = np.minimum(1, t / att) * np.clip((length - t) / 1.8, 0, 1)
    return s * env * vel * 0.02


# susun ke belakang: chord tonik akhir bermula RING saat sebelum tamat
RING = 4.5
end_chord = DUR - RING
nbars = int(np.floor(end_chord / BAR))
t0 = end_chord - nbars * BAR  # intro pendek (pad sahaja) sebelum bar pertama
finale_bar = int((FINALE - t0) / BAR)

# intro: strings Dm lembut + satu nota tinggi
add(strings([50, 57, 62], t0 + BAR, 0.35), 0)
add(piano(74, 0.18, 6), 0.3, 0.25)

for b in range(nbars):
    idx = (b - nbars) % 8  # bar terakhir sebelum tonik = A (idx 7)
    root, tri = CHORDS[idx]
    start = t0 + b * BAR
    lift = 1.25 if b >= finale_bar else 1.0
    add(strings(tri + [root + 12], BAR + 2.0, 0.55 * lift), start)
    add(piano(root, 0.36, 6), start, -0.15)  # bass
    add(piano(root + 7, 0.14, 4), start + 2 * BEAT, -0.1)
    for m, beat, ln in MELODY[idx]:
        vel = 0.30 if beat == 0 else 0.24
        add(piano(m + (12 if b >= finale_bar else 0), vel * (0.9 if b >= finale_bar else 1), ln * BEAT + 3),
            start + beat * BEAT + rng.normal(0, 0.008), rng.uniform(-0.2, 0.25))
        if b >= finale_bar:  # gandaan oktaf bawah, lebih penuh di penutup
            add(piano(m, vel * 0.55, ln * BEAT + 3), start + beat * BEAT, -0.2)

# chord tonik akhir: Dm penuh, bergema
add(strings([50, 53, 57, 62], RING + 1, 0.6), end_chord)
for j, m in enumerate([38, 50, 57, 62, 65, 69]):
    add(piano(m, 0.3 if j == 0 else 0.22, RING + 2), end_chord + j * 0.09, (j - 2.5) * 0.08)


def reverb(x, seed):
    n = int(SR * 3.8)
    t = np.arange(n) / SR
    ir = np.random.default_rng(seed).normal(0, 1, n) * np.exp(-t / 1.1)
    ir[: int(0.025 * SR)] = 0
    ir /= np.sqrt((ir**2).sum())
    size = 1 << int(np.ceil(np.log2(len(x) + n)))
    return np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)]


wl, wr = reverb(L, 1), reverb(R, 2)
L = 0.65 * L + 0.65 * wl
R = 0.65 * R + 0.65 * wr

fade = np.ones(N)
fi, fo = int(1.0 * SR), int(2.2 * SR)
fade[:fi] = np.linspace(0, 1, fi)
fade[-fo:] = np.linspace(1, 0, fo) ** 2
L *= fade
R *= fade

st = np.stack([L, R], 1)
rms = np.sqrt((st**2).mean())
st *= 10 ** (-19 / 20) / rms
peak = np.abs(st).max()
if peak > 0.89:
    st *= 0.89 / peak

out = os.path.join(os.path.dirname(__file__), "..", "public", "audio", "amanah-ambient.wav")
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((st * 32767).astype(np.int16).tobytes())
print("ok", out, f"{DUR}s, {nbars} bar + tonik pada {end_chord:.1f}s")
