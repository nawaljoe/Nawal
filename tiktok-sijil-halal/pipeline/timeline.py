"""Single source of truth for shots, zoom, captions and graphics (output-time seconds).

Usage: python3 timeline.py <edl.json> <out_words.json> <timeline.json>
Caption text is the verified transcript, lightly tidied for reading; word times come
from Whisper run on the assembled edit (out_words.json).
"""
import json, re, sys
edl = json.load(open(sys.argv[1])); W = json.load(open(sys.argv[2]))
P = edl["pieces"]; END = edl["speech_end"]; DUR = edl["duration"]

# shots: (id, start, end, beat, zoom keys [(t, z, ease_frames)])
SHOTS = [
    ("01", 0.0,   P[1]["out_in"], "HOOK",      [(0.0, 1.30, 0)]),
    ("02", P[1]["out_in"], P[2]["out_in"], "SETUP", [(P[1]["out_in"], 1.00, 0), (P[2]["out_in"], 1.05, "lin")]),
    ("03", P[2]["out_in"], 14.36, "ANSWER",    [(P[2]["out_in"], 1.00, 0), (P[3]["out_in"], 1.15, 0)]),
    ("04", 14.36, 18.24, "STRUCTURE",          [(14.36, 1.15, 0)]),
    ("05", 18.24, 24.14, "SYARIAH",            [(18.24, 1.00, 0)]),
    ("06", 24.14, 36.24, "SYARIAH",            [(24.14, 1.00, 0), (30.10, 1.20, 6), (33.50, 1.00, 6)]),
    ("07", 36.24, 43.66, "SYARIAH",            [(36.24, 1.00, 0), (42.12, 1.25, 5)]),
    ("08", 43.66, 49.04, "TEKNIKAL",           [(43.66, 1.00, 0)]),
    ("09", 49.04, 54.10, "PAYOFF",             [(49.04, 1.30, 0)]),
    ("10", 54.10, 61.94, "TEKNIKAL",           [(54.10, 1.10, 0), (61.94, 1.13, "lin")]),
    ("11", 61.94, 68.08, "TEKNIKAL",           [(61.94, 1.00, 0)]),
    ("12", 68.08, 74.24, "CLIMAX",             [(68.08, 1.00, 0), (74.24, 1.15, "lin")]),
    ("13", 74.24, END,   "LANDING",            [(74.24, 1.30, 0)]),
    ("14", END,   DUR,   "ENDING",             [(END, 1.00, 0)]),
]

# captions: (start, end, text, style) ; *word* = gold emphasis
CUES = [
    (0.00, 1.62, "Syarikat dah tutup, *tak* *bagitahu.*", ""),
    (1.70, 3.80, "Syarikat dah berpindah, *tak* *bagitahu.*", ""),
    (3.98, 6.54, "Kita nak tahulah, kesalahan apa yang boleh", "q"),
    (6.56, 9.10, "buat sijil halal kita ni *ditarik* on the spot?", "q"),
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
    (74.30, END, "Jaga-jagalah ya.", ""),
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
    caps.append({"s": s, "e": e, "style": style,
                 "words": [{"t": tk.strip("*"), "at": at, "em": tk.startswith("*")} for tk, at in zip(toks, times)]})

GFX = {  # consumed by HyperFrames (typography) and Remotion (infographics)
    "hook": {"s": 0.12, "e": 3.95, "lines": ["Ini pun boleh buat", "sijil halal ditarik."]},
    "soalan": {"s": P[1]["out_in"], "e": P[2]["out_in"]},
    "lowerThird": {"s": 9.45, "e": 14.30, "name": "Mohamad Yusof bin Mahmod", "role": "Auditor Syariah",
                   "unit": "Unit Penguatkuasaan dan Pemantauan · Bahagian Pengurusan Halal, JAINJ"},
    "chapters": [{"s": 18.24, "e": 43.66, "n": "1", "label": "SYARIAH"},
                 {"s": 43.66, "e": 68.08, "n": "2", "label": "TEKNIKAL", "wipe": 43.50}],
    "chips": [{"s": 30.10, "t": "Tercemar najis"}, {"s": 31.60, "t": "Bercampur"},
              {"s": 33.50, "t": "Tiada pengasingan / penyucian"}], "chipsEnd": 36.20,
    "emphasis": {"s": 72.60, "e": END, "t": "SIJIL HALAL DITARIK"},
    "duaKategori": {"s": 14.42, "e": 18.20, "a": 16.70, "b": 17.60},
    "notis": {"s": 49.08, "e": 54.06, "c1": 49.68, "st1": 50.98, "c2": 51.70, "st2": 53.10},
    "premis": {"s": 54.18, "e": 68.06, "items": [{"at": 55.54, "t": "Gudang"}, {"at": 58.02, "t": "Asrama"},
                                                   {"at": 61.18, "t": "Kenderaan"}, {"at": 66.44, "t": "Premis"}]},
    "endCard": {"s": END, "e": DUR, "q": "Pada pendapat anda, kesalahan mana paling kerap berlaku?",
                "share": "Kongsi dengan rakan yang ada bisnes makanan."},
}
json.dump({"fps": edl["fps"], "duration": DUR, "speechEnd": END, "width": 1080, "height": 1920,
           "shots": [{"id": a, "s": round(b, 4), "e": round(c, 4), "beat": d, "zoom": z} for a, b, c, d, z in SHOTS],
           "captions": caps, "gfx": GFX}, open(sys.argv[3], "w"), ensure_ascii=False, indent=1)
print(f"{len(SHOTS)} shots, {len(caps)} caption cues, duration {DUR}s")
