"""Generate the HyperFrames compositions from the verified transcript, the EDL and the camera plan.

Writes: index.html (root: plate, voice, scene hosts, camera moves), compositions/captions.html,
compositions/ayah.html, and subtitles_ms.srt. Re-run after editing transcript_ms.json or camera.py.
"""
import html, json, os, re

D = os.path.dirname(os.path.abspath(__file__))
P = os.path.dirname(D)
E = json.load(open(f"{D}/edl.json"))
T = json.load(open(f"{D}/transcript_ms.json"))
CAM = json.load(open(f"{D}/camera.json"))
FPS, SEGS = E["fps"], E["segments"]
starts = [0.0]
for s in SEGS:
    starts.append(starts[-1] + (s["out"] - s["in"]) / FPS)
SPEECH_END = starts[-1]
DUR = round(SPEECH_END + E["tail_hold_s"], 3)


def out_t(src):
    """Source seconds -> output seconds (clamped into the kept segment that contains it)."""
    for k, s in enumerate(SEGS):
        a, b = s["in"] / FPS, s["out"] / FPS
        if a - 0.25 <= src <= b + 0.25:
            return round(starts[k] + min(max(src, a), b) - a, 3)
    raise ValueError(f"{src}s is not inside a kept segment")


def words_html(text):
    """'*gold words*' -> spans. Plain words stay white."""
    out = []
    for i, part in enumerate(re.split(r"\*([^*]+)\*", text)):
        if not part:
            continue
        esc = html.escape(part)
        out.append(f'<span class="gold">{esc}</span>' if i % 2 else esc)
    return "".join(out)


FONTS = """
    @font-face { font-family: "Plus Jakarta Sans"; src: url("assets/fonts/PlusJakartaSans.ttf") format("truetype"); font-weight: 200 800; }
    @font-face { font-family: "Amiri"; src: url("assets/fonts/Amiri-Regular.ttf") format("truetype"); font-weight: 400; }
    @font-face { font-family: "Amiri"; src: url("assets/fonts/Amiri-Bold.ttf") format("truetype"); font-weight: 700; }"""

STAR = ('<svg class="star" viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="4">'
        '<rect x="22" y="22" width="56" height="56"/><rect x="22" y="22" width="56" height="56" transform="rotate(45 50 50)"/>'
        '</g><circle cx="50" cy="50" r="7" fill="currentColor"/></svg>')

# ---------------------------------------------------------------- captions
groups = T["groups"]
caps, tl, srt = [], [], []
for i, g in enumerate(groups):
    s, e = out_t(g["s"]), out_t(g["e"])
    start = max(0.0, s - 0.06)
    nxt = out_t(groups[i + 1]["s"]) - 0.06 if i + 1 < len(groups) else DUR
    end = min(e + 0.30, nxt - 0.02)          # one group on screen at a time
    dur = round(end - start, 3)
    cid = f"cap-{i + 1:02d}"
    caps.append(f'      <div id="{cid}" class="cap clip" data-start="{start:.3f}" data-duration="{dur:.3f}" data-track-index="1">'
                f'<p class="box">{words_html(g["t"])}</p></div>')
    tl.append(f'      tl.fromTo("#{cid} .box", {{ opacity: 0, y: 14 }}, {{ opacity: 1, y: 0, duration: 0.24, ease: "power2.out" }}, {start:.3f});')
    tl.append(f'      tl.to("#{cid} .box", {{ opacity: 0, duration: 0.14, ease: "power2.in" }}, {end - 0.15:.3f});')
    tl.append(f'      tl.set("#{cid} .box", {{ opacity: 0 }}, {end:.3f});')
    ts = lambda x: f"{int(x // 3600):02d}:{int(x % 3600 // 60):02d}:{int(x % 60):02d},{int(round(x % 1 * 1000)) % 1000:03d}"
    srt.append(f"{len(srt) + 1}\n{ts(start)} --> {ts(end)}\n{g['t'].replace('*', '')}\n")

