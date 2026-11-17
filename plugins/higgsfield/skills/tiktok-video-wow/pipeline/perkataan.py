import sys, wave
import numpy as np
from faster_whisper import WhisperModel
m = WhisperModel("medium", device="cpu", compute_type="int8")
w = wave.open(sys.argv[1]); audio = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
segs, info = m.transcribe(audio, language="ms", vad_filter=True, word_timestamps=True)
for s in segs:
    for wd in s.words:
        print(f"{wd.start:7.2f} {wd.end:7.2f} {wd.word.strip()}", flush=True)
