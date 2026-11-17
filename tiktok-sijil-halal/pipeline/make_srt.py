"""Export the on-screen captions as SRT.  Usage: python3 make_srt.py <timeline.json> <out.srt>"""
import json, sys
tl = json.load(open(sys.argv[1]))
ts = lambda t: f"{int(t // 3600):02}:{int(t % 3600 // 60):02}:{int(t % 60):02},{int(round(t % 1 * 1000)) % 1000:03}"
with open(sys.argv[2], "w") as f:
    for i, c in enumerate(tl["captions"], 1):
        text = " ".join(w["t"] for w in c["words"])
        f.write(f"{i}\n{ts(c['s'])} --> {ts(c['e'])}\n{'[Soalan] ' if c['style'] == 'q' else ''}{text}\n\n")
