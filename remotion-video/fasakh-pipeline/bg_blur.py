# Portrait-mode background blur: MediaPipe person segmentation keeps the ustaz sharp,
# the desk (below its back edge) stays sharp, everything behind him is blurred.
import subprocess, sys, numpy as np, cv2, mediapipe as mp
from mediapipe.tasks import python as mpt
from mediapipe.tasks.python import vision
SRC, MODEL, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
SKIP = [(232, 295)]               # colour-bars beep frames: leave untouched
W, H, FPS = 1080, 1920, 30
DESK_Y, DESK_SOFT = 1312, 26      # desk back edge (sharp below)
CROP = (480, 1520)                # rows fed to the segmenter (person lives here)
SIGMA = 10                        # blur strength at half resolution (~20 px full-res)

seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(
    base_options=mpt.BaseOptions(model_asset_path=MODEL), running_mode=vision.RunningMode.VIDEO,
    output_confidence_masks=True, output_category_mask=False))

y = np.arange(H, dtype=np.float32)[:, None]
desk = np.clip((y - (DESK_Y - DESK_SOFT)) / (2 * DESK_SOFT), 0, 1)       # 1 = desk (keep sharp)
desk = desk * desk * (3 - 2 * desk)

dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", SRC, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                        "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-pix_fmt", "yuv420p", OUT], stdin=subprocess.PIPE)
prev = None; i = 0
while True:
    buf = dec.stdout.read(W * H * 3)
    if len(buf) < W * H * 3: break
    f = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    if any(a <= i < b for a, b in SKIP):
        enc.stdin.write(buf); i += 1; prev = None; continue
    a0, a1 = CROP
    crop = np.ascontiguousarray(f[a0:a1])
    r = seg.segment_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=crop), int(i * 1000 / FPS))
    person_c = 1.0 - r.confidence_masks[0].numpy_view().astype(np.float32)   # class 0 = background
    person_c = cv2.resize(person_c, (W, a1 - a0), interpolation=cv2.INTER_LINEAR)
    m = np.zeros((H, W), np.float32); m[a0:a1] = person_c
    m[a1:] = 1.0                                                               # below crop = desk area
    m = np.clip((m - 0.25) / 0.5, 0, 1)                                        # firm the edge
    m = cv2.GaussianBlur(m, (0, 0), 2.0)
    if prev is not None: m = 0.55 * m + 0.45 * prev                            # temporal smoothing (less flicker)
    prev = m
    w = (1 - m) * (1 - desk)                                                   # weight of blurred background
    # normalised-convolution blur at half-res so the ustaz's colours don't bleed into the background
    fs = cv2.resize(f, (W // 2, H // 2), interpolation=cv2.INTER_AREA).astype(np.float32)
    bs = cv2.resize((1 - m), (W // 2, H // 2), interpolation=cv2.INTER_AREA)[..., None]
    num = cv2.GaussianBlur(fs * bs, (0, 0), SIGMA); den = cv2.GaussianBlur(bs, (0, 0), SIGMA)[..., None] if bs.ndim == 2 else cv2.GaussianBlur(bs[..., 0], (0, 0), SIGMA)[..., None]
    blur = num / np.maximum(den, 1e-3)
    blur = cv2.resize(blur, (W, H), interpolation=cv2.INTER_LINEAR)
    out = f.astype(np.float32) * (1 - w[..., None]) + blur * w[..., None]
    enc.stdin.write(np.clip(out, 0, 255).astype(np.uint8).tobytes())
    i += 1
    if i % 600 == 0: print("frame", i, flush=True)
enc.stdin.close(); enc.wait(); print("DONE", i)
