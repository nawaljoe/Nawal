import wave, numpy as np, collections, sys
from faster_whisper import WhisperModel
def load(p):
    w=wave.open(p); return np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768
A={'orig':load('main/a16.wav'),'enh':load('main/a16_enh.wav')}
R=[(62.2,65.3),(135.3,142.4),(37.0,42.4),(28.9,36.4)]
for mname,ct in [('/home/user/work/models/ms-turbo','float32'),('large-v3','int8')]:
    m=WhisperModel(mname,device="cpu",compute_type=ct,cpu_threads=4)
    for t0,t1 in R:
        votes=collections.Counter()
        for an,a in A.items():
            seg=a[int(t0*16000):int(t1*16000)]
            for temp,bs in [(0.0,8),(0.4,1),(0.4,1),(0.7,1)]:
                segs,_=m.transcribe(seg,language="ms",beam_size=bs,temperature=temp,condition_on_previous_text=False)
                votes[' '.join(s.text.strip() for s in segs)]+=1
        print(f"\n## {mname[-8:]} {t0}-{t1}",flush=True)
        for k,v in votes.most_common(8): print(f"  {v}x {k}",flush=True)
    del m
