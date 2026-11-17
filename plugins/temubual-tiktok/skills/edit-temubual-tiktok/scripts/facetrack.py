"""Detect the speaker's face at 10 fps on the rotated source and write a smoothed track.

Usage: python3 facetrack.py <source.mp4> <out.json>
Output: {"t": [...], "cx": [...], "cy": [...], "fw": [...]} in 1080x1920 pixel space.
"""
import json, subprocess, sys
import numpy as np, cv2

W, H, DW, DH, FPS = 1080, 1920, 270, 480, 10
p = subprocess.Popen(["ffmpeg", "-nostdin", "-v", "error", "-i", sys.argv[1], "-vf", f"fps={FPS},scale={DW}:{DH}",
                      "-f", "rawvideo", "-pix_fmt", "gray", "-"], stdout=subprocess.PIPE)
cas = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
ts, xs, ys, ws = [], [], [], []
i = 0
while True:
    buf = p.stdout.read(DW * DH)
    if len(buf) < DW * DH: break
    g = np.frombuffer(buf, np.uint8).reshape(DH, DW)
    f = cas.detectMultiScale(g, scaleFactor=1.1, minNeighbors=6, minSize=(50, 50))
    if len(f):
        x, y, w, h = max(f, key=lambda r: r[2] * r[3])
        ts.append(i / FPS); xs.append((x + w / 2) * W / DW); ys.append((y + h / 2) * H / DH); ws.append(w * W / DW)
    i += 1
n = i
t_all = np.arange(n) / FPS
def fill(v): return np.interp(t_all, ts, v)
cx, cy, fw = fill(xs), fill(ys), fill(ws)
def smooth(v, k=9):                       # median (outlier reject) then moving average
    v = np.array([np.median(v[max(0, j - k // 2):j + k // 2 + 1]) for j in range(len(v))])
    return np.convolve(np.pad(v, k, mode="edge"), np.ones(k) / k, mode="same")[k:-k]
json.dump({"t": t_all.round(2).tolist(), "cx": smooth(cx).round(1).tolist(), "cy": smooth(cy).round(1).tolist(),
           "fw": smooth(fw).round(1).tolist()}, open(sys.argv[2], "w"))
print(f"{len(ts)}/{n} frames with a face; cx {np.min(cx):.0f}-{np.max(cx):.0f}, cy {np.min(cy):.0f}-{np.max(cy):.0f}, face w {np.median(fw):.0f}px")
