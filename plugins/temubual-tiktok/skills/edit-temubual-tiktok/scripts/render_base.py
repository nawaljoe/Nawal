"""Render the graded base picture with face-tracked punch-ins and the end-card freeze.

Usage: python3 render_base.py <source.mp4> <edl.json> <timeline.json> <face.json> <out.mp4> <beep.mp4>
Look (v4, brightened from v2): fresh studio grade -- cooler shadows, warm skin, rolled-off highlights -- plus a soft
key-light falloff centred on the speaker's face so the office walls and table drop into shadow.
"""
import json, subprocess, sys
import numpy as np, cv2

src, edl_p, tl_p, face_p, out, beep_src = sys.argv[1:7]
edl, tl, face = json.load(open(edl_p)), json.load(open(tl_p)), json.load(open(face_p))
W, H, FPS = 1080, 1920, edl["fps"]
GRADE = ("eq=contrast=1.08:saturation=0.96:gamma=1.02:brightness=0.02,"      # v4: brighter, fresher
         "colorbalance=rs=-0.05:gs=-0.01:bs=0.06:rm=0.03:gm=0.01:bm=-0.02:rh=0.03:gh=0.01:bh=-0.02,"
         "curves=master='0/0.03 0.25/0.23 0.5/0.52 0.75/0.78 1/0.93'")
KEY_K, KEY_SOFT = 0.50, 0.85         # key-light falloff strength / softness (v4: gentler)
SKIN_AMT, SKIN_SIGMA = 0.80, 34       # v3: skin smoothing blend / bilateral colour sigma
JOIN_STEP, Z_MAX = 1.04, 1.10         # v3: zoom step that masks each filler jump cut; overall cap
ft, fcx, fcy = np.array(face["t"]), np.array(face["cx"]), np.array(face["cy"])
FW = float(np.median(face["fw"]))

JOINS = tl.get("fillerJoins", [])
def zoom_at(t):
    shot = next(s for s in tl["shots"] if s["s"] - 1e-6 <= t < s["e"] + 1e-6)
    flips = sum(1 for j in JOINS if shot["s"] - 1e-6 <= j <= t + 1e-6)
    return min(Z_MAX, zoom_base(t, shot) * (JOIN_STEP if flips % 2 else 1.0))

def zoom_base(t, shot):
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
VIG = (1 - 0.15 * np.clip((r - 0.55) / 0.75, 0, 1) ** 1.6).astype(np.float32)[..., None]
XX, YY = xx.astype(np.float32), yy.astype(np.float32)

def key_light(img, src_t):
    cx, cy = np.interp(src_t, ft, fcx), np.interp(src_t, ft, fcy)
    d = np.sqrt(((XX - cx) / (FW * 1.45)) ** 2 + ((YY - (cy + FW * 0.8)) / (FW * 2.3)) ** 2)
    f = np.clip((d - 0.45) / KEY_SOFT, 0, 1); f = f * f * (3 - 2 * f)
    return np.clip(img.astype(np.float32) * (1 - KEY_K * f)[..., None], 0, 255).astype(np.uint8)

def smooth_skin(img, src_t):
    """Edge-preserving smoothing on skin inside the face ellipse; eyes, brows and beard stay sharp."""
    cx, cy = np.interp(src_t, ft, fcx), np.interp(src_t, ft, fcy)
    x0, x1 = int(max(0, cx - FW * 0.75)), int(min(W, cx + FW * 0.75))
    y0, y1 = int(max(0, cy - FW * 0.85)), int(min(H, cy + FW * 0.95))
    roi = img[y0:y1, x0:x1]
    skin = cv2.inRange(cv2.cvtColor(roi, cv2.COLOR_RGB2YCrCb), (40, 133, 77), (245, 178, 130)).astype(np.float32) / 255
    yy_, xx_ = np.mgrid[y0:y1, x0:x1]
    ell = ((((xx_ - cx) / (FW * 0.55)) ** 2 + ((yy_ - cy) / (FW * 0.75)) ** 2) < 1).astype(np.float32)
    m = cv2.GaussianBlur(skin * ell, (0, 0), 9)[..., None] * SKIN_AMT
    sm = cv2.bilateralFilter(roi, 0, SKIN_SIGMA, 6); sm = cv2.bilateralFilter(sm, 0, SKIN_SIGMA * 0.8, 4)
    out = img.copy(); out[y0:y1, x0:x1] = np.clip(roi * (1 - m) + sm * m, 0, 255).astype(np.uint8)
    return out

def frame_for(img, t, src_t):
    img = key_light(smooth_skin(img, src_t), src_t)
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
    if p.get("kind") == "beep":   # creator's colour-bar beep clip (720x1080), scaled to cover 9:16
        dec = subprocess.Popen(["ffmpeg", "-nostdin", "-v", "error", "-ss", "0.21", "-i", beep_src, "-frames:v", str(nf),
                                "-vf", f"scale=-2:{H}:flags=lanczos,crop={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                               stdout=subprocess.PIPE)
        for k in range(nf):
            buf = dec.stdout.read(W * H * 3)
            fr = np.frombuffer(buf, np.uint8).reshape(H, W, 3) if len(buf) == W * H * 3 else fr
            enc.stdin.write(fr.tobytes()); n_out += 1
        dec.wait(); continue
    dec = subprocess.Popen(["ffmpeg", "-nostdin", "-v", "error", "-ss", f"{p['src_in']:.4f}", "-i", src, "-frames:v", str(nf),
                            "-vf", GRADE, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    for k in range(nf):
        buf = dec.stdout.read(W * H * 3)
        img = np.frombuffer(buf, np.uint8).reshape(H, W, 3) if len(buf) == W * H * 3 else last_raw
        last_raw = img
        t = n_out / FPS
        fr = frame_for(img, t, p["src_in"] + k / FPS)
        enc.stdin.write(fr.tobytes()); n_out += 1
        if p.get("kind") != "question": last = fr
    dec.wait()
    print(f"piece {p['out_in']:6.2f}s {p.get('kind', 'speech')} done ({n_out} frames)", flush=True)

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
