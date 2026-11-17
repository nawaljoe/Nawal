"""Kesan bunyi isian/meleret (err, aaa, jeda) guna masa perkataan + kestabilan spektrum.
Guna: gagap.py audio.wav perkataan.txt a-b [a-b ...]  -> cetak JSON senarai potongan [a, b]."""
import json, re, sys, wave
import numpy as np

w = wave.open(sys.argv[1]); sr = w.getframerate()
x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
HOP = int(sr * 0.02)
fr = x[:len(x) // HOP * HOP].reshape(-1, HOP)
db = 20 * np.log10(np.sqrt((fr ** 2).mean(1)) + 1e-9)
win = 1024
pad = np.pad(x, (0, win))
spec = np.abs(np.fft.rfft(np.stack([pad[i * HOP:i * HOP + win] * np.hanning(win) for i in range(len(fr))]), axis=1))
spec = spec / (spec.sum(1, keepdims=True) + 1e-9)
flux = np.r_[0, np.abs(np.diff(spec, axis=0)).sum(1)]
speech = np.median(db[db > np.percentile(db, 40)])
FLUX_STEADY = np.percentile(flux[db > speech - 10], 30)

words = []
for l in open(sys.argv[2]):
    a, b, t = l.split(None, 2)
    words.append((float(a), float(b), t.strip()))
ranges = [tuple(map(float, r.split('-'))) for r in sys.argv[3:]]

def steady_run(a, b):
    i0, i1 = int(a / 0.02), int(b / 0.02)
    ok = [(db[i] < speech - 16) or (flux[i] < FLUX_STEADY) for i in range(i0, i1)]
    best, cur, start = (0, 0), 0, i0
    for k, v in enumerate(ok + [False]):
        if v:
            if cur == 0: start = i0 + k
            cur += 1
            if cur > best[1] - best[0]: best = (start, start + cur)
        else:
            cur = 0
    return best[0] * 0.02, best[1] * 0.02

cuts = []
for i in range(len(words) - 1):
    s, e, t = words[i]
    ns = words[i + 1][0]
    if not any(r0 <= s and ns <= r1 for r0, r1 in ranges):
        continue
    vowels = len(re.findall(r'[aeiou]', t.lower()))
    real = 0.14 * max(1, vowels) + 0.12
    a = s + real if e - s > real + 0.25 else e + 0.04
    b = ns - 0.06
    if b - a < 0.25:
        continue
    ra, rb = steady_run(a, b)
    if rb - ra >= 0.22:
        cuts.append([round(ra + 0.03, 2), round(rb - 0.03, 2), t, words[i + 1][2]])
print(json.dumps(cuts))
