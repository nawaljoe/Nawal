"""Single source of truth for shots, zoom, captions and graphics (output-time seconds).

Usage: python3 timeline.py <edl.json> <out_words.json> <timeline.json>
Caption text is the verified transcript, lightly tidied for reading; word times come
from Whisper run on the assembled edit (out_words.json).
"""
import json, re, sys
edl = json.load(open(sys.argv[1])); W = json.load(open(sys.argv[2]))
P = edl["pieces"]; END = edl["speech_end"]; DUR = edl["duration"]
# Caption/graphic times below are authored on the v1 cut (with the interviewer's audio).
# v2 swaps that 5.1 s question for beep + silent question card, so later times shift by DELTA.
V1P = edl.get("pieces_v1", P); V1_ANS = edl.get("v1_answer_start", P[2]["out_in"]); DELTA = edl.get("delta", 0.0)
END_V1 = edl.get("speech_end_v1", END)
sh = lambda t: round(t + DELTA, 4) if t >= V1_ANS - 1e-6 else t
BEEP = next(p for p in P if p.get("kind") == "beep"); Q = next(p for p in P if p.get("kind") == "question")

# shots: (id, start, end, beat, zoom keys [(t, z, ease_frames)]) -- v1 times; punch-ins capped at 1.08x
SHOTS = [
    ("01", 0.0, BEEP["out_in"], "HOOK", [(0.0, 1.08, 0)]),
    ("02", BEEP["out_in"], Q["out_in"], "BEEP", [(BEEP["out_in"], 1.00, 0)]),
    ("03", Q["out_in"], Q["out_out"], "QUESTION", [(Q["out_in"], 1.00, 0)]),
]
SHOTS_V1 = [
    ("04", V1_ANS, 14.36, "ANSWER",    [(V1_ANS, 1.00, 0), (V1P[3]["out_in"], 1.06, 0)]),
    ("05", 14.36, 18.24, "STRUCTURE",  [(14.36, 1.06, 0)]),
    ("06", 18.24, 24.14, "SYARIAH",    [(18.24, 1.00, 0)]),
    ("07", 24.14, 36.24, "SYARIAH",    [(24.14, 1.00, 0), (30.10, 1.08, 8), (33.50, 1.00, 8)]),
    ("08", 36.24, 43.66, "SYARIAH",    [(36.24, 1.00, 0), (42.12, 1.08, 6)]),
    ("09", 43.66, 49.04, "TEKNIKAL",   [(43.66, 1.00, 0)]),
    ("10", 49.04, 54.10, "PAYOFF",     [(49.04, 1.06, 0)]),
    ("11", 54.10, 61.94, "TEKNIKAL",   [(54.10, 1.03, 0), (61.94, 1.05, "lin")]),
    ("12", 61.94, 68.08, "TEKNIKAL",   [(61.94, 1.00, 0)]),
    ("13", 68.08, 74.24, "CLIMAX",     [(68.08, 1.00, 0), (74.24, 1.06, "lin")]),
    ("14", 74.24, END_V1, "LANDING",   [(74.24, 1.08, 0)]),
]
SHOTS += [(i, sh(a), sh(b), beat, [(sh(kt), kz, e) for kt, kz, e in z]) for i, a, b, beat, z in SHOTS_V1]
SHOTS.append(("15", END, DUR, "ENDING", [(END, 1.00, 0)]))

