#!/usr/bin/env python3
"""Render a 9:16 rough cut + CMX3600 EDL + SRT from one JSON timeline.

Usage:
  python3 render.py timeline.json RAW_DIR OUT_DIR FONTS_DIR [--proxy]

timeline.json:
  video : sequential picture track  [{clip, in, out, amb_db|null, note}]
  dialog: speech laid on the timeline [{clip, in, out, at, sub, gain_db}]
  sfx   : [{type: whoosh|impact|riser|hit, at, gain_db}]
  text  : titles / lower thirds [{style, start, end, lines:[...]}]
  flash : timeline seconds where a soft white flash transition is drawn
"""
import json, math, os, subprocess, sys

FPS = 30
W, H = 1080, 1920
GRADE = ("eq=contrast=1.06:brightness=-0.01:saturation=1.04:gamma=0.98,"
         "curves=master='0/0.02 0.25/0.23 0.75/0.78 1/0.96',"
         "colortemperature=temperature=6000:mix=0.5")


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        sys.stderr.write(r.stderr[-3000:])
        raise SystemExit(f"ffmpeg failed: {' '.join(cmd[:8])}")


def frames(sec):
    return int(round(sec * FPS))


def tc(fr):
    """Frame count -> SMPTE timecode (non-drop, 30 fps)."""
    s, f = divmod(fr, FPS)
    m, s = divmod(s, 60)
    h, m = divmod(m, 60)
    return f"{h:02d}:{m:02d}:{s:02d}:{f:02d}"


def ass_time(t):
    cs = int(round(t * 100))
    h, cs = divmod(cs, 360000)
    m, cs = divmod(cs, 6000)
    s, cs = divmod(cs, 100)
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"


def srt_time(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def layout(tl):
    t = 0
    for v in tl["video"]:
        v["frames"] = frames(v["out"] - v["in"])
        v["rec_in"] = t
        t += v["frames"]
    return t


# ---------- picture + ambient ----------
def render_segments(tl, raw, tmp):
    paths = []
    for i, v in enumerate(tl["video"]):
        p = os.path.join(tmp, f"v{i:03d}.mp4")
        paths.append(p)
        if os.path.exists(p):
            continue
        n = v["frames"]
        dur = n / FPS
        src = os.path.join(raw, f"IMG_{v['clip']}.MOV")
        vf = (f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
              f"{GRADE},fps={FPS},format=yuv420p")
        amb = v.get("amb_db")
        cmd = ["ffmpeg", "-v", "error", "-y", "-ss", f"{v['in']:.3f}", "-i", src]
        if amb is None:
            cmd += ["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
                    "-map", "0:v", "-map", "1:a"]
            af = "anull"
        else:
            cmd += ["-map", "0:v:0", "-map", "0:a:0"]
            af = (f"highpass=f=60,volume={amb}dB,"
                  f"afade=t=in:d=0.04,afade=t=out:st={max(0, dur-0.06):.3f}:d=0.06")
        cmd += ["-vf", vf, "-af", af, "-ar", "48000", "-ac", "2",
                "-frames:v", str(n), "-t", f"{dur:.3f}",
                "-c:v", "libx264", "-preset", "fast", "-crf", "16",
                "-c:a", "pcm_s16le", "-f", "mov", p]
        run(cmd)
        print("seg", i, v["clip"], v["in"], v["out"], flush=True)
    return paths


def concat(paths, out):
    lst = out + ".txt"
    with open(lst, "w") as f:
        for p in paths:
            f.write(f"file '{p}'\n")
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst,
         "-c", "copy", out])


# ---------- dialogue, sfx ----------
def render_dialog(tl, raw, tmp):
    outs = []
    for i, d in enumerate(tl.get("dialog", [])):
        p = os.path.join(tmp, f"d{i:03d}.wav")
        dur = d["out"] - d["in"]
        g = d.get("gain_db", 0)
        af = ("highpass=f=90,lowpass=f=12000,afftdn=nr=12:nf=-40,"
              "acompressor=threshold=-22dB:ratio=3:attack=8:release=120:makeup=4,"
              f"volume={g}dB,afade=t=in:d=0.05,afade=t=out:st={max(0,dur-0.08):.3f}:d=0.08")
        run(["ffmpeg", "-v", "error", "-y", "-ss", f"{d['in']:.3f}", "-t", f"{dur:.3f}",
             "-i", os.path.join(raw, f"IMG_{d['clip']}.MOV"), "-map", "0:a:0", "-af", af,
             "-ar", "48000", "-ac", "2", p])
        outs.append((p, d["at"]))
    return outs


