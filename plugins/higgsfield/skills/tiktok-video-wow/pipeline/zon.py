import sys, wave
import numpy as np
from faster_whisper import WhisperModel
w = wave.open(sys.argv[1]); sr = w.getframerate()
x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
m = WhisperModel("medium", device="cpu", compute_type="int8")
for r in sys.argv[2:]:
    a, b = map(float, r.split('-'))
    segs, _ = m.transcribe(x[int(a*sr):int(b*sr)], language="ms", word_timestamps=True, condition_on_previous_text=False)
    print(f"== {r}: " + " | ".join(f"{a+wd.start:.2f}-{a+wd.end:.2f} {wd.word.strip()}" for s in segs for wd in s.words))
