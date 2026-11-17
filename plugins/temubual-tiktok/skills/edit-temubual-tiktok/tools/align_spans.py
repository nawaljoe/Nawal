"""Word timestamps for short source windows (to place cut points). Beware hallucinations on
very short windows ("Terima kasih kerana menonton!", "Sari kata oleh ...").
Usage: python3 -I align_spans.py <audio16k.wav> 54.9-60.4 ..."""
import sys, wave, numpy as np
from faster_whisper import WhisperModel
wf=wave.open(sys.argv[1]); sr=wf.getframerate(); a=np.frombuffer(wf.readframes(wf.getnframes()),dtype=np.int16).astype(np.float32)/32768
m=WhisperModel("large-v3",device="cpu",compute_type="int8",cpu_threads=4)
for span in sys.argv[2:]:
    s,e=map(float,span.split("-"))
    segs,_=m.transcribe(a[int(s*sr):int(e*sr)],language="ms",beam_size=5,word_timestamps=True,vad_filter=False)
    print(span,": "+" ".join(f"{w.word.strip()}[{s+w.start:.2f}-{s+w.end:.2f}]" for x in segs for w in x.words),flush=True)
