#!/usr/bin/env python3
"""Fit the recorded voice-over into the 60-second video and time the subtitles.

Steps
1. Clean the recording with ffmpeg (high-pass, light denoise, compression).
2. Find speech chunks from the loudness envelope.
3. Shorten long pauses (keeping a few dramatic ones), split into the 5 scenes.
4. Apply one uniform tempo (ffmpeg atempo, pitch preserved) so the last word
   lands at VO_END seconds.
5. Distribute the spoken words over the speech chunks and write
   src/timing.json (scene boundaries + word timings) and public/audio/vo.wav.

Usage: python3 scripts/prepare_vo.py [assets/voiceover-original.m4a]
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import tempfile

import numpy as np
from scipy.io import wavfile

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
SR = 48000
LEAD = 0.30      # silence before the first word
VO_END = 59.15   # the last word ("Berkat") ends here; video is 60.0 s
TOTAL = 60.0

# What was actually spoken in the recording, one entry per scene.
# This is the subtitle source of truth (spelling corrected from Whisper).
SCENES = [
    "Pernah tak korang perasan? Bila gaji masuk, kita cepat-cepat kira. "
    "Nak bayar kereta, bayar bil, nak shopping lagi, nak makan sedap. Semua kita dah rancang.",
    "Tapi, pelik juga kan... Kita boleh ingat setiap komitmen bulanan kita. "
    "Boleh ingat tarikh bayaran tu, tarikh bayaran ni. "
    "Tapi ada satu tanggungjawab yang kadang-kadang kita terlupa nak semak.",
    "Zakat. Kita selalu sebut rezeki tu datang daripada Allah. "
    "Kita bersyukur bila pendapatan bertambah, bila perniagaan semakin maju. "
    "Tapi, adakah kita turut ingat tanggungjawab kita terhadap harta tersebut?",
    "Jangan sampai kita terlalu sibuk mengira apa yang kita dapat, "
    "tapi terlupa apa yang wajib kita tunaikan. Bila cukup syarat, zakat itu wajib ditunaikan. "
    "Bukan tunggu ada lebihan, bukan tunggu kita rasa senang.",
    "Jom! Tunaikan zakat melalui MAINJ. "
    "Sama-sama kita bersihkan harta dan bantu mereka yang memerlukan. "
    "Barakah Zakat 2026. Kira. Bayar. Berkat.",
]

# Words drawn in gold in the subtitles (lower-cased, punctuation stripped).
HIGHLIGHT = {"gaji", "masuk", "komitmen", "tanggungjawab", "zakat", "wajib", "mainj",
             "rezeki", "amanah", "berkat", "barakah"}

BOUNDARY_HINTS = [16.0, 29.8, 46.5, 62.0]  # seconds in the original recording
PAUSE_MAX = 0.26         # ordinary pauses are shortened to this
SCENE_GAP = 0.45         # pause between scenes (after compression, before tempo)
KEEP_LONGER = {          # (scene, phrase-ending word) -> pause kept after it
    (2, "zakat."): 0.75,  # dramatic beat after the reveal
    (4, "jom!"): 0.30,
    (4, "memerlukan."): 0.45,
}


def run(cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def load(path):
    sr, x = wavfile.read(path)
    assert sr == SR
    return x.astype(np.float64) / 32768


def speech_chunks(x, thresh_db=-38.0, min_gap=0.22, min_len=0.08, pad=0.06):
    hop = 480  # 10 ms
    n = len(x) // hop
    rms = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1))
    db = 20 * np.log10(rms + 1e-9)
    on = db > thresh_db
    chunks, i = [], 0
    while i < n:
        if on[i]:
            j = i
            while j < n and on[j]:
                j += 1
            chunks.append([i * hop / SR, j * hop / SR])
            i = j
        else:
            i += 1
    merged = []
    for c in chunks:
        if merged and c[0] - merged[-1][1] < min_gap:
            merged[-1][1] = c[1]
        else:
            merged.append(c)
    merged = [c for c in merged if c[1] - c[0] >= min_len]
    return [[max(0, a - pad), min(len(x) / SR, b + pad)] for a, b in merged]


def words_of(text):
    return text.split()


def syllables(word):
    w = re.sub(r"[^a-z0-9]", "", word.lower())
    if w.isdigit():
        return 6  # "dua ribu dua puluh enam"
    return max(1, len(re.findall(r"[aeiou]+", w)))


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(PROJ, "assets", "voiceover-original.m4a")
    tmp = tempfile.mkdtemp()
    clean = os.path.join(tmp, "clean.wav")
    run(["ffmpeg", "-y", "-i", src, "-ac", "1", "-ar", str(SR), "-af",
         "highpass=f=85,afftdn=nr=10:nf=-48,"
         "acompressor=threshold=-24dB:ratio=3:attack=8:release=120:makeup=4,"
         "loudnorm=I=-16:TP=-1.5:LRA=7", clean])
    x = load(clean)

    raw_path = os.path.join(tmp, "raw.wav")
    run(["ffmpeg", "-y", "-i", src, "-ac", "1", "-ar", str(SR), raw_path])
    raw = load(raw_path)
    chunks = speech_chunks(raw)

    # Scene boundaries = the longest pause near each hint time. Hints are the
    # scene-ending words in the Whisper transcript of this recording
    # ("rancang.", "semak.", "tersebut?", "senang.").
    gaps = [(chunks[i + 1][0] - chunks[i][1], i, (chunks[i + 1][0] + chunks[i][1]) / 2)
            for i in range(len(chunks) - 1)]
    boundaries = []
    for hint in BOUNDARY_HINTS:
        near = [g for g in gaps if abs(g[2] - hint) < 1.6]
        boundaries.append(max(near)[1])
    scene_chunks = []
    start = 0
    for b in boundaries + [len(chunks) - 1]:
        scene_chunks.append(chunks[start : b + 1])
        start = b + 1

    # --- assign words to speech time (syllable-proportional), per scene
    timeline = []  # list of (orig_a, orig_b, new_a) pieces in compressed time
    words_out = []
    t_new = 0.0
    for si, (text, chs) in enumerate(zip(SCENES, scene_chunks)):
        ws = words_of(text)
        syl = np.array([syllables(w) for w in ws], dtype=float)
        # speech-time positions of each word
        speech_len = sum(b - a for a, b in chs)
        edges = np.concatenate([[0], np.cumsum(syl)]) / syl.sum() * speech_len

        # Snap phrase ends (words ending in punctuation) to the nearest pause in
        # the audio, then warp the other word edges linearly between anchors.
        chunk_ends = np.cumsum([b - a for a, b in chs])[:-1]
        anchors = {0: 0.0, len(ws): speech_len}
        used = set()
        for wi, w in enumerate(ws[:-1]):
            if not re.search(r"[.,?!]$", w) or len(chunk_ends) == 0:
                continue
            d = np.abs(chunk_ends - edges[wi + 1])
            j = int(np.argmin(d))
            prev = max(v for k, v in anchors.items() if k <= wi)
            if d[j] < 0.7 and j not in used and chunk_ends[j] > prev:
                anchors[wi + 1] = float(chunk_ends[j])
                used.add(j)
        ks = sorted(anchors)
        edges = np.interp(edges, [edges[k] for k in ks], [anchors[k] for k in ks])

        # compressed layout of this scene's chunks
        if si > 0:
            t_new += SCENE_GAP
        scene_start_new = t_new
        sp_acc = 0.0
        chunk_new_starts = []
        for ci, (a, b) in enumerate(chs):
            chunk_new_starts.append((sp_acc, t_new))
            timeline.append((a, b, t_new))
            t_new += b - a
            sp_acc += b - a
            if ci < len(chs) - 1:
                gap = chs[ci + 1][0] - b
                # which word ends here?
                end_word_idx = int(np.searchsorted(edges, sp_acc - 1e-3)) - 1
                keep = PAUSE_MAX
                wkey = ws[min(max(end_word_idx, 0), len(ws) - 1)].lower()
                for (s, w), v in KEEP_LONGER.items():
                    if s == si and wkey == w:
                        keep = v
                t_new += min(gap, keep)

        def sp_to_new(sp):
            for (s0, n0), (a, b) in zip(chunk_new_starts, chs):
                if sp <= s0 + (b - a) + 1e-6:
                    return n0 + (sp - s0)
            s0, n0 = chunk_new_starts[-1]
            return n0 + (sp - s0)

        for wi, w in enumerate(ws):
            a = sp_to_new(edges[wi] + 1e-4)
            b = sp_to_new(edges[wi + 1] - 1e-4)
            key = re.sub(r"[^a-z0-9]", "", w.lower())
            words_out.append({"scene": si, "text": w, "start": a, "end": b,
                              "hl": key in HIGHLIGHT})
        words_out[-1]["sceneEndNew"] = t_new
        words_out[[i for i, w in enumerate(words_out) if w["scene"] == si][0]]["sceneStartNew"] = scene_start_new

    compressed_len = t_new
    tempo = compressed_len / (VO_END - LEAD)
    print(f"speech chunks: {len(chunks)}, compressed VO {compressed_len:.2f}s, tempo x{tempo:.3f}")

    # --- render the compressed VO, then time-stretch it
    comp = np.zeros(int((compressed_len + 0.5) * SR))
    fade = int(0.012 * SR)
    for a, b, n0 in timeline:
        seg = x[int(a * SR) : int(b * SR)].copy()
        if len(seg) > 2 * fade:
            seg[:fade] *= np.linspace(0, 1, fade)
            seg[-fade:] *= np.linspace(1, 0, fade)
        s = int(n0 * SR)
        comp[s : s + len(seg)] += seg
    comp_path = os.path.join(tmp, "comp.wav")
    wavfile.write(comp_path, SR, (np.clip(comp, -1, 1) * 32767).astype(np.int16))
    stretched = os.path.join(tmp, "stretched.wav")
    run(["ffmpeg", "-y", "-i", comp_path, "-af", f"atempo={tempo:.5f}", "-ar", str(SR), stretched])
    y = load(stretched)
    out = np.zeros(int(TOTAL * SR))
    s = int(LEAD * SR)
    n = min(len(y), len(out) - s)
    out[s : s + n] = y[:n]
    os.makedirs(os.path.join(PROJ, "public", "audio"), exist_ok=True)
    wavfile.write(os.path.join(PROJ, "public", "audio", "vo.wav"), SR, (np.clip(out, -1, 1) * 32767).astype(np.int16))

    def m(t):
        return round(LEAD + t / tempo, 3)

    # scene boundaries: halfway through the inter-scene gap
    starts = [0.0]
    ends = []
    for si in range(5):
        sw = [w for w in words_out if w["scene"] == si]
        first, last = m(sw[0]["start"]), m(sw[-1]["end"])
        ends.append(last)
        if si > 0:
            starts.append(round((ends[si - 1] + first) / 2, 3))
    scenes = []
    for si in range(5):
        st = starts[si]
        en = starts[si + 1] if si < 4 else TOTAL
        scenes.append({"index": si + 1, "start": st, "end": en,
                       "startFrame": round(st * 30), "endFrame": round(en * 30)})
    words = [{"text": w["text"], "start": m(w["start"]), "end": m(w["end"]),
              "scene": w["scene"] + 1, "hl": w["hl"]} for w in words_out]
    with open(os.path.join(PROJ, "src", "timing.json"), "w") as f:
        json.dump({"tempo": round(tempo, 4), "scenes": scenes, "words": words}, f, indent=1, ensure_ascii=False)
    for sc in scenes:
        print(f"scene {sc['index']}: {sc['start']:6.2f} - {sc['end']:6.2f}")


if __name__ == "__main__":
    main()