# captions: (start, end, text, style) ; *word* = gold emphasis
CUES = [
    (0.00, 1.62, "Syarikat dah tutup, *tak* *bagitahu.*", ""),
    (1.70, 3.80, "Syarikat dah berpindah, *tak* *bagitahu.*", ""),
    (9.16, 10.90, "Sijil halal boleh *ditarik…*", ""),
    (10.94, 14.30, "disebabkan kesalahan ataupun *ketidakakuran* *serius.*", ""),
    (14.42, 16.16, "Ketidakakuran serius ni terbagi pada dua.", ""),
    (16.22, 18.20, "Ada *syariah,* ada *teknikal.*", ""),
    (18.30, 20.40, "Perkara berkaitan syariah ni biasanya memang", ""),
    (20.42, 21.80, "melibatkan perkara-perkara", ""),
    (21.82, 24.10, "yang kita katakan *tidak* *halal* ataupun *haram.*", ""),
    (24.18, 28.30, "Mungkin barangan, makanan, perkhidmatan itu", ""),
    (28.36, 30.70, "tercemar dengan *najis,*", ""),
    (31.40, 32.32, "*bercampur,*", ""),
    (32.38, 34.70, "dah tak boleh nak buat pengasingan yang jelas", ""),
    (34.74, 36.24, "ataupun penyucian dekat situ.", ""),
    (36.32, 39.84, "Kemudian adanya unsur makanan yang tidak halal", ""),
    (39.88, 42.06, "atau bahan mentah yang memang dekat haram,", ""),
    (42.12, 43.66, "*daging* *babi* ke, *arak* ke.", ""),
    (43.72, 47.26, "Ataupun kalau kita beralih kepada *teknikal,*", ""),
    (47.30, 49.00, "melibatkan undang-undang itu sendiri.", ""),
    (49.08, 51.62, "Mungkin syarikat dah tutup, *tak* *bagitahu.*", ""),
    (51.70, 53.95, "Syarikat dah berpindah, *tak* *bagitahu.*", ""),
    (54.18, 57.30, "Sama juga kena tengok pada *pergudangan*", ""),
    (57.34, 61.12, "ataupun *asrama* dan juga…", ""),
    (61.18, 61.94, "*kenderaan.*", ""),
    (61.98, 63.26, "Tak boleh ada pencampuran,", ""),
    (63.30, 66.10, "bawa masuk barang yang *tidak* *halal*", ""),
    (66.12, 68.06, "ke dalam kawasan *premis.*", ""),
    (68.14, 70.36, "Barang yang haram, barang yang tidak halal itu", ""),
    (70.40, 72.56, "boleh menjejaskan sampai tahap", ""),
    (72.60, 74.22, "kena *tarik* *sijil* *halal* di Malaysia.", ""),
    (74.30, END_V1, "Jaga-jagalah ya.", ""),
]
norm = lambda s: re.sub(r"[^a-z]", "", s.lower())
def word_times(s, e, toks):
    cand = [w for w in W if s - 0.35 <= w["s"] <= e + 0.05]
    out, j = [], 0
    for k, tk in enumerate(toks):
        hit = None
        for m in range(j, min(j + 4, len(cand))):
            a, b = norm(tk), norm(cand[m]["w"])
            if a and b and (a[:4] == b[:4] or a in b or b in a): hit = m; break
        if hit is not None: out.append(max(s, cand[hit]["s"])); j = hit + 1
        else: out.append(None)
    # fill gaps proportionally by character count
    n = len(toks)
    for k in range(n):
        if out[k] is None:
            prev = max([i for i in range(k) if out[i] is not None], default=None)
            nxt = min([i for i in range(k + 1, n) if out[i] is not None], default=None)
            t0 = out[prev] if prev is not None else s; t1 = out[nxt] if nxt is not None else e - 0.15
            i0 = prev if prev is not None else -1; i1 = nxt if nxt is not None else n
            out[k] = t0 + (t1 - t0) * (k - i0) / (i1 - i0)
    return [round(min(max(t, s), e), 3) for t in out]

caps = []
for s, e, text, style in CUES:
    toks = text.split()
    times = word_times(s, e, [t.strip("*") for t in toks])
    caps.append({"s": sh(s), "e": sh(e), "style": style,
                 "words": [{"t": tk.strip("*"), "at": sh(at), "em": tk.startswith("*")} for tk, at in zip(toks, times)]})

GFX = {  # consumed by HyperFrames (typography) and Remotion (infographics)
    "hook": {"s": 0.12, "e": BEEP["out_in"] - 0.06, "lines": ["Ini pun boleh buat", "sijil halal ditarik."]},
    "beep": {"s": BEEP["out_in"], "e": BEEP["out_out"]},
    "question": {"s": Q["out_in"] + 0.03, "e": Q["out_out"], "label": "SOALAN",
                 "t": "Kesalahan apa yang boleh buat sijil halal ditarik?"},
    "lowerThird": {"s": sh(9.45), "e": sh(14.30), "name": "Mohamad Yusof bin Mahmod", "role": "Auditor Syariah",
                   "unit": "Unit Penguatkuasaan dan Pemantauan · Bahagian Pengurusan Halal, JAINJ"},
    "chapters": [{"s": sh(18.24), "e": sh(43.66), "n": "1", "label": "SYARIAH"},
                 {"s": sh(43.66), "e": sh(68.08), "n": "2", "label": "TEKNIKAL", "wipe": sh(43.50)}],
    "chips": [{"s": sh(30.10), "t": "Tercemar najis"}, {"s": sh(31.60), "t": "Bercampur"},
              {"s": sh(33.50), "t": "Tiada pengasingan / penyucian"}], "chipsEnd": sh(36.20),
    "emphasis": {"s": sh(72.60), "e": END, "t": "SIJIL HALAL DITARIK"},
    "duaKategori": {"s": sh(14.42), "e": sh(18.20), "a": sh(16.70), "b": sh(17.60)},
    "notis": {"s": sh(49.08), "e": sh(54.06), "c1": sh(49.68), "st1": sh(50.98), "c2": sh(51.70), "st2": sh(53.10)},
    "premis": {"s": sh(54.18), "e": sh(68.06), "items": [{"at": sh(55.54), "t": "Gudang"}, {"at": sh(58.02), "t": "Asrama"},
                                                         {"at": sh(61.18), "t": "Kenderaan"}, {"at": sh(66.44), "t": "Premis"}]},
    "endCard": {"s": END, "e": DUR, "q": "Pada pendapat anda, kesalahan mana paling kerap berlaku?",
                "share": "Kongsi dengan rakan yang ada bisnes makanan."},
}
json.dump({"fps": edl["fps"], "duration": DUR, "speechEnd": END, "width": 1080, "height": 1920,
           "shots": [{"id": a, "s": round(b, 4), "e": round(c, 4), "beat": d, "zoom": z} for a, b, c, d, z in SHOTS],
           "captions": caps, "gfx": GFX}, open(sys.argv[3], "w"), ensure_ascii=False, indent=1)
print(f"{len(SHOTS)} shots, {len(caps)} caption cues, duration {DUR}s")
