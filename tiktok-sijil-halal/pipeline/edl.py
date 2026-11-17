"""Build the edit decision list (EDL) for the halal-certificate TikTok cut.

Usage: python3 edl.py <audio16k.wav> <out.json>
Kept source ranges are snapped to energy minima, internal pauses > MAXP are
shortened to KEEPP, and everything is quantised to 30 fps frames.
"""
import json, sys, wave
import numpy as np

FPS = 30
MAXP, KEEPP, SIL_DB = 0.40, 0.24, -42.0

wf = wave.open(sys.argv[1]); sr = wf.getframerate()
a = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768
hop = sr // 100  # 10 ms
rms = np.array([np.sqrt(np.mean(a[i:i + hop] ** 2) + 1e-12) for i in range(0, len(a) - hop, hop)])
db = 20 * np.log10(rms)

def snap(t, win=0.10):
    i0, i1 = int((t - win) * 100), int((t + win) * 100)
    i = i0 + int(np.argmin(db[i0:i1]))
    return round(i / 100 * FPS) / FPS

# (src_in, src_out, tighten_pauses[, snap_in, snap_out]); manual points are set from the energy plot
RANGES = [
    (55.50, 59.60, False),   # K1 hook: "Syarikat dah tutup ... berpindah, tak bagitahu."
    (1.39, 6.66, False),     # K2 interviewer question
    (7.38, 9.20, False, True, False),  # K3 "sijil halal boleh ditarik" (ends before "ni")
    (13.95, 59.60, True, False, True),  # K4 "disebabkan ..." through the technical callback
    (66.74, 74.02, True),    # K5 "Sama juga kena tengok ... dan juga"
    (75.24, 82.00, True, False, True),  # K6 (starts after the "-gi" of "lagi") "kenderaan. Tak boleh ada pencampuran ... premis lah"
    (85.2667, 92.84, True, False, True),  # K7 (skips the slip "barang yang halal") "barang yang haram ... Jaga-jagalah ya."
]

# v3 (creator feedback): fillers and false starts inside kept ranges, verified by an isolated
# Whisper pass plus pitch steadiness (a filler holds one pitch for 0.4-0.9 s). Cut points sit in
# the surrounding low-energy dips so a natural ~0.15-0.3 s pause remains.
FILLERS = [
    (29.12, 30.12),   # "err"            -> "Mungkin, barangan"
    (34.84, 35.70),   # "err"            -> "najis, bercampur"
    (50.19, 50.95),   # "emm"            -> "ataupun, kalau kita"
    (77.30, 78.06),   # "ehm, baha-"     -> "pencampuran, bawa masuk"
    # v4: found by an acoustic scan (steady-pitch voiced islands) + isolated Whisper check
    (68.92, 69.52),   # "err"            -> "pada pergudangan"
    (70.66, 72.62),   # "err ... err"    -> "ataupun asrama"
    (80.66, 81.16),   # "ah"             -> "ke dalam kawasan premis"
]

def build(fillers):
    out = []
    for ri, r in enumerate(RANGES):
        s, e, tighten = r[:3]
        sn_s, sn_e = (r[3], r[4]) if len(r) > 3 else (True, True)
        s = snap(s) if sn_s else s  # manual points stay sample-exact
        e = snap(e) if sn_e else e
        subs, cur = [], s                                   # split the range around fillers
        for fa, fb in fillers:
            if s < fa < e: subs.append((cur, fa, len(subs) > 0)); cur = fb
        subs.append((cur, e, len(subs) > 0))
        for ss, ee, after_filler in subs:
            first = True
            def add(a_, b_):
                nonlocal first
                out.append({"r": ri, "s": a_, "e": b_, "filler_join": after_filler and first}); first = False
            if not tighten:
                add(ss, ee); continue
            i0, i1 = int(ss * 100), int(ee * 100)
            quiet = db[i0:i1] < SIL_DB
            cur2 = ss; j = 0
            while j < len(quiet):
                if quiet[j]:
                    k = j
                    while k < len(quiet) and quiet[k]: k += 1
                    ps, pe = (i0 + j) / 100, (i0 + k) / 100
                    if pe - ps > MAXP:
                        cut_a = round((ps + KEEPP / 2) * FPS) / FPS
                        cut_b = round((pe - KEEPP / 2) * FPS) / FPS
                        if cut_a > cur2:
                            add(cur2, cut_a); cur2 = cut_b
                    j = k
                else:
                    j += 1
            add(cur2, ee)
    res, t = [], 0.0
    for p in out:
        d = round((p["e"] - p["s"]) * FPS) / FPS
        res.append({"r": p["r"], "src_in": round(p["s"], 4), "src_out": round(p["s"] + d, 4),
                    "out_in": round(t, 4), "out_out": round(t + d, 4), "filler_join": p["filler_join"]})
        t += d
    return res, t

auth, t_auth = build([])        # the cut that captions/graphics/SFX were authored against
edl, t = build(FILLERS)         # the cut actually rendered

# v2 (creator feedback): the interviewer's voice is removed. After the hook comes a single
# short beep over colour bars, then a silent pop-up question card over the Ustaz listening.
BEEP, QUESTION, END_CARD = 0.4, 2.8, 2.5
v1 = edl
v2 = [dict(v1[0], kind="speech"),
      {"kind": "beep", "dur": BEEP},
      {"kind": "question", "src_in": v1[1]["src_in"], "dur": QUESTION}] + [dict(p, kind="speech") for p in v1[2:]]
t2 = 0.0
for p in v2:
    d = p.get("dur", round((p.get("src_out", 0) - p.get("src_in", 0)) * FPS) / FPS)
    p["out_in"], p["out_out"] = round(t2, 4), round(t2 + d, 4); t2 += d
json.dump({"fps": FPS, "pieces": v2, "pieces_v1": v1, "pieces_auth": auth, "fillers": FILLERS,
           "speech_end": round(t2, 4), "speech_end_v1": round(t, 4), "speech_end_auth": round(t_auth, 4),
           "v1_answer_start": v1[2]["out_in"], "delta": round(v2[3]["out_in"] - v1[2]["out_in"], 4),
           "end_card": END_CARD, "duration": round(t2 + END_CARD, 4)}, open(sys.argv[2], "w"), indent=1)
print(f"{len(v2)} pieces, speech {t2:.2f}s (fillers removed {t_auth - t:.2f}s), main total {t2 + END_CARD:.2f}s (+ outro)")