ay = T["ayah"]
AY_START = out_t(ay["lines"][0]["s"]) - 0.30
AY_END = CAM[[c["t0"] for c in CAM].index(57.05)]["t0"] - 0.03   # leave before the medium shot brings the head up
for ln in ay["lines"]:
    a = out_t(ln["s"])
    srt.append(f"{len(srt) + 1}\n{ts(a)} --> {ts(min(a + 3.2, AY_END))}\n{ln['t']}\n")
srt.sort(key=lambda b: b.split("\n")[1])
srt = [re.sub(r"^\d+", str(i + 1), b) for i, b in enumerate(srt)]

open(f"{P}/compositions/captions.html", "w").write(f"""<template>
  <style>{FONTS}
    #root {{ position: absolute; inset: 0; pointer-events: none; }}
    /* soft floor shade so white type never fights the congregation's white kopiah */
    #cap-floor {{ position: absolute; left: 0; right: 0; bottom: 0; height: 980px;
      background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.22) 45%, rgba(0,0,0,0.34) 100%); }}
    .cap {{ position: absolute; inset: 0; display: flex; align-items: flex-end; justify-content: center;
      padding: 0 70px 600px; overflow: visible; }}
    .box {{ margin: 0; display: inline-block; max-width: 900px; padding: 14px 28px 16px; border-radius: 16px;
      background: rgba(12, 12, 10, 0.46); color: #ffffff; text-align: center; text-wrap: balance;
      font-family: "Plus Jakarta Sans", sans-serif; font-weight: 700; font-size: 56px; line-height: 1.22;
      letter-spacing: -0.005em; text-shadow: 0 2px 10px rgba(0,0,0,0.45); opacity: 0; }}
    .gold {{ color: #EBCB86; }}
  </style>
  <div id="root" data-composition-id="captions" data-width="1080" data-height="1920">
    <div id="cap-floor"></div>
{chr(10).join(caps)}
  </div>
  <script>
    (function () {{
      const tl = gsap.timeline({{ paused: true }});
{chr(10).join(tl)}
      window.__timelines["captions"] = tl;
    }})();
  </script>
</template>
""")

# ---------------------------------------------------------------- ayah card
lines_html, ltl = [], []
lt = [round(out_t(l["s"]) - AY_START, 3) for l in ay["lines"]]
for i, ln in enumerate(ay["lines"]):
    lines_html.append(f'        <p id="ayah-l{i + 1}" class="line" lang="ar" dir="rtl">{html.escape(ln["t"])}</p>')
    ltl.append(f'      tl.fromTo("#ayah-l{i + 1}", {{ opacity: 0.24, color: "rgba(255, 249, 236, 0.9)", filter: "blur(3px)" }}, {{ opacity: 1, color: "#EBCB86", filter: "blur(0px)", duration: 0.6, ease: "power2.out" }}, {lt[i]:.3f});')
    if i:  # the line just recited settles from gold to warm white
        ltl.append(f'      tl.to("#ayah-l{i}", {{ color: "rgba(255, 249, 236, 0.86)", duration: 0.6, ease: "power1.inOut" }}, {lt[i]:.3f});')
