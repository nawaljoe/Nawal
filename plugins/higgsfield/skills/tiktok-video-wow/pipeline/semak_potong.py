"""Sahkan potongan: bina audio tersunting, transkrip, bandingkan dengan perkataan asal.
Guna: semak_potong.py audio.wav perkataan.txt calon.json a-b [a-b ...]"""
import difflib, json, re, sys, wave
import numpy as np
from faster_whisper import WhisperModel

w = wave.open(sys.argv[1]); sr = w.getframerate()
x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
words = []
for l in open(sys.argv[2]):
    a, b, t = l.split(None, 2)
    words.append((float(a), float(b), t.strip()))
cuts = json.load(open(sys.argv[3]))
ranges = [tuple(map(float, r.split('-'))) for r in sys.argv[4:]]
norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())

pieces, expected = [], []
for r0, r1 in ranges:
    keep, t = [], r0
    for a, b, _ in sorted(c for c in cuts if r0 <= c[0] < r1):
        keep.append((t, a)); t = b
    keep.append((t, r1))
    for a, b in keep:
        seg = x[int(a * sr):int(b * sr)].copy()
        n = int(0.015 * sr); seg[:n] *= np.linspace(0, 1, n); seg[-n:] *= np.linspace(1, 0, n)
        pieces.append(seg)
        expected += [(ws, norm(wt)) for ws, we, wt in words if a <= (ws + we) / 2 < b and norm(wt)]
    pieces.append(np.zeros(int(sr * 0.8), np.float32))
audio = np.concatenate(pieces)
m = WhisperModel("medium", device="cpu", compute_type="int8")
segs, _ = m.transcribe(audio, language="ms", word_timestamps=True)
got = [norm(wd.word) for s in segs for wd in s.words if norm(wd.word)]
exp = [e[1] for e in expected]
sm = difflib.SequenceMatcher(a=exp, b=got, autojunk=False)
print(f"dijangka {len(exp)} perkataan, dapat {len(got)}, padanan {sum(b.size for b in sm.get_matching_blocks())}")
for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op in ('delete', 'replace') and i2 > i1:
        t0 = expected[i1][0]
        near = min(cuts, key=lambda c: min(abs(c[0] - t0), abs(c[1] - t0)))
        print(f"{op:7s} @{t0:7.2f} asal={' '.join(exp[i1:i2])!r} baru={' '.join(got[j1:j2])!r}  potongan terdekat {near[0]}-{near[1]} ({near[2]})")
