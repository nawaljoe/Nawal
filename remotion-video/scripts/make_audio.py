#!/usr/bin/env python3
"""Synthesise every sound effect and the background score for the ZAKAT video.

All audio is generated procedurally here (numpy/scipy), so it is original work
with no third-party licence attached: free to publish on TikTok and elsewhere.

Usage:  python3 scripts/make_audio.py            (writes into public/audio/)
"""
from __future__ import annotations

import os
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "audio")
SFX = os.path.join(ROOT, "sfx")
rng = np.random.default_rng(7)


# ---------------------------------------------------------------- helpers
def t_axis(dur: float) -> np.ndarray:
    return np.arange(int(dur * SR)) / SR


def env_ad(n: int, attack: float, decay: float) -> np.ndarray:
    a = max(1, int(attack * SR))
    t = np.arange(n) / SR
    e = np.exp(-np.maximum(t - attack, 0) / decay)
    e[:a] = np.linspace(0, 1, a)
    return e


def filt(x, kind, f, order=2):
    sos = butter(order, f, btype=kind, fs=SR, output="sos")
    return sosfilt(sos, x)


def sweep_bandpass(noise, f_start, f_end, q_bw=0.6, blocks=64):
    """Time-varying band-pass: process the signal in overlapping blocks."""
    n = len(noise)
    out = np.zeros(n)
    hop = n // blocks
    win = np.hanning(hop * 2)
    for i in range(blocks):
        s = i * hop
        seg = noise[s : s + hop * 2]
        if len(seg) < 16:
            continue
        p = i / (blocks - 1)
        fc = f_start * (f_end / f_start) ** p
        lo, hi = fc * (1 - q_bw / 2), min(fc * (1 + q_bw / 2), SR / 2 - 100)
        y = filt(np.pad(seg, (0, 0)), "bandpass", [lo, hi])
        out[s : s + len(seg)] += y * win[: len(seg)]
    return out


def reverb(x, seconds=1.6, mix=0.25, damp=3000):
    ir_t = t_axis(seconds)
    ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * (6.9 / seconds))
    ir = filt(ir, "lowpass", damp)
    ir /= np.sqrt(np.sum(ir**2))
    wet = fftconvolve(x, ir)[: len(x) + len(ir_t)]
    dry = np.pad(x, (0, len(wet) - len(x)))
    return dry * (1 - mix) + wet * mix


def norm(x, peak=0.89):
    m = np.max(np.abs(x)) or 1
    return x / m * peak


