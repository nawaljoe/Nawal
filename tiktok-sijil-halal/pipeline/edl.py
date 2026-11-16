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
    (75.06, 82.00, True),    # K6 "kenderaan. Tak boleh ada pencampuran ... premis lah"
    (85.2667, 92.84, True, False, True),  # K7 (skips the slip "barang yang halal") "barang yang haram ... Jaga-jagalah ya."
]

pieces = []
for r in RANGES:
    s, e, tighten = r[:3]
    sn_s, sn_e = (r[3], r[4]) if len(r) > 3 else (True, True)
    s = snap(s) if sn_s else s  # manual points stay sample-exact
    e = snap(e) if sn_e else e
    if not tighten:
        pieces.append([s, e]); continue
    i0, i1 = int(s * 100), int(e * 100)
    quiet = db[i0:i1] < SIL_DB
    cur = s; j = 0
    while j < len(quiet):
        if quiet[j]:
            k = j
            while k < len(quiet) and quiet[k]: k += 1
            ps, pe = (i0 + j) / 100, (i0 + k) / 100
            if pe - ps > MAXP:
                cut_a = round((ps + KEEPP / 2) * FPS) / FPS
                cut_b = round((pe - KEEPP / 2) * FPS) / FPS
                if cut_a > cur:
                    pieces.append([cur, cut_a]); cur = cut_b
            j = k
        else:
            j += 1
    pieces.append([cur, e])

edl, t = [], 0.0
for s, e in pieces:
    d = round((e - s) * FPS) / FPS
    edl.append({"src_in": round(s, 4), "src_out": round(s + d, 4), "out_in": round(t, 4), "out_out": round(t + d, 4)})
    t += d

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
json.dump({"fps": FPS, "pieces": v2, "pieces_v1": v1, "speech_end": round(t2, 4), "speech_end_v1": round(t, 4),
           "v1_answer_start": v1[2]["out_in"], "delta": round(v2[3]["out_in"] - v1[2]["out_in"], 4),
           "end_card": END_CARD, "duration": round(t2 + END_CARD, 4)}, open(sys.argv[2], "w"), indent=1)
print(f"{len(v2)} pieces, speech {t2:.2f}s, main total {t2 + END_CARD:.2f}s (+ outro)")
