"""Bina video akhir: potong babak + buang gagap, zoom perlahan, gred 'ambient soft', kad B-roll,
tajuk, caption kecil, suara -14 LUFS + muzik tenang (ducking), outro.

Guna:
  python3 -I compose.py --resolve <config.json> <config_resolved.json>
  python3 -I compose.py <config_resolved.json> <video_asal> <folder_kad> <outro.mp4> <font_dir> <muzik> <folder_output> [nama_draf ...]
"""
import json
import os
import subprocess
import sys
import wave

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from grade import grade, grade_ringan  # noqa: E402
from bokeh import Bokeh  # noqa: E402

W, H, FPS, SR = 1080, 1920, 30, 48000
FULL_CARDS = {"egg", "silent", "syiqaq", "cta", "stigma", "listen", "officer", "checklist", "help", "rm10", "phone", "call",
              "couple", "lock"}
ZOOM_CENTER = (540.0, 700.0)  # sekitar wajah penceramah
ZOOM_MID, ZOOM_AMP, ZOOM_PERIOD = 1.045, 0.035, 16.0   # zoom masuk/keluar perlahan, berterusan merentas potongan


def pieces(draft):
    """Senarai bahagian disimpan: (babak, a, b, offset_draf)."""
    out, acc = [], 0.0
    for si, sg in enumerate(draft["segments"]):
        t = sg["a"]
        for a, b in sorted(c for c in draft.get("cuts", []) if sg["a"] <= c[0] < sg["b"]):
            if a > t:
                out.append((si, t, a, acc)); acc += a - t
            t = max(t, b)
        if sg["b"] > t:
            out.append((si, t, sg["b"], acc)); acc += sg["b"] - t
    return out, acc


def map_time(ps, t):
    """Masa asal -> masa draf (masa dalam potongan dipetakan ke awal bahagian seterusnya)."""
    best = None
    for _, a, b, off in ps:
        if a <= t <= b:
            return off + t - a
        if t < a and (best is None or a < best[0]):
            best = (a, off)
    return best[1] if best else ps[-1][3] + ps[-1][2] - ps[-1][1]


def resolve(draft):
    ps, total = pieces(draft)
    cards = []
    for c in draft["cards"]:
        c = dict(c)
        t = map_time(ps, c.pop("at"))
        d = map_time(ps, c.pop("end")) - t if "end" in c else c["d"]
        if "cues" in c:
            c["cues"] = [round(max(0.0, map_time(ps, q) - t), 3) for q in c["cues"]]
        c["t"], c["d"] = round(t, 3), round(min(d, total - t), 3)
        cards.append(c)
    draft = dict(draft, cards=cards, total=total)
    return draft


def read_piece(video, a, n):
    cmd = ["ffmpeg", "-v", "error", "-ss", f"{a:.3f}", "-i", video, "-t", f"{n / FPS + 0.2:.3f}",
           "-vf", f"scale={W}:{H},fps={FPS}", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    last = None
    for _ in range(n):
        buf = p.stdout.read(W * H * 3)
        if len(buf) == W * H * 3:
            last = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
        yield last
    p.stdout.close()
    p.kill()
    p.wait()


class ClipReader:
    """Baca klip B-roll (contoh Seedance) secara berjujukan, potong 9:16 dan regang ke tempoh slot."""

    def __init__(self, path, dur):
        src = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                                   capture_output=True, text=True).stdout.strip())
        stretch = max(1.0, dur / src)          # perlahankan sedikit jika klip lebih pendek dari slot
        vf = (f"setpts={stretch:.4f}*PTS,fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase,"
              f"crop={W}:{H}")
        self.p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", path, "-an", "-vf", vf, "-f", "rawvideo",
                                   "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        self.last = None

    def next(self):
        buf = self.p.stdout.read(W * H * 3)
        if len(buf) == W * H * 3:
            self.last = grade_ringan(np.frombuffer(buf, np.uint8).reshape(H, W, 3))
        return self.last

    def close(self):
        self.p.kill(); self.p.wait()


def zoom(frame, z):
    cx, cy = ZOOM_CENTER
    m = np.float32([[z, 0, cx - z * cx], [0, z, cy - z * cy]])
    return cv2.warpAffine(frame, m, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)


def blend(frame, rgba):
    if rgba.ndim == 2:
        rgba = cv2.cvtColor(rgba, cv2.COLOR_GRAY2BGR)
    if rgba.shape[2] == 3:  # kad legap penuh
        return rgba
    a = rgba[:, :, 3:4].astype(np.float32) / 255.0
    if a.max() == 0:
        return frame
    out = frame.astype(np.float32) * (1 - a) + rgba[:, :, :3].astype(np.float32) * a
    return out.astype(np.uint8)


def title_alpha(t, total, hide):
    """Tajuk muncul di awal, pudar sebelum kad penuh skrin dan muncul semula selepasnya."""
    a = min(1.0, max(0.0, (t - 0.2) / 0.4), max(0.0, (total - 0.45 - t) / 0.3))
    for hs, he in hide:
        a = min(a, max(0.0, min(1.0, max((hs - t) / 0.25, (t - he) / 0.3))))
    return a


