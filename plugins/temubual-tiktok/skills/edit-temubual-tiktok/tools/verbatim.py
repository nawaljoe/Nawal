"""Verbatim pass that KEEPS fillers (aaa/emm/err): suppress_tokens=[] + a filler-style prompt.
Usage: python3 -I verbatim.py <audio16k.wav> <out.json>"""
import sys, wave, json, numpy as np
from faster_whisper import WhisperModel
wf=wave.open(sys.argv[1]); sr=wf.getframerate(); a=np.frombuffer(wf.readframes(wf.getnframes()),dtype=np.int16).astype(np.float32)/32768
m=WhisperModel("large-v3",device="cpu",compute_type="int8",cpu_threads=4)
segs,_=m.transcribe(a,language="ms",beam_size=5,word_timestamps=True,suppress_tokens=[],vad_filter=False,
    initial_prompt="Umm, aaa, err... Baik, aaa, sijil halal ni, emm, boleh ditarik, aa, dengan sebab, err, beberapa perkara.")
W=[{"w":w.word.strip(),"s":round(w.start,2),"e":round(w.end,2),"p":round(w.probability,2)} for s in segs for w in s.words]
json.dump(W,open(sys.argv[2],"w"),ensure_ascii=False)
print(" ".join(f"{x['w']}@{x['s']}" for x in W))
