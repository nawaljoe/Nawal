#!/usr/bin/env python3
"""Transkrip audio/video dengan ElevenLabs Scribe (cap masa setiap perkataan).

Pakai:  python3 transkrip_scribe.py <fail_audio_atau_video> [fail_keluaran.json]
Hasil:  JSON {"text": ..., "words": [{"text", "start", "end"}, ...]} (saat)
Butuh variabel lingkungan ELEVENLABS_API_KEY.
"""
import json
import os
import sys

from elevenlabs.client import ElevenLabs

MODEL = "scribe_v1"


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    masukan = sys.argv[1]
    keluaran = sys.argv[2] if len(sys.argv) > 2 else os.path.splitext(masukan)[0] + ".json"

    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        sys.exit("ELEVENLABS_API_KEY belum diatur.")

    client = ElevenLabs(api_key=api_key)
    with open(masukan, "rb") as f:
        hasil = client.speech_to_text.convert(
            model_id=MODEL,
            file=f,
            language_code="msa",  # Bahasa Melayu
            timestamps_granularity="word",
            tag_audio_events=False,
            diarize=False,
        )

    words = [
        {"text": w.text.strip(), "start": round(w.start, 3), "end": round(w.end, 3)}
        for w in hasil.words
        if w.type == "word" and w.text.strip()
    ]
    with open(keluaran, "w", encoding="utf-8") as f:
        json.dump({"text": hasil.text, "words": words}, f, ensure_ascii=False, indent=1)
    print(f"Selesai: {keluaran}")
    print(hasil.text)


if __name__ == "__main__":
    main()