recit_end = round(out_t(ay["end"]) - AY_START, 3)
ay_dur = round(AY_END - AY_START, 3)
open(f"{P}/compositions/ayah.html", "w").write(f"""<template>
  <style>{FONTS}
    #root {{ position: absolute; inset: 0; pointer-events: none; }}
    #ayah-card {{ position: absolute; left: 60px; right: 60px; top: 186px; padding: 24px 40px 26px;
      border-radius: 24px; border: 1.5px solid rgba(217, 182, 110, 0.55);
      background: linear-gradient(180deg, rgba(14, 15, 12, 0.66), rgba(14, 15, 12, 0.54)); opacity: 0; }}
    #ayah-head {{ display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 8px;
      color: #D9B66E; font-family: "Plus Jakarta Sans", sans-serif; font-weight: 600; font-size: 28px;
      letter-spacing: 0.12em; text-transform: uppercase; }}
    #ayah-head .star {{ width: 26px; height: 26px; }}
    .line {{ margin: 0; text-align: center; font-family: "Amiri", serif; font-weight: 700; font-size: 42px;
      line-height: 1.6; color: rgba(255, 249, 236, 0.9); opacity: 0.24; }}
  </style>
  <div id="root" data-composition-id="ayah" data-width="1080" data-height="1920">
    <div id="ayah-panel" class="clip" data-start="0" data-duration="{ay_dur}" data-track-index="1">
      <div id="ayah-card">
        <div id="ayah-head">{STAR}<span>{html.escape(ay["ref"])}</span>{STAR}</div>
{chr(10).join(lines_html)}
      </div>
    </div>
  </div>
  <script>
    (function () {{
      const tl = gsap.timeline({{ paused: true }});
      tl.fromTo("#ayah-card", {{ opacity: 0, y: -12 }}, {{ opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }}, 0);
{chr(10).join(ltl)}
      tl.to("#ayah-l{len(lt)}", {{ color: "rgba(255, 249, 236, 0.86)", duration: 0.6, ease: "power1.inOut" }}, {recit_end:.3f});
      tl.to("#ayah-card", {{ opacity: 0, duration: 0.42, ease: "power2.in" }}, {ay_dur - 0.45:.3f});
      window.__timelines["ayah"] = tl;
    }})();
  </script>
</template>
""")

# ---------------------------------------------------------------- root + camera
cam = ['      gsap.set("#cam", { transformOrigin: "0 0" });']
for c in CAM:
    d = round(c["t1"] - c["t0"], 3)
    cam.append(f'      tl.set("#cam", {{ x: {c["x0"]}, y: {c["y0"]}, scale: {c["z0"]} }}, {c["t0"]});')
    cam.append(f'      tl.to("#cam", {{ x: {c["x1"]}, y: {c["y1"]}, scale: {c["z1"]}, duration: {d}, ease: "sine.inOut" }}, {c["t0"]});')
END_START = round(SPEECH_END - 0.3, 3)
open(f"{P}/index.html", "w").write(f"""<!doctype html>
<html lang="ms">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Tazkirah: Langkah ke Masjid</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ width: 1080px; height: 1920px; overflow: hidden; background: #000; }}
      #root {{ position: relative; width: 1080px; height: 1920px; overflow: hidden; background: #000; }}
      /* virtual camera: GSAP moves this untimed wrapper, never the timed video */
      #cam {{ position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; z-index: 0; }}
      #plate {{ position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; object-fit: cover; }}
      #opening {{ z-index: 2; }} #ayah {{ z-index: 2; }} #captions {{ z-index: 3; }} #ending {{ z-index: 5; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{DUR}" data-width="1080" data-height="1920" data-fps="30">
      <div id="cam">
        <video id="plate" class="clip" src="assets/plate.mp4" data-start="0" data-duration="{DUR}" data-track-index="0" muted playsinline></video>
      </div>
      <audio id="voice" class="clip" src="assets/voice_master.wav" data-start="0" data-duration="{DUR}" data-track-index="6" data-volume="1"></audio>
      <div id="opening" data-composition-id="opening" data-composition-src="compositions/opening.html"
        data-start="0" data-duration="5.6" data-track-index="2" data-track-kind="graphics" data-width="1080" data-height="1920"></div>
      <div id="ayah" data-composition-id="ayah" data-composition-src="compositions/ayah.html"
        data-start="{AY_START:.3f}" data-duration="{ay_dur}" data-track-index="3" data-track-kind="graphics" data-width="1080" data-height="1920"></div>
      <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html"
        data-start="0" data-duration="{DUR}" data-track-index="4" data-track-kind="captions" data-width="1080" data-height="1920"></div>
      <div id="ending" data-composition-id="ending" data-composition-src="compositions/ending.html"
        data-start="{END_START}" data-duration="{round(DUR - END_START, 3)}" data-track-index="5" data-track-kind="graphics" data-width="1080" data-height="1920"></div>
    </div>
    <script>
      const tl = gsap.timeline({{ paused: true }});
{chr(10).join(cam)}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
""")
open(f"{P}/subtitles_ms.srt", "w").write("\n".join(srt))
print(f"duration {DUR}s, {len(groups)} caption groups, ayah {AY_START:.3f}+{ay_dur}s, ending at {END_START}")
