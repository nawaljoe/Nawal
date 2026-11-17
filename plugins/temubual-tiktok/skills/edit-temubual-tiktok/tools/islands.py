"""Classify speech islands: isolated Whisper text + voiced ratio + pitch steadiness.
A filler is voiced >=80% with pitch sd <= ~5 Hz and text like err/emm/aa (or a hallucination).
Usage: python3 -I islands.py <audio16k.wav> 12.30-12.80 40.10-40.70 ..."""
import sys, wave, numpy as np
from faster_whisper import WhisperModel
wf=wave.open(sys.argv[1]); sr=wf.getframerate(); a=np.frombuffer(wf.readframes(wf.getnframes()),dtype=np.int16).astype(np.float32)/32768
m=WhisperModel("large-v3",device="cpu",compute_type="int8",cpu_threads=4)
def pitch_track(x):
    out=[]
    for i in range(0,len(x)-640,160):
        f=x[i:i+640]*np.hanning(640); ac=np.correlate(f,f,"full")[639:]
        lo,hi=int(sr/350),int(sr/70); k=lo+np.argmax(ac[lo:hi])
        if ac[0]>0 and ac[k]/ac[0]>0.45: out.append(sr/k)
    return np.array(out)
for span in sys.argv[2:]:
    s,e=map(float,span.split("-")); x=a[int(s*sr):int(e*sr)]
    p=pitch_track(x); voiced=len(p)/max(1,(len(x)-640)//160)
    segs,_=m.transcribe(x,language="ms",beam_size=5,suppress_tokens=[],initial_prompt="aaa, emm, err,")
    txt=" ".join(z.text.strip() for z in segs)
    print(f"{span}: '{txt}' | voiced {voiced:.0%} | pitch {np.median(p) if len(p) else 0:.0f}Hz sd {np.std(p) if len(p) else 0:.0f}",flush=True)
