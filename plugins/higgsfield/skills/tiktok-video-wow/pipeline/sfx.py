"""Jana SFX lembut (sintesis sendiri, bebas hak cipta) dan susun ikut masa kad B-roll.

Guna: python3 -I sfx.py <config_resolved.json> <nama_draf> <tempoh_jumlah_saat> <output.wav>
"""
import json
import sys
import wave

import numpy as np
from scipy.signal import fftconvolve, lfilter

SR = 48000
rng = np.random.default_rng(7)


def env(n, attack, decay):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(attack, 1e-4)) * np.exp(-t / decay)


def lowpass(x, cutoff):
    # penapis satu-kutub dua laluan: lembut, tiada bunyi tajam
    a = np.exp(-2 * np.pi * cutoff / SR)
    for _ in range(2):
        x = lfilter([1 - a], [1, -a], x)
    return x


def reverb(x, wet=0.22, length=0.9):
    n = int(SR * length)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / (SR * length / 5))
    ir = lowpass(ir, 3500); ir /= np.abs(ir).sum() / 6
    tail = fftconvolve(x, ir)
    out = np.zeros(len(tail)); out[:len(x)] += x * (1 - wet); out += tail * wet
    return out


def whoosh(dur=0.55):
    n = int(SR * dur); t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    sweep = 400 + 1800 * np.sin(np.pi * t / dur) ** 2           # naik lalu turun
    y = np.empty(n); acc = 0.0
    for i in range(n):
        a = np.exp(-2 * np.pi * sweep[i] / SR); acc = (1 - a) * noise[i] + a * acc; y[i] = acc
    return y * np.sin(np.pi * t / dur) ** 2


def chime(f0=880.0, dur=1.6):
    n = int(SR * dur); t = np.arange(n) / SR
    y = sum(a * np.sin(2 * np.pi * f0 * m * t) * np.exp(-t / (0.9 / m)) for m, a in ((1, 1), (2.0, 0.35), (3.01, 0.15)))
    return y * env(n, 0.004, 10)


def pop(f0=620.0):
    n = int(SR * 0.09); t = np.arange(n) / SR
    f = f0 * (1 + 0.6 * t / 0.09)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.025)


def thump():
    n = int(SR * 0.35); t = np.arange(n) / SR
    y = np.sin(2 * np.pi * (70 + 60 * np.exp(-t / 0.03)) * t) * env(n, 0.002, 0.09)
    return y + 0.25 * lowpass(rng.standard_normal(n), 1800) * env(n, 0.001, 0.03)


def tick():
    n = int(SR * 0.05)
    return lowpass(rng.standard_normal(n), 4000) * env(n, 0.001, 0.008) + 0.5 * pop(1500)[:n] * env(n, 0.001, 0.01)


def norm(x, peak_db):
    return x / (np.abs(x).max() + 1e-9) * 10 ** (peak_db / 20)


# SFX ikut jenis kad: (masa relatif dari mula kad, bunyi, puncak dBFS)
WH = lambda: norm(reverb(whoosh()), -27)
CH = lambda f=880.0: norm(reverb(chime(f)), -28)
PLAN = {
    "egg": lambda c: [(-0.05, WH()), (0.85, norm(reverb(pop(900)), -27))],
    "syiqaq": lambda c: [(-0.05, WH())],
    "silent": lambda c: [(-0.05, WH()), (1.0, norm(reverb(chime(523.0, 1.8)), -30))],
    "cta": lambda c: [(-0.05, WH()), (0.35, CH(784))],
    "stamp": lambda c: [(0.22, norm(reverb(thump(), 0.15), -21))],
    "stigma": lambda c: [(-0.05, WH()), (1.1, norm(whoosh(0.3), -30)), (1.45, norm(reverb(thump(), 0.15), -23))],
    "officer": lambda c: [(-0.05, WH()), (1.65, CH(988))],
    "checklist": lambda c: [(-0.05, WH())] + [(0.7 + i * 0.6, norm(reverb(pop(560 + i * 90)), -26)) for i in range(3)],
    "help": lambda c: [(-0.05, WH()), (0.4, CH(784))],
    "rm10": lambda c: [(-0.05, WH()), (0.3, CH(1047))],
    "phone": lambda c: [(-0.05, WH())] + [(q + 0.05, norm(reverb(tick(), 0.12), -27)) for q in c.get("cues", [])[1:]],
    "call": lambda c: [(-0.05, WH()), (0.3, CH(880)), (0.55, CH(1109))],
    "couple": lambda c: [(-0.05, WH()), (0.75, CH(932))],
    "lock": lambda c: [(-0.05, WH()), (0.83, norm(reverb(tick(), 0.15), -24)), (1.0, CH(698))],
}


def main():
    cfg_path, name, total, out = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]
    draft = json.load(open(cfg_path))["drafts"][name]
    track = np.zeros(int(SR * (total + 2)))
    for c in draft["cards"]:
        plan = (lambda c: [(-0.05, WH())]) if c.get("clip") else PLAN.get(c["type"], lambda c: [])
        for rel, snd in plan(c):
            i = max(0, int((c["t"] + rel) * SR))
            seg = snd[:len(track) - i]
            track[i:i + len(seg)] += seg
    track = track[:int(SR * total)]
    with wave.open(out, "wb") as o:
        o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR)
        o.writeframes(np.int16(np.clip(track, -1, 1) * 32767).tobytes())
    print(name, "SFX:", sum(len(PLAN.get(c["type"], lambda c: [])(c)) for c in draft["cards"]), "bunyi")


if __name__ == "__main__":
    main()
