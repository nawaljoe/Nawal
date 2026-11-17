"""Gambar pegun -> klip B-roll 9:16 bergerak (zoom masuk + pan perlahan, butiran filem halus).
Guna: kenburns.py <gambar.png> <output.mp4> [saat=5] [arah_pan=-1|0|1]"""
import subprocess
import sys

import cv2
import numpy as np

W, H, FPS = 1080, 1920, 30
src, out = sys.argv[1], sys.argv[2]
dur = float(sys.argv[3]) if len(sys.argv) > 3 else 5.0
pan = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0
geser = float(sys.argv[5]) if len(sys.argv) > 5 else 0.0   # -1..1: alih bingkai 9:16 ke kiri/kanan
atas = int(sys.argv[6]) if len(sys.argv) > 6 else 0         # >0: turunkan gambar (wajah di bawah logo), atas diisi latar kabur
lebar = float(sys.argv[7]) if len(sys.argv) > 7 else 0.93   # lebar gambar depan berbanding skrin (mod 'atas')

img = cv2.imread(src)
h, w = img.shape[:2]
cw = int(h * 9 / 16)                                   # potong ke 9:16 dari tengah
x0 = int(max(0, (w - cw) // 2 + geser * (w - cw) / 2))
img = img[:, x0:x0 + cw]
hd = img.shape[0] >= H * 1.15
big = cv2.resize(img, (int(W * 1.15), int(H * 1.15)), interpolation=cv2.INTER_AREA if hd else cv2.INTER_LANCZOS4)
if not hd:                                             # gambar kecil: tajamkan sedikit selepas dibesarkan
    blur = cv2.GaussianBlur(big, (0, 0), 2.0)
    big = cv2.addWeighted(big, 1.5, blur, -0.5, 0)
BH, BW = big.shape[:2]
rng = np.random.default_rng(3)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS),
                        "-i", "-", "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", out], stdin=subprocess.PIPE)
n = int(dur * FPS)
for i in range(n):
    u = i / max(1, n - 1)
    e = u * u * (3 - 2 * u)
    z = 1.0 + 0.07 * e                                  # zoom masuk perlahan
    cx = BW / 2 + pan * 40 * (e - 0.5)
    cy = BH / 2
    m = np.float32([[z, 0, W / 2 - z * cx], [0, z, H / 2 - z * cy]])
    fr = cv2.warpAffine(big, m, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    if atas > 0:
        if i == 0:
            latar = cv2.GaussianBlur(cv2.resize(fr, (W // 16, H // 16), interpolation=cv2.INTER_AREA), (0, 0), 5)
            latar = (cv2.resize(latar, (W, H), interpolation=cv2.INTER_LINEAR) * 0.42).astype(np.uint8)
            tw = int(W * lebar) // 2 * 2
            mx = (W - tw) // 2
            th = int(tw * H / W)
            alfa = np.ones((th, tw, 1), np.float32)
            g = 60                                          # tepi atas pudar ke latar
            alfa[:g] = np.linspace(0, 1, g)[:, None, None]
        kecil = cv2.resize(fr, (tw, th), interpolation=cv2.INTER_AREA)
        fr2 = latar.copy().astype(np.float32)
        h2 = min(th, H - atas)
        fr2[atas:atas + h2, mx:mx + tw] = fr2[atas:atas + h2, mx:mx + tw] * (1 - alfa[:h2]) + kecil[:h2] * alfa[:h2]
        fr = fr2.astype(np.uint8)
    grain = rng.normal(0, 2.0, (H // 2, W // 2, 1)).astype(np.float32)
    grain = cv2.resize(grain, (W, H))[..., None]
    enc.stdin.write(np.uint8(np.clip(fr.astype(np.float32) + grain, 0, 255)).tobytes())
enc.stdin.close()
enc.wait()
print(out)
