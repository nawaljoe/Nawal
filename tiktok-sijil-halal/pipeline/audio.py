"""Assemble and process the voice track, synthesise SFX, mix to -14 LUFS.

Usage: python3 audio.py <source.mp4> <edl.json> <timeline.json> <workdir> <beep.mp4> <outro.mp4>
Writes <workdir>/mix.wav (48 kHz stereo): main cut at -14 LUFS followed by the outro's own audio.
No music: the creator adds a TikTok sound. The interviewer's voice is not used (v2).
"""
import json, subprocess, sys, wave
import numpy as np

SR = 48000
src, edl_path, tl_path, wd, beep_src, outro_src = sys.argv[1:7]
tl = json.load(open(tl_path))
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
def quietest(x, dur=1.3, hop=0.05):                     # room tone: quietest non-digital-silence stretch
    h = int(hop * SR); r = np.array([np.sqrt(np.mean(x[i:i + h] ** 2)) for i in range(0, len(x) - h, h)])
    k = int(dur / hop); m = np.convolve(np.where(r > 1e-5, r, 1.0), np.ones(k) / k, mode="valid")
    i = int(np.argmin(m)) * h; return x[i:i + int(dur * SR)]
room = quietest(spk)
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

# 3. Synthesised SFX, stereo. Cue list (time, kind, gain, options) comes from timeline.json so
#    sound stays locked to the graphics. Everything is generated here: no third-party samples.
rng = np.random.default_rng(7)
T = lambda d: np.arange(int(d * SR)) / SR
def lp(x, a):                                   # one-pole low-pass with per-sample coefficient
    y = np.empty_like(x); v = 0.0; a = np.broadcast_to(a, x.shape)
    for i in range(len(x)): v += a[i] * (x[i] - v); y[i] = v
    return y
def norm(x): return x / (np.max(np.abs(x)) + 1e-9)
def impact(size=1.0, **_):
    t = T(1.2 * size + 0.3); f = 48 * np.exp(-t * 3) + 34
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (3.2 / size))
    crack = lp(rng.standard_normal(len(t)), 0.35) * np.exp(-t * 45)
    return norm(body + 0.45 * crack)
def whoosh(dur=0.55, sweep=False, **_):
    t = T(dur); u = t / dur; n = rng.standard_normal(len(t))
    cut = 0.015 + (0.30 if sweep else 0.22) * np.sin(np.pi * u) ** 1.5
    return norm(lp(n, cut) * np.sin(np.pi * u) ** 1.8)
def swish(**_):
    t = T(0.28); u = t / 0.28; n = rng.standard_normal(len(t))
    hp = n - lp(n, 0.25)                         # airy, high-passed
    return norm(lp(hp, 0.05 + 0.5 * u) * np.sin(np.pi * u) ** 2)
def swoosh(dir=1, **_):
    """Breathy air swoosh (~0.45 s): band-limited noise whose brightness rises then falls; returns stereo with a pan sweep."""
    d = 0.45; t = T(d); u = t / d; n = rng.standard_normal(len(t))
    band = lp(n, 0.04 + 0.30 * np.sin(np.pi * u) ** 2) - lp(n, 0.012)
    m = norm(band * np.sin(np.pi * u) ** 2.2 * (1 + 0.6 * u))
    p = np.clip(-0.7 + 1.4 * u, -1, 1) * dir
    return np.stack([m * np.sqrt((1 - p) / 2) * 1.414, m * np.sqrt((1 + p) / 2) * 1.414], axis=1)
def pop(**_):
    t = T(0.12); f = 1100 * np.exp(-t * 35) + 260
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 38))
def bubble(pitch=1.0, **_):
    t = T(0.10); f = (500 + 1400 * (t / 0.10)) * pitch
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.10) ** 1.5)
def thock(pitch=1.0, **_):
    t = T(0.22)
    return norm(np.sin(2 * np.pi * 210 * pitch * t) * np.exp(-t * 28) + 0.4 * np.sin(2 * np.pi * 630 * pitch * t) * np.exp(-t * 45)
                + 0.3 * rng.standard_normal(len(t)) * np.exp(-t * 220))
