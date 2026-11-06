"""Build src/data/timeline.json (everything Remotion needs) and render the HyperFrames overlays it references.

Inputs : src/data/scenes.json (from assemble_scenes.py), pipeline/captions.json
Outputs: src/data/timeline.json, public/hf/*.webm (transparent VP9, rendered by the HyperFrames CLI)

All times inside a scene are scene-local frames; sfx/music cues are global frames.
Usage: python3 pipeline/build_timeline.py
"""
import json, os, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HF = os.path.join(ROOT, "hyperframes")
FPS = 30
SC = json.load(open(os.path.join(ROOT, "src", "data", "scenes.json")))
CAP = json.load(open(os.path.join(ROOT, "pipeline", "captions.json")))["items"]
os.makedirs(os.path.join(ROOT, "public", "hf"), exist_ok=True)

def fr(sec): return int(round(sec * FPS))

def s2f(sid, t):
    """source seconds -> scene-local frame (None if the moment was cut)"""
    for p in SC[sid]["parts"]:
        a, b = p["src"]
        if not p["muted"] and a - 0.034 <= t <= b + 0.034:
            return p["frame"] + fr(t - a)
    return None

def hf(name, comp, variables):
    """Render a HyperFrames composition to a transparent WebM (cached on its variables)."""
    out = os.path.join(ROOT, "public", "hf", f"{name}.webm"); key = json.dumps(variables, ensure_ascii=False, sort_keys=True)
    kp = out + ".key"
    if not (os.path.exists(out) and os.path.exists(kp) and open(kp).read() == key):
        subprocess.run(["npx", "hyperframes", "render", "-c", f"{comp}.html", "--format", "webm", "--quality", "delivery",
                        "-o", out, "--quiet", "--variables", json.dumps(variables, ensure_ascii=False)],
                       cwd=HF, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        open(kp, "w").write(key)
    return f"hf/{name}.webm"

# ------------------------------------------------------------------ scenes (frames)
D = {"s1_open": 150, "s2_title": 117, "s3_puasa": SC["s3_puasa"]["frames"], "s4_sabar": SC["s4_sabar"]["frames"],
     "s5_maaf": SC["s5_maaf"]["frames"], "s6_tutup": SC["s6_tutup"]["frames"], "s7_closing": 162, "s8_outro": 195}
ORDER = list(D.keys())
# transition INTO each scene: kind + frames ("overlay" does not shorten the timeline)
TR = {"s2_title": ("lightleak", 36), "s3_puasa": ("dissolve", 15), "s4_sabar": ("linearBlur", 16),
      "s5_maaf": ("fade", 20), "s6_tutup": ("blurSlide", 16), "s7_closing": ("dissolve", 18), "s8_outro": ("fade", 15)}
start = {}; t = 0
for i, s in enumerate(ORDER):
    if i: t += D[ORDER[i - 1]] - (TR[s][1] if TR[s][0] != "lightleak" else 0)
    start[s] = t
total = start[ORDER[-1]] + D[ORDER[-1]]

scenes = {s: {"start": start[s], "dur": D[s], "transitionIn": TR.get(s), "overlays": [], "broll": [], "captions": [], "segs": []} for s in ORDER}

def ov(sid, src, at, dur): scenes[sid]["overlays"].append({"src": src, "from": at, "dur": dur})

# S1 — opening statement on the aerial dawn photograph; ustaz's own line "...yang tidak terhitung" at 1.0 s
VO = 30
ov("s1_open", hf("opening", "opening", {"t1": 0.0, "t2": 0.55, "t3": round(VO / FPS + 0.62, 2), "dur": 4.9}), 0, 147)
# S2 — programme title over the congregation
ov("s2_title", hf("title", "title", {"dur": 3.85}), 0, 116)

# S3 — PUASA: label with "Ibadah...", keyword on the spoken word "puasa"
k = s2f("s3_puasa", 6.42) - 3; w = s2f("s3_puasa", 7.9) - 3
pop1 = s2f("s3_puasa", 13.38) - 7
kd = min(pop1 - 6 - k, fr(3.2))
ov("s3_puasa", hf("kw_puasa", "keyword", {"num": "01", "label": "AMALAN PERTAMA", "word": "PUASA", "mood": "puasa",
                                         "tWord": round((w - k) / FPS, 2), "dur": round(kd / FPS, 2)}), k, kd)
L = [(13.38, "كُلُّ عَمَلِ ٱبۡنِ ءَادَمَ لَهُۥ"), (17.48, "إِلَّا ٱلصِّيَامَ"), (19.1, "فَإِنَّهُۥ لِى وَأَنَا۠ أَجۡزِى بِهِۦ")]
pe = s2f("s3_puasa", 21.15) + 8
lines = [{"t": round((s2f("s3_puasa", tt) - pop1) / FPS, 2), "text": x} for tt, x in L]
ov("s3_puasa", hf("ayat_qudsi", "ayat", {"label": "HADIS QUDSI", "source": "Riwayat al-Bukhari & Muslim",
                                        "lines": json.dumps(lines, ensure_ascii=False), "dur": round((pe - pop1) / FPS, 2)}), pop1, pe - pop1)

# S4 — SABAR: label at scene start (ordinal word), keyword on "bersabar"
k = s2f("s4_sabar", 62.55); w = s2f("s4_sabar", 64.35) - 3
kd = s2f("s4_sabar", 65.15) + 10 - k
ov("s4_sabar", hf("kw_sabar", "keyword", {"num": "02", "label": "AMALAN KEDUA", "word": "SABAR", "mood": "sabar",
                                         "tWord": round((w - k) / FPS, 2), "dur": round(kd / FPS, 2)}), k, kd)
# S5 — MEMAAFKAN: label on "Yang ketiga", keyword on "memaafkan"
k = s2f("s5_maaf", 114.25) - 3; w = s2f("s5_maaf", 119.31) - 3
kd = s2f("s5_maaf", 120.6) - k
ov("s5_maaf", hf("kw_maaf", "keyword", {"num": "03", "label": "AMALAN KETIGA", "word": "MEMAAFKAN", "mood": "maaf",
                                       "tWord": round((w - k) / FPS, 2), "dur": round(kd / FPS, 2)}), k, kd)
# S7 — the three together + reflection drawn from the closing words
ov("s7_closing", hf("closing", "closing", {"reflect": "Teruskan melakukan kebaikan.", "dur": 5.15}), 0, 156)

# ------------------------------------------------------------------ captions (scene-local)
for sid in ["s3_puasa", "s4_sabar", "s5_maaf", "s6_tutup"]:
    for c in CAP:
        a, b = s2f(sid, c["s"]), s2f(sid, c["e"])
        if a is None or b is None: continue
        scenes[sid]["captions"].append({"from": a, "to": b, "text": c["text"], "kw": c["kw"]})

# ------------------------------------------------------------------ main-footage framing per spoken piece
for sid in ["s3_puasa", "s4_sabar", "s5_maaf", "s6_tutup"]:
    n = 0
    for p in SC[sid]["parts"]:
        a = p["src"][0]; stab = 60.6 <= a < 202.8
        base = [1.0, 1.06][n % 2] if not stab else [1.0, 1.045][n % 2]
        if not p["muted"]: n += 1
        scenes[sid]["segs"].append({"from": p["frame"], "to": p["frame"] + p["frames"], "s0": base, "s1": base + 0.018})
# emphasis push on the key line "kecuali namanya ibadah puasa"
for g in scenes["s3_puasa"]["segs"]:
    if abs(g["from"] - s2f("s3_puasa", 21.35)) <= 1: g["s0"], g["s1"] = 1.0, 1.085

def br(sid, s0, s1, kind, src, **kw):
    a = s2f(sid, s0) if not isinstance(s0, str) else (0 if s0 == "start" else None)
    b = s2f(sid, s1) if not isinstance(s1, str) else D[sid]
    scenes[sid]["broll"].append({"from": a, "to": b, "kind": kind, "src": src, **kw})

br("s3_puasa", 10.95, 12.84, "video", "broll/b01.mp4", at=1.0, rate=0.85)
br("s3_puasa", 37.1, 38.95, "video", "broll/b06.mp4", at=0.6, rate=0.8)
br("s4_sabar", 135.42, 138.6, "photo", "photos/p36.jpg", fx=0.42, move="push")
br("s4_sabar", 140.16, "end", "photo", "photos/p09.jpg", fx=0.6, move="pull")
br("s5_maaf", 118.28, 121.4, "photo", "photos/p05.jpg", fx=0.3, move="push")
br("s5_maaf", 121.4, "end", "video", "broll/b02.mp4", at=0.3, rate=0.8)
br("s6_tutup", "start", 213.55, "video", "broll/b05.mp4", at=0.4, rate=0.85)
br("s6_tutup", 219.25, "end", "video", "broll/b08.mp4", at=0.5, rate=0.8)
for sid in scenes:
    for b in scenes[sid]["broll"]:
        if b["from"] is None: b["from"] = 0
for sid in ["s3_puasa", "s4_sabar", "s5_maaf", "s6_tutup"]:  # back-to-back cutaways: hold the outgoing one under the dissolve
    L2 = sorted(scenes[sid]["broll"], key=lambda x: x["from"])
    for a, b in zip(L2, L2[1:]):
        if b["from"] - a["to"] <= 3: a["to"] = b["from"] + 10; a["holdOut"] = True
    for b in L2:
        if b["from"] == 0: b["holdIn"] = True
        if b["to"] >= D[sid]: b["holdOut"] = True

# ------------------------------------------------------------------ sound (global frames)
G = lambda sid, f: start[sid] + f
sfx = []
def cue(file, peak_at, peak_in_file, vol): sfx.append({"src": f"sfx/{file}", "from": peak_at - fr(peak_in_file) + 1, "vol": vol})
cue("impact-swell.mp3", G("s1_open", 8), 1.986, 0.38)                    # low impact under the first words
cue("whoosh-cinematic.mp3", start["s2_title"] + 6, 2.503, 0.42)            # dawn -> congregation (light leak)
cue("impact-bass-1.mp3", G("s2_title", 18), 0.073, 0.32)                  # "3 AMALAN" lands
cue("whoosh-short.mp3", start["s3_puasa"] + 7, 0.162, 0.3)               # into PUASA
cue("riser.mp3", G("s3_puasa", s2f("s3_puasa", 7.9) - 3), 3.47, 0.12)    # gentle rise into the keyword
cue("whoosh-low.mp3", start["s4_sabar"] + 8, 2.503 / 0.82, 0.38)         # into SABAR
cue("riser.mp3", G("s4_sabar", s2f("s4_sabar", 64.35) - 3), 3.47, 0.14)
cue("whoosh-short.mp3", start["s5_maaf"] + 10, 0.162, 0.26)              # into MEMAAFKAN (soft)
cue("whoosh-cinematic.mp3", start["s6_tutup"] + 8, 2.503, 0.3)
cue("riser.mp3", G("s7_closing", 14), 3.47, 0.3)                          # payoff: riser into impact, once
cue("impact-swell.mp3", G("s7_closing", 14), 1.986, 0.34)
sfx = [s for s in sfx if s["from"] >= 0] + [dict(s, trimBefore=-s["from"], **{"from": 0}) for s in sfx if s["from"] < 0]

# speech activity (global frames) for ducking the music bed
speech = [[VO, VO + SC["openingVoice"]["frames"]]]
for sid in ["s3_puasa", "s4_sabar", "s5_maaf", "s6_tutup"]:
    for p in SC[sid]["parts"]:
        if not p["muted"]: speech.append([G(sid, p["frame"]), G(sid, p["frame"] + p["frames"])])

timeline = {"fps": FPS, "width": 1080, "height": 1920, "total": total, "order": ORDER, "scenes": scenes,
            "openingVoice": {"from": VO, "dur": SC["openingVoice"]["frames"]},
            "sfx": sfx, "speech": speech,
            "music": {"src": "music/bed.wav", "to": start["s8_outro"] + 20, "env": None}}
# music envelope (global frames): opens where nobody speaks, ducks ~20 dB under the ustaz, lifts a little for SABAR
UNDER, OPEN, SAB = 0.3, 0.85, 0.4
env = [(0, 0.55), (VO - 6, 0.55), (VO + 4, UNDER), (VO + SC["openingVoice"]["frames"], UNDER),
       (start["s2_title"], OPEN), (start["s3_puasa"] + 4, OPEN), (start["s3_puasa"] + 16, UNDER),
       (start["s4_sabar"] - 4, UNDER), (start["s4_sabar"] + 14, SAB), (start["s5_maaf"] + 10, SAB),
       (start["s5_maaf"] + 26, UNDER), (start["s7_closing"] - 6, UNDER), (start["s7_closing"] + 10, OPEN),
       (start["s8_outro"], OPEN * 0.8), (start["s8_outro"] + 20, 0.0)]
timeline["music"]["env"] = [[int(a), round(b, 3)] for a, b in env]
json.dump(timeline, open(os.path.join(ROOT, "src", "data", "timeline.json"), "w"), ensure_ascii=False, indent=1)
print("total", total, "frames =", round(total / FPS, 2), "s")
for s in ORDER: print(f"  {s:11s} start {start[s]/FPS:6.2f}s  dur {D[s]/FPS:5.2f}s  in={TR.get(s)}")
