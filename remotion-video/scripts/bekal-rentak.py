"""Jana rentak perkusi rancak (gaya kompang/rebana, tiada melodi) untuk babak bekal dunia.
150 BPM, pukulan pertama pada 0.2s supaya setiap potongan klip (2.2, 3.8, 5.4, 7.0, 8.6s) jatuh atas beat.
Guna: python3 scripts/bekal-rentak.py public/bekal/sfx/rentak_rancak.wav
"""
import sys, wave
import numpy as np

SR = 48000
BPM = 150
BEAT = 60 / BPM          # 0.4s
STEP = BEAT / 4          # not 1/16
OFFSET = 0.2
LENGTH = 10.4            # saat
STOP_AT = 9.0            # rentak berhenti (drop) sebelum pusingan ke bekal akhirat
rng = np.random.default_rng(7)
out = np.zeros((int(SR * LENGTH), 2))

def env(n, attack, decay):
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-t / decay)

def dung(vel=1.0):  # pukulan bass kompang: membran rendah dengan pitch turun
    n = int(SR * 0.45); t = np.arange(n) / SR
    f = 70 + 80 * np.exp(-t / 0.03)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.16)
    s += 0.25 * rng.standard_normal(n) * env(n, 0.001, 0.01)
    return s * vel

def tak(vel=1.0):  # tamparan tinggi: tone pendek + noise
    n = int(SR * 0.18); t = np.arange(n) / SR
    s = 0.6 * np.sin(2 * np.pi * 420 * t) * env(n, 0.001, 0.03)
    noise = rng.standard_normal(n)
    noise = np.convolve(noise, np.ones(3) / 3, mode="same") - np.convolve(noise, np.ones(25) / 25, mode="same")
    s += 1.1 * noise * env(n, 0.001, 0.045)
    return s * vel

def clap(vel=1.0):
    n = int(SR * 0.2); s = np.zeros(n)
    for d in (0, 0.009, 0.018):
        i = int(d * SR); m = n - i
        nz = rng.standard_normal(m)
        nz = nz - np.convolve(nz, np.ones(12) / 12, mode="same")
        s[i:] += nz * env(m, 0.0005, 0.03 if d < 0.018 else 0.07)
    return 0.5 * s * vel

def shaker(vel=1.0):
    n = int(SR * 0.07)
    nz = rng.standard_normal(n); nz = nz - np.convolve(nz, np.ones(6) / 6, mode="same")
    return 0.35 * nz * env(n, 0.008, 0.018) * vel

def place(sig, t, pan=0.0):
    i = int(t * SR)
    if i >= len(out): return
    sig = sig[: len(out) - i]
    out[i:i + len(sig), 0] += sig * (1 - max(pan, 0))
    out[i:i + len(sig), 1] += sig * (1 + min(pan, 0))

# corak 16 langkah setiap bar
DUNG = {0: 1.0, 3: 0.7, 6: 0.85, 10: 0.8, 11: 0.5}
TAK = {4: 1.0, 12: 1.0, 14: 0.55, 9: 0.35}
CLAP = {4: 0.9, 12: 0.9}
step = 0
while True:
    t = OFFSET + step * STEP
    if t >= STOP_AT: break
    k = step % 16
    intro = t < 2.2  # 2.2s pertama lebih ringan
    if k in DUNG: place(dung(DUNG[k]), t)
    if k in TAK: place(tak(TAK[k] * (0.7 if intro else 1)), t, pan=0.25)
    if k in CLAP and not intro: place(clap(CLAP[k]), t, pan=-0.2)
    place(shaker((1.0 if k % 2 else 0.55) * (0.6 if intro else 1)), t, pan=-0.35)
    step += 1
place(dung(1.2), STOP_AT)  # pukulan penutup
place(tak(1.0), STOP_AT, pan=0.25)

out /= np.max(np.abs(out)) * 1.12
pcm = (out * 32767).astype("<i2")
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("ok", sys.argv[1])
