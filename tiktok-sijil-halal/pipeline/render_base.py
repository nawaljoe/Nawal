"""Render the graded base picture with face-tracked punch-ins and the end-card freeze.

Usage: python3 render_base.py <source.mp4> <edl.json> <timeline.json> <face.json> <out.mp4>
"""
import json, subprocess, sys
import numpy as np, cv2

src, edl_p, tl_p, face_p, out = sys.argv[1:6]
edl, tl, face = json.load(open(edl_p)), json.load(open(tl_p)), json.load(open(face_p))
W, H, FPS = 1080, 1920, edl["fps"]
GRADE = ("eq=contrast=1.08:saturation=0.92:gamma=0.97,"
         "colorbalance=rs=-0.04:bs=0.06:rh=0.03:gh=0.01:bh=-0.03,"
         "curves=master='0/0.03 0.25/0.22 0.75/0.78 1/0.96'")
ft, fcx, fcy = np.array(face["t"]), np.array(face["cx"]), np.array(face["cy"])

def zoom_at(t):
    shot = next(s for s in tl["shots"] if s["s"] - 1e-6 <= t < s["e"] + 1e-6)
    keys = shot["zoom"]; z = keys[0][1]
    for i, (kt, kz, ease) in enumerate(keys[1:], 1):
        pt, pz = keys[i - 1][0], keys[i - 1][1]
        if ease == "lin":
            if t >= pt: z = pz + (kz - pz) * min(1, (t - pt) / max(1e-6, kt - pt))
        elif t >= kt:
            d = (ease or 0) / FPS
            u = 1 if d == 0 else min(1, (t - kt) / d)
            u = u * u * (3 - 2 * u)                       # smoothstep
            z = pz + (kz - pz) * u
    return z

yy, xx = np.mgrid[0:H, 0:W]
r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H * 0.45) / (H / 2)) ** 2)
VIG = (1 - 0.28 * np.clip((r - 0.55) / 0.75, 0, 1) ** 1.6).astype(np.float32)[..., None]

def frame_for(img, t, src_t):
    z = zoom_at(t)
    if z > 1.001:
        cw, ch = W / z, H / z
        cx, cy = np.interp(src_t, ft, fcx), np.interp(src_t, ft, fcy)
        x0 = float(np.clip(cx - cw / 2, 0, W - cw)); y0 = float(np.clip(cy - 0.40 * ch, 0, H - ch))
        M = np.float32([[z, 0, -x0 * z], [0, z, -y0 * z]])        # sub-pixel crop+scale in one warp
        img = cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REPLICATE)
        if z >= 1.15:                                              # restore a little crispness after upscale
            blur = cv2.GaussianBlur(img, (0, 0), 1.2)
            img = cv2.addWeighted(img, 1.25, blur, -0.25, 0)
    return np.clip(img.astype(np.float32) * VIG, 0, 255).astype(np.uint8)

enc = subprocess.Popen(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                        "-r", str(FPS), "-i", "-", "-vf", "scale=out_color_matrix=bt709:out_range=tv",
                        "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-pix_fmt", "yuv420p",
                        "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", out], stdin=subprocess.PIPE)
n_out, last = 0, None
for p in edl["pieces"]:
    nf = int(round((p["out_out"] - p["out_in"]) * FPS))
    dec = subprocess.Popen(["ffmpeg", "-nostdin", "-v", "error", "-ss", f"{p['src_in']:.4f}", "-i", src, "-frames:v", str(nf),
                            "-vf", GRADE, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    for k in range(nf):
        buf = dec.stdout.read(W * H * 3)
        img = np.frombuffer(buf, np.uint8).reshape(H, W, 3) if len(buf) == W * H * 3 else last_raw
        last_raw = img
        t = n_out / FPS
        fr = frame_for(img, t, p["src_in"] + k / FPS)
        enc.stdin.write(fr.tobytes()); n_out += 1; last = fr
    dec.wait()
    print(f"piece {p['out_in']:6.2f}s done ({n_out} frames)", flush=True)

# end card: freeze last frame, blur + navy wash ramp over 8 frames
navy = np.array([14, 30, 63], np.float32)
nf_end = int(round(edl["end_card"] * FPS))
for k in range(nf_end):
    u = min(1, (k + 1) / 8); u = u * u * (3 - 2 * u)
    b = cv2.GaussianBlur(last, (0, 0), 0.1 + 14 * u).astype(np.float32)
    fr = b * (1 - 0.62 * u) + navy * 0.62 * u
    enc.stdin.write(np.clip(fr, 0, 255).astype(np.uint8).tobytes()); n_out += 1
enc.stdin.close(); enc.wait()
print(f"wrote {out}: {n_out} frames = {n_out / FPS:.2f}s")