def ass_time(t):
    h, r = divmod(max(t, 0), 3600)
    m, s = divmod(r, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"


def build_ass(draft, ps, path):
    hide = [(c["t"], c["t"] + c["d"]) for c in draft["cards"] if c["type"] in FULL_CARDS]
    lines = []
    for a0, b0, text in draft["captions"]:
        s, e = map_time(ps, a0), map_time(ps, b0)
        for hs, he in hide:  # jangan tindih kad penuh skrin
            if s < he and e > hs:
                if s >= hs - 0.2:
                    s = he
                else:
                    e = hs
        if e - s < 0.35:
            continue
        text = text.replace("{Y}", r"{\c&H05B7F2&}").replace("{W}", r"{\c&HFFFFFF&}")
        lines.append(f"Dialogue: 0,{ass_time(s)},{ass_time(e)},Cap,,0,0,0,,{{\\fad(80,60)}}{text}")
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Poppins SemiBold,50,&H00FFFFFF,&H00FFFFFF,&H00301A12,&H80000000,0,0,0,0,100,100,0,0,1,4,1.5,2,120,170,590,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    with open(path, "w") as f:
        f.write(head + "\n".join(lines) + "\n")


def loudnorm_json(path):
    r = subprocess.run(["ffmpeg", "-v", "info", "-i", path, "-vn", "-af",
                        "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    return json.loads(r[r.rindex("{"):r.rindex("}") + 1])


def build_voice(video, ps, frames_at, tmp):
    src = os.path.join(tmp, "src.wav")
    if not os.path.exists(src):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vn", "-ac", "1", "-ar", str(SR), src], check=True)
    w = wave.open(src)
    x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32)
    parts, bounds, fade, h = [], [], int(0.012 * SR), int(0.025 * SR)
    for (_, a, b, _), (f0, f1) in zip(ps, frames_at):
        s0 = int(round(a * SR))
        n = int(round((f1 - f0) / FPS * SR))
        parts.append(x[s0:s0 + n].copy())
        bounds.append((s0, s0 + n))
    parts[0][:fade] *= np.linspace(0, 1, fade)
    parts[-1][-fade:] *= np.linspace(1, 0, fade)
    # crossfade kuasa-sama 50 ms di setiap potongan (panjang kekal, tiada 'putus' ke senyap)
    r = np.linspace(0, np.pi / 2, 2 * h, dtype=np.float32)
    out = np.concatenate(parts)
    pos = 0
    for k in range(len(parts) - 1):
        pos += len(parts[k])
        le, rs = bounds[k][1], bounds[k + 1][0]
        left, right = x[le - h:le + h], x[rs - h:rs + h]
        if len(left) == 2 * h and len(right) == 2 * h and pos - h >= 0 and pos + h <= len(out):
            out[pos - h:pos + h] = left * np.cos(r) + right * np.sin(r)
    parts = [out]
    raw = os.path.join(tmp, "raw.wav")
    with wave.open(raw, "wb") as o:
        o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR)
        o.writeframes(np.clip(np.concatenate(parts), -32768, 32767).astype(np.int16).tobytes())
    j = loudnorm_json(raw)
    out = os.path.join(tmp, "voice.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af",
                    "highpass=f=80,loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={input_i}:measured_TP={input_tp}:"
                    "measured_LRA={input_lra}:measured_thresh={input_thresh}:offset={target_offset}:linear=true".format(**j),
                    "-ar", str(SR), "-ac", "2", out], check=True)
    return out


def build_mix(voice, music, start, total, tmp):
    out = os.path.join(tmp, "mix.wav")
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", voice, "-ss", str(start), "-t", f"{total + 0.5:.3f}", "-i", music,
         "-filter_complex",
         f"[1:a]aresample={SR},aformat=channel_layouts=stereo,loudnorm=I=-22:TP=-5,aresample={SR},"
         f"afade=t=in:d=1.2,afade=t=out:st={total - 1.8:.3f}:d=1.8[m];"
         "[0:a]asplit[v1][v2];[m][v1]sidechaincompress=threshold=0.1:ratio=2:attack=80:release=900[md];"
         f"[v2][md]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.89,aresample={SR}[a]",
         "-map", "[a]", "-t", f"{total:.3f}", out], check=True)
    return out


