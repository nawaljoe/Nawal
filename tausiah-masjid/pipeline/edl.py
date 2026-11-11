"""Turn edl.json into ffmpeg filter fragments for video (frames) and audio (seconds)."""
import json, sys, os
E = json.load(open(os.path.join(os.path.dirname(__file__), "edl.json")))
fps, segs = E["fps"], E["segments"]
mode = sys.argv[1]
if mode == "video":
    parts = [f"[v]split={len(segs)}" + "".join(f"[v{i}]" for i in range(len(segs)))]
    for i, s in enumerate(segs):
        parts.append(f"[v{i}]trim=start_frame={s['in']}:end_frame={s['out']},setpts=PTS-STARTPTS[c{i}]")
    parts.append("".join(f"[c{i}]" for i in range(len(segs))) + f"concat=n={len(segs)}:v=1:a=0[vc]")
    print(";".join(parts))
elif mode == "audio":
    fade = 0.012  # 12 ms edge ramps: cuts land in pauses, ramps just prevent clicks
    parts = [f"[a]asplit={len(segs)}" + "".join(f"[a{i}]" for i in range(len(segs)))]
    for i, s in enumerate(segs):
        a, b = s["in"] / fps, s["out"] / fps
        parts.append(f"[a{i}]atrim=start={a:.6f}:end={b:.6f},asetpts=PTS-STARTPTS,"
                     f"afade=t=in:d={fade},afade=t=out:st={b-a-fade:.6f}:d={fade}[b{i}]")
    parts.append("".join(f"[b{i}]" for i in range(len(segs))) + f"concat=n={len(segs)}:v=0:a=1[ac]")
    print(";".join(parts))
elif mode == "tail":
    print(E["tail_hold_s"])
