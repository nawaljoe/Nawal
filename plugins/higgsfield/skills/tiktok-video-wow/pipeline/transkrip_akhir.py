import subprocess, sys
import numpy as np
from faster_whisper import WhisperModel
m = WhisperModel("medium", device="cpu", compute_type="int8")
for f in sys.argv[1:]:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
    segs, _ = m.transcribe(np.frombuffer(raw, np.int16).astype(np.float32) / 32768, language="ms", vad_filter=True)
    print("==", f.split("/")[-1])
    for s in segs:
        print(f"[{s.start:5.1f}] {s.text.strip()}", flush=True)