def write(name, x, folder=SFX, peak=0.89):
    os.makedirs(folder, exist_ok=True)
    x = norm(np.asarray(x, dtype=np.float64), peak)
    fade = min(len(x) // 4, int(0.01 * SR))
    x[-fade:] *= np.linspace(1, 0, fade)
    wavfile.write(os.path.join(folder, name), SR, (x * 32767).astype(np.int16))


def bell(freq, dur, decay=0.6, partials=((1, 1), (2.76, 0.35), (5.4, 0.15), (8.9, 0.06))):
    t = t_axis(dur)
    y = sum(a * np.sin(2 * np.pi * freq * r * t) * np.exp(-t * r / (decay * 3)) for r, a in partials)
    return y * env_ad(len(t), 0.002, decay)


# ---------------------------------------------------------------- SFX
def sfx_pop():
    t = t_axis(0.12)
    f = 300 + 900 * np.exp(-t * 60)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * env_ad(len(t), 0.001, 0.035)
    click = filt(rng.standard_normal(len(t)), "highpass", 3000) * env_ad(len(t), 0.0005, 0.004) * 0.3
    return y + click


def sfx_whoosh(dur=0.55, f0=400, f1=3200):
    n = rng.standard_normal(int(dur * SR))
    y = sweep_bandpass(n, f0, f1, 0.9)
    t = t_axis(dur)
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2.2
    return y[: len(e)] * e


def sfx_swipe():
    return sfx_whoosh(0.28, 1500, 6000)


def sfx_notification():
    a = bell(1318.5, 0.5, 0.25)          # E6
    b = bell(1760.0, 0.9, 0.35)          # A6
    y = np.zeros(int(1.1 * SR))
    y[: len(a)] += a
    o = int(0.11 * SR)
    y[o : o + len(b)] += b
    return reverb(y, 0.8, 0.18)


def sfx_cash():
    dur = 1.2
    y = np.zeros(int(dur * SR))
    # drawer clunk
    t = t_axis(0.08)
    clunk = filt(rng.standard_normal(len(t)), "bandpass", [300, 1800]) * env_ad(len(t), 0.001, 0.02)
    y[: len(clunk)] += clunk * 0.8
    # rattling coins
    for k in range(10):
        s = int((0.03 + k * 0.018 + rng.uniform(0, 0.01)) * SR)
        c = bell(rng.uniform(3500, 5200), 0.12, 0.04, ((1, 1), (1.5, 0.4)))
        y[s : s + len(c)] += c * 0.25 * (1 - k / 12)
    # the "ching"
    ching = bell(2637, 1.0, 0.45, ((1, 1), (2.0, 0.5), (3.01, 0.3), (4.2, 0.12)))
    s = int(0.09 * SR)
    y[s : s + len(ching)] += ching[: len(y) - s] * 0.9
    return reverb(y, 0.6, 0.12)


def sfx_coin():
    a = bell(1975.5, 0.08, 0.05, ((1, 1), (3, 0.3)))   # B6
    b = bell(2637.0, 0.5, 0.18, ((1, 1), (3, 0.25)))   # E7
    y = np.zeros(int(0.6 * SR))
    y[: len(a)] += a
    s = int(0.07 * SR)
    y[s : s + len(b)] += b
    return y


def sfx_tick():
    t = t_axis(0.09)
    y = np.sin(2 * np.pi * 1600 * t) * env_ad(len(t), 0.001, 0.018)
    y += np.sin(2 * np.pi * 2400 * t) * env_ad(len(t), 0.001, 0.01) * 0.5
    return y


def sfx_clock():
    dur = 2.0
    y = np.zeros(int(dur * SR))
    for k in range(4):
        f = 3200 if k % 2 == 0 else 2500
        t = t_axis(0.04)
        c = filt(rng.standard_normal(len(t)), "bandpass", [f * 0.8, f * 1.2]) * env_ad(len(t), 0.0005, 0.006)
        c += np.sin(2 * np.pi * f / 2 * t) * env_ad(len(t), 0.0005, 0.01) * 0.4
        s = int(k * 0.5 * SR)
        y[s : s + len(c)] += c
    return reverb(y, 0.4, 0.15)


def sfx_scratch():
    """Vinyl record scratch: playback speed goes forward-back-forward."""
    dur = 0.65
    t = t_axis(dur)
    speed = np.interp(t, [0, 0.12, 0.25, 0.4, 0.55, 0.65], [1.0, 2.2, -1.8, 2.0, -0.6, 0])
    pos = np.cumsum(speed) / SR
    # "music" on the record: a buzzy chord read at varying speed
    src = sum(np.sign(np.sin(2 * np.pi * f * pos)) * a for f, a in ((220, 0.5), (277, 0.35), (330, 0.3)))
    src = filt(src, "lowpass", 2500)
    hiss = filt(rng.standard_normal(len(t)), "bandpass", [800, 5000]) * np.abs(speed)
    y = (src * 0.6 + hiss * 0.5) * np.clip(np.abs(speed) / 2, 0, 1) ** 0.7
    y *= env_ad(len(t), 0.003, 0.5)
    return y


def sfx_impact():
    t = t_axis(0.8)
    f = 45 + 80 * np.exp(-t * 25)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(len(t), 0.002, 0.22)
    thud = filt(rng.standard_normal(len(t)), "lowpass", 900) * env_ad(len(t), 0.001, 0.04) * 0.5
    return reverb(boom + thud, 0.9, 0.15, 1500)


def sfx_cine_hit():
    dur = 3.2
    t = t_axis(dur)
    f = 32 + 90 * np.exp(-t * 12)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(len(t), 0.003, 0.9)
    noise = filt(rng.standard_normal(len(t)), "lowpass", 2500) * env_ad(len(t), 0.002, 0.12) * 0.6
    # low string-ish tone (fifth) for weight
    tone = (np.sin(2 * np.pi * 110 * t) + 0.6 * np.sin(2 * np.pi * 164.8 * t)) * env_ad(len(t), 0.02, 1.0) * 0.18
    return reverb(boom + noise + tone, 2.6, 0.35, 2000)


def sfx_paper():
    """Calendar page flip."""
    dur = 0.3
    t = t_axis(dur)
    n = filt(rng.standard_normal(len(t)), "bandpass", [1200, 7000])
    flutter = 0.6 + 0.4 * np.sin(2 * np.pi * 38 * t)
    return n * flutter * np.sin(np.pi * t / dur) ** 1.5


def sfx_shimmer(notes=(523.25, 659.25, 783.99, 1046.5, 1318.5), gap=0.07, dur=2.4):
    y = np.zeros(int(dur * SR))
    for i, f in enumerate(notes):
        b = bell(f, dur - i * gap, 0.8)
        s = int(i * gap * SR)
        y[s : s + len(b)] += b * (0.9 - i * 0.08)
    return reverb(y, 2.0, 0.35)


def sfx_rise(dur=1.4):
    n = rng.standard_normal(int(dur * SR))
    y = sweep_bandpass(n, 300, 6000, 0.5)
    t = t_axis(dur)
    return y[: len(t)] * (t / dur) ** 2.5


# ---------------------------------------------------------------- music
BPM = 120
BEAT = 60 / BPM
MUSIC_LEN = 60.0


def midi(n):
    return 440 * 2 ** ((n - 69) / 12)


def ks_pluck(freq, dur, bright=0.5, decay=0.996):
    """Karplus-Strong plucked string."""
    n = int(dur * SR)
    p = max(2, int(SR / freq))
    buf = filt(rng.uniform(-1, 1, p), "lowpass", 1500 + 6000 * bright)
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = decay * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    return out * env_ad(n, 0.002, dur)


def marimba(freq, dur=0.6):
    t = t_axis(dur)
    y = np.sin(2 * np.pi * freq * t) * np.exp(-t * 7)
    y += 0.35 * np.sin(2 * np.pi * freq * 4 * t) * np.exp(-t * 25)
    y += 0.1 * np.sin(2 * np.pi * freq * 9.9 * t) * np.exp(-t * 50)
    return y * env_ad(len(t), 0.002, dur)


def pad(freqs, dur, attack=1.2, release=1.2, cutoff=1800):
    t = t_axis(dur)
    y = np.zeros(len(t))
    for f in freqs:
        for d in (-0.08, 0, 0.08):
            ph = rng.uniform(0, 1)
            y += ((t * f * 2 ** (d / 12) + ph) % 1 * 2 - 1)
    y = filt(y, "lowpass", cutoff)
    e = np.minimum(1, t / attack) * np.minimum(1, (dur - t) / release)
    return y * np.clip(e, 0, 1) / (len(freqs) * 3)


def soft_piano(freq, dur=2.5):
    t = t_axis(dur)
    y = sum(a * np.sin(2 * np.pi * freq * k * t) * np.exp(-t * (1.2 + k * 0.9)) for k, a in ((1, 1), (2, 0.4), (3, 0.18), (4, 0.08)))
    return y * env_ad(len(t), 0.004, dur)


def bass(freq, dur):
    t = t_axis(dur)
    y = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(2 * np.pi * freq * 2 * t)
    return y * env_ad(len(t), 0.005, dur * 0.6)


def kick():
    t = t_axis(0.35)
    f = 48 + 110 * np.exp(-t * 35)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(len(t), 0.001, 0.12)


def shaker():
    t = t_axis(0.06)
    return filt(rng.standard_normal(len(t)), "highpass", 6000) * env_ad(len(t), 0.004, 0.018)


def snap():
    t = t_axis(0.12)
    return filt(rng.standard_normal(len(t)), "bandpass", [1200, 4500]) * env_ad(len(t), 0.0008, 0.025)


def place(track, clip, at, gain=1.0):
    s = int(at * SR)
    if s >= len(track):
        return
    e = min(len(track), s + len(clip))
    track[s:e] += clip[: e - s] * gain


def make_music(sections):
    """sections: dict with 'serious_start' and 'uplift_start' in seconds."""
    total = np.zeros(int((MUSIC_LEN + 3) * SR))
    s2, s3 = sections["serious_start"], sections["uplift_start"]

    # --- A: playful (C major, I-vi-IV-V), 0 .. s2
    prog_a = [(60, [60, 64, 67]), (57, [57, 60, 64]), (53, [53, 57, 60]), (55, [55, 59, 62])]
    mel_a = [72, 76, 79, 76, 74, 72, 74, 76, 69, 72, 76, 72, 71, 74, 79, 74]
    playful = np.zeros_like(total)
    beat = 0
    while beat * BEAT < s2 + 1:
        bar, pos = divmod(beat, 4)
        root, chord = prog_a[bar % 4]
        at = beat * BEAT
        place(playful, bass(midi(root - 24), BEAT * 0.9), at, 0.55 if pos in (0, 2) else 0.0)
        if pos in (1, 3):
            place(playful, snap(), at, 0.22)
        for h in range(2):
            place(playful, shaker(), at + h * BEAT / 2, 0.06 if h else 0.09)
        # marimba melody on 8ths
        for h in range(2):
            n = mel_a[(beat * 2 + h) % len(mel_a)]
            if (beat * 2 + h) % 3 != 2:
                place(playful, marimba(midi(n)), at + h * BEAT / 2, 0.22)
        if pos == 0:
            for c in chord:
                place(playful, ks_pluck(midi(c), 1.6, 0.4), at, 0.12)
        beat += 1
    t = np.arange(len(total)) / SR
    fade_a = np.clip((s2 + 0.6 - t) / 1.2, 0, 1)
    total += playful * fade_a

    # --- B: reflective (A minor, Am-F-C-G pads + sparse piano), s2 .. s3
    prog_b = [[57, 60, 64], [53, 57, 60], [48, 55, 64], [55, 59, 62]]
    bar_len = BEAT * 4
    k = 0
    at = s2 - 0.4
    reflect = np.zeros_like(total)
    while at < s3 + 1:
        chord = prog_b[k % 4]
        place(reflect, pad([midi(c) for c in chord] + [midi(chord[0] - 12)], bar_len + 1.2, 0.8, 1.0, 1400), at, 0.9)
        place(reflect, bass(midi(chord[0] - 24), bar_len), at, 0.35)
        for j, c in enumerate([chord[2] + 12, chord[1] + 12, chord[0] + 12]):
            place(reflect, soft_piano(midi(c)), at + j * BEAT * 1.33, 0.16)
        # low heartbeat pulse
        place(reflect, kick(), at, 0.18)
        place(reflect, kick(), at + BEAT * 2, 0.12)
        at += bar_len
        k += 1
    fade_b = np.clip((t - (s2 - 0.4)) / 1.0, 0, 1) * np.clip((s3 + 0.5 - t) / 1.0, 0, 1)
    total += reflect * fade_b

    # --- C: uplifting (C major, F-G-Am-C... resolving), s3 .. end
    prog_c = [[53, 57, 60], [55, 59, 62], [57, 60, 64], [60, 64, 67]]
    uplift = np.zeros_like(total)
    beat = 0
    while s3 - 0.3 + beat * BEAT < MUSIC_LEN - BEAT * 2:
        bar, pos = divmod(beat, 4)
        chord = prog_c[bar % 4]
        at = s3 - 0.3 + beat * BEAT
        if pos == 0:
            place(uplift, pad([midi(c) for c in chord] + [midi(chord[0] + 12)], BEAT * 4 + 0.8, 0.3, 0.8, 2600), at, 0.7)
        place(uplift, kick(), at, 0.45)
        if pos in (1, 3):
            place(uplift, snap(), at, 0.2)
        place(uplift, bass(midi(chord[0] - 24), BEAT * 0.9), at, 0.5)
        arp = [chord[0] + 12, chord[1] + 12, chord[2] + 12, chord[1] + 24]
        for h in range(2):
            place(uplift, ks_pluck(midi(arp[(pos * 2 + h) % 4]), 0.9, 0.7), at + h * BEAT / 2, 0.16)
        beat += 1
    # final resolving chord
    end_at = s3 - 0.3 + beat * BEAT
    place(uplift, pad([midi(c) for c in (48, 55, 60, 64, 67)], MUSIC_LEN + 2 - end_at, 0.05, 1.6, 2400), end_at, 0.9)
    place(uplift, sfx_shimmer((1046.5, 1318.5, 1568, 2093)), end_at, 0.35)
    fade_c = np.clip((t - (s3 - 0.5)) / 0.6, 0, 1)
    total += uplift * fade_c

    total = reverb(total, 1.8, 0.2, 5000)[: int(MUSIC_LEN * SR)]
    tt = np.arange(len(total)) / SR
    total *= np.clip((MUSIC_LEN - tt) / 0.4, 0, 1)  # land on silence exactly at 60 s
    return total


def main():
    import json, sys

    write("pop.wav", sfx_pop())
    write("whoosh.wav", sfx_whoosh())
    write("swipe.wav", sfx_swipe())
    write("notification.wav", sfx_notification())
    write("cash.wav", sfx_cash())
    write("coin.wav", sfx_coin())
    write("tick.wav", sfx_tick())
    write("clock.wav", sfx_clock())
    write("scratch.wav", sfx_scratch())
    write("impact.wav", sfx_impact())
    write("cine-hit.wav", sfx_cine_hit())
    write("paper.wav", sfx_paper())
    write("shimmer.wav", sfx_shimmer())
    write("rise.wav", sfx_rise())
    print("SFX written")

    timing_path = os.path.join(os.path.dirname(__file__), "..", "src", "timing.json")
    sections = {"serious_start": 25.0, "uplift_start": 51.0}
    if os.path.exists(timing_path):
        with open(timing_path) as f:
            sc = json.load(f)["scenes"]
        sections = {"serious_start": sc[2]["start"], "uplift_start": sc[4]["start"]}
    if "--sfx-only" not in sys.argv:
        write("music.wav", make_music(sections), folder=ROOT, peak=0.7)
        print("music written", sections)


if __name__ == "__main__":
    main()