def render(name, draft, video, cards_dir, outro, font_dir, music, out_dir):
    tmp = os.path.abspath(os.path.join(out_dir, f"tmp_{name}"))
    os.makedirs(tmp, exist_ok=True)
    ps, _ = pieces(draft)
    frames_at = [(round(off * FPS), round((off + b - a) * FPS)) for _, a, b, off in ps]
    total = frames_at[-1][1] / FPS
    ass = os.path.join(tmp, "cap.ass")
    build_ass(draft, ps, ass)
    mix = build_mix(build_voice(video, ps, frames_at, tmp), music, draft.get("music_start", 0), total, tmp)
    main = os.path.join(tmp, "main.mp4")
    enc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
         "-i", mix, "-vf", f"subtitles={ass}:fontsdir={font_dir},fade=t=out:st={total - 0.45:.3f}:d=0.45:color=white",
         "-c:v", "libx264", "-crf", "19", "-preset", "medium", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "192k", "-shortest", main], stdin=subprocess.PIPE)
    cards = [(c["t"], c["d"], os.path.join(cards_dir, name, str(i))) for i, c in enumerate(draft["cards"])]
    clips_dir = os.path.join(os.path.dirname(os.path.abspath(cards_dir)), "klip")
    clips = {i: os.path.join(clips_dir, c["clip"]) for i, c in enumerate(draft["cards"]) if c.get("clip")}
    readers = {}
    hide = [(c["t"], c["t"] + c["d"]) for c in draft["cards"] if c["type"] in FULL_CARDS]
    title = cv2.imread(os.path.join(cards_dir, name, "title.png"), cv2.IMREAD_UNCHANGED) if draft.get("title") else None
    # templat logo pelanggan (logo Johor di atas, tera air Fared Khalid di bawah), sentiasa kelihatan
    templat = cv2.imread(os.path.join(os.path.dirname(cards_dir.rstrip("/")) or ".", "logo", "templat.png"),
                         cv2.IMREAD_UNCHANGED)
    bokeh = Bokeh()
    prev = None
    for (si, a, b, _), (f0, f1) in zip(ps, frames_at):
        bokeh.reset()
        for j, fr in enumerate(read_piece(video, a, f1 - f0)):
            n = f0 + j
            t = n / FPS
            z = ZOOM_MID - ZOOM_AMP * np.cos(2 * np.pi * t / ZOOM_PERIOD)
            img = grade(zoom(bokeh(fr)[0], z))
            if prev is not None and j < 4:          # dissolve 4 frame di setiap potongan
                img = cv2.addWeighted(prev, 1 - (j + 1) / 5, img, (j + 1) / 5, 0)
            base = img
            if title is not None:
                ta = title_alpha(t, total, hide)
                if ta > 0:
                    tl = title.copy()
                    tl[:, :, 3] = (tl[:, :, 3].astype(np.float32) * ta).astype(np.uint8)
                    img = blend(img, tl)
            for ci, (cs, cd, cdir) in enumerate(cards):
                if not cs <= t < cs + cd:
                    continue
                if ci in clips:  # klip sebenar: pudar masuk/keluar + label di atas
                    if ci not in readers:
                        readers[ci] = ClipReader(clips[ci], cd)
                    cf = readers[ci].next()
                    if cf is not None:
                        env = min(1.0, (t - cs) / 0.35, (cs + cd - t) / 0.3)
                        img = cv2.addWeighted(img, 1 - env, cf, env, 0)
                        lb = cv2.imread(os.path.join(cdir, "label.png"), cv2.IMREAD_UNCHANGED)
                        if lb is not None:
                            lb[:, :, 3] = (lb[:, :, 3].astype(np.float32) * env).astype(np.uint8)
                            img = blend(img, lb)
                    continue
                f = os.path.join(cdir, f"f_{round((t - cs) * FPS):04d}.png")
                if os.path.exists(f):
                    img = blend(img, cv2.imread(f, cv2.IMREAD_UNCHANGED))
            if templat is not None:
                img = blend(img, templat)
            enc.stdin.write(img.tobytes())
        prev = base                                 # frame terakhir bahagian ini, untuk dissolve seterusnya
    for r in readers.values():
        r.close()
    enc.stdin.close()
    enc.wait()
    final = os.path.join(out_dir, f"{name}.mp4")
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", main, "-i", outro, "-filter_complex",
         "[1:v]scale=1080:1920,fps=30,format=yuv420p,setsar=1[ov];[1:a]loudnorm=I=-14:TP=-1.5,aresample=48000,aformat=channel_layouts=stereo[oa];"
         "[0:v]setsar=1[mv];[mv][0:a][ov][oa]concat=n=2:v=1:a=1[v][a]",
         "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "19", "-preset", "medium", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", final], check=True)
    print(name, f"{total:.1f}s + outro ->", final, flush=True)
    os._exit(0) if os.environ.get("KELUAR_TERUS") else None


def main():
    if sys.argv[1] == "--resolve":
        cfg = json.load(open(sys.argv[2]))
        cfg["drafts"] = {k: resolve(v) for k, v in cfg["drafts"].items()}
        json.dump(cfg, open(sys.argv[3], "w"), indent=1, ensure_ascii=False)
        for k, v in cfg["drafts"].items():
            print(k, f"{v['total']:.1f}s", [(c["type"], c["t"], c["d"]) for c in v["cards"]])
        return
    cfg_path, video, cards_dir, outro, font_dir, music, out_dir, *names = sys.argv[1:]
    cfg = json.load(open(cfg_path))
    os.makedirs(out_dir, exist_ok=True)
    for name, draft in cfg["drafts"].items():
        if not names or name in names:
            render(name, draft, video, cards_dir, outro, font_dir, music, out_dir)


if __name__ == "__main__":
    main()