SFX = {
    # filtered-noise whoosh with a rising then falling band
    "whoosh": ("anoisesrc=d=0.7:c=pink:r=48000:a=0.9,"
               "bandpass=f=1800:width_type=o:w=2.2,"
               "afade=t=in:d=0.35:curve=exp,afade=t=out:st=0.35:d=0.35:curve=exp,"
               "aecho=0.6:0.4:40:0.25,volume=-6dB"),
    # soft sub impact for titles
    "impact": ("aevalsrc='0.9*sin(2*PI*(46+40*exp(-12*t))*t)*exp(-4.5*t)':d=1.6:s=48000,"
               "lowpass=f=180,aecho=0.7:0.5:60:0.3,volume=-3dB"),
    # gentle riser into a scene change
    "riser": ("anoisesrc=d=2.0:c=white:r=48000:a=0.5,highpass=f=800,"
              "afade=t=in:d=1.9:curve=qsin,afade=t=out:st=1.9:d=0.1,volume=-14dB"),
    # light hit / tick for highlights
    "hit": ("aevalsrc='0.6*sin(2*PI*1400*t)*exp(-38*t)+0.3*sin(2*PI*2800*t)*exp(-60*t)':d=0.4:s=48000,"
            "volume=-10dB"),
}


def render_sfx(tl, tmp):
    outs = []
    for i, s in enumerate(tl.get("sfx", [])):
        p = os.path.join(tmp, f"s{i:03d}_{s['type']}.wav")
        run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", SFX[s["type"]],
             "-af", f"volume={s.get('gain_db', 0)}dB", "-ac", "2", p])
        at = s["at"] - (0.35 if s["type"] == "whoosh" else 1.9 if s["type"] == "riser" else 0)
        outs.append((p, max(0, at)))
    return outs


# ---------- graphics ----------
ASS_HEAD = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Title,Montserrat,82,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,-1,0,0,0,100,100,2,0,1,0,6,5,90,90,0,1
Style: Kicker,Montserrat,40,&H0027A2C9,&H0027A2C9,&H00000000,&H64000000,-1,0,0,0,100,100,6,0,1,0,4,5,90,90,0,1
Style: Sub,Poppins SemiBold,56,&H00FFFFFF,&H00FFFFFF,&H00101010,&H96000000,0,0,0,0,100,100,0,0,1,3.6,1.8,2,70,70,430,1
Style: Cap,Montserrat,46,&H00FFFFFF,&H00FFFFFF,&H60000000,&H78000000,-1,0,0,0,100,100,4,0,1,2.4,3,5,90,90,0,1
Style: LTName,Poppins SemiBold,54,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,7,0,0,0,1
Style: LTRole,Poppins Medium,36,&H0027A2C9,&H0027A2C9,&H00000000,&H00000000,0,0,0,0,100,100,1,0,1,0,0,7,0,0,0,1
Style: Box,Poppins Medium,10,&H383A1F0B,&H383A1F0B,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,7,0,0,0,1
Style: Gold,Poppins Medium,10,&H0027A2C9,&H0027A2C9,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,7,0,0,0,1
Style: Flash,Poppins Medium,10,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,7,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""


def rect(x, y, w, h):
    return f"m {x} {y} l {x+w} {y} l {x+w} {y+h} l {x} {y+h}"


