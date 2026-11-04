#!/usr/bin/env python3
"""Jernihkan suara (buang bunyi kipas, gema, bising latar) dengan ElevenLabs Voice Isolator.

Pakai:  python3 jernihkan_suara.py <fail_audio_atau_video> <keluaran.mp3>
Butuh variabel lingkungan ELEVENLABS_API_KEY.
"""
import os
import sys

from elevenlabs.client import ElevenLabs


def main() -> None:
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    masukan, keluaran = sys.argv[1], sys.argv[2]

    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        sys.exit("ELEVENLABS_API_KEY belum diatur.")

    client = ElevenLabs(api_key=api_key)
    with open(masukan, "rb") as f:
        audio = client.audio_isolation.convert(audio=f)
        with open(keluaran, "wb") as out:
            for chunk in audio:
                out.write(chunk)
    print(f"Selesai: {keluaran}")


if __name__ == "__main__":
    main()
