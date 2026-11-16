"""Assemble and process the voice track, synthesise SFX, mix to -14 LUFS.

Usage: python3 audio.py <source.mp4> <edl.json> <workdir> <beep.mp4> <outro.mp4>
Writes <workdir>/mix.wav (48 kHz stereo): main cut at -14 LUFS followed by the outro's own audio.
No music: the creator adds a TikTok sound. The interviewer's voice is not used (v2).
"""
import json, subprocess, sys, wave
import numpy as np

SR = 48000
src, edl_path, wd, beep_src, outro_src = sys.argv[1:6]
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

# 1. Clean the speaker's lapel track.
ff("-i", src, "-vn", "-ac", "1", "-ar", str(SR), f"{wd}/src48.wav")
ff("-i", f"{wd}/src48.wav", "-af",
   "highpass=f=80,lowpass=f=14000,afftdn=nr=12:nf=-50:tn=1,deesser=i=0.4,"
   "acompressor=threshold=-24dB:ratio=3:attack=8:release=120:makeup=2", f"{wd}/spk.wav")
spk = read_wav(f"{wd}/spk.wav")

# 2. Assemble pieces with 6 ms fades at every join.
ff("-i", beep_src, "-vn", "-ac", "1", "-ar", str(SR), f"{wd}/beep_full.wav")
beep_full = read_wav(f"{wd}/beep_full.wav")
room = spk[int(93.75 * SR):int(95.05 * SR)]            # quiet room tone from the end of the take
fade = int(0.006 * SR); voice = []
for p in edl["pieces"]:
    n = int(round((p["out_out"] - p["out_in"]) * SR))
    if p["kind"] == "beep":                              # one short beep (first tone of the clip, 1 kHz)
        seg = beep_full[int(0.21 * SR):int(0.21 * SR) + n].copy()
        seg = seg / (np.max(np.abs(seg)) + 1e-9) * 10 ** (-22 / 20)
        f2 = int(0.012 * SR); seg[:f2] *= np.linspace(0, 1, f2); seg[-f2:] *= np.linspace(1, 0, f2)
    elif p["kind"] == "question":                        # silent card: room tone only
        seg = np.tile(room, n // len(room) + 1)[:n] * 0.8
    else:
        s0 = int(round(p["src_in"] * SR)); seg = spk[s0:s0 + n].copy()
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
D, V1A = edl.get("delta", 0.0), edl.get("v1_answer_start", 0.0)
sh = lambda t: t + D if t >= V1A - 1e-6 else t
Q = next(p for p in edl["pieces"] if p["kind"] == "question")
CUES_V1 = [  # (v1 output time, sound, gain dB); shifted onto the v2 timeline below
    (9.40, tick(2000), -26),
    (16.70, tick(2600), -24), (17.60, tick(2600), -24), (18.30, tick(1800), -28),
    (30.10, pop(), -24), (31.60, pop(), -24), (33.50, pop(), -24), (42.12, thud(), -16),
    (43.50, whoosh(0.6), -18), (50.98, stamp(), -22), (53.10, stamp(), -22),
    (55.54, tick(), -25), (58.02, tick(), -25), (61.18, tick(), -25), (66.44, tick(), -25),
    (71.02, riser(2.9), -24), (75.50, bell(), -24),
]
CUES = [(0.00, sub_hit(), -14), (Q["out_in"] + 0.03, pop(), -20)] + [(sh(t), snd, g) for t, snd, g in CUES_V1]
sfx = np.zeros(total)
for t0, snd, g in CUES:
    s = int(t0 * SR); snd = snd / (np.max(np.abs(snd)) + 1e-9) * 10 ** (g / 20)
    sfx[s:s + len(snd)] += snd[:total - s]
# riser stops dead on "Malaysia" (output ~73.92 s)
cut = int(sh(73.92) * SR); sfx[cut:cut + int(0.02 * SR)] *= np.linspace(1, 0, int(0.02 * SR))
r_end = int((sh(71.02) + 2.9) * SR); sfx[cut + int(0.02 * SR):r_end] = 0

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
   "aresample=48000", "-ac", "2", f"{wd}/main_mix.wav")
# 5. Outro keeps its own sound design, levelled to sit with the main mix, then appended.
ff("-i", outro_src, "-vn", "-af", "loudnorm=I=-15:TP=-1.5:LRA=11,aresample=48000", "-ac", "2", f"{wd}/outro.wav")
ff("-i", f"{wd}/main_mix.wav", "-i", f"{wd}/outro.wav", "-filter_complex", "[0][1]concat=n=2:v=0:a=1", f"{wd}/mix.wav")
print("measured", m["input_i"], "LUFS ->", "-14; outro appended")
