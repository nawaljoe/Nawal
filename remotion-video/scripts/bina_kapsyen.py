#!/usr/bin/env python3
"""Tukar transkrip ElevenLabs Scribe setiap klip kepada kapsyen Remotion.

Pakai:  python3 scripts/bina_kapsyen.py <folder_transkrip>
        (folder itu ada m1.json, m2.json, ... daripada voiceover/transkrip_scribe.py)
Hasil:  src/kuliah/captions.json, dalam masa filem (Caption[] @remotion/captions)

Kiraan kedudukan klip sama dengan src/kuliah/layout.ts.
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TIMELINE = os.path.join(ROOT, "src", "kuliah", "timeline.json")
OUT = os.path.join(ROOT, "src", "kuliah", "captions.json")


def place(timeline):
    fps, cursor, placed = timeline["fps"], 0, []
    for i, seg in enumerate(timeline["segments"]):
        overlap = 0 if i == 0 else seg.get("overlapIn", timeline["overlap"])
        start = 0 if i == 0 else cursor - round(overlap * fps)
        length = round((seg["to"] - seg["from"]) * fps)
        placed.append({**seg, "start": start, "length": length})
        cursor = start + length
    return placed


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    folder = sys.argv[1]
    timeline = json.load(open(TIMELINE, encoding="utf-8"))
    fps = timeline["fps"]

    captions = []
    for seg in place(timeline):
        # transkrip dinamakan ikut klip asal (m7.json), satu klip boleh dipotong jadi beberapa segmen
        if not seg.get("audio") or not seg["audio"].startswith("audio/"):
            continue
        clip = os.path.splitext(os.path.basename(seg["audio"]))[0]
        path = os.path.join(folder, f"{clip}.json")
        if not os.path.exists(path):
            continue
        offset = seg["start"] / fps - seg["from"]
        for w in json.load(open(path, encoding="utf-8"))["words"]:
            if w["start"] < seg["from"] or w["end"] > seg["to"]:
                continue
            captions.append(
                {
                    "text": " " + w["text"],
                    "startMs": round((w["start"] + offset) * 1000),
                    "endMs": round((w["end"] + offset) * 1000),
                    "timestampMs": round(((w["start"] + w["end"]) / 2 + offset) * 1000),
                    "confidence": None,
                }
            )

    captions.sort(key=lambda c: c["startMs"])
    if captions:
        captions[0]["text"] = captions[0]["text"].lstrip()
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(captions, f, ensure_ascii=False, indent=1)
    print(f"{len(captions)} perkataan -> {OUT}")


if __name__ == "__main__":
    main()
