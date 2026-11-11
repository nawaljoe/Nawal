#!/usr/bin/env python3
"""Inject timeline.json + per-shot thumbnails into the blueprint template.

Usage: python3 build_page.py timeline.json THUMBS_DIR OUT.html
"""
import base64, json, os, sys

here = os.path.dirname(os.path.abspath(__file__))
tl = json.load(open(sys.argv[1]))
thumbs = {}
for v in tl["video"]:
    p = os.path.join(sys.argv[2], v["label"] + ".jpg")
    thumbs[v["label"]] = "data:image/jpeg;base64," + base64.b64encode(open(p, "rb").read()).decode()
data = {k: tl[k] for k in ("video", "dialog", "text", "sfx", "flash", "duration")}
data["thumbs"] = thumbs
blob = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
html = open(os.path.join(here, "template.html")).read().replace("__DATA__", blob)
open(sys.argv[3], "w").write(html)
print(sys.argv[3], len(html) // 1024, "KB")
