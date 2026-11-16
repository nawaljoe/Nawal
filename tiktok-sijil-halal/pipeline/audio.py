"""Assemble and process the voice track, synthesise SFX, mix to -14 LUFS.

Usage: python3 audio.py <source.mp4> <edl.json> <workdir>
Writes <workdir>/mix.wav (48 kHz stereo). No music: the creator adds a TikTok sound.
"""
import json, subprocess, sys, wave
import numpy as np

SR = 48000
src, edl_path, wd = sys.argv[1:4]
edl = json.load(open(edl_path))

def ff(*args):
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *args], check=True)

def read_wav(p):
    w = wave.open(p); ch = w.getnchannels()
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return x.reshape(-1, ch).mean(axis=1) if ch > 1 else x

def write_wav(p, x, ch=1):
    x = np.clip(x, -1, 1)
    if ch == 2: x = np.stack([x, x], axis=1).reshape(-1)
    w = wave.open(p, "wb"); w.setnchannels(ch); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((x * 32767).astype(np.int16).tobytes()); w.close()

# 1. Two cleaned versions of the source: speaker chain, and a stronger chain for the
#    off-camera interviewer (quiet, so it gets +19 dB after heavier noise reduction).
ff("-i", src, "-vn", "-ac", "1", "-ar", str(SR), f"{wd}/src48.wav")
ff("-i", f"{wd}/src48.wav", "-af",
   "highpass=f=80,lowpass=f=14000,afftdn=nr=12:nf=-50:tn=1,deesser=i=0.4,"
   "acompressor=threshold=-24dB:ratio=3:attack=8:release=120:makeup=2", f"{wd}/spk.wav")
ff("-i", f"{wd}/src48.wav", "-af",
   "highpass=f=120,lowpass=f=9000,afftdn=nr=24:nf=-55:tn=1,volume=19dB,"
   "acompressor=threshold=-26dB:ratio=3:attack=8:release=150:makeup=1,"
   "equalizer=f=3000:t=q:w=1:g=3", f"{wd}/int.wav")
spk, itv = read_wav(f"{wd}/spk.wav"), read_wav(f"{wd}/int.wav")

# 2. Assemble pieces with 6 ms fades at every join.
fade = int(0.006 * SR); voice = []
for i, p in enumerate(edl["pieces"]):
    n = int(round((p["out_out"] - p["out_in"]) * SR)); s = int(round(p["src_in"] * SR))
    seg = (itv if p["src_in"] < 7.0 else spk)[s:s + n].copy()   # piece starting <7 s is the question
    seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
    voice.append(seg)
voice = np.concatenate(voice)
total = int(round(edl["duration"] * SR))
voice = np.pad(voice, (0, total - len(voice)))

# 3. Synthesised SFX (all subtle, documentary register).
rng = np.random.default_rng(7)
def env(n, a, r):
    e = np.ones(n); a, r = int(a * SR), int(r * SR)
    e[:a] = np.linspace(0, 1, a); e[-r:] = np.linspace(1, 0, r) ** 2; return e
def sub_hit(d=0.9):
    t = np.arange(int(d * SR)) / SR; f = 55 * np.exp(-t * 2.5) + 38
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.5)
def whoosh(d=0.55):
    n = int(d * SR); x = rng.standard_normal(n)
    out = np.zeros(n); y = 0.0; t = np.arange(n) / n
    cut = 0.02 + 0.25 * np.sin(np.pi * t)            # one-pole lowpass sweeping up then down
    for i in range(n): y += cut[i] * (x[i] - y); out[i] = y
    return out * np.sin(np.pi * t) ** 1.5
def tick(f=2400, d=0.05):
    t = np.arange(int(d * SR)) / SR
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 90) + 0.3 * rng.standard_normal(len(t)) * np.exp(-t * 300)
def pop(d=0.09):
    t = np.arange(int(d * SR)) / SR; f = 900 * np.exp(-t * 30) + 300
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 45)
def thud(d=0.5):
    t = np.arange(int(d * SR)) / SR
    return np.sin(2 * np.pi * 70 * t) * np.exp(-t * 9) + 0.2 * np.sin(2 * np.pi * 140 * t) * np.exp(-t * 14)
def stamp(d=0.18):
    t = np.arange(int(d * SR)) / SR
    return 0.8 * np.sin(2 * np.pi * 180 * t) * np.exp(-t * 35) + 0.5 * rng.standard_normal(len(t)) * np.exp(-t * 60)
def riser(d=2.9):
    n = int(d * SR); t = np.arange(n) / SR; f = 180 + 520 * (t / d) ** 2
    tone = 0.5 * np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.25 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR)
    noise = rng.standard_normal(n) * 0.15
    return (tone + noise) * (t / d) ** 2.2
def bell(d=2.2):
    t = np.arange(int(d * SR)) / SR
    return sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, a, k in [(880, .6, 2.2), (1320, .25, 3), (2210, .12, 5), (440, .2, 1.6)])

def at_word(s, i=0): return s
CUES = [  # (output time, sound, gain dB)
    (0.00, sub_hit(), -14), (3.93, whoosh(), -22), (9.40, tick(2000), -26),
    (16.70, tick(2600), -24), (17.60, tick(2600), -24), (18.30, tick(1800), -28),
    (30.10, pop(), -24), (31.60, pop(), -24), (33.50, pop(), -24), (42.12, thud(), -16),
    (43.50, whoosh(0.6), -18), (50.98, stamp(), -22), (53.10, stamp(), -22),
    (55.54, tick(), -25), (58.02, tick(), -25), (61.18, tick(), -25), (66.44, tick(), -25),
    (71.02, riser(2.9), -24), (75.50, bell(), -24),
]
sfx = np.zeros(total)
for t0, snd, g in CUES:
    s = int(t0 * SR); snd = snd / (np.max(np.abs(snd)) + 1e-9) * 10 ** (g / 20)
    sfx[s:s + len(snd)] += snd[:total - s]
# riser stops dead on "Malaysia" (output ~73.92 s)
cut = int(73.92 * SR); sfx[cut:cut + int(0.02 * SR)] *= np.linspace(1, 0, int(0.02 * SR))
r_end = int((71.02 + 2.9) * SR); sfx[cut + int(0.02 * SR):r_end] = 0

write_wav(f"{wd}/voice.wav", voice); write_wav(f"{wd}/sfx.wav", sfx)
# 4. Mix and two-pass loudness normalise to -14 LUFS / -1 dBTP.
ff("-i", f"{wd}/voice.wav", "-i", f"{wd}/sfx.wav", "-filter_complex",
   "[0][1]amix=inputs=2:normalize=0,alimiter=limit=0.89:level=false", f"{wd}/premix.wav")
meas = subprocess.run(["ffmpeg", "-nostdin", "-hide_banner", "-i", f"{wd}/premix.wav", "-af",
                       "loudnorm=I=-14:TP=-1:LRA=9:print_format=json", "-f", "null", "-"],
                      capture_output=True, text=True).stderr
m = json.loads(meas[meas.rindex("{"):meas.rindex("}") + 1])
ff("-i", f"{wd}/premix.wav", "-af",
   f"loudnorm=I=-14:TP=-1:LRA=9:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
   f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,"
   "aresample=48000", "-ac", "2", f"{wd}/mix.wav")
print("measured", m["input_i"], "LUFS ->", "-14")