def build_ass(tl, path):
    ev = []
    add = lambda layer, s, e, style, txt: ev.append(
        f"Dialogue: {layer},{ass_time(s)},{ass_time(e)},{style},,0,0,0,,{txt}")
    for t in tl.get("text", []):
        s, e, st = t["start"], t["end"], t["style"]
        if st == "title":
            # kicker (gold, small caps) + title, rise 40px + fade; gold rule expands
            y = t.get("y", 820)
            kick, *lines = t["lines"]
            add(5, s, e, "Kicker", f"{{\\fad(250,300)\\move(540,{y-60+40},540,{y-60},0,400)}}{kick}")
            for k, line in enumerate(lines):
                yy = y + 30 + k * 96
                add(5, s + 0.12 * (k + 1), e, "Title",
                    f"{{\\fad(300,300)\\move(540,{yy+40},540,{yy},0,450)}}{line}")
            ry = y + 30 + len(lines) * 96 - 20
            add(4, s + 0.3, e, "Gold",
                f"{{\\fad(0,300)\\pos(540,{ry})\\an5\\p1\\fscx0\\t(0,500,\\fscx100)}}{rect(0,0,360,6)}")
        elif st == "lower":
            # lower third: dark panel + gold bar, slide in from left
            name, role = t["lines"][0], t["lines"][1]
            x0, y0 = 70, t.get("y", 1300)
            mv = f"\\move({x0-60},{y0},{x0},{y0},0,330)"
            add(3, s, e, "Box", f"{{\\fad(200,250){mv}\\p1}}{rect(0,0,900,176)}")
            add(4, s, e, "Gold", f"{{\\fad(200,250){mv}\\p1}}{rect(0,0,10,176)}")
            add(5, s + 0.1, e, "LTName", f"{{\\fad(250,250)\\move({x0-30},{y0+20},{x0+38},{y0+20},0,380)}}{name}")
            add(5, s + 0.2, e, "LTRole", f"{{\\fad(250,250)\\move({x0-30},{y0+100},{x0+38},{y0+100},0,380)}}{role}")
        elif st == "caption":
            # short factual on-screen line, top third: white with soft shadow
            add(5, s, e, "Cap", f"{{\\fad(250,250)\\move(540,{t.get('y', 380)+24},540,{t.get('y', 380)},0,350)}}" + "\\N".join(t["lines"]))
        elif st == "end":
            y = 760
            add(3, s, e, "Box", f"{{\\fad(400,0)\\p1\\1a&H40&}}{rect(0,0,1080,1920)}")
            for k, line in enumerate(t["lines"]):
                style = "Kicker" if k == 0 else "Title"
                add(5, s + 0.15 * k, e, style,
                    f"{{\\fad(400,0)\\move(540,{y+k*100+30},540,{y+k*100},0,500)\\fs{60 if k else 40}}}{line}")
    for d in tl.get("dialog", []):
        for s, e, line in d.get("subs", []):
            add(6, d["at"] + s, d["at"] + e, "Sub", line)
    for f in tl.get("flash", []):
        add(9, f - 0.08, f + 0.22, "Flash", f"{{\\fad(80,220)\\p1}}{rect(0,0,1080,1920)}")
    with open(path, "w") as fh:
        fh.write(ASS_HEAD + "\n".join(ev) + "\n")


def build_srt(tl, path):
    rows = []
    for d in tl.get("dialog", []):
        for s, e, line in d.get("subs", []):
            rows.append((d["at"] + s, d["at"] + e, line.replace("\\N", "\n")))
    rows.sort()
    with open(path, "w") as f:
        for i, (s, e, line) in enumerate(rows, 1):
            f.write(f"{i}\n{srt_time(s)} --> {srt_time(e)}\n{line}\n\n")


