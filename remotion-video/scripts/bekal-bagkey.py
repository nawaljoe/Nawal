"""Buang latar dinding dari klip tangan pegang beg bekal (bag.mp4) supaya boleh diletak atas timelapse jalan ke bangunan.
Hasil: public/bekal/footage/bagkey/bag_XXX.png (RGBA). Perlu: pip install rembg onnxruntime
Guna: python3 scripts/bekal-bagkey.py   (dari folder remotion-video)
"""
import os, subprocess
import numpy as np
from PIL import Image
from rembg import new_session, remove

SRC, OUT = "public/bekal/footage/bag.mp4", "public/bekal/footage/bagkey"
START, LENGTH, W, H = 2.0, 3.4, 1080, 1920
os.makedirs(OUT, exist_ok=True)
raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(START), "-t", str(LENGTH), "-i", SRC,
                      "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
session = new_session("isnet-general-use")
for i, f in enumerate(frames):
    remove(Image.fromarray(f), session=session).save(f"{OUT}/bag_{i:03d}.png", compress_level=6)
    if i % 20 == 0:
        print(i, "/", len(frames), flush=True)
print("ok", len(frames))
