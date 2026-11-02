#!/usr/bin/env python3
"""Buat voice-over dari file teks dengan ElevenLabs.

Pakai:  python3 buat_voiceover.py naskah.txt hasil.mp3 [VOICE_ID]
Butuh variabel lingkungan ELEVENLABS_API_KEY.
"""
import os
import sys

from elevenlabs.client import ElevenLabs

DEFAULT_VOICE = "JBFqnCBsd6RMkjVDRZzb"  # "George" dari pustaka suara ElevenLabs
MODEL = "eleven_multilingual_v2"         # mendukung bahasa Indonesia


def main() -> None:
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    naskah, keluaran = sys.argv[1], sys.argv[2]
    voice_id = sys.argv[3] if len(sys.argv) > 3 else DEFAULT_VOICE

    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        sys.exit("ELEVENLABS_API_KEY belum diatur.")

    with open(naskah, encoding="utf-8") as f:
        teks = f.read().strip()

    client = ElevenLabs(api_key=api_key)
    audio = client.text_to_speech.convert(
        voice_id=voice_id,
        text=teks,
        model_id=MODEL,
        output_format="mp3_44100_128",
    )
    with open(keluaran, "wb") as f:
        for chunk in audio:
            f.write(chunk)
    print(f"Selesai: {keluaran}")


if __name__ == "__main__":
    main()
