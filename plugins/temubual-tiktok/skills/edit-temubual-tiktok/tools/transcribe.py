"""Full Malay transcript with word timestamps (faster-whisper large-v3).
Usage: python3 -I transcribe.py <audio16k.wav> large-v3 <out.json>  (prints segments)
Audio is read as a numpy array: some PyAV builds break faster-whisper's own decoder."""
import json, sys
from faster_whisper import WhisperModel
import wave, numpy as np
wf=wave.open(sys.argv[1]); audio=np.frombuffer(wf.readframes(wf.getnframes()),dtype=np.int16).astype(np.float32)/32768.0
m = WhisperModel(sys.argv[2], device="cpu", compute_type="int8", cpu_threads=4)
segs, info = m.transcribe(audio, language="ms", word_timestamps=True, vad_filter=False, beam_size=5,
    initial_prompt="Temu bual dalam Bahasa Melayu.")
out=[]
for s in segs:
    out.append({"start":round(s.start,2),"end":round(s.end,2),"text":s.text.strip(),
      "words":[{"w":w.word,"s":round(w.start,2),"e":round(w.end,2),"p":round(w.probability,2)} for w in s.words]})
    print(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text.strip()}", flush=True)
json.dump(out, open(sys.argv[3],"w"), ensure_ascii=False, indent=1)
