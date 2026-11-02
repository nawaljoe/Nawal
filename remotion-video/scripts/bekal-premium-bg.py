"""Rupa "premium": orang kekal tajam, latar belakang (siling/dinding) dikaburkan & digelapkan
macam latar studio gelap. Guna segmentasi (rembg isnet) + keutamaan kedalaman (bahagian bawah frame = dekat kamera).
Hasil: public/bekal/footage/<nama>_prem.mp4   Guna: python3 scripts/bekal-premium-bg.py [nama ...]
"""
import subprocess, sys
import numpy as np
from PIL import Image, ImageFilter
from rembg import new_session, remove

F = "public/bekal/footage/"
W, H = 1080, 1920
# nama klip: (saat maksimum yang diproses, kekuatan gelap latar)
CLIPS = {"masjid_dalam": (7.0, 0.42), "masjid_saf": (4.5, 0.45),
         "wudhu": (5.0, 0.42), "masjid_qiyam": (3.33, 0.45), "sujud": (4.5, 0.5)}
session = new_session("isnet-general-use")
yy = np.linspace(0, 1, H)[:, None]
ramp = np.clip((yy - 0.48) / (0.82 - 0.48), 0, 1)  # bawah frame sentiasa tajam
ramp = ramp * ramp * (3 - 2 * ramp)

def seg(frame):
    m = remove(Image.fromarray(frame).resize((540, 960)), session=session, only_mask=True)
    return np.asarray(m.resize((W, H), Image.BILINEAR), np.float32) / 255

for name in (sys.argv[1:] or CLIPS):
    maxt, dark = CLIPS[name]
    raw = subprocess.run(["ffmpeg", "-v", "error", "-t", str(maxt), "-i", F + name + ".mp4", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         capture_output=True, check=True).stdout
    frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
    n = len(frames)
    # topeng setiap 2 frame, kemudian interpolasi + lancarkan ikut masa (elak berkelip)
    keys = list(range(0, n, 2)) + ([n - 1] if (n - 1) % 2 else [])
    km = {k: seg(frames[k]) for k in keys}
    masks = []
    for i in range(n):
        a = max(k for k in keys if k <= i); b = min(k for k in keys if k >= i)
        masks.append(km[a] if a == b else km[a] * (b - i) / (b - a) + km[b] * (i - a) / (b - a))
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", "30", "-i", "-",
                            "-t", str(maxt), "-i", F + name + ".mp4", "-map", "0:v", "-map", "1:a?", "-c:v", "libx264", "-crf", "17",
                            "-preset", "fast", "-pix_fmt", "yuv420p", "-c:a", "copy", "-shortest", F + name + "_prem.mp4"], stdin=subprocess.PIPE)
    for i in range(n):
        sm = (masks[max(i - 1, 0)] + 2 * masks[i] + masks[min(i + 1, n - 1)]) / 4
        m = np.maximum(np.clip(sm * 1.4, 0, 1), ramp)
        m = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(5)), np.float32)[..., None] / 255
        f = frames[i].astype(np.float32)
        bg = np.asarray(Image.fromarray(frames[i]).filter(ImageFilter.GaussianBlur(12)), np.float32)
        lum = bg.mean(axis=2, keepdims=True)
        bg = (bg * 0.75 + lum * 0.25) * dark  # latar: kabur, kurang warna, gelap
        enc.stdin.write((f * m + bg * (1 - m)).clip(0, 255).astype(np.uint8).tobytes())
    enc.stdin.close(); enc.wait()
    print("ok", name, n, flush=True)
