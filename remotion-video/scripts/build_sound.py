"""Bina muzik latar dari sound TikTok "Everything Works Out in the End (instrumental)".
Sound asal 29s; disambung (loop) pada titik frasa yang sama (28.10s -> 13.231s,
korelasi 0.995) sampai panjang video utama, kemudian fade-out ke outro.

Guna: python3 scripts/build_sound.py <sound.wav> [saat]   (lalai 49.95)
Dapatkan wav: yt-dlp -o snd.mp4 https://vt.tiktok.com/ZSgwpaWRB/ && ffmpeg -i snd.mp4 -vn -ac 2 -ar 48000 snd.wav
"""
import sys, os, wave
import numpy as np

SR = 48000
src = sys.argv[1]
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 49.95
LOOP_END, LOOP_START = 28.10, 13.231  # saat

w = wave.open(src)
assert w.getframerate() == SR and w.getnchannels() == 2
a = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, 2).astype(float) / 32768
i1, i0 = int(LOOP_END * SR), int(LOOP_START * SR)
need = int(DUR * SR)
xf = int(0.03 * SR)
ramp = np.linspace(0, 1, xf)[:, None]

out = a[:i1].copy()
while len(out) < need:
    nxt = a[i0:i1]
    # crossfade halus di sambungan
    out[-xf:] = out[-xf:] * (1 - ramp) + nxt[:xf] * ramp
    out = np.concatenate([out, nxt[xf:]])
out = out[:need]

fade = np.ones(need)
fo = int(2.5 * SR)
fade[-fo:] = np.linspace(1, 0, fo) ** 1.6
out *= fade[:, None]

rms = np.sqrt((out**2).mean())
out *= 10 ** (-18 / 20) / rms
peak = np.abs(out).max()
if peak > 0.89:
    out *= 0.89 / peak

dst = os.path.join(os.path.dirname(__file__), "..", "public", "audio", "amanah-sound.wav")
with wave.open(dst, "wb") as o:
    o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR)
    o.writeframes((out * 32767).astype(np.int16).tobytes())
print("ok", dst, f"{need / SR:.2f}s")
