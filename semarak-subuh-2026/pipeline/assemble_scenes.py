"""Cut the graded/stabilised master + studio-cleaned voice into one clip per scene.

Each scene = muted pre-roll (0.4 s) + spoken pieces (25/35 ms micro-fades, frame-snapped) + muted post-roll,
so Remotion transitions overlap only silence. Writes public/scenes/<id>.mp4, public/voice/opening.wav and
src/data/scenes.json (piece offsets, used for punch-ins and for mapping source time -> scene time).

Usage: python3 pipeline/assemble_scenes.py pipeline/story.json
"""
import json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = json.load(open(sys.argv[1]))
V, A = S["video"], S["voice"]
FPS = 30
OUT = os.path.join(ROOT, "public", "scenes"); os.makedirs(OUT, exist_ok=True)
TMP = os.path.join(ROOT, ".cache", "pieces"); os.makedirs(TMP, exist_ok=True)

def q(t): return round(t * FPS) / FPS

def piece(s, e, path, mute=False):
    s = q(s); nf = int(round((q(e) - s) * FPS)); d = nf / FPS
    af = "volume=0" if mute else f"afade=t=in:d=0.025,afade=t=out:st={d - 0.035:.4f}:d=0.035"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{s:.4f}", "-i", V, "-ss", f"{s:.4f}", "-i", A,
                    "-frames:v", str(nf), "-t", f"{d:.4f}", "-af", af, "-map", "0:v", "-map", "1:a",
                    "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-pix_fmt", "yuv420p", "-r", "30",
                    "-c:a", "pcm_s24le", "-ar", "48000", path], check=True)
    return nf

meta = {}
for sc in S["scenes"]:
    sid, pieces = sc["id"], sc["pieces"]
    if not pieces: continue
    pre, post = 0.4, 0.4
    parts = [(pieces[0][0] - pre, pieces[0][0], True)] + [(a, b, False) for a, b in pieces] + [(pieces[-1][1], pieces[-1][1] + post, True)]
    files, offs, f0 = [], [], 0
    for i, (a, b, m) in enumerate(parts):
        p = f"{TMP}/{sid}_{i:02d}.mov"; nf = piece(a, b, p, m); files.append(p)
        offs.append({"src": [q(a), q(b)], "frame": f0, "frames": nf, "muted": m}); f0 += nf
    lst = f"{TMP}/{sid}.txt"; open(lst, "w").write("".join(f"file '{p}'\n" for p in files))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c:v", "copy",
                    "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-movflags", "+faststart", f"{OUT}/{sid}.mp4"], check=True)
    meta[sid] = {"frames": f0, "parts": offs}
    print(sid, f0, "frames", round(f0 / FPS, 2), "s")

# opening voice line (no picture: scene 1 runs on the aerial dawn photograph)
o = S["openingVoice"]; os.makedirs(os.path.join(ROOT, "public", "voice"), exist_ok=True)
d = q(o[1]) - q(o[0])
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{q(o[0]):.4f}", "-t", f"{d:.4f}", "-i", A,
                "-af", f"afade=t=in:d=0.06,afade=t=out:st={d - 0.08:.4f}:d=0.08", "-ar", "48000", "-c:a", "pcm_s16le",
                os.path.join(ROOT, "public", "voice", "opening.wav")], check=True)
meta["openingVoice"] = {"src": [q(o[0]), q(o[1])], "frames": int(round(d * FPS))}
os.makedirs(os.path.join(ROOT, "src", "data"), exist_ok=True)
json.dump(meta, open(os.path.join(ROOT, "src", "data", "scenes.json"), "w"), indent=1)