def click(**_):
    t = T(0.04)
    return norm(np.sin(2 * np.pi * 3200 * t) * np.exp(-t * 160) + 0.5 * rng.standard_normal(len(t)) * np.exp(-t * 400))
def soft(**_):
    t = T(0.35); return norm(np.sin(2 * np.pi * 660 * t) * np.exp(-t * 9) * (1 - np.exp(-t * 200)))
def thump(**_):
    t = T(0.35); return norm(np.sin(2 * np.pi * (62 + 30 * np.exp(-t * 25)) * t) * np.exp(-t * 12))
def paper(**_):
    t = T(0.3); u = t / 0.3; n = rng.standard_normal(len(t))
    return norm((n - lp(n, 0.4)) * np.sin(np.pi * u) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * t)))
def stamp(**_):
    t = T(0.25)
    return norm(0.9 * np.sin(2 * np.pi * 150 * t) * np.exp(-t * 30) + 0.6 * lp(rng.standard_normal(len(t)), 0.3) * np.exp(-t * 70))
def tick(pitch=1.0, **_):
    t = T(0.09); f = 1500 * pitch
    return norm(np.sin(2 * np.pi * f * t) * np.exp(-t * 60) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 90))
def shimmer(**_):
    t = T(1.4)
    return norm(sum(np.sin(2 * np.pi * f * t + i) * np.exp(-t * (2.5 + i)) for i, f in enumerate([1760, 2217, 2637, 3520])) * (1 - np.exp(-t * 40)))
def chime(**_):
    t = T(1.8)
    return norm(sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, a, k in [(1046.5, .6, 2.4), (1568, .3, 3.2), (2093, .15, 4.5), (523.25, .25, 1.8)]))
def riser(dur=2.9, **_):
    t = T(dur); u = t / dur; f = 160 + 560 * u ** 2
    tone = 0.5 * np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.25 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR)
    return norm((tone + 0.25 * lp(rng.standard_normal(len(t)), 0.05 + 0.4 * u)) * u ** 2.2)
SYNTH = dict(impact=impact, whoosh=whoosh, swish=swish, pop=pop, bubble=bubble, thock=thock, click=click, soft=soft,
             thump=thump, swoosh=swoosh, paper=paper, stamp=stamp, tick=tick, shimmer=shimmer, chime=chime, riser=riser)

sfx = np.zeros((total, 2))
for c in tl["sfx"]:
    opts = {k: v for k, v in c.items() if k not in ("t", "kind", "gain", "pan", "cut")}
    snd = SYNTH[c["kind"]](**opts) * 10 ** (c["gain"] / 20)
    if "cut" in c:                                   # stop dead at a word (riser into "Malaysia")
        n_cut = int((c["cut"] - c["t"]) * SR); snd = snd[:max(0, n_cut)]
        f2 = min(len(snd), int(0.015 * SR)); snd[-f2:] *= np.linspace(1, 0, f2) if f2 else 1
    if snd.ndim == 1:                                # mono synth -> static pan
        pan = c.get("pan", 0.0)
        snd = np.stack([snd * np.sqrt((1 - pan) / 2) * 1.414, snd * np.sqrt((1 + pan) / 2) * 1.414], axis=1)
    s0 = int(c["t"] * SR); n = min(len(snd), total - s0)
    if n > 0: sfx[s0:s0 + n] += snd[:n]

def write_st(p, x):
    x = np.clip(x, -1, 1); w = wave.open(p, "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((x * 32767).astype(np.int16).reshape(-1).tobytes()); w.close()
write_wav(f"{wd}/voice.wav", voice, ch=2); write_st(f"{wd}/sfx.wav", sfx)

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
