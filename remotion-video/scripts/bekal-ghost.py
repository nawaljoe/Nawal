"""Asingkan tangan & bungkusan makanan dari klip meja kedua (food2_fast.mp4) untuk kesan "tangan hantu".
Hasil: public/bekal/footage/ghost/solid_XXX.png (makanan, padat) & hand_XXX.png (tangan, untuk dipudarkan).
Klip diputar 180° supaya seolah-olah orang di seberang meja yang meletak makanan.
Guna: python3 scripts/bekal-ghost.py   (dari folder remotion-video)
"""
import subprocess, os
import numpy as np
from PIL import Image, ImageFilter

SRC = "public/bekal/footage/food2_fast.mp4"
OUT = "public/bekal/footage/ghost"
W, H, FPS = 1080, 1920, 30
# saat-saat aktif (tangan meletak makanan) dalam food2_fast.mp4 — masa mati dibuang
SEGMENTS = [(0.40, 0.80), (1.48, 1.98), (2.98, 3.70)]

os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    os.remove(os.path.join(OUT, f))
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", SRC, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                     capture_output=True, check=True).stdout
frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
print("frames", len(frames))

clean = np.median(frames[:8], axis=0).astype(np.float32)
final = np.median(frames[-4:], axis=0).astype(np.float32)

def soft(x, lo, hi):
    return np.clip((x - lo) / (hi - lo), 0, 1)

def blur(a, r):
    return np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r)), np.float32) / 255

idx = []
for a, b in SEGMENTS:
    idx += list(range(int(a * FPS), min(int(b * FPS), len(frames))))
for n, i in enumerate(idx):
    f = frames[i].astype(np.float32)
    # padankan pendedahan cahaya dengan plat bersih
    gain = np.median(clean, axis=(0, 1)) / np.maximum(np.median(f, axis=(0, 1)), 1)
    fg = np.clip(f * gain, 0, 255)
    d_clean = blur(np.abs(fg - clean).max(axis=2) / 255, 3) * 255
    d_final = blur(np.abs(fg - final).max(axis=2) / 255, 3) * 255
    m_all = np.clip(blur(soft(d_clean, 16, 38), 2) * 1.3, 0, 1)
    m_solid = np.clip(blur(m_all * (1 - soft(d_final, 10, 26)), 1.5) * 1.6, 0, 1)
    m_hand = np.clip(m_all - m_solid, 0, 1)
    for name, m in (("solid", m_solid), ("hand", m_hand)):
        rgba = np.dstack([fg * (m[..., None] > 0.01), m * 255]).astype(np.uint8)
        Image.fromarray(rgba, "RGBA").rotate(180).save(f"{OUT}/{name}_{n:03d}.png", optimize=False, compress_level=6)
print("ok", len(idx), "frame setiap lapisan")