def build_edl(tl, path, title):
    out = [f"TITLE: {title}", "FCM: NON-DROP FRAME", ""]
    n = 1
    for v in tl["video"]:
        si = frames(v["in"]); so = si + v["frames"]
        ri = v["rec_in"]; ro = ri + v["frames"]
        trk = "B" if v.get("amb_db") is not None else "V"
        out.append(f"{n:03d}  {'IMG_'+v['clip']:<8} {trk:<5} C        {tc(si)} {tc(so)} {tc(ri)} {tc(ro)}")
        out.append(f"* FROM CLIP NAME: IMG_{v['clip']}.MOV")
        if v.get("note"):
            out.append(f"* COMMENT: {v['note']}")
        out.append("")
        n += 1
    for d in tl.get("dialog", []):
        si = frames(d["in"]); so = frames(d["out"])
        ri = frames(d["at"]); ro = ri + (so - si)
        out.append(f"{n:03d}  {'IMG_'+d['clip']:<8} A2    C        {tc(si)} {tc(so)} {tc(ri)} {tc(ro)}")
        out.append(f"* FROM CLIP NAME: IMG_{d['clip']}.MOV")
        out.append("* COMMENT: DIALOG / SOUNDBITE")
        out.append("")
        n += 1
    with open(path, "w") as f:
        f.write("\r\n".join(out) + "\r\n")


def main():
    tlp, raw, outd, fonts = sys.argv[1:5]
    proxy = "--proxy" in sys.argv
    tl = json.load(open(tlp))
    os.makedirs(outd, exist_ok=True)
    tmp = os.path.join(outd, "tmp"); os.makedirs(tmp, exist_ok=True)
    total = layout(tl)
    T = total / FPS
    print(f"timeline {T:.2f}s, {len(tl['video'])} shots", flush=True)
    name = tl.get("name", "ROUGH_CUT")
    build_edl(tl, os.path.join(outd, f"{name}.edl"), name)
    build_srt(tl, os.path.join(outd, f"{name}.srt"))
    ass = os.path.join(outd, f"{name}_graphics.ass")
    build_ass(tl, ass)
    if "--docs-only" in sys.argv:
        return
    segs = render_segments(tl, raw, tmp)
    base = os.path.join(tmp, "base.mov")
    concat(segs, base)
    dlg = render_dialog(tl, raw, tmp)
    sfx = render_sfx(tl, tmp)
    # audio graph: ambient bed ducked under dialogue, + sfx, then loudnorm
    inputs = ["-i", base]
    for p, _ in dlg + sfx:
        inputs += ["-i", p]
    fc = []
    dl = []
    for k, (p, at) in enumerate(dlg, 1):
        ms = int(at * 1000)
        fc.append(f"[{k}:a]adelay={ms}|{ms},apad=whole_dur={T:.3f}[d{k}]")
        dl.append(f"[d{k}]")
    sl = []
    for j, (p, at) in enumerate(sfx, len(dlg) + 1):
        ms = int(at * 1000)
        fc.append(f"[{j}:a]adelay={ms}|{ms},apad=whole_dur={T:.3f}[s{j}]")
        sl.append(f"[s{j}]")
    if dl:
        fc.append(f"{''.join(dl)}amix=inputs={len(dl)}:normalize=0,asplit=2[dlg][key]")
        fc.append("[0:a][key]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[amb]")
        mix = ["[amb]", "[dlg]"] + sl
    else:
        mix = ["[0:a]"] + sl
    fc.append(f"{''.join(mix)}amix=inputs={len(mix)}:normalize=0,"
              f"loudnorm=I=-14:TP=-1.5:LRA=11,atrim=0:{T:.3f}[aout]")
    fontsdir = fonts.replace(":", "\\:")
    vf = f"ass={ass}:fontsdir={fontsdir}"
    final = os.path.join(outd, f"{name}_1080x1920.mp4")
    run(["ffmpeg", "-v", "error", "-y", *inputs,
         "-filter_complex", ";".join(fc) + f";[0:v]{vf}[vout]",
         "-map", "[vout]", "-map", "[aout]",
         "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-profile:v", "high",
         "-pix_fmt", "yuv420p", "-r", str(FPS), "-movflags", "+faststart",
         "-c:a", "aac", "-b:a", "320k", "-ar", "48000", final])
    print("final", final, flush=True)
    if proxy:
        px = os.path.join(outd, f"{name}_preview_720p.mp4")
        run(["ffmpeg", "-v", "error", "-y", "-i", final, "-vf", "scale=720:1280",
             "-c:v", "libx264", "-preset", "medium", "-crf", "25",
             "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", px])
        print("proxy", px, flush=True)


if __name__ == "__main__":
    main()
