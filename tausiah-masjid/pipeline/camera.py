"""Per-shot virtual-camera framing. Each shot has a start/end zoom; the speaker's tracked face
(median over the shot's source range) is placed at the target point, clamped so no plate edge shows."""
import json, os, numpy as np
D = os.path.dirname(__file__)
E = json.load(open(f"{D}/edl.json")); F = np.array(json.load(open(f"{D}/faces.json")))
fps = E["fps"]; segs = E["segments"]
W, H = 1080, 1920
# map source seconds -> output seconds
starts = np.cumsum([0] + [(s["out"] - s["in"]) / fps for s in segs])
def out_t(src):
    for k, s in enumerate(segs):
        a, b = s["in"] / fps, s["out"] / fps
        if a - 1e-6 <= src <= b + 1e-6: return starts[k] + src - a
    raise ValueError(src)
def src_t(out):
    for k, s in enumerate(segs):
        if starts[k] - 1e-6 <= out <= starts[k + 1] + 1e-6: return s["in"] / fps + out - starts[k]
    return segs[-1]["out"] / fps
# shots: output start, zoom in, zoom out, face target y (fraction of frame)
SHOTS = [
    (0.000,  1.40, 1.46, 0.40),  # hook, medium close, slow push
    (5.900,  1.00, 1.06, 0.43),  # wide, context
    (13.600, 1.30, 1.36, 0.40),  # 'Kaki kah ... ataupun hati' medium
    (20.867, 1.10, 1.02, 0.42),  # gentle pull back: Justeru pada pagi ini
    (26.767, 1.22, 1.40, 0.40),  # key statement, slow push-in
    (34.267, 1.30, 1.22, 0.41),  # At-Taubah ayat 18, ease back
    (39.600, 1.00, 1.10, 0.46),  # recitation: wide, very slow push, verse card above
    (57.050, 1.32, 1.36, 0.40),  # 'Itu maksudnya'
    (59.100, 1.40, 1.45, 0.40),  # 'Sesungguhnya orang yang memakmurkan masjid'
    (62.233, 1.12, 1.30, 0.41),  # conclusion, slow push
]
END = float(starts[-1] + E["tail_hold_s"])
PH = 2880 / 2905  # plate crop: source y -> plate y
def face(o0, o1):
    s0, s1 = src_t(o0 + 0.01), src_t(min(o1, starts[-1]) - 0.01)
    m = (F[:, 0] >= s0) & (F[:, 0] <= s1)
    if m.sum() < 2: m = (F[:, 0] >= s0 - 3) & (F[:, 0] <= s1 + 3)
    fx, fy = np.median(F[m, 1]), np.median(F[m, 2])
    return float(fx), float((fy * 2905 - 12) / 2880)
def place(s, fx, fy, ty, tx=0.5):
    x = tx * W - s * fx * W; y = ty * H - s * fy * H
    x = min(0, max(W - s * W, x)); y = min(0, max(H - s * H, y))
    return round(x, 1), round(y, 1)
out = []
for i, (t0, z0, z1, ty) in enumerate(SHOTS):
    t1 = SHOTS[i + 1][0] if i + 1 < len(SHOTS) else END
    fx, fy = face(t0, t1)
    x0, y0 = place(z0, fx, fy, ty); x1, y1 = place(z1, fx, fy, ty)
    out.append(dict(t0=round(t0, 3), t1=round(t1, 3), z0=z0, z1=z1, x0=x0, y0=y0, x1=x1, y1=y1, face=[round(fx, 3), round(fy, 3)]))
json.dump(out, open(f"{D}/camera.json", "w"), indent=1)
for o in out: print(o)
print("END", END)
