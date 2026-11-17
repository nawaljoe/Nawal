"""B-roll 'Kemahiran mendengar' dari rakaman sebenar (0-8 s, ustazah mendengar soalan): close-up, push-in perlahan."""
import subprocess, sys
import cv2
import numpy as np
sys.path.insert(0, sys.argv[3])
from bokeh import Bokeh
from grade import grade
W, H = 1080, 1920
src, out = sys.argv[1], sys.argv[2]
a = float(sys.argv[4]) if len(sys.argv) > 4 else 0.6      # saat mula dalam video asal
dur = float(sys.argv[5]) if len(sys.argv) > 5 else 7.0    # tempoh klip
posisi = float(sys.argv[6]) if len(sys.argv) > 6 else 0.55  # kedudukan menegak wajah dalam bingkai (0=atas, 1=bawah)
n = int(dur * 30)
p = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", str(a), "-i", src, "-t", str(dur + 0.2), "-an", "-vf", f"scale={W}:{H},fps=30",
                      "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE)
e = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", "30", "-i", "-",
                      "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", out], stdin=subprocess.PIPE)
bk = Bokeh(strength=6.0)
for i in range(n):
    buf = p.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    fr = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    fr, _ = bk(fr)
    z = 1.75 + 0.12 * (i / n)                      # close-up wajah, push-in perlahan
    cx, cy = 540, 760
    m = np.float32([[z, 0, W / 2 - z * cx], [0, z, H * posisi - z * cy]])
    e.stdin.write(grade(cv2.warpAffine(fr, m, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)).tobytes())
e.stdin.close(); e.wait(); p.kill()
import os; os._exit(0)
