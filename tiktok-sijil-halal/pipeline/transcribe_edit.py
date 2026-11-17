"""Transcribe the assembled edit (Whisper large-v3, Malay) for word-level caption timing.

Usage: python3 transcribe_edit.py <audio16k.wav> <edl.json> <out_words.json>
"""
import json, sys, wave, numpy as np
e=json.load(open(sys.argv[2])); wf=wave.open(sys.argv[1]); sr=wf.getframerate()
a=np.frombuffer(wf.readframes(wf.getnframes()),dtype=np.int16).astype(np.float32)/32768
out=np.concatenate([a[int(p["src_in"]*sr):int(p["src_in"]*sr)+int(round((p["out_out"]-p["out_in"])*sr))] for p in e.get("pieces_v1", e["pieces"])])
from faster_whisper import WhisperModel
m=WhisperModel("large-v3",device="cpu",compute_type="int8",cpu_threads=4)
segs,_=m.transcribe(out,language="ms",beam_size=5,word_timestamps=True)
W=[{"w":w.word.strip(),"s":round(w.start,2),"e":round(w.end,2),"p":round(w.probability,2)} for s in segs for w in s.words]
json.dump(W,open(sys.argv[3],"w"),ensure_ascii=False)
print(" ".join(f"{x['w']}@{x['s']}" for x in W))
